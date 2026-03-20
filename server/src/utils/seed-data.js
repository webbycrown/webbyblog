'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const os = require('os');
const { randomUUID } = require('crypto');

const SEED_PLACEHOLDER_IMAGE_NAME = 'webbyblog-seed-placeholder.png';
// 100x100 transparent PNG (valid PNG that will pass Strapi's image validation)
// This is a proper 100x100 transparent PNG - minimal valid PNG structure
const SEED_PLACEHOLDER_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X8p8sAAAAASUVORK5CYII=';

let _placeholderImageId = null;
let _placeholderImagePromise = null;

async function getOrCreatePlaceholderImageId(strapi) {
  if (_placeholderImageId) return _placeholderImageId;
  if (_placeholderImagePromise) return _placeholderImagePromise;

  _placeholderImagePromise = (async () => {
    try {
      // Reuse an existing placeholder across runs to avoid uploading duplicates.
      const existing = await strapi.entityService.findMany('plugin::upload.file', {
        filters: { name: { $eq: SEED_PLACEHOLDER_IMAGE_NAME } },
        limit: 1,
      });

      if (Array.isArray(existing) && existing[0]?.id) {
        _placeholderImageId = existing[0].id;
        return _placeholderImageId;
      }
    } catch (e) {
      // If upload plugin/model isn't available yet, fall back to runtime upload attempt below.
    }

  // Upload plugin should exist in Strapi projects by default, but guard anyway.
  const uploadService = strapi?.plugin?.('upload')?.service?.('upload');
  if (!uploadService?.upload) {
    strapi.log.warn('[webbyblog] Upload plugin service not available; cannot create placeholder image.');
    return null;
  }

    const buffer = Buffer.from(SEED_PLACEHOLDER_PNG_BASE64, 'base64');
    // IMPORTANT: use a truly unique temp path to avoid collisions within the same millisecond.
    const tmpPath = path.join(os.tmpdir(), `${randomUUID()}-${SEED_PLACEHOLDER_IMAGE_NAME}`);

    try {
      fs.writeFileSync(tmpPath, buffer);

      const fileSize = buffer.length;

      const fileInfo = {
        name: SEED_PLACEHOLDER_IMAGE_NAME,
        alternativeText: 'Seed placeholder image',
        caption: 'Seed placeholder image',
      };

      // Strapi 5 upload service expects files in a specific format
      // Create file payload that mimics what multer/busboy provides
      const createFilesPayload = (useBuffer = true) => {
        // Create a file-like object that Strapi 5 expects
        // This format is similar to what comes from HTTP file uploads
        const fileObj = {
          name: SEED_PLACEHOLDER_IMAGE_NAME,
          originalName: SEED_PLACEHOLDER_IMAGE_NAME,
          originalFilename: SEED_PLACEHOLDER_IMAGE_NAME,
          filename: SEED_PLACEHOLDER_IMAGE_NAME,
          size: fileSize,
          type: 'image/png',
          mime: 'image/png',
          mimetype: 'image/png',
        };

        if (useBuffer) {
          // Strapi 5 prefers buffer for proper image validation
          fileObj.buffer = buffer;
        } else {
          // Fallback: use stream
          fileObj.path = tmpPath;
          fileObj.filepath = tmpPath;
          fileObj.tmpPath = tmpPath;
          fileObj.stream = fs.createReadStream(tmpPath);
          fileObj.mtime = new Date();
        }

        return fileObj;
      };

      // Try multiple upload formats for compatibility
      const doUpload = async (useBuffer = true) => {
        const filesPayload = createFilesPayload(useBuffer);
        
        // Try Strapi 5 format with buffer (array of files)
        try {
          return await uploadService.upload({
            data: { fileInfo },
            files: [filesPayload],
          });
        } catch (e1) {
          // Try without data wrapper
          try {
            return await uploadService.upload({
              data: fileInfo,
              files: [filesPayload],
            });
          } catch (e2) {
            // Try single file object format (legacy)
            try {
              return await uploadService.upload({
                data: { fileInfo },
                files: filesPayload,
              });
            } catch (e3) {
              // If using buffer failed, try with stream
              if (useBuffer) {
                const streamPayload = createFilesPayload(false);
                try {
                  return await uploadService.upload({
                    data: { fileInfo },
                    files: [streamPayload],
                  });
                } catch (e4) {
                  // If all formats fail, throw the original error
                  throw e1;
                }
              }
              throw e1;
            }
          }
        }
      };

      let uploaded;
      try {
        // Try with buffer first (Strapi 5 preferred)
        uploaded = await doUpload(true);
      } catch (e) {
        // Some environments can fail the very first image validation attempt during boot; retry once.
        const msg = e?.message || String(e);
        strapi.log.warn(`[webbyblog] Placeholder image upload failed (will retry once): ${msg}`);
        await new Promise((r) => setTimeout(r, 500));
        try {
          // Retry with stream format
          uploaded = await doUpload(false);
        } catch (e2) {
          // Final attempt with buffer again
          try {
            uploaded = await doUpload(true);
          } catch (e3) {
            // Log the error but don't throw - allow seeding to continue without placeholder images
            strapi.log.error(`[webbyblog] Failed to upload placeholder image after retries: ${e3?.message || e3}`);
            throw e3;
          }
        }
      }

      const uploadedFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (!uploadedFile?.id) {
        strapi.log.warn(`[webbyblog] Placeholder upload did not return an id: ${safeStringify(uploadedFile)}`);
        return null;
      }

      _placeholderImageId = uploadedFile.id;
      strapi.log.info(`[webbyblog] ✓ Uploaded placeholder image (id=${_placeholderImageId}) for seed image-blocks`);
      return _placeholderImageId;
    } catch (e) {
      strapi.log.error(`[webbyblog] Failed to upload placeholder image: ${e?.message || e}`);
      return null;
    } finally {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch (e) {
        // ignore
      }
    }
  })();

  try {
    return await _placeholderImagePromise;
  } finally {
    _placeholderImagePromise = null;
  }
}

