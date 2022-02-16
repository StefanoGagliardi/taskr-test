/**
 * Import packages
 */
const notifier = require('node-notifier');

/**
 * Default Task that invoke build
 * @param {*} task
 */
// exports.default = function* (task) {
export default async function (task) {
  // Clean dist folder
  yield task.clear('dist');

  // Run main builsd task
  yield task.start('build', {nodeNotify: false});
  yield task.watch('bin/*', 'build', opts);
};

export async function release(task) {
  await task.clear('dist').start('build', {nodeNotify: true});
}

/**
 * Build function, now for ./bin
 * NB: Now we use Rust Compiler for Typescript by Vercel @core/swc (Speed web compiler)
 *
 * @param {*} task
 */
exports.build = function* (task, opts) {
  yield task
    .source(opts.src || './bin/*')
    .swc('server', { stripExtension: false, dev: opts.dev })
    // .babel({ presets:['es2015'] })
    .target('dist/bin/vitals.js', { mode: '0755' });

  if(opts.nodeNotify) {
    notify('Compiled binaries');
  }
};

// notification helper
function notify(msg) {
  try {
    notifier.notify({
      title: 'Vitals.io',
      message: msg,
      icon: false,
    });
  } catch (err) {
    // notifier can fail on M1 machines
  }
}
