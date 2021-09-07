import styled from 'styled-components'
import PropTypes from 'prop-types'
import ButtonLink from './ButtonLink'

const StyledNavLink = styled(ButtonLink).attrs(props => ({
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  color: props.isActive ? props.theme.colors.core.primary : props.theme.colors.buttons.secondary.borderColor,
}))`
  /* We couldn't set the border above. So add it here instead. */
  border-color: ${props => props.isActive ? props.theme.colors.core.primary : props.theme.colors.buttons.secondary.borderColor};
  border-width: ${props => props.isActive ? '2px' : '1px'};
  &:hover {
    /* ensure this gets overwritten */
    border-bottom: ${props => props.isActive ? '2px' : '1px'} solid;
  }
`

const NavLink = ({ ...props }) => {
  return <StyledNavLink {...props} />
}

NavLink.propTypes = {
  href: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
}

export default NavLink


