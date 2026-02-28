import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class NoteCreate extends Command {
  static args = {
    title: Args.string({description: 'Note title', required: true}),
    projectId: Args.string({description: 'Project id', required: true}),
  }
  static description = 'Create a new note'
  static flags = {
    content: Flags.string({description: 'Note content'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(NoteCreate)

    const core = new PersonalCore(db)

    const noteId = await core.noteService.create({
      // eslint-disable-next-line camelcase
      project_id: args.projectId,
      title: args.title,
      content: flags.content ?? null,
    } as any)

    this.log(`Note created with id: ${noteId}`)
  }
}
