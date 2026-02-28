import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('note/get', () => {
  it('runs note/get cmd', async () => {
    const {stdout} = await runCommand('note/get')
    expect(stdout).to.contain('hello world')
  })

  it('runs note/get --name oclif', async () => {
    const {stdout} = await runCommand('note/get --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
