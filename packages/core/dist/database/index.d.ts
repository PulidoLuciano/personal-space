export interface DBClient {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    queryOne<T>(sql: string, params?: any[]): Promise<T | undefined>;
    execute(sql: string, params?: any[]): Promise<{
        insertId?: number | bigint;
        changes: number;
    }>;
}
export declare function createDatabase(db: DBClient): Promise<void>;
//# sourceMappingURL=index.d.ts.map