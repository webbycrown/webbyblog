'use strict';

const fs = require('fs');
const path = require('path');

module.exports = async ({ strapi }) => {
  strapi.log.info('[webbyblog] ========================================');
  strapi.log.info('[webbyblog] Bootstrapping plugin...');

  // Alias clean API routes to the webbyblog plugin routes.
  // Plugin content-api routes are namespaced under `/api/<pluginId>/*` (e.g. `/api/webbyblog/blog-posts`).
  // This allows consumers to call `/api/blog-posts`, `/api/blog-tags`, `/api/blog-categories` without
  // requiring any host-app middleware/config.
  try {
    const mappings = [
      { from: '/api/blog-posts', to: '/api/webbyblog/blog-posts' },
      { from: '/api/blog-tags', to: '/api/webbyblog/blog-tags' },
      { from: '/api/blog-categories', to: '/api/webbyblog/blog-categories' },
      // Slug endpoints (rewrite by prefix; do NOT use express-style `:slug` placeholders here)
      { from: '/api/blog-post', to: '/api/webbyblog/blog-post' },
      { from: '/api/blog-tag', to: '/api/webbyblog/blog-tag' },
      { from: '/api/blog-category', to: '/api/webbyblog/blog-category' },
    ];

    const shouldRewrite = (path, from) => path === from || path.startsWith(`${from}/`);

    strapi.server.use(async (ctx, next) => {
      const originalUrl = ctx.url; // includes query string
      const [path, queryString] = originalUrl.split('?');

      for (const { from, to } of mappings) {
        if (shouldRewrite(path, from)) {
          const newPath = `${to}${path.slice(from.length)}`;
          ctx.url = queryString ? `${newPath}?${queryString}` : newPath;
          break;
        }
      }

      await next();
    });

    strapi.log.info('[webbyblog] API alias routes enabled: /api/blog-posts|blog-tags|blog-categories|blog-post/:slug|blog-tag/:slug|blog-category/:slug');
  } catch (error) {
    strapi.log.warn('[webbyblog] Could not enable API alias routes:', error.message);
  }

  // CRITICAL: Hook into Strapi's content type service to ensure schema is properly structured
  // This must run AFTER contentTypes are loaded, so we do it in a later phase
  try {
    // Wait a bit for contentTypes to be available
    if (strapi.contentTypes && typeof strapi.contentTypes.get === 'function') {
      const originalGetContentType = strapi.contentTypes.get.bind(strapi.contentTypes);
      strapi.contentTypes.get = function(uid) {
        const contentType = originalGetContentType(uid);
        
        // Only process our blog-post content type
        if (contentType && uid === 'plugin::webbyblog.blog-post' && contentType.attributes) {
          // Ensure all dynamiczone components are valid
          for (const [attrName, attr] of Object.entries(contentType.attributes)) {
            if (attr && attr.type === 'dynamiczone' && Array.isArray(attr.components)) {
              const validComponents = [];
              
              for (const componentUid of attr.components) {
                if (typeof componentUid === 'string' && componentUid.startsWith('webby-blog.')) {
                  const component = strapi.get('components').get(componentUid);
                  
                  // Only add if component exists and has proper structure
                  if (component && component.attributes && typeof component.attributes === 'object') {
                    validComponents.push(componentUid);
                  } else {
                    strapi.log.warn(`[webbyblog] Component ${componentUid} not properly registered in content type schema, removing`);
                  }
                } else if (componentUid) {
                  validComponents.push(componentUid);
                }
              }
              
              attr.components = validComponents;
            }
          }
        }
        
        return contentType;
      };
      strapi.log.info('[webbyblog] Content type service hook installed');
    } else {
      strapi.log.warn('[webbyblog] contentTypes not available yet, hook will be installed later');
    }
  } catch (error) {
    strapi.log.error('[webbyblog] Error installing content type hook:', error.message);
  }

  // CRITICAL: Re-register all components in bootstrap phase to ensure they're available
  // This ensures components are properly loaded even if register phase didn't complete
  try {
    const componentUids = [
      'webby-blog.text-block',
      'webby-blog.image-block',
      'webby-blog.image-content-block',
      'webby-blog.quote-block',
      'webby-blog.code-block',
      'webby-blog.video-block',
      'webby-blog.gallery-block',
      'webby-blog.cta-block',
      'webby-blog.heading-block',
      'webby-blog.divider-block',
      'webby-blog.faq-block',
      'webby-blog.faq-item',
      'webby-blog.images-slider-block',
    ];

    strapi.log.info('[webbyblog] Verifying and re-registering components in bootstrap phase...');
    for (const uid of componentUids) {
      const component = strapi.get('components').get(uid);
      const componentName = uid.replace('webby-blog.', '');
      
      if (component) {
        const displayName = component.info?.displayName;
        if (displayName) {
          strapi.log.info(`[webbyblog] ✓ ${uid}: "${displayName}"`);
          
          // Even if displayName exists, ensure component is properly structured
          // Re-register to ensure all metadata is correct
          let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
          
          if (fs.existsSync(componentPath)) {
            try {
              delete require.cache[require.resolve(componentPath)];
              const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
              
              // Ensure component has all required metadata
              const updatedComponent = {
                ...component,
                ...componentSchema,
                uid: uid,
                category: componentSchema.info?.category || component.category || 'webby-blog',
                info: {
                  displayName: componentSchema.info?.displayName || component.info?.displayName || displayName,
                  icon: componentSchema.info?.icon || component.info?.icon || 'component',
                  description: componentSchema.info?.description || component.info?.description || '',
                },
              };
              
              // Only update if component exists, don't try to register if already registered
              try {
                strapi.get('components').set(uid, updatedComponent);
                strapi.log.info(`[webbyblog] ✓ Re-registered ${uid} with proper metadata`);
              } catch (error) {
                // If component already registered, just log and continue
                if (error.message && error.message.includes('already been registered')) {
                  strapi.log.info(`[webbyblog] Component ${uid} already registered, skipping re-registration`);
                } else {
                  throw error; // Re-throw if it's a different error
                }
              }
            } catch (error) {
              // Only log error if it's not the "already registered" error
              if (!error.message || !error.message.includes('already been registered')) {
                strapi.log.error(`[webbyblog] Error re-registering ${uid}: ${error.message}`);
              }
            }
          }
        } else {
          strapi.log.error(`[webbyblog] ✗ ${uid}: MISSING displayName!`);
          // Try to fix missing displayName by updating from schema file
          try {
            const candidates = [
              path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`),
              path.join(__dirname, '..', 'components', 'webby-blog', `${componentName}.json`),
              path.join(__dirname, '..', '..', 'server', 'src', 'components', 'webby-blog', `${componentName}.json`),
            ];
            const componentPath = candidates.find((p) => fs.existsSync(p));

            if (componentPath) {
              // Clear require cache to avoid re-registration errors
              delete require.cache[require.resolve(componentPath)];
              const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
              
              // Update component with missing displayName
              const updatedComponent = {
                ...component,
                ...componentSchema,
                uid: uid,
                category: componentSchema.info?.category || 'webby-blog',
                info: {
                  displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  icon: componentSchema.info?.icon || component.info?.icon || 'component',
                  description: componentSchema.info?.description || component.info?.description || '',
                },
              };
              strapi.get('components').set(uid, updatedComponent);
              strapi.log.info(`[webbyblog] ✓ Fixed missing displayName for ${uid}: "${updatedComponent.info.displayName}"`);
            }
          } catch (fixError) {
            strapi.log.error(`[webbyblog] Could not fix missing displayName for ${uid}: ${fixError.message}`);
          }
        }
      } else {
        strapi.log.error(`[webbyblog] ✗ ${uid}: Component not found in registry! Attempting to register...`);
        
        // Try to register component from schema file
        try {
          const candidates = [
            path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`),
            path.join(__dirname, '..', 'components', 'webby-blog', `${componentName}.json`),
            path.join(__dirname, '..', '..', 'server', 'src', 'components', 'webby-blog', `${componentName}.json`),
          ];
          const componentPath = candidates.find((p) => fs.existsSync(p));

          if (componentPath) {
            const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
            const globalId = `ComponentPluginWebbyblog${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
            
            const componentData = {
              ...componentSchema,
              uid: uid,
              modelType: 'component',
              modelName: componentName,
              globalId: globalId,
              category: componentSchema.info?.category || 'webby-blog',
              info: {
                displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                icon: componentSchema.info?.icon || 'component',
                description: componentSchema.info?.description || '',
              },
              collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, '_')}`,
              options: componentSchema.options || {},
              attributes: componentSchema.attributes || {},
            };
            
            strapi.get('components').set(uid, componentData);
            strapi.log.info(`[webbyblog] ✓ Registered missing component ${uid}: "${componentData.info.displayName}"`);
          }
        } catch (registerError) {
          strapi.log.error(`[webbyblog] Could not register missing component ${uid}: ${registerError.message}`);
        }
      }
    }
  } catch (error) {
    strapi.log.error('[webbyblog] Error verifying components:', error.message);
  }

  // Verify routes are accessible
  try {
    const routes = require('./routes');
    strapi.log.info('[webbyblog] Routes structure verified');
    strapi.log.info('[webbyblog] Content-API routes count: ' + (routes['content-api']?.routes?.length || 0));
    strapi.log.info('[webbyblog] Admin routes count: ' + (routes.admin?.routes?.length || 0));
  } catch (error) {
    strapi.log.error('[webbyblog] Error in bootstrap:', error.message);
  }

  // CRITICAL: Fix for content-type-builder path issue - MUST run FIRST before any other middleware
  // This intercepts update-schema requests, filters out plugin content types, and writes schema files for API content types
  // This prevents the "path argument must be of type string. Received undefined" error
  strapi.server.use(async (ctx, next) => {
    // Only handle content-type-builder update-schema requests
    if (ctx.path === '/content-type-builder/update-schema' && ctx.method === 'POST') {
      try {
        // Parse body manually if not already parsed
        let body = ctx.request.body;
        
        if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
          try {
            const contentType = ctx.request.header['content-type'] || '';
            if (contentType.includes('application/json') && ctx.req && typeof ctx.req[Symbol.asyncIterator] === 'function') {
              // Read the stream
              const chunks = [];
              for await (const chunk of ctx.req) {
                chunks.push(chunk);
              }
              const rawBody = Buffer.concat(chunks).toString('utf8');
              
              if (rawBody && rawBody.trim()) {
                body = JSON.parse(rawBody);
                ctx.request.body = body;
                // Restore the stream for downstream middleware
                const { Readable } = require('stream');
                ctx.req = Readable.from([Buffer.from(rawBody)]);
                strapi.log.info('[webbyblog] EARLY: Manually parsed request body');
              }
            }
          } catch (parseError) {
            strapi.log.warn('[webbyblog] EARLY: Could not parse body:', parseError.message);
          }
        }
        
        body = body || {};
        
        // Handle both nested (body.data) and flat (body) request structures
        const data = body.data || body;
        const contentTypes = data.contentTypes || [];
        const components = data.components || [];
        
        strapi.log.info('[webbyblog] ===== EARLY: Processing content-type-builder update-schema request =====');
        strapi.log.info('[webbyblog] EARLY: Content types found:', contentTypes.length);
        strapi.log.info('[webbyblog] EARLY: Components found:', components.length);
        
        // Get the Strapi app directory
        let appDir;
        if (strapi.dirs && strapi.dirs.app && strapi.dirs.app.root) {
          appDir = strapi.dirs.app.root;
        } else if (strapi.dirs && strapi.dirs.root) {
          appDir = strapi.dirs.root;
        } else {
          // Fallback: __dirname is server/src, so go up two levels to get project root
          appDir = path.resolve(__dirname, '../..');
        }
        
        // Ensure strapi.dirs is set for Strapi's internal use
        if (!strapi.dirs) {
          strapi.dirs = {};
        }
        if (!strapi.dirs.app) {
          strapi.dirs.app = {};
        }
        if (!strapi.dirs.app.root) {
          strapi.dirs.app.root = appDir;
        }
        
        // Process components first
        let hasApiComponents = false;
        let hasPluginComponents = false;
        let hasSharedComponents = false;
        for (const component of components) {
          if (!component.uid) continue;
          
          // Handle shared components (format: category.componentName like shared.hello)
          if (!component.uid.startsWith('plugin::') && !component.uid.startsWith('api::')) {
            hasSharedComponents = true;
            // Shared components format: category.componentName
            const uidParts = component.uid.split('.');
            if (uidParts.length >= 2) {
              const category = uidParts[0];
              const componentName = uidParts.slice(1).join('.'); // Handle multi-part names
              
              // Write to src/components/{category}/{componentName}.json
              const componentsDir = path.join(appDir, 'src', 'components', category);
              const schemaPath = path.join(componentsDir, `${componentName}.json`);
              
              strapi.log.info(`[webbyblog] EARLY: Processing shared component: ${component.uid}`);
              
              // Handle deletion
              if (component.action === 'delete') {
                if (fs.existsSync(schemaPath)) {
                  fs.unlinkSync(schemaPath);
                  strapi.log.info(`[webbyblog] EARLY: ✓ Deleted shared component schema: ${schemaPath}`);
                  // Touch another component to trigger restart
                  const now = new Date();
                  if (fs.existsSync(componentsDir)) {
                    const files = fs.readdirSync(componentsDir, { withFileTypes: true })
                      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
                      .map(dirent => dirent.name);
                    if (files.length > 0) {
                      const firstFile = files[0];
                      const firstFilePath = path.join(componentsDir, firstFile);
                      if (fs.existsSync(firstFilePath)) {
                        fs.utimesSync(firstFilePath, now, now);
                      }
                    }
                  }
                }
                ctx.state.componentsDeleted = true;
                continue;
              }
              
              // FORCE create directory structure
              fs.mkdirSync(componentsDir, { recursive: true });
              
              // Read existing schema
              let existingSchema = {};
              if (fs.existsSync(schemaPath)) {
                try {
                  existingSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                } catch (e) {
                  existingSchema = {};
                }
              }
              
              // Build attributes
              const attributes = { ...(existingSchema.attributes || {}) };
              const processedAttributes = new Set();
              const attributesToDelete = [];
              const attributesToCreateOrUpdate = [];
              
              if (component.attributes && Array.isArray(component.attributes)) {
                for (const attr of component.attributes) {
                  const action = attr.action || 'update';
                  if (action === 'delete' && attr.name) {
                    attributesToDelete.push(attr);
                  } else if (attr.name && attr.properties) {
                    attributesToCreateOrUpdate.push(attr);
                  }
                }
              }
              
              // Process deletions
              for (const attr of attributesToDelete) {
                if (attr.name && attributes[attr.name]) {
                  delete attributes[attr.name];
                  strapi.log.info(`[webbyblog] EARLY: ✓ Deleted shared component attribute: ${attr.name}`);
                  processedAttributes.add(attr.name);
                }
              }
              
              // Process creates/updates
              const fieldsInRequest = new Set();
              const newFieldsBeingCreated = [];
              
              for (const attr of attributesToCreateOrUpdate) {
                if (attr.name) {
                  fieldsInRequest.add(attr.name);
                  if (!attributes.hasOwnProperty(attr.name)) {
                    newFieldsBeingCreated.push({ name: attr.name, attr });
                  }
                }
              }
              
              // Detect renames
              const existingFieldNames = Object.keys(attributes);
              const fieldsNotInRequest = existingFieldNames.filter(name => !fieldsInRequest.has(name) && !processedAttributes.has(name));
              
              if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                const oldFieldName = fieldsNotInRequest[0];
                strapi.log.info(`[webbyblog] EARLY: ✓ Detected shared component field rename: ${oldFieldName} -> ${newFieldsBeingCreated[0].name}`);
                delete attributes[oldFieldName];
                processedAttributes.add(oldFieldName);
              }
              
              for (const attr of attributesToCreateOrUpdate) {
                if (attr.name && processedAttributes.has(attr.name)) {
                  continue;
                }
                
                const attributeDef = { ...attr.properties };
                const fieldExists = attributes.hasOwnProperty(attr.name);
                
                if (fieldExists) {
                  const existingAttr = attributes[attr.name];
                  attributes[attr.name] = {
                    ...existingAttr,
                    ...attributeDef
                  };
                  strapi.log.info(`[webbyblog] EARLY: ✓ Updated existing shared component attribute: ${attr.name}`);
                } else {
                  attributes[attr.name] = attributeDef;
                  strapi.log.info(`[webbyblog] EARLY: ✓ Created new shared component attribute: ${attr.name}`);
                }
                
                if (attributes[attr.name].type === 'component' && attributes[attr.name].repeatable === undefined) {
                  attributes[attr.name].repeatable = false;
                }
                
                if (attr.name) {
                  processedAttributes.add(attr.name);
                }
              }
              
              // Build component schema
              const componentSchema = {
                collectionName: component.collectionName || existingSchema.collectionName || `components_${category}_${componentName.replace(/-/g, '_')}`,
                info: {
                  ...(component.info || existingSchema.info || {}),
                  displayName: component.displayName || component.modelName || existingSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                  icon: component.info?.icon || existingSchema.info?.icon || 'component',
                  description: component.info?.description || existingSchema.info?.description || '',
                },
                options: component.options || existingSchema.options || {},
                attributes: attributes,
              };
              
              // Write component schema file
              fs.writeFileSync(schemaPath, JSON.stringify(componentSchema, null, 2), 'utf8');
              
              // Verify and touch file
              if (fs.existsSync(schemaPath)) {
                try {
                  const verifySchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                  const fileStats = fs.statSync(schemaPath);
                  
                  strapi.log.info(`[webbyblog] ========================================`);
                  strapi.log.info(`[webbyblog] ✓ SHARED COMPONENT SCHEMA CREATED/UPDATED`);
                  strapi.log.info(`[webbyblog] ========================================`);
                  strapi.log.info(`[webbyblog] ✓ File: ${schemaPath}`);
                  strapi.log.info(`[webbyblog] ✓ File size: ${fileStats.size} bytes`);
                  strapi.log.info(`[webbyblog] ✓ Schema is valid JSON`);
                  strapi.log.info(`[webbyblog] ✓ Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                  
                  // Ensure file permissions are correct
                  fs.chmodSync(schemaPath, 0o644);
                  
                  // Touch the file to ensure file watcher detects the change and triggers auto-restart
                  // Shared components in src/components/ are definitely watched by Strapi
                  const now = new Date();
                  fs.utimesSync(schemaPath, now, now);
                  
                  strapi.log.info(`[webbyblog] ✓ File touched - file watcher will trigger auto-restart`);
                } catch (verifyError) {
                  strapi.log.error(`[webbyblog] ✗ Component schema file verification failed: ${verifyError.message}`);
                }
              }
              
              strapi.log.info(`[webbyblog] EARLY: ✓ Created/updated shared component schema: ${schemaPath}`);
              ctx.state.componentsCreated = true;
            }
          } else if (component.uid.startsWith('plugin::')) {
            hasPluginComponents = true;
            const uidParts = component.uid.split('::');
            if (uidParts.length === 2) {
              const pluginAndComponent = uidParts[1].split('.');
              if (pluginAndComponent.length >= 2) {
                const pluginName = pluginAndComponent[0];
                const componentName = pluginAndComponent[1];
                
                // Write to extensions folder
                const extensionsDir = path.join(appDir, 'src', 'extensions', pluginName, 'components', componentName);
                const schemaPath = path.join(extensionsDir, 'schema.json');
                
                strapi.log.info(`[webbyblog] EARLY: Processing plugin component: ${component.uid}`);
                
                // Handle deletion
                if (component.action === 'delete') {
                  if (fs.existsSync(schemaPath)) {
                    fs.unlinkSync(schemaPath);
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted plugin component schema: ${schemaPath}`);
                  }
                  // Also delete from global components folder
                  const globalComponentsPath = path.join(appDir, 'src', 'components', componentName, 'schema.json');
                  if (fs.existsSync(globalComponentsPath)) {
                    fs.unlinkSync(globalComponentsPath);
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted global component schema: ${globalComponentsPath}`);
                    // Touch a watched file to trigger restart on deletion
                    const now = new Date();
                    const globalComponentsDir = path.join(appDir, 'src', 'components');
                    if (fs.existsSync(globalComponentsDir)) {
                      const componentDirs = fs.readdirSync(globalComponentsDir, { withFileTypes: true })
                        .filter(dirent => dirent.isDirectory())
                        .map(dirent => dirent.name);
                      if (componentDirs.length > 0) {
                        const firstComponent = componentDirs[0];
                        const firstComponentPath = path.join(globalComponentsDir, firstComponent, 'schema.json');
                        if (fs.existsSync(firstComponentPath)) {
                          fs.utimesSync(firstComponentPath, now, now);
                        }
                      }
                    }
                  }
                  ctx.state.componentsDeleted = true;
                  continue;
                }
                
                // FORCE create directory structure
                fs.mkdirSync(extensionsDir, { recursive: true });
                
                // Read existing schema to preserve any existing attributes
                let existingSchema = {};
                if (fs.existsSync(schemaPath)) {
                  try {
                    existingSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                  } catch (e) {
                    existingSchema = {};
                  }
                }
                
                // Build complete schema from request data
                // Start with existing attributes to preserve them
                const attributes = { ...(existingSchema.attributes || {}) };
                
                // Track processed attribute names to prevent duplicates
                const processedAttributes = new Set();
                
                // Separate attributes into deletes and creates/updates
                const attributesToDelete = [];
                const attributesToCreateOrUpdate = [];
                
                if (component.attributes && Array.isArray(component.attributes)) {
                  for (const attr of component.attributes) {
                    const action = attr.action || 'update';
                    if (action === 'delete' && attr.name) {
                      attributesToDelete.push(attr);
                    } else if (attr.name && attr.properties) {
                      attributesToCreateOrUpdate.push(attr);
                    }
                  }
                }
                
                // STEP 1: Process all deletions first
                for (const attr of attributesToDelete) {
                  if (attr.name && attributes[attr.name]) {
                    delete attributes[attr.name];
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted plugin component attribute: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  } else if (attr.name) {
                    strapi.log.warn(`[webbyblog] EARLY: Plugin component attribute not found for deletion: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  }
                }
                
                // STEP 2: Process all creates/updates
                const fieldsInRequest = new Set();
                const newFieldsBeingCreated = [];
                const fieldsBeingUpdated = [];
                
                for (const attr of attributesToCreateOrUpdate) {
                  if (attr.name) {
                    fieldsInRequest.add(attr.name);
                    if (!attributes.hasOwnProperty(attr.name)) {
                      newFieldsBeingCreated.push({ name: attr.name, attr, action: attr.action || 'update' });
                    } else {
                      fieldsBeingUpdated.push({ name: attr.name, attr });
                    }
                  }
                }
                
                // Detect field renames
                const existingFieldNames = Object.keys(attributes);
                const fieldsNotInRequest = existingFieldNames.filter(name => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                
                if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                  const newField = newFieldsBeingCreated[0];
                  const oldFieldName = fieldsNotInRequest[0];
                  strapi.log.info(`[webbyblog] EARLY: ✓ Detected plugin component field rename: ${oldFieldName} -> ${newField.name}`);
                  delete attributes[oldFieldName];
                  processedAttributes.add(oldFieldName);
                }
                
                for (const attr of attributesToCreateOrUpdate) {
                  if (attr.name && processedAttributes.has(attr.name)) {
                    strapi.log.warn(`[webbyblog] EARLY: Skipping duplicate plugin component attribute: ${attr.name}`);
                    continue;
                  }
                  
                  const action = attr.action || 'update';
                  const attributeDef = { ...attr.properties };
                  const fieldExists = attributes.hasOwnProperty(attr.name);
                  
                  if (fieldExists) {
                    // Update existing attribute - merge with existing properties
                    const existingAttr = attributes[attr.name];
                    attributes[attr.name] = {
                      ...existingAttr,
                      ...attributeDef
                    };
                    strapi.log.info(`[webbyblog] EARLY: ✓ Updated existing plugin component attribute: ${attr.name} (action: ${action})`);
                  } else {
                    // Create new attribute
                    attributes[attr.name] = attributeDef;
                    strapi.log.info(`[webbyblog] EARLY: ✓ Created new plugin component attribute: ${attr.name} (action: ${action})`);
                  }
                  
                  // Handle component types
                  if (attributes[attr.name].type === 'component') {
                    if (attributes[attr.name].component) {
                      strapi.log.info(`[webbyblog] EARLY: Processing plugin component nested component: ${attr.name} -> ${attributes[attr.name].component}`);
                    }
                    if (attributes[attr.name].repeatable === undefined) {
                      attributes[attr.name].repeatable = false;
                    }
                  }
                  
                  // Handle dynamiczone types
                  if (attributes[attr.name].type === 'dynamiczone') {
                    if (Array.isArray(attributes[attr.name].components)) {
                      strapi.log.info(`[webbyblog] EARLY: Processing plugin component dynamiczone: ${attr.name} with ${attributes[attr.name].components.length} components`);
                    }
                  }
                  
                  if (attr.name) {
                    processedAttributes.add(attr.name);
                  }
                }
                
                // Build complete component schema
                const componentSchema = {
                  collectionName: component.collectionName || existingSchema.collectionName || `components_${pluginName}_${componentName.replace(/-/g, '_')}`,
                  info: {
                    ...(component.info || existingSchema.info || {}),
                    displayName: component.displayName || component.modelName || existingSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    icon: component.info?.icon || existingSchema.info?.icon || 'component',
                    description: component.info?.description || existingSchema.info?.description || '',
                  },
                  options: component.options || existingSchema.options || {},
                  attributes: attributes,
                };
                
                // Write component schema file to extensions folder
                fs.writeFileSync(schemaPath, JSON.stringify(componentSchema, null, 2), 'utf8');
                
                // CRITICAL: Also write to global components folder (src/components/) which Strapi definitely watches
                // This ensures auto-restart works just like content types
                const globalComponentsDir = path.join(appDir, 'src', 'components', componentName);
                const globalComponentsPath = path.join(globalComponentsDir, 'schema.json');
                fs.mkdirSync(globalComponentsDir, { recursive: true });
                fs.writeFileSync(globalComponentsPath, JSON.stringify(componentSchema, null, 2), 'utf8');
                strapi.log.info(`[webbyblog] EARLY: ✓ Also wrote to global components folder: ${globalComponentsPath}`);
                
                // Verify the file was written correctly
                if (fs.existsSync(schemaPath) && fs.existsSync(globalComponentsPath)) {
                  try {
                    const verifySchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                    const fileStats = fs.statSync(schemaPath);
                    
                    strapi.log.info(`[webbyblog] ========================================`);
                    strapi.log.info(`[webbyblog] ✓ PLUGIN COMPONENT SCHEMA CREATED/UPDATED`);
                    strapi.log.info(`[webbyblog] ========================================`);
                    strapi.log.info(`[webbyblog] ✓ Extension file: ${schemaPath}`);
                    strapi.log.info(`[webbyblog] ✓ Global components file: ${globalComponentsPath}`);
                    strapi.log.info(`[webbyblog] ✓ File size: ${fileStats.size} bytes`);
                    strapi.log.info(`[webbyblog] ✓ Schema is valid JSON`);
                    strapi.log.info(`[webbyblog] ✓ Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                    
                    // Ensure file permissions are correct
                    fs.chmodSync(schemaPath, 0o644);
                    fs.chmodSync(globalComponentsPath, 0o644);
                    
                    // Touch both files to ensure file watcher detects the change and triggers auto-restart
                    // The global components file is definitely watched by Strapi
                    const now = new Date();
                    fs.utimesSync(schemaPath, now, now);
                    fs.utimesSync(globalComponentsPath, now, now);
                    
                    strapi.log.info(`[webbyblog] ✓ Both files touched - file watcher will trigger auto-restart`);
                  } catch (verifyError) {
                    strapi.log.error(`[webbyblog] ✗ Component schema file verification failed: ${verifyError.message}`);
                  }
                } else {
                  strapi.log.error(`[webbyblog] ✗ Component schema file was not created properly`);
                }
                
                strapi.log.info(`[webbyblog] EARLY: ✓ Created/updated plugin component schema: ${schemaPath}`);
                ctx.state.componentsCreated = true;
              }
            }
          } else if (component.uid.startsWith('api::')) {
            // Handle API components - write to api folder
            hasApiComponents = true;
            const uidParts = component.uid.split('::');
            if (uidParts.length === 2) {
              const apiAndComponent = uidParts[1].split('.');
              if (apiAndComponent.length >= 2) {
                const apiName = apiAndComponent[0];
                const componentName = apiAndComponent[1];
                
                const apiDir = path.join(appDir, 'src', 'api', apiName);
                const componentsDir = path.join(apiDir, 'components', componentName);
                const schemaPath = path.join(componentsDir, 'schema.json');
                
                strapi.log.info(`[webbyblog] EARLY: Processing API component: ${component.uid}`);
                
                // Handle deletion
                if (component.action === 'delete') {
                  if (fs.existsSync(schemaPath)) {
                    fs.unlinkSync(schemaPath);
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted API component schema: ${schemaPath}`);
                    // Touch a watched file to trigger restart on deletion
                    const now = new Date();
                    const contentTypeDir = path.join(apiDir, 'content-types');
                    if (fs.existsSync(contentTypeDir)) {
                      const contentTypeDirs = fs.readdirSync(contentTypeDir, { withFileTypes: true })
                        .filter(dirent => dirent.isDirectory())
                        .map(dirent => dirent.name);
                      if (contentTypeDirs.length > 0) {
                        const firstContentType = contentTypeDirs[0];
                        const contentTypeSchemaPath = path.join(contentTypeDir, firstContentType, 'schema.json');
                        if (fs.existsSync(contentTypeSchemaPath)) {
                          fs.utimesSync(contentTypeSchemaPath, now, now);
                        }
                      }
                    }
                  }
                  ctx.state.componentsDeleted = true;
                  continue;
                }
                
                // FORCE create directory structure
                fs.mkdirSync(componentsDir, { recursive: true });
                
                // Read existing schema
                let existingSchema = {};
                if (fs.existsSync(schemaPath)) {
                  try {
                    existingSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                  } catch (e) {
                    existingSchema = {};
                  }
                }
                
                // Build attributes
                const attributes = { ...(existingSchema.attributes || {}) };
                const processedAttributes = new Set();
                const attributesToDelete = [];
                const attributesToCreateOrUpdate = [];
                
                if (component.attributes && Array.isArray(component.attributes)) {
                  for (const attr of component.attributes) {
                    const action = attr.action || 'update';
                    if (action === 'delete' && attr.name) {
                      attributesToDelete.push(attr);
                    } else if (attr.name && attr.properties) {
                      attributesToCreateOrUpdate.push(attr);
                    }
                  }
                }
                
                // Process deletions
                for (const attr of attributesToDelete) {
                  if (attr.name && attributes[attr.name]) {
                    delete attributes[attr.name];
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted API component attribute: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  }
                }
                
                // Process creates/updates
                const fieldsInRequest = new Set();
                const newFieldsBeingCreated = [];
                
                for (const attr of attributesToCreateOrUpdate) {
                  if (attr.name) {
                    fieldsInRequest.add(attr.name);
                    if (!attributes.hasOwnProperty(attr.name)) {
                      newFieldsBeingCreated.push({ name: attr.name, attr });
                    }
                  }
                }
                
                // Detect renames
                const existingFieldNames = Object.keys(attributes);
                const fieldsNotInRequest = existingFieldNames.filter(name => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                
                if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                  const oldFieldName = fieldsNotInRequest[0];
                  strapi.log.info(`[webbyblog] EARLY: ✓ Detected API component field rename: ${oldFieldName} -> ${newFieldsBeingCreated[0].name}`);
                  delete attributes[oldFieldName];
                  processedAttributes.add(oldFieldName);
                }
                
                for (const attr of attributesToCreateOrUpdate) {
                  if (attr.name && processedAttributes.has(attr.name)) {
                    continue;
                  }
                  
                  const attributeDef = { ...attr.properties };
                  const fieldExists = attributes.hasOwnProperty(attr.name);
                  
                  if (fieldExists) {
                    const existingAttr = attributes[attr.name];
                    attributes[attr.name] = {
                      ...existingAttr,
                      ...attributeDef
                    };
                    strapi.log.info(`[webbyblog] EARLY: ✓ Updated existing API component attribute: ${attr.name}`);
                  } else {
                    attributes[attr.name] = attributeDef;
                    strapi.log.info(`[webbyblog] EARLY: ✓ Created new API component attribute: ${attr.name}`);
                  }
                  
                  if (attributes[attr.name].type === 'component' && attributes[attr.name].repeatable === undefined) {
                    attributes[attr.name].repeatable = false;
                  }
                  
                  if (attr.name) {
                    processedAttributes.add(attr.name);
                  }
                }
                
                // Build component schema
                const componentSchema = {
                  collectionName: component.collectionName || existingSchema.collectionName || `components_${apiName}_${componentName.replace(/-/g, '_')}`,
                  info: {
                    ...(component.info || existingSchema.info || {}),
                    displayName: component.displayName || component.modelName || existingSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    icon: component.info?.icon || existingSchema.info?.icon || 'component',
                    description: component.info?.description || existingSchema.info?.description || '',
                  },
                  options: component.options || existingSchema.options || {},
                  attributes: attributes,
                };
                
                // Write component schema file
                fs.writeFileSync(schemaPath, JSON.stringify(componentSchema, null, 2), 'utf8');
                
                // Verify the file was written correctly
                if (fs.existsSync(schemaPath)) {
                  try {
                    const verifySchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                    const fileStats = fs.statSync(schemaPath);
                    
                    strapi.log.info(`[webbyblog] ========================================`);
                    strapi.log.info(`[webbyblog] ✓ API COMPONENT SCHEMA CREATED/UPDATED`);
                    strapi.log.info(`[webbyblog] ========================================`);
                    strapi.log.info(`[webbyblog] ✓ File: ${schemaPath}`);
                    strapi.log.info(`[webbyblog] ✓ File size: ${fileStats.size} bytes`);
                    strapi.log.info(`[webbyblog] ✓ Schema is valid JSON`);
                    strapi.log.info(`[webbyblog] ✓ Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                    
                    // Ensure file permissions are correct
                    fs.chmodSync(schemaPath, 0o644);
                    
                    // Touch the file to ensure file watcher detects the change and triggers auto-restart
                    // API components in src/api/*/components/ are watched by Strapi, so this should work
                    const now = new Date();
                    fs.utimesSync(schemaPath, now, now);
                    
                    strapi.log.info(`[webbyblog] ✓ File touched - file watcher will trigger auto-restart`);
                  } catch (verifyError) {
                    strapi.log.error(`[webbyblog] ✗ Component schema file verification failed: ${verifyError.message}`);
                  }
                } else {
                  strapi.log.error(`[webbyblog] ✗ Component schema file was not created: ${schemaPath}`);
                }
                
                strapi.log.info(`[webbyblog] EARLY: ✓ Created/updated API component schema: ${schemaPath}`);
                ctx.state.componentsCreated = true;
              }
            }
          }
        }
        
        // Process each content type in the request
        let hasApiContentTypes = false;
        let hasPluginContentTypes = false;
        for (const contentType of contentTypes) {
          // Handle plugin content types - write to extensions folder
          if (contentType.uid && contentType.uid.startsWith('plugin::')) {
            hasPluginContentTypes = true;
            const uidParts = contentType.uid.split('::');
            if (uidParts.length === 2) {
              const pluginAndType = uidParts[1].split('.');
              if (pluginAndType.length >= 2) {
                const pluginName = pluginAndType[0];
                const contentTypeName = pluginAndType[1];
                
                // Write to extensions folder
                const extensionsDir = path.join(appDir, 'src', 'extensions', pluginName, 'content-types', contentTypeName);
                const schemaPath = path.join(extensionsDir, 'schema.json');
                
                strapi.log.info(`[webbyblog] EARLY: Processing plugin content type: ${contentType.uid}`);
                
                // Handle deletion
                if (contentType.action === 'delete') {
                  if (fs.existsSync(schemaPath)) {
                    fs.unlinkSync(schemaPath);
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted plugin schema: ${schemaPath}`);
                  }
                  continue;
                }
                
                // FORCE create directory structure
                fs.mkdirSync(extensionsDir, { recursive: true });
                
                // Read existing schema to preserve any existing attributes
                let existingSchema = {};
                if (fs.existsSync(schemaPath)) {
                  try {
                    existingSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                  } catch (e) {
                    existingSchema = {};
                  }
                }
                
                // Build complete schema from request data
                // Start with existing attributes to preserve them
                const attributes = { ...(existingSchema.attributes || {}) };
                
                // Track processed attribute names to prevent duplicates
                const processedAttributes = new Set();
                
                // Separate attributes into deletes and creates/updates
                // Process deletes first, then creates/updates to handle field renames correctly
                const attributesToDelete = [];
                const attributesToCreateOrUpdate = [];
                
                if (contentType.attributes && Array.isArray(contentType.attributes)) {
                  for (const attr of contentType.attributes) {
                    const action = attr.action || 'update';
                    if (action === 'delete' && attr.name) {
                      attributesToDelete.push(attr);
                    } else if (attr.name && attr.properties) {
                      attributesToCreateOrUpdate.push(attr);
                    }
                  }
                }
                
                // STEP 1: Process all deletions first
                for (const attr of attributesToDelete) {
                  if (attr.name && attributes[attr.name]) {
                    delete attributes[attr.name];
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted plugin attribute: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  } else if (attr.name) {
                    strapi.log.warn(`[webbyblog] EARLY: Plugin attribute not found for deletion: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  }
                }
                
                // STEP 2: Process all creates/updates
                // Collect all field names that will exist after processing
                const fieldsInRequest = new Set();
                const newFieldsBeingCreated = []; // Fields that don't exist yet (regardless of action)
                const fieldsBeingUpdated = [];
                
                for (const attr of attributesToCreateOrUpdate) {
                  if (attr.name) {
                    fieldsInRequest.add(attr.name);
                    const action = attr.action || 'update';
                    // A field is "new" if it doesn't exist in the current schema
                    // This handles renames where action might be 'update' but field is actually new
                    if (!attributes.hasOwnProperty(attr.name)) {
                      newFieldsBeingCreated.push({ name: attr.name, attr, action });
                    } else {
                      fieldsBeingUpdated.push({ name: attr.name, attr });
                    }
                  }
                }
                
                // Log for debugging
                strapi.log.info(`[webbyblog] EARLY: Plugin fields in request: ${Array.from(fieldsInRequest).join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Plugin existing fields: ${Object.keys(attributes).join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Plugin new fields being created: ${newFieldsBeingCreated.map(f => f.name).join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Plugin fields being updated: ${fieldsBeingUpdated.map(f => f.name).join(', ')}`);
                
                // Detect potential field renames
                const existingFieldCount = Object.keys(attributes).length;
                const requestFieldCount = fieldsInRequest.size;
                const existingFieldNames = Object.keys(attributes);
                const fieldsNotInRequest = existingFieldNames.filter(name => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                
                strapi.log.info(`[webbyblog] EARLY: Plugin fields not in request (might be renamed): ${fieldsNotInRequest.join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Plugin field count - Existing: ${existingFieldCount}, Request: ${requestFieldCount}, New: ${newFieldsBeingCreated.length}`);
                
                // RENAME DETECTION LOGIC for plugin content types
                if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                  const newField = newFieldsBeingCreated[0];
                  const oldFieldName = fieldsNotInRequest[0];
                  const newFieldDef = { ...newField.attr.properties };
                  
                  strapi.log.info(`[webbyblog] EARLY: ✓ Detected plugin field rename: ${oldFieldName} -> ${newField.name}`);
                  strapi.log.info(`[webbyblog] EARLY: ✓ Deleting old plugin field: ${oldFieldName}`);
                  delete attributes[oldFieldName];
                  processedAttributes.add(oldFieldName);
                }
                
                for (const attr of attributesToCreateOrUpdate) {
                  // Skip if we've already processed this attribute in this request
                  if (attr.name && processedAttributes.has(attr.name)) {
                    strapi.log.warn(`[webbyblog] EARLY: Skipping duplicate plugin attribute in request: ${attr.name}`);
                    continue;
                  }
                  
                  const action = attr.action || 'update';
                  
                  // Build the attribute object from properties
                  const attributeDef = { ...attr.properties };
                  
                  // Check if attribute already exists
                  const fieldExists = attributes.hasOwnProperty(attr.name);
                  
                  // If updating an existing attribute, merge with existing properties
                  // This preserves properties that might not be in the update request
                  if (fieldExists) {
                    // Field exists - this is an update
                    // Merge existing attribute with new properties
                    // New properties override existing ones, but preserve others
                    const existingAttr = attributes[attr.name];
                    attributes[attr.name] = {
                      ...existingAttr,
                      ...attributeDef
                    };
                    strapi.log.info(`[webbyblog] EARLY: ✓ Updated existing plugin attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || existingAttr.type || 'unknown'})`);
                  } else {
                    // Field doesn't exist - this is a create
                    attributes[attr.name] = attributeDef;
                    strapi.log.info(`[webbyblog] EARLY: ✓ Created new plugin attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || 'unknown'})`);
                  }
                  
                  // Handle component types - ensure component references are correct
                  if (attributes[attr.name].type === 'component') {
                    if (attributes[attr.name].component) {
                      strapi.log.info(`[webbyblog] EARLY: Processing plugin component attribute: ${attr.name} -> ${attributes[attr.name].component}`);
                    }
                    // Component attributes need specific structure
                    if (attributes[attr.name].repeatable === undefined) {
                      attributes[attr.name].repeatable = false;
                    }
                  }
                  
                  // Handle dynamiczone types
                  if (attributes[attr.name].type === 'dynamiczone') {
                    if (Array.isArray(attributes[attr.name].components)) {
                      strapi.log.info(`[webbyblog] EARLY: Processing plugin dynamiczone: ${attr.name} with ${attributes[attr.name].components.length} components`);
                    }
                  }
                  
                  // Handle relation types
                  if (attributes[attr.name].type === 'relation') {
                    if (attributes[attr.name].target) {
                      strapi.log.info(`[webbyblog] EARLY: Processing plugin relation: ${attr.name} -> ${attributes[attr.name].target}`);
                    }
                  }
                  
                  // Mark as processed
                  if (attr.name) {
                    processedAttributes.add(attr.name);
                  }
                }
                
                // Build complete schema
                const schema = {
                  kind: contentType.kind || existingSchema.kind || 'collectionType',
                  collectionName: contentType.collectionName || existingSchema.collectionName || `${contentTypeName}s`,
                  info: {
                    singularName: contentType.singularName || existingSchema.info?.singularName || contentTypeName,
                    pluralName: contentType.pluralName || existingSchema.info?.pluralName || `${contentTypeName}s`,
                    displayName: contentType.displayName || contentType.modelName || existingSchema.info?.displayName || contentTypeName,
                    description: contentType.description || existingSchema.info?.description || '',
                  },
                  options: {
                    draftAndPublish: contentType.draftAndPublish !== undefined ? contentType.draftAndPublish : (existingSchema.options?.draftAndPublish !== undefined ? existingSchema.options.draftAndPublish : false),
                  },
                  pluginOptions: contentType.pluginOptions || existingSchema.pluginOptions || {
                    'content-manager': { visible: true },
                    'content-api': { visible: true }
                  },
                  attributes: attributes,
                };
                
                // Write schema file
                fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
                strapi.log.info(`[webbyblog] EARLY: ✓ Created/updated plugin schema: ${schemaPath}`);
                ctx.state.schemaFileCreated = true;
              }
            }
          } else if (contentType.uid && contentType.uid.startsWith('api::')) {
            hasApiContentTypes = true;
            const uidParts = contentType.uid.split('::');
            if (uidParts.length === 2) {
              const apiAndType = uidParts[1].split('.');
              if (apiAndType.length >= 2) {
                const apiName = apiAndType[0];
                const contentTypeName = apiAndType[1];
                
                const apiDir = path.join(appDir, 'src', 'api', apiName);
                const contentTypeDir = path.join(apiDir, 'content-types', contentTypeName);
                const schemaPath = path.join(contentTypeDir, 'schema.json');
                
                // Handle collection deletion
                if (contentType.action === 'delete') {
                  strapi.log.info(`[webbyblog] EARLY: Deleting collection: ${contentType.uid}`);
                  
                  // Delete the entire API folder (controllers, services, routes, content-types)
                  if (fs.existsSync(apiDir)) {
                    try {
                      // Check if this is the only content type in this API folder
                      // If there are other content types, only delete the specific content-type folder
                      const contentTypesDir = path.join(apiDir, 'content-types');
                      const otherContentTypes = [];
                      
                      if (fs.existsSync(contentTypesDir)) {
                        const allContentTypes = fs.readdirSync(contentTypesDir, { withFileTypes: true })
                          .filter(dirent => dirent.isDirectory())
                          .map(dirent => dirent.name);
                        
                        otherContentTypes.push(...allContentTypes.filter(name => name !== contentTypeName));
                      }
                      
                      // If this is the only content type, delete the entire API folder
                      if (otherContentTypes.length === 0) {
                        strapi.log.info(`[webbyblog] EARLY: This is the only content type in API folder, deleting entire API folder: ${apiDir}`);
                        fs.rmSync(apiDir, { recursive: true, force: true });
                        strapi.log.info(`[webbyblog] EARLY: ✓ Deleted entire API folder: ${apiDir}`);
                      } else {
                        // Multiple content types exist, only delete this content type's files/folders
                        strapi.log.info(`[webbyblog] EARLY: Other content types exist, deleting only ${contentTypeName} files`);
                        
                        // Delete content type directory
                        if (fs.existsSync(contentTypeDir)) {
                          fs.rmSync(contentTypeDir, { recursive: true, force: true });
                          strapi.log.info(`[webbyblog] EARLY: ✓ Deleted content type directory: ${contentTypeDir}`);
                        }
                        
                        // Delete controller file
                        const controllerFile = path.join(apiDir, 'controllers', `${contentTypeName}.js`);
                        if (fs.existsSync(controllerFile)) {
                          fs.unlinkSync(controllerFile);
                          strapi.log.info(`[webbyblog] EARLY: ✓ Deleted controller file: ${controllerFile}`);
                        }
                        
                        // Delete service file
                        const serviceFile = path.join(apiDir, 'services', `${contentTypeName}.js`);
                        if (fs.existsSync(serviceFile)) {
                          fs.unlinkSync(serviceFile);
                          strapi.log.info(`[webbyblog] EARLY: ✓ Deleted service file: ${serviceFile}`);
                        }
                        
                        // Delete route file
                        const routeFile = path.join(apiDir, 'routes', `${contentTypeName}.js`);
                        if (fs.existsSync(routeFile)) {
                          fs.unlinkSync(routeFile);
                          strapi.log.info(`[webbyblog] EARLY: ✓ Deleted route file: ${routeFile}`);
                        }
                      }
                    } catch (error) {
                      strapi.log.error(`[webbyblog] EARLY: ✗ Error deleting API folder: ${error.message}`);
                      strapi.log.error(`[webbyblog] EARLY: Error stack: ${error.stack}`);
                    }
                  } else {
                    strapi.log.warn(`[webbyblog] EARLY: API folder does not exist: ${apiDir}`);
                  }
                  
                  ctx.state.schemaFileCreated = true;
                  ctx.state.schemaDeleted = true;
                  continue;
                }
                
                // FORCE create directory structure
                fs.mkdirSync(contentTypeDir, { recursive: true });
                
                // Read existing schema to preserve any existing attributes
                let existingSchema = {};
                if (fs.existsSync(schemaPath)) {
                  try {
                    existingSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                  } catch (e) {
                    existingSchema = {};
                  }
                }
                
                // Build complete schema from request data
                // Start with existing attributes to preserve them
                const attributes = { ...(existingSchema.attributes || {}) };
                
                // Track processed attribute names to prevent duplicates
                const processedAttributes = new Set();
                
                // Separate attributes into deletes and creates/updates
                // Process deletes first, then creates/updates to handle field renames correctly
                const attributesToDelete = [];
                const attributesToCreateOrUpdate = [];
                
                if (contentType.attributes && Array.isArray(contentType.attributes)) {
                  for (const attr of contentType.attributes) {
                    const action = attr.action || 'update';
                    if (action === 'delete' && attr.name) {
                      attributesToDelete.push(attr);
                    } else if (attr.name && attr.properties) {
                      attributesToCreateOrUpdate.push(attr);
                    }
                  }
                }
                
                // STEP 1: Process all deletions first
                for (const attr of attributesToDelete) {
                  if (attr.name && attributes[attr.name]) {
                    delete attributes[attr.name];
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleted attribute: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  } else if (attr.name) {
                    strapi.log.warn(`[webbyblog] EARLY: Attribute not found for deletion: ${attr.name}`);
                    processedAttributes.add(attr.name);
                  }
                }
                
                // STEP 2: Process all creates/updates
                // Collect all field names that will exist after processing
                const fieldsInRequest = new Set();
                const newFieldsBeingCreated = []; // Fields that don't exist yet (regardless of action)
                const fieldsBeingUpdated = [];
                
                for (const attr of attributesToCreateOrUpdate) {
                  if (attr.name) {
                    fieldsInRequest.add(attr.name);
                    const action = attr.action || 'update';
                    // A field is "new" if it doesn't exist in the current schema
                    // This handles renames where action might be 'update' but field is actually new
                    if (!attributes.hasOwnProperty(attr.name)) {
                      newFieldsBeingCreated.push({ name: attr.name, attr, action });
                    } else {
                      fieldsBeingUpdated.push({ name: attr.name, attr });
                    }
                  }
                }
                
                // Log for debugging
                strapi.log.info(`[webbyblog] EARLY: Fields in request: ${Array.from(fieldsInRequest).join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Existing fields: ${Object.keys(attributes).join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: New fields being created: ${newFieldsBeingCreated.map(f => f.name).join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Fields being updated: ${fieldsBeingUpdated.map(f => f.name).join(', ')}`);
                
                // Detect potential field renames
                // Strategy 1: If creating one new field and total field count stays same, it's likely a rename
                const existingFieldCount = Object.keys(attributes).length;
                const requestFieldCount = fieldsInRequest.size;
                
                // Strategy 2: If we're creating a new field, check if there's an existing field
                // that's not in the request (was removed/renamed)
                const existingFieldNames = Object.keys(attributes);
                const fieldsNotInRequest = existingFieldNames.filter(name => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                
                strapi.log.info(`[webbyblog] EARLY: Fields not in request (might be renamed): ${fieldsNotInRequest.join(', ')}`);
                strapi.log.info(`[webbyblog] EARLY: Field count - Existing: ${existingFieldCount}, Request: ${requestFieldCount}, New: ${newFieldsBeingCreated.length}`);
                
                // RENAME DETECTION LOGIC
                // When you rename a field in Strapi UI, it might send all fields but we need to detect the rename
                
                // Strategy 1: If creating one new field and there's exactly one field not in request, treat as rename
                // This is the most common case: field "hi" renamed to "hi_two"
                // - "hi" is not in request (fieldsNotInRequest)
                // - "hi_two" is new (newFieldsBeingCreated)
                if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                  const newField = newFieldsBeingCreated[0];
                  const oldFieldName = fieldsNotInRequest[0];
                  const oldField = attributes[oldFieldName];
                  const newFieldDef = { ...newField.attr.properties };
                  
                  // Always treat as rename if one new field and one missing field
                  strapi.log.info(`[webbyblog] EARLY: ✓ Detected field rename: ${oldFieldName} -> ${newField.name}`);
                  strapi.log.info(`[webbyblog] EARLY: ✓ Deleting old field: ${oldFieldName}`);
                  delete attributes[oldFieldName];
                  processedAttributes.add(oldFieldName);
                }
                // Strategy 2: If creating one new field and field count stays same, it's likely a rename
                // Find the field that was "replaced" - it might still be in request but we need to remove it
                else if (newFieldsBeingCreated.length === 1) {
                  const newField = newFieldsBeingCreated[0];
                  const newFieldDef = { ...newField.attr.properties };
                  
                  // If field count would stay same (after accounting for the new field), find candidate to remove
                  // Look for fields that are in the request but might be the "old" version of the renamed field
                  // We'll remove fields that are being "updated" but have the same type as the new field
                  const candidateFieldsToRemove = [];
                  
                  for (const updateField of fieldsBeingUpdated) {
                    const existingField = attributes[updateField.name];
                    // If an existing field has the same type as the new field being created,
                    // and the new field name is different, it might be a rename
                    if (existingField && existingField.type === newFieldDef.type && updateField.name !== newField.name) {
                      candidateFieldsToRemove.push(updateField.name);
                    }
                  }
                  
                  // Also check fields not in request
                  for (const oldFieldName of fieldsNotInRequest) {
                    const oldField = attributes[oldFieldName];
                    if (oldField && oldField.type === newFieldDef.type) {
                      candidateFieldsToRemove.push(oldFieldName);
                    }
                  }
                  
                  // If we found exactly one candidate, remove it (it's the renamed field)
                  if (candidateFieldsToRemove.length === 1) {
                    const oldFieldName = candidateFieldsToRemove[0];
                    strapi.log.info(`[webbyblog] EARLY: ✓ Detected field rename (by type match): ${oldFieldName} -> ${newField.name}`);
                    strapi.log.info(`[webbyblog] EARLY: ✓ Deleting old field: ${oldFieldName}`);
                    delete attributes[oldFieldName];
                    processedAttributes.add(oldFieldName);
                  } else if (candidateFieldsToRemove.length > 1) {
                    strapi.log.warn(`[webbyblog] EARLY: Multiple rename candidates found, cannot auto-detect rename`);
                  }
                  // Strategy 3: If no exact match but creating one new field, and there's one field with same type
                  // that's being updated, it might be a rename - remove the old one
                  else if (candidateFieldsToRemove.length === 0 && fieldsBeingUpdated.length === 1) {
                    const updatedField = fieldsBeingUpdated[0];
                    const updatedFieldDef = attributes[updatedField.name];
                    // If the updated field has same type as new field, and names are different, it's likely a rename
                    if (updatedFieldDef && updatedFieldDef.type === newFieldDef.type && updatedField.name !== newField.name) {
                      strapi.log.info(`[webbyblog] EARLY: ✓ Detected field rename (updated field with same type): ${updatedField.name} -> ${newField.name}`);
                      strapi.log.info(`[webbyblog] EARLY: ✓ Deleting old field: ${updatedField.name}`);
                      delete attributes[updatedField.name];
                      processedAttributes.add(updatedField.name);
                    }
                  }
                  // Strategy 4: Last resort - if creating one new field and there's exactly one existing field
                  // with the same type (anywhere), treat as rename
                  else if (candidateFieldsToRemove.length === 0) {
                    const fieldsWithSameType = existingFieldNames.filter(name => {
                      const field = attributes[name];
                      return field && field.type === newFieldDef.type && !processedAttributes.has(name);
                    });
                    
                    if (fieldsWithSameType.length === 1) {
                      const oldFieldName = fieldsWithSameType[0];
                      strapi.log.info(`[webbyblog] EARLY: ✓ Detected field rename (last resort - single field with same type): ${oldFieldName} -> ${newField.name}`);
                      strapi.log.info(`[webbyblog] EARLY: ✓ Deleting old field: ${oldFieldName}`);
                      delete attributes[oldFieldName];
                      processedAttributes.add(oldFieldName);
                    }
                  }
                }
                
                for (const attr of attributesToCreateOrUpdate) {
                  // Skip if we've already processed this attribute in this request
                  if (attr.name && processedAttributes.has(attr.name)) {
                    strapi.log.warn(`[webbyblog] EARLY: Skipping duplicate attribute in request: ${attr.name}`);
                    continue;
                  }
                  
                  const action = attr.action || 'update';
                  
                  // Build the attribute object from properties
                  const attributeDef = { ...attr.properties };
                  
                  // Check if attribute already exists
                  const fieldExists = attributes.hasOwnProperty(attr.name);
                  
                  // If updating an existing attribute, merge with existing properties
                  // This preserves properties that might not be in the update request
                  if (fieldExists) {
                    // Field exists - this is an update
                    // Merge existing attribute with new properties
                    // New properties override existing ones, but preserve others
                    const existingAttr = attributes[attr.name];
                    attributes[attr.name] = {
                      ...existingAttr,
                      ...attributeDef
                    };
                    strapi.log.info(`[webbyblog] EARLY: ✓ Updated existing attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || existingAttr.type || 'unknown'})`);
                  } else {
                    // Field doesn't exist - this is a create
                    attributes[attr.name] = attributeDef;
                    strapi.log.info(`[webbyblog] EARLY: ✓ Created new attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || 'unknown'})`);
                  }
                  
                  // Handle component types - ensure component references are correct
                  if (attributes[attr.name].type === 'component') {
                    if (attributes[attr.name].component) {
                      strapi.log.info(`[webbyblog] EARLY: Processing component attribute: ${attr.name} -> ${attributes[attr.name].component}`);
                    }
                    // Component attributes need specific structure
                    if (attributes[attr.name].repeatable === undefined) {
                      attributes[attr.name].repeatable = false;
                    }
                  }
                  
                  // Handle dynamiczone types
                  if (attributes[attr.name].type === 'dynamiczone') {
                    if (Array.isArray(attributes[attr.name].components)) {
                      strapi.log.info(`[webbyblog] EARLY: Processing dynamiczone: ${attr.name} with ${attributes[attr.name].components.length} components`);
                    }
                  }
                  
                  // Handle relation types
                  if (attributes[attr.name].type === 'relation') {
                    if (attributes[attr.name].target) {
                      strapi.log.info(`[webbyblog] EARLY: Processing relation: ${attr.name} -> ${attributes[attr.name].target}`);
                    }
                  }
                  
                  // Mark as processed
                  if (attr.name) {
                    processedAttributes.add(attr.name);
                  }
                }
                
                // Build the complete schema object matching Strapi's format
                const schema = {
                  kind: contentType.kind || existingSchema.kind || 'collectionType',
                  collectionName: contentType.collectionName || existingSchema.collectionName || (contentType.kind === 'singleType' ? contentTypeName : `${contentTypeName}s`),
                  info: {
                    singularName: contentType.singularName || existingSchema.info?.singularName || contentTypeName,
                    pluralName: contentType.pluralName || existingSchema.info?.pluralName || (contentType.kind === 'singleType' ? contentTypeName : `${contentTypeName}s`),
                    displayName: contentType.displayName || contentType.modelName || existingSchema.info?.displayName || contentTypeName,
                    description: contentType.description || existingSchema.info?.description || '',
                  },
                  options: {
                    draftAndPublish: contentType.draftAndPublish !== undefined ? contentType.draftAndPublish : (existingSchema.options?.draftAndPublish !== undefined ? existingSchema.options.draftAndPublish : false),
                  },
                  pluginOptions: contentType.pluginOptions || existingSchema.pluginOptions || {
                    'content-manager': {
                      visible: true
                    },
                    'content-api': {
                      visible: true
                    }
                  },
                  attributes: attributes,
                };
                
                // Write the complete schema file
                const schemaJson = JSON.stringify(schema, null, 2);
                fs.writeFileSync(schemaPath, schemaJson, 'utf8');
                
                // Verify the file was written correctly
                if (fs.existsSync(schemaPath)) {
                  try {
                    const verifySchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                    const fileStats = fs.statSync(schemaPath);
                    
                    strapi.log.info(`[webbyblog] ========================================`);
                    strapi.log.info(`[webbyblog] ✓ COLLECTION SCHEMA CREATED/UPDATED`);
                    strapi.log.info(`[webbyblog] ========================================`);
                    strapi.log.info(`[webbyblog] ✓ File: ${schemaPath}`);
                    strapi.log.info(`[webbyblog] ✓ File size: ${fileStats.size} bytes`);
                    strapi.log.info(`[webbyblog] ✓ Schema is valid JSON`);
                    strapi.log.info(`[webbyblog] ✓ Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                    
                    // Ensure file permissions are correct
                    fs.chmodSync(schemaPath, 0o644);
                    
                    // Touch the file to ensure file watcher detects the change
                    const now = new Date();
                    fs.utimesSync(schemaPath, now, now);
                    
                    ctx.state.schemaFileCreated = true;
                    ctx.state.schemaPath = schemaPath;
                    ctx.state.contentTypeUid = contentType.uid;
                    
                  } catch (verifyError) {
                    strapi.log.error(`[webbyblog] ✗ Schema file verification failed: ${verifyError.message}`);
                  }
                } else {
                  strapi.log.error(`[webbyblog] ✗ Schema file was not created: ${schemaPath}`);
                }
                
                // Also ensure controllers, services, and routes files exist (not directories)
                const controllersDir = path.join(apiDir, 'controllers');
                const servicesDir = path.join(apiDir, 'services');
                const routesDir = path.join(apiDir, 'routes');
                
                // Ensure parent directories exist
                [controllersDir, servicesDir, routesDir].forEach(dir => {
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    strapi.log.info(`[webbyblog] EARLY: ✓ Created directory: ${dir}`);
                  }
                });
                
                // Create controller file
                const controllerFile = path.join(controllersDir, `${contentTypeName}.js`);
                if (!fs.existsSync(controllerFile)) {
                  const controllerContent = `'use strict';

/**
 * ${contentTypeName} controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('${contentType.uid}');
`;
                  fs.writeFileSync(controllerFile, controllerContent, 'utf8');
                  strapi.log.info(`[webbyblog] EARLY: ✓ Created controller file: ${controllerFile}`);
                }
                
                // Create service file
                const serviceFile = path.join(servicesDir, `${contentTypeName}.js`);
                if (!fs.existsSync(serviceFile)) {
                  const serviceContent = `'use strict';

/**
 * ${contentTypeName} service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('${contentType.uid}');
`;
                  fs.writeFileSync(serviceFile, serviceContent, 'utf8');
                  strapi.log.info(`[webbyblog] EARLY: ✓ Created service file: ${serviceFile}`);
                }
                
                // Create route file
                const routeFile = path.join(routesDir, `${contentTypeName}.js`);
                if (!fs.existsSync(routeFile)) {
                  const routeContent = `'use strict';

/**
 * ${contentTypeName} router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('${contentType.uid}');
`;
                  fs.writeFileSync(routeFile, routeContent, 'utf8');
                  strapi.log.info(`[webbyblog] EARLY: ✓ Created route file: ${routeFile}`);
                }
              }
            }
          }
        }
        
        // Filter out plugin content types and components from request body to prevent Strapi from processing them
        if (hasPluginContentTypes) {
          const filteredContentTypes = contentTypes.filter(ct => !ct.uid || !ct.uid.startsWith('plugin::'));
          if (data.contentTypes) {
            data.contentTypes = filteredContentTypes;
          } else {
            body.contentTypes = filteredContentTypes;
          }
          strapi.log.info(`[webbyblog] EARLY: Filtered out ${contentTypes.length - filteredContentTypes.length} plugin content types from request`);
        }
        
        // Filter out processed components from request body to prevent Strapi from processing them again
        // This prevents the "path argument must be of type string" error
        let filteredComponents = components;
        let componentsFiltered = false;
        
        if (hasPluginComponents || hasSharedComponents) {
          filteredComponents = components.filter(comp => {
            if (!comp.uid) return true;
            // Filter out plugin and shared components (already processed by us)
            // Keep only API components for Strapi to process
            return comp.uid.startsWith('api::');
          });
          
          if (data.components) {
            data.components = filteredComponents;
          } else {
            body.components = filteredComponents;
          }
          ctx.request.body = body;
          componentsFiltered = true;
          const filteredCount = components.length - filteredComponents.length;
          if (filteredCount > 0) {
            strapi.log.info(`[webbyblog] EARLY: Filtered out ${filteredCount} processed components from request (plugin: ${hasPluginComponents}, shared: ${hasSharedComponents})`);
          }
        }
        
        if (hasPluginContentTypes && !componentsFiltered) {
          ctx.request.body = body;
        }
        
        // If we successfully created/updated schema files, return success early
        // This prevents Strapi from processing the request again and causing path errors
        const hasContentTypes = (ctx.state.schemaFileCreated || ctx.state.schemaDeleted) && (hasApiContentTypes || hasPluginContentTypes);
        const hasComponents = (ctx.state.componentsCreated === true || ctx.state.componentsDeleted === true) && (hasApiComponents || hasPluginComponents || hasSharedComponents);
        
        if (hasContentTypes || hasComponents) {
          strapi.log.info(`[webbyblog] EARLY: ✓ Schema file(s) created successfully`);
          if (hasContentTypes) {
            strapi.log.info(`[webbyblog] EARLY: ✓ Content type schema(s) written`);
          }
          if (hasComponents) {
            strapi.log.info(`[webbyblog] EARLY: ✓ Component schema(s) written`);
          }
          strapi.log.info(`[webbyblog] EARLY: ✓ File watcher will detect change and trigger auto-restart`);
          strapi.log.info(`[webbyblog] EARLY: ✓ After restart, collections and components will be automatically registered with all fields`);
          
          // Return success response immediately
          ctx.status = 200;
          ctx.set('Content-Type', 'application/json');
          ctx.body = {
            data: {
              contentTypes: contentTypes
                .filter(ct => ct.uid && (ct.uid.startsWith('api::') || ct.uid.startsWith('plugin::')))
                .map(ct => {
                  if (ct.uid.startsWith('api::')) {
                    const uidParts = ct.uid.split('::');
                    const apiAndType = uidParts.length === 2 ? uidParts[1].split('.') : [];
                    return {
                      uid: ct.uid,
                      apiID: ct.uid,
                      schema: {
                        kind: ct.kind || 'collectionType',
                        collectionName: ct.collectionName || (ct.kind === 'singleType' ? apiAndType[1] : `${apiAndType[1]}s`),
                        info: {
                          singularName: ct.singularName || apiAndType[1],
                          pluralName: ct.pluralName || (ct.kind === 'singleType' ? apiAndType[1] : `${apiAndType[1]}s`),
                          displayName: ct.displayName || ct.modelName || apiAndType[1],
                          description: ct.description || '',
                        },
                        options: {
                          draftAndPublish: ct.draftAndPublish !== undefined ? ct.draftAndPublish : false,
                        },
                      }
                    };
                  } else if (ct.uid.startsWith('plugin::')) {
                    const uidParts = ct.uid.split('::');
                    const pluginAndType = uidParts.length === 2 ? uidParts[1].split('.') : [];
                    return {
                      uid: ct.uid,
                      apiID: ct.uid,
                      schema: {
                        kind: ct.kind || 'collectionType',
                        collectionName: ct.collectionName || `${pluginAndType[1]}s`,
                        info: {
                          singularName: ct.singularName || pluginAndType[1],
                          pluralName: ct.pluralName || `${pluginAndType[1]}s`,
                          displayName: ct.displayName || ct.modelName || pluginAndType[1],
                          description: ct.description || '',
                        },
                        options: {
                          draftAndPublish: ct.draftAndPublish !== undefined ? ct.draftAndPublish : false,
                        },
                      }
                    };
                  }
                  return null;
                })
                .filter(Boolean),
              components: (components || [])
                .filter(comp => comp.uid && (comp.uid.startsWith('api::') || comp.uid.startsWith('plugin::') || (!comp.uid.startsWith('api::') && !comp.uid.startsWith('plugin::'))))
                .map(comp => {
                  // Handle shared components
                  if (comp.uid && !comp.uid.startsWith('api::') && !comp.uid.startsWith('plugin::')) {
                    const uidParts = comp.uid.split('.');
                    const category = uidParts[0] || 'shared';
                    const componentName = uidParts.slice(1).join('.') || comp.uid;
                    return {
                      uid: comp.uid,
                      category: category,
                      apiID: comp.uid,
                      schema: {
                        collectionName: comp.collectionName || ('components_' + comp.uid.replace(/\./g, '_')),
                        info: {
                          displayName: comp.info?.displayName || comp.displayName || comp.modelName || componentName || 'New Component',
                          description: comp.info?.description || comp.description || '',
                          icon: comp.info?.icon || 'component',
                        },
                      }
                    };
                  }
                  if (comp.uid.startsWith('plugin::')) {
                    const uidParts = comp.uid.split('::');
                    const pluginAndComponent = uidParts.length === 2 ? uidParts[1].split('.') : [];
                    
                    // CRITICAL: Get component from registry to ensure we have latest metadata
                    const registeredComponent = strapi.get('components').get(comp.uid);
                    
                    // Use component's category property if available, otherwise extract from UID
                    const componentCategory = registeredComponent?.category || 
                                             comp.category || 
                                             registeredComponent?.info?.category || 
                                             comp.info?.category || 
                                             pluginAndComponent[0] || 
                                             'webby-blog';
                    
                    // Ensure displayName is always present - check multiple sources
                    // Priority: registered component > comp object > fallback
                    const componentDisplayName = registeredComponent?.info?.displayName || 
                                                registeredComponent?.displayName ||
                                                comp.info?.displayName || 
                                                comp.displayName || 
                                                comp.modelName || 
                                                pluginAndComponent[1]?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ||
                                                'New Component';
                    
                    // Ensure icon is always present
                    const componentIcon = registeredComponent?.info?.icon || 
                                         comp.info?.icon || 
                                         'component';
                    
                    const response = {
                      uid: comp.uid,
                      category: componentCategory,
                      apiID: comp.uid,
                      schema: {
                        collectionName: registeredComponent?.collectionName || comp.collectionName || ('components_' + comp.uid.replace(/::/g, '_').replace(/\./g, '_')),
                        info: {
                          displayName: componentDisplayName,
                          description: registeredComponent?.info?.description || comp.info?.description || comp.description || '',
                          icon: componentIcon,
                        },
                      }
                    };
                    
                    // Log for debugging
                    if (comp.uid.startsWith('webby-blog.')) {
                      strapi.log.info(`[webbyblog] Component in update-schema response: ${comp.uid} -> "${componentDisplayName}"`);
                    }
                    
                    return response;
                  } else if (comp.uid.startsWith('api::')) {
                    const uidParts = comp.uid.split('::');
                    const apiAndComponent = uidParts.length === 2 ? uidParts[1].split('.') : [];
                    return {
                      uid: comp.uid,
                      category: apiAndComponent[0] || '',
                      apiID: comp.uid,
                      schema: {
                        collectionName: comp.collectionName || ('components_' + comp.uid.replace(/::/g, '_').replace(/\./g, '_')),
                        info: {
                          displayName: comp.info?.displayName || comp.displayName || comp.modelName || apiAndComponent[1] || 'New Component',
                          description: comp.info?.description || comp.description || '',
                          icon: comp.info?.icon || 'component',
                        },
                      }
                    };
                  }
                  return null;
                })
                .filter(Boolean)
            }
          };
          
          strapi.log.info(`[webbyblog] EARLY: ✓ Success response sent - request handled`);
          strapi.log.info(`[webbyblog] EARLY: ✓ Returning early to prevent Strapi from processing request again`);
          return; // Don't call next() - we've handled the request
        }
        
      } catch (error) {
        strapi.log.error('[webbyblog] EARLY: Error in content-type-builder fix:', error.message);
        strapi.log.error('[webbyblog] EARLY: Stack:', error.stack);
        // Continue to let Strapi handle the error
      }
    }
    
    return next();
  });

  // CRITICAL: Middleware to intercept content-type-builder components endpoint
  // This ensures our programmatically created components are returned with proper metadata
  // The frontend uses this endpoint to get component metadata for displaying blocks
  strapi.server.use(async (ctx, next) => {
    // Intercept content-type-builder components list endpoint
    if (ctx.path && ctx.path.includes('/content-type-builder/components') && ctx.method === 'GET') {
      await next();
      
      // Enhance response to ensure all plugin components have proper metadata
      if (ctx.status === 200 && ctx.body) {
        try {
          // Handle both array and object responses
          let components = Array.isArray(ctx.body) ? ctx.body : (ctx.body.data || []);
          
          if (Array.isArray(components)) {
            // First, filter out any invalid components (undefined or missing required properties)
            components = components.filter(comp => {
              if (!comp || !comp.uid) {
                strapi.log.warn('[webbyblog] Filtering out invalid component (missing uid)');
                return false;
              }
              // For webby-blog components, ensure they exist in registry
              if (comp.uid.startsWith('webby-blog.')) {
                const registeredComponent = strapi.get('components').get(comp.uid);
                if (!registeredComponent || !registeredComponent.attributes) {
                  strapi.log.warn(`[webbyblog] Filtering out invalid component ${comp.uid} (not properly registered)`);
                  return false;
                }
              }
              return true;
            });
            
            const enhancedComponents = components.map(comp => {
              // Only process our plugin components
              if (comp.uid && comp.uid.startsWith('webby-blog.')) {
                let registeredComponent = strapi.get('components').get(comp.uid);
                
                // If component not found, try to re-register it
                if (!registeredComponent) {
                  strapi.log.warn(`[webbyblog] Component ${comp.uid} not found in registry during API call, attempting to register...`);
                  
                  const componentName = comp.uid.replace('webby-blog.', '');
                  let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
                  
                  if (fs.existsSync(componentPath)) {
                    try {
                      const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
                      const globalId = `ComponentPluginWebbyblog${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
                      
                      const componentData = {
                        ...componentSchema,
                        uid: comp.uid,
                        modelType: 'component',
                        type: 'component', // CRITICAL: Ensure type property exists
                        modelName: componentName,
                        globalId: globalId,
                        category: componentSchema.info?.category || 'webby-blog',
                        info: {
                          displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                          icon: componentSchema.info?.icon || 'component',
                          description: componentSchema.info?.description || '',
                        },
                        collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, '_')}`,
                        options: componentSchema.options || {},
                        attributes: componentSchema.attributes || {},
                      };
                      
                      try {
                        strapi.get('components').set(comp.uid, componentData);
                        registeredComponent = strapi.get('components').get(comp.uid);
                        strapi.log.info(`[webbyblog] Re-registered component ${comp.uid} during API call`);
                      } catch (error) {
                        if (error.message && error.message.includes('already been registered')) {
                          registeredComponent = strapi.get('components').get(comp.uid);
                          // Ensure type property exists
                          if (registeredComponent && !registeredComponent.type) {
                            registeredComponent.type = 'component';
                            strapi.get('components').set(comp.uid, registeredComponent);
                          }
                        }
                      }
                    } catch (error) {
                      strapi.log.error(`[webbyblog] Error re-registering component ${comp.uid}: ${error.message}`);
                    }
                  }
                }
                
                if (registeredComponent) {
                  // CRITICAL: Ensure component has type property
                  if (!registeredComponent.type) {
                    registeredComponent.type = 'component';
                    try {
                      strapi.get('components').set(comp.uid, registeredComponent);
                    } catch (error) {
                      // Ignore if already registered
                    }
                  }
                  
                  // Ensure component has proper metadata - check multiple sources
                  const displayName = registeredComponent.info?.displayName || 
                                    registeredComponent.displayName || 
                                    comp.schema?.info?.displayName ||
                                    comp.uid.split('.').pop().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  const icon = registeredComponent.info?.icon || 
                              registeredComponent.icon ||
                              comp.schema?.info?.icon || 
                              'component';
                  const category = registeredComponent.category || 
                                  registeredComponent.info?.category || 
                                  comp.category ||
                                  'webby-blog';
                  const description = registeredComponent.info?.description || 
                                    comp.schema?.info?.description || 
                                    '';
                  
                  // Update component response with correct metadata
                  // Ensure schema structure exists
                  if (!comp.schema) comp.schema = {};
                  if (!comp.schema.info) comp.schema.info = {};
                  
                  // Force update metadata - this is critical for Content Manager display
                  comp.schema.info.displayName = displayName;
                  comp.schema.info.icon = icon;
                  comp.schema.info.description = description;
                  comp.category = category;
                  
                  // Also ensure top-level properties are set (some Strapi versions use these)
                  comp.displayName = displayName;
                  comp.icon = icon;
                  
                  // Ensure info object exists at top level too
                  if (!comp.info) comp.info = {};
                  comp.info.displayName = displayName;
                  comp.info.icon = icon;
                  comp.info.description = description;
                  
                  strapi.log.info(`[webbyblog] Enhanced component API response: ${comp.uid} -> "${displayName}" (icon: ${icon}, category: ${category})`);
                } else {
                  strapi.log.error(`[webbyblog] ⚠️  Component ${comp.uid} still not found after re-registration attempt!`);
                }
              }
              return comp;
            });
            
            // Update response body
            if (Array.isArray(ctx.body)) {
              ctx.body = enhancedComponents;
            } else if (ctx.body.data) {
              ctx.body.data = enhancedComponents;
            }
          }
        } catch (error) {
          strapi.log.error('[webbyblog] Error enhancing component list:', error.message);
          strapi.log.error('[webbyblog] Error stack:', error.stack);
        }
      }
    } else {
      return next();
    }
  });

  // CRITICAL: Middleware to ensure content type configuration is properly loaded
  // This intercepts the content-manager configuration endpoint that loads schema
  strapi.server.use(async (ctx, next) => {
    // Intercept content-manager configuration endpoint for blog-post and blog-category
    const isBlogPostEndpoint = ctx.path && ctx.path.includes('/content-manager/collection-types/plugin::webbyblog.blog-post') && ctx.method === 'GET' && !ctx.path.includes('/entries');
    const isBlogCategoryEndpoint = ctx.path && ctx.path.includes('/content-manager/collection-types/plugin::webbyblog.blog-category') && ctx.method === 'GET' && !ctx.path.includes('/entries');
    
    if (isBlogPostEndpoint || isBlogCategoryEndpoint) {
      await next();
      
      // After Strapi processes the request, ensure all components in schema are valid
      if (ctx.status === 200 && ctx.body && ctx.body.data) {
        try {
          const contentType = ctx.body.data;
          
          // Ensure schema has proper structure
          if (contentType && contentType.contentType && contentType.contentType.schema) {
            const schema = contentType.contentType.schema;
            
            // Process dynamiczone attributes
            if (schema.attributes) {
              for (const [attrName, attr] of Object.entries(schema.attributes)) {
                if (attr && attr.type === 'dynamiczone' && Array.isArray(attr.components)) {
                  const validComponents = [];
                  
                  for (const componentUid of attr.components) {
                    if (componentUid.startsWith('webby-blog.')) {
                      const component = strapi.get('components').get(componentUid);
                      
                      if (component && component.attributes && typeof component.attributes === 'object') {
                        validComponents.push(componentUid);
                      } else {
                        strapi.log.warn(`[webbyblog] Component ${componentUid} not properly registered, removing from schema`);
                      }
                    } else {
                      validComponents.push(componentUid);
                    }
                  }
                  
                  attr.components = validComponents;
                }
              }
            }
          }
        } catch (error) {
          strapi.log.error('[webbyblog] Error processing content manager schema:', error.message);
        }
      }
    } else {
      return next();
    }
  });

  // CRITICAL: Middleware to intercept content-manager configuration endpoint
  // This is called when opening/creating/updating entries to get the content type schema
  strapi.server.use(async (ctx, next) => {
    // Intercept content-manager configuration endpoint for blog-post and blog-category (without /entries)
    const isBlogPostConfig = ctx.path && ctx.path.includes('/content-manager/collection-types/plugin::webbyblog.blog-post') && 
        ctx.method === 'GET' && !ctx.path.includes('/entries') && !ctx.path.includes('?');
    const isBlogCategoryConfig = ctx.path && ctx.path.includes('/content-manager/collection-types/plugin::webbyblog.blog-category') && 
        ctx.method === 'GET' && !ctx.path.includes('/entries') && !ctx.path.includes('?');
    
    if (isBlogPostConfig || isBlogCategoryConfig) {
      await next();
      
      // After Strapi processes, ensure schema is properly structured
      if (ctx.status === 200 && ctx.body && ctx.body.data) {
        try {
          const response = ctx.body.data;
          
          // The response structure might be different - check multiple possible structures
          let schema = null;
          if (response.contentType && response.contentType.schema) {
            schema = response.contentType.schema;
          } else if (response.schema) {
            schema = response.schema;
          }
          
          if (schema && schema.attributes) {
            // Process dynamiczone attributes
            for (const [attrName, attr] of Object.entries(schema.attributes)) {
              if (attr && attr.type === 'dynamiczone' && Array.isArray(attr.components)) {
                const validComponents = [];
                
                for (const componentUid of attr.components) {
                  if (typeof componentUid === 'string' && componentUid.startsWith('webby-blog.')) {
                    let component = strapi.get('components').get(componentUid);
                    
                    // If component not found, try to register it
                    if (!component) {
                      const componentName = componentUid.replace('webby-blog.', '');
                      let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
                      
                      if (fs.existsSync(componentPath)) {
                        try {
                          const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
                          const globalId = `ComponentWebbyBlog${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
                          
                          const componentData = {
                            ...componentSchema,
                            uid: componentUid,
                            modelType: 'component',
                            type: 'component',
                            modelName: componentName,
                            globalId: globalId,
                            category: componentSchema.info?.category || 'webby-blog',
                            info: {
                              displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                              icon: componentSchema.info?.icon || 'component',
                              description: componentSchema.info?.description || '',
                            },
                            collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, '_')}`,
                            options: componentSchema.options || {},
                            attributes: componentSchema.attributes || {},
                          };
                          
                          try {
                            strapi.get('components').set(componentUid, componentData);
                            component = strapi.get('components').get(componentUid);
                          } catch (error) {
                            if (error.message && error.message.includes('already been registered')) {
                              component = strapi.get('components').get(componentUid);
                            }
                          }
                        } catch (error) {
                          strapi.log.error(`[webbyblog] Error registering component ${componentUid}: ${error.message}`);
                        }
                      }
                    }
                    
                    // Ensure component has type property
                    if (component && !component.type) {
                      component.type = 'component';
                    }
                    
                    if (component && component.attributes && typeof component.attributes === 'object') {
                      validComponents.push(componentUid);
                    } else {
                      strapi.log.warn(`[webbyblog] Component ${componentUid} not properly registered, removing from schema`);
                    }
                  } else if (componentUid) {
                    validComponents.push(componentUid);
                  }
                }
                
                attr.components = validComponents;
                strapi.log.info(`[webbyblog] Validated dynamiczone components: ${validComponents.length} valid components`);
              }
            }
          }
        } catch (error) {
          strapi.log.error('[webbyblog] Error processing content-manager config:', error.message);
          strapi.log.error('[webbyblog] Error stack:', error.stack);
        }
      }
    } else {
      return next();
    }
  });

  // CRITICAL: Middleware to enhance Content Manager responses with component metadata
  // This fixes "null" and "empty" display issues for programmatically created components
  // The frontend needs component metadata to display block names and icons
  strapi.server.use(async (ctx, next) => {
    // Process Content Manager GET requests (all collection types)
    if (ctx.path && ctx.path.includes('/content-manager/collection-types/') && ctx.method === 'GET') {
      await next();
      
      // Enhance response after Strapi processes it
      if (ctx.status === 200 && ctx.body && ctx.body.data) {
        try {
          const enhanceBlocks = (entity) => {
            if (!entity || typeof entity !== 'object') return;
            
            // Process blocks array (dynamic zone)
            if (entity.blocks && Array.isArray(entity.blocks)) {
              entity.blocks = entity.blocks.map(block => {
                if (block && block.__component) {
                  let componentUid = block.__component;
                  
                  // CRITICAL: Transform old component UIDs to new format
                  // Handle migration from plugin::webbyblog.* to webby-blog.*
                  if (componentUid.startsWith('plugin::webbyblog.')) {
                    const oldComponentName = componentUid.replace('plugin::webbyblog.', '');
                    componentUid = `webby-blog.${oldComponentName}`;
                    block.__component = componentUid; // Update block with new UID
                    strapi.log.info(`[webbyblog] Migrated block component UID: plugin::webbyblog.${oldComponentName} -> ${componentUid}`);
                  }
                  
                  // Get component from registry - try multiple times if needed
                  let component = strapi.get('components').get(componentUid);
                  
                  // If component not found, try to get it from content-type-builder
                  if (!component && componentUid.startsWith('webby-blog.')) {
                    strapi.log.warn(`[webbyblog] Component ${componentUid} not found in registry for block enhancement`);
                    
                    // Try to re-register component
                    const componentName = componentUid.replace('webby-blog.', '');
                    let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
                    
                    if (fs.existsSync(componentPath)) {
                      try {
                        const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
                        const globalId = `ComponentPluginWebbyblog${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
                        
                        const componentData = {
                          ...componentSchema,
                          uid: componentUid,
                          modelType: 'component',
                          modelName: componentName,
                          globalId: globalId,
                          category: componentSchema.info?.category || 'webby-blog',
                          info: {
                            displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                            icon: componentSchema.info?.icon || 'component',
                            description: componentSchema.info?.description || '',
                          },
                          collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, '_')}`,
                          options: componentSchema.options || {},
                          attributes: componentSchema.attributes || {},
                        };
                        
                        strapi.get('components').set(componentUid, componentData);
                        component = strapi.get('components').get(componentUid);
                        strapi.log.info(`[webbyblog] Re-registered component ${componentUid} during block enhancement`);
                      } catch (error) {
                        strapi.log.error(`[webbyblog] Error re-registering component ${componentUid}: ${error.message}`);
                      }
                    }
                  }
                  
                  if (component) {
                    /**
                     * IMPORTANT:
                     * Do NOT attach extra keys to `block` (like __componentMetadata, componentDisplayName, type, etc).
                     * Strapi Admin traverses the entry payload using the component schema attributes. If `block` contains
                     * keys not present in the component schema, the admin traversal crashes with:
                     *   "Cannot read properties of undefined (reading 'type')"
                     *
                     * Component display names/icons should come from the component schema returned by the relevant
                     * endpoints (e.g. content-type-builder components list), not from mutating entry data.
                     */
                  } else {
                    // If the component schema is missing, we still avoid mutating the entry payload.
                  }
                }
                return block;
              });
            }
            
            // Recursively process nested objects
            for (const key in entity) {
              if (entity[key] && typeof entity[key] === 'object') {
                if (Array.isArray(entity[key])) {
                  entity[key].forEach(item => enhanceBlocks(item));
                } else {
                  enhanceBlocks(entity[key]);
                }
              }
            }
          };
          
          // Process single entity or array
          if (Array.isArray(ctx.body.data)) {
            ctx.body.data.forEach(enhanceBlocks);
          } else {
            enhanceBlocks(ctx.body.data);
          }
        } catch (error) {
          strapi.log.error('[webbyblog] Error enhancing blocks metadata:', error.message);
          strapi.log.error('[webbyblog] Error stack:', error.stack);
        }
      }
    } else {
      return next();
    }
  });

  // CRITICAL: Middleware to ensure content type schemas have all components properly resolved
  // This fixes the "Cannot read properties of undefined (reading 'type')" error
  strapi.server.use(async (ctx, next) => {
    // Intercept content-type-builder and content-manager content-types endpoints for blog-post and blog-category
    const isBlogPostOrCategory = ctx.path && (
      ctx.path.includes('plugin::webbyblog.blog-post') || 
      ctx.path.includes('plugin::webbyblog.blog-category')
    );
    
    if (isBlogPostOrCategory && (
      ctx.path.includes('/content-type-builder/content-types/') || 
      ctx.path.includes('/content-manager/content-types/')
    ) && ctx.method === 'GET') {
      await next();
      
      if (ctx.status === 200 && ctx.body && ctx.body.data) {
        try {
          const contentType = ctx.body.data;
          
          // Process dynamiczone attributes to ensure all components are registered and have proper structure
          if (contentType.schema && contentType.schema.attributes) {
            for (const [attrName, attr] of Object.entries(contentType.schema.attributes)) {
              if (attr.type === 'dynamiczone' && Array.isArray(attr.components)) {
                // Ensure all components in dynamiczone are registered and have proper structure
                const validComponents = [];
                for (const componentUid of attr.components) {
                  if (componentUid.startsWith('webby-blog.')) {
                    let component = strapi.get('components').get(componentUid);
                    
                    if (!component) {
                      strapi.log.warn(`[webbyblog] Component ${componentUid} not found when loading content type schema, attempting to register...`);
                      
                      const componentName = componentUid.replace('webby-blog.', '');
                      let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
                      
                      if (fs.existsSync(componentPath)) {
                        try {
                          const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
                          const globalId = `ComponentWebbyBlog${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
                          
                          const componentData = {
                            ...componentSchema,
                            uid: componentUid,
                            modelType: 'component',
                            modelName: componentName,
                            globalId: globalId,
                            category: componentSchema.info?.category || 'webby-blog',
                            info: {
                              displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                              icon: componentSchema.info?.icon || 'component',
                              description: componentSchema.info?.description || '',
                            },
                            collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, '_')}`,
                            options: componentSchema.options || {},
                            attributes: componentSchema.attributes || {},
                          };
                          
                          try {
                            strapi.get('components').set(componentUid, componentData);
                            component = strapi.get('components').get(componentUid);
                            strapi.log.info(`[webbyblog] Registered component ${componentUid} during content type schema load`);
                          } catch (error) {
                            if (error.message && error.message.includes('already been registered')) {
                              component = strapi.get('components').get(componentUid);
                            }
                          }
                        } catch (error) {
                          strapi.log.error(`[webbyblog] Error registering component ${componentUid}: ${error.message}`);
                        }
                      }
                    }
                    
                    // Only add component if it exists and has proper structure with type property
                    if (component) {
                      // Ensure component has all required properties for frontend
                      if (!component.attributes || typeof component.attributes !== 'object') {
                        strapi.log.warn(`[webbyblog] Component ${componentUid} missing attributes, attempting to fix...`);
                        // Try to get attributes from schema file
                        const componentName = componentUid.replace('webby-blog.', '');
                        let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
                        
                        if (fs.existsSync(componentPath)) {
                          try {
                            const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
                            component.attributes = componentSchema.attributes || {};
                            component.info = component.info || componentSchema.info || {};
                            component.collectionName = component.collectionName || componentSchema.collectionName;
                            strapi.get('components').set(componentUid, component);
                          } catch (error) {
                            strapi.log.error(`[webbyblog] Error fixing component ${componentUid}: ${error.message}`);
                          }
                        }
                      }
                      
                      // Ensure component has type property (required by frontend)
                      if (!component.type) {
                        component.type = 'component';
                      }
                      
                      // Only add if component now has proper structure
                      if (component.attributes && typeof component.attributes === 'object') {
                        validComponents.push(componentUid);
                      } else {
                        strapi.log.warn(`[webbyblog] Component ${componentUid} still missing proper structure, removing from dynamiczone`);
                      }
                    } else {
                      strapi.log.warn(`[webbyblog] Component ${componentUid} not found, removing from dynamiczone`);
                    }
                  } else {
                    // Keep non-webby-blog components as-is
                    validComponents.push(componentUid);
                  }
                }
                
                // Update the components array with only valid components
                attr.components = validComponents;
              }
            }
          }
        } catch (error) {
          strapi.log.error('[webbyblog] Error processing content type schema:', error.message);
        }
      }
    } else {
      return next();
    }
  });

  // CRITICAL: Middleware to migrate old component UIDs when saving blog posts
  // This ensures blocks with old plugin::webbyblog.* UIDs are migrated to webby-blog.* format
  strapi.server.use(async (ctx, next) => {
    // Process Content Manager POST/PUT requests for blog posts
    if (ctx.path && ctx.path.includes('/content-manager/collection-types/plugin::webbyblog.blog-post') && (ctx.method === 'POST' || ctx.method === 'PUT')) {
      if (ctx.request.body && ctx.request.body.blocks && Array.isArray(ctx.request.body.blocks)) {
        try {
          // Migrate old component UIDs to new format
          ctx.request.body.blocks = ctx.request.body.blocks.map(block => {
            if (block && block.__component && block.__component.startsWith('plugin::webbyblog.')) {
              const oldComponentName = block.__component.replace('plugin::webbyblog.', '');
              block.__component = `webby-blog.${oldComponentName}`;
              strapi.log.info(`[webbyblog] Migrated block component UID on save: plugin::webbyblog.${oldComponentName} -> webby-blog.${oldComponentName}`);
            }
            return block;
          });
        } catch (error) {
          strapi.log.error('[webbyblog] Error migrating component UIDs on save:', error.message);
        }
      }
    }
    return next();
  });

  // CRITICAL: Hook into Strapi's component service to ensure components are always available
  // This ensures components are properly registered even if register phase didn't complete
  const originalGet = strapi.get('components').get.bind(strapi.get('components'));
  strapi.get('components').get = function(uid) {
    const component = originalGet(uid);
    
    // If component not found and it's one of our plugin components, try to register it
    if (!component && uid && uid.startsWith('webby-blog.')) {
      strapi.log.warn(`[webbyblog] Component ${uid} not found in registry, attempting to register...`);
      
      const componentName = uid.replace('webby-blog.', '');
      let componentPath = path.join(__dirname, 'components', 'webby-blog', `${componentName}.json`);
      
      if (fs.existsSync(componentPath)) {
        try {
          const componentSchema = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
          const globalId = `ComponentPluginWebbyblog${componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
          
          const componentData = {
            ...componentSchema,
            uid: uid,
            modelType: 'component',
            type: 'component', // CRITICAL: Ensure type property exists for frontend
            modelName: componentName,
            globalId: globalId,
            category: componentSchema.info?.category || 'webby-blog',
            info: {
              displayName: componentSchema.info?.displayName || componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              icon: componentSchema.info?.icon || 'component',
              description: componentSchema.info?.description || '',
            },
            collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, '_')}`,
            options: componentSchema.options || {},
            attributes: componentSchema.attributes || {},
          };
          
          try {
            strapi.get('components').set(uid, componentData);
            strapi.log.info(`[webbyblog] ✓ Registered component ${uid} on-demand: "${componentData.info.displayName}"`);
            return strapi.get('components').get(uid);
          } catch (error) {
            if (error.message && error.message.includes('already been registered')) {
              return strapi.get('components').get(uid);
            }
            throw error;
          }
        } catch (error) {
          strapi.log.error(`[webbyblog] Error registering component ${uid} on-demand: ${error.message}`);
        }
      }
    }
    
    // CRITICAL: Ensure component has type property if it exists
    if (component && !component.type) {
      component.type = 'component';
    }
    
    return component;
  };

  strapi.log.info('[webbyblog] Plugin bootstrapped successfully');
  strapi.log.info('[webbyblog] Component service hook installed - components will be registered on-demand if missing');
  strapi.log.info('[webbyblog] ========================================');
};
