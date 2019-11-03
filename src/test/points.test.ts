import assert = require('assert')
import CitiOAuth, { AccessToken } from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as TypeMoq from 'typemoq'

describe('citi points', () => {
    describe('get balance error', () => {
        const auth = new CitiOAuth('appid', 'appsecret', 'http://diveintonode.org/')

        it('should 401', async () => {
            try {
                await auth.Reward.getPointBalance()
            } catch (ex) {
                assert(ex.name === 'CitiAPIError')
                assert(ex.message === 'Request failed with status code 401')
            }
        })
    })
})
