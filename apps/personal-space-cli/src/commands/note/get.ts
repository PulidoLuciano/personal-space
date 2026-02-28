import {Args, Command} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class NoteGet extends Command {
  static args = {
    id: Args.string({description: 'Note id', required: true}),
  }
  static description = 'Get a specific note'

  public async run(): Promise<void> {
    const {args} = await this.parse(NoteGet)

    const core = new PersonalCore(db)

    const note = await core.noteService.getNoteById(args.id)

    if (!note) {
      this.log(`Note ${args.id} not found`)
      return
    }

    this.log(JSON.stringify(note, null, 2))
  }
}
