import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceFavorite extends Command {
  static args = {
    id: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'Make a finance favorite'

  public async run(): Promise<void> {
    const {args} = await this.parse(FinanceFavorite)

    const core = new PersonalCore(db)

    await core.financeService.makeFavorite(args.id)

    this.log(`Finance ${args.id} marked as favorite`)
  }
}
