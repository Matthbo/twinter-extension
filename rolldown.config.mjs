import { defineConfig } from 'rolldown';
import copy from "rollup-plugin-copy";

export default defineConfig({
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
  },
  tsconfig: 'tsconfig.json',
  plugins: [copy({
    targets: [
      { src: 'src/**/*.json', dest: 'dist' }
    ]
  })]
});
