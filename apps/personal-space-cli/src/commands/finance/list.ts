import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceList extends Command {
  static args = {
    projectId: Args.string({description: 'Project id', required: true}),
  }
  static description = 'List finances from a project'
  static flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    size: Flags.integer({default: 10, description: 'Page size'}),
    favorite: Flags.integer({description: 'Filter by favorite (0 or 1)'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(FinanceList)

    const core = new PersonalCore(db)

    const finances = await core.financeService.getFinancesByProjectPaginated(
      args.projectId,
      flags.page,
      flags.size,
      flags.favorite ?? undefined,
    )

    if (finances.length === 0) {
      this.log('No finances found')
      return
    }

    this.log(JSON.stringify(finances, null, 2))
  }
}
