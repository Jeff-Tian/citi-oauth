import axios from 'axios'
import querystring from 'querystring'
import CitiOAuth from '.'
import uuid from 'uuid/v4'

export default class CitiCards {
  citi: CitiOAuth

  constructor(citi: CitiOAuth) {
    this.citi = citi
  }

  public async getCards(accessToken: string) {
    const url = `/v1/cards`
    const qs: any = {
      cardFunction: 'ALL',
    }

    const headers = {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: `Bearer ${accessToken}`,
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
