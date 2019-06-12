import axios from 'axios'
import * as querystring from 'querystring'
import uuid from 'uuid/v4'
import { wrapper } from './util'

function getAuthorizeURL(parameters: { redirect: string; scope?: string; state?: string; url: string; appId: string }) {
  const { redirect, scope, state, url, appId } = parameters
  const info: any = {
    response_type: 'code',
    client_id: appId,
    scope: scope || 'pay_with_points',
    countryCode: 'US',
    businessCode: 'GCB',
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
}

export class AccessToken implements IAccessToken {
  public readonly access_token: string
  public readonly created_at: number
  public readonly expires_in: number
  public readonly refresh_token: string
  public readonly scope: string

  constructor(data: IAccessToken) {
    this.access_token = data.access_token
    this.created_at = data.created_at
    this.expires_in = data.expires_in
    this.refresh_token = data.refresh_token
    this.scope = data.scope

    Object.keys(data).map(k => (this[k] = data[k]))
  }

  public isValid() {
    const time = new Date().getTime()

    return !!this.access_token && time < this.created_at + this.expires_in * 1000
  }
}

export default class CitiOAuth {
  public readonly getToken: (openId: string) => any
  private readonly appId: string
  private readonly appSecret: string
  private readonly saveToken!: (openid: string, token: object) => void
  private readonly store: any
  private logger: ILogger
  private readonly redirectUri: string

  constructor(
    appId: string,
    appSecret: string,
    redirectUri: string,
    saveToken?: (openid: string, token: object) => void,
    getToken?: (openId: string) => any,
    logger: ILogger = console,
  ) {
    this.appId = appId
    this.appSecret = appSecret
    this.store = {}
    this.logger = logger
    this.redirectUri = redirectUri
    this.getToken = !getToken
      ? (openId: string) => {
          return this.store[openId]
        }
      : getToken

    if (!saveToken && (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod')) {
      this.logger.warn(`Please don't save oauth token into memory under production!`)
    }

    if (!saveToken) {
      this.saveToken = (openid: string, token: object) => {
        this.store[openid] = token
      }
    }
  }

  public getAuthorizeURL(state?: string, scope?: string) {
    if (!state) {
      throw new TypeError('state 为必填字段！')
    }

    return getAuthorizeURL({
      redirect: this.redirectUri,
      scope,
      state,
      url: 'https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/authorize',
      appId: this.appId,
    })
  }

  public async getAccessToken(code: string) {
    const url = 'https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/token/us/gcb'
    const info = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    }

    return this.processAccessToken(url, info)
  }

  public async refreshAccessToken(refreshToken: string) {
    const url = 'https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/refresh'
    const info = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }

    return this.processAccessToken(url, info)
  }

  public async getUserByAccessToken(accessToken: string) {
    const url = 'https://sandbox.apihub.citi.com/gcb/api/v1/customers/profiles'

    return wrapper(axios.get)(url, {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      uuid: uuid(),
      client_id: this.appId,
    })
  }

  public async getUserByCode(code: string) {
    const accessToken = await this.getAccessToken(code)
    return this.getUserByAccessToken(accessToken.access_token)
  }

  private async processAccessToken(url: string, info) {
    const time = new Date().getTime()

    const tokenResult = await wrapper(axios.post)(url, querystring.stringify(info), {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

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
}
