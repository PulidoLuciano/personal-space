import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class NoteDelete extends Command {
  static args = {
    id: Args.string({description: 'Note id', required: true}),
  }
  static description = 'Delete a note'

  public async run(): Promise<void> {
    const {args} = await this.parse(NoteDelete)

    const core = new PersonalCore(db)

    await core.noteService.delete(args.id)

    this.log(`Note ${args.id} deleted`)
  }
}
