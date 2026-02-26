import {Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

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
    const core = new PersonalCore(db)
    this.log('hello world! (./src/commands/hello/world.ts)')
  }
}
