import React from 'react'
import { number, bool } from 'prop-types'
import Box from '../Box'
import { Text, Title } from '../Typography'
import createPath from '../../utils/createPath'
import { MAINNET_PATH_CODE, TESTNET_PATH_CODE } from '../../constants'

const AccountTitle = ({ index, legacy }) => {
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
                {createPath(
                  legacy ? TESTNET_PATH_CODE : MAINNET_PATH_CODE,
                  index
                )}
              </Text>
            </i>
          </>
        )}
        {!legacy && index > 4 && (
          <i>
            <Text p={0} m={0}>
              {createPath(
                legacy ? TESTNET_PATH_CODE : MAINNET_PATH_CODE,
                index
              )}
            </Text>
          </i>
        )}
      </Box>
    </Box>
  )
}

AccountTitle.propTypes = {
  index: number.isRequired,
  legacy: bool
}

AccountTitle.defaultProps = {
  legacy: false
}

export default AccountTitle
