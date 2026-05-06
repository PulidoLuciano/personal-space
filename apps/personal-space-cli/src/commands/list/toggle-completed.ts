import {Args, Command} from '@oclif/core'
import {getCore} from '../../lib/core.js'

export default class ListToggleCompleted extends Command {
  static args = {
    id: Args.string({description: 'List ID', required: true}),
  }

  static description = 'Toggle show_completed setting for a list'

  static examples = [
    '<%= config.bin %> <%= command.id %> 123e4567-e89b-12d3-a456-426614174000',
  ]

  public async run(): Promise<void> {
    const {args} = await this.parse(ListToggleCompleted)
    const core = await getCore()

    try {
      await core.listsService.toggleShowCompleted(args.id)
      const list = await core.listsService.getById(args.id)
      if (!list) {
        this.error('List not found after toggling')
        return
      }
      this.log(`List show_completed toggled successfully!`)
      this.log(`ID: ${list.id}`)
      this.log(`Name: ${list.name}`)
      this.log(`Show Completed: ${list.show_completed ? 'Yes' : 'No'}`)
    } catch (error) {
      this.error(`Failed to toggle show_completed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
