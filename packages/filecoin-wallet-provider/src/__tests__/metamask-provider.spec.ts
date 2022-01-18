import { CoinType } from '@glif/filecoin-address'
import { Message } from '@glif/filecoin-message'
import { FilecoinSnapApi } from '@chainsafe/filsnap-types'
import { MetaMaskProvider } from '../providers/metamask-provider'
import { errors } from '../errors'
import { createPath, coinTypeCode } from '../utils/createPath'

const configureSpy = jest.fn()
const getAddressSpy = jest.fn().mockImplementation(() => 'f0123')
const signMessageSpy = jest.fn().mockImplementation(() => ({
  confirmed: true,
  error: null,
  signedMessage: {
    message: {},
    signature: {
      data: 'you are super deep in this right now. well done',
      type: 1,
    },
  },
}))
const signMessageRawSpy = jest.fn().mockImplementation(() => ({
  confirmed: true,
  error: null,
  signature: 'yoyoma',
}))

const mockSnap: FilecoinSnapApi = {
  getPublicKey: jest.fn(),
  getAddress: getAddressSpy,
  getBalance: jest.fn(),
  exportPrivateKey: jest.fn(),
  configure: configureSpy,
  signMessage: signMessageSpy,
  signMessageRaw: signMessageRawSpy,
  sendMessage: jest.fn(),
  getMessages: jest.fn(),
  calculateGasForMessage: jest.fn(),
}

const overrideMockSnap = (overrides: object): FilecoinSnapApi => ({
  ...mockSnap,
  ...overrides,
})

