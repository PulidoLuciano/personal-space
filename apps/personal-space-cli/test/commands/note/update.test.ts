import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('note/update', () => {
  it('runs note/update cmd', async () => {
    const {stdout} = await runCommand('note/update')
    expect(stdout).to.contain('hello world')
  })

  it('runs note/update --name oclif', async () => {
    const {stdout} = await runCommand('note/update --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