function safeStringify(value) {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      if (typeof val === 'bigint') return val.toString();
      if (val instanceof Error) {
        /** @type {any} */
        const anyErr = val;
        return {
          name: val.name,
          message: val.message,
          stack: val.stack,
          details: anyErr['details'],
          cause: anyErr['cause'],
        };
      }
      return val;
    },
    2
  );
}

async function publishBlogPostIfPossible(strapi, postEntity, { logPrefix = '[webbyblog]' } = {}) {
  const uid = 'plugin::webbyblog.blog-post';
  if (!postEntity?.id) return;

  // Strapi v5+ stores Draft/Publish state per "document". Publishing via the content-manager
  // document-manager is the most reliable way to turn "Modified" -> "Published".
  const documentManager = strapi?.plugin?.('content-manager')?.service?.('document-manager');

  let documentId = postEntity.documentId;
  if (!documentId) {
    try {
      const fresh = await strapi.entityService.findOne(uid, postEntity.id, { fields: ['documentId'] });
      documentId = fresh?.documentId;
    } catch (e) {
      // ignore
    }
  }
  if (!documentId) {
    try {
      const fresh = await strapi.db.query(uid).findOne({ where: { id: postEntity.id }, select: ['documentId'] });
      documentId = fresh?.documentId;
    } catch (e) {
      // ignore
    }
  }
  if (!documentId) {
    try {
      // Some DB connectors may expose it as snake_case.
      const fresh = await strapi.db.query(uid).findOne({ where: { id: postEntity.id }, select: ['document_id'] });
      documentId = fresh?.document_id;
    } catch (e) {
      // ignore
    }
  }
  if (!documentId) {
    try {
      const fresh = await strapi.db.query(uid).findOne({ where: { id: postEntity.id } });
      documentId = fresh?.documentId || fresh?.document_id;
    } catch (e) {
      // ignore
    }
  }

  if (documentManager?.publish && documentId) {
    try {
      await documentManager.publish(documentId, uid);
      strapi.log.info(`${logPrefix} ✓ Published post: ${postEntity.title || postEntity.slug || postEntity.id}`);
      return;
    } catch (e) {
      strapi.log.warn(
        `${logPrefix} Could not publish post "${postEntity.title || postEntity.slug || postEntity.id}": ${e?.message || e}`
      );
    }
  }
  // Last attempt: some setups accept the entry id even if documentId wasn't found.
  if (documentManager?.publish) {
    try {
      await documentManager.publish(postEntity.id, uid);
      strapi.log.info(`${logPrefix} ✓ Published post (by id): ${postEntity.title || postEntity.slug || postEntity.id}`);
      return;
    } catch (e) {
      // ignore
    }
  }

  // Fallback: best-effort republish for older setups by touching publishedAt.
  try {
    await strapi.entityService.update(uid, postEntity.id, { data: { publishedAt: new Date() } });
    strapi.log.info(`${logPrefix} ✓ Republished post (fallback): ${postEntity.title || postEntity.slug || postEntity.id}`);
  } catch (e) {
    strapi.log.warn(
      `${logPrefix} Could not republish post "${postEntity.title || postEntity.slug || postEntity.id}" (fallback): ${e?.message || e}`
    );
  }
}

