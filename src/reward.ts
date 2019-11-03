import { wrapper } from "./util"
import axios from 'axios'
import querystring from 'querystring'
import CitiOAuth from "."
import uuid from 'uuid/v4'

export default class CitiReward {
    citi: any;
    constructor(citi: CitiOAuth) {
        this.citi = citi;
    }
    public async getPointBalance() {
        const url = `https://sandbox.apihub.citi.com/gcb/api/v1/rewards/pointBalance`
        const qs = {
            cloakedCreditCardNumber: 'REPLACE_THIS_VALUE',
            merchantCode: 'REPLACE_THIS_VALUE',
            rewardProgram: 'THANKU',
            rewardLinkCode: 'REPLACE_THIS_VALUE'
        }
        const headers = {
            accept: 'application/json',
            'accept-language': 'en',
            authorization: `Bearer ${this.citi.accessToken}`,
            businesscode: 'GCB',
            countrycode: 'US',
            'content-type': 'application/json',
            uuid: uuid(),
            client_id: this.citi.appId
        }

        return await wrapper(axios.get)(url, querystring.stringify(qs), { headers })
    }
}