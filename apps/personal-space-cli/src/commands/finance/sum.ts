import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceSum extends Command {
  static args = {
    projectId: Args.string({description: 'Project id', required: true}),
    currency: Args.string({description: 'Currency name (e.g., USD, EUR)', required: true}),
  }
  static description = 'Get sum of executions by currency'

  public async run(): Promise<void> {
    const {args} = await this.parse(FinanceSum)

    const core = new PersonalCore(db)

    const sum = await core.financeService.getSumExecutions(
      args.projectId,
      args.currency,
    )

    this.log(JSON.stringify({ total: sum }, null, 2))
  }
}
