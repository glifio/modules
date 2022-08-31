import { SemanticVersion } from '../../types'

export const badVersion = (
  enforce: SemanticVersion,
  current: SemanticVersion
): boolean => {
  const {
    major: LEDGER_VERSION_MAJOR,
    minor: LEDGER_VERSION_MINOR,
    patch: LEDGER_VERSION_PATCH
  } = enforce

  const aboveMajor = current.major > LEDGER_VERSION_MAJOR
  const aboveMinor = current.minor > LEDGER_VERSION_MINOR
  const abovePatch = current.patch > LEDGER_VERSION_PATCH

  const atMajor = current.major === LEDGER_VERSION_MAJOR
  const atMinor = current.minor === LEDGER_VERSION_MINOR
  const atPatch = current.patch === LEDGER_VERSION_PATCH

  const belowMajor = current.major < LEDGER_VERSION_MAJOR
  const belowMinor = current.minor < LEDGER_VERSION_MINOR
  const belowPatch = current.patch < LEDGER_VERSION_PATCH

  if (aboveMajor) return false
  if (belowMajor) return true

  if (atMajor) {
    if (aboveMinor) return false
    if (belowMinor) return true

    if (atMinor) {
      if (abovePatch || atPatch) return false
      if (belowPatch) return true
    }
  }

  return true
}

export default badVersion
