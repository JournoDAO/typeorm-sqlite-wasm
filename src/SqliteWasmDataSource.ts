import { DataSource, DataSourceOptions } from 'typeorm/browser';
import { SqliteWasmDriver } from './SqliteWasmDriver';

class SqliteWasmDataSource {
    private dataSource: DataSource;

    constructor(options: DataSourceOptions) {
        // Modify the options here or wrap them accordingly
        this.dataSource = new DataSource({
            ...options,
            // potentially override other options necessary for the custom driver
        });

        // Directly set the custom driver on the DataSource instance
        this.dataSource.driver = new SqliteWasmDriver(this.dataSource);
    }

    async initialize(): Promise<void> {
        // Here, manually handle the initialization steps that are normally done in DataSource.initialize()
        // This may include connecting the driver, setting up entity metadata, subscribers, etc.
        await this.dataSource.initialize();
        // Additional initialization as required by TypeORM or your application logic
    }


}

export { SqliteWasmDataSource };
