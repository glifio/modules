import React, { forwardRef } from 'react'
import { func, string, bool } from 'prop-types'
import TextInput from './Text'

const Address = forwardRef(({ value, label, error, ...props }, ref) => {
  return (
    <TextInput ref={ref} label={label} value={value} error={error} {...props} />
  )
})

Address.propTypes = {
  onChange: func,
  label: string,
  value: string,
  error: string,
  placeholder: string,
  valid: bool
}

Address.defaultProps = {
  value: '',
  placeholder: 'f1...',
  onChange: () => {},
  label: ''
}

export default Address
