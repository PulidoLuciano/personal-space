import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/update', () => {
  it('runs finance/update cmd', async () => {
    const {stdout} = await runCommand('finance/update')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/update --name oclif', async () => {
    const {stdout} = await runCommand('finance/update --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
