const generateProtocol = protocol => {
  if (protocol < 0 || protocol > 3) throw new Error('Invalid protocol')
  const protocolByte = new Buffer.alloc(1)
  protocolByte[0] = protocol

  return protocolByte
}

const ID = generateProtocol(0)
const SECP256K1 = generateProtocol(1)
const Actor = generateProtocol(2)
const BLS = generateProtocol(3)

module.exports = {
  ID,
  SECP256K1,
  Actor,
  BLS
}
