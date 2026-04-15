import {Args, Command, Flags} from '@oclif/core'
import {getCore} from '../../../lib/core.js'

export default class ExecutionStart extends Command {
  static args = {
    task_id: Args.string({description: 'Task ID', required: true}),
  }

  static description = 'Start time tracking for a task'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> 123e4567 --occurrence-date 2024-01-15',
    '<%= config.bin %> <%= command.id %> 123e4567 --instant',
  ]

  static flags = {
    'occurrence-date': Flags.string({
      description: 'Occurrence date for recurrent tasks (YYYY-MM-DD)',
    }),
    instant: Flags.boolean({
      char: 'i',
      description: 'Mark as completed immediately (instant log)',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ExecutionStart)
    const core = await getCore()

    try {
      const occurrenceDate = flags['occurrence-date'] ? new Date(flags['occurrence-date']) : null

      const executionId = await core.tasksService.startExecution(args.task_id, occurrenceDate, flags.instant)

      if (flags.instant) {
        this.log(`Task execution logged successfully!`)
      } else {
        this.log(`Execution started successfully!`)
      }
      this.log(`Execution ID: ${executionId}`)
      this.log(`Task ID: ${args.task_id}`)
    } catch (error) {
      this.error(`Failed to start execution: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

