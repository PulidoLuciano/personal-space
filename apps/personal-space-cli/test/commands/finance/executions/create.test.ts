import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/executions/create', () => {
  it('runs finance/executions/create cmd', async () => {
    const {stdout} = await runCommand('finance/executions/create')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/executions/create --name oclif', async () => {
    const {stdout} = await runCommand('finance/executions/create --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
