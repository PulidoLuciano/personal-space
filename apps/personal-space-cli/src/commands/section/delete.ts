import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'
import * as readline from 'readline'

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${question} `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

export default class SectionDelete extends Command {
  static args = {
    id: Args.string({ description: 'Section ID', required: true }),
  }

  static description = 'Delete a section'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
  ]

  static flags = {
    confirm: Flags.boolean({
      char: 'y',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SectionDelete)
    const core = await getCore()

    try {
      const existing = await core.sectionsService.getById(args.id, ['id', 'name'])
      if (!existing) {
        this.error(`Section not found: ${args.id}`)
        return
      }

      if (!flags.confirm) {
        const confirmed = await askConfirmation(`Are you sure you want to delete section "${existing.name}"? (y/N)`)

        if (!confirmed) {
          this.log('Delete cancelled.')
          return
        }
      }

      await core.sectionsService.delete(args.id)
      this.log(`Section deleted successfully: ${existing.name}`)
    } catch (error) {
      this.error(`Failed to delete section: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
