function generateProtocol(protocol: number): Uint8Array {
  if (protocol < 0 || protocol > 3) throw new Error('Invalid protocol')
  return new Uint8Array([protocol])
}

export const ID = generateProtocol(0)
export const SECP256K1 = generateProtocol(1)
export const Actor = generateProtocol(2)
export const BLS = generateProtocol(3)
