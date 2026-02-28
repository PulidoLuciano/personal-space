import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('note/list', () => {
  it('runs note/list cmd', async () => {
    const {stdout} = await runCommand('note/list')
    expect(stdout).to.contain('hello world')
  })

  it('runs note/list --name oclif', async () => {
    const {stdout} = await runCommand('note/list --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
