import styled from 'styled-components'

export default styled.div`
  display: flex;
  flex-wrap: wrap;
  /* Temp implementation to simplistically handle large scale displays. This should be removed and a more dynamic solution introduced e.g https://css-tricks.com/optimizing-large-scale-displays/  */
  max-width: ${props => props.theme.sizes[props.theme.sizes.length - 1]}px;
  margin: 0 auto;
  min-height: 100vh;
`
