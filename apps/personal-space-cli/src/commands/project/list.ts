import {Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class ProjectList extends Command {
  static description = 'List all projects'
  static flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    size: Flags.integer({default: 10, description: 'Page size'}),
    search: Flags.string({description: 'Search text'}),
    archived: Flags.boolean({default: false, description: 'Show archived projects'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(ProjectList)

    const core = new PersonalCore(db)

    const projects = await core.projectService.getAllPaginated(
      flags.page,
      flags.size,
      flags.search ?? null,
      flags.archived,
    )

    if (projects.length === 0) {
      this.log('No projects found')
      return
    }

    this.log(JSON.stringify(projects, null, 2))
  }
}
