import {Args, Command, Flags} from '@oclif/core'
import {getCore} from '../../../lib/core.js'

export default class ExecutionList extends Command {
  static args = {
    task_id: Args.string({description: 'Task ID', required: true}),
  }

  static description = 'List executions for a task'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> 123e4567 --occurrence-date 2024-01-15',
  ]

  static flags = {
    'occurrence-date': Flags.string({
      description: 'Filter by specific occurrence (YYYY-MM-DD)',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(ExecutionList)
    const core = await getCore()

    try {
      let executions
      const occurrenceDate = flags['occurrence-date'] ? new Date(flags['occurrence-date']) : null
      executions = await core.tasksService.getExecutionsByTaskAndDate(args.task_id, occurrenceDate)

      if (!executions || executions.length === 0) {
        this.log('No executions found.')
        return
      }

      this.log(`\nExecutions for Task ${args.task_id}:`)
      this.log('─'.repeat(80))

      for (const exec of executions) {
        const startTime = new Date(exec.start_time).toISOString()
        const endTime = exec.end_time ? new Date(exec.end_time).toISOString() : 'Running'

        this.log(`ID: ${exec.id}`)
        this.log(`  Start: ${startTime}`)
        this.log(`  End: ${endTime}`)

        if (exec.end_time) {
          const durationMs = new Date(exec.end_time).getTime() - new Date(exec.start_time).getTime()
          const seconds = Math.floor(durationMs / 1000)
          const minutes = Math.floor(seconds / 60)
          const hours = Math.floor(minutes / 60)
          const displayMinutes = minutes % 60
          const displaySeconds = seconds % 60
          this.log(`  Duration: ${hours}h ${displayMinutes}m ${displaySeconds}s`)
        }

        this.log('')
      }
    } catch (error) {
      this.error(`Failed to list executions: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

