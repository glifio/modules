export default function validIndexes(nStart: number, nEnd: number): boolean {
  const indexesAreNums = typeof nStart === 'number' && typeof nEnd === 'number'
  const indexesAreOrdered = nStart < nEnd
  const indexesAreAboveZero = nStart >= 0

  return indexesAreAboveZero && indexesAreOrdered && indexesAreNums
}
