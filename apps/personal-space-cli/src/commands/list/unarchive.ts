import { Args, Command } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class ListUnarchive extends Command {
  static args = {
    id: Args.string({ description: 'List ID', required: true }),
  }

  static description = 'Unarchive a list'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(ListUnarchive)
    const core = await getCore()

    try {
      const existing = await core.listsService.getById(args.id)
      if (!existing) {
        this.error(`List not found: ${args.id}`)
        return
      }

      if (!existing.is_archived) {
        this.log(`List is not archived: ${existing.name}`)
        return
      }

      await core.listsService.unarchive(args.id)
      this.log(`List unarchived successfully: ${existing.name}`)
    } catch (error) {
      this.error(`Failed to unarchive list: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
