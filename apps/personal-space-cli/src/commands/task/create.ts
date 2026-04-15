import {Args, Command, Flags} from '@oclif/core'
import {getCore} from '../../lib/core.js'

export default class TaskCreate extends Command {
  static args = {
    name: Args.string({description: 'Name of the task', required: true}),
    section_id: Args.string({description: 'Section ID to assign the task to', required: true}),
  }

  static description = 'Create a new task'

  static examples = [
    '<%= config.bin %> <%= command.id %> "My Task" 123e4567-e89b-12d3-a456-426614174000',
    '<%= config.bin %> <%= command.id %> "Exercise" 123e4567 --due-rule "+3d 13:00:00" --recurrency "FREQ=DAILY"',
  ]

  static flags = {
    body: Flags.string({
      char: 'b',
      description: 'Task description',
    }),
    location: Flags.string({
      char: 'l',
      description: 'Location',
    }),
    'due-rule': Flags.string({
      char: 'd',
      description: 'Due rule (e.g., +3d 13:00:00)',
    }),
    type: Flags.string({
      char: 't',
      description: 'Task type: by time, by executions, note',
      default: 'by executions',
    }),
    objective: Flags.integer({
      char: 'o',
      description: 'Target number (minutes for by time, count for by executions)',
      default: 1,
    }),
    recurrency: Flags.string({
      char: 'r',
      description: 'RRule for recurrent tasks (e.g., FREQ=DAILY)',
    }),
    'begin-date': Flags.string({
      description: 'Start date for recurrent tasks (YYYY-MM-DD)',
    }),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(TaskCreate)
    const core = await getCore()

    try {
      const section = await core.sectionsService.getById(args.section_id, [])
      if (!section) {
        this.error(`Section not found: ${args.section_id}`)
      }

      const taskData: Record<string, unknown> = {
        name: args.name,
        section_id: args.section_id,
        body: flags.body ?? null,
        location: flags.location ?? null,
        due_rule: flags['due-rule'] ?? null,
        type: flags.type as 'by time' | 'by executions' | 'note',
        objective: flags.objective,
        recurrency: flags.recurrency ?? null,
        begin_date: flags['begin-date'] ? new Date(flags['begin-date']) : null,
      }

      const id = await core.tasksService.create(taskData as never)

      this.log(`Task created successfully!`)
      this.log(`ID: ${id}`)
      this.log(`Name: ${args.name}`)
      this.log(`Section: ${section.name}`)
      if (flags['due-rule']) this.log(`Due Rule: ${flags['due-rule']}`)
      if (flags.recurrency) this.log(`Recurrency: ${flags.recurrency}`)
      this.log(`Type: ${flags.type}`)
      this.log(`Objective: ${flags.objective}`)
    } catch (error) {
      this.error(`Failed to create task: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

