import * as tsConfigPaths from 'tsconfig-paths';
import * as tsConfig from './tsconfig.prod.json';

// Get the paths from tsconfig
const { paths, baseUrl } = tsConfig.compilerOptions;

// Convert paths to point to compiled js files
const mappedPaths: Record<string, string[]> = {};
Object.keys(paths).forEach((alias) => {
  // Handle array of paths for each alias
  mappedPaths[alias] = paths[alias].map(path => {
    // Replace src with dist and remove .ts extension
    return path.replace(/^src\//, 'dist/').replace(/\.ts$/, '');
  });
});

// Register the paths
tsConfigPaths.register({
  baseUrl: '.',  // Keep the same baseUrl as tsconfig
  paths: mappedPaths,
  addMatchAll: false,  // Ensure exact path matching
});