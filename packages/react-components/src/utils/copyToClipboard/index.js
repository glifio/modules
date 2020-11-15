const fallbackCopyTextToClipboard = text => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed' // avoid scrolling to bottom
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

export default text =>
  new Promise((resolve, _) => {
    if (!navigator.clipboard) {
      try {
        fallbackCopyTextToClipboard(text)
      } catch (e) {
        /* swallow */
      }
      return resolve()
    }
    navigator.clipboard
      .writeText(text)
      .then(resolve)
      .catch(e => {
        /* swallow */
      })
  })
