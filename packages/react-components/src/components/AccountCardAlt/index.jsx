import React, { forwardRef } from 'react'
import useSWR from 'swr'
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import { FilecoinNumber } from '@glif/filecoin-number'
import { string, number, bool, func } from 'prop-types'
import { ADDRESS_PROPTYPE } from '../../customPropTypes'
import Box from '../Box'
import Glyph from '../Glyph'
import Card from '../Card'
import { Text, Title } from '../Typography'
import truncate from '../../utils/truncateAddress'
import makeFriendlyBalance from '../../utils/makeFriendlyBalance'
import { MAINNET_JSON_RPC_ENDPOINT } from '../../constants'
import Button from '../Button'
import { StyledATag } from '../Link'
import { CopyText } from '../Copy'

// allows you to optionally pass a balance for future wallet upgrades
// if you dont pass a balance, it will poll for you
const AccountCardAlt = forwardRef(
  (
    { address, balance, index, selected, onClick, jsonRpcEndpoint, ...props },
    ref
  ) => {
    const { data, error: balanceFetchingError } = useSWR(
      !balance ? [address] : null,
      async walletAddress => {
        const lCli = new LotusRPCEngine({
          apiAddress: jsonRpcEndpoint || MAINNET_JSON_RPC_ENDPOINT
        })

        const bal = await lCli.request('WalletBalance', walletAddress)
        const filBal = new FilecoinNumber(bal, 'attofil')
        return makeFriendlyBalance(filBal, 6, true)
      }
    )

    const balanceForUI = balance || data

    return (
      <Box m={2} display='inline-block' ref={ref} {...props}>
        <Card
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          width={11}
          height={11}
          border={1}
          borderRadius={2}
          p={3}
          bg={selected ? 'card.account.background' : 'hsla(0, 0%, 90%, 0)'}
          color={selected ? 'card.account.color' : 'colors.core.black'}
        >
          <Box display='flex' alignItems='center' justifyContent='flex-start'>
            <Glyph
              mr={3}
              color={selected ? 'card.account.color' : 'colors.core.black'}
              acronym={index.toString()}
            />
            <Box display='flex' flexDirection='column'>
              {index === 0 ? (
                <Title fontSize={4} my={0}>
                  Default
                </Title>
              ) : (
                <Title fontSize={4} my={0}>
                  Account {index}
                </Title>
              )}
            </Box>
          </Box>
          <Box display='flex' flexDirection='row' justifyContent='center'>
            <StyledATag
              target='_blank'
              href={`https://filfox.info/en/address/${address}`}
              fontSize={4}
              color={selected ? 'card.account.color' : 'core.primary'}
            >
              {truncate(address, 5, 6)}
            </StyledATag>
            <CopyText
              text={address}
              color={selected ? 'card.account.color' : 'core.primary'}
              hideCopyText
            />
          </Box>
          <Box
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
          >
            <Box display='flex' flexDirection='column'>
              {balanceFetchingError ? (
                <Text fontSize={3} my={0}>
                  Error fetching balance
                </Text>
              ) : (
                <>
                  <Text fontSize={3} my={0}>
                    Balance
                  </Text>
                  <Title fontSize={4} my={0}>
                    {balanceForUI} FIL
                  </Title>
                </>
              )}
            </Box>
            {!selected && (
              <Button variant='secondary' title='Select' onClick={onClick} />
            )}
          </Box>
        </Card>
      </Box>
    )
  }
)

AccountCardAlt.propTypes = {
  address: ADDRESS_PROPTYPE,
  index: number.isRequired,
  balance: string,
  onClick: func.isRequired,
  selected: bool,
  jsonRpcEndpoint: string
}

AccountCardAlt.defaultProps = {
  selected: false
}

export default AccountCardAlt
