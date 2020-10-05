const Filecoin = require('../dist').default
const { FilecoinNumber } = require('@openworklabs/filecoin-number')
const { Message } = require('@openworklabs/filecoin-message')
const CID = require('cids')
const { KNOWN_TYPE_0_ADDRESS } = require('../dist/utils/knownAddresses')

const testSubProviderInstance = {
  getAccounts: jest.fn().mockImplementation(() => {}),
  sign: jest.fn().mockImplementation(() => {}),
}

describe('provider', () => {
  let filecoin
  beforeAll(async () => {
    filecoin = new Filecoin(testSubProviderInstance, {
      apiAddress: 'https://node.glif.io/space04/lotus/rpc/v0',
    })
  })

  describe('constructor', () => {
    beforeEach(jest.clearAllMocks)

    test('should create Filecoin object', async () => {
      expect(filecoin).toBeInstanceOf(Filecoin)
      expect(filecoin.wallet).toBeTruthy()
      expect(filecoin.wallet.getAccounts).toBeTruthy()
      expect(filecoin.jsonRpcEngine).toBeTruthy()
      expect(filecoin.jsonRpcEngine.request).toBeTruthy()
    })

    test('should throw when not passed a provider', async () => {
      expect(() => {
        new Filecoin()
      }).toThrow()
    })
  })

  describe('getBalance', () => {
    beforeEach(jest.clearAllMocks)

    test('should call WalletBalance with address', async () => {
      const balance = await filecoin.getBalance(KNOWN_TYPE_0_ADDRESS['t'])
      expect(balance.isGreaterThanOrEqualTo(0)).toBeTruthy()
    })

    test('should return an instance of filecoin number', async () => {
      const balance = await filecoin.getBalance(KNOWN_TYPE_0_ADDRESS['t'])
      expect(balance instanceof FilecoinNumber).toBeTruthy()
    })

    test('should throw when a bad address is passed', async () => {
      await expect(filecoin.getBalance('r011')).rejects.toThrow()
    })

    test('should throw when an object is passed as an address', async () => {
      expect(filecoin.getBalance({ key: 'val' })).rejects.toThrow()
    })

    test('should throw when null is passed as an address', async () => {
      expect(filecoin.getBalance(null)).rejects.toThrow()
    })
  })

  describe('sendMessage', () => {
    beforeEach(jest.clearAllMocks)

    test('should throw with the wrong number of params', async () => {
      await expect(filecoin.sendMessage()).rejects.toThrow()

      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS['t'],
        from: KNOWN_TYPE_0_ADDRESS['t'],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      await expect(
        filecoin.sendMessage(message.toLotusType()),
      ).rejects.toThrow()
    })

    test('should return the tx CID', async () => {
      const nonce = await filecoin.getNonce(KNOWN_TYPE_0_ADDRESS['t'])
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS['t'],
        from: KNOWN_TYPE_0_ADDRESS['t'],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce,
      })

      const msgWithGas = await filecoin.gasEstimateMessageGas(
        message.toLotusType(),
      )

      const { Signature } = await filecoin.jsonRpcEngine.request(
        'WalletSignMessage',
        KNOWN_TYPE_0_ADDRESS['t'],
        msgWithGas,
      )

      const tx = await filecoin.sendMessage(msgWithGas, Signature.Data)
      const cid = new CID(tx['/'])
      expect(CID.isCID(cid)).toBe(true)
    })
  })

  describe('getNonce', () => {
    beforeEach(jest.clearAllMocks)

    test('should throw if an invalid address is provided', async () => {
      await expect(filecoin.getNonce('e01')).rejects.toThrow()
      await expect(filecoin.getNonce()).rejects.toThrow()
    })

    test('should return a number', async () => {
      const nonce = await filecoin.getNonce('t080')
      expect(typeof nonce === 'number').toBe(true)
    })

    test('should return 0 if the error received is actor error', async () => {
      const nonce = await filecoin.getNonce('t01234567123456')
      expect(nonce).toBe(0)
    })
  })

  describe('gas API', () => {
    describe('gasEstimateFeeCap', () => {
      test('it should return a filecoin number object, greater than 0', async () => {
        const res = await filecoin.gasEstimateFeeCap({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          GasLimit: 1000000,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        expect(res instanceof FilecoinNumber).toBe(true)
        expect(res.isGreaterThan(0)).toBe(true)
      })

      test('it should return a filecoin number object, greater than 0 when no gas limit is passed', async () => {
        const res = await filecoin.gasEstimateFeeCap({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        expect(res instanceof FilecoinNumber).toBe(true)
        expect(res.isGreaterThan(0)).toBe(true)
      })

      test('it should fail if no or an invalid Lotus message is passed', async () => {
        await expect(
          filecoin.gasEstimateFeeCap({
            To:
              't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          }),
        ).rejects.toThrow()

        await expect(filecoin.gasEstimateFeeCap()).rejects.toThrow()
      })
    })

    describe('gasEstimateGasLimit', () => {
      test('it should return a gas limit, instance of filecoin number', async () => {
        const res = await filecoin.gasEstimateGasLimit({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        expect(res instanceof FilecoinNumber).toBe(true)
        expect(res.isGreaterThan(0)).toBe(true)
      })

      test('it should throw when no or an invalid message is passed', async () => {
        await expect(
          filecoin.gasEstimateGasLimit({
            To:
              't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          }),
        ).rejects.toThrow()

        await expect(filecoin.gasEstimateGasLimit()).rejects.toThrow()
      })
    })

    describe('gasEstimateGasPremium', () => {
      test('it returns a gas premium filecoin number instance', async () => {
        const res = await filecoin.gasEstimateGasPremium({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          GasLimit: 1000000,
          Method: 0,
          Params: [],
        })

        expect(res instanceof FilecoinNumber).toBe(true)
        expect(res.isGreaterThan(0)).toBe(true)
      })

      test('it returns a gas premium filecoin number instance when no gas limit is passed', async () => {
        const res = await filecoin.gasEstimateGasPremium({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        expect(res instanceof FilecoinNumber).toBe(true)
        expect(res.isGreaterThan(0)).toBe(true)
      })

      test('it throws when no message is passed', async () => {
        await expect(filecoin.gasEstimateGasPremium()).rejects.toThrow()
      })
    })

    describe('gasEstimateMessageGas', () => {
      test('it returns a filecoin message instance, with all gas fields filled in', async () => {
        const message = await filecoin.gasEstimateMessageGas({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        expect(message instanceof Message).toBe(true)
        const lotusMsg = message.toLotusType()
        expect(lotusMsg.GasLimit).toBeTruthy()
        expect(lotusMsg.GasPremium).toBeTruthy()
        expect(lotusMsg.GasFeeCap).toBeTruthy()
      })

      test('it returns the message with the same from address', async () => {
        const message = await filecoin.gasEstimateMessageGas({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        const lotusMsg = message.toLotusType()
        expect(lotusMsg.From).toBe(
          't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
        )
      })

      test('it throws when no or an invalid message is passed', async () => {
        await expect(
          filecoin.gasEstimateMessageGas({
            To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          }),
        ).rejects.toThrow()

        await expect(filecoin.gasEstimateMessageGas()).rejects.toThrow()
      })

      test('it attaches the right network prefix to the from and to address', async () => {
        const message = await filecoin.gasEstimateMessageGas({
          To: 'f1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
          From:
            'f3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
          Nonce: 0,
          Value: '1000',
          Method: 0,
          Params: [],
        })

        const lotusMsg = message.toLotusType()
        expect(lotusMsg.From).toBe(
          'f3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
        )
        expect(lotusMsg.To).toBe('f1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei')
      })
    })
  })

  describe('cloneMsgWOnChainFromAddr', () => {
    let unknownFromAddr = ''
    beforeAll(async () => {
      unknownFromAddr = await filecoin.jsonRpcEngine.request('WalletNew', 1)
    })
    test('it attaches a known actor address when the From address does not exist on chain', async () => {
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS['t'],
        from: unknownFromAddr,
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      const clonedMsg = await filecoin.cloneMsgWOnChainFromAddr(
        message.toLotusType(),
      )

      expect(clonedMsg.From).toBeTruthy()
      expect(clonedMsg.From).not.toBe(unknownFromAddr)
    })

    test('it does not change from address when it already exists on chain', async () => {
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS['t'],
        from: KNOWN_TYPE_0_ADDRESS['t'],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      const clonedMsg = await filecoin.cloneMsgWOnChainFromAddr(
        message.toLotusType(),
      )

      expect(clonedMsg.From).toBeTruthy()
      expect(clonedMsg.From).toBe(KNOWN_TYPE_0_ADDRESS['t'])
    })

    test('it does not mutate the original object', async () => {
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS['t'],
        from: unknownFromAddr,
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      const msg = message.toLotusType()
      await filecoin.cloneMsgWOnChainFromAddr(msg)

      expect(msg.From).toBe(unknownFromAddr)
    })
  })
})
