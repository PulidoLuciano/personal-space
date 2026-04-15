import {Command, Flags} from '@oclif/core'
import {getCore} from '../../lib/core.js'

export default class TaskList extends Command {
  static description = 'List tasks by section or date range'

  static examples = [
    '<%= config.bin %> <%= command.id %> --section-id 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> --section-id 123e4567 --completed',
    '<%= config.bin %> <%= command.id %> --start-date 2024-01-01 --end-date 2024-01-31',
  ]

  static flags = {
    'section-id': Flags.string({
      description: 'Filter by section ID',
    }),
    completed: Flags.boolean({
      description: 'Show only completed tasks (vs incomplete)',
      default: false,
    }),
    'start-date': Flags.string({
      description: 'Start date for range (YYYY-MM-DD)',
    }),
    'end-date': Flags.string({
      description: 'End date for range (YYYY-MM-DD)',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(TaskList)
    const core = await getCore()

    const hasSectionId = !!flags['section-id']
    const hasDateRange = !!flags['start-date'] && !!flags['end-date']

    if (!hasSectionId && !hasDateRange) {
      this.error('Provide either --section-id or both --start-date and --end-date')
    }

    if (hasSectionId && hasDateRange) {
      this.error('Cannot use both --section-id and date range together')
    }

    try {
      if (hasSectionId) {
        const tasks = await core.tasksService.getTasksBySection(flags['section-id']!, flags.completed)

        if (tasks.length === 0) {
          this.log(`No ${flags.completed ? 'completed' : 'incomplete'} tasks found.`)
          return
        }

        this.log(`\n${flags.completed ? 'Completed' : 'Incomplete'} Tasks:`)
        this.log('─'.repeat(80))

        for (const task of tasks) {
          const dueDate = task.due_date ? task.due_date.toISOString().split('T')[0] : 'No due date'
          const occDate = task.occurrence_date ? ` (${task.occurrence_date.toISOString().split('T')[0]})` : ''

          this.log(`ID: ${task.id}`)
          this.log(`  Name: ${task.name}${occDate}`)
          this.log(`  Due: ${dueDate}`)
          this.log(`  Type: ${task.type}`)
          this.log(`  Progress: ${task.progress}/${task.objective}`)
          this.log('')
        }
      } else {
        const startDate = new Date(flags['start-date']!)
        const endDate = new Date(flags['end-date']!)

        const tasks = await core.tasksService.getTasksByDateRange(startDate, endDate)

        if (tasks.length === 0) {
          this.log('No tasks found in date range.')
          return
        }

        this.log(`\nTasks (${flags['start-date']} to ${flags['end-date']}):`)
        this.log('─'.repeat(80))

        for (const task of tasks) {
          const occDate = task.occurrence_date ? task.occurrence_date.toISOString().split('T')[0] : 'N/A'
          const status = task.is_complete ? '✓ Complete' : '○ Incomplete'

          this.log(`ID: ${task.id}`)
          this.log(`  Name: ${task.name}`)
          this.log(`  Occurrence: ${occDate}`)
          this.log(`  Status: ${status}`)
          this.log('')
        }
      }
    } catch (error) {
      this.error(`Failed to list tasks: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

