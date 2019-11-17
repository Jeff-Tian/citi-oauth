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

      mock.onPost(/clientCredentials/).replyOnce(200, { access_token: '1234' })

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

    let mockQueryResult = {
      applicationStage: 'PRESCREENING',
      hasAnySupplementaryFlag: true,
      ipaExpiryDate: '2018-09-15',
      product: {
        creditCardProduct: {
          productCode: 'VC830',
          sourceCode: 'WW5ARCE1',
          organization: '888',
          logo: '830',
          requestCreditShield: 'false',
          embossName: 'Matthew Hayden',
          billingAddress: 'HOME_ADDRESS',
          cardDeliveryAddress: 'HOME_ADDRESS',
          pinDeliveryAddress: 'HOME_ADDRESS',
          giftCode: 'gc123',
          creditLimitIncreaseIndicator: true,
          requestedCreditLimit: 25000.25,
          balanceTransferDetails: {
            amountToTransfer: 5000.25,
            issuingOrganizationName: 'VOYAGER',
            accountName: 'Matt',
            accountReferenceNumber: '521212345121',
            billerCode: '11000125',
            campaignId: 'C$11785241',
          },
        },
        readyCreditProduct: {
          productCode: 'US251',
          sourceCode: 'PGP144',
          organization: '030',
          logo: 'PNC1',
          requestCreditShield: 'false',
          embossName: 'Matthew Hayden',
          billingAddress: 'OFFICE_ADDRESS',
          cardDeliveryAddress: 'OFFICE_ADDRESS',
          pinDeliveryAddress: 'OFFICE_ADDRESS',
          giftCode: 'gc123',
          creditLimitIncreaseIndicator: true,
          atmRequiredFlag: true,
          chequeBookRequiredFlag: true,
          balanceTransferDetails: {
            amountToTransfer: 5000.25,
            issuingOrganizationName: 'VOYAGER',
            accountName: 'Matt',
            accountReferenceNumber: '521212345121',
            billerCode: '11000125',
            campaignId: 'C$11785241',
          },
        },
        unsecuredLoanProduct: {
          productCode: 'VC001',
          sourceCode: 'S1N7QYDC',
          organization: '111',
          logo: '001',
          requestCreditShield: 'false',
          billingAddress: 'LEGAL_OR_RESIDENTIAL_ADDRESS',
          giftCode: 'gc123',
          requestedLoanAmount: 5500.25,
          tenor: '36_MONTHS',
        },
      },
      applicant: {
        motherMaidenName: 'Lisa',
        name: {
          salutation: 'Mr',
          givenName: 'Matthew',
          middleName: 'Du',
          surname: 'Hayden',
          localEnglishGivenName: 'Matthew',
          localEnglishSurname: 'Hayden',
          aliasName: 'Matt',
          saluteBy: 'SURNAME',
        },
        demographics: {
          gender: 'MALE',
          dateOfBirth: '1972-09-15',
          placeOfBirth: 'Sydney',
          countryOfBirth: 'AU',
          nationality: 'AU',
          domicileCountryCode: 'AU',
          permanentResidencyCountryCode: 'AU',
          maritalStatus: 'MARRIED',
          residencyStatus: 'RENTED_HOUSE',
          residenceType: 'CONDOMINIUM',
          taxDomicileCountryCode: 'SG',
          spokenLanguageCode: 'EN',
          correspondenceLanguageCode: 'EN',
        },
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
          countrySpecificAddress: null,
        },
        email: {
          emailAddress: 'matt.hayden@gmail.com',
          okToEmail: true,
          isPreferredEmailAddress: true,
        },
        phone: {
          phoneType: 'PRIMARY_MOBILE_NUMBER',
          phoneCountryCode: '65',
          areaCode: '02',
          phoneNumber: '63492610',
          extension: '23',
          okToSms: true,
          okToCall: true,
        },
        contactPreference: {
          sendSmsAdviceFlag: true,
          sendEmailAdviceFlag: true,
          preferredMailingAddress: 'HOME_ADDRESS',
          eStatementEnrollmentFlag: true,
        },
        contactConsent: {
          okToCall: true,
          okToMail: true,
          okToSms: true,
        },
        financialInformation: {
          hasForeseeableFinancialChanges: true,
          expenseDetails: {
            expenseType: 'COSTS_OF_LIVING',
            expenseAmount: 590.25,
            frequency: 'MONTHLY',
          },
          incomeDetails: {
            incomeType: 'DECLARED_FIXED',
            fixedAmount: 7590.25,
            variableAmount: 1590.25,
            frequency: 'MONTHLY',
            otherIncomeDescription: 'Rent',
          },
          existingLoanDetails: {
            loanType: 'STUDENT_LOAN',
            monthlyInstallmentAmount: 250.25,
            outstandingBalanceAmount: 5000.25,
          },
        },
        education: {
          highestEducationLevel: 'MASTER',
          yearOfGraduation: '2003',
          studentId: 'STID234567',
          university: 'NTU',
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
        additionalData: {
          numberOfDependents: '3',
          staffIndicator: true,
          businessNature: 'BANKING_FINANCIAL_INSTITUTIONS',
          emergencyContactName: 'Pearline',
          emergencyContactPhoneNumber: '64042321',
          overLimitConsentFlag: true,
          countrySpecificGroup: {
            bumiputraIndicator: true,
            disabilityIndicator: true,
            unionPayCardNumber: '5555666600008888',
            taxFileNumber: '656456737',
          },
          referralGivenName: 'Maxwell',
          referralSurname: 'Gate',
          relatedToCitiEmployeeFlag: true,
          relatedCitiEmployeeName: 'Anderson',
          relatedCitiEmployeeDepartment: 'Finance',
        },
        partnerCustomerDetails: {
          partnerCustomerInternalId: 'ZOW9IO793855',
          partnerCustomerId: 'P011100000125',
          partnerCustomerSegment: 'AD1',
        },
        consentDetails: {
          consentType: 'COUNTER_OFFER_CONSENT',
          isConsentGiven: true,
        },
        marketingConsent: {
          personalDataOptOutFlag: true,
          personalDataOptOutOthersFlag: false,
        },
        selfDeclaration: {
          totalActiveCreditCardLimitAmount: 23000.25,
          anticipatedIncomeDecreaseCode: 'Yes',
          loanTakenIndicator: true,
          monthlyRepaymentForAllExtLoans: 5000.25,
        },
        kycInformation: {
          selfPublicFigureDeclarationFlag: true,
          publicFigureOfficeStatus: 'Active',
          publicFigureOfficeDetails: 'Department of education and training',
          publicFigureOfficeStartDate: '2017-04-12',
          publicFigureOfficeEndDate: '2020-04-11',
          isRelatedToSeniorPublicFigure: true,
          relatedSeniorPublicFigureName: 'Dan Lee',
          relatedSeniorPublicFigureDesignation: 'Member of Parliament',
          relatedSpfCountryOfGovernment: 'SG',
          relatedSeniorPublicFigureDepartment: 'Ministry',
          relationshipWithSeniorPublicFigure: 'Father',
          relatedSeniorPublicFigureLastName: 'Lee',
          usTaxStatus: 'US_PERSON_REPORTABLE_DOCUMENTED',
          usTaxId: 'US234567',
        },
      },
      requestedProductDecision: {
        productCode: 'VC830',
        organisationName: '888',
        sourceCode: 'WW5ARCE1',
        logo: '830',
        creditDecision: 'IN_PRINCIPAL_PARTIAL_APPROVED',
        creditSpecificRecommendations: {
          recommendedCreditLimit: 25000.25,
          btMaximumLoanPercentage: 95.25,
          btMonthlyInterestRate: 95.25,
          eppMaximumLoanPercentage: 5.25,
          eppMonthlyInterestRate: 5.25,
          btCampaignId: '34543634',
          eppPromoId: '34543634',
        },
        loanSpecificRecommendations: {
          loanAmount: 25000.25,
          tenor: '10',
          interestRate: 5.25,
          handlingFee: 5.25,
          installmentAmount: 500.25,
          annualPercentageRate: 5.25,
          totalPrincipalAmount: 5000.25,
          totalInterestAmount: 500.25,
          totalInstallmentAmount: 500.25,
          repaymentScheduleIssueDate: '1972-09-15',
          repaymentSchedule: null,
        },
        requiredDocuments: {
          documentIdType: 'PAYSLIP',
          documentStatus: 'PENDING',
          productCode: 'VC830',
          proofType: 'INCOME_PROOF',
          linkedDocumentId: '02',
          applicantType: 'PRIMARY_APPLICANT_MAIN_APPLICANT',
        },
      },
      counterOffers: {
        offerProductCode: 'VC830',
        offerProductOrganisation: '888',
        offerSourceCode: 'WW5ARCE1',
        creditSpecificRecommendations: {
          recommendedCreditLimit: 25000.25,
          btMaximumLoanPercentage: 95.25,
          btMonthlyInterestRate: 95.25,
          eppMaximumLoanPercentage: 5.25,
          eppMonthlyInterestRate: 5.25,
          btCampaignId: '34543634',
          eppPromoId: '34543634',
        },
        loanSpecificRecommendations: {
          loanAmount: 25000.25,
          tenor: '10',
          interestRate: 5.25,
          handlingFee: 5.25,
          installmentAmount: 500.25,
          annualPercentageRate: 5.25,
          totalPrincipalAmount: 5000.25,
          totalInterestAmount: 500.25,
          totalInstallmentAmount: 500.25,
          repaymentScheduleIssueDate: '1972-09-15',
          repaymentSchedule: null,
        },
        requiredDocuments: {
          documentIdType: 'PAYSLIP',
          documentStatus: 'PENDING',
          productCode: 'VC830',
          proofType: 'INCOME_PROOF',
          linkedDocumentId: '02',
          applicantType: 'PRIMARY_APPLICANT_MAIN_APPLICANT',
        },
      },
      crossSellOffers: {
        offerProductCode: 'VC311',
        offerProductOrganisation: '888',
        offerSourceCode: 'WW5ARDE1',
        creditSpecificRecommendations: {
          recommendedCreditLimit: 25000.25,
          btMaximumLoanPercentage: 95.25,
          btMonthlyInterestRate: 95.25,
          eppMaximumLoanPercentage: 5.25,
          eppMonthlyInterestRate: 5.25,
          btCampaignId: '34543634',
          eppPromoId: '34543634',
        },
        loanSpecificRecommendations: {
          loanAmount: 25000.25,
          tenor: '10',
          interestRate: 5.25,
          handlingFee: 5.25,
          installmentAmount: 500.25,
          annualPercentageRate: 5.25,
          totalPrincipalAmount: 5000.25,
          totalInterestAmount: 500.25,
          totalInstallmentAmount: 500.25,
          repaymentScheduleIssueDate: '1972-09-15',
          repaymentSchedule: null,
        },
        requiredDocuments: {
          documentIdType: 'PAYSLIP',
          documentStatus: 'PENDING',
          productCode: 'VC830',
          proofType: 'INCOME_PROOF',
          linkedDocumentId: '02',
          applicantType: 'PRIMARY_APPLICANT_MAIN_APPLICANT',
        },
      },
    }

    let mock: MockAdapter
    before(() => {
      mock = new MockAdapter(axios)

      mock
        .onPost(
          /^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/apac\/onboarding\/products\/unsecured\/applications$/
        )
        .replyOnce(200, mockResult)

      mock
        .onGet(
          /^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/apac\/onboarding\/products\/unsecured\/applications\/1234$/
        )
        .replyOnce(200, mockQueryResult)

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

    it('can query application status', async () => {
      const res = await auth.Onboarding.getApplicationStatus('1234', '1234')

      assert.deepStrictEqual(res, mockQueryResult)
    })
  })
})

