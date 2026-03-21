import { Args, Command } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class SectionGet extends Command {
  static args = {
    id: Args.string({ description: 'Section ID', required: true }),
  }

  static description = 'Get a section by ID'

  static examples = ['<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000']

  async run(): Promise<void> {
    const { args } = await this.parse(SectionGet)
    const core = await getCore()

    try {
      const section = await core.sectionsService.getById(args.id, ['id', 'name', 'list_id', 'updated_at'])

      if (!section) {
        this.error(`Section not found: ${args.id}`)
        return
      }

      this.log('Section Details:')
      this.log(`  ID:       ${section.id}`)
      this.log(`  Name:     ${section.name}`)
      this.log(`  List ID:  ${section.list_id}`)
      this.log(`  Updated:  ${section.updated_at}`)
    } catch (error) {
      this.error(`Failed to get section: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
