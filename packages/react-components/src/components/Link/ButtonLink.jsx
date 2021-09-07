import styled from 'styled-components'
import PropTypes from 'prop-types'
import { StyledATag } from '.'

const StyledNavLink = styled(StyledATag).attrs(props => ({
  px: 3,
  py: 2,
  mx: 1,
  fontSize: 2,
  height: 6,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  color: props.theme.colors.buttons.secondary.borderColor
}))`
  /* We couldn't set the border above. So add it here instead. */
  border: 1px solid;
  border-radius: ${props => props.theme.sizes[6]}px;
  border-color: ${props => props.theme.colors.buttons.secondary.borderColor};
  color: ${props => props.theme.colors.buttons.secondary.borderColor};
  transition: 0.18s ease-in-out;
  &:hover {
    opacity: .9;
  }
`

const ButtonLink = ({ ...props }) => {
  return <StyledNavLink {...props}>
    {props.name}
  </StyledNavLink>
}

ButtonLink.propTypes = {
  href: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
}

export default ButtonLink
