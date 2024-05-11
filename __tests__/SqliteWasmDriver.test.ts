import 'reflect-metadata'
import { SqliteWasmDriver }                        from '../src/SqliteWasmDriver'
import { SqliteWasmDataSource }                    from '../src'
import {CategoryEntity}                            from './CategoryModel'

describe('SqliteWasmDriver', () => {
  let driver: SqliteWasmDriver;
  let mockConnect: jest.Mock;
  let mockDisconnect: jest.Mock;
  let mockQueryRunner: {
    connect: jest.Mock,
    query: jest.Mock,
    release: jest.Mock,
  };

  beforeAll(() => {
    // @Entity()
    // class Photo {
    //     @PrimaryGeneratedColumn()
    //     id: number
    //
    //     @Column({
    //         length: 100,
    //     })
    //     name: string
    //
    //     @Column("text")
    //     description: string
    //
    //     @Column()
    //     filename: string
    //
    //     @Column("double")
    //     views: number
    //
    //     @Column()
    //     isPublished: boolean
    // }

    const AppDataSource = new SqliteWasmDataSource({
        type: "sqlite",
        database: "test",
        entities: [CategoryEntity],
        // synchronize: true,
        // logging: true,
    })

    AppDataSource.initialize()
        .then(() => {
            // here you can start to work with your database
          console.log('Database initialized')
        })
        .catch((error) => console.log(error))

  });
})


