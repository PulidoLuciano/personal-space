import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceGet extends Command {
  static args = {
    id: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'Get a finance by id'

  public async run(): Promise<void> {
    const {args} = await this.parse(FinanceGet)

    const core = new PersonalCore(db)

    const finance = await core.financeService.getFinanceById(args.id)

    if (!finance) {
      this.log(`Finance ${args.id} not found`)
      return
    }

    this.log(JSON.stringify(finance, null, 2))
  }
}
