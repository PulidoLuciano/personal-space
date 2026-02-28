import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/create', () => {
  it('runs finance/create cmd', async () => {
    const {stdout} = await runCommand('finance/create')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/create --name oclif', async () => {
    const {stdout} = await runCommand('finance/create --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
