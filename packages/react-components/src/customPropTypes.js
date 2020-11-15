import { validateAddressString } from '@glif/filecoin-address'

export const ADDRESS_PROPTYPE = (props, propName, componentName) => {
  if (!validateAddressString(props[propName]))
    return new Error(
      `Invalid prop: ${propName} supplied to ${componentName}. Validation failed.`
    )

  return null
}

export const FILECOIN_NUMBER_PROP = (props, propName, componentName) => {
  // instanceof prop checking is broken in nextjs on server side render cycles
  const representsANum = Number.isNaN(Number(props[propName].toString()))
  const hasFilecoinNumMethods = !!(
    props[propName].toFil &&
    props[propName].toAttoFil &&
    props[propName].toPicoFil
  )
  if (!(representsANum || hasFilecoinNumMethods))
    return new Error(
      `Invalid prop: ${propName} supplied to ${componentName}. Validation failed.`
    )

  return null
}
