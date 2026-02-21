import {Command} from '@oclif/core'
import {hello} from 'personal-space-core'

export default class World extends Command {
  static args = {}
  static description = 'Say hello world'
  static examples = [
    `<%= config.bin %> <%= command.id %>
hello world! (./src/commands/hello/world.ts)
`,
  ]
  static flags = {}

  async run(): Promise<void> {
    this.log('hello world! (./src/commands/hello/world.ts)')
    this.log(hello)
  }
}
