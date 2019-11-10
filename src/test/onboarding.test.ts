import assert = require('assert')
import CitiOAuth from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('citi onboarding', () => {
    describe('application', () => {
        let mockResult = {
            "applicationId": "ZOW9IO793854",
            "applicationStage": "PRESCREENING",
            "controlFlowId": "6e3774334f724a2b7947663653712f52456f524c41797038516a59347a437549564a77755676376e616a733d"
        }

        let mock: MockAdapter
        before(() => {
            mock = new MockAdapter(axios)

            mock
                .onPost(/^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/apac\/onboarding\/products\/unsecured\/applications.+/)
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
