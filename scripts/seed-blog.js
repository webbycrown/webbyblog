'use strict';

/**
 * Seed runner for WebbyBlog plugin (to be executed from a Strapi project root)
 *
 * This script loads the Strapi app and calls:
 *   strapi.plugin('webbyblog').service('service').seedDemoData()
 *
 * Typical usage from a host Strapi project:
 *   npm run seed:blog
 *   npm run seed:blog -- --yes
 */

const fs = require('fs');
const path = require('path');

function isStrapiProjectRoot(dir) {
  try {
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return Boolean(pkg?.dependencies?.['@strapi/strapi'] || pkg?.devDependencies?.['@strapi/strapi']);
  } catch (e) {
    return false;
  }
}

function findStrapiProjectRoot(startDir) {
  let currentDir = startDir;
  while (currentDir && currentDir !== path.dirname(currentDir)) {
    if (isStrapiProjectRoot(currentDir)) return currentDir;
    currentDir = path.dirname(currentDir);
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  let completed = false;

  const isAbortError = (err) => {
    const msg = err?.message || String(err);
    return msg.toLowerCase().includes('aborted');
  };

  // Strapi shutdown can sometimes surface "aborted" from underlying pools after successful execution.
  // These may occur outside our awaited destroy() call, so guard at the process level.
  process.on('unhandledRejection', (reason) => {
    if (completed && isAbortError(reason)) {
      console.warn('⚠️  Ignoring late "aborted" during shutdown (seed already completed).');
      process.exit(0);
    }
  });
  process.on('uncaughtException', (err) => {
    if (completed && isAbortError(err)) {
      console.warn('⚠️  Ignoring late "aborted" during shutdown (seed already completed).');
      process.exit(0);
    }
  });

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
WebbyBlog Seed Script

Usage:
  node node_modules/@webbycrown/webbyblog/scripts/seed-blog.js [options]

Options:
  --yes, -y    Run in non-interactive mode (skip prompts)
  --help, -h   Show this help message

Tip:
  From your Strapi project root you can usually run:
    npm run seed:blog
    npm run seed:blog -- --yes
`);
    process.exit(0);
  }

  // Prefer npm's local prefix / INIT_CWD if available. This is critical when the plugin is
  // installed via "file:" (npm may symlink the package, which would otherwise cause us to
  // discover the *plugin*'s Strapi project rather than the host project).
  const initCwd = process.env.npm_config_local_prefix || process.env.INIT_CWD || process.env.npm_prefix;
  const projectRoot =
    (initCwd && isStrapiProjectRoot(initCwd) ? initCwd : null) || findStrapiProjectRoot(process.cwd());
  if (!projectRoot) {
    throw new Error(
      'Could not find a Strapi project root (package.json with @strapi/strapi). ' +
        'Please run this command from your Strapi project folder.'
    );
  }

  process.chdir(projectRoot);

  // IMPORTANT: this script is executed from the plugin package directory.
  // When the plugin is installed via "file:" it may be symlinked, which would cause
  // plain `require('@strapi/strapi')` to resolve Strapi from the plugin's own
  // node_modules (wrong) instead of the host project (correct).
  const strapiModulePath = require.resolve('@strapi/strapi', { paths: [projectRoot] });
  const { createStrapi, compileStrapi } = require(strapiModulePath);

  let app;
  try {
    console.log('🚀 Starting WebbyBlog data seeding...');
    console.log(`📁 Project: ${projectRoot}`);
    console.log('📦 Compiling Strapi...');

    const appContext = await compileStrapi();
    app = await createStrapi(appContext).load();

    const plugin = app.plugin('webbyblog');
    const service = plugin?.service?.('service');
    if (!service?.seedDemoData) {
      throw new Error(
        'WebbyBlog plugin service not found. ' +
          'Please ensure the plugin is installed and enabled (webbyblog).'
      );
    }

    console.log('✅ Strapi loaded successfully');
    console.log('🌱 Seeding blog data...\n');

    const result = await service.seedDemoData();
    const message = result?.message || 'Blog data seeding completed.';
    console.log('\n✅ ' + message);
    console.log('🎉 Blog data seeding completed successfully!\n');
    completed = true;

    try {
      await app.destroy();
    } catch (destroyErr) {
      const msg = destroyErr?.message || String(destroyErr);
      if (msg.toLowerCase().includes('aborted')) {
        console.warn('⚠️  Strapi shutdown reported "aborted" (ignored for seed script).');
      } else {
        console.warn('⚠️  Strapi shutdown error (ignored for seed script):', destroyErr);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding blog data:');
    console.error(error);

    if (app) {
      try {
        await app.destroy();
      } catch (e) {
        // ignore
      }
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

