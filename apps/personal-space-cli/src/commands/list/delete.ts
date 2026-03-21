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

export default class ListDelete extends Command {
  static args = {
    id: Args.string({ description: 'List ID', required: true }),
  }

  static description = 'Delete a list (soft delete)'

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
    const { args, flags } = await this.parse(ListDelete)
    const core = await getCore()

    try {
      const existing = await core.listsService.getById(args.id)
      if (!existing) {
        this.error(`List not found: ${args.id}`)
        return
      }

      if (!flags.confirm) {
        const confirmed = await askConfirmation(`Are you sure you want to delete list "${existing.name}"? (y/N)`)

        if (!confirmed) {
          this.log('Delete cancelled.')
          return
        }
      }

      await core.listsService.delete(args.id)
      this.log(`List deleted successfully: ${existing.name}`)
    } catch (error) {
      this.error(`Failed to delete list: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
