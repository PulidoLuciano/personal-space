import { Command } from '@oclif/core'

export default class Hello extends Command {
  static description = 'Personal Space CLI'

  static examples = [
    '$ personal-space hello',
  ]

  async run(): Promise<void> {
    this.log('Welcome to Personal Space CLI!')
  }
}
