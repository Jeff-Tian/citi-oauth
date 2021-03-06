import assert = require('assert')
import CitiOAuth from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('citi points', () => {
  describe('get balance error', () => {
    const auth = new CitiOAuth('xxx', 'yyy', 'http://diveintonode.org/')

    it('should 404', async () => {
      try {
        await auth.Reward.getPointBalance(
          'sg',
          'c88b3dbf7f7546c90523fe046ae5aa8639fb2dab2d8e5f4c3cc9351f99ef963086bf854bcaa6924a524a18a6c90817fc21b192c3694180a0a99ae8c1f5e68da0'
        )
        throw new Error('should not be here')
      } catch (ex) {
        assert(ex.name === 'CitiAPIError')
        assert(ex.message === 'Request failed with status code 404')
      }
    })
  })

  describe('get balance with mocked results', () => {
    let mock: MockAdapter

    let balance = {
      isRedemptionEligible: true,
      availablePointBalance: 0,
      programConversionRate: 0.008,
      localCurrencyCode: 'USD',
      redemptionPointIncrement: 1,
      maximumPointsToRedeem: 0,
      minimumPointsToRedeem: 100,
    }

    before(() => {
      mock = new MockAdapter(axios)
      mock
        .onPost(
          'https://sandbox.apihub.citi.com/gcb/api/clientCredentials/oauth2/token/sg/gcb'
        )
        .replyOnce(200, {
          access_token:
            'AAIkYTk1NDFiMzgtMmU3Zi00M2EzLTgxMjEtNjAxN2Q0NDBkODk20pOk964xXqhBnVt76Dgw9LPl9tbF7Rrab9Y-RUOljeAmI--XTo5TzD5eTALu9c7mTwXJgDQAO3OdhMD5mUrPigNc8WoMsn6_u1OJVjLuCSfY2T-JgFaz2LGBLtwLLaBCq8gMtTRi_2RtsKOdaNus9OdBcW107flpRfJmgVhcYQJrS8IRaZxX5LPCAt6KnSHh_igHEXkvUUX1VgYx3ZK0FS0lJeXHdZk3_1FGaAA2YJE',
          created_at: 1572771884571,
          expires_in: 1800,
          refresh_token: undefined,
          scope: '/api',
          token_type: 'bearer',
          consented_on: 1572771884,
        })

      mock
        .onGet(
          /^https\:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/rewards\/pointBalance.+/
        )
        .replyOnce(200, balance)

      after(mock.restore)
    })
    const auth = new CitiOAuth('xxx', 'yyy', 'http://diveintonode.org/')

    it('should succeed', async () => {
      const res = await auth.Reward.getPointBalance(
        'sg',
        'c88b3dbf7f7546c90523fe046ae5aa8639fb2dab2d8e5f4c3cc9351f99ef963086bf854bcaa6924a524a18a6c90817fc21b192c3694180a0a99ae8c1f5e68da0'
      )

      assert.deepStrictEqual(res, balance)
    })
  })

  describe.skip('create link code', () => {
    const auth = new CitiOAuth('xxx', 'yyy', 'http://diveintonode.org/')

    it('should get link code', async () => {
      const res = await auth.Reward.link()

      assert.deepStrictEqual(res, {})
    })
  })
})
