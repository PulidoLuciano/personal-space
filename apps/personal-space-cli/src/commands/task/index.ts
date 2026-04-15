import { Command } from '@oclif/core'

export default class TaskIndex extends Command {
  static description = 'Manage tasks'

  static aliases = ['task']

  async run(): Promise<void> {
    this.log('Manage your tasks. Use task --help for available commands.')
  }
}