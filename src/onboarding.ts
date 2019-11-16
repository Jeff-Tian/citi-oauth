import CitiOAuth from '.'

export default class CitiOnboarding {
  citi: CitiOAuth

  constructor(citi: CitiOAuth) {
    this.citi = citi
  }

  public async getProducts(accessToken?: string, countryCode: string = 'sg') {
    const url = `/v1/apac/onboarding/products`

    return await this.citi.makeClientAuthRequest(
      url,
      {},
      {method: 'get', accessToken, countryCode}
    )
  }

  public async apply(
    data: any,
    accessToken?: string,
    countryCode: string = 'sg'
  ) {
    const url = `/v1/apac/onboarding/products/unsecured/applications`

    return await this.citi.makeClientAuthRequest(url, data, {
      method: 'post',
      accessToken,
      countryCode,
    })
  }
}
