import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class NoteUpdate extends Command {
  static args = {
    id: Args.string({description: 'Note id', required: true}),
  }
  static description = 'Update a note'
  static flags = {
    title: Flags.string({description: 'Note title'}),
    content: Flags.string({description: 'Note content'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(NoteUpdate)

    const core = new PersonalCore(db)

    const updateData: {title?: string; content?: string} = {}

    if (flags.title) updateData.title = flags.title
    if (flags.content) updateData.content = flags.content

    if (Object.keys(updateData).length === 0) {
      this.log('No fields to update')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await core.noteService.update(args.id, updateData as any)

    this.log(`Note ${args.id} updated`)
  }
}
