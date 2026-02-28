import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/get', () => {
  it('runs finance/get cmd', async () => {
    const {stdout} = await runCommand('finance/get')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/get --name oclif', async () => {
    const {stdout} = await runCommand('finance/get --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
