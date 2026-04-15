import { Args, Command, Flags } from '@oclif/core'
import { getCore } from '../../lib/core.js'

export default class TaskUpdate extends Command {
  static args = {
    id: Args.string({ description: 'Task ID', required: true }),
  }

  static description = 'Update an existing task'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000 --name "New Name"',
    '<%= config.bin %> <%= command.id %> 123e4567 --objective 30 --scope current --occurrence-date 2024-01-15',
  ]

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'New name for the task',
    }),
    body: Flags.string({
      char: 'b',
      description: 'New body/description',
    }),
    location: Flags.string({
      char: 'l',
      description: 'New location',
    }),
    'due-rule': Flags.string({
      char: 'd',
      description: 'New due rule',
    }),
    type: Flags.string({
      char: 't',
      description: 'New type: by time, by executions, note',
    }),
    objective: Flags.integer({
      char: 'o',
      description: 'New objective number',
    }),
    recurrency: Flags.string({
      char: 'r',
      description: 'New recurrency (RRule)',
    }),
    'occurrence-date': Flags.string({
      description: 'Occurrence date for scoped updates on recurrent tasks (YYYY-MM-DD)',
    }),
    scope: Flags.string({
      description: 'Scope for recurrent tasks: all, current, following',
      default: 'all',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TaskUpdate)
    const core = await getCore()

    const updateData: Record<string, unknown> = {}
    if (flags.name) updateData.name = flags.name
    if (flags.body !== undefined) updateData.body = flags.body
    if (flags.location !== undefined) updateData.location = flags.location
    if (flags['due-rule']) updateData.due_rule = flags['due-rule']
    if (flags.type) updateData.type = flags.type
    if (flags.objective) updateData.objective = flags.objective
    if (flags.recurrency) updateData.recurrency = flags.recurrency

    if (Object.keys(updateData).length === 0) {
      this.error('No fields to update. Use --name, --body, --location, --due-rule, --type, --objective, or --recurrency.')
      return
    }

    try {
      const occurrenceDate = flags['occurrence-date'] ? new Date(flags['occurrence-date']) : undefined
      const scope = flags.scope as 'all' | 'current' | 'following'

      await core.tasksService.update(args.id, updateData as never, occurrenceDate, scope)

      this.log(`Task updated successfully!`)
      this.log(`ID: ${args.id}`)
      this.log(`Scope: ${scope}`)
      if (occurrenceDate) {
        this.log(`Occurrence Date: ${flags['occurrence-date']}`)
      }
    } catch (error) {
      this.error(`Failed to update task: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}