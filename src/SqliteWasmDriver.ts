import { AbstractSqliteDriver } from "typeorm/browser/driver/sqlite-abstract/AbstractSqliteDriver.js";
import { SqliteConnectionOptions } from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'
import { ColumnType, DriverPackageNotInstalledError, QueryRunner, ReplicationMode, DataSource, } from 'typeorm/browser/index.js'
import { SqliteQueryRunner }                                                        from './SqliteWasmQueryRunner'
import { filepathToName, } from 'typeorm/browser/util/PathUtils.js'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

// declare module '@sqlite.org/sqlite-wasm' {
//   export function sqlite3Worker1Promiser(...args: any): any
// }

/**
 * Organizes communication with sqlite DBMS.
 */
export class SqliteWasmDriver extends AbstractSqliteDriver {
     // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Connection options.
     */
    options: SqliteConnectionOptions

    /**
     * SQLite underlying library.
     */
    declare sqlite: any

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(connection: DataSource) {
        super(connection)
        this.connection = connection
        this.options = connection.options as SqliteConnectionOptions
        this.database = this.options.database
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    async initialize(): Promise<void> {
        try {

            console.log(sqlite3InitModule())

            // @ts-ignore
            if (window && !!window.sqlite3Worker1Promiser) {
              const promiser = await new Promise((resolve) => {
                //@ts-ignore
                const _promiser = window.sqlite3Worker1Promiser({
                  onready: () => {
                    resolve(_promiser);
                  },
                });
              })

              // console.log(promiser)

              console.log('Done initializing. Running demo...');

              let response;

              //@ts-ignore
              response = await promiser('config-get', {});
              console.log('Running SQLite3 version', response.result.version.libVersion);

              //@ts-ignore
              response = await promiser('open', {
                filename: 'file:typeorm.sqlite3?vfs=opfs',
              });
              const { dbId } = response;
              console.log(`dbId: ${dbId}`)
              console.log(
                'OPFS is available, created persisted database at',
                response.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1'),
              );
              this.sqlite = response
            }


            // Your SQLite code here.
        } catch (e) {
            throw new DriverPackageNotInstalledError("SQLite WASM", "@sqlite.org/sqlite-wasm")
        }
    }

    /**
     * Closes connection with database.
     */
    async disconnect(): Promise<void> {
        return new Promise<void>((ok, fail) => {
            this.queryRunner = undefined
            this.databaseConnection.close((err: any) =>
                err ? fail(err) : ok(),
            )
        })
    }

    /**
     * Creates a query runner used to execute database queries.
     */
    createQueryRunner(mode: ReplicationMode): QueryRunner {
        if (!this.queryRunner) this.queryRunner = new SqliteQueryRunner(this)

        return this.queryRunner
    }

    normalizeType(column: {
        type?: ColumnType
        length?: number | string
        precision?: number | null
        scale?: number
    }): string {
        // if ((column.type as any) === Buffer) {
        //     return "blob"
        // }

        return super.normalizeType(column)
    }

    async afterConnect(): Promise<void> {
        return this.attachDatabases()
    }

    /**
     * For SQLite, the database may be added in the decorator metadata. It will be a filepath to a database file.
     */
    buildTableName(
        tableName: string,
        _schema?: string,
        database?: string,
    ): string {
        if (!database) return tableName
        if (this.getAttachedDatabaseHandleByRelativePath(database))
            return `${this.getAttachedDatabaseHandleByRelativePath(
                database,
            )}.${tableName}`

        if (database === this.options.database) return tableName

        // we use the decorated name as supplied when deriving attach handle (ideally without non-portable absolute path)
        const identifierHash = filepathToName(database)
        // decorated name will be assumed relative to main database file when non absolute. Paths supplied as absolute won't be portable
        // const absFilepath = isAbsolute(database)
        //     ? database
        //     : path.join(this.getMainDatabasePath(), database)
        //
        // this.attachedDatabases[database] = {
        //     attachFilepathAbsolute: absFilepath,
        //     attachFilepathRelative: database,
        //     attachHandle: identifierHash,
        // }

        return `${identifierHash}.${tableName}`
    }

     // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Creates connection with the database.
     */
    protected async createDatabaseConnection() {

    }


    /**
     * Auto creates database directory if it does not exist.
     */
    protected async createDatabaseDirectory(fullPath: string): Promise<void> {
        // await mkdirp(path.dirname(fullPath))
    }

     /**
     * Performs the attaching of the database files. The attachedDatabase should have been populated during calls to #buildTableName
     * during EntityMetadata production (see EntityMetadata#buildTablePath)
     *
     * https://sqlite.org/lang_attach.html
     */
    protected async attachDatabases() {
        // @todo - possibly check number of databases (but unqueriable at runtime sadly) - https://www.sqlite.org/limits.html#max_attached
        for await (const {
            attachHandle,
            attachFilepathAbsolute,
        } of Object.values(this.attachedDatabases)) {
            await this.createDatabaseDirectory(attachFilepathAbsolute)
            await this.connection.query(
                `ATTACH "${attachFilepathAbsolute}" AS "${attachHandle}"`,
            )
        }
    }

}
