import Database from 'better-sqlite3'
import {DBClient} from 'personal-space-core'

const sqlite = new Database('personal-space.db')

export const db: DBClient = {
  async execute(sql: string, params = []) {
    const info = sqlite.prepare(sql).run(...params)
    return {changes: info.changes, insertId: info.lastInsertRowid}
  },
  async query(sql: string, params = []) {
    return sqlite.prepare(sql).all(...params) as any[]
  },
  async queryOne(sql: string, params = []) {
    return sqlite.prepare(sql).get(...params) as any
  },
}