describe('metamask subprovider', () => {
  let subProvider: MetaMaskProvider

  beforeEach(() => {
    jest.clearAllMocks()
    subProvider = new MetaMaskProvider({ snap: mockSnap })
  })

  test('it has the right TYPE', () => {
    expect(subProvider.type).toBe('METAMASK')
  })

  test('it errors if no snap api is passed in the constructor', () => {
    try {
      // @ts-expect-error
      new MetaMaskProvider({})
    } catch (err) {
      expect(err instanceof errors.InvalidParamsError).toBe(true)
    }
  })

  describe('getAccounts', () => {
    test('it theoretically derives the right number of accounts', async () => {
      await subProvider.getAccounts(0, 5, CoinType.TEST)
      expect(configureSpy).toHaveBeenCalledTimes(5)
      configureSpy.mock.calls.forEach(([{ derivationPath }], i) =>
        expect(Number(derivationPath.split('/')[5])).toBe(Number(i)),
      )

      expect(getAddressSpy).toHaveBeenCalledTimes(5)
    })

    test('it derives accounts on the right network', async () => {
      await subProvider.getAccounts(0, 1, CoinType.TEST)
      expect(configureSpy).toHaveBeenCalledTimes(1)
      expect(configureSpy).toHaveBeenCalledWith({
        derivationPath: createPath(coinTypeCode(CoinType.TEST), 0),
      })

      jest.clearAllMocks()

      await subProvider.getAccounts(0, 1, CoinType.MAIN)
      expect(configureSpy).toHaveBeenCalledTimes(1)
      expect(configureSpy).toHaveBeenCalledWith({
        derivationPath: createPath(coinTypeCode(CoinType.MAIN), 0),
      })
    })

    test('it errors when the wrong account index params are passed', async () => {
      try {
        await subProvider.getAccounts(-1, 4, CoinType.TEST)
      } catch (err) {
        expect(err instanceof errors.InvalidParamsError).toBe(true)
      }
    })

    test('it errors when the wrong cointype is passed', async () => {
      try {
        // @ts-expect-error
        await subProvider.getAccounts(0, 4, 'd')
      } catch (err) {
        expect(err instanceof errors.InvalidParamsError).toBe(true)
      }
    })
  })

  describe('sign', () => {
    const value = '10'
    const nonce = 0
    const method = 0

    test('it signs a validly formed message', async () => {
      const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
      const message = new Message({
        from,
        to,
        value,
        method,
        nonce,
      })

      const sig = await subProvider.sign(from, message.toLotusType())

      expect(sig.Message.From).toBe(from)
      expect(sig.Message.To).toBe(to)
      expect(sig.Message.Value).toBe(value)
      expect(sig.Message.Nonce).toBe(nonce)
      expect(sig.Message.GasFeeCap).toBeDefined()
      expect(sig.Message.GasLimit).toBeDefined()
      expect(sig.Message.GasPremium).toBeDefined()
      expect(sig.Signature.Type).toBe(1)
      expect(typeof sig.Signature.Data).toBe('string')
      expect(sig.Signature.Data).toBeTruthy()
      expect(signMessageSpy).toHaveBeenCalled()
    })

    test('it throws a transaction reject error if there is no signature', async () => {
      const rejectedSignature = jest.fn().mockImplementation(() => ({
        signedMessage: null,
        error: null,
        confirmed: false,
      }))
      const mockSnapOverride = overrideMockSnap({
        signMessage: rejectedSignature,
      })

      const subProvider = new MetaMaskProvider({ snap: mockSnapOverride })
      const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
      const message = new Message({
        from,
        to,
        value,
        method,
        nonce,
      })

      try {
        await subProvider.sign(from, message.toLotusType())
      } catch (err) {
        expect(err instanceof errors.TransactionRejectedError).toBeTruthy()
      }
    })

    test('it calls the signMessageRaw when the message is not method 0 (send)', async () => {
      const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
      const message = new Message({
        from,
        to,
        value,
        method: 1,
        nonce,
      })

      const sig = await subProvider.sign(from, message.toLotusType())

      expect(sig.Message.From).toBe(from)
      expect(sig.Message.To).toBe(to)
      expect(sig.Message.Value).toBe(value)
      expect(sig.Message.Nonce).toBe(nonce)
      expect(sig.Message.GasFeeCap).toBeDefined()
      expect(sig.Message.GasLimit).toBeDefined()
      expect(sig.Message.GasPremium).toBeDefined()
      expect(sig.Signature.Type).toBe(1)
      expect(typeof sig.Signature.Data).toBe('string')
      expect(sig.Signature.Data).toBeTruthy()
      expect(signMessageSpy).not.toHaveBeenCalled()
      expect(signMessageRawSpy).toHaveBeenCalled()
    })

    test('it calls the signMessageRaw when the message is method 0 and there are params', async () => {
      const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
      const message = new Message({
        from,
        to,
        value,
        method: 0,
        nonce,
        params: 'ejwhioah',
      })

      const sig = await subProvider.sign(from, message.toLotusType())

      expect(sig.Message.From).toBe(from)
      expect(sig.Message.To).toBe(to)
      expect(sig.Message.Value).toBe(value)
      expect(sig.Message.Nonce).toBe(nonce)
      expect(sig.Message.GasFeeCap).toBeDefined()
      expect(sig.Message.GasLimit).toBeDefined()
      expect(sig.Message.GasPremium).toBeDefined()
      expect(sig.Signature.Type).toBe(1)
      expect(typeof sig.Signature.Data).toBe('string')
      expect(sig.Signature.Data).toBeTruthy()
      expect(signMessageSpy).not.toHaveBeenCalled()
      expect(signMessageRawSpy).toHaveBeenCalled()
    })

    test('it throws a transaction reject error when signMessageRaw returns no signature ', async () => {
      const rejectedSignature = jest.fn().mockImplementation(() => ({
        signature: null,
        error: null,
        confirmed: false,
      }))
      const mockSnapOverride = overrideMockSnap({
        signMessage: rejectedSignature,
      })

      const subProvider = new MetaMaskProvider({ snap: mockSnapOverride })

      const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
      const message = new Message({
        from,
        to,
        value,
        method: 1,
        nonce,
        params: 'ejwhioah',
      })
      try {
        await subProvider.sign(from, message.toLotusType())
      } catch (err) {
        expect(err instanceof errors.TransactionRejectedError).toBeTruthy()
      }
    })
  })
})
