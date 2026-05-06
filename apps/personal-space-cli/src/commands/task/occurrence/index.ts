import { Command } from '@oclif/core'

export default class OccurrenceIndex extends Command {
  static description = 'Manage task occurrences'

  static aliases = ['occurrence']

  async run(): Promise<void> {
    this.log('Manage task occurrences. Use task occurrence --help for available commands.')
  }
}