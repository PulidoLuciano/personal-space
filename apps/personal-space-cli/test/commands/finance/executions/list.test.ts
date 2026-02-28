import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/executions/list', () => {
  it('runs finance/executions/list cmd', async () => {
    const {stdout} = await runCommand('finance/executions/list')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/executions/list --name oclif', async () => {
    const {stdout} = await runCommand('finance/executions/list --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
