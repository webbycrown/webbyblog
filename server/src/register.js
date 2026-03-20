'use strict';

const path = require('path');
const fs = require('fs');

module.exports = async ({ strapi }) => {
  strapi.log.info('[webbyblog] ========================================');
  strapi.log.info('[webbyblog] Registering plugin...');

  // Register plugin components (moved to register phase for Content Manager compatibility)
  const components = [
    { name: 'text-block', file: 'text-block.json' },
    { name: 'image-block', file: 'image-block.json' },
    { name: 'image-content-block', file: 'image-content-block.json' },
    { name: 'quote-block', file: 'quote-block.json' },
    { name: 'code-block', file: 'code-block.json' },
    { name: 'video-block', file: 'video-block.json' },
    { name: 'gallery-block', file: 'gallery-block.json' },
    { name: 'cta-block', file: 'cta-block.json' },
    { name: 'heading-block', file: 'heading-block.json' },
    { name: 'divider-block', file: 'divider-block.json' },
    { name: 'faq-block', file: 'faq-block.json' },
    { name: 'faq-item', file: 'faq-item.json' },
    { name: 'images-slider-block', file: 'images-slider-block.json' },
  ];

  for (const component of components) {
    try {
      // Resolve component schema path for both:
      // - dev/source plugin: server/src/components/...
      // - dist-only installs: dist/server/components/...
      const candidates = [
        // Common case for both dev + dist (because dist build lives in dist/server)
        path.join(__dirname, 'components', 'webby-blog', component.file),
        // Some Strapi/plugin loaders may execute with a different __dirname; be flexible
        path.join(__dirname, '..', 'components', 'webby-blog', component.file),
        // Legacy source fallback (only if source is actually shipped)
        path.join(__dirname, '..', '..', 'server', 'src', 'components', 'webby-blog', component.file),
      ];

      const componentPath = candidates.find((p) => fs.existsSync(p));
      
      // Verify the file exists before requiring
      if (!componentPath) {
        strapi.log.warn(
          `[webbyblog] Component file not found for ${component.name} (searched: ${candidates.join(' | ')}), skipping registration`
        );
        continue; // Skip this component instead of throwing error
      }
      
      const componentSchema = require(componentPath);
      // Use webby-blog.* format to match manually created components (like webby-blog.hello)
      // This ensures consistent URL structure: /component-categories/webby-blog/webby-blog.component-name
      const componentUid = `webby-blog.${component.name}`;

      // Check if component already exists
      const existingComponent = strapi.get('components').get(componentUid);
      
      // If component already exists and has proper metadata, skip registration
      // This prevents "Component already registered" errors for components created via content-type-builder
      if (existingComponent && existingComponent.info && existingComponent.info.displayName) {
        strapi.log.info(`[webbyblog] Component ${componentUid} already registered, skipping (displayName: "${existingComponent.info.displayName}")`);
        continue; // Skip to next component
      }
      
      // Use WebbyBlog prefix for globalId to maintain uniqueness
      const globalId = `ComponentWebbyBlog${component.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
      
      // Ensure info object is properly structured for Content Manager
      // Critical: info object must be preserved exactly as in schema for admin panel
      // Match the exact structure of components created via Strapi admin (like "Hello")
      const componentCategory = componentSchema.info?.category || 'webby-blog';
      
      // Build component info object - ensure all required fields are present
      const componentInfo = {
        displayName: componentSchema.info?.displayName || component.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        icon: componentSchema.info?.icon || 'component',
        description: componentSchema.info?.description || '',
        // Don't add category to info object - it should only be at top level
      };
      
      // Build component data - ensure info is set correctly
      // This structure MUST match how Strapi stores components created via admin panel
      const componentData = {
        // Start with schema to preserve all original properties
        ...componentSchema,
        // Override with our structured data
        uid: componentUid,
        modelType: 'component',
        modelName: component.name,
        globalId: globalId,
        category: componentCategory, // Category at top level (not in info)
        // Info object must be exactly as Strapi expects
        info: componentInfo,
        // Ensure collectionName is present
        collectionName: componentSchema.collectionName || `components_webby-blog_${component.name.replace(/-/g, '_')}`,
        // Ensure options is an object
        options: componentSchema.options || {},
        // Ensure attributes is present
        attributes: componentSchema.attributes || {},
      };
      
      // CRITICAL: Register component in Strapi's component registry
      // This must match exactly how Strapi stores components created via admin panel
      // Build final component data with all required properties
      const finalComponentData = {
        // Start with schema to preserve all original properties
        ...componentSchema,
        // Override with our structured data
        uid: componentUid,
        modelType: 'component',
        modelName: component.name,
        globalId: globalId,
        category: componentCategory, // Category at top level (not in info)
        // Info object must be exactly as Strapi expects - CRITICAL for Content Manager
        info: {
          displayName: componentInfo.displayName,
          icon: componentInfo.icon,
          description: componentInfo.description,
        },
        // Ensure collectionName is present
        collectionName: componentSchema.collectionName || `components_webby-blog_${component.name.replace(/-/g, '_')}`,
        // Ensure options is an object
        options: componentSchema.options || {},
        // Ensure attributes is present
        attributes: componentSchema.attributes || {},
      };
      
      // Register component only if it doesn't already exist
      try {
        strapi.get('components').set(componentUid, finalComponentData);
      } catch (error) {
        // If component already registered, log and continue
        if (error.message && error.message.includes('already been registered')) {
          strapi.log.info(`[webbyblog] Component ${componentUid} already registered by Strapi, skipping`);
          continue;
        }
        throw error; // Re-throw if it's a different error
      }
      
      // Force reload component from registry to ensure it's properly stored
      // This ensures Strapi's internal component cache is updated
      let registeredComponent = strapi.get('components').get(componentUid);
      
      // CRITICAL: Verify component was registered correctly
      // If displayName is missing, it means registration failed
      if (!registeredComponent?.info?.displayName) {
        strapi.log.error(`[webbyblog] ⚠️  Component ${componentUid} missing displayName after registration!`);
        strapi.log.error(`[webbyblog]   - Attempting to re-register with explicit structure...`);
        
        // Re-register with explicit structure - don't spread componentSchema first
        const forcedComponentData = {
          uid: componentUid,
          modelType: 'component',
          modelName: component.name,
          globalId: globalId,
          category: componentCategory,
          info: {
            displayName: componentInfo.displayName,
            icon: componentInfo.icon,
            description: componentInfo.description,
          },
          collectionName: componentSchema.collectionName || `components_webby-blog_${component.name.replace(/-/g, '_')}`,
          options: componentSchema.options || {},
          attributes: componentSchema.attributes || {},
        };
        
        strapi.get('components').set(componentUid, forcedComponentData);
        registeredComponent = strapi.get('components').get(componentUid);
        
        // Final check
        if (!registeredComponent?.info?.displayName) {
          strapi.log.error(`[webbyblog] ⚠️  CRITICAL: Component ${componentUid} STILL missing displayName after force update!`);
          strapi.log.error(`[webbyblog]   - Registered component keys: ${Object.keys(registeredComponent || {}).join(', ')}`);
          strapi.log.error(`[webbyblog]   - Has info: ${!!registeredComponent?.info}`);
          strapi.log.error(`[webbyblog]   - Info keys: ${registeredComponent?.info ? Object.keys(registeredComponent.info).join(', ') : 'N/A'}`);
        } else {
          strapi.log.info(`[webbyblog] ✓ Successfully fixed component ${componentUid}: "${registeredComponent.info.displayName}"`);
        }
      }
      
      // Verify component was registered correctly with all required fields
      const hasDisplayName = registeredComponent?.info?.displayName || registeredComponent?.displayName;
      const hasIcon = registeredComponent?.info?.icon;
      const hasCategory = registeredComponent?.category || registeredComponent?.info?.category;
      
      strapi.log.info(`[webbyblog] Component ${existingComponent ? 'updated' : 'registered'}: ${componentUid}`);
      strapi.log.info(`[webbyblog]   - Display Name: "${hasDisplayName || 'MISSING!'}"`);
      strapi.log.info(`[webbyblog]   - Icon: "${hasIcon || 'MISSING!'}"`);
      strapi.log.info(`[webbyblog]   - Category: "${hasCategory || 'MISSING!'}"`);
      strapi.log.info(`[webbyblog]   - Full info object: ${JSON.stringify(registeredComponent?.info || {})}`);
      
      if (!hasDisplayName) {
        strapi.log.error(`[webbyblog] ⚠️  CRITICAL: Component ${componentUid} STILL missing displayName after registration!`);
        strapi.log.error(`[webbyblog]   - Component data: ${JSON.stringify({
          hasInfo: !!registeredComponent?.info,
          infoKeys: registeredComponent?.info ? Object.keys(registeredComponent.info) : [],
          topLevelDisplayName: registeredComponent?.displayName,
          componentDataKeys: Object.keys(componentData),
          componentDataInfo: componentData.info,
        }, null, 2)}`);
      }
    } catch (error) {
      const errorMsg = error?.message || error?.toString() || String(error);
      strapi.log.error(`[webbyblog] Failed to register component ${component.name}: ${errorMsg}`);
      if (error.stack) {
        strapi.log.error(`[webbyblog] Error stack: ${error.stack}`);
      }
    }
  }

  // Verify routes are loaded
  try {
    const routes = require('./routes');
    // strapi.log.info('[webbyblog] Routes structure:', JSON.stringify({
    //   hasAdmin: !!routes.admin,
    //   hasContentApi: !!routes['content-api'],
    //   adminRoutes: routes.admin?.routes?.length || 0,
    //   contentApiRoutes: routes['content-api']?.routes?.length || 0,
    // }, null, 2));
    // Intentionally no verbose routes-structure log here (keep logs clean).
  } catch (error) {
    strapi.log.error('[webbyblog] Error loading routes:', error.message);
    strapi.log.error('[webbyblog] Error stack:', error.stack);
  }


  strapi.log.info('[webbyblog] Plugin registered successfully');
  strapi.log.info('[webbyblog] ========================================');
};
