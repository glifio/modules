import styled from 'styled-components'
import PropTypes from 'prop-types'
import { StyledATag } from '.'

const StyledNavLink = styled(StyledATag).attrs(props => ({
  px: 3,
  py: 2,
  mx: 1,
  height: 6,
  fontSize: 2,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  color: props.theme.colors.buttons.secondary.borderColor
}))`
  /* We couldn't set the border above. So add it here instead. */
  border: 1px solid;
  display: flex;
  align-items: center;
  border-radius: ${props => props.theme.sizes[6]}px;
  border-color: ${props => props.theme.colors.buttons.secondary.borderColor};
  color: ${props => props.theme.colors.buttons.secondary.borderColor};
  transition: 0.18s ease-in-out;
  &:hover {
    opacity: 0.9;
    /* ensure this gets overwritten */
    border-bottom: ${props => (props.isActive ? '2px' : '1px')} solid;
  }
`

const ButtonLink = ({ ...props }) => {
  return <StyledNavLink {...props}>{props.name}</StyledNavLink>
}

ButtonLink.propTypes = {
  href: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
}

export default ButtonLink
