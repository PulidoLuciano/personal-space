import { Args, Command } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class ListArchive extends Command {
  static args = {
    id: Args.string({ description: 'List ID', required: true }),
  }

  static description = 'Archive a list'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(ListArchive)
    const core = await getCore()

    try {
      const existing = await core.listsService.getById(args.id)
      if (!existing) {
        this.error(`List not found: ${args.id}`)
        return
      }

      if (existing.is_archived) {
        this.log(`List is already archived: ${existing.name}`)
        return
      }

      await core.listsService.archive(args.id)
      this.log(`List archived successfully: ${existing.name}`)
    } catch (error) {
      this.error(`Failed to archive list: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
