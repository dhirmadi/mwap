const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.prod.json');

const baseUrl = './dist';
const paths = {};

// Convert paths from tsconfig to work with compiled js files
Object.keys(tsConfig.compilerOptions.paths).forEach((alias) => {
  const path = tsConfig.compilerOptions.paths[alias][0].replace(/^src\//, '');
  paths[alias] = [path];
});

tsConfigPaths.register({
  baseUrl,
  paths,
});