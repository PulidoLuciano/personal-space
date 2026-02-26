import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class Archive extends Command {
  static args = {
    id: Args.string({description: 'Project id', required: true}),
  }
static description = 'Archive a project'

  async run(): Promise<void> {
    const {args} = await this.parse(Archive)

    const core = new PersonalCore(db)

    await core.projectService.archive(args.id)

    this.log(`Project ${args.id} archived`)
  }
}
