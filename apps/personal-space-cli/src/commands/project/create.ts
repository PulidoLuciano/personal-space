import {Args, Command, Flags} from '@oclif/core'
import PersonalCore from 'personal-space-core'

import {db} from '../../lib/db.js'

export default class Create extends Command {
  static args = {
    name: Args.string({description: 'Project name', required: true}),
  }
  static description = 'Create a new project'
  static flags = {
    color: Flags.string({default: '#1565C0', description: 'Project color (hex)'}),
    icon: Flags.string({default: 'circle', description: 'Project icon'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)

    const core = new PersonalCore(db)

    const project = await core.projectService.create({
      // eslint-disable-next-line camelcase
      color_id: flags.color,
      // eslint-disable-next-line camelcase
      icon_id: flags.icon,
      name: args.name,
      // eslint-disable-next-line camelcase
      updated_at: new Date().toISOString(),
    } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

    this.log(`Project created with id: ${project}`)
  }
}
