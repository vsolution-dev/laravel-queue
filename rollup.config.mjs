import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: [
    { file: 'dist/bundle.cjs.js', format: 'cjs', sourcemap: true },
    { file: 'dist/bundle.esm.js', format: 'es', sourcemap: true }
  ],
  external: ['ioredis'],
  plugins: [
    typescript(),
  ],
}
