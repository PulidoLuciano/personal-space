import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('list/toggle-completed', () => {
  it('runs list/toggle-completed cmd', async () => {
    const {stdout} = await runCommand('list/toggle-completed')
    expect(stdout).to.contain('hello world')
  })

  it('runs list/toggle-completed --name oclif', async () => {
    const {stdout} = await runCommand('list/toggle-completed --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
