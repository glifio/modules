/* eslint-env mocha */
module.exports = async (method, errorMessage) => {
  let error = null
  try {
    await method()
  } catch (err) {
    error = err
  }
  expect(error instanceof Error).toBe(true)
  if (errorMessage) {
    expect(error.message).toBe(errorMessage)
  }
}
