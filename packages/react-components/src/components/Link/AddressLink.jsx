import styled from 'styled-components'
import PropTypes from 'prop-types'
import { StyledATag } from '.'
import { ADDRESS_PROPTYPE } from '../../customPropTypes'

const StyledAddressLink = styled(StyledATag)`
  font-size: ${props => props.theme.fontSizes[2]};
  max-width: ${props => {
    if (props.truncate) return `${props.theme.sizes[8]}px`
    return 'max-content'
  }};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const AddressLink = ({ address, ...props }) => {
  return <StyledAddressLink {...props}>{address}</StyledAddressLink>
}

AddressLink.propTypes = {
  href: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  address: ADDRESS_PROPTYPE
}

export default AddressLink
