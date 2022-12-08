import cloneDeep from 'lodash.clonedeep'
import { Address } from '@glif/filecoin-address'
import { BigNumber } from 'ethers'
import { toString as BytesToString } from 'uint8arrays'
import { DataType, Type } from '../types'

/**
 * Adds any value to a descriptor, checks the
 * descriptor type to determine the handler
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
export const describeDataType = (dataType: DataType, value: any) => {
  // Check special types by name
  switch (dataType.Name) {
    case 'Address':
      describeAddress(dataType, value)
      return
  }

  // Check normal data types
  switch (dataType.Type) {
    case Type.Bool:
    case Type.String:
      describeBaseValue(dataType, value)
      return

    case Type.Number:
      BigNumber.isBigNumber(value)
        ? describeBigNumber(dataType, value)
        : describeBaseValue(dataType, value)
      return

    case Type.Bytes:
      describeBytes(dataType, value)
      return

    case Type.Array:
      describeArray(dataType, value)
      return

    case Type.Object:
      describeObject(dataType, value)
      return

    default:
      throw new Error(
        getErrorMsg(
          dataType,
          value,
          `Unexpected descriptor DataType: ${dataType.Type}`
        )
      )
  }
}

/**
 * Adds a base value (boolean, string, number) to a descriptor
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
export const describeBaseValue = (
  dataType: DataType,
  value: boolean | string | number
) => {
  checkValueType(dataType, value)
  dataType.Value = value
}

/**
 * Adds a BigNumber value to a descriptor as a string
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
export const describeBigNumber = (dataType: DataType, value: BigNumber) => {
  dataType.Value = value.toString()
}

/**
 * Adds an address value (Uint8Array or string) to a descriptor
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
export const describeAddress = (
  dataType: DataType,
  value: string | Uint8Array
) => {
  // Convert bytes to address string
  const isBytes = value instanceof Uint8Array
  const address = isBytes ? new Address(value).toString() : value

  // Check the value type and add to the descriptor
  checkValueType(dataType, address, 'string')
  dataType.Value = address
}

/**
 * Adds a byte value (Uint8Array or string) to a descriptor
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
export const describeBytes = (
  dataType: DataType,
  value: string | Uint8Array
) => {
  // Convert bytes to base64 string
  const isBytes = value instanceof Uint8Array
  const base64 = isBytes ? BytesToString(value, 'base64') : value

  // Check the value type and add to the descriptor
  checkValueType(dataType, base64, 'string')
  dataType.Value = base64
}

/**
 * Adds the array value to an array descriptor
 * @param dataType the array descriptor to add the value to
 * @param value the value to add to the array descriptor
 */
export const describeArray = (
  dataType: DataType,
  values: Array<any>
) => {
  const { Name, Contains } = dataType
  const valuesType = typeof values

  // Check malformed descriptor
  if (!Contains)
    throw new Error(
      getErrorMsg(
        dataType,
        values,
        `Expected Contains property in array DataType`
      )
    )

  // Check the value type
  if (!Array.isArray(values))
    throw new Error(
      getErrorMsg(
        dataType,
        values,
        `Expected array value for ${Name}, received ${valuesType}`
      )
    )

  // Create a described DataType from the Contains DataType
  // for each value in the array and append to the Values array
  dataType.Values = []
  for (const value of values) {
    const valueDT = cloneDeep<DataType>(Contains)
    describeDataType(valueDT, value)
    dataType.Values.push(valueDT)
  }
}

/**
 * Adds values to the children of an object descriptor
 * @param dataType the object descriptor to add values to
 * @param value the values to add to the object descriptor
 */
export const describeObject = (
  dataType: DataType,
  value: Record<string, any>
) => {
  // Check malformed descriptor
  if (!dataType.Children)
    throw new Error(
      getErrorMsg(
        dataType,
        value,
        `Expected Children property in object DataType`
      )
    )

  // When receiving an array instead of an object, but with the same amount of
  // values, attempt to describe the array values by index instead of object key
  const childrenLength = Object.keys(dataType.Children).length
  if (Array.isArray(value) && value.length === childrenLength) {
    Object.values(dataType.Children).forEach((child, index) => {
      describeDataType(child, value[index])
    })
  } else {
    // Check the value type
    checkValueType(dataType, value)

    // Add values to the children of the object descriptor
    Object.entries(dataType.Children).forEach(([key, child]) => {
      describeDataType(child, value[key])
    })
  }
}

/**
 * Can be used to check value types where the dataType.Type
 * should match typeof value (boolean, string, number, object)
 * @param dataType the DataType which the value should match with
 * @param value the value which should match with the DataType
 * @param type (optional) the type to check for, if dataType.Type is not a native type
 */
const checkValueType = (dataType: DataType, value: any, type?: string) => {
  const { Type, Name } = dataType
  const expectedType = type || Type
  const valueType = typeof value
  if (valueType !== expectedType)
    throw new Error(
      getErrorMsg(
        dataType,
        value,
        `Expected ${expectedType} value for ${Name}, received ${valueType}`
      )
    )
}

/**
 * Throws a verbose error for problems with matching DataTypes and values
 * @param dataType the DataType where the descriptor failed
 * @param value the value where the descriptor failed
 * @param message a message describing the descriptor issue
 */
const getErrorMsg = (
  dataType: DataType,
  value: any,
  message: string
): string => {
  const dataTypeStr = toString(dataType)
  const valueStr = toString(value)
  return `Descriptor failed for DataType: ${dataTypeStr} and value: ${valueStr} with message: ${message}`
}

/**
 * Converts any value to a string representation
 * @param value the value to convert to a string
 * @returns the string representation of the value
 */
const toString = (value: any): string => {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
