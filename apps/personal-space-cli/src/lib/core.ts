import {PersonalCore} from 'personal-space-core'
import {db} from './db.js'

let coreInstance: PersonalCore | null = null

export async function getCore(): Promise<PersonalCore> {
  if (!coreInstance) {
    coreInstance = await PersonalCore.initialize(db)
  }
  return coreInstance
}
