import assert = require('assert')
import CitiOAuth from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('citi onboarding', () => {
  describe('get products', () => {
    let mockedResult = {
      products: {
        productCode: 'VC380',
        productDescription: 'Citibank SMRT Visa Card',
        sourceCode: 'WW5ARCE1',
        logo: '830',
        organisation: '888',
        productType: 'CC',
        minimumCreditLimitAmount: 5000.25,
        maximumCreditLimitAmount: 10000.25,
        annualFeeAmount: 100.25,
        currencyCode: 'SGD',
        interestRate: 28.25,
        latePaymentFee: 150.25,
        importantInformations:
          'All Rewards are subject to the terms and conditions of the Citibank Rewards Program.',
        termsAndConditions: 'Terms and conditions',
        agreementStartDate: '2016-10-10',
        agreementExpiryDate: '2018-12-10',
      },
      nextStartIndex: '11',
    }

    let mock: MockAdapter
    before(() => {
      mock = new MockAdapter(axios)

      mock.onPost(/clientCredentials/).replyOnce(200, {access_token: '1234'})

      mock.onGet(/onboarding\/products/).replyOnce(200, mockedResult)

      after(mock.restore)
    })

    const auth = new CitiOAuth('xxxn', 'yyy', 'http://diveintonode.org/')

    it('should get all products', async () => {
      const res = await auth.Onboarding.getProducts()
      assert.deepStrictEqual(res, mockedResult)
    })
  })

  describe('application', () => {
    let mockResult = {
      applicationId: 'ZOW9IO793854',
      applicationStage: 'PRESCREENING',
      controlFlowId:
        '6e3774334f724a2b7947663653712f52456f524c41797038516a59347a437549564a77755676376e616a733d',
    }

    let mock: MockAdapter
    before(() => {
      mock = new MockAdapter(axios)

      mock
        .onPost(
          /^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/apac\/onboarding\/products\/unsecured\/applications.+/
        )
        .replyOnce(200, mockResult)

      after(mock.restore)
    })

    const auth = new CitiOAuth('xxx', 'yyy', 'http://diveintonode.org/')

    it('should apply', async () => {
      const res = await auth.Onboarding.apply('1234')
      assert.deepStrictEqual(res, mockResult)
    })
  })
})
