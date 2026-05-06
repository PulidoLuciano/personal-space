import {Args, Command, Flags} from '@oclif/core'
import {getCore} from '../../../lib/core.js'

export default class TaskOccurrenceGet extends Command {
  static args = {
    task_id: Args.string({description: 'Task ID', required: true}),
  }

  static description = 'Get details of a specific task occurrence'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> 123e4567 --occurrence-date 2024-01-15',
  ]

  static flags = {
    'occurrence-date': Flags.string({
      description: 'Occurrence date for recurrent tasks (YYYY-MM-DD)',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(TaskOccurrenceGet)
    const core = await getCore()

    try {
      const occurrenceDate = flags['occurrence-date'] ? new Date(flags['occurrence-date']) : null

      const occurrence = await core.tasksService.getTaskOccurrence(args.task_id, occurrenceDate)

      this.log(`\nTask Occurrence Details:`)
      this.log('─'.repeat(80))
      this.log(`Task ID:         ${occurrence.id}`)
      this.log(`Name:            ${occurrence.name}`)
      this.log(`Occurrence Date: ${occurrence.occurrence_date ? occurrence.occurrence_date.toISOString().split('T')[0] : 'N/A'}`)
      this.log(`Location:        ${occurrence.location ?? 'None'}`)
      this.log(`Body:            ${occurrence.body ?? 'None'}`)
      this.log(`Due Date:        ${occurrence.due_date ? occurrence.due_date.toISOString().split('T')[0] : 'None'}`)
      this.log(`Type:            ${occurrence.type}`)
      this.log(`Objective:       ${occurrence.objective}`)
      this.log(`Progress:        ${occurrence.progress}`)
      this.log('')
    } catch (error) {
      this.error(`Failed to get task occurrence: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
