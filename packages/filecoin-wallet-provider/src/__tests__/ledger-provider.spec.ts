import { CoinType } from '@glif/filecoin-address'
import { Message } from '@glif/filecoin-message'
import { LedgerProvider } from '../providers/ledger-provider'
import { errors } from '../errors'

describe('ledger wallet subprovider', () => {
  let subProvider: LedgerProvider

  beforeEach(() => {})

  test('it has the right TYPE', () => {
    expect(subProvider.type).toBe('LEDGER')
  })

  // this throws a JS runtime err...
  test.skip('the seed is not accessible from the outside', () => {
    // expect(subProvider.#seed).toBeUndefined()
  })

  // describe('getAccounts', () => {
  //   test('it derives the right number of accounts', async () => {
  //     const singleAccount = await subProvider.getAccounts(0, 1, CoinType.TEST)
  //     expect(singleAccount.length).toBe(1)
  //     expect(singleAccount[0]).toBe(testnetCoinTypeAccounts[0])

  //     const fiveAccounts = await subProvider.getAccounts(0, 5, CoinType.TEST)
  //     expect(fiveAccounts.length).toBe(5)
  //     fiveAccounts.forEach((a, i) => {
  //       expect(a).toBe(testnetCoinTypeAccounts[i])
  //     })
  //   })

  //   test('it derives accounts on the right network', async () => {
  //     const testAccount = await subProvider.getAccounts(0, 1, CoinType.TEST)
  //     expect(testAccount[0]).toBe(testnetCoinTypeAccounts[0])
  //     expect(testAccount[0][0]).toBe('t')

  //     const prodAccount = await subProvider.getAccounts(0, 1, CoinType.MAIN)
  //     expect(prodAccount[0]).toBe(mainnetCoinTypeAccounts[0])
  //     expect(prodAccount[0][0]).toBe('f')
  //   })

  //   test('it errors when the wrong account index params are passed', async () => {
  //     try {
  //       await subProvider.getAccounts(-1, 4, CoinType.TEST)
  //     } catch (err) {
  //       expect(err instanceof errors.InvalidParamsError).toBe(true)
  //     }
  //   })

  //   test('it errors when the wrong cointype is passed', async () => {
  //     try {
  //       // @ts-expect-error
  //       await subProvider.getAccounts(0, 4, 'd')
  //     } catch (err) {
  //       expect(err instanceof errors.InvalidParamsError).toBe(true)
  //     }
  //   })

  //   test('it errors if no seed is passed in the constructor', () => {
  //     try {
  //       // @ts-expect-error
  //       new HDWalletProvider()
  //     } catch (err) {
  //       expect(err instanceof errors.InvalidParamsError).toBe(true)
  //     }
  //   })
  // })

  // describe('sign', () => {
  //   const value = '10'
  //   const nonce = 0
  //   const method = 0

  //   test('it signs a validly formed message', async () => {
  //     const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
  //     const message = new Message({
  //       from,
  //       to,
  //       value,
  //       method,
  //       nonce,
  //     })

  //     const sig = await subProvider.sign(from, message.toLotusType())

  //     expect(sig.Message.From).toBe(from)
  //     expect(sig.Message.To).toBe(to)
  //     expect(sig.Message.Value).toBe(value)
  //     expect(sig.Message.Nonce).toBe(nonce)
  //     expect(sig.Message.GasFeeCap).toBeDefined()
  //     expect(sig.Message.GasLimit).toBeDefined()
  //     expect(sig.Message.GasPremium).toBeDefined()
  //     expect(sig.Signature.Type).toBe(1)
  //     expect(sig.Signature.Data).toBe(
  //       'NHdmTmLwa/jn+7ZAK5MCcuC7YCsc5F/fyEosIBKiuJcR0kjk75wD25ETexFXZe6AdAd7ee/CWy3ExDkZiEQIaQE=',
  //     )
  //   })

  //   test('it rejects if the from address has not been derived yet', async () => {
  //     try {
  //       const message = new Message({
  //         from: testnetCoinTypeAccounts[0],
  //         to: testnetCoinTypeAccounts[1],
  //         value,
  //         method,
  //         nonce,
  //       })

  //       await subProvider.sign(
  //         testnetCoinTypeAccounts[0],
  //         message.toLotusType(),
  //       )
  //     } catch (err) {
  //       expect(err instanceof errors.WalletProviderError).toBe(true)
  //     }
  //   })

  //   test('it rejects if the from address mismatches the from address of the message', async () => {
  //     try {
  //       const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
  //       const message = new Message({
  //         from,
  //         to,
  //         value,
  //         method,
  //         nonce,
  //       })

  //       await subProvider.sign(to, message.toLotusType())
  //     } catch (err) {
  //       expect(err instanceof errors.InvalidParamsError).toBe(true)
  //     }
  //   })

  //   test('it rejects if the message is poorly formed', async () => {
  //     const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)

  //     try {
  //       // @ts-expect-error
  //       await subProvider.sign(from, { From: from })
  //     } catch (err) {
  //       expect(err instanceof errors.InvalidParamsError).toBe(true)
  //     }
  //   })
  // })
})
