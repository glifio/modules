import { forwardRef, useState } from 'react'
import styled from 'styled-components'
import { bool, string } from 'prop-types'
import Box from '../Box'
import BaseButton from '../Button/BaseButton'
import { IconCopyAccountAddress } from '../Icons'
import { Label } from '../Typography'
import copyToClipboard from '../../utils/copyToClipboard'

export const Copy = styled(BaseButton)`
  /* !important is declared here to override BaseButton's opacity:0.8 on hover. The only instance of us using this declaration. */
  height: auto;
  opacity: 1 !important;
  border: 0;
  background: transparent;
  padding: 0;
  outline: none;
`

export const StyledIconCopyAccountAddress = styled(IconCopyAccountAddress)`
  transition: 0.24s ease-in-out;
  ${Copy}:hover & {
    transform: scale(1.25);
  }
`

export const LabelCopy = styled(Label)`
  transition: 0.18s ease-in;
  opacity: 0;
  ${Copy}:hover & {
    opacity: 1;
  }
`

export const CopyText = forwardRef(({ text, hideCopyText, ...props }, ref) => {
  const [copied, setCopied] = useState(false)
  return (
    <Box ref={ref} display='flex' alignItems='center' {...props}>
      <Copy
        display='flex'
        alignItems='center'
        ml={2}
        type='button'
        role='button'
        onClick={() => {
          setCopied(true)
          copyToClipboard(text)
        }}
      >
        <StyledIconCopyAccountAddress />
        {!hideCopyText && (
          <LabelCopy
            mt={0}
            ml={1}
            minWidth={7}
            textAlign='left'
            color={props.color}
          >
            {copied ? 'Copied' : 'Copy'}
          </LabelCopy>
        )}
      </Copy>
    </Box>
  )
})

CopyText.propTypes = {
  text: string.isRequired,
  hideCopyText: bool,
  color: string
}

CopyText.defaultProps = {
  color: 'core.secondary',
  hideCopyText: false
}
