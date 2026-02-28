import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('finance/unfavorite', () => {
  it('runs finance/unfavorite cmd', async () => {
    const {stdout} = await runCommand('finance/unfavorite')
    expect(stdout).to.contain('hello world')
  })

  it('runs finance/unfavorite --name oclif', async () => {
    const {stdout} = await runCommand('finance/unfavorite --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