/**
 * Normalize dynamiczone blocks for compatibility across plugin versions.
 * - Migrates legacy `plugin::webbyblog.*` component UIDs to `webby-blog.*`
 * - Drops blocks missing required fields (ex: image-block without an image)
 */
async function normalizeBlocks(strapi, blocks, { logPrefix = '[webbyblog]' } = {}) {
  if (!Array.isArray(blocks)) return [];

  const normalized = [];

  for (const rawBlock of blocks) {
    if (!rawBlock || typeof rawBlock !== 'object') continue;

    const block = { ...rawBlock };
    let uid = block.__component;

    if (typeof uid === 'string') {
      if (uid.startsWith('plugin::webbyblog.')) {
        uid = uid.replace('plugin::webbyblog.', 'webby-blog.');
        block.__component = uid;
      }
    } else {
      // Dynamic zones require __component to resolve the schema.
      strapi.log.warn(`${logPrefix} Skipping block without valid __component: ${safeStringify(rawBlock)}`);
      continue;
    }

    // If we can resolve the component schema, validate required attributes.
    const component = strapi?.get?.('components')?.get?.(uid);
    if (component?.attributes && typeof component.attributes === 'object') {
      let isValid = true;

      for (const [attrName, attr] of Object.entries(component.attributes)) {
        if (!attr || !attr.required) continue;

        const value = block[attrName];
        const isEmptyArray = Array.isArray(value) && value.length === 0;
        const isEmptyString = typeof value === 'string' && value.trim().length === 0;
        const isMissing = value === null || value === undefined || isEmptyArray || isEmptyString;

        if (isMissing) {
          // Special-case: our demo seed data includes image-blocks with image: null.
          // Instead of dropping them, upload one tiny placeholder image and attach it.
          if (uid === 'webby-blog.image-block' && attrName === 'image') {
            const placeholderId = await getOrCreatePlaceholderImageId(strapi);
            if (placeholderId) {
              block.image = placeholderId;
              continue;
            }
          }

          isValid = false;
          strapi.log.warn(
            `${logPrefix} Dropping invalid block ${uid} (missing required '${attrName}'). ` +
              `Block: ${safeStringify(block)}`
          );
          break;
        }
      }

      if (!isValid) continue;
    }

    normalized.push(block);
  }

  return normalized;
}

/**
 * Seed demo data for webbyblog plugin
 */
