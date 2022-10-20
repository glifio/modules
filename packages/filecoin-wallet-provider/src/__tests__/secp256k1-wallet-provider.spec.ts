import { CoinType } from '@glif/filecoin-address'
import { Message } from '@glif/filecoin-message'
import { SECP256K1KeyProvider } from '../providers/single-key-provider'
import { errors } from '../errors'

describe('single key secp256k1 wallet subprovider', () => {
  // these were derived in the Glif UI with WASM and the same pk as below
  const mainnetCoinTypeAccount = 'f1d2xrzcslx7xlbbylc5c3d5lvandqw4iwl6epxba'
  const testnetCoinTypeAccount = 't1d2xrzcslx7xlbbylc5c3d5lvandqw4iwl6epxba'
  const privateKey = '8VcW07ADswS4BV2cxi5rnIadVsyTDDhY1NfDH19T8Uo='

  let subProvider: SECP256K1KeyProvider

  beforeEach(() => {
    subProvider = new SECP256K1KeyProvider(privateKey)
  })

  test('it has the right TYPE', () => {
    expect(subProvider.type).toBe('SINGLE_KEY_SECP256K1')
  })

  // this throws a JS runtime err...
  test.skip('the pk is not accessible from the outside', () => {
    // expect(subProvider.#privateKey).toBeUndefined()
  })

  describe('getAccounts', () => {
    test('it derives accounts on the right network', async () => {
      const testAccount = await subProvider.getAccounts(0, 1, CoinType.TEST)
      expect(testAccount[0]).toBe(testnetCoinTypeAccount)
      expect(testAccount[0][0]).toBe('t')

      const prodAccount = await subProvider.getAccounts(0, 1, CoinType.MAIN)
      expect(prodAccount[0]).toBe(mainnetCoinTypeAccount)
      expect(prodAccount[0][0]).toBe('f')
    })
    test('it errors when the wrong cointype is passed', async () => {
      try {
        // @ts-expect-error
        await subProvider.getAccounts(0, 4, 'd')
      } catch (err) {
        expect(err instanceof errors.InvalidParamsError).toBe(true)
      }
    })

    test('it errors if no private key is passed in the constructor', () => {
      try {
        // @ts-expect-error
        new SECP256K1KeyProvider()
      } catch (err) {
        expect(err instanceof errors.InvalidParamsError).toBe(true)
      }
    })
  })

  describe('keyDerive', () => {
    test('it returns the private key', async () => {
      expect(await subProvider.keyDerive('')).toBe(privateKey)
    })
  })

  describe('hex key', () => {
    test('it derives the right address from a hex key', async () => {
      const fromHex = new SECP256K1KeyProvider(
        '8182b5bf5b9c966e001934ebaf008f65516290cef6e3069d11e718cbd4336aae',
        'hex'
      )

      const [account] = await fromHex.getAccounts(0, 1, CoinType.MAIN)
      expect(account).toBe('f1gs7o2r4xqtxgmsqy4naytwpvhzrgpytiwc6fnsa')
    })
  })

  describe('sign', () => {
    const value = '10'
    const nonce = 0
    const method = 0

    test('it signs a validly formed message', async () => {
      const [from] = await subProvider.getAccounts(0, 2, CoinType.TEST)
      const message = new Message({
        from,
        to: from,
        value,
        method,
        nonce
      })

      const sig = await subProvider.sign(from, message.toLotusType())

      expect(sig.Message.From).toBe(from)
      expect(sig.Message.To).toBe(from)
      expect(sig.Message.Value).toBe(value)
      expect(sig.Message.Nonce).toBe(nonce)
      expect(sig.Message.GasFeeCap).toBeDefined()
      expect(sig.Message.GasLimit).toBeDefined()
      expect(sig.Message.GasPremium).toBeDefined()
      expect(sig.Signature.Type).toBe(1)
      expect(sig.Signature.Data).toBe(
        'ELCUyw9QZN8xhhJn9Vyc2XNKdQWZ/w8aG9dE1yGRl3NhdSIrRGms23nAYpMUOcKIlcm269IlNxAoXdvKVMVLJQA='
      )
    })

    test('it rejects if the from address mismatches the from address of the message', async () => {
      try {
        const [from] = await subProvider.getAccounts(0, 2, CoinType.TEST)
        const message = new Message({
          from,
          to: testnetCoinTypeAccount,
          value,
          method,
          nonce
        })

        await subProvider.sign(testnetCoinTypeAccount, message.toLotusType())
      } catch (err) {
        expect(err instanceof errors.InvalidParamsError).toBe(true)
      }
    })

    test('it rejects if the message is poorly formed', async () => {
      const [from] = await subProvider.getAccounts(0, 0, CoinType.TEST)

      try {
        // @ts-expect-error
        await subProvider.sign(from, { From: testnetCoinTypeAccount })
      } catch (err) {
        expect(err instanceof errors.InvalidParamsError).toBe(true)
      }
    })
  })
})
