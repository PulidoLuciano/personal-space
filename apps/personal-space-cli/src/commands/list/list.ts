import { Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class ListList extends Command {
  static description = 'List all lists with pagination'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --page 2 --size 20',
    '<%= config.bin %> <%= command.id %> --search "groceries"',
    '<%= config.bin %> <%= command.id %> --archived',
  ]

  static flags = {
    page: Flags.integer({
      char: 'p',
      description: 'Page number (default: 1)',
      default: 1,
    }),
    size: Flags.integer({
      char: 's',
      description: 'Page size (default: 10)',
      default: 10,
    }),
    search: Flags.string({
      char: 'q',
      description: 'Search text to filter lists by name',
    }),
    archived: Flags.boolean({
      char: 'a',
      description: 'Show archived lists instead of active ones',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(ListList)
    const core = await getCore()

    try {
      const lists = await core.listsService.getAllPaginated(
        flags.page,
        flags.size,
        flags.search ?? null,
        flags.archived,
      )

      if (lists.length === 0) {
        this.log(`No lists found${flags.archived ? ' (archived)' : ''}.`)
        return
      }

      this.log(`Lists (Page ${flags.page}, Size ${flags.size})${flags.archived ? ' - Archived' : ''}:`)
      this.log('')

      for (const list of lists) {
        this.log(`  ID:    ${list.id}`)
        this.log(`  Name:  ${list.name}`)
        this.log(`  Color: ${list.color_id} | Icon: ${list.icon_id}`)
        this.log('')
      }

      this.log(`Total: ${lists.length} list(s)`)
    } catch (error) {
      this.error(`Failed to list lists: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
