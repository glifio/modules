import { CoinType } from '@glif/filecoin-address'
import { Message } from '@glif/filecoin-message'
import { LedgerProvider, LedgerVersion } from '../providers/ledger-provider'
import { badVersion } from '../providers/ledger-provider/badVersion'
import { errors } from '../errors'
import { CoinTypeCode } from '../utils/createPath'
import { SemanticVersion } from '../types'

const sleep = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time))

const LedgerAppSpy = jest.spyOn(require('@zondax/ledger-filecoin'), 'default')
const handleErrSpy = jest.spyOn(
  require('../errors/handleLedgerErrors'),
  'CommonLedgerError'
)

describe('ledger wallet subprovider', () => {
  let subProvider: LedgerProvider

  beforeEach(() => {
    jest.clearAllMocks()
    subProvider = new LedgerProvider({
      // @ts-expect-error
      transport: {},
      minLedgerVersion: { major: 0, minor: 20, patch: 0 }
    })
  })

  test('it has the right TYPE', () => {
    expect(subProvider.type).toBe('LEDGER')
  })

  test('it errors if no transport or minLedgerVersion is passed in the constructor', () => {
    try {
      // @ts-expect-error
      new LedgerProvider({
        minLedgerVersion: { major: 0, minor: 0, patch: 1 }
      })
    } catch (err) {
      expect(err instanceof errors.InvalidParamsError).toBe(true)
    }

    try {
      new LedgerProvider({
        // @ts-expect-error
        transport: {}
      })
    } catch (err) {
      expect(err instanceof errors.InvalidParamsError).toBe(true)
    }
  })

  describe('getVersion', () => {
    test('it return the `getVersion` FilecoinApp method response', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest
        .fn()
        .mockImplementation(async (): Promise<LedgerVersion> => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))

      const vsRes = await subProvider.getVersion()
      expect(JSON.stringify(vsRes)).toBe(JSON.stringify(vs))
    })

    test('it will throw a LedgerDeviceBusy error if the ledger takes too long to respond', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest.fn().mockImplementation(async () => {
        await sleep(3100)
        return vs
      })

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))
      try {
        await subProvider.getVersion()
      } catch (err) {
        expect(err instanceof errors.LedgerDeviceBusyError).toBe(true)
      }
    })

    test('it will throw a LedgerDeviceBusy error if the ledger device is in use', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest
        .fn()
        .mockImplementationOnce(async () => {
          await sleep(1000)
          return vs
        })
        .mockImplementation(async (): Promise<LedgerVersion> => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))
      await subProvider.getVersion()
      try {
        await subProvider.getVersion()
      } catch (err) {
        expect(err instanceof errors.LedgerDeviceBusyError).toBe(true)
      }
    })

    test('it will allow two calls to go through as long as the prev finished before the next', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest
        .fn()
        .mockImplementationOnce(async () => {
          await sleep(500)
          return vs
        })
        .mockImplementation(async (): Promise<LedgerVersion> => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))

      const vsRes1 = await subProvider.getVersion()
      await sleep(600)
      const vsRes2 = await subProvider.getVersion()
      expect(JSON.stringify(vsRes1)).toBe(JSON.stringify(vs))
      expect(JSON.stringify(vsRes2)).toBe(JSON.stringify(vs))
      // wait for getvs call to finish
      await sleep(3001)
    })

    test('it will throw a LedgerDeviceLocked error if the ledger is locked', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: true,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest.fn().mockImplementation(async () => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))
      try {
        await subProvider.getVersion()
      } catch (err) {
        expect(err instanceof errors.LedgerDeviceLockedError).toBe(true)
      }
    })

    test('it will throw a LedgerLostConnection error if transport is invalid', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'transporterror: invalid channel',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest.fn().mockImplementation(async () => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))
      try {
        await subProvider.getVersion()
      } catch (err) {
        expect(err instanceof errors.LedgerLostConnectionError).toBe(true)
      }
      // let getvs call finish
      await sleep(3100)
    })

    test('it will forward unknown error messages', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'unknown error message',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest.fn().mockImplementation(async () => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))
      try {
        await subProvider.getVersion()
      } catch (err) {
        expect(err instanceof errors.WalletProviderError && err.message).toBe(
          'unknown error message'
        )
      }
      // let getvs call finish
      await sleep(3100)
    })

    test('it rejects ledger apps under the min enforced version', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 19,
        patch: 0
      }

      const getVsnSpy = jest.fn().mockImplementation(async () => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))
      try {
        await subProvider.getVersion()
      } catch (err) {
        expect(err instanceof errors.LedgerFilecoinAppBadVersionError).toBe(
          true
        )
      }
      // let getvs call finish
      await sleep(3100)
    })
  })

  // ready calls getVersion, so we just make a basic assertion about the
  describe('ready', () => {
    test('it returns true if the app is not in an error state', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: false,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest
        .fn()
        .mockImplementation(async (): Promise<LedgerVersion> => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))

      const ready = await subProvider.ready()
      expect(ready).toBeTruthy()

      await sleep(3001)
    })

    test('it handles errors by calling handleCommonLedgerErrors (tested separately)', async () => {
      const vs: LedgerVersion = {
        return_code: 0,
        error_message: 'no errors',
        device_locked: true,
        test_mode: false,
        target_id: '',
        major: 0,
        minor: 20,
        patch: 0
      }

      const getVsnSpy = jest
        .fn()
        .mockImplementation(async (): Promise<LedgerVersion> => vs)

      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy
      }))

      try {
        await subProvider.ready()
      } catch {
        expect(handleErrSpy).toHaveBeenCalled()
      }

      await sleep(3001)
    })
  })

  describe('getAccounts & sign', () => {
    // these are copied from hd-wallet-provider, they're mocked for these tests
    const accounts = {
      '461': [
        'f1uyfpc3halczqq6z2i2uokmqr7z5grriop324nni',
        'f1cgtnoxba3367ihzqsedwoz6nsv5pwtwddg4erti',
        'f1tu5s7pvnrf64fthklnbdwb5xishgkl2ifqa2lby',
        'f1kftnqd3rfyxee65wd74sjvi5caoa2eg5jj25awy',
        'f1sqmhaf5aao3aa23dmsff3je5ofrzxlut2jkffba'
      ],
      '1': [
        't15ba3jkx7vd2kv4jmgfngokpf2po2bi465fh4b3q',
        't1wwfwfceoyewvdp46j5qhh3rn23wqgae2gqi6b6i',
        't15zrt6khytsqph6ttpkue3mvkb7b5kdczvordnqq',
        't1hzwwrruzsujikrh454ybxjk4p7iq6j23ucnjggy',
        't1tsg3yvyzxgvqrr253qrhfuaargex3o2k6oe2iti'
      ]
    }
    const vs: LedgerVersion = {
      return_code: 0,
      error_message: 'no errors',
      device_locked: false,
      test_mode: false,
      target_id: '',
      major: 0,
      minor: 20,
      patch: 0
    }

    const getVsnSpy = jest
      .fn()
      .mockImplementation(async (): Promise<LedgerVersion> => vs)

    const getAddressAndPubKeySpy = jest
      .fn()
      .mockImplementation(
        async (
          path
        ): Promise<{ addrString: string; error_message: string }> => {
          const coinType = Number(
            path.split('/')[2].slice(0, -1)
          ) as CoinTypeCode
          const index = Number(path.split('/')[5])
          return {
            addrString: accounts[coinType][index],
            error_message: 'no errors'
          }
        }
      )

    const showAddressAndPubKeySpy = jest
      .fn()
      .mockImplementation(() => ({ error_message: 'no errors' }))

    const signSpy = jest.fn().mockImplementation(
      async (): Promise<{
        error_message: string
        signature_compact: Buffer
      }> => {
        return {
          signature_compact: Buffer.from('i <3 glif'),
          error_message: 'no errors'
        }
      }
    )
    beforeEach(() => {
      LedgerAppSpy.mockImplementation(() => ({
        getVersion: getVsnSpy,
        getAddressAndPubKey: getAddressAndPubKeySpy,
        showAddressAndPubKey: showAddressAndPubKeySpy,
        sign: signSpy
      }))
    })
    describe('showAddressAndPubKey', () => {
      test('it calls the spy and does not error', async () => {
        await subProvider.showAddressAndPubKey('/path/')
        expect(showAddressAndPubKeySpy).toHaveBeenCalledWith('/path/')
      })
    })
    describe('getAccounts', () => {
      test('it derives the right number of accounts', async () => {
        const singleAccount = await subProvider.getAccounts(0, 1, CoinType.TEST)
        expect(singleAccount.length).toBe(1)
        expect(singleAccount[0]).toBe(accounts['1'][0])
        expect(getAddressAndPubKeySpy).toHaveBeenCalledTimes(1)

        const fiveAccounts = await subProvider.getAccounts(0, 5, CoinType.TEST)
        expect(fiveAccounts.length).toBe(5)
        fiveAccounts.forEach((a, i) => {
          expect(a).toBe(accounts['1'][i])
        })
        expect(getAddressAndPubKeySpy).toHaveBeenCalledTimes(6)
      })

      test('it derives accounts on the right network', async () => {
        const testAccount = await subProvider.getAccounts(0, 1, CoinType.TEST)
        expect(testAccount[0]).toBe(accounts['1'][0])
        expect(testAccount[0][0]).toBe('t')

        const prodAccount = await subProvider.getAccounts(0, 1, CoinType.MAIN)
        expect(prodAccount[0]).toBe(accounts['461'][0])
        expect(prodAccount[0][0]).toBe('f')
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

    describe('keyDerive', () => {
      test('it throws an error', async () => {
        await expect(subProvider.keyDerive('')).rejects.toThrow(
          'Cannot derive key from Ledger provider'
        )
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
          nonce
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
        expect(signSpy).toHaveBeenCalled()
      })

      test('it rejects if the from address has not been derived yet', async () => {
        try {
          const message = new Message({
            from: accounts['1'][0],
            to: accounts['1'][1],
            value,
            method,
            nonce
          })

          await subProvider.sign(accounts['1'][0], message.toLotusType())
        } catch (err) {
          expect(err instanceof errors.WalletProviderError).toBe(true)
        }
      })

      test('it does not reject if the from address has the wrong network prefix', async () => {
        const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
        const message = new Message({
          from: `f${from.slice(1)}`,
          to,
          value,
          method,
          nonce
        })

        await expect(
          subProvider.sign(`f${from.slice(1)}`, message.toLotusType())
        ).resolves.not.toThrow()
      })

      test('it rejects if the from address mismatches the from address of the message', async () => {
        try {
          const [from, to] = await subProvider.getAccounts(0, 2, CoinType.TEST)
          const message = new Message({
            from,
            to,
            value,
            method,
            nonce
          })

          await subProvider.sign(to, message.toLotusType())
        } catch (err) {
          expect(err instanceof errors.InvalidParamsError).toBe(true)
        }
      })

      test('it rejects if the message is poorly formed', async () => {
        const [from, _to] = await subProvider.getAccounts(0, 2, CoinType.TEST)

        try {
          // @ts-expect-error
          await subProvider.sign(from, { From: from })
        } catch (err) {
          expect(err instanceof errors.InvalidParamsError).toBe(true)
        }
      })
    })
  })
})

describe('badVersion', () => {
  const LEDGER_VERSION_MAJOR = 0
  const LEDGER_VERSION_MINOR = 18
  const LEDGER_VERSION_PATCH = 5

  const enforce: SemanticVersion = {
    major: LEDGER_VERSION_MAJOR,
    minor: LEDGER_VERSION_MINOR,
    patch: LEDGER_VERSION_PATCH
  }

  test('it returns true if the version is below the LEDGER_VERSION_MAJOR LEDGER_VERSION_MINOR or LEDGER_VERSION_PATCH', () => {
    expect(
      badVersion(enforce, {
        major: LEDGER_VERSION_MAJOR,
        minor: LEDGER_VERSION_MINOR,
        patch: LEDGER_VERSION_PATCH - 1
      })
    ).toBe(true)
    expect(
      badVersion(enforce, {
        major: LEDGER_VERSION_MAJOR,
        minor: LEDGER_VERSION_MINOR - 1,
        patch: LEDGER_VERSION_PATCH
      })
    ).toBe(true)
  })

  test('it returns false if the version is at or above the LEDGER_VERSION_MAJOR LEDGER_VERSION_MINOR or LEDGER_VERSION_PATCH', () => {
    expect(
      badVersion(enforce, {
        major: LEDGER_VERSION_MAJOR,
        minor: LEDGER_VERSION_MINOR,
        patch: LEDGER_VERSION_PATCH
      })
    ).toBe(false)
    expect(
      badVersion(enforce, {
        major: LEDGER_VERSION_MAJOR + 1,
        minor: LEDGER_VERSION_MINOR + 1,
        patch: LEDGER_VERSION_PATCH + 1
      })
    ).toBe(false)
  })
})
