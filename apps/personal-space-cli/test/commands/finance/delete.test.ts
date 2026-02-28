import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/delete', () => {
  it('runs finance/delete cmd', async () => {
    const {stdout} = await runCommand('finance/delete')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/delete --name oclif', async () => {
    const {stdout} = await runCommand('finance/delete --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