describe('real tests', () => {
  const mockResult = {
    applicationId: 'ZOW9IO793854',
    applicationStage: 'PRESCREENING',
    controlFlowId:
      '6e3774334f724a2b7947663653712f52456f524c41797038516a59347a437549564a77755676376e616a733d',
  }

  let mock: MockAdapter
  before(() => {
    mock = new MockAdapter(axios)

    mock.onPost('https://sandbox.apihub.citi.com/gcb/api/clientCredentials/oauth2/token/sg/gcb').replyOnce(200, { access_token: '1243', expires_in: 1800 })

    mock
      .onPost(
        /^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/apac\/onboarding\/products\/unsecured\/applications$/
      )
      .replyOnce(200, mockResult)

    after(mock.restore)
  })

  it('should apply', async () => {
    const auth = new CitiOAuth(
      'xxx',
      'yyy',
      'https://uniheart.herokuapp.com/passport/citi/callback'
    )

    const data = {
      "product": {
        "creditCardProduct": {
          "productCode": "VC830",
          "sourceCode": "WW5ARCE1",
          "organization": "888",
          "logo": "830",
          "requestCreditShield": "false",
          "embossName": "Matthew Hyden",
          "billingAddress": "OFFICE_ADDRESS",
          "cardDeliveryAddress": "OFFICE_ADDRESS",
          "pinDeliveryAddress": "OFFICE_ADDRESS",
          "giftCode": "gc123",
          "creditLimitIncreaseIndicator": true
        }
      },
      "applicant": {
        "ocr": {
          "ocrReferenceNumber": "OCR456789434538922"
        },
        "motherMaidenName": "Lisa",
        "name": {
          "salutation": "MR",
          "givenName": "Matthew",
          "middleName": "Du",
          "surname": "Hayden",
          "localEnglishGivenName": "Matthew",
          "localEnglishSurname": "Hayden",
          "aliasName": "Matt",
          "saluteBy": "SURNAME"
        },
        "demographics": {
          "gender": "MALE",
          "dateOfBirth": "1972-09-15",
          "placeOfBirth": "Sydney",
          "countryOfBirth": "SG",
          "nationality": "SG",
          "domicileCountryCode": "SG",
          "permanentResidencyCountryCode": "SG",
          "maritalStatus": "MARRIED",
          "residencyStatus": "OWN_HOUSE",
          "residenceType": "BUNGALOW",
          "taxDomicileCountryCode": "SG",
          "spokenLanguageCode": "ENGLISH",
          "correspondenceLanguageCode": "ENGLISH"
        },
        "address": [
          {
            "addressType": "OFFICE_ADDRESS",
            "addressLine1": "40A Orchard Road",
            "addressLine2": "#99-99 Macdonald House",
            "addressLine3": "Orchard Avenue 2",
            "addressLine4": "Street 65",
            "cityName": "Singapore",
            "state": "AM",
            "postalCode": "345346",
            "provinceCode": "Singapore",
            "countryCode": "SG",
            "okToMail": true,
            "residenceDurationInYears": 5,
            "residenceDurationInMonths": 4,
            "countrySpecificAddress": {
              "unitNumber": "99",
              "floorNumber": "18",
              "blockNumber": "19",
              "buildingName": "Estella",
              "estateName": "Marine Parade",
              "streetNumber": "52",
              "streetName": "Marine Parade",
              "town": "SG"
            }
          }
        ],
        "email": [
          {
            "emailAddress": "matt.hayden@gmail.com",
            "okToEmail": true,
            "isPreferredEmailAddress": true
          }
        ],
        "phone": [
          {
            "phoneType": "HOME_PHONE_NUMBER",
            "phoneCountryCode": "65",
            "areaCode": "0",
            "phoneNumber": "64042321",
            "okToSms": true,
            "okToCall": true
          }
        ],
        "contactPreference": {
          "sendSmsAdviceFlag": true,
          "sendEmailAdviceFlag": true,
          "preferredMailingAddress": "HOME_ADDRESS",
          "eStatementEnrollmentFlag": true
        },
        "contactConsent": {
          "okToCall": true,
          "okToMail": true,
          "okToSms": true
        },
        "financialInformation": {
          "hasForeseeableFinancialChanges": true,
          "expenseDetails": [
            {
              "expenseType": "RENT_PAID",
              "expenseAmount": 590.25,
              "frequency": "MONTHLY"
            }
          ],
          "incomeDetails": [
            {
              "incomeType": "DECLARED_FIXED",
              "fixedAmount": 7590.25,
              "variableAmount": 1590.25,
              "frequency": "MONTHLY",
              "otherIncomeDescription": "Rent"
            }
          ],
          "existingLoanDetails": [
            {
              "monthlyInstallmentAmount": 250.25,
              "outstandingBalanceAmount": 5000.25
            }
          ]
        },
        "education": {
          "highestEducationLevel": "MASTER",
          "yearOfGraduation": "2003",
          "studentId": "STID234567",
          "university": "NUS"
        },
        "employmentDetails": [
          {
            "employerName": "Citi Bank",
            "jobTitle": "POLITICIAN",
            "occupationCode": "ADMIN_SUPPORT_CLERICAL",
            "industryCode": "ENVIRONMENTAL_CONTROLS",
            "employmentDurationInYears": 5,
            "employmentDurationInMonths": 3,
            "employmentStatus": "EMPLOYED",
            "monthsInPreviousEmployment": 5,
            "yearsInPreviousEmployment": 4,
            "accountantName": "Javier",
            "accountantFirmName": "ACME",
            "yearsInIndustry": 5,
            "monthsInIndustry": 6
          }
        ],
        "identificationDocumentDetails": [
          {
            "idType": "PASSPORT",
            "idNumber": "S42258011",
            "idExpiryDate": "2027-04-11",
            "idIssueDate": "2017-04-12",
            "idIssuePlace": "SG",
            "idIssueState": "AM",
            "idIssueCountry": "SG",
            "isPrimaryId": true
          }
        ],
        "additionalData": {
          "numberOfDependents": "3",
          "staffIndicator": true,
          "businessNature": "TRAVEL_AGENCIES",
          "emergencyContactName": "Pearline",
          "emergencyContactPhoneNumber": "6164042321",
          "overLimitConsentFlag": true,
          "countrySpecificGroup": {
            "bumiputraIndicator": true,
            "disabilityIndicator": true,
            "unionPayCardNumber": "5555666600008888",
            "taxFileNumber": "656456737"
          },
          "referralGivenName": "Maxwell",
          "referralSurname": "Gate"
        },
        "partnerCustomerDetails": {
          "partnerCustomerInternalId": "ZOW9IO793855",
          "partnerCustomerId": "P011100000125"
        },
        "consentDetails": [
          {
            "consentType": "PDP_CONSENT",
            "isConsentGiven": true
          },
          {
            "consentType": "PARTNER_CONSENT",
            "isConsentGiven": true
          }
        ],
        "selfDeclaration": {
          "totalActiveCreditCardLimitAmount": 23000.25,
          "anticipatedIncomeDecreaseCode": "Yes",
          "loanTakenIndicator": true,
          "monthlyRepaymentForAllExtLoans": 5000.25
        },
        "kycInformation": {
          "selfPublicFigureDeclarationFlag": true,
          "publicFigureOfficeStatus": "Active",
          "publicFigureOfficeDetails": "Department of education and training",
          "publicFigureOfficeStartDate": "2017-04-12",
          "publicFigureOfficeEndDate": "2020-04-11",
          "isRelatedToSeniorPublicFigure": true,
          "relatedSeniorPublicFigureName": "Dan Lee",
          "relatedSpfCountryOfGovernment": "SG",
          "relatedSeniorPublicFigureDepartment": "Ministry",
          "relationshipWithSeniorPublicFigure": "Father",
          "relatedSeniorPublicFigureLastName": "Lee",
          "usTaxStatus": "EXCEPTED_NFFE",
          "usTaxId": "US234567"
        }
      },
    }

    const res = await auth.Onboarding.apply(data)

    assert.deepStrictEqual(res, mockResult)
  })
})
