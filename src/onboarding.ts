import CitiOAuth from '.'

export default class CitiOnboarding {
    citi: CitiOAuth

    constructor(citi: CitiOAuth) {
        this.citi = citi
    }

    public async apply(accessToken?: string, countryCode: string = 'sg') {
        const url = `/v1/apac/onboarding/products/unsecured/applications`
        const qs: any = {
        }

        return await this.citi.makeClientAuthRequest(url, qs, { method: 'post', accessToken, countryCode })
    }
}
