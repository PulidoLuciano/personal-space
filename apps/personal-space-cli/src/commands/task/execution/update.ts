import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../../lib/core.js'

export default class ExecutionUpdate extends Command {
  static args = {
    execution_id: Args.string({ description: 'Execution ID', required: true }),
  }

  static description = 'Update a task execution'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000 --start-time "2024-01-15T09:00:00"',
    '<%= config.bin %> <%= command.id %> 123e4567 --end-time "2024-01-15T10:30:00"',
  ]

  static flags = {
    'start-time': Flags.string({
      description: 'New start time (ISO 8601 format)',
    }),
    'end-time': Flags.string({
      description: 'New end time (ISO 8601 format)',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ExecutionUpdate)
    const core = await getCore()

    if (!flags['start-time'] && !flags['end-time']) {
      this.error('No fields to update. Use --start-time or --end-time.')
      return
    }

    try {
      const updateData: Record<string, Date | null> = {}

      if (flags['start-time']) {
        updateData.start_time = new Date(flags['start-time'])
      }
      if (flags['end-time']) {
        updateData.end_time = new Date(flags['end-time'])
      }

      await core.tasksService.updateExecution(args.execution_id, updateData as never)

      this.log(`Execution updated successfully!`)
      this.log(`Execution ID: ${args.execution_id}`)
      if (flags['start-time']) this.log(`Start Time: ${flags['start-time']}`)
      if (flags['end-time']) this.log(`End Time: ${flags['end-time']}`)
    } catch (error) {
      this.error(`Failed to update execution: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}