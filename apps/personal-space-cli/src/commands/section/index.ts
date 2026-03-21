import { Command } from '@oclif/core'

export default class SectionIndex extends Command {
  static description = 'Manage sections'

  static aliases = ['section']

  async run(): Promise<void> {
    this.log('Manage your sections. Use section --help for available commands.')
  }
}
