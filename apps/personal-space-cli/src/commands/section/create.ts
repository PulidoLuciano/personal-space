import { Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class SectionCreate extends Command {
  static description = 'Create a new section'

  static examples = [
    '<%= config.bin %> <%= command.id %> --name "My Section" --list-id 123e4567-e89b-12d3-a456-426614174000',
  ]

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name of the section',
      required: true,
    }),
    'list-id': Flags.string({
      char: 'l',
      description: 'ID of the parent list',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(SectionCreate)
    const core = await getCore()

    try {
      const id = await core.sectionsService.create({
        name: flags.name,
        list_id: flags['list-id'],
      })

      this.log(`Section created successfully!`)
      this.log(`ID:      ${id}`)
      this.log(`Name:    ${flags.name}`)
      this.log(`List ID: ${flags['list-id']}`)
    } catch (error) {
      this.error(`Failed to create section: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
