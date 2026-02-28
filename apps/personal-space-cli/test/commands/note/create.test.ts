import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('note/create', () => {
  it('runs note/create cmd', async () => {
    const {stdout} = await runCommand('note/create')
    expect(stdout).to.contain('hello world')
  })

  it('runs note/create --name oclif', async () => {
    const {stdout} = await runCommand('note/create --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
