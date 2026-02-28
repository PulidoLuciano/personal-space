import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('project/get', () => {
  it('runs project/get cmd', async () => {
    const {stdout} = await runCommand('project/get')
    expect(stdout).to.contain('hello world')
  })

  it('runs project/get --name oclif', async () => {
    const {stdout} = await runCommand('project/get --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
