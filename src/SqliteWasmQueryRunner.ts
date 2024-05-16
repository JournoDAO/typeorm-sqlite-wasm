// import { AbstractSqliteQueryRunner } from 'typeorm/browser/driver/sqlite-abstract/AbstractSqliteQueryRunner.js'
import { SqliteWasmDriver }                                               from './SqliteWasmDriver'
import {
  Broadcaster
}                                                                         from 'typeorm/browser/subscriber/Broadcaster.js'
import { QueryFailedError, QueryResult, QueryRunnerAlreadyReleasedError } from 'typeorm/browser'
// import { SqliteConnectionOptions }                                from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'
import { ConnectionIsNotSetError, }                                       from 'typeorm/browser'
import { SqliteQueryRunner }                                              from './SqliteQueryRunner'
// import { BroadcasterResult } from 'typeorm/browser/subscriber/BroadcasterResult.js'

type SqliteWasmResult = {
  type: string | null
  row: string[] | null
  rowNumber: number | null
  columnNames: string[]
}
type SqliteWasmCallback = ( result: SqliteWasmResult ) => void

type ReturnObj = {
  database: string
  [key: string]: string | number | null | undefined | string[]
}

/**
 * Runs queries on a single sqlite database connection.
 *
 * Does not support compose primary keys with autoincrement field.
 * todo: need to throw exception for this case.
 */
export class SqliteWasmQueryRunner extends SqliteQueryRunner {
  /**
   * Database driver used by connection.
   */
  driver: SqliteWasmDriver

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor( driver: SqliteWasmDriver ) {
    super(driver)
    this.driver      = driver
    this.connection  = driver.connection
    this.broadcaster = new Broadcaster(this)
  }

  /**
   * Called before migrations are run.
   */
  async beforeMigration(): Promise<void> {
    await this.query(`PRAGMA foreign_keys = OFF`)
  }

  /**
   * Called after migrations are run.
   */
  async afterMigration(): Promise<void> {
    await this.query(`PRAGMA foreign_keys = ON`)
  }

  /**
   * Executes a given SQL query.
   */
  query(
    query: string,
    parameters?: any[],
  ): Promise<any> {
    if ( this.isReleased ) throw new QueryRunnerAlreadyReleasedError()

    const connection = this.driver.connection

    if ( !connection.isInitialized ) {
      throw new ConnectionIsNotSetError('sqlite')
    }

    return new Promise(async ( ok, fail ) => {
      try {
        // const databaseConnection = await this.connect()
        // this.driver.connection.logger.logQuery(query, parameters, this)
        // const queryStartTime = +new Date()
        // const isInsertQuery  = query.startsWith('INSERT ')
        // const isDeleteQuery  = query.startsWith('DELETE ')
        // const isUpdateQuery  = query.startsWith('UPDATE ')

        // const execute = async () => {
        //   if ( isInsertQuery || isDeleteQuery || isUpdateQuery ) {
        //     await databaseConnection.run(query, parameters, handler)
        //   } else {
        //     await databaseConnection.all(query, parameters, handler)
        //   }
        // }

        // const self = this
        //
        // const handler = function ( this: any, err: any, rows: any ) {
        //   if ( err && err.toString().indexOf('SQLITE_BUSY:') !== -1 ) {
        //     // if (
        //     //   typeof options.busyErrorRetry === 'number' &&
        //     //   options.busyErrorRetry > 0
        //     // ) {
        //     //   setTimeout(execute, options.busyErrorRetry)
        //     //   return
        //     // }
        //   }
        //
        //   // log slow queries if maxQueryExecution time is set
        //   const queryEndTime       = +new Date()
        //   const queryExecutionTime = queryEndTime - queryStartTime
        //   if (
        //     maxQueryExecutionTime &&
        //     queryExecutionTime > maxQueryExecutionTime
        //   )
        //     connection.logger.logQuerySlow(
        //       queryExecutionTime,
        //       query,
        //       parameters,
        //       self,
        //     )
        //
        //   if ( err ) {
        //     connection.logger.logQueryError(
        //       err,
        //       query,
        //       parameters,
        //       self,
        //     )
        //
        //     return fail(
        //       new QueryFailedError(query, parameters, err),
        //     )
        //   } else {
        //     const result = new QueryResult()
        //
        //     if ( isInsertQuery ) {
        //       result.raw = this['lastID']
        //     } else {
        //       result.raw = rows
        //     }
        //
        //
        //     if ( Array.isArray(rows) ) {
        //       result.records = rows
        //     }
        //
        //     result.affected = this['changes']
        //
        //     if ( useStructuredResult ) {
        //       ok(result)
        //     } else {
        //       ok(result.raw)
        //     }
        //   }
        // }

        const finalResult: SqliteWasmResult[] = []
        //
        // const processResultRows = ( resultRows: any[] ) => {
        //   if ( resultRows.length === 0 ) {
        //     ok([])
        //     return
        //   }
        //
        //   if ( resultRows.length === 1 && resultRows[0].row.length === 1 ) {
        //     ok(resultRows[0][0])
        //     return
        //   }
        //
        //   ok(resultRows)
        // }

        this.driver.sqlite('exec', {
          dbId: this.driver.dbId,
          sql: query,
          bind: parameters,
          callback: (( result ) => {
            if ( !result || !result.row || !result.rowNumber ) {
              console.log(`callback`, finalResult)

              const processedResult = finalResult.reduce(( acc, curr ) => {
                if (
                  Array.isArray(curr.row) &&
                  curr.row?.length > 0 &&
                  curr.columnNames.length > 0
                ) {

                  const returnObj: ReturnObj = {
                    database: this.driver.database as string,
                  }

                  curr.columnNames.forEach(( colName, index: number ) => {
                    if (curr.row && curr.row[index]) {
                      returnObj[colName] = curr.row[index]
                    }
                  })
                  acc.push(returnObj)
                }

                return acc
              }, [] as ReturnObj[])

              console.log(`processedResult`, processedResult)

              ok(processedResult)
              return
            }

            finalResult.push(result)
          }) as SqliteWasmCallback,
        }).then(( result: SqliteWasmResult ) => {
          console.log(`${query}`, result)
        }).catch(( err: Error ) => {
          fail(err)
        })

          } catch ( e ) {
            fail(e)
          }
        })


  }

}
