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

export default class TaskDelete extends Command {
  static args = {
    id: Args.string({ description: 'Task ID', required: true }),
  }

  static description = 'Delete a task'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> 123e4567 --scope current --occurrence-date 2024-01-15',
  ]

  static flags = {
    'occurrence-date': Flags.string({
      description: 'Occurrence date for scoped deletes on recurrent tasks (YYYY-MM-DD)',
    }),
    scope: Flags.string({
      description: 'Scope for recurrent tasks: all, current, following',
      default: 'all',
    }),
    confirm: Flags.boolean({
      char: 'y',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TaskDelete)
    const core = await getCore()

    try {
      const task = await core.tasksService.getTaskOccurrence(args.id)
      if (!task) {
        this.error(`Task not found: ${args.id}`)
        return
      }

      if (!flags.confirm) {
        const confirmed = await askConfirmation(`Are you sure you want to delete task "${task.name}"? (y/N)`)

        if (!confirmed) {
          this.log('Delete cancelled.')
          return
        }
      }

      const occurrenceDate = flags['occurrence-date'] ? new Date(flags['occurrence-date']) : undefined
      const scope = flags.scope as 'all' | 'current' | 'following'

      await core.tasksService.delete(args.id, occurrenceDate, scope)

      this.log(`Task deleted successfully!`)
      this.log(`ID: ${args.id}`)
      this.log(`Scope: ${scope}`)
    } catch (error) {
      this.error(`Failed to delete task: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}