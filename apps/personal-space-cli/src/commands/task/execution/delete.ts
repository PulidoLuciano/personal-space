import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../../lib/core.js'
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

export default class ExecutionDelete extends Command {
  static args = {
    execution_id: Args.string({ description: 'Execution ID', required: true }),
  }

  static description = 'Delete a task execution'

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
    const { args, flags } = await this.parse(ExecutionDelete)
    const core = await getCore()

    try {
      const executions = await core.tasksService.getExecutionsByTaskAndDate(args.execution_id, new Date())
      const execution = executions.find((e: { id: string }) => e.id === args.execution_id)

      if (!execution && executions.length > 0) {
        const found = executions.find((e: { id: string }) => e.id === args.execution_id)
        if (!found) {
          this.error(`Execution not found: ${args.execution_id}`)
          return
        }
      }

      if (!flags.confirm) {
        const confirmed = await askConfirmation(`Are you sure you want to delete this execution? (y/N)`)

        if (!confirmed) {
          this.log('Delete cancelled.')
          return
        }
      }

      await core.tasksService.deleteExecution(args.execution_id)

      this.log(`Execution deleted successfully!`)
      this.log(`Execution ID: ${args.execution_id}`)
    } catch (error) {
      this.error(`Failed to delete execution: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}