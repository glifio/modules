export default (address, charCountStart, charCountEnd) => {
  if (address.length <= 12) return address

  return `${address.slice(0, charCountStart || 6)} ... ${address.slice(
    -charCountEnd || -6
  )}`
}
