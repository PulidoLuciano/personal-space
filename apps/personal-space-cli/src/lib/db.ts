import Database from 'better-sqlite3'
import {DBClient} from 'personal-space-core'

const sqlite = new Database('personal-space.db')

export const db: DBClient = {
  query: async (sql: string, params = []) => {
    return sqlite.prepare(sql).all(...params) as any[]
  },
  queryOne: async (sql: string, params = []) => {
    return sqlite.prepare(sql).get(...params) as any
  },
  execute: async (sql: string, params = []) => {
    const info = sqlite.prepare(sql).run(...params)
    return {insertId: info.lastInsertRowid, changes: info.changes}
  },
}
