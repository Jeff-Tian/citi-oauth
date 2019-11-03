import assert = require('assert')
import CitiOAuth, { AccessToken } from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as TypeMoq from 'typemoq'

describe('citi access token', () => {
    describe('get client access token', () => {
        const auth = new CitiOAuth('appid', 'appsecret', 'http://diveintonode.org/')

        it('should 401', async () => {
            try {
                await auth.getClientAccessToken()
                throw new Error('should not be called here')
            } catch (ex) {
                assert(ex.name === 'CitiAPIError')
                assert(ex.message === 'Request failed with status code 401')
            }
        })
    })

    describe('get client access token with invalid scope', () => {
        let mock: MockAdapter

        before(() => {
            mock = new MockAdapter(axios)
            mock.onPost('https://sandbox.apihub.citi.com/gcb/api/clientCredentials/oauth2/token/us/gcb').replyOnce(400, { error: 'invalid_scope' })
        })

        after(() => {
            mock.restore()
        })

        const auth = new CitiOAuth('appId', 'appSecret', 'auth_redirect_url')

        it('should error invalid scope', async () => {
            try {
                await auth.getClientAccessToken('us', 'invalid scope')

                throw new Error('never reach here')
            }
            catch (ex) {
                assert(ex.name === 'CitiAPIError')
                assert(ex.response.data.error === 'invalid_scope')
            }
        })
    })

    describe('get client access token with mock results', () => {
        let mock: MockAdapter

        before(() => {
            mock = new MockAdapter(axios)
            mock.onPost('https://sandbox.apihub.citi.com/gcb/api/clientCredentials/oauth2/token/us/gcb').replyOnce(200, { access_token: "AAIkYTk1NDFiMzgtMmU3Zi00M2EzLTgxMjEtNjAxN2Q0NDBkODk20pOk964xXqhBnVt76Dgw9LPl9tbF7Rrab9Y-RUOljeAmI--XTo5TzD5eTALu9c7mTwXJgDQAO3OdhMD5mUrPigNc8WoMsn6_u1OJVjLuCSfY2T-JgFaz2LGBLtwLLaBCq8gMtTRi_2RtsKOdaNus9OdBcW107flpRfJmgVhcYQJrS8IRaZxX5LPCAt6KnSHh_igHEXkvUUX1VgYx3ZK0FS0lJeXHdZk3_1FGaAA2YJE", created_at: 1572771884571, expires_in: 1800, refresh_token: undefined, scope: "/api", token_type: "bearer", consented_on: 1572771884 })
        })

        after(() => {
            mock.restore()
        })

        const auth = new CitiOAuth('appId', 'appSecret', 'auth_redirect_url')

        it('should ok', async () => {
            const res = await auth.getClientAccessToken('us')

            assert.deepStrictEqual(res, new AccessToken({ access_token: "AAIkYTk1NDFiMzgtMmU3Zi00M2EzLTgxMjEtNjAxN2Q0NDBkODk20pOk964xXqhBnVt76Dgw9LPl9tbF7Rrab9Y-RUOljeAmI--XTo5TzD5eTALu9c7mTwXJgDQAO3OdhMD5mUrPigNc8WoMsn6_u1OJVjLuCSfY2T-JgFaz2LGBLtwLLaBCq8gMtTRi_2RtsKOdaNus9OdBcW107flpRfJmgVhcYQJrS8IRaZxX5LPCAt6KnSHh_igHEXkvUUX1VgYx3ZK0FS0lJeXHdZk3_1FGaAA2YJE", created_at: 1572771884571, expires_in: 1800, refresh_token: undefined, scope: "/api", token_type: "bearer", consented_on: 1572771884, "refresh_token_expires_in": undefined }))
        })
    })
})
