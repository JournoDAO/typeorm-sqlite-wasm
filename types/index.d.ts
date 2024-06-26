import {SqliteWasmDataSource, SqliteWasmDriver, SqliteWasmQueryRunner} from '../src'

import { Brand } from '@/core/utils/types';

// Can be removed when the following issue is fixed:
// https://github.com/sqlite/sqlite-wasm/issues/53

declare module '@sqlite.org/sqlite-wasm' {

    export type SqliteDbId = Brand<unknown, 'SqliteDbId'>;

    export interface SqliteRowData {
        columnNames: string[];
        row: SqlValue[] | undefined;
        rowNumber: number | null;
    }

    export interface Sqlite3Worker1Messages {
        close: {
            args?: {
                unlink?: boolean;
            };
            result: {
                filename?: string;
            };
        };
        'config-get': {
            result: {
                version: object;
                bigIntEnabled: boolean;
                vfsList: unknown;
            };
        };
        exec: {
            args: {
                sql: string;
                bind?: BindingSpec;
                callback?(data: SqliteRowData): void | false;
            };
        };
        open: {
            args: {
                filename: string;
                vfs?: string;
            };
            result: {
                dbId: SqliteDbId;
                filename: string;
                persistent: boolean;
                vfs: string;
            };
        };
    }

    export interface Sqlite3Worker1PromiserConfig {
        onready(): void;
        worker?: unknown;
        generateMessageId?(message: object): string;
        debug?(...args: unknown[]): void;
        onunhandled?(event: unknown): void;
    }

    export type Sqlite3Worker1PromiserMethodOptions<T extends keyof Sqlite3Worker1Messages> =
        Sqlite3Worker1Messages[T] extends { args?: infer TArgs }
            ? { type: T; args: TArgs }
            : { type: T; args?: Sqlite3Worker1Messages[T]['args'] };

    export type Sqlite3Worker1Promiser =
        (<T extends keyof Sqlite3Worker1Messages>(
            type: T,
            args: Sqlite3Worker1Messages[T]['args'],
        ) => Promise<Sqlite3Worker1Messages[T]['result']>) &
        (<T extends keyof Sqlite3Worker1Messages>(
            options: Sqlite3Worker1PromiserMethodOptions<T>,
        ) => Promise<Sqlite3Worker1Messages[T]['result']>);

    export function sqlite3Worker1Promiser(): Sqlite3Worker1Promiser;
    export function sqlite3Worker1Promiser(onready: () => void): Sqlite3Worker1Promiser;
    export function sqlite3Worker1Promiser(config: Sqlite3Worker1PromiserOptions): Sqlite3Worker1Promiser;

}


