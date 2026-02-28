import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class FinanceDelete extends Command {
  static args = {
    id: Args.string({description: 'Finance id', required: true}),
  }
  static description = 'Delete a finance'

  public async run(): Promise<void> {
    const {args} = await this.parse(FinanceDelete)

    const core = new PersonalCore(db)

    await core.financeService.delete(args.id)

    this.log(`Finance ${args.id} deleted`)
  }
}
