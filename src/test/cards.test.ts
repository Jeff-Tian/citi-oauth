import assert = require('assert')
import CitiOAuth from '../index'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('citi cards', () => {
  describe('card list', () => {
    let mockResult = {
      cardDetails: {
        cardId:
          '3255613852316f2b4d4d796c344e38756339654972776f663745446e6d4c32486f455a4165374a476858343d',
        displayCardNumber: 'XXXXXXXXXXXX4521',
        localCardActivationIndicator: 'ACTIVE',
        overseasCardActivationIndicator: 'ACTIVE',
        perpetualActivationFlag: true,
        overseasCardActivationStartDate: '2016-11-01',
        overseasCardActivationEndDate: '2016-12-05',
        currentCreditLimitAmount: 3500.25,
        maximumPermanentCreditLimitAmount: 5000.25,
        maximumTemporaryCreditLimitAmount: 5000.25,
        subCardType: 'DEBIT',
        cardHolderType: 'PRIMARY',
        cardIssueReason: 'NEWLY_ONBOARDED_CARD',
        cardFunctionsAllowed: {
          cardFunction: 'CREDIT_LIMIT_INCREASE',
        },
      },
    }

    let mock: MockAdapter
    before(() => {
      mock = new MockAdapter(axios)

      mock
        .onGet(/^https:\/\/sandbox\.apihub\.citi\.com\/gcb\/api\/v1\/cards.+/)
        .replyOnce(200, mockResult)

      after(mock.restore)
    })
    const auth = new CitiOAuth('xxx', 'yyy', 'http://diveintonode.org/')

    it('should get cards', async () => {
      const res = await auth.Cards.getCards('xxx')

      assert.deepStrictEqual(res, mockResult)
    })
  })
})
