import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../../lib/db.js'

export default class FinanceExecutionsByFinance extends Command {
  static args = {
    financeId: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'List executions by finance'
  static flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    size: Flags.integer({default: 10, description: 'Page size'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(FinanceExecutionsByFinance)

    const core = new PersonalCore(db)

    const executions = await core.financeService.getExecutionsByFinance(
      args.financeId,
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
