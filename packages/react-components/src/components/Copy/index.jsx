import { forwardRef } from 'react'
import { string } from 'prop-types'
import Box from '../Box'
import { Title as AccountAddress } from '../Typography'
import truncate from '../../utils/truncateAddress'
import { ADDRESS_PROPTYPE } from '../../customPropTypes'
import { CopyText } from './CopyText'

export * from './CopyText'

export const CopyAddress = forwardRef(({ address, ...props }, ref) => {
  return (
    <Box ref={ref} display='flex' alignItems='center' {...props}>
      <AccountAddress
        fontWeight={1}
        fontSize={3}
        margin={0}
        overflow='hidden'
        whiteSpace='nowrap'
      >
        {truncate(address)}
      </AccountAddress>
      <CopyText text={address} color={props.color} />
    </Box>
  )
})

CopyAddress.propTypes = {
  address: ADDRESS_PROPTYPE,
  color: string
}

CopyAddress.defaultProps = {
  color: 'core.secondary'
}
