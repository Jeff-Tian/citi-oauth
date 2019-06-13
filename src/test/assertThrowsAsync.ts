import assert = require('assert')

async function assertThrowsAsync(
  fn: () => Promise<void>,
  regExp: RegExp | any
) {
  let f = () => {}

  try {
    await fn()
  } catch (ex) {
    f = () => {
      throw ex
    }
  } finally {
    assert.throws(f, regExp)
  }
}

export default assertThrowsAsync
