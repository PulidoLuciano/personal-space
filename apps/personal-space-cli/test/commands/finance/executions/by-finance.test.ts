import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/executions/by-finance', () => {
  it('runs finance/executions/by-finance cmd', async () => {
    const {stdout} = await runCommand('finance/executions/by-finance')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/executions/by-finance --name oclif', async () => {
    const {stdout} = await runCommand('finance/executions/by-finance --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
