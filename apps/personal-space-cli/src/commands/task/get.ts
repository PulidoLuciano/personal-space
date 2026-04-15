import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class TaskGet extends Command {
  static args = {
    id: Args.string({ description: 'Task ID', required: true }),
  }

  static description = 'Get task or occurrence details'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> 123e4567 --occurrence-date 2024-01-15',
  ]

  static flags = {
    'occurrence-date': Flags.string({
      description: 'Get specific occurrence for recurrent tasks (YYYY-MM-DD)',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TaskGet)
    const core = await getCore()

    try {
      const occurrenceDate = flags['occurrence-date'] ? new Date(flags['occurrence-date']) : undefined
      const task = await core.tasksService.getTaskOccurrence(args.id, occurrenceDate)

      this.log(`ID: ${task.id}`)
      this.log(`Name: ${task.name}`)
      if (task.occurrence_date) {
        this.log(`Occurrence: ${task.occurrence_date.toISOString().split('T')[0]}`)
      }
      if (task.body) this.log(`Body: ${task.body}`)
      if (task.location) this.log(`Location: ${task.location}`)
      this.log(`Type: ${task.type}`)
      this.log(`Objective: ${task.objective}`)
      this.log(`Progress: ${task.progress}`)
      if (task.due_date) {
        this.log(`Due Date: ${task.due_date.toISOString().split('T')[0]}`)
      }
    } catch (error) {
      this.error(`Failed to get task: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}