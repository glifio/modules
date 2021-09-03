import { forwardRef } from 'react'
import { func, bool, string, oneOf } from 'prop-types'
import BaseButton from './BaseButton'
import theme from '../theme'

const NavButton = forwardRef(
  ({ disabled, onClick, variant, title, type, isActive, ...props }, ref) => {

    const activeColor = theme.colors.core.primary
    const defaultColor = theme.colors.buttons.secondary.borderColor

    // overrides for the base button
    const buttonDefaultStyles = {
      borderRadius: 50,
      color: isActive ? activeColor : defaultColor,
      borderColor: isActive ? activeColor : defaultColor,
      borderWidth: isActive ? 2 : 'auto',
    };

    return <BaseButton
      variant={variant || 'secondary'}
      onClick={onClick || null}
      disabled={disabled}
      ref={ref}
      type={type}

      {...buttonDefaultStyles}
      {...props}
    >
      {title}
    </BaseButton>
  }
)

NavButton.propTypes = {
  variant: oneOf(Object.keys(theme.colors.buttons)),
  onClick: func,
  title: string.isRequired,
  type: string,
  disabled: bool,
  isActive: bool
}

NavButton.defaultProps = {
  type: 'button',
  isActive: true
}

export default NavButton