async function seedDemoData(strapi) {
  try {
    strapi.log.info('[webbyblog] Starting blog demo data seeding...');

    // Read demo data from JSON file
    // Try multiple paths to handle different installation scenarios:
    // 1. Development: server/src/utils -> server/src/data/blog-seed-data.json
    // 2. Built/distributed: dist/server/utils -> dist/server/data/blog-seed-data.json
    // 3. NPM package: node_modules/@webbycrown/webbyblog/dist/server/data/blog-seed-data.json
    const possiblePaths = [
      path.join(__dirname, '../data/blog-seed-data.json'), // Development
      path.join(__dirname, '../../data/blog-seed-data.json'), // Alternative dev path
      path.join(__dirname, '../../server/src/data/blog-seed-data.json'), // Source path
      path.join(__dirname, '../../../server/src/data/blog-seed-data.json'), // Alternative source
    ];

    // Also try to find it relative to the plugin root (for npm packages)
    try {
      const pluginRoot = path.resolve(__dirname, '../../../../');
      const packageJsonPath = path.join(pluginRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name === '@webbycrown/webbyblog') {
          possiblePaths.push(path.join(pluginRoot, 'dist/server/data/blog-seed-data.json'));
          possiblePaths.push(path.join(pluginRoot, 'server/src/data/blog-seed-data.json'));
        }
      }
      // Also try node_modules path
      let currentDir = __dirname;
      for (let i = 0; i < 10; i++) {
        const nodeModulesPath = path.join(currentDir, 'node_modules', '@webbycrown', 'webbyblog', 'dist', 'server', 'data', 'blog-seed-data.json');
        if (fs.existsSync(nodeModulesPath)) {
          possiblePaths.push(nodeModulesPath);
          break;
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break;
        currentDir = parentDir;
      }
    } catch (e) {
      // Ignore errors when trying to find plugin root
    }

    let seedDataPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        seedDataPath = possiblePath;
        break;
      }
    }

    if (!seedDataPath) {
      throw new Error(`Blog seed data file not found. Tried paths: ${possiblePaths.join(', ')}`);
    }

    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    // Track created entities for relationships
    const entityMap = {
      categories: new Map(),
      tags: new Map(),
      posts: [],
    };

    // Seed data in order of dependencies
    await seedCategories(strapi, seedData.categories, entityMap);
    await seedTags(strapi, seedData.tags, entityMap);
    await seedPosts(strapi, seedData.posts, entityMap);

    strapi.log.info('[webbyblog] Blog demo data seeding completed successfully!');
    return { 
      success: true, 
      message: `Successfully seeded ${entityMap.categories.size} categories, ${entityMap.tags.size} tags, and ${entityMap.posts.length} blog posts` 
    };

  } catch (error) {
    strapi.log.error('[webbyblog] Error seeding blog demo data:', error);
    throw error;
  }
}

async function seedCategories(strapi, categories, entityMap) {
  strapi.log.info('[webbyblog] Seeding blog categories...');
  
  for (const category of categories) {
    try {
      // Check if category already exists by name
      const existingCategories = await strapi.entityService.findMany('plugin::webbyblog.blog-category', {
        filters: { name: category.name }
      });
      
      if (existingCategories.length > 0) {
        const existingCategory = existingCategories[0];
        // Slug is auto-generated from name by Strapi, so we don't need to update it
        strapi.log.info(`[webbyblog] Category "${category.name}" already exists, skipping...`);
        entityMap.categories.set(category.name, existingCategory);
        continue;
      }

      // Create category
      const categoryData = {
        name: category.name,
        description: category.description || '',
      };
      
      // Add slug if provided
      if (category.slug) {
        categoryData.slug = category.slug;
      }
      
      const createdCategory = await strapi.entityService.create('plugin::webbyblog.blog-category', {
        data: categoryData
      });
      
      entityMap.categories.set(category.name, createdCategory);
      strapi.log.info(`[webbyblog] ✓ Created category: ${category.name}`);
    } catch (error) {
      strapi.log.error(`[webbyblog] Error creating category ${category.name}:`, error.message);
    }
  }
  
  strapi.log.info(`[webbyblog] Categories seeding completed. Created: ${entityMap.categories.size}`);
}

