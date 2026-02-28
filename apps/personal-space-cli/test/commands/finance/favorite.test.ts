import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/favorite', () => {
  it('runs finance/favorite cmd', async () => {
    const {stdout} = await runCommand('finance/favorite')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/favorite --name oclif', async () => {
    const {stdout} = await runCommand('finance/favorite --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
