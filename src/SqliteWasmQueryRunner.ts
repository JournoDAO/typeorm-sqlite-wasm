import { AbstractSqliteQueryRunner } from 'typeorm/browser/driver/sqlite-abstract/AbstractSqliteQueryRunner.js'
import { SqliteWasmDriver } from "./SqliteWasmDriver"
import { Broadcaster }               from 'typeorm/browser/subscriber/Broadcaster.js'
import { QueryRunnerAlreadyReleasedError } from 'typeorm/browser'
import { SqliteConnectionOptions }                                from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'
import { ConnectionIsNotSetError, QueryFailedError, QueryResult } from 'typeorm/browser'
import { BroadcasterResult } from 'typeorm/browser/subscriber/BroadcasterResult.js'


/**
 * Runs queries on a single sqlite database connection.
 *
 * Does not support compose primary keys with autoincrement field.
 * todo: need to throw exception for this case.
 */
export class SqliteQueryRunner extends AbstractSqliteQueryRunner {
    /**
     * Database driver used by connection.
     */
    driver: SqliteWasmDriver

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(driver: SqliteWasmDriver) {
        super()
        this.driver = driver
        this.connection = driver.connection
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
        useStructuredResult = false,
    ): Promise<any> {
        if (this.isReleased) throw new QueryRunnerAlreadyReleasedError()

        const connection = this.driver.connection
        const options = connection.options as SqliteConnectionOptions
        const maxQueryExecutionTime = this.driver.options.maxQueryExecutionTime
        const broadcasterResult = new BroadcasterResult()
        const broadcaster = this.broadcaster

        // broadcaster.broadcastB(
        //     broadcasterResult,
        //     query,
        //     parameters,
        // )

        if (!connection.isInitialized) {
            throw new ConnectionIsNotSetError("sqlite")
        }

        return new Promise(async (ok, fail) => {
            try {
                const databaseConnection = await this.connect()
                this.driver.connection.logger.logQuery(query, parameters, this)
                const queryStartTime = +new Date()
                const isInsertQuery = query.startsWith("INSERT ")
                const isDeleteQuery = query.startsWith("DELETE ")
                const isUpdateQuery = query.startsWith("UPDATE ")

                const execute = async () => {
                    if (isInsertQuery || isDeleteQuery || isUpdateQuery) {
                        await databaseConnection.run(query, parameters, handler)
                    } else {
                        await databaseConnection.all(query, parameters, handler)
                    }
                }

                const self = this
                const handler = function (this: any, err: any, rows: any) {
                    if (err && err.toString().indexOf("SQLITE_BUSY:") !== -1) {
                        if (
                            typeof options.busyErrorRetry === "number" &&
                            options.busyErrorRetry > 0
                        ) {
                            setTimeout(execute, options.busyErrorRetry)
                            return
                        }
                    }

                    // log slow queries if maxQueryExecution time is set
                    const queryEndTime = +new Date()
                    const queryExecutionTime = queryEndTime - queryStartTime
                    if (
                        maxQueryExecutionTime &&
                        queryExecutionTime > maxQueryExecutionTime
                    )
                        connection.logger.logQuerySlow(
                            queryExecutionTime,
                            query,
                            parameters,
                            self,
                        )

                    if (err) {
                        connection.logger.logQueryError(
                            err,
                            query,
                            parameters,
                            self,
                        )
                        // broadcaster.broadcastAfterQueryEvent(
                        //     broadcasterResult,
                        //     query,
                        //     parameters,
                        //     false,
                        //     undefined,
                        //     undefined,
                        //     err,
                        // )

                        return fail(
                            new QueryFailedError(query, parameters, err),
                        )
                    } else {
                        const result = new QueryResult()

                        if (isInsertQuery) {
                            result.raw = this["lastID"]
                        } else {
                            result.raw = rows
                        }

                        // broadcaster.broadcastAfterQueryEvent(
                        //     broadcasterResult,
                        //     query,
                        //     parameters,
                        //     true,
                        //     queryExecutionTime,
                        //     result.raw,
                        //     undefined,
                        // )

                        if (Array.isArray(rows)) {
                            result.records = rows
                        }

                        result.affected = this["changes"]

                        if (useStructuredResult) {
                            ok(result)
                        } else {
                            ok(result.raw)
                        }
                    }
                }

                await execute()
            } catch (err) {
                fail(err)
            } finally {
                await broadcasterResult.wait()
            }
        })
    }
}
