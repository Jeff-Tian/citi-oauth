import assert = require('assert')
import CitiOAuth, { AccessToken } from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as TypeMoq from 'typemoq'

describe('citi access token', () => {
    describe('get client access token', () => {
        const auth = new CitiOAuth('appid', 'appsecret', 'http://diveintonode.org/')

        it('should 400', async () => {
            try {
                await auth.getClientAccessToken()
            } catch (ex) {
                assert(ex.name === 'CitiAPIError')
                assert(ex.message === 'Request failed with status code 400')
            }
        })
    })
})