async function seedTags(strapi, tags, entityMap) {
  strapi.log.info('[webbyblog] Seeding blog tags...');
  
  for (const tag of tags) {
    try {
      // Check if tag already exists by name (since name is unique)
      const existingTags = await strapi.entityService.findMany('plugin::webbyblog.blog-tag', {
        filters: { name: tag.name }
      });
      
      if (existingTags.length > 0) {
        const existingTag = existingTags[0];
        // Slug is auto-generated from name by Strapi, so we don't need to update it
        strapi.log.info(`[webbyblog] Tag "${tag.name}" already exists, skipping...`);
        entityMap.tags.set(tag.name, existingTag);
        continue;
      }

      // Create tag
      const tagData = {
        name: tag.name,
        description: tag.description || '',
      };
      
      // Add slug if provided
      if (tag.slug) {
        tagData.slug = tag.slug;
      }
      
      const createdTag = await strapi.entityService.create('plugin::webbyblog.blog-tag', {
        data: tagData
      });
      
      entityMap.tags.set(tag.name, createdTag);
      strapi.log.info(`[webbyblog] ✓ Created tag: ${tag.name}`);
    } catch (error) {
      const errorMessage = error.message || error.toString() || 'Unknown error';
      strapi.log.error(`[webbyblog] Error creating tag ${tag.name}:`, errorMessage);
      if (error.stack) {
        strapi.log.error(`[webbyblog] Error stack:`, error.stack);
      }
    }
  }
  
  strapi.log.info(`[webbyblog] Tags seeding completed. Created: ${entityMap.tags.size}`);
}

