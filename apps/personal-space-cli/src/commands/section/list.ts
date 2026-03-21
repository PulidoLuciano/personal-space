import { Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class SectionList extends Command {
  static description = 'List all sections or sections for a specific list'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --list-id 123e4567-e89b-12d3-a456-426614174000',
  ]

  static flags = {
    'list-id': Flags.string({
      char: 'l',
      description: 'Filter sections by list ID',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(SectionList)
    const core = await getCore()

    try {
      let sections

      if (flags['list-id']) {
        sections = await core.sectionsService.getByListId(flags['list-id'])
        this.log(`Sections for list ${flags['list-id']}:`)
      } else {
        sections = await core.sectionsService.getAll()
        this.log('All sections:')
      }

      if (sections.length === 0) {
        this.log('No sections found.')
        return
      }

      this.log('')

      for (const section of sections) {
        this.log(`  ID:      ${section.id}`)
        this.log(`  Name:    ${section.name}`)
        this.log(`  List ID: ${section.list_id}`)
        this.log('')
      }

      this.log(`Total: ${sections.length} section(s)`)
    } catch (error) {
      this.error(`Failed to list sections: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
