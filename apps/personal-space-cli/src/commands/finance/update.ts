import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceUpdate extends Command {
  static args = {
    id: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'Update a finance'
  static flags = {
    title: Flags.string({description: 'Finance title'}),
    amount: Flags.string({description: 'Amount'}),
    description: Flags.string({description: 'Finance description'}),
    currencyId: Flags.string({description: 'Currency name'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(FinanceUpdate)

    const core = new PersonalCore(db)

    const updateData: {
      title?: string;
      amount?: number;
      description?: string;
      // eslint-disable-next-line camelcase
      currency_id?: string;
    } = {}

    if (flags.title) updateData.title = flags.title
    if (flags.amount) updateData.amount = Number(flags.amount)
    if (flags.description) updateData.description = flags.description
    if (flags.currencyId) updateData.currency_id = flags.currencyId

    if (Object.keys(updateData).length === 0) {
      this.log('No fields to update')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await core.financeService.update(args.id, updateData as any)

    this.log(`Finance ${args.id} updated`)
  }
}
