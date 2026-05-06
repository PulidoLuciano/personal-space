import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('task/occurrence/get', () => {
  it('runs task/occurrence/get cmd', async () => {
    const {stdout} = await runCommand('task/occurrence/get')
    expect(stdout).to.contain('hello world')
  })

  it('runs task/occurrence/get --name oclif', async () => {
    const {stdout} = await runCommand('task/occurrence/get --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
