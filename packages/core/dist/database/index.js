export async function testDatabase(db) {
    const result = await db.queryOne("SELECT sqlite_version() as version;");
    return result?.version;
}
export async function sumSql(db) {
    const result = await db.queryOne("SELECT ? + ? as answer", [10, 5]);
    return result?.answer;
}
//# sourceMappingURL=index.js.map