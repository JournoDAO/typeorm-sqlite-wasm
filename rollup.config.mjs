import typescript from '@rollup/plugin-typescript'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'
import copy from 'rollup-plugin-copy'
// import wasm from '@rollup/plugin-wasm'

const config = [
  // Bundle JavaScript
  {
      input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
    // name: 'TypeORM Sqlite Wasm Driver',
    // dir: 'dist',
  },
  external: ['typeorm'],
  plugins: [ nodeResolve({
    browser: true,
    extensions: ['.js', '.ts'],
    preferBuiltins: false,
  }), typescript(), commonjs(), json(),
  copy({
      targets: [
        { src: 'node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.wasm', dest: 'dist' },
        { src: 'node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-worker1-bundler-friendly.mjs', dest: 'dist' },
        { src: 'node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-bundler-friendly.mjs', dest: 'dist' },
        { src: 'node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-opfs-async-proxy.js', dest: 'dist' },
      ],
  //     // Optional: if you want to modify the package.json on-the-fly
  //     transform: (contents, filename) => {
  //       if (filename === 'package.json') {
  //         const pkg = JSON.parse(contents.toString());
  //         pkg.main = 'bundle.js'; // Adjust main script entry
  //         return JSON.stringify(pkg, null, 2); // Return modified content
  //       }
  //       return contents;
  //     }
    })
  ]
  },
  // Bundle TypeScript declarations
  {
    input: 'types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [
      dts()  // bundles all your .d.ts files into one
    ]
  }
];

export default config
