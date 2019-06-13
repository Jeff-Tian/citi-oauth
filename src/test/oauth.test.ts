import assert = require('assert')
import CitiOAuth, { AccessToken } from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as TypeMoq from 'typemoq'

describe('smoke', () => {
  it('works', () => {
    assert(true)
  })
})

describe('citi oauth', () => {
  const config = {
    appid: 'appid',
    appsecret: 'appsecret',
  }

  const auth = new CitiOAuth(config.appid, config.appsecret, 'http://diveintonode.org/')

  describe('getAuthorizeURL', () => {
    it('should ok', () => {
      assert.throws(() => auth.getAuthorizeURL(), /state/)
    })

    it('should ok with state', () => {
      const url = auth.getAuthorizeURL('hehe')
      assert(
        url ===
          `https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/authorize?response_type=code&client_id=${
            config.appid
          }&scope=pay_with_points&countryCode=SG&businessCode=GCB&locale=en_US&state=${'hehe'}&redirect_uri=${encodeURIComponent(
            'http://diveintonode.org/',
          )}`,
      )
    })

    it('should ok with state and scope', () => {
      const url = auth.getAuthorizeURL('hehe', 'pay_with_points')
      assert(
        url ===
          `https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/authorize?response_type=code&client_id=${
            config.appid
          }&scope=${'pay_with_points'}&countryCode=SG&businessCode=GCB&locale=en_US&state=${'hehe'}&redirect_uri=${encodeURIComponent(
            'http://diveintonode.org/',
          )}`,
      )
    })
  })

  describe('getAccessToken', () => {
    const api = new CitiOAuth('config.appid', config.appsecret, 'https://uniheart.herokuapp.com/passport/citi/callback')

    it('should error', async () => {
      try {
        await api.getAccessToken('code')
      } catch (error) {
        assert(error.name === 'CitiAPIError')
        assert(error.message.startsWith('Request failed with status code 500'))
      }
    })

    describe('should ok', () => {
      let mock: MockAdapter

      before(() => {
        mock = new MockAdapter(axios)
        mock.onPost(/.+/).replyOnce(200, {
          access_token:
            'AAEkYzFjMDQ0Y2UtNTBmMy00NmY4LWI4YjEtYmQ5ODJkMWZiNGZh3xGP85xjqyxoHR7pXxzQJf223kWPL-HyWHD4zrRCvHZUkeBkTgxppbmpFtmWeVmjzDOxs1wFzI4s45YDS15eYmyuxzLbVog4d8H9pYSelrvL6naDYOLL9U16EaY0iyAMPBGX1H7RhCqtmd-7u_Eanw7QshbruLaZh2stOrdq2thC5CCSwW2r0e8PM1QbWubJOcMp8UGv-zNc0I3cTSihymSCF44HJ_yeuPAcXJ7kj-iPzQqxaO6FiWPmIsIh2YSxdGYo8alTyjJfG5AQDnM0HA',
          refresh_token:
            'AAGsyASCzlBplxGvA-5CFCkLhNinu6-0HQt-y7PuzsRLVAHok6yYs6KS2Np4t7bL0R8FMeT62wYXFxxY6F7LU_cc00QTXPfoQFFtay2tu3eGpBAGDg07ll_vNk_AEJo9l1GaEKYev7Q7drDOeRCDRqcD12zJzk36PsQEM6j1txFV2jR3snW5PLs3HVjxNRjUHWLR5IoI2qfb8zCZNahrFCRQ7T7ZVB_-E6Qk22tN3hZkZH7_kB3bZjtVoNxyjJ6qBDcrYdgtAvPvBV-xXDBmfUXD44JBYiZffHjEr2dFb_e3yA',
          scope: '/dda/customer /dda/accountlist /dda/account /dda/accountsdetails /dda/account/transactions',
          token_type: 'bearer',
          expires_in: 1800,
        })
      })

      after(() => {
        mock.restore()
      })

      it('should ok', async () => {
        const result = await api.getAccessToken('code')

        const keys = ['access_token', 'expires_in', 'refresh_token', 'scope']

        keys.map(k => assert(Object.keys(result).includes(k)))
      })
    })

    describe('should not ok', () => {
      let mock: MockAdapter
      before(() => {
        mock = new MockAdapter(axios)
        mock.onPost(/.+/).replyOnce(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve([
                200,
                {
                  access_token: 'ACCESS_TOKEN',
                  expires_in: 0.1,
                  refresh_token: 'REFRESH_TOKEN',
                  scope: 'SCOPE',
                },
              ])
            }, 100)
          })
        })
      })

      after(() => {
        mock.restore()
      })

      it('should not ok', async () => {
        const token = await api.getAccessToken('code')

        assert(token.isValid() === false)
      })
    })
  })

  describe('refreshAccessToken', () => {
    const api = new CitiOAuth('appid', 'secret', 'https://uniheart.herokuapp.com/passport/citi/callback')

    it('should invalid', async () => {
      try {
        const result = await api.refreshAccessToken('refresh_token')
        assert(result === undefined)
      } catch (ex) {
        assert(ex.name === 'CitiAPIError')
        assert(ex.message.startsWith('Request failed with status code'))
      }
    })

    describe('should ok', () => {
      let mock: MockAdapter
      before(() => {
        mock = new MockAdapter(axios)
        mock.onPost(/.+/).replyOnce(200, {
          access_token:
            'AAEkYzFjMDQ0Y2UtNTBmMy00NmY4LWI4YjEtYmQ5ODJkMWZiNGZh3xGP85xjqyxoHR7pXxzQJf223kWPL-HyWHD4zrRCvHZUkeBkTgxppbmpFtmWeVmjzDOxs1wFzI4s45YDS15eYmyuxzLbVog4d8H9pYSelrvL6naDYOLL9U16EaY0iyAMPBGX1H7RhCqtmd-7u_Eanw7QshbruLaZh2stOrdq2thC5CCSwW2r0e8PM1QbWubJOcMp8UGv-zNc0I3cTSihymSCF44HJ_yeuPAcXJ7kj-iPzQqxaO6FiWPmIsIh2YSxdGYo8alTyjJfG5AQDnM0HA',
          refresh_token:
            'AAGsyASCzlBplxGvA-5CFCkLhNinu6-0HQt-y7PuzsRLVAHok6yYs6KS2Np4t7bL0R8FMeT62wYXFxxY6F7LU_cc00QTXPfoQFFtay2tu3eGpBAGDg07ll_vNk_AEJo9l1GaEKYev7Q7drDOeRCDRqcD12zJzk36PsQEM6j1txFV2jR3snW5PLs3HVjxNRjUHWLR5IoI2qfb8zCZNahrFCRQ7T7ZVB_-E6Qk22tN3hZkZH7_kB3bZjtVoNxyjJ6qBDcrYdgtAvPvBV-xXDBmfUXD44JBYiZffHjEr2dFb_e3yA',
          scope: '/dda/customer /dda/accountlist /dda/account /dda/accountsdetails /dda/account/transactions',
          token_type: 'bearer',
          expires_in: 1800,
        })
      })
      after(() => {
        mock.restore()
      })

      it('should ok', async () => {
        const result = await api.refreshAccessToken('refresh_token')

        const keys = ['access_token', 'expires_in', 'refresh_token', 'scope']

        keys.map(k => assert(Object.keys(result).includes(k)))
      })
    })
  })

  describe('getUser', () => {
    it('should invalid', async () => {
      const api = new CitiOAuth('appid', 'secret', 'https://uniheart.herokuapp.com/passport/citi/callback')

      try {
        await api.getUserByAccessToken('access_token')
      } catch (ex) {
        assert(ex.name === 'CitiAPIError')
        assert(ex.message.startsWith('Request failed with status code 401'))
      }
    })

    describe('mock get user ok', () => {
      const api = new CitiOAuth('appid', 'secret', 'https://uniheart.herokuapp.com/passport/citi/callback')

      let mock: MockAdapter
      before(() => {
        mock = new MockAdapter(axios)
        mock.onGet(/.+/).replyOnce(200, {
          customerType: 'INDIVIDUAL',
          customerSegment: 'BLUE',
          partnerCustomerSegment: 'AD1',
          customerParticulars: {
            names: {
              firstName: 'Javier',
              lastName: 'de Cuellar',
              nameType: 'LOCAL_NAME',
              middleName: 'Perez',
              fullName: 'Javier Perez de Cuellar',
            },
            prefix: 'Mr.',
            suffix: 'III',
          },
          addressList: {
            addressline1: '40A ORCHARD ROAD',
            addressline2: '#99-99 MACDONALD HOUSE',
            addressline3: 'Orchard Avenue 2',
            addressline4: 'Street 65',
            addressType: 'PRIMARY_ADDRESS',
            city: 'SINGAPORE',
            state: 'SINGAPORE',
            postalCode: '520189',
            countryName: 'SINGAPORE',
          },
          emails: {
            emailAddress: 'javier123@yahoo.com',
            preferredEmailFlag: 'true',
            emailType: 'PERSONAL',
          },
          phones: {
            phoneType: 'HOME',
            phoneNumber: '4567234512',
            phoneCountryCode: '34',
            areaCode: 'O',
            extension: 'O',
          },
        })
      })
      after(() => {
        mock.restore()
      })

      it('should ok', async () => {
        const res = await api.getUserByAccessToken('access_token')
        const keys = [
          'customerType',
          'customerSegment',
          'partnerCustomerSegment',
          'customerParticulars',
          'addressList',
          'emails',
          'phones',
        ]

        keys.map(k => assert(Object.keys(res).includes(k)))
      })
    })
  })

  const expectedKeys = [
    'customerType',
    'customerSegment',
    'partnerCustomerSegment',
    'customerParticulars',
    'addressList',
    'emails',
    'phones',
  ]
  describe('getUserInformation', () => {
    describe('mock get valid token', () => {
      const api = new CitiOAuth('appid', 'secret', 'undefined', () => ({
        access_token: 'access_token',
        created_at: new Date().getTime(),
        expires_in: 60,
      }))

      const mock = TypeMoq.Mock.ofInstance(api)

      before(() => {
        mock.setup(x => x.getUserByAccessToken(TypeMoq.It.isAnyString())).returns(async () => ({
          customerType: 'INDIVIDUAL',
          customerSegment: 'BLUE',
          partnerCustomerSegment: 'AD1',
          customerParticulars: {
            names: {
              firstName: 'Javier',
              lastName: 'de Cuellar',
              nameType: 'LOCAL_NAME',
              middleName: 'Perez',
              fullName: 'Javier Perez de Cuellar',
            },
            prefix: 'Mr.',
            suffix: 'III',
          },
          addressList: {
            addressline1: '40A ORCHARD ROAD',
            addressline2: '#99-99 MACDONALD HOUSE',
            addressline3: 'Orchard Avenue 2',
            addressline4: 'Street 65',
            addressType: 'PRIMARY_ADDRESS',
            city: 'SINGAPORE',
            state: 'SINGAPORE',
            postalCode: '520189',
            countryName: 'SINGAPORE',
          },
          emails: {
            emailAddress: 'javier123@yahoo.com',
            preferredEmailFlag: 'true',
            emailType: 'PERSONAL',
          },
          phones: {
            phoneType: 'HOME',
            phoneNumber: '4567234512',
            phoneCountryCode: '34',
            areaCode: 'O',
            extension: 'O',
          },
        }))
      })
    })

    describe('mock get invalid token and valid refresh_token', () => {
      const api = new CitiOAuth('appid', 'secret', 'https://uniheart.herokuapp.com/passport/citi/callback')
      const mock = TypeMoq.Mock.ofInstance(api)

      before(() => {
        mock.setup(x => x.getToken(TypeMoq.It.isAnyString())).returns(async () => ({
          access_token: 'access_token',
          created_at: new Date().getTime() - 70 * 1000,
          expires_in: 60,
        }))

        mock.setup(x => x.refreshAccessToken(TypeMoq.It.isAnyString())).returns(
          async () =>
            new AccessToken({
              access_token: 'ACCESS_TOKEN',
              expires_in: 7200,
              refresh_token: 'REFRESH_TOKEN',
              scope: 'SCOPE',
              created_at: new Date().getTime(),
            }),
        )

        mock.setup(x => x.getUserByAccessToken(TypeMoq.It.isAnyString())).returns(async () => ({
          customerType: 'INDIVIDUAL',
          customerSegment: 'BLUE',
          partnerCustomerSegment: 'AD1',
          customerParticulars: {
            names: {
              firstName: 'Javier',
              lastName: 'de Cuellar',
              nameType: 'LOCAL_NAME',
              middleName: 'Perez',
              fullName: 'Javier Perez de Cuellar',
            },
            prefix: 'Mr.',
            suffix: 'III',
          },
          addressList: {
            addressline1: '40A ORCHARD ROAD',
            addressline2: '#99-99 MACDONALD HOUSE',
            addressline3: 'Orchard Avenue 2',
            addressline4: 'Street 65',
            addressType: 'PRIMARY_ADDRESS',
            city: 'SINGAPORE',
            state: 'SINGAPORE',
            postalCode: '520189',
            countryName: 'SINGAPORE',
          },
          emails: {
            emailAddress: 'javier123@yahoo.com',
            preferredEmailFlag: 'true',
            emailType: 'PERSONAL',
          },
          phones: {
            phoneType: 'HOME',
            phoneNumber: '4567234512',
            phoneCountryCode: '34',
            areaCode: 'O',
            extension: 'O',
          },
        }))
      })

      it('should ok', async () => {
        const res = await mock.target.getUserByAccessToken('xxx')

        expectedKeys.map(k => assert(Object.keys(res).includes(k)))
      })
    })
  })

  describe('getUserByCode', () => {
    const api = new CitiOAuth('appid', 'secret', 'https://uniheart.herokuapp.com/passport/citi/callback')
    const mock = TypeMoq.Mock.ofInstance(api)
    let mockAdapter
    before(() => {
      mockAdapter = new MockAdapter(axios)

      mockAdapter.onPost(/.+/).replyOnce(200, {
        access_token: 'ACCESS_TOKEN',
        expires_in: 7200,
        refresh_token: 'REFRESH_TOKEN',
        scope: 'SCOPE',
      })

      mock.setup(x => x.getUserByAccessToken(TypeMoq.It.isAnyString())).returns(async () => ({
        customerType: 'INDIVIDUAL',
        customerSegment: 'BLUE',
        partnerCustomerSegment: 'AD1',
        customerParticulars: {
          names: {
            firstName: 'Javier',
            lastName: 'de Cuellar',
            nameType: 'LOCAL_NAME',
            middleName: 'Perez',
            fullName: 'Javier Perez de Cuellar',
          },
          prefix: 'Mr.',
          suffix: 'III',
        },
        addressList: {
          addressline1: '40A ORCHARD ROAD',
          addressline2: '#99-99 MACDONALD HOUSE',
          addressline3: 'Orchard Avenue 2',
          addressline4: 'Street 65',
          addressType: 'PRIMARY_ADDRESS',
          city: 'SINGAPORE',
          state: 'SINGAPORE',
          postalCode: '520189',
          countryName: 'SINGAPORE',
        },
        emails: {
          emailAddress: 'javier123@yahoo.com',
          preferredEmailFlag: 'true',
          emailType: 'PERSONAL',
        },
        phones: {
          phoneType: 'HOME',
          phoneNumber: '4567234512',
          phoneCountryCode: '34',
          areaCode: 'O',
          extension: 'O',
        },
      }))
    })

    after(() => {
      mockAdapter.restore()
    })

    it('should ok with getUserByCode', async () => {
      const res = await mock.target.getUserByCode('code')
      expectedKeys.map(k => assert(Object.keys(res).includes(k)))
    })
  })
})
