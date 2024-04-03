import * as path from 'path';
import { fileURLToPath } from 'node:url'

import typescript from '@rollup/plugin-typescript';
import run from "@rollup/plugin-run";
import alias from '@rollup/plugin-alias';

const isDev = process.env.NODE_ENV !== "production";

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/bundle.cjs.js', format: 'cjs', sourcemap: true },
    { file: 'dist/bundle.esm.js', format: 'es', sourcemap: true }
  ],
  external: ['ioredis'],
  plugins: [
    typescript(),

    alias({
      entries: [{
        find: '@',
        replacement: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          'src'
        )
      }],
    }),

    isDev && run(),
  ],
}
