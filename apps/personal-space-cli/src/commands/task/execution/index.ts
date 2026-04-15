import { Command } from '@oclif/core'

export default class ExecutionIndex extends Command {
  static description = 'Manage task executions'

  static aliases = ['execution']

  async run(): Promise<void> {
    this.log('Manage task executions. Use task execution --help for available commands.')
  }
}