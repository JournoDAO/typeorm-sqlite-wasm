# [WIP] typeorm-sqlite-wasm

This is a research project by [JournoDAO](https://journodao.xyz), [SeedProtocl](https://seedprotocol.io), and [PermaPress](https://permapress.xyz) to determine if we can use TypeORM backed by Sqlite Wasm via OPFS for more performant and future-proof storage.

The idea was inspired by RxDB:

https://rxdb.info/rx-storage-opfs.html

The goal is to isolate the browser parts of TypeORM and then provide a plug-and-play
driver that is super performant from leveraging OPFS.
