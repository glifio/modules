import { SingleKeyProvider } from '../local-managed-provider'
import { CoinType } from '@glif/filecoin-address'

const secp256k1Key =
  '7b2254797065223a22736563703235366b31222c22507269766174654b6579223a2257587362654d5176487a366f5668344b637262633045642b31362b3150766a6a504f3753514931355031343d227d'

const blsKey =
  '7b2254797065223a22626c73222c22507269766174654b6579223a226e586841424f4163796856504b48326155596261796f4475752f4c6f32515a2b6662622f6f736a2f34456f3d227d'

describe('secp256k1', () => {
  const provider = new SingleKeyProvider(secp256k1Key)
  test('#getAccounts', async () => {
    const accounts = await provider.getAccounts(0, 0, CoinType.TEST)
    expect(accounts).toEqual(['t17lxg2i2otnl7mmpw2ocd6o4e3b4un3272vny6ka'])
  })
  test('#keyDerive', async () => {
    expect(await provider.keyDerive('')).toBe(secp256k1Key)
  })
  test('#sign', async () => {
    const accounts = await provider.getAccounts(0, 0, CoinType.TEST)
    const address = accounts[0]
    const sig = await provider.sign(address, {
      From: address,
      To: address,
      Value: '0',
      Method: 0,
      GasFeeCap: '1',
      GasPremium: '1',
      GasLimit: 1000,
      Nonce: 0,
      Params: '',
    })
    expect(sig).toMatchSnapshot()
  })
})

describe('bls', () => {
  const provider = new SingleKeyProvider(blsKey)
  test('#getAccounts', async () => {
    const accounts = await provider.getAccounts(0, 0, CoinType.TEST)
    expect(accounts).toEqual([
      't3vbrwhphivdxyvs3pxpp54w73664bgxmb7ed4du4ohhu3dc6f5y264cs72yluw7mjbwnlrtzq543ys57plzka',
    ])
  })
  test('#keyDerive', async () => {
    expect(await provider.keyDerive('')).toBe(blsKey)
  })
  test('#sign', async () => {
    const accounts = await provider.getAccounts(0, 0, CoinType.TEST)
    const address = accounts[0]
    const sig = await provider.sign(address, {
      From: address,
      To: address,
      Value: '0',
      Method: 0,
      GasFeeCap: '1',
      GasPremium: '1',
      GasLimit: 1000,
      Nonce: 0,
      Params: '',
    })
    expect(sig).toMatchSnapshot()
  })
})
