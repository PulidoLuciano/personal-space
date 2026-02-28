import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class ProjectGet extends Command {
  static args = {
    id: Args.string({description: 'Project id', required: true}),
  }
  static description = 'Get a specific project'

  public async run(): Promise<void> {
    const {args} = await this.parse(ProjectGet)

    const core = new PersonalCore(db)

    const project = await core.projectService.getProjectById(args.id)

    if (!project) {
      this.log(`Project ${args.id} not found`)
      return
    }

    this.log(JSON.stringify(project, null, 2))
  }
}
