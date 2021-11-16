import React from 'react'
import { number, bool, string } from 'prop-types'
import Box from '../Box'
import { Text, Title } from '../Typography'

const AccountTitle = ({ index, legacy, path }) => {
  return (
    <Box display='flex' flexDirection='column'>
      {index === 0 && (
        <Title fontSize={4} my={0}>
          Default
        </Title>
      )}
      {index > 0 && index <= 4 && (
        <Title fontSize={4} my={0}>
          Account {index}
        </Title>
      )}
      {index > 4 && (
        <Title fontSize={4} my={0}>
          Created Account
        </Title>
      )}
      <Box display='flex' flexDirection='row'>
        {legacy && (
          <>
            <i>
              <Text p={0} m={0} mr={2}>
                Legacy
              </Text>
            </i>
            <i>
              <Text p={0} m={0}>
                {path}
              </Text>
            </i>
          </>
        )}
        {!legacy && index > 4 && (
          <i>
            <Text p={0} m={0}>
              {path}
            </Text>
          </i>
        )}
      </Box>
    </Box>
  )
}

AccountTitle.propTypes = {
  index: number.isRequired,
  path: string.isRequired,
  legacy: bool
}

AccountTitle.defaultProps = {
  legacy: false
}

export default AccountTitle
