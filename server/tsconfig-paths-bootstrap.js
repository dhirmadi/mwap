const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.prod.json');

// Adjust the baseUrl to point to the compiled output
const baseUrl = './dist';
const paths = {};

// Convert paths from tsconfig to work with compiled js files
Object.keys(tsConfig.compilerOptions.paths).forEach((alias) => {
  const aliasPath = tsConfig.compilerOptions.paths[alias];
  paths[alias] = aliasPath.map(path => 
    path.replace(/^src\//, '').replace(/\.ts$/, '')
  );
});

tsConfigPaths.register({
  baseUrl,
  paths,
  addMatchAll: false // This ensures exact path matching
});