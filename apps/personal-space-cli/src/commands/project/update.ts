import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class Update extends Command {
  static args = {
    id: Args.string({description: 'Project id', required: true}),
  }
  static description = 'Update a project'
  static flags = {
    color: Flags.string({description: 'Project color (hex)'}),
    icon: Flags.string({description: 'Project icon'}),
    name: Flags.string({description: 'Project name'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Update)

    const core = new PersonalCore(db)

    const updateData: {color_id?: string; icon_id?: string; name?: string} = {}

    if (flags.name) updateData.name = flags.name
    // eslint-disable-next-line camelcase
    if (flags.color) updateData.color_id = flags.color
    // eslint-disable-next-line camelcase
    if (flags.icon) updateData.icon_id = flags.icon

    if (Object.keys(updateData).length === 0) {
      this.log('No fields to update')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await core.projectService.update(args.id, updateData as any)

    this.log(`Project ${args.id} updated`)
  }
}
