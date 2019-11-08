import axios from 'axios'
import querystring from 'querystring'
import uuid from 'uuid/v4'
import {wrapper} from './util'
import CitiReward from './reward'
import _ from 'lodash/fp'
import CitiCards from './cards'

function getAuthorizeURL(parameters: {
  redirect: string
  scope?: string
  state?: string
  url: string
  appId: string
  countryCode: string
}) {
  const {redirect, scope, state, url, appId, countryCode} = parameters
  const info: any = {
    response_type: 'code',
    client_id: appId,
    scope:
      scope ||
      'pay_with_points accounts_details_transactions customers_profiles payees personal_domestic_transfers internal_domestic_transfers external_domestic_transfers bill_payments cards onboarding reference_data',
    countryCode: (countryCode || 'sg').toUpperCase(),
    businessCode: 'GCB'.toUpperCase(),
    locale: 'en_US',
    state: state || '',
    redirect_uri: redirect,
  }

  return url + '?' + querystring.stringify(info)
}

interface ILogger {
  warn: (...args) => void
  log: (...args) => void
  info: (...args) => void
  error: (...args) => void
}

interface IAccessToken {
  access_token: string
  created_at: number
  expires_in: number
  refresh_token: string
  scope: string
  token_type?: string
  consented_on?: number
  refresh_token_expires_in?: number
}

export class AccessToken implements IAccessToken {
  public readonly access_token: string
  public readonly created_at: number
  public readonly expires_in: number
  public readonly refresh_token: string
  public readonly scope: string
  public readonly token_type: string | undefined
  public readonly consented_on: number | undefined
  public readonly refresh_token_expires_in: number | undefined

  constructor(data: IAccessToken) {
    this.access_token = data.access_token
    this.created_at = data.created_at
    this.expires_in = data.expires_in
    this.refresh_token = data.refresh_token
    this.scope = data.scope
    this.token_type = data.token_type
    this.consented_on = data.consented_on
    this.refresh_token_expires_in = data.refresh_token_expires_in

    Object.keys(data).map(k => (this[k] = data[k]))
  }

  public isValid() {
    const time = new Date().getTime()

    return (
      !!this.access_token && time < this.created_at + this.expires_in * 1000
    )
  }
}

export default class CitiOAuth {
  public Reward: CitiReward
  public readonly getToken: (openId?: string) => any
  public readonly appId: string
  private readonly appSecret: string
  private readonly saveToken!: (openid: string, token: object) => void
  private readonly store: any
  private logger: ILogger
  private readonly redirectUri: string
  endpoint: string
  public Cards: CitiCards

  constructor(
    appId: string,
    appSecret: string,
    redirectUri: string,
    saveToken?: (openid: string, token: object) => void,
    getToken?: (openId?: string) => any,
    logger: ILogger = console
  ) {
    this.appId = appId
    this.appSecret = appSecret
    this.store = {}
    this.logger = logger
    this.redirectUri = redirectUri
    this.getToken = !getToken
      ? (openId: string | undefined) => {
          return this.store[openId || '']
        }
      : getToken

    if (
      !saveToken &&
      (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod')
    ) {
      this.logger.warn(
        `Please don't save oauth token into memory under production!`
      )
    }

    if (!saveToken) {
      this.saveToken = (openid: string, token: object) => {
        this.store[openid] = token
      }
    }

    this.endpoint = 'https://sandbox.apihub.citi.com/gcb/api'
    this.Reward = new CitiReward(this)
    this.Cards = new CitiCards(this)
  }

  public getAuthorizeURL(
    state?: string,
    scope?: string,
    countryCode: string = 'sg'
  ) {
    if (!state) {
      throw new TypeError('state 为必填字段！')
    }

    return getAuthorizeURL({
      redirect: this.redirectUri,
      scope,
      state,
      url: 'https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/authorize',
      appId: this.appId,
      countryCode,
    })
  }

  public async getAccessToken(code: string, countryCode: string = 'sg') {
    const url = `https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/token/${countryCode}/gcb`
    const info = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    }

    return this.processAccessToken(url, info)
  }

  public async getClientAccessToken(
    countryCode: string = 'sg',
    scope: string = '/api'
  ) {
    const url = `/clientCredentials/oauth2/token/${countryCode.toLowerCase()}/gcb`
    const info = {grant_type: 'client_credentials', scope}

    return this.processAccessToken(url, info)
  }

  public async refreshAccessToken(refreshToken: string) {
    const url =
      'https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/refresh'
    const info = {grant_type: 'refresh_token', refresh_token: refreshToken}

    return this.processAccessToken(url, info)
  }

  public async getUserByAccessToken(accessToken: string) {
    const url = 'https://sandbox.apihub.citi.com/gcb/api/v1/customers/profiles'

    return wrapper(axios.get)(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        uuid: uuid(),
        client_id: this.appId,
      },
    })
  }

  public async getUserByCode(code: string, countryCode: string = 'sg') {
    const accessToken = await this.getAccessToken(code, countryCode)
    return this.getUserByAccessToken(accessToken.access_token)
  }

  private async processAccessToken(url: string, info: any, options?: {}) {
    const time = new Date().getTime()

    const tokenResult = await wrapper(axios.post, {endpoint: this.endpoint})(
      url,
      querystring.stringify(info),
      {
        ...{
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.appId}:${this.appSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        ...options,
      }
    )

    const accessToken = new AccessToken({
      created_at: time,
      ...tokenResult,
    })

    try {
      this.saveToken(tokenResult.openid, accessToken)
    } catch (e) {
      this.logger.error(e)
    }

    return accessToken
  }

  public wrap(
    requestFunc: (url: string, data?: any, options?: any) => Promise<any>
  ) {
    return wrapper(requestFunc, {
      endpoint: this.endpoint,
    })
  }
}
