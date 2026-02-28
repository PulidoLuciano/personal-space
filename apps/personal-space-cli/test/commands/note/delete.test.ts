import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('note/delete', () => {
  it('runs note/delete cmd', async () => {
    const {stdout} = await runCommand('note/delete')
    expect(stdout).to.contain('hello world')
  })

  it('runs note/delete --name oclif', async () => {
    const {stdout} = await runCommand('note/delete --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
