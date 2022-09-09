import { DataType, Type } from '../types'

/**
 * Adds any value to a descriptor, checks the
 * descriptor type to determine the handler
 * @param dataType the descriptor to add the value to
 * @param value the value to add to the descriptor
 */
export const describeDataType = (dataType: DataType, value: any) => {
  switch (dataType.Type) {
    case Type.Bool:
    case Type.String:
    case Type.Number:
      describeBaseValue(dataType, value)
      return
    case Type.Array:
      describeArray(dataType, value)
      return
    case Type.Object:
      describeObject(dataType, value)
      return
    default:
      throw new Error(`Unexpected descriptor DataType: ${dataType.Type}`)
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
 * Adds the array value to an array descriptor
 * @param dataType the array descriptor to add the value to
 * @param value the value to add to the array descriptor
 */
export const describeArray = (
  dataType: DataType,
  value: Array<boolean | string | number>
) => {
  const { Name, Contains } = dataType
  const valueType = typeof value

  // Check malformed descriptor
  if (!Contains) throw new Error(`Expected Contains property in array DataType`)

  // Check the value type
  if (!Array.isArray(value))
    throw new Error(`Expected array value for ${Name}, received ${valueType}`)

  // Check the value types for the array items
  // The array should not contain complex types
  switch (Contains.Type) {
    case Type.Bool:
    case Type.String:
    case Type.Number:
      value.forEach(v => checkValueType(Contains, v))
      break
    default:
      throw new Error(`Unexpected array descriptor DataType: ${dataType.Type}`)
  }

  // Add the value to the descriptor
  dataType.Value = value
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
    throw new Error(`Expected Children property in object DataType`)

  // Check the value type
  checkValueType(dataType, value)

  // Add values to the children of the object descriptor
  Object.entries(dataType.Children).forEach(([key, child]) => {
    describeDataType(child, value[key])
  })
}

/**
 * Can be used to check value types where the dataType.Type
 * should match typeof value (boolean, string, number, object)
 * @param dataType the DataType which the value should match with
 * @param value the value which should match with the DataType
 */
const checkValueType = (dataType: DataType, value: any) => {
  const { Type, Name } = dataType
  const valueType = typeof value
  if (valueType !== Type)
    throw new Error(`Expected ${Type} value for ${Name}, received ${valueType}`)
}
