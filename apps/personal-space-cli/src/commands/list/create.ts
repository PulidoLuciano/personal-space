import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class ListCreate extends Command {
  static args = {
    name: Args.string({ description: 'Name of the list', required: true }),
  }

  static description = 'Create a new list'

  static examples = [
    '<%= config.bin %> <%= command.id %> "My List"',
    '<%= config.bin %> <%= command.id %> "My List" --color "#FF5733" --icon "star"',
  ]

  static flags = {
    color: Flags.string({
      char: 'c',
      description: 'Hex color for the list (e.g., #FF5733)',
      default: '#777777',
    }),
    icon: Flags.string({
      char: 'i',
      description: 'Icon identifier for the list',
      default: 'circle',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ListCreate)
    const core = await getCore()

    try {
      const id = await core.listsService.create({
        name: args.name,
        color_id: flags.color,
        icon_id: flags.icon,
      })

      this.log(`List created successfully!`)
      this.log(`ID: ${id}`)
      this.log(`Name: ${args.name}`)
      this.log(`Color: ${flags.color}`)
      this.log(`Icon: ${flags.icon}`)
    } catch (error) {
      this.error(`Failed to create list: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
