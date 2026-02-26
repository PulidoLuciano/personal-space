import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class Delete extends Command {
  static args = {
    id: Args.string({description: 'Project id', required: true}),
  }
static description = 'Delete a project'

  async run(): Promise<void> {
    const {args} = await this.parse(Delete)

    const core = new PersonalCore(db)

    await core.projectService.delete(args.id)

    this.log(`Project ${args.id} deleted`)
  }
}
