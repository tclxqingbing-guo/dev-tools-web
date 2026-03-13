declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: unknown[]): void
    exec(sql: string): QueryExecResult[]
    getRowsModified(): number
    export(): Uint8Array
  }
  export interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }
  export default function initSqlJs(): Promise<{
    Database: new (data?: Uint8Array) => Database
  }>
}
