import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
// import uglify from 'rollup-plugin-uglify'

export default {
  entry: 'src/normform.js',
  dest: 'dist/normform.js',
  format: 'umd',
  moduleName: 'normform',
  plugins: [
    nodeResolve(),
    babel({ exclude: 'node_modules/**' })
    // uglify()
  ]
}
