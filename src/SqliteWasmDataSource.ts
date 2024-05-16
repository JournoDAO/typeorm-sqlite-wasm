import { DataSource, }              from 'typeorm/browser'
import { SqliteConnectionOptions, } from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'
import { SqliteWasmDriver, }        from './SqliteWasmDriver'
// import { SqliteWasmQueryRunner } from './SqliteWasmQueryRunner';

class SqliteWasmDataSource extends DataSource {
  constructor (options: SqliteConnectionOptions,) {
    super(options,)
    this.driver = this.createDriver()
  }

  createDriver (): SqliteWasmDriver {
    return new SqliteWasmDriver(this,)
  }


}

export { SqliteWasmDataSource, }
