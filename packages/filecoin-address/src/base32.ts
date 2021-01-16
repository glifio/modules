import * as uint8arrays from 'uint8arrays'

/* tslint:disable:no-bitwise */
// From js-multibase (https://github.com/multiformats/js-multibase)

function decode(input: string, alphabet: string): Uint8Array {
  input = input.replace(new RegExp('=', 'g'), '')
  const { length } = input

  let bits = 0
  let value = 0

  let index = 0
  const output = new Uint8Array(((length * 5) / 8) | 0)

  for (let i = 0; i < length; i++) {
    value = (value << 5) | alphabet.indexOf(input[i])
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }

  return output
}

function encode(
  buffer: Uint8Array | ArrayBufferLike,
  alphabet: string
): string {
  const length = buffer.byteLength
  const view = new Uint8Array(buffer)
  const padding = alphabet.indexOf('=') === alphabet.length - 1

  if (padding) {
    alphabet = alphabet.substring(0, alphabet.length - 2)
  }

  let bits = 0
  let value = 0
  let output = ''

  for (let i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31]
  }

  if (padding) {
    while (output.length % 8 !== 0) {
      output += '='
    }
  }

  return output
}

export function base32(alphabet: string) {
  return {
    encode(input: Uint8Array | string): string {
      if (typeof input === 'string') {
        return encode(uint8arrays.fromString(input), alphabet)
      }

      return encode(input, alphabet)
    },
    decode(input: string): Uint8Array {
      for (const char of input) {
        if (alphabet.indexOf(char) < 0) {
          throw new Error('invalid base32 character')
        }
      }

      return decode(input, alphabet)
    }
  }
}
