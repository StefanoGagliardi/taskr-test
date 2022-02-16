// taskr babel plugin with Babel 7 support
// https://github.com/lukeed/taskr/pull/305

const path = require('path');

// Import SWC Core compiler
// https://github.com/swc-project/swc
const transform = require('@swc/core').transform;

/**
 * Export plugin funciton
 */
module.exports = function (task) {
  
  /**
   * Compile Typescript for Server or Client
   * @param {*} file
   * @param {string} serverOrClient - Define compiler option
   * @param {*} - stripExtension & dev
   */
  task.plugin('swc', {}, function* (file, serverOrClient, { stripExtension, dev } = {}) {

    // Don't compile .d.ts
    if (file.base.endsWith('.d.ts')) return;

    const isClient = serverOrClient === 'client';

    const swcClientOptions = {
      module: {
        type: 'commonjs',
        ignoreDynamic: true,
      },
      jsc: {
        loose: true,

        target: 'es2016',
        parser: {
          syntax: 'typescript',
          dynamicImport: true,
          tsx: file.base.endsWith('.tsx'),
        },
        transform: {
          react: {
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment',
            throwIfNamespace: true,
            development: false,
            useBuiltins: true,
          },
        },
      },
    };

    const swcServerOptions = {
      module: {
        type: 'commonjs',
        ignoreDynamic: true,
      },
      env: {
        targets: {
          node: '12.0.0',
        },
      },
      jsc: {
        loose: true,
        parser: {
          syntax: 'typescript',
          dynamicImport: true,
          tsx: file.base.endsWith('.tsx'),
        },
        transform: {
          react: {
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment',
            throwIfNamespace: true,
            development: false,
            useBuiltins: true,
          },
        },
      },
    };

    const swcOptions = isClient ? swcClientOptions : swcServerOptions;
    const filePath = path.join(file.dir, file.base);
    const fullFilePath = path.join(__dirname, filePath);
    const distFilePath = path.dirname(path.join(__dirname, 'dist', filePath));

    const options = {
      filename: path.join(file.dir, file.base),
      sourceMaps: true,
      sourceFileName: path.relative(distFilePath, fullFilePath),

      ...swcOptions,
    };

    const output = yield transform(file.data.toString('utf-8'), options);
    const ext = path.extname(file.base);

    // Replace `.ts|.tsx` with `.js` in files with an extension
    if (ext) {
      const extRegex = new RegExp(ext.replace('.', '\\.') + '$', 'i');
      // Remove the extension if stripExtension is enabled or replace it with `.js`
      file.base = file.base.replace(extRegex, stripExtension ? '' : '.js');
    }

    if (output.map) {
      const map = `${file.base}.map`;

      output.code += Buffer.from(`\n//# sourceMappingURL=${map}`);

      // add sourcemap to `files` array
      this._.files.push({
        base: map,
        dir: file.dir,
        data: Buffer.from(output.map),
      });
    }

    file.data = Buffer.from(setNextVersion(output.code));
  }); 
};

// Replace version in code with version package
function setNextVersion(code) {
  return code.replace(/process\.env\.__NEXT_VERSION/g, `"${require('./package.json').version}"`);
}
