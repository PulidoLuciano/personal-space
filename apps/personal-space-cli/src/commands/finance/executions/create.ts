import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../../lib/db.js'

export default class FinanceExecutionsCreate extends Command {
  static args = {
    financeId: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'Create an execution for a finance'
  static flags = {
    amount: Flags.string({description: 'Execution amount (uses finance amount if not provided)'}),
    currencyId: Flags.string({description: 'Currency name (uses finance currency if not provided)'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(FinanceExecutionsCreate)

    const core = new PersonalCore(db)

    await core.financeService.createExecution(
      args.financeId,
      flags.amount ? Number(flags.amount) : null,
      flags.currencyId ?? null,
    )

    this.log(`Execution created for finance ${args.financeId}`)
  }
}
