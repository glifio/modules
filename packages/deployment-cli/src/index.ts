#! /usr/bin/env node

import { program } from 'commander'
import { Filelike, getFilesFromPath, Web3Storage } from 'web3.storage'
import { setOutput } from '@actions/core'

program
  .command('ipfs <directory> <token>')
  .description('Store a file path on web3.storage')
  .action(async (directory: string, token: string) => {
    const _files = await getFilesFromPath(directory)
    const files = _files.map(file => ({
      ...file,
      name: `/${file.name.split('/').slice(2).join('/')}`
    }))
    const client = new Web3Storage({ token })
    const cid = await client.put(files as Iterable<Filelike>)
    console.log(cid)
    setOutput('cid', cid)
  })

program.parse()
