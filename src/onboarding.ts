import CitiOAuth from '.'

export default class CitiOnboarding {
    citi: CitiOAuth

    constructor(citi: CitiOAuth) {
        this.citi = citi
    }

    public async apply(accessToken?: string, countryCode: string = 'sg') {
        const url = `/v1/apac/onboarding/products/unsecured/applications`

        return await this.citi.makeClientAuthRequest(url, {}, { method: 'post', accessToken, countryCode })
    }
}
