import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/sum', () => {
  it('runs finance/sum cmd', async () => {
    const {stdout} = await runCommand('finance/sum')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/sum --name oclif', async () => {
    const {stdout} = await runCommand('finance/sum --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
