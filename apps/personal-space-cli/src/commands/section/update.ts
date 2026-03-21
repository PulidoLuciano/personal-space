import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class SectionUpdate extends Command {
  static args = {
    id: Args.string({ description: 'Section ID', required: true }),
  }

  static description = 'Update a section'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000 --name "New Name"',
  ]

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'New name for the section',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SectionUpdate)
    const core = await getCore()

    if (!flags.name) {
      this.error('No fields to update. Use --name.')
      return
    }

    try {
      const existing = await core.sectionsService.getById(args.id, ['id', 'name', 'list_id'])
      if (!existing) {
        this.error(`Section not found: ${args.id}`)
        return
      }

      await core.sectionsService.update(args.id, { name: flags.name } as any)

      this.log(`Section updated successfully!`)
      this.log(`ID:   ${args.id}`)

      const updated = await core.sectionsService.getById(args.id, ['id', 'name', 'list_id'])
      if (updated) {
        this.log(`Name: ${updated.name}`)
      }
    } catch (error) {
      this.error(`Failed to update section: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
