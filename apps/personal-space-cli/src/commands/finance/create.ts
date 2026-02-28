import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceCreate extends Command {
  static args = {
    title: Args.string({description: 'Finance title', required: true}),
    projectId: Args.string({description: 'Project id', required: true}),
    amount: Args.string({description: 'Amount', required: true}),
    currencyId: Args.string({description: 'Currency name (e.g., USD, EUR)', required: true}),
  }
  static description = 'Create a new finance'
  static flags = {
    description: Flags.string({description: 'Finance description'}),
    'with-execution': Flags.boolean({default: false, description: 'Create execution along with finance'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(FinanceCreate)

    const core = new PersonalCore(db)

    const financeId = await core.financeService.createFinance(
      {
        title: args.title,
        // eslint-disable-next-line camelcase
        project_id: args.projectId,
        amount: Number(args.amount),
        // eslint-disable-next-line camelcase
        currency_id: args.currencyId,
        description: flags.description ?? null,
      } as any,
      flags['with-execution'],
    )

    this.log(`Finance created with id: ${financeId}`)
  }
}
