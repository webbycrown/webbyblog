'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

/**
 * Postinstall script for webbyblog package
 * - Auto-adds a "seed:blog" script to the host Strapi project's package.json (so user can run: npm run seed:blog)
 * - Optionally prompts user to seed demo blog data right after installation
 */
async function main() {
  // Find the Strapi project root (go up from node_modules/@webbycrown/webbyblog)
  // Prefer npm-provided hints for the host project root. This is critical when the plugin is
  // installed via "file:" and becomes a symlink; relying on __dirname / process.cwd() can point
  // at the *source* tree rather than the host project.
  const envCandidates = [
    process.env.npm_config_local_prefix, // best signal for "where npm was run"
    process.env.INIT_CWD, // sometimes present
    process.env.npm_prefix, // sometimes present
  ].filter(Boolean);

  let projectRoot = envCandidates[0] || process.cwd();
  
  // If we're in node_modules, go up to project root
  if (projectRoot.includes('node_modules')) {
    const parts = projectRoot.split(path.sep);
    const nodeModulesIndex = parts.lastIndexOf('node_modules');
    if (nodeModulesIndex !== -1) {
      projectRoot = parts.slice(0, nodeModulesIndex).join(path.sep);
    }
  } else {
    // If we're in the plugin directory, go up to Strapi project root
    // src/plugins/webbyblog -> project root
    let currentDir = __dirname;
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const hasStrapi =
            Boolean(packageJson?.dependencies?.['@strapi/strapi']) ||
            Boolean(packageJson?.devDependencies?.['@strapi/strapi']);
          if (hasStrapi) {
            projectRoot = currentDir;
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
      currentDir = path.dirname(currentDir);
    }
  }

  // Check if this is a Strapi project
  // If env candidates exist, prefer the first one that looks like a Strapi project root.
  for (const candidate of envCandidates) {
    if (!candidate) continue;
    const p = path.join(candidate, 'package.json');
    if (!fs.existsSync(p)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
      const hasStrapi =
        Boolean(pkg?.dependencies?.['@strapi/strapi']) || Boolean(pkg?.devDependencies?.['@strapi/strapi']);
      if (hasStrapi) {
        projectRoot = candidate;
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('\n⚠️  Could not find Strapi project root. Skipping blog data seeding.');
    return;
  }

  /** Quote an arg for shell execution (basic Windows/Linux safe quoting) */
  const q = (s) => {
    const str = String(s);
    if (str.includes('"')) return `'${str.replace(/'/g, "'\\''")}'`;
    return `"${str}"`;
  };

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasStrapi =
      Boolean(packageJson?.dependencies?.['@strapi/strapi']) ||
      Boolean(packageJson?.devDependencies?.['@strapi/strapi']);

    if (!hasStrapi) {
      console.log('\n⚠️  This does not appear to be a Strapi project. Skipping blog data seeding.');
      return;
    }

    // Ensure the plugin is enabled in Strapi (required for npm-installed plugins).
    // If the host has a complex plugins.js, we avoid risky edits and instead warn.
    const pluginsConfigPath = path.join(projectRoot, 'config', 'plugins.js');
    try {
      const desiredSnippet =
        "module.exports = ({ env }) => ({\n" +
        "  webbyblog: {\n" +
        "    enabled: true,\n" +
        "    resolve: '@webbycrown/webbyblog',\n" +
        "  },\n" +
        "});\n";

      if (!fs.existsSync(pluginsConfigPath)) {
        fs.mkdirSync(path.dirname(pluginsConfigPath), { recursive: true });
        fs.writeFileSync(pluginsConfigPath, desiredSnippet, 'utf8');
        console.log('\n✅ Enabled WebbyBlog in config/plugins.js');
      } else {
        const current = fs.readFileSync(pluginsConfigPath, 'utf8');
        const alreadyEnabled =
          current.includes("resolve: '@webbycrown/webbyblog'") ||
          current.includes('resolve: "@webbycrown/webbyblog"') ||
          current.includes('webbyblog');

        if (!alreadyEnabled) {
          // Safe, common case: empty default export
          if (current.trim() === 'module.exports = {};' || current.trim() === 'module.exports = {};') {
            fs.writeFileSync(pluginsConfigPath, desiredSnippet, 'utf8');
            console.log('\n✅ Enabled WebbyBlog in config/plugins.js');
          } else {
            console.log('\n⚠️  Could not auto-enable WebbyBlog because config/plugins.js is customized.');
            console.log("   Please add the following entry manually:\n   webbyblog: { enabled: true, resolve: '@webbycrown/webbyblog' }");
          }
        }
      }
    } catch (e) {
      console.log('\n⚠️  Could not update config/plugins.js to enable WebbyBlog (skipping).');
    }

    // Ensure host has a seed script so user can simply run: npm run seed:blog
    const hostSeedScript =
      packageJson?.scripts?.['seed:blog'] ||
      null;

    const seedRunnerCandidates = [
      // NPM package install (recommended)
      path.join(projectRoot, 'node_modules', '@webbycrown', 'webbyblog', 'scripts', 'seed-blog.js'),
      // Local plugin install (src/plugins)
      path.join(projectRoot, 'src', 'plugins', 'webbyblog', 'scripts', 'seed-blog.js'),
    ];

    const seedRunnerPath = seedRunnerCandidates.find((p) => fs.existsSync(p)) || null;

    if (!packageJson.scripts) packageJson.scripts = {};
    if (!hostSeedScript) {
      if (seedRunnerPath) {
        // Use a path relative to the project root to avoid machine-specific absolute paths.
        const rel = path.relative(projectRoot, seedRunnerPath).split(path.sep).join('/');
        packageJson.scripts['seed:blog'] = `node ./${rel}`;
        try {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
          console.log('\n✅ Added npm script "seed:blog" to your project package.json');
        } catch (e) {
          console.log('\n⚠️  Could not update your project package.json to add "seed:blog".');
          console.log('   You can add it manually:');
          console.log(`   "seed:blog": "node ./${rel}"`);
        }
      } else {
        console.log('\n⚠️  Seed runner script not found inside the plugin install. Skipping "seed:blog" script injection.');
      }
    }
  } catch (e) {
    console.log('\n⚠️  Could not read package.json. Skipping blog data seeding.');
    return;
  }

  // Resolve the seed runner to execute (plugin-owned runner)
  const seedRunnerCandidates = [
    path.join(projectRoot, 'node_modules', '@webbycrown', 'webbyblog', 'scripts', 'seed-blog.js'),
    path.join(projectRoot, 'src', 'plugins', 'webbyblog', 'scripts', 'seed-blog.js'),
  ];
  const seedRunnerPath = seedRunnerCandidates.find((p) => fs.existsSync(p)) || null;
  if (!seedRunnerPath) {
    console.log('\n⚠️  Seed runner not found. Skipping demo data seeding.');
    return;
  }

  // Check for non-interactive mode
  const args = process.argv.slice(2);
  const autoYes =
    args.includes('--yes') ||
    args.includes('-y') ||
    String(process.env.SEED_BLOG_YES || '').toLowerCase() === 'true' ||
    !process.stdin.isTTY;

  if (!autoYes) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));
    const answer = await question('\n📝 WebbyBlog: Would you like to seed data? (y/n): ');
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('\n⏭️  Skipping data seeding. You can run this later using: npm run seed:blog');
      return;
    }
  } else {
    console.log('\n✅ Non-interactive mode. Proceeding with blog data seeding...');
  }

  // Run the seed script
  try {
    console.log('\n🚀 Running blog data seeding...');
    process.chdir(projectRoot);
    const cmd = `node ${q(seedRunnerPath)} ${autoYes ? '--yes' : ''}`.trim();
    execSync(cmd, {
      stdio: 'inherit',
      cwd: projectRoot,
    });
  } catch (error) {
    console.error('\n❌ Error running seed script:', error.message);
    console.log('\n💡 You can run the seed script manually later using: npm run seed:blog');
  }
}

main().catch((error) => {
  console.error('\n❌ Postinstall script error:', error);
  process.exit(0); // Don't fail the installation
});
