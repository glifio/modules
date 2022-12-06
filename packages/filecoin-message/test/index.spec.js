const { Message, getCidFromFEVMHex, getFEVMHexFromCid } = require('../src')
const BigNumber = require('bignumber.js')

const baseMessage = {
  to: 't03832874859695014541',
  from: 't1pyfq7dg6sq65acyomqvzvbgwni4zllglqffw5dy',
  nonce: 10,
  value: new BigNumber('11416382733294334924'),
  method: 0,
  params: ''
}

const customizedGasMessage = {
  ...baseMessage,
  gasFeeCap: '1',
  gasPremium: '1',
  gasLimit: 123
}

describe('message', () => {
  describe('getCidFromFEVMHex', () => {
    test('should create a cid string from an eth hex', () => {
      expect(
        getCidFromFEVMHex(
          '0xdeaba76628be8e01ba81cea29d7c7e1348f2d6934c5fa3e64ce1452642fdc4b0'
        )
      ).toBe(`bafy2bzacedpkxj3gfc7i4an2qhhkfhl4pyjur4wwsngf7i7gjtqukjsc7xcla`)
    })
  })

  describe('getFEVMHexFromCid', () => {
    test('should create an eth hex from a cid string', () => {
      expect(
        getFEVMHexFromCid(
          'bafy2bzacedpkxj3gfc7i4an2qhhkfhl4pyjur4wwsngf7i7gjtqukjsc7xcla'
        )
      ).toBe(
        `0xdeaba76628be8e01ba81cea29d7c7e1348f2d6934c5fa3e64ce1452642fdc4b0`
      )
    })
  })

  describe('constructor', () => {
    test('should not throw an error when addresses with different networks are passed', () => {
      expect(
        () =>
          new Message({
            ...baseMessage,
            to: 'f3kl67ybzbqjsu6fr7l4hzuyq5okkwnr2ncabxytl3xmcapupcyzeydbk23bub2dmg2hur4aawpe44w3wptsvq'
          })
      ).not.toThrow()
    })

    test('should throw an error when an invalid to address is passed', () => {
      expect(
        () =>
          new Message({
            ...baseMessage,
            to: 't0kl67ybzbqjsu6fr7l4hzuyq5okkwnr2ncabxytl3xmcapupcyzeydbk23bub2dmg2hur4aawpe44w3wptsvq'
          })
      ).toThrow()
    })

    test('should throw an error when an invalid from address is passed', () => {
      expect(
        () =>
          new Message({
            ...baseMessage,
            from: 't0kl67ybzbqjsu6fr7l4hzuyq5okkwnr2ncabxytl3xmcapupcyzeydbk23bub2dmg2hur4aawpe44w3wptsvq'
          })
      ).toThrow()
    })

    test('should throw an error when nonce is not a number', () => {
      expect(() => new Message({ ...baseMessage, nonce: '1' })).toThrow()
    })

    test('should throw an error when nonce is too big', () => {
      expect(
        () => new Message({ ...baseMessage, nonce: 18446744073709551616 })
      ).toThrow()
    })

    test('should throw an error when no value is passed', () => {
      const msg = { ...baseMessage }
      delete msg.value
      expect(() => new Message(msg)).toThrow()
    })

    test('should throw an error when method is too big', () => {
      expect(
        () => new Message({ ...baseMessage, method: 18446744073709551616 })
      ).toThrow()
    })

    test('should throw an error when method is not a number', () => {
      expect(() => new Message({ ...baseMessage, method: '1' })).toThrow()
    })

    test('should throw an error when gasLimit is not a number', () => {
      expect(() => new Message({ ...baseMessage, gasLimit: '1' })).toThrow()
    })

    test('should throw an error when gasLimit is too big', () => {
      expect(
        () => new Message({ ...baseMessage, gasLimit: 18446744073709551616 })
      ).toThrow()
    })
  })

  describe('toSerializeableType', () => {
    test('should stringify the message in lowercase vals', () => {
      const message = new Message(customizedGasMessage)
      const serializeableMsg = message.toSerializeableType()
      expect(serializeableMsg.to).toBe(customizedGasMessage.to)
      expect(serializeableMsg.from).toBe(customizedGasMessage.from)
      expect(serializeableMsg.nonce).toBe(10)
      expect(serializeableMsg.value).toBe(customizedGasMessage.value.toString())
      expect(serializeableMsg.gaspremium).toBe(customizedGasMessage.gasPremium)
      expect(serializeableMsg.gaslimit).toBe(customizedGasMessage.gasLimit)
      expect(serializeableMsg.gasfeecap).toBe(customizedGasMessage.gasFeeCap)
      expect(serializeableMsg.method).toBe(customizedGasMessage.method)
      expect(serializeableMsg.params).toBeFalsy()
    })

    test('should add defaults to optional fields', () => {
      const message = new Message(baseMessage)
      const serializeableMsg = message.toSerializeableType()
      expect(serializeableMsg.to).toBe(baseMessage.to)
      expect(serializeableMsg.from).toBe(baseMessage.from)
      expect(serializeableMsg.nonce).toBe(10)
      expect(serializeableMsg.value).toBe(baseMessage.value.toString())
      expect(serializeableMsg.gaspremium).toBe('0')
      expect(serializeableMsg.gaslimit).toBe(0)
      expect(serializeableMsg.gasfeecap).toBe('0')
      expect(serializeableMsg.method).toBe(baseMessage.method)
      expect(serializeableMsg.params).toBeFalsy()
    })

    test('it should not turn attofil vals into scientific notation', () => {
      const message = new Message({
        to: 't03832874859695014541',
        from: 't1pyfq7dg6sq65acyomqvzvbgwni4zllglqffw5dy',
        nonce: 10,
        value: new BigNumber('11416382733294334924'),
        method: 0,
        params: '',
        value: '100000000000000000000000000000000000000000000',
        gasPremium: '100000000000000000000000000000000000000000000',
        gasFeeCap: '100000000000000000000000000000000000000000000'
      })

      const serializeableMsg = message.toSerializeableType()
      expect(serializeableMsg.value).toBe(
        '100000000000000000000000000000000000000000000'
      )
      expect(serializeableMsg.gaspremium).toBe(
        '100000000000000000000000000000000000000000000'
      )
      expect(serializeableMsg.gasfeecap).toBe(
        '100000000000000000000000000000000000000000000'
      )
    })
  })

  describe('toLotusType', () => {
    test('should stringify the message in Lotus types', () => {
      const message = new Message(customizedGasMessage)
      const lotusMsg = message.toLotusType()
      expect(lotusMsg.To).toBe(customizedGasMessage.to)
      expect(lotusMsg.From).toBe(customizedGasMessage.from)
      expect(lotusMsg.Nonce).toBe(10)
      expect(lotusMsg.Value).toBe(customizedGasMessage.value.toString())
      expect(lotusMsg.GasPremium).toBe(customizedGasMessage.gasPremium)
      expect(lotusMsg.GasLimit).toBe(customizedGasMessage.gasLimit)
      expect(lotusMsg.GasFeeCap).toBe(customizedGasMessage.gasFeeCap)
      expect(lotusMsg.Method).toBe(customizedGasMessage.method)
      expect(lotusMsg.Params).toBeFalsy()
    })

    test('should add defaults to optional fields', () => {
      const message = new Message(baseMessage)
      const lotusMsg = message.toLotusType()
      expect(lotusMsg.To).toBe(baseMessage.to)
      expect(lotusMsg.From).toBe(baseMessage.from)
      expect(lotusMsg.Nonce).toBe(10)
      expect(lotusMsg.Value).toBe(baseMessage.value.toString())
      expect(lotusMsg.GasPremium).toBe('0')
      expect(lotusMsg.GasLimit).toBe(0)
      expect(lotusMsg.GasFeeCap).toBe('0')
      expect(lotusMsg.Method).toBe(baseMessage.method)
      expect(lotusMsg.Params).toBeFalsy()
    })

    test('it should not turn attofil vals into scientific notation', () => {
      const message = new Message({
        to: 't03832874859695014541',
        from: 't1pyfq7dg6sq65acyomqvzvbgwni4zllglqffw5dy',
        nonce: 10,
        method: 0,
        params: '',
        value: '100000000000000000000000000000000000000000000',
        gasPremium: '100000000000000000000000000000000000000000000',
        gasFeeCap: '100000000000000000000000000000000000000000000'
      })

      const lotusMsg = message.toLotusType()
      expect(lotusMsg.Value).toBe(
        '100000000000000000000000000000000000000000000'
      )
      expect(lotusMsg.GasPremium).toBe(
        '100000000000000000000000000000000000000000000'
      )
      expect(lotusMsg.GasFeeCap).toBe(
        '100000000000000000000000000000000000000000000'
      )
    })
  })
})
