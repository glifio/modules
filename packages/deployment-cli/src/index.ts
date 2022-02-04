#! /usr/bin/env node

import { program } from 'commander'
import { getFilesFromPath, Web3Storage } from 'web3.storage'
import axios from 'axios'

program
  .command('ipfs <directory> <token>')
  .description('Store a file path on web3.storage')
  .action(async (directory: string, token: string) => {
    const _files = await getFilesFromPath(directory)
    const files = _files.map((file) => ({
      ...file,
      name: `/${file.name.split('/').slice(2).join('/')}`,
    }))
    const client = new Web3Storage({ token })
    // @ts-expect-error
    const cid = await client.put(files)
    console.log(cid)
  })

program
  .command('cloudflare <apiAddr> <websiteName> <authEmail> <authKey>')
  .description('Update cloudflare proxy')
  .action(
    async (
      apiAddr: string,
      websiteName: string,
      authEmail: string,
      authKey: string,
    ) => {
      try {
        await axios.put(
          apiAddr,
          {
            type: 'A',
            name: websiteName,
            content: '127.0.0.1',
            ttl: '3600',
            proxied: false,
          },
          {
            headers: {
              'X-Auth-Email': authEmail,
              'X-Auth-Key': authKey,
            },
          },
        )

        console.log('success')
      } catch (err) {
        console.error(err instanceof Error ? err.message : JSON.stringify(err))
      }
    },
  )

program.parse()
