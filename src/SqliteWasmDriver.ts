import { SqliteConnectionOptions }                                                  from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'
import { ColumnType, DriverPackageNotInstalledError, ReplicationMode, DataSource, } from 'typeorm/browser/index.js'
import { SqliteWasmQueryRunner }                                                    from './SqliteWasmQueryRunner'
import {
  filepathToName,
}                                                                                   from 'typeorm/browser/util/PathUtils.js'
import { SqliteDriver }                                                             from './SqliteDriver'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'


/**
 * Organizes communication with sqlite DBMS.
 */
export class SqliteWasmDriver extends SqliteDriver {
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
  sqlite: any

  dbPath: string | undefined
  dbId: string | undefined


  // -------------------------------------------------------------------------
  // Protected Properties
  // -------------------------------------------------------------------------

  /**
   * Any attached databases (excepting default 'main')
   */
  // attachedDatabases: DatabasesMap = {}


  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor( connection: DataSource ) {
    super(connection)
    this.connection = connection
    this.options    = {
      ...connection.options,
      type: 'sqlite',
      database: 'test'
    } as SqliteConnectionOptions
    this.database   = this.options.database
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Performs connection to the database.
   */
  async connect(): Promise<void> {
    if ( !this.sqlite ) {
      await this.initialize()
    }
    await this.sqlite('open', {
      filename: `file:${this.database}.sqlite3?vfs=opfs`,
    })
  }

  async initialize(): Promise<void> {
    try {

      console.log('Initializing SqliteWasmDriver')

      //@ts-ignore
      if ( window && !window.sqlite3Worker1Promiser ) {
        await sqlite3InitModule()
      }

      // @ts-ignore
      if ( window && !!window.sqlite3Worker1Promiser ) {
        const promiser = await new Promise(( resolve ) => {
          //@ts-ignore
          const _promiser = window.sqlite3Worker1Promiser({
            onready: () => {
              resolve(_promiser)
            },
          })
        })

        this.sqlite = promiser

        // console.log(promiser)

        console.log('Done initializing. Running demo...')

        let response

        //@ts-ignore
        response = await promiser('config-get', {})
        console.log('Running SQLite3 version', response.result.version.libVersion)

        //@ts-ignore
        response     = await promiser('open', {
          filename: `file:${this.database}.sqlite3?vfs=opfs`,
        })
        this.dbPath  = `file:${this.database}.sqlite3?vfs=opfs`
        const {dbId} = response
        this.dbId    = dbId
        console.log(`dbId: ${dbId}`)
        console.log(
          'OPFS is available, created persisted database at',
          response.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, '$1'),
        )
      }


      // Your SQLite code here.
    } catch ( e ) {
      throw new DriverPackageNotInstalledError('SQLite WASM', '@sqlite.org/sqlite-wasm')
    }
  }

  /**
   * Closes connection with database.
   */
  async disconnect(): Promise<void> {
    return new Promise<void>(( ok, fail ) => {
      this.queryRunner = undefined
      this.sqlite('close', {
        dbId: this.dbId,
      }).then(() => {
        ok()
      }).catch(( err: any ) => {
        fail(err)
      })
    })
  }

  /**
   * Creates a query runner used to execute database queries.
   */
  // @ts-ignore
  createQueryRunner( mode: ReplicationMode ): SqliteWasmQueryRunner {
    console.log('createQueryRunner', mode)
    // @ts-ignore
    if ( !this.queryRunner ) this.queryRunner = new SqliteWasmQueryRunner(this)

    // @ts-ignore
    return this.queryRunner as SqliteWasmQueryRunner
  }

  normalizeType( column: {
    type?: ColumnType
    length?: number | string
    precision?: number | null
    scale?: number
  } ): string {
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
    if ( !database ) return tableName
    if (
      this.hasAttachedDatabases() &&
      this.getAttachedDatabaseHandleByRelativePath(database)
    )
      return `${this.getAttachedDatabaseHandleByRelativePath(
        database,
      )}.${tableName}`

    if ( database === this.options.database ) {
      return tableName
    }

    // we use the decorated name as supplied when deriving attach handle (ideally without non-portable absolute path)
    const identifierHash = filepathToName(database)

    return `${identifierHash}.${tableName}`
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Creates connection with the database.
   */
  protected async createDatabaseConnection() {
    //@ts-ignore
    if ( window && window.sqlite3Worker1Promiser ) {
      const promiser = await new Promise(( resolve ) => {
        //@ts-ignore
        const _promiser = window.sqlite3Worker1Promiser({
          onready: () => {
            resolve(_promiser)
          },
        })
      })

      //@ts-ignore
      await promiser('open', {
        filename: `file:${this.database}.sqlite3?vfs=opfs`,
      })
    }
  }

  /**
   * If driver dependency is not given explicitly, then try to load it via "require".
   */
  protected loadDependencies(): void {
    // try {
    //     const sqlite = this.options.driver || PlatformTools.load("sqlite3")
    //     this.sqlite = sqlite.verbose()
    // } catch (e) {
    //     throw new DriverPackageNotInstalledError("SQLite", "sqlite3")
    // }
  }

  protected getMainDatabasePath(): string {
    return this.dbPath || this.options.database
  }


}
