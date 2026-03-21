import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class ListUpdate extends Command {
  static args = {
    id: Args.string({ description: 'List ID', required: true }),
  }

  static description = 'Update an existing list'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000 --name "New Name"',
    '<%= config.bin %> <%= command.id %> 123e4567 --color "#00FF00"',
  ]

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'New name for the list',
    }),
    color: Flags.string({
      char: 'c',
      description: 'New hex color for the list (e.g., #FF5733)',
    }),
    icon: Flags.string({
      char: 'i',
      description: 'New icon identifier for the list',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListUpdate)
    const core = await getCore()

    const updateData: Record<string, string> = {}
    if (flags.name) updateData.name = flags.name
    if (flags.color) updateData.color_id = flags.color
    if (flags.icon) updateData.icon_id = flags.icon

    if (Object.keys(updateData).length === 0) {
      this.error('No fields to update. Use --name, --color, or --icon.')
      return
    }

    try {
      const existing = await core.listsService.getById(args.id)
      if (!existing) {
        this.error(`List not found: ${args.id}`)
        return
      }

      await core.listsService.update(args.id, updateData as any)

      this.log(`List updated successfully!`)
      this.log(`ID: ${args.id}`)

      const updated = await core.listsService.getById(args.id)
      if (updated) {
        this.log(`Name:   ${updated.name}`)
        this.log(`Color:  ${updated.color_id}`)
        this.log(`Icon:   ${updated.icon_id}`)
      }
    } catch (error) {
      this.error(`Failed to update list: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
