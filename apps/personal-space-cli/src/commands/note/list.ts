import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class NoteList extends Command {
  static args = {
    projectId: Args.string({description: 'Project id', required: true}),
  }
  static description = 'List notes from a project'
  static flags = {
    page: Flags.integer({default: 1, description: 'Page number'}),
    size: Flags.integer({default: 10, description: 'Page size'}),
    search: Flags.string({description: 'Search text'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(NoteList)

    const core = new PersonalCore(db)

    const notes = await core.noteService.searchNotes(
      args.projectId,
      flags.page,
      flags.size,
      flags.search ?? null,
    )

    if (notes.length === 0) {
      this.log('No notes found')
      return
    }

    this.log(JSON.stringify(notes, null, 2))
  }
}
