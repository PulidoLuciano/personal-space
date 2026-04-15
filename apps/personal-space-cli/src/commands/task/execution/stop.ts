import { Args, Command } from '@oclif/core'
import { getCore } from '../../../lib/core.js'

export default class ExecutionStop extends Command {
  static args = {
    execution_id: Args.string({ description: 'Execution ID', required: true }),
  }

  static description = 'Stop time tracking for a task execution'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(ExecutionStop)
    const core = await getCore()

    try {
      await core.tasksService.stopExecution(args.execution_id)

      this.log(`Execution stopped successfully!`)
      this.log(`Execution ID: ${args.execution_id}`)
    } catch (error) {
      this.error(`Failed to stop execution: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}