import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../../lib/db.js'

export default class FinanceExecutionsList extends Command {
  static args = {
    projectId: Args.string({description: 'Project id', required: true}),
  }
  static description = 'List executions by project'
  static flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    size: Flags.integer({default: 10, description: 'Page size'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(FinanceExecutionsList)

    const core = new PersonalCore(db)

    const executions = await core.financeService.getExecutionsByProject(
      args.projectId,
      flags.page,
      flags.size,
    )

    if (executions.length === 0) {
      this.log('No executions found')
      return
    }

    this.log(JSON.stringify(executions, null, 2))
  }
}
