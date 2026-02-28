import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/list', () => {
  it('runs finance/list cmd', async () => {
    const {stdout} = await runCommand('finance/list')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/list --name oclif', async () => {
    const {stdout} = await runCommand('finance/list --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