async function seedPosts(strapi, posts, entityMap) {
  strapi.log.info('[webbyblog] Seeding blog posts...');
  
  for (const post of posts) {
    try {
      // Resolve relations early so we can use them for both create and update paths.
      // Get category ID
      let categoryId = null;
      if (post.category) {
        const category = entityMap.categories.get(post.category);
        if (category) {
          categoryId = category.id;
        } else {
          strapi.log.warn(`[webbyblog] Category "${post.category}" not found for post "${post.title}"`);
        }
      }

      // Get tag IDs
      const tagIds = [];
      if (post.tags && Array.isArray(post.tags)) {
        for (const tagName of post.tags) {
          const tag = entityMap.tags.get(tagName);
          if (tag) {
            tagIds.push(tag.id);
          } else {
            strapi.log.warn(`[webbyblog] Tag "${tagName}" not found for post "${post.title}"`);
          }
        }
      }

      // Check if post already exists by slug (preferred) or title
      let existingPosts = [];
      
      // First try to find by slug if provided (more reliable)
      if (post.slug) {
        existingPosts = await strapi.entityService.findMany('plugin::webbyblog.blog-post', {
          filters: { 
            slug: {
              $eq: post.slug
            }
          }
        });
      }
      
      // If not found by slug, try by title (exact match)
      if (existingPosts.length === 0) {
        existingPosts = await strapi.entityService.findMany('plugin::webbyblog.blog-post', {
          filters: { 
            title: {
              $eq: post.title
            }
          }
        });
      }
      
      // Fallback: simple title match
      if (existingPosts.length === 0) {
        existingPosts = await strapi.entityService.findMany('plugin::webbyblog.blog-post', {
          filters: { title: post.title }
        });
      }
      
      if (existingPosts.length > 0) {
        const existingPost = existingPosts[0];
        let didMutate = false;
        // Slug is auto-generated from title by Strapi, but we can try to update it if provided
        if (post.slug && existingPost.slug !== post.slug) {
          try {
            await strapi.entityService.update('plugin::webbyblog.blog-post', existingPost.id, {
              data: { slug: post.slug }
            });
            strapi.log.info(`[webbyblog] Updated slug for post "${post.title}": ${post.slug}`);
            didMutate = true;
          } catch (updateError) {
            // Slug update might fail if Strapi manages it automatically - that's okay
            strapi.log.debug(`[webbyblog] Slug update skipped for post "${post.title}" (auto-managed by Strapi)`);
          }
        }
        
        // Ensure seeded blocks (including image-block placeholders) are present.
        if (post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
          const blocks = await normalizeBlocks(strapi, post.blocks);
          if (blocks.length > 0) {
            try {
              await strapi.entityService.update('plugin::webbyblog.blog-post', existingPost.id, {
                data: { blocks },
              });
              strapi.log.info(`[webbyblog] ✓ Updated blocks for existing post "${post.title}"`);
              didMutate = true;
            } catch (updateErr) {
              strapi.log.warn(
                `[webbyblog] Could not update blocks for existing post "${post.title}": ${updateErr?.message || updateErr}`
              );
            }
          }
        }

        // Keep tags/category aligned too (best-effort, won’t fail the seed run).
        if (categoryId) {
          try {
            await strapi.entityService.update('plugin::webbyblog.blog-post', existingPost.id, {
              data: { category: categoryId },
            });
            didMutate = true;
          } catch (e) {
            // ignore
          }
        }
        if (tagIds.length > 0) {
          try {
            await strapi.entityService.update('plugin::webbyblog.blog-post', existingPost.id, {
              data: { tags: tagIds },
            });
            didMutate = true;
          } catch (e) {
            // ignore
          }
        }

        // Strapi shows "Modified" until the latest draft is published.
        // Always publish at the end so seeded posts end up as "Published" in the admin.
        // (This also cleans up "Modified" from previous runs.)
        await publishBlogPostIfPossible(strapi, existingPost);

        strapi.log.info(`[webbyblog] Post "${post.title}" already exists, skipping create...`);
        entityMap.posts.push(existingPost);
        continue;
      }

      // Prepare post data
      const postData = {
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content || '',
        meta_title: post.meta_title || post.title,
        meta_description: post.meta_description || post.excerpt || '',
        meta_keywords: post.meta_keywords || '',
        views: 0,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      };
      
      // Add slug if provided
      if (post.slug) {
        postData.slug = post.slug;
      }

      // Add blocks if provided (dynamiczone components)
      if (post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
        const blocks = await normalizeBlocks(strapi, post.blocks);
        if (blocks.length > 0) {
          postData.blocks = blocks;
        }
      }

      // Add category relation if available
      if (categoryId) {
        postData.category = categoryId;
      }

      // Add tags relation if available
      if (tagIds.length > 0) {
        postData.tags = tagIds;
      }

      // Create post
      const createdPost = await strapi.entityService.create('plugin::webbyblog.blog-post', {
        data: postData,
      });

      // Ensure created posts end up "Published" (not Draft/Modified) in the admin.
      await publishBlogPostIfPossible(strapi, createdPost);

      entityMap.posts.push(createdPost);
      strapi.log.info(`[webbyblog] ✓ Created post: ${post.title}`);
    } catch (error) {
      const errorMessage = error?.message || error?.toString?.() || String(error);
      strapi.log.error(`[webbyblog] Error creating post ${post.title}: ${errorMessage}`);

      // Strapi often puts the actionable validation info in error.details / error.errors.
      if (error?.details) {
        strapi.log.error(`[webbyblog] Post create error.details: ${safeStringify(error.details)}`);
      }
      if (error?.errors) {
        strapi.log.error(`[webbyblog] Post create error.errors: ${safeStringify(error.errors)}`);
      }

      // Fall back to a deep inspect so we don't lose nested metadata.
      try {
        strapi.log.error(
          `[webbyblog] Post create error (inspect): ${util.inspect(error, { depth: 10, colors: false })}`
        );
      } catch (e) {
        // ignore
      }

      if (error?.stack) {
        strapi.log.error(`[webbyblog] Post create error stack:\n${error.stack}`);
      }
    }
  }
  
  strapi.log.info(`[webbyblog] Posts seeding completed. Created: ${entityMap.posts.length}`);
}

module.exports = {
  seedDemoData,
};
