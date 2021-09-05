import { Filecoin } from '../filecoin'
import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'
import { Message } from '@glif/filecoin-message'
import CID from 'cids'
import {
  allCallsExitWithCode0,
  computeGasToBurn,
  KNOWN_TYPE_0_ADDRESS,
  KNOWN_TYPE_1_ADDRESS,
} from '../utils'
import { Network } from '@glif/filecoin-address'
import { InvocResult } from '../types'

const testSubProviderInstance = {
  getAccounts: jest.fn().mockImplementation(() => {}),
  sign: jest.fn().mockImplementation(() => {}),
}

describe('provider', () => {
  let filecoin: Filecoin
  beforeAll(async () => {
    filecoin = new Filecoin(testSubProviderInstance, {
      apiAddress: 'https://node.glif.io/space07/lotus/rpc/v0',
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
        // @ts-ignore
        return new Filecoin()
      }).toThrow()
    })
  })

  describe('getBalance', () => {
    beforeEach(jest.clearAllMocks)

    test('should call WalletBalance with address', async () => {
      const balance = await filecoin.getBalance(
        KNOWN_TYPE_0_ADDRESS[Network.TEST],
      )
      expect(balance.isGreaterThanOrEqualTo(0)).toBeTruthy()
    })

    test('should return an instance of filecoin number', async () => {
      const balance = await filecoin.getBalance(
        KNOWN_TYPE_0_ADDRESS[Network.TEST],
      )
      expect(balance instanceof FilecoinNumber).toBeTruthy()
    })

    test('should throw when a bad address is passed', async () => {
      await expect(filecoin.getBalance('r011')).rejects.toThrow()
    })

    test('should throw when an object is passed as an address', async () => {
      // @ts-ignore
      await expect(filecoin.getBalance({ key: 'val' })).rejects.toThrow()
    })

    test('should throw when null is passed as an address', async () => {
      // @ts-ignore
      await expect(filecoin.getBalance(null)).rejects.toThrow()
    })
  })

  describe('sendMessage', () => {
    beforeEach(jest.clearAllMocks)

    test('should throw with the wrong number of params', async () => {
      // @ts-ignore
      await expect(filecoin.sendMessage()).rejects.toThrow()

      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS[Network.TEST],
        from: KNOWN_TYPE_0_ADDRESS[Network.TEST],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      // @ts-ignore
      const sendMessage = filecoin.sendMessage(message.toLotusType())
      await expect(sendMessage).rejects.toThrow()
    })

    test.skip('should return the tx CID', async () => {
      const nonce = await filecoin.getNonce(KNOWN_TYPE_0_ADDRESS[Network.TEST])
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS[Network.TEST],
        from: KNOWN_TYPE_0_ADDRESS[Network.TEST],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce,
      })

      const msgWithGas = await filecoin.gasEstimateMessageGas(
        message.toLotusType(),
      )

      const { Signature } = await filecoin.jsonRpcEngine.request(
        'WalletSignMessage',
        KNOWN_TYPE_0_ADDRESS[Network.TEST],
        msgWithGas,
      )

      // @ts-ignore
      const tx = await filecoin.sendMessage(msgWithGas, Signature.Data)
      const cid = new CID(tx['/'])
      expect(CID.isCID(cid)).toBe(true)
    })
  })

  describe('simulateMessage', () => {
    test('it should return true for a valid message', async () => {
      const message = new Message({
        to: 'f1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
        from: 'f1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })
      const valid = await filecoin.simulateMessage(message.toLotusType())

      expect(valid).toBeTruthy()
    })

    test('it should return false for an invalid message', async () => {
      const message = new Message({
        to: 'f034066',
        from: 'f1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
        value: '0',
        method: 2,
        nonce: 0,
        params: 'hEQAkooCQAVYGIJVAWw6rTHy7RkyBG6q8O/jwN4sL9OT9A==',
      })
      const valid = await filecoin.simulateMessage(message.toLotusType())

      expect(valid).toBeFalsy()
    })

    test('allCallsExitWithCode0 finds nonzero execution calls and returns false', () => {
      const invalidCall: InvocResult = {
        MsgCid: {
          '/': 'bafy2bzacedkkh57vsdngemo4xtgpo5vnfm65o5xfnqkj3iqc6matzrdpwejni',
        },
        Msg: {
          Version: 0,
          To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
          From: 't1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
          Nonce: 26,
          Value: '0',
          GasLimit: 10000000000,
          GasFeeCap: '0',
          GasPremium: '0',
          Method: 2,
          Params:
            'hFUCey0uma1LsJp4RXNaZT8rjXeBryBABVgYglUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
          CID: {
            '/':
              'bafy2bzacedkkh57vsdngemo4xtgpo5vnfm65o5xfnqkj3iqc6matzrdpwejni',
          },
        },
        MsgRct: {
          ExitCode: 0,
          Return: 'hAH1EkA=',
          GasUsed: 0,
        },
        GasCost: {
          Message: null,
          GasUsed: '0',
          BaseFeeBurn: '0',
          OverEstimationBurn: '0',
          MinerPenalty: '0',
          MinerTip: '0',
          Refund: '0',
          TotalCost: '0',
        },
        ExecutionTrace: {
          Msg: {
            Version: 0,
            To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
            From: 't1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
            Nonce: 26,
            Value: '0',
            GasLimit: 10000000000,
            GasFeeCap: '0',
            GasPremium: '0',
            Method: 2,
            Params:
              'hFUCey0uma1LsJp4RXNaZT8rjXeBryBABVgYglUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
            CID: {
              '/':
                'bafy2bzacedkkh57vsdngemo4xtgpo5vnfm65o5xfnqkj3iqc6matzrdpwejni',
            },
          },
          MsgRct: {
            ExitCode: 0,
            Return: 'hAH1EkA=',
            GasUsed: 3413871,
          },
          Error: '',
          Duration: 394016,
          GasCharges: null,
          Subcalls: [
            {
              Msg: {
                Version: 0,
                To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
                From: 't05376',
                Nonce: 0,
                Value: '0',
                GasLimit: 10000000000,
                GasFeeCap: '0',
                GasPremium: '0',
                Method: 5,
                Params: 'glUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
                CID: {
                  '/':
                    'bafy2bzacec6dvnfywjfmoml4prnpcjvotl4degrtmtdpzv3udd6lc76rgiff4',
                },
              },
              MsgRct: {
                ExitCode: 18,
                Return: null,
                GasUsed: 2386357,
              },
              Error: 't02357 is already a signer (RetCode=18)',
              Duration: 85358,
              GasCharges: null,
              Subcalls: null,
            },
          ],
        },
        Error: '',
        Duration: 394177,
      }

      expect(allCallsExitWithCode0(invalidCall)).toBe(false)
    })

    test('allCallsExitWithCode0 finds nonzero execution calls and returns false', () => {
      const invalidCall: InvocResult = {
        MsgCid: {
          '/': 'bafy2bzacedkkh57vsdngemo4xtgpo5vnfm65o5xfnqkj3iqc6matzrdpwejni',
        },
        Msg: {
          Version: 0,
          To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
          From: 't1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
          Nonce: 26,
          Value: '0',
          GasLimit: 10000000000,
          GasFeeCap: '0',
          GasPremium: '0',
          Method: 2,
          Params:
            'hFUCey0uma1LsJp4RXNaZT8rjXeBryBABVgYglUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
          CID: {
            '/':
              'bafy2bzacedkkh57vsdngemo4xtgpo5vnfm65o5xfnqkj3iqc6matzrdpwejni',
          },
        },
        MsgRct: {
          ExitCode: 0,
          Return: 'hAH1EkA=',
          GasUsed: 0,
        },
        GasCost: {
          Message: null,
          GasUsed: '0',
          BaseFeeBurn: '0',
          OverEstimationBurn: '0',
          MinerPenalty: '0',
          MinerTip: '0',
          Refund: '0',
          TotalCost: '0',
        },
        ExecutionTrace: {
          Msg: {
            Version: 0,
            To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
            From: 't1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a',
            Nonce: 26,
            Value: '0',
            GasLimit: 10000000000,
            GasFeeCap: '0',
            GasPremium: '0',
            Method: 2,
            Params:
              'hFUCey0uma1LsJp4RXNaZT8rjXeBryBABVgYglUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
            CID: {
              '/':
                'bafy2bzacedkkh57vsdngemo4xtgpo5vnfm65o5xfnqkj3iqc6matzrdpwejni',
            },
          },
          MsgRct: {
            ExitCode: 0,
            Return: 'hAH1EkA=',
            GasUsed: 3413871,
          },
          Error: '',
          Duration: 394016,
          GasCharges: null,
          Subcalls: [
            {
              Msg: {
                Version: 0,
                To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
                From: 't05376',
                Nonce: 0,
                Value: '0',
                GasLimit: 10000000000,
                GasFeeCap: '0',
                GasPremium: '0',
                Method: 5,
                Params: 'glUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
                CID: {
                  '/':
                    'bafy2bzacec6dvnfywjfmoml4prnpcjvotl4degrtmtdpzv3udd6lc76rgiff4',
                },
              },
              MsgRct: {
                ExitCode: 0,
                Return: null,
                GasUsed: 2386357,
              },
              Error: 't02357 is already a signer (RetCode=18)',
              Duration: 85358,
              GasCharges: null,
              Subcalls: [
                {
                  Msg: {
                    Version: 0,
                    To: 't2pmws5gnnjoyju6cfonngkpzlrv3ydlzar6oqdrq',
                    From: 't05376',
                    Nonce: 0,
                    Value: '0',
                    GasLimit: 10000000000,
                    GasFeeCap: '0',
                    GasPremium: '0',
                    Method: 5,
                    Params: 'glUBbDqtMfLtGTIEbqrw7+PA3iwv05P0',
                    CID: {
                      '/':
                        'bafy2bzacec6dvnfywjfmoml4prnpcjvotl4degrtmtdpzv3udd6lc76rgiff4',
                    },
                  },
                  MsgRct: {
                    ExitCode: 18,
                    Return: null,
                    GasUsed: 2386357,
                  },
                  Error: 't02357 is already a signer (RetCode=18)',
                  Duration: 85358,
                  GasCharges: null,
                  Subcalls: null,
                },
              ],
            },
          ],
        },
        Error: '',
        Duration: 394177,
      }

      expect(allCallsExitWithCode0(invalidCall)).toBe(false)
    })
  })

  describe('getNonce', () => {
    beforeEach(jest.clearAllMocks)

    test('should throw if an invalid address is provided', async () => {
      await expect(filecoin.getNonce('e01')).rejects.toThrow()
      // @ts-ignore
      await expect(filecoin.getNonce()).rejects.toThrow()
    })

    test('should return a number', async () => {
      const nonce = await filecoin.getNonce(KNOWN_TYPE_0_ADDRESS[Network.TEST])
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
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
        const gasEstimateFeeCap = filecoin.gasEstimateFeeCap({
          To:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
        })
        await expect(gasEstimateFeeCap).rejects.toThrow()

        // @ts-ignore
        await expect(filecoin.gasEstimateFeeCap()).rejects.toThrow()
      })
    })

    describe('gasEstimateGasLimit', () => {
      test('it should return a gas limit, instance of filecoin number', async () => {
        // @ts-ignore
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
        // @ts-ignore
        const gasEstimateGasLimit = filecoin.gasEstimateGasLimit({
          To:
            't3sjc7xz3vs67hdya2cbbp6eqmihfrtidhnfjqjlntokwx5trfl5zvf7ayxnbfcexg64nqpodxhsxcdiu7lqtq',
        })
        await expect(gasEstimateGasLimit).rejects.toThrow()

        // @ts-ignore
        await expect(filecoin.gasEstimateGasLimit()).rejects.toThrow()
      })
    })

    describe('gasEstimateGasPremium', () => {
      test('it returns a gas premium filecoin number instance', async () => {
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
        await expect(filecoin.gasEstimateGasPremium()).rejects.toThrow()
      })
    })

    describe('gasEstimateMessageGas', () => {
      test('it returns a filecoin message instance, with all gas fields filled in', async () => {
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
        const gasEstimateMessageGas = filecoin.gasEstimateMessageGas({
          To: 't1hvuzpfdycc6z6mjgbiyaiojikd6wk2vwy7muuei',
        })
        await expect(gasEstimateMessageGas).rejects.toThrow()

        // @ts-ignore
        await expect(filecoin.gasEstimateMessageGas()).rejects.toThrow()
      })

      test('it attaches the right network prefix to the from and to address', async () => {
        // @ts-ignore
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
    const unknownFromAddr = 'f1p2bkuq7inahavovyaxkcpuk6kucfmjtixutd3jq'
    test('it attaches a known actor address when the From address does not exist on chain', async () => {
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS[Network.TEST],
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
        to: KNOWN_TYPE_0_ADDRESS[Network.TEST],
        from: KNOWN_TYPE_0_ADDRESS[Network.TEST],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      const clonedMsg = await filecoin.cloneMsgWOnChainFromAddr(
        message.toLotusType(),
      )

      expect(clonedMsg.From).toBeTruthy()
      expect(clonedMsg.From).toBe(KNOWN_TYPE_0_ADDRESS[Network.TEST])
    })

    test('it does not mutate the original object', async () => {
      const message = new Message({
        to: KNOWN_TYPE_0_ADDRESS[Network.TEST],
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

  describe('gasCalcTxFee', () => {
    test('it returns a FilecoinNumber representing the transaction fee paid by the sender', async () => {
      const gasUsed = '435268'
      const gasLimit = 541585
      const baseFee = '957893300'
      const gasFeeCap = '10076485367'
      const gasPremium = '136364'

      const fee = await filecoin.gasCalcTxFee(
        gasFeeCap,
        gasPremium,
        gasLimit,
        baseFee,
        gasUsed,
      )

      expect(fee.toAttoFil()).toBe('431705363143440')
    })

    test('it returns a FilecoinNumber representing the transaction fee paid by the sender (2)', async () => {
      const gasUsed = '8092030'
      const gasLimit = 10115037
      const baseFee = '100'
      const gasFeeCap = '150825'
      const gasPremium = '149771'

      const fee = await filecoin.gasCalcTxFee(
        gasFeeCap,
        gasPremium,
        gasLimit,
        baseFee,
        gasUsed,
      )

      expect(fee.toAttoFil()).toBe('1515778754527')
    })

    test('it returns a FilecoinNumber representing the transaction fee paid by the sender (3)', async () => {
      const gasUsed = '44955257'
      const gasLimit = 55745321
      const baseFee = '1089215916'
      const gasFeeCap = '896936264'
      const gasPremium = '116155'

      const fee = await filecoin.gasCalcTxFee(
        gasFeeCap,
        gasPremium,
        gasLimit,
        baseFee,
        gasUsed,
      )

      expect(fee.toAttoFil()).toBe('41677092465327312')
    })
  })

  describe('computeGasToBurn', () => {
    test('it computes the overestimation burn', () => {
      const gasLimit = 541585
      const gasUsed = 435268
      expect(
        computeGasToBurn(
          new BigNumber(gasUsed),
          new BigNumber(gasLimit),
        ).toString(),
      ).toBe('15337')
    })

    test('it computes the overestimation burn (2)', () => {
      const gasUsed = 8092030
      const gasLimit = 10115037
      expect(
        computeGasToBurn(
          new BigNumber(gasUsed),
          new BigNumber(gasLimit),
        ).toString(),
      ).toBe('303450')
    })

    test('it computes the overestimation burn (3)', () => {
      const gasUsed = 44955257
      const gasLimit = 55745321
      expect(
        computeGasToBurn(
          new BigNumber(gasUsed),
          new BigNumber(gasLimit),
        ).toString(),
      ).toBe('1510801')
    })
  })

  describe('gasEstimateMaxFee', () => {
    test('it returns a max fee and the message with gas params', async () => {
      const message = new Message({
        to: KNOWN_TYPE_1_ADDRESS[Network.TEST],
        from: KNOWN_TYPE_1_ADDRESS[Network.TEST],
        value: new FilecoinNumber('1', 'attofil').toAttoFil(),
        method: 0,
        nonce: 0,
      })

      const res = await filecoin.gasEstimateMaxFee(message.toLotusType())
      expect(!!res.message.GasFeeCap).toBeTruthy()
      expect(!!res.message.GasPremium).toBeTruthy()
      expect(!!res.message.GasLimit).toBeTruthy()

      expect(res.maxFee instanceof FilecoinNumber).toBeTruthy()
    })
  })
})
