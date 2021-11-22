/**
 * Checks to see a valid path is on filecoin main or testnet and first 2 values are hardened
 *
 * valid: m/44'/461'/1'/0/0/0
 * valid: m/44'/1'/1'/0/0/0
 *
 * invalid: m/44/461'/1/0/0/0
 * invalid: m/44/461'/1'/
 */

export default (path: string): boolean => {
  const tree = path.split('/')
  if (tree.length !== 6) return false
  return tree.every((v, i) => {
    if (i === 0 && v !== 'm') return false
    if (i === 1 && v !== "44'") return false
    if (i === 2 && v !== "461'" && v !== "1'") return false
    if (i > 0 && i < 3) {
      const isHardened = v[v.length - 1] === "'"
      if (!isHardened) return false
    }

    return true
  })
}
