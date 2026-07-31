declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: unknown[]): void
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    getRowsModified(): number
    export(): Uint8Array
  }
  export interface Statement {
    bind(values?: unknown[] | Record<string, unknown>): boolean
    step(): boolean
    get(): unknown[]
    free(): boolean
  }
  export interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }
  export default function initSqlJs(): Promise<{
    Database: new (data?: Uint8Array) => Database
  }>
}
