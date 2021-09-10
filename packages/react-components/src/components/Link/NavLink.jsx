import styled from 'styled-components'
import Link from 'next/link'
import PropTypes from 'prop-types'
import {
  position,
  space,
  layout,
  borderRadius,
  flexbox,
  color,
  border,
  shadow
} from 'styled-system'

const StyledNavLink = styled.a.attrs(props => ({
  height: 6,
  py: 2,
  px: 3,
  fontSize: 3,
  ...props
}))`
  text-decoration: none;
  border: ${props => (props.isActive ? '2' : '1')}px solid;
  display: flex;
  align-items: center;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  border-color: ${props =>
    props.isActive
      ? props.theme.colors.core.primary
      : props.theme.colors.buttons.secondary.borderColor};
  background-color: ${props => props.theme.colors.buttons.secondary.background};
  color: ${props =>
    props.isActive
      ? props.theme.colors.core.primary
      : props.theme.colors.buttons.secondary.borderColor};
  font-size: ${props => props.theme.fontSizes[2]};
  transition: 0.18s ease-in-out;
  border-radius: ${props => props.theme.sizes[6]}px;
  &:hover {
    opacity: ${props => (props.disabled ? '1' : '0.8')};
  }
  ${borderRadius}
  ${space}
  ${layout}
  ${position}
  ${flexbox}
  ${border}
  ${color}
  ${shadow}
`

export default function NavLink({ children, href, ...props }) {
  return (
    <Link href={href} passHref>
      <StyledNavLink {...props}>{children}</StyledNavLink>
    </Link>
  )
}

NavLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  rel: PropTypes.string,
  target: PropTypes.string
}
