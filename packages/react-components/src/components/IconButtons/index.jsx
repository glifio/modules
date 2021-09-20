import { forwardRef } from 'react'
import styled from 'styled-components'
import { func, node, string } from 'prop-types'
import { layout, space, border, flexbox, position } from 'styled-system'
import {
  IconClose,
  IconCopyAccountAddress,
  IconEdit,
  IconViewAddress
} from '../Icons'

const IconButtonBase = styled.button`
  outline: 0;
  border: 0;
  background: transparent;
  transition: 0.24s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: scale(1.25);
  }
  ${layout}
  ${space}
  ${border}
  ${flexbox}
  ${position}
`

const IconButton = forwardRef(({ onClick, Icon, ...props }, ref) => (
  <IconButtonBase display='inline-block' onClick={onClick} ref={ref} {...props}>
    <Icon stroke={props.stroke} fill={props.fill} />
  </IconButtonBase>
))

const IconButtonProps = {
  onClick: func.isRequired,
  Icon: node,
  stroke: string,
  fill: string
}

IconButton.propTypes = IconButtonProps

export const ButtonClose = ({ ...props }) => (
  <IconButton Icon={IconClose} {...props} />
)
ButtonClose.propTypes = IconButtonProps

export const ButtonCopyAccountAddress = ({ ...props }) => (
  <IconButton Icon={IconCopyAccountAddress} {...props} />
)
ButtonCopyAccountAddress.propTypes = IconButtonProps

export const ButtonViewAddress = ({ ...props }) => (
  <IconButton Icon={IconViewAddress} {...props} />
)
ButtonViewAddress.propTypes = IconButtonProps

export const ButtonEdit = ({ ...props }) => (
  <IconButton Icon={IconEdit} {...props} />
)

ButtonEdit.propTypes = IconButtonProps
