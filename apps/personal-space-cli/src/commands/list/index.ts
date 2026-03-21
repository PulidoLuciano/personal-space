import { Command } from '@oclif/core'

export default class ListIndex extends Command {
  static description = 'Manage lists'

  static aliases = ['list']

  async run(): Promise<void> {
    this.log('Manage your lists. Use list --help for available commands.')
  }
}
