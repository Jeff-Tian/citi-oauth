import axios from 'axios'
import querystring from 'querystring'
import uuid from 'uuid/v4'
import { wrapper } from './util'
import CitiReward from './reward'
import CitiCards from './cards'
import CitiOnboarding from './onboarding'

const getAccessTokenCacheKey = (url: string, qs: any, endpoint: string) =>
  `${endpoint}${url}?${querystring.stringify(qs)}`

const allScopes = 'pay_with_points accounts_details_transactions customers_profiles payees personal_domestic_transfers internal_domestic_transfers external_domestic_transfers bill_payments cards onboarding reference_data';

function getAuthorizeURL(parameters: {
  redirect: string
  scope?: string
  state?: string
  url: string
  appId: string
  countryCode: string
}) {
  const { redirect, scope, state, url, appId, countryCode } = parameters
  const info: any = {
    response_type: 'code',
    client_id: appId,
    scope:
      scope ||
      allScopes,
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
  refresh_token?: string
  scope: string
  token_type?: string
  consented_on?: number
  refresh_token_expires_in?: number
}

export class AccessToken implements IAccessToken {
  public readonly access_token!: string
  public readonly created_at!: number
  public readonly expires_in!: number
  public readonly refresh_token?: string
  public readonly scope!: string
  public readonly token_type: string | undefined
  public readonly consented_on: number | undefined
  public readonly refresh_token_expires_in?: number
  constructor(data: IAccessToken) {
    Object.assign(this, data)
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
  public readonly saveToken!: (openid: string, token: object) => void
  private readonly store: any
  private logger: ILogger
  private readonly redirectUri: string
  endpoint: string
  public Cards: CitiCards
  public Onboarding: CitiOnboarding

  constructor(
    appId: string,
    appSecret: string,
    redirectUri: string,
    saveToken?: (openid: string, token: object) => Promise<void>,
    getToken?: (openId?: string) => Promise<any>,
    logger: ILogger = console
  ) {
    this.appId = appId
    this.appSecret = appSecret
    this.store = {}
    this.logger = logger
    this.redirectUri = redirectUri
    this.getToken = !getToken
      ? (openId: string | undefined) => {
        return Promise.resolve(this.store[openId || ''])
      }
      : getToken

    if (!saveToken) {
      this.logger.warn(
        `Please don't save oauth token into memory under production!`
      )

      this.saveToken = (openid: string, token: object) => {
        this.store[openid] = token

        return Promise.resolve()
      }
    } else {
      this.saveToken = saveToken
    }

    this.endpoint = 'https://sandbox.apihub.citi.com/gcb/api'
    this.Reward = new CitiReward(this)
    this.Cards = new CitiCards(this)
    this.Onboarding = new CitiOnboarding(this)
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
    const url = `/authCode/oauth2/token/${countryCode}/gcb`
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
    const info = { grant_type: 'client_credentials', scope }

    return this.processAccessToken(url, info)
  }

  public async refreshAccessToken(refreshToken: string) {
    const url =
      'https://sandbox.apihub.citi.com/gcb/api/authCode/oauth2/refresh'
    const info = { grant_type: 'refresh_token', refresh_token: refreshToken }

    return this.processAccessToken(url, info)
  }

  public async getUserByAccessToken(accessToken: string) {
    const url = '/v1/customers/profiles'

    return wrapper(axios.get, {
      endpoint: this.endpoint,
      logger: this.logger,
    })(url, {
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
    const res = await this.getUserByAccessToken(accessToken.access_token)

    try {
      await this.saveToken(
        res.emails ? res.emails[0].emailAddress : '',
        accessToken
      )
    } catch (ex) {
      this.logger.error('error = ', ex)
    }

    return res
  }

  private async processAccessToken(url: string, qs: any, options?: {}) {
    const time = new Date().getTime()

    const cache = await this.getToken(
      getAccessTokenCacheKey(url, qs, this.endpoint)
    )

    if (cache) {
      try {
        const parsed = JSON.parse(cache) as AccessToken

        if (parsed.expires_in + parsed.created_at > time) {
          return parsed
        }
      } catch (ex) {
        this.logger.error('从缓存中读取 AccessToken 时出错：', { ex, cache })
      }
    }

    const tokenResult = await wrapper(axios.post, {
      endpoint: this.endpoint,
      logger: this.logger,
    })(url, querystring.stringify(qs), {
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
    })

    const res = new AccessToken({
      created_at: time,
      ...tokenResult,
    })

    try {
      this.saveToken(getAccessTokenCacheKey(url, qs, this.endpoint), res)
    } catch (ex) {
      this.logger.error('保存 token 时发生了错误：', { url, res, ex })
    }

    return res
  }

  public wrap(
    requestFunc: (url: string, data?: any, options?: any) => Promise<any>
  ) {
    return wrapper(requestFunc, {
      endpoint: this.endpoint,
      logger: this.logger,
    })
  }

  public async makeClientAuthRequest(
    url: string,
    qs: any = {},
    options: { accessToken?: string; countryCode?: string; method: string } = {
      accessToken: undefined,
      countryCode: 'sg',
      method: 'get',
    }
  ) {
    const headers = {
      accept: 'application/json',
      'accept-language': 'en-us',
      authorization: `Bearer ${options.accessToken ||
        (await this.getClientAccessToken(options.countryCode)).access_token}`,
      'content-type': 'application/json',
      uuid: uuid(),
      client_id: this.appId,
    }

    return await this.wrap(axios[options.method])(
      url,
      options.method === 'get' ? querystring.stringify(qs) : JSON.stringify(qs),
      { headers }
    )
  }
}
