import { Args, Command } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class ListGet extends Command {
  static args = {
    id: Args.string({ description: 'List ID', required: true }),
  }

  static description = 'Get a list by ID'

  static examples = ['<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000']

  async run(): Promise<void> {
    const { args } = await this.parse(ListGet)
    const core = await getCore()

    try {
      const list = await core.listsService.getById(args.id)

      if (!list) {
        this.error(`List not found: ${args.id}`)
        return
      }

      this.log('List Details:')
      this.log(`  ID:         ${list.id}`)
      this.log(`  Name:       ${list.name}`)
      this.log(`  Color:      ${list.color_id}`)
      this.log(`  Icon:       ${list.icon_id}`)
      this.log(`  Archived:    ${list.is_archived ? 'Yes' : 'No'}`)
      this.log(`  Updated:    ${list.updated_at}`)
    } catch (error) {
      this.error(`Failed to get list: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
