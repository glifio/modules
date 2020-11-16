import React from 'react'
import Box from '../Box'
import Loading from '../LoaderGlyph'
import { Label } from '../Typography'

const LoadingScreen = props => (
  <Box
    display='flex'
    flexDirection='column'
    alignItems='center'
    justifyContent='center'
    {...props}
  >
    <Loading width={3} height={3} />
    <Label mt={3}>Loading...</Label>
  </Box>
)

export default LoadingScreen
