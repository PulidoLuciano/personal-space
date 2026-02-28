import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceUnfavorite extends Command {
  static args = {
    id: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'Remove favorite from a finance'

  public async run(): Promise<void> {
    const {args} = await this.parse(FinanceUnfavorite)

    const core = new PersonalCore(db)

    await core.financeService.unmakeFavorite(args.id)

    this.log(`Finance ${args.id} unmarked as favorite`)
  }
}
