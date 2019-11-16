import assert = require('assert')
import CitiOAuth from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('citi onboarding', () => {
  describe('get products', () => {
    let mockedResult = {
      products: {
        productCode: 'VC380',
        productDescription: 'Citibank SMRT Visa Card',
        sourceCode: 'WW5ARCE1',
        logo: '830',
        organisation: '888',
        productType: 'CC',
        minimumCreditLimitAmount: 5000.25,
        maximumCreditLimitAmount: 10000.25,
        annualFeeAmount: 100.25,
        currencyCode: 'SGD',
        interestRate: 28.25,
        latePaymentFee: 150.25,
        importantInformations:
          'All Rewards are subject to the terms and conditions of the Citibank Rewards Program.',
        termsAndConditions: 'Terms and conditions',
        agreementStartDate: '2016-10-10',
        agreementExpiryDate: '2018-12-10',
      },
      nextStartIndex: '11',
    }

    let mock: MockAdapter
    before(() => {
      mock = new MockAdapter(axios)

      mock.onPost(/clientCredentials/).replyOnce(200, {access_token: '1234'})

      mock.onGet(/onboarding\/products/).replyOnce(200, mockedResult)

      after(mock.restore)
    })

    const auth = new CitiOAuth('xxxn', 'yyy', 'http://diveintonode.org/')

    it('should get all products', async () => {
      const res = await auth.Onboarding.getProducts()
      assert.deepStrictEqual(res, mockedResult)
    })
  })

  describe('application', () => {
    let mockResult = {
      applicationId: 'ZOW9IO793854',
      applicationStage: 'PRESCREENING',
      controlFlowId:
        '6e3774334f724a2b7947663653712f52456f524c41797038516a59347a437549564a77755676376e616a733d',
    }

    let mock: MockAdapter
    before(() => {
      mock = new MockAdapter(axios)

      mock
        .onPost(
          /^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/apac\/onboarding\/products\/unsecured\/applications$/
        )
        .replyOnce(200, mockResult)

      after(mock.restore)
    })

    const auth = new CitiOAuth('xxx', 'yyy', 'http://diveintonode.org/')

    it('should apply', async () => {
      const res = await auth.Onboarding.apply(
        {
          product: {},
          applicant: {
            motherMaidenName: 'Lisa',
            address: {
              addressType: 'HOME_ADDRESS',
              addressLine1: '40A Orchard Road',
              addressLine2: '#99-99 Macdonald House',
              addressLine3: 'Orchard Avenue 2',
              addressLine4: 'Street 65',
              cityName: 'Singapore',
              state: 'Singapore',
              postalCode: '345346',
              provinceCode: 'Singapore',
              countryCode: 'SG',
              okToMail: true,
              residenceDurationInYears: 5,
              residenceDurationInMonths: 4,
            },
            email: {
              emailAddress: 'matt.hayden@gmail.com',
              okToEmail: true,
              isPreferredEmailAddress: true,
            },
            phone: {
              phoneType: 'PRIMARY_MOBILE_NUMBER',
              phoneCountryCode: '61',
              areaCode: '02',
              phoneNumber: '64042321',
              extension: '23',
              okToSms: true,
              okToCall: true,
            },
            employmentDetails: {
              employerName: 'Citi Bank',
              jobTitle: 'ACCOUNTANT',
              occupationCode: 'ACCOUNTANT',
              industryCode: 'CITIBANK_SUB_NON_BANK',
              employmentDurationInYears: 5,
              employmentDurationInMonths: 3,
              employmentStatus: 'EMPLOYED',
              monthsInPreviousEmployment: 5,
              yearsInPreviousEmployment: 4,
              accountantName: 'Javier',
              accountantFirmName: 'ACME',
              yearsInIndustry: 5,
              monthsInIndustry: 6,
            },
            identificationDocumentDetails: {
              idType: 'PASSPORT',
              idNumber: 'S42258011',
              idExpiryDate: '2027-04-11',
              idIssueDate: '2017-04-12',
              idIssuePlace: 'AU',
              idIssueState: 'QUEENSLAND',
              idIssueCountry: 'AU',
              isPrimaryId: true,
            },
            consentDetails: {
              consentType: 'BUREAU_PULL_CONSENT',
              isConsentGiven: true,
            },
          },
        },
        '1234'
      )
      assert.deepStrictEqual(res, mockResult)
    })
  })
})
