import axios from 'axios'
import querystring from 'querystring'
import CitiOAuth from '.'
import uuid from 'uuid/v4'

export default class CitiReward {
  citi: CitiOAuth

  constructor(citi: CitiOAuth) {
    this.citi = citi
  }

  public async link(countryCode: string = 'US') {
    const url = `/v1/rewards/linkage`
    const headers = {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: `Bearer ${
        (await this.citi.getClientAccessToken(countryCode)).access_token
      }`,
      businesscode: 'GCB',
      countrycode: countryCode.toUpperCase(),
      'content-type': 'application/json',
      uuid: uuid(),
      client_id: this.citi.appId,
    }
  }

  public async getPointBalance(
    countryCode: string = 'US',
    cloakedCreditCardNumber?: string
  ) {
    const url = `/v1/rewards/pointBalance`
    const qs: any = {
      cloakedCreditCardNumber,
      merchantCode: 'FLOWR',
      rewardProgram: 'THANKU',
    }

    if (!cloakedCreditCardNumber) {
      qs.rewardLinkCode = '998OB390B502W4G4PQIMGP8P4155378GM4SQ3ORF418134ST'
    }

    const headers = {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: `Bearer ${
        (await this.citi.getClientAccessToken(countryCode)).access_token
      }`,
      businesscode: 'GCB',
      countrycode: countryCode.toUpperCase(),
      'content-type': 'application/json',
      uuid: uuid(),
      client_id: this.citi.appId,
    }

    return await this.citi.wrap(axios.get)(
      url + '?' + querystring.stringify(qs),
      {headers}
    )
  }
}
