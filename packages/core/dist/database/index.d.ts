export interface DBClient {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    queryOne<T>(sql: string, params?: any[]): Promise<T | undefined>;
    execute(sql: string, params?: any[]): Promise<{
        insertId?: number | bigint;
        changes: number;
    }>;
}
export declare function testDatabase(db: DBClient): Promise<string | undefined>;
export declare function sumSql(db: DBClient): Promise<number | undefined>;
//# sourceMappingURL=index.d.ts.map