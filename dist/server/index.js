"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// server/src/routes/index.js
var require_routes = __commonJS({
  "server/src/routes/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      admin: {
        routes: []
      },
      "content-api": {
        type: "content-api",
        routes: [
          // Plugin Settings (used by the admin UI)
          {
            method: "GET",
            path: "/settings",
            handler: "controller.getSettings",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "PUT",
            path: "/settings",
            handler: "controller.updateSettings",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "GET",
            path: "/health",
            handler: "controller.health",
            config: {
              auth: false,
              policies: []
            }
          },
          // Blog Posts - All CRUD actions
          {
            method: "GET",
            path: "/blog-posts",
            handler: "blogPost.find",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "GET",
            path: "/blog-posts/:id",
            handler: "blogPost.findOne",
            config: {
              auth: false,
              policies: []
            }
          },
          // Blog Posts - Single by slug (clean route)
          {
            method: "GET",
            path: "/blog-post/:slug",
            handler: "blogPost.getPostBySlug",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "POST",
            path: "/blog-posts",
            handler: "blogPost.create",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "PUT",
            path: "/blog-posts/:id",
            handler: "blogPost.update",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "DELETE",
            path: "/blog-posts/:id",
            handler: "blogPost.delete",
            config: {
              auth: false,
              policies: []
            }
          },
          // Blog Categories - All CRUD actions
          {
            method: "GET",
            path: "/blog-categories",
            handler: "blogCategory.find",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "GET",
            path: "/blog-categories/:id",
            handler: "blogCategory.findOne",
            config: {
              auth: false,
              policies: []
            }
          },
          // Blog Categories - Single by slug (clean route)
          {
            method: "GET",
            path: "/blog-category/:slug",
            handler: "blogCategory.getCategoryBySlug",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "POST",
            path: "/blog-categories",
            handler: "blogCategory.create",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "PUT",
            path: "/blog-categories/:id",
            handler: "blogCategory.update",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "DELETE",
            path: "/blog-categories/:id",
            handler: "blogCategory.delete",
            config: {
              auth: false,
              policies: []
            }
          },
          // Blog Tags - All CRUD actions
          {
            method: "GET",
            path: "/blog-tags",
            handler: "blogTag.find",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "GET",
            path: "/blog-tags/:id",
            handler: "blogTag.findOne",
            config: {
              auth: false,
              policies: []
            }
          },
          // Blog Tags - Single by slug (clean route)
          {
            method: "GET",
            path: "/blog-tag/:slug",
            handler: "blogTag.getTagBySlug",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "POST",
            path: "/blog-tags",
            handler: "blogTag.create",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "PUT",
            path: "/blog-tags/:id",
            handler: "blogTag.update",
            config: {
              auth: false,
              policies: []
            }
          },
          {
            method: "DELETE",
            path: "/blog-tags/:id",
            handler: "blogTag.delete",
            config: {
              auth: false,
              policies: []
            }
          }
        ]
      }
    };
  }
});

// server/src/register.js
var require_register = __commonJS({
  "server/src/register.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var fs = require("fs");
    module2.exports = async ({ strapi }) => {
      strapi.log.info("[webbyblog] ========================================");
      strapi.log.info("[webbyblog] Registering plugin...");
      const components = [
        { name: "text-block", file: "text-block.json" },
        { name: "image-block", file: "image-block.json" },
        { name: "image-content-block", file: "image-content-block.json" },
        { name: "quote-block", file: "quote-block.json" },
        { name: "code-block", file: "code-block.json" },
        { name: "video-block", file: "video-block.json" },
        { name: "gallery-block", file: "gallery-block.json" },
        { name: "cta-block", file: "cta-block.json" },
        { name: "heading-block", file: "heading-block.json" },
        { name: "divider-block", file: "divider-block.json" },
        { name: "faq-block", file: "faq-block.json" },
        { name: "faq-item", file: "faq-item.json" },
        { name: "images-slider-block", file: "images-slider-block.json" }
      ];
      for (const component of components) {
        try {
          const candidates = [
            // Common case for both dev + dist (because dist build lives in dist/server)
            path.join(__dirname, "components", "webby-blog", component.file),
            // Some Strapi/plugin loaders may execute with a different __dirname; be flexible
            path.join(__dirname, "..", "components", "webby-blog", component.file),
            // Legacy source fallback (only if source is actually shipped)
            path.join(__dirname, "..", "..", "server", "src", "components", "webby-blog", component.file)
          ];
          const componentPath = candidates.find((p) => fs.existsSync(p));
          if (!componentPath) {
            strapi.log.warn(
              `[webbyblog] Component file not found for ${component.name} (searched: ${candidates.join(" | ")}), skipping registration`
            );
            continue;
          }
          const componentSchema = require(componentPath);
          const componentUid = `webby-blog.${component.name}`;
          const existingComponent = strapi.get("components").get(componentUid);
          if (existingComponent && existingComponent.info && existingComponent.info.displayName) {
            strapi.log.info(`[webbyblog] Component ${componentUid} already registered, skipping (displayName: "${existingComponent.info.displayName}")`);
            continue;
          }
          const globalId = `ComponentWebbyBlog${component.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
          const componentCategory = componentSchema.info?.category || "webby-blog";
          const componentInfo = {
            displayName: componentSchema.info?.displayName || component.name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            icon: componentSchema.info?.icon || "component",
            description: componentSchema.info?.description || ""
            // Don't add category to info object - it should only be at top level
          };
          const componentData = {
            // Start with schema to preserve all original properties
            ...componentSchema,
            // Override with our structured data
            uid: componentUid,
            modelType: "component",
            modelName: component.name,
            globalId,
            category: componentCategory,
            // Category at top level (not in info)
            // Info object must be exactly as Strapi expects
            info: componentInfo,
            // Ensure collectionName is present
            collectionName: componentSchema.collectionName || `components_webby-blog_${component.name.replace(/-/g, "_")}`,
            // Ensure options is an object
            options: componentSchema.options || {},
            // Ensure attributes is present
            attributes: componentSchema.attributes || {}
          };
          const finalComponentData = {
            // Start with schema to preserve all original properties
            ...componentSchema,
            // Override with our structured data
            uid: componentUid,
            modelType: "component",
            modelName: component.name,
            globalId,
            category: componentCategory,
            // Category at top level (not in info)
            // Info object must be exactly as Strapi expects - CRITICAL for Content Manager
            info: {
              displayName: componentInfo.displayName,
              icon: componentInfo.icon,
              description: componentInfo.description
            },
            // Ensure collectionName is present
            collectionName: componentSchema.collectionName || `components_webby-blog_${component.name.replace(/-/g, "_")}`,
            // Ensure options is an object
            options: componentSchema.options || {},
            // Ensure attributes is present
            attributes: componentSchema.attributes || {}
          };
          try {
            strapi.get("components").set(componentUid, finalComponentData);
          } catch (error) {
            if (error.message && error.message.includes("already been registered")) {
              strapi.log.info(`[webbyblog] Component ${componentUid} already registered by Strapi, skipping`);
              continue;
            }
            throw error;
          }
          let registeredComponent = strapi.get("components").get(componentUid);
          if (!registeredComponent?.info?.displayName) {
            strapi.log.error(`[webbyblog] \u26A0\uFE0F  Component ${componentUid} missing displayName after registration!`);
            strapi.log.error(`[webbyblog]   - Attempting to re-register with explicit structure...`);
            const forcedComponentData = {
              uid: componentUid,
              modelType: "component",
              modelName: component.name,
              globalId,
              category: componentCategory,
              info: {
                displayName: componentInfo.displayName,
                icon: componentInfo.icon,
                description: componentInfo.description
              },
              collectionName: componentSchema.collectionName || `components_webby-blog_${component.name.replace(/-/g, "_")}`,
              options: componentSchema.options || {},
              attributes: componentSchema.attributes || {}
            };
            strapi.get("components").set(componentUid, forcedComponentData);
            registeredComponent = strapi.get("components").get(componentUid);
            if (!registeredComponent?.info?.displayName) {
              strapi.log.error(`[webbyblog] \u26A0\uFE0F  CRITICAL: Component ${componentUid} STILL missing displayName after force update!`);
              strapi.log.error(`[webbyblog]   - Registered component keys: ${Object.keys(registeredComponent || {}).join(", ")}`);
              strapi.log.error(`[webbyblog]   - Has info: ${!!registeredComponent?.info}`);
              strapi.log.error(`[webbyblog]   - Info keys: ${registeredComponent?.info ? Object.keys(registeredComponent.info).join(", ") : "N/A"}`);
            } else {
              strapi.log.info(`[webbyblog] \u2713 Successfully fixed component ${componentUid}: "${registeredComponent.info.displayName}"`);
            }
          }
          const hasDisplayName = registeredComponent?.info?.displayName || registeredComponent?.displayName;
          const hasIcon = registeredComponent?.info?.icon;
          const hasCategory = registeredComponent?.category || registeredComponent?.info?.category;
          strapi.log.info(`[webbyblog] Component ${existingComponent ? "updated" : "registered"}: ${componentUid}`);
          strapi.log.info(`[webbyblog]   - Display Name: "${hasDisplayName || "MISSING!"}"`);
          strapi.log.info(`[webbyblog]   - Icon: "${hasIcon || "MISSING!"}"`);
          strapi.log.info(`[webbyblog]   - Category: "${hasCategory || "MISSING!"}"`);
          strapi.log.info(`[webbyblog]   - Full info object: ${JSON.stringify(registeredComponent?.info || {})}`);
          if (!hasDisplayName) {
            strapi.log.error(`[webbyblog] \u26A0\uFE0F  CRITICAL: Component ${componentUid} STILL missing displayName after registration!`);
            strapi.log.error(`[webbyblog]   - Component data: ${JSON.stringify({
              hasInfo: !!registeredComponent?.info,
              infoKeys: registeredComponent?.info ? Object.keys(registeredComponent.info) : [],
              topLevelDisplayName: registeredComponent?.displayName,
              componentDataKeys: Object.keys(componentData),
              componentDataInfo: componentData.info
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
      try {
        const routes2 = require_routes();
      } catch (error) {
        strapi.log.error("[webbyblog] Error loading routes:", error.message);
        strapi.log.error("[webbyblog] Error stack:", error.stack);
      }
      strapi.log.info("[webbyblog] Plugin registered successfully");
      strapi.log.info("[webbyblog] ========================================");
    };
  }
});

// server/src/bootstrap.js
var require_bootstrap = __commonJS({
  "server/src/bootstrap.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    module2.exports = async ({ strapi }) => {
      strapi.log.info("[webbyblog] ========================================");
      strapi.log.info("[webbyblog] Bootstrapping plugin...");
      try {
        const mappings = [
          { from: "/api/blog-posts", to: "/api/webbyblog/blog-posts" },
          { from: "/api/blog-tags", to: "/api/webbyblog/blog-tags" },
          { from: "/api/blog-categories", to: "/api/webbyblog/blog-categories" },
          // Slug endpoints (rewrite by prefix; do NOT use express-style `:slug` placeholders here)
          { from: "/api/blog-post", to: "/api/webbyblog/blog-post" },
          { from: "/api/blog-tag", to: "/api/webbyblog/blog-tag" },
          { from: "/api/blog-category", to: "/api/webbyblog/blog-category" }
        ];
        const shouldRewrite = (path2, from) => path2 === from || path2.startsWith(`${from}/`);
        strapi.server.use(async (ctx, next) => {
          const originalUrl = ctx.url;
          const [path2, queryString] = originalUrl.split("?");
          for (const { from, to } of mappings) {
            if (shouldRewrite(path2, from)) {
              const newPath = `${to}${path2.slice(from.length)}`;
              ctx.url = queryString ? `${newPath}?${queryString}` : newPath;
              break;
            }
          }
          await next();
        });
        strapi.log.info("[webbyblog] API alias routes enabled: /api/blog-posts|blog-tags|blog-categories|blog-post/:slug|blog-tag/:slug|blog-category/:slug");
      } catch (error) {
        strapi.log.warn("[webbyblog] Could not enable API alias routes:", error.message);
      }
      try {
        if (strapi.contentTypes && typeof strapi.contentTypes.get === "function") {
          const originalGetContentType = strapi.contentTypes.get.bind(strapi.contentTypes);
          strapi.contentTypes.get = function(uid) {
            const contentType = originalGetContentType(uid);
            if (contentType && uid === "plugin::webbyblog.blog-post" && contentType.attributes) {
              for (const [attrName, attr] of Object.entries(contentType.attributes)) {
                if (attr && attr.type === "dynamiczone" && Array.isArray(attr.components)) {
                  const validComponents = [];
                  for (const componentUid of attr.components) {
                    if (typeof componentUid === "string" && componentUid.startsWith("webby-blog.")) {
                      const component = strapi.get("components").get(componentUid);
                      if (component && component.attributes && typeof component.attributes === "object") {
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
          strapi.log.info("[webbyblog] Content type service hook installed");
        } else {
          strapi.log.warn("[webbyblog] contentTypes not available yet, hook will be installed later");
        }
      } catch (error) {
        strapi.log.error("[webbyblog] Error installing content type hook:", error.message);
      }
      try {
        const componentUids = [
          "webby-blog.text-block",
          "webby-blog.image-block",
          "webby-blog.image-content-block",
          "webby-blog.quote-block",
          "webby-blog.code-block",
          "webby-blog.video-block",
          "webby-blog.gallery-block",
          "webby-blog.cta-block",
          "webby-blog.heading-block",
          "webby-blog.divider-block",
          "webby-blog.faq-block",
          "webby-blog.faq-item",
          "webby-blog.images-slider-block"
        ];
        strapi.log.info("[webbyblog] Verifying and re-registering components in bootstrap phase...");
        for (const uid of componentUids) {
          const component = strapi.get("components").get(uid);
          const componentName = uid.replace("webby-blog.", "");
          if (component) {
            const displayName = component.info?.displayName;
            if (displayName) {
              strapi.log.info(`[webbyblog] \u2713 ${uid}: "${displayName}"`);
              let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
              if (fs.existsSync(componentPath)) {
                try {
                  delete require.cache[require.resolve(componentPath)];
                  const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                  const updatedComponent = {
                    ...component,
                    ...componentSchema,
                    uid,
                    category: componentSchema.info?.category || component.category || "webby-blog",
                    info: {
                      displayName: componentSchema.info?.displayName || component.info?.displayName || displayName,
                      icon: componentSchema.info?.icon || component.info?.icon || "component",
                      description: componentSchema.info?.description || component.info?.description || ""
                    }
                  };
                  try {
                    strapi.get("components").set(uid, updatedComponent);
                    strapi.log.info(`[webbyblog] \u2713 Re-registered ${uid} with proper metadata`);
                  } catch (error) {
                    if (error.message && error.message.includes("already been registered")) {
                      strapi.log.info(`[webbyblog] Component ${uid} already registered, skipping re-registration`);
                    } else {
                      throw error;
                    }
                  }
                } catch (error) {
                  if (!error.message || !error.message.includes("already been registered")) {
                    strapi.log.error(`[webbyblog] Error re-registering ${uid}: ${error.message}`);
                  }
                }
              }
            } else {
              strapi.log.error(`[webbyblog] \u2717 ${uid}: MISSING displayName!`);
              try {
                const candidates = [
                  path.join(__dirname, "components", "webby-blog", `${componentName}.json`),
                  path.join(__dirname, "..", "components", "webby-blog", `${componentName}.json`),
                  path.join(__dirname, "..", "..", "server", "src", "components", "webby-blog", `${componentName}.json`)
                ];
                const componentPath = candidates.find((p) => fs.existsSync(p));
                if (componentPath) {
                  delete require.cache[require.resolve(componentPath)];
                  const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                  const updatedComponent = {
                    ...component,
                    ...componentSchema,
                    uid,
                    category: componentSchema.info?.category || "webby-blog",
                    info: {
                      displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                      icon: componentSchema.info?.icon || component.info?.icon || "component",
                      description: componentSchema.info?.description || component.info?.description || ""
                    }
                  };
                  strapi.get("components").set(uid, updatedComponent);
                  strapi.log.info(`[webbyblog] \u2713 Fixed missing displayName for ${uid}: "${updatedComponent.info.displayName}"`);
                }
              } catch (fixError) {
                strapi.log.error(`[webbyblog] Could not fix missing displayName for ${uid}: ${fixError.message}`);
              }
            }
          } else {
            strapi.log.error(`[webbyblog] \u2717 ${uid}: Component not found in registry! Attempting to register...`);
            try {
              const candidates = [
                path.join(__dirname, "components", "webby-blog", `${componentName}.json`),
                path.join(__dirname, "..", "components", "webby-blog", `${componentName}.json`),
                path.join(__dirname, "..", "..", "server", "src", "components", "webby-blog", `${componentName}.json`)
              ];
              const componentPath = candidates.find((p) => fs.existsSync(p));
              if (componentPath) {
                const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                const globalId = `ComponentPluginWebbyblog${componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
                const componentData = {
                  ...componentSchema,
                  uid,
                  modelType: "component",
                  modelName: componentName,
                  globalId,
                  category: componentSchema.info?.category || "webby-blog",
                  info: {
                    displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                    icon: componentSchema.info?.icon || "component",
                    description: componentSchema.info?.description || ""
                  },
                  collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, "_")}`,
                  options: componentSchema.options || {},
                  attributes: componentSchema.attributes || {}
                };
                strapi.get("components").set(uid, componentData);
                strapi.log.info(`[webbyblog] \u2713 Registered missing component ${uid}: "${componentData.info.displayName}"`);
              }
            } catch (registerError) {
              strapi.log.error(`[webbyblog] Could not register missing component ${uid}: ${registerError.message}`);
            }
          }
        }
      } catch (error) {
        strapi.log.error("[webbyblog] Error verifying components:", error.message);
      }
      try {
        const routes2 = require_routes();
        strapi.log.info("[webbyblog] Routes structure verified");
        strapi.log.info("[webbyblog] Content-API routes count: " + (routes2["content-api"]?.routes?.length || 0));
        strapi.log.info("[webbyblog] Admin routes count: " + (routes2.admin?.routes?.length || 0));
      } catch (error) {
        strapi.log.error("[webbyblog] Error in bootstrap:", error.message);
      }
      strapi.server.use(async (ctx, next) => {
        if (ctx.path === "/content-type-builder/update-schema" && ctx.method === "POST") {
          try {
            let body = ctx.request.body;
            if (!body || typeof body === "object" && Object.keys(body).length === 0) {
              try {
                const contentType = ctx.request.header["content-type"] || "";
                if (contentType.includes("application/json") && ctx.req && typeof ctx.req[Symbol.asyncIterator] === "function") {
                  const chunks = [];
                  for await (const chunk of ctx.req) {
                    chunks.push(chunk);
                  }
                  const rawBody = Buffer.concat(chunks).toString("utf8");
                  if (rawBody && rawBody.trim()) {
                    body = JSON.parse(rawBody);
                    ctx.request.body = body;
                    const { Readable } = require("stream");
                    ctx.req = Readable.from([Buffer.from(rawBody)]);
                    strapi.log.info("[webbyblog] EARLY: Manually parsed request body");
                  }
                }
              } catch (parseError) {
                strapi.log.warn("[webbyblog] EARLY: Could not parse body:", parseError.message);
              }
            }
            body = body || {};
            const data = body.data || body;
            const contentTypes2 = data.contentTypes || [];
            const components = data.components || [];
            strapi.log.info("[webbyblog] ===== EARLY: Processing content-type-builder update-schema request =====");
            strapi.log.info("[webbyblog] EARLY: Content types found:", contentTypes2.length);
            strapi.log.info("[webbyblog] EARLY: Components found:", components.length);
            let appDir;
            if (strapi.dirs && strapi.dirs.app && strapi.dirs.app.root) {
              appDir = strapi.dirs.app.root;
            } else if (strapi.dirs && strapi.dirs.root) {
              appDir = strapi.dirs.root;
            } else {
              appDir = path.resolve(__dirname, "../..");
            }
            if (!strapi.dirs) {
              strapi.dirs = {};
            }
            if (!strapi.dirs.app) {
              strapi.dirs.app = {};
            }
            if (!strapi.dirs.app.root) {
              strapi.dirs.app.root = appDir;
            }
            let hasApiComponents = false;
            let hasPluginComponents = false;
            let hasSharedComponents = false;
            for (const component of components) {
              if (!component.uid) continue;
              if (!component.uid.startsWith("plugin::") && !component.uid.startsWith("api::")) {
                hasSharedComponents = true;
                const uidParts = component.uid.split(".");
                if (uidParts.length >= 2) {
                  const category = uidParts[0];
                  const componentName = uidParts.slice(1).join(".");
                  const componentsDir = path.join(appDir, "src", "components", category);
                  const schemaPath = path.join(componentsDir, `${componentName}.json`);
                  strapi.log.info(`[webbyblog] EARLY: Processing shared component: ${component.uid}`);
                  if (component.action === "delete") {
                    if (fs.existsSync(schemaPath)) {
                      fs.unlinkSync(schemaPath);
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted shared component schema: ${schemaPath}`);
                      const now = /* @__PURE__ */ new Date();
                      if (fs.existsSync(componentsDir)) {
                        const files = fs.readdirSync(componentsDir, { withFileTypes: true }).filter((dirent) => dirent.isFile() && dirent.name.endsWith(".json")).map((dirent) => dirent.name);
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
                  fs.mkdirSync(componentsDir, { recursive: true });
                  let existingSchema = {};
                  if (fs.existsSync(schemaPath)) {
                    try {
                      existingSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                    } catch (e) {
                      existingSchema = {};
                    }
                  }
                  const attributes = { ...existingSchema.attributes || {} };
                  const processedAttributes = /* @__PURE__ */ new Set();
                  const attributesToDelete = [];
                  const attributesToCreateOrUpdate = [];
                  if (component.attributes && Array.isArray(component.attributes)) {
                    for (const attr of component.attributes) {
                      const action = attr.action || "update";
                      if (action === "delete" && attr.name) {
                        attributesToDelete.push(attr);
                      } else if (attr.name && attr.properties) {
                        attributesToCreateOrUpdate.push(attr);
                      }
                    }
                  }
                  for (const attr of attributesToDelete) {
                    if (attr.name && attributes[attr.name]) {
                      delete attributes[attr.name];
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted shared component attribute: ${attr.name}`);
                      processedAttributes.add(attr.name);
                    }
                  }
                  const fieldsInRequest = /* @__PURE__ */ new Set();
                  const newFieldsBeingCreated = [];
                  for (const attr of attributesToCreateOrUpdate) {
                    if (attr.name) {
                      fieldsInRequest.add(attr.name);
                      if (!attributes.hasOwnProperty(attr.name)) {
                        newFieldsBeingCreated.push({ name: attr.name, attr });
                      }
                    }
                  }
                  const existingFieldNames = Object.keys(attributes);
                  const fieldsNotInRequest = existingFieldNames.filter((name) => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                  if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                    const oldFieldName = fieldsNotInRequest[0];
                    strapi.log.info(`[webbyblog] EARLY: \u2713 Detected shared component field rename: ${oldFieldName} -> ${newFieldsBeingCreated[0].name}`);
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
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Updated existing shared component attribute: ${attr.name}`);
                    } else {
                      attributes[attr.name] = attributeDef;
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Created new shared component attribute: ${attr.name}`);
                    }
                    if (attributes[attr.name].type === "component" && attributes[attr.name].repeatable === void 0) {
                      attributes[attr.name].repeatable = false;
                    }
                    if (attr.name) {
                      processedAttributes.add(attr.name);
                    }
                  }
                  const componentSchema = {
                    collectionName: component.collectionName || existingSchema.collectionName || `components_${category}_${componentName.replace(/-/g, "_")}`,
                    info: {
                      ...component.info || existingSchema.info || {},
                      displayName: component.displayName || component.modelName || existingSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                      icon: component.info?.icon || existingSchema.info?.icon || "component",
                      description: component.info?.description || existingSchema.info?.description || ""
                    },
                    options: component.options || existingSchema.options || {},
                    attributes
                  };
                  fs.writeFileSync(schemaPath, JSON.stringify(componentSchema, null, 2), "utf8");
                  if (fs.existsSync(schemaPath)) {
                    try {
                      const verifySchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                      const fileStats = fs.statSync(schemaPath);
                      strapi.log.info(`[webbyblog] ========================================`);
                      strapi.log.info(`[webbyblog] \u2713 SHARED COMPONENT SCHEMA CREATED/UPDATED`);
                      strapi.log.info(`[webbyblog] ========================================`);
                      strapi.log.info(`[webbyblog] \u2713 File: ${schemaPath}`);
                      strapi.log.info(`[webbyblog] \u2713 File size: ${fileStats.size} bytes`);
                      strapi.log.info(`[webbyblog] \u2713 Schema is valid JSON`);
                      strapi.log.info(`[webbyblog] \u2713 Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                      fs.chmodSync(schemaPath, 420);
                      const now = /* @__PURE__ */ new Date();
                      fs.utimesSync(schemaPath, now, now);
                      strapi.log.info(`[webbyblog] \u2713 File touched - file watcher will trigger auto-restart`);
                    } catch (verifyError) {
                      strapi.log.error(`[webbyblog] \u2717 Component schema file verification failed: ${verifyError.message}`);
                    }
                  }
                  strapi.log.info(`[webbyblog] EARLY: \u2713 Created/updated shared component schema: ${schemaPath}`);
                  ctx.state.componentsCreated = true;
                }
              } else if (component.uid.startsWith("plugin::")) {
                hasPluginComponents = true;
                const uidParts = component.uid.split("::");
                if (uidParts.length === 2) {
                  const pluginAndComponent = uidParts[1].split(".");
                  if (pluginAndComponent.length >= 2) {
                    const pluginName = pluginAndComponent[0];
                    const componentName = pluginAndComponent[1];
                    const extensionsDir = path.join(appDir, "src", "extensions", pluginName, "components", componentName);
                    const schemaPath = path.join(extensionsDir, "schema.json");
                    strapi.log.info(`[webbyblog] EARLY: Processing plugin component: ${component.uid}`);
                    if (component.action === "delete") {
                      if (fs.existsSync(schemaPath)) {
                        fs.unlinkSync(schemaPath);
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted plugin component schema: ${schemaPath}`);
                      }
                      const globalComponentsPath2 = path.join(appDir, "src", "components", componentName, "schema.json");
                      if (fs.existsSync(globalComponentsPath2)) {
                        fs.unlinkSync(globalComponentsPath2);
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted global component schema: ${globalComponentsPath2}`);
                        const now = /* @__PURE__ */ new Date();
                        const globalComponentsDir2 = path.join(appDir, "src", "components");
                        if (fs.existsSync(globalComponentsDir2)) {
                          const componentDirs = fs.readdirSync(globalComponentsDir2, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
                          if (componentDirs.length > 0) {
                            const firstComponent = componentDirs[0];
                            const firstComponentPath = path.join(globalComponentsDir2, firstComponent, "schema.json");
                            if (fs.existsSync(firstComponentPath)) {
                              fs.utimesSync(firstComponentPath, now, now);
                            }
                          }
                        }
                      }
                      ctx.state.componentsDeleted = true;
                      continue;
                    }
                    fs.mkdirSync(extensionsDir, { recursive: true });
                    let existingSchema = {};
                    if (fs.existsSync(schemaPath)) {
                      try {
                        existingSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                      } catch (e) {
                        existingSchema = {};
                      }
                    }
                    const attributes = { ...existingSchema.attributes || {} };
                    const processedAttributes = /* @__PURE__ */ new Set();
                    const attributesToDelete = [];
                    const attributesToCreateOrUpdate = [];
                    if (component.attributes && Array.isArray(component.attributes)) {
                      for (const attr of component.attributes) {
                        const action = attr.action || "update";
                        if (action === "delete" && attr.name) {
                          attributesToDelete.push(attr);
                        } else if (attr.name && attr.properties) {
                          attributesToCreateOrUpdate.push(attr);
                        }
                      }
                    }
                    for (const attr of attributesToDelete) {
                      if (attr.name && attributes[attr.name]) {
                        delete attributes[attr.name];
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted plugin component attribute: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      } else if (attr.name) {
                        strapi.log.warn(`[webbyblog] EARLY: Plugin component attribute not found for deletion: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      }
                    }
                    const fieldsInRequest = /* @__PURE__ */ new Set();
                    const newFieldsBeingCreated = [];
                    const fieldsBeingUpdated = [];
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name) {
                        fieldsInRequest.add(attr.name);
                        if (!attributes.hasOwnProperty(attr.name)) {
                          newFieldsBeingCreated.push({ name: attr.name, attr, action: attr.action || "update" });
                        } else {
                          fieldsBeingUpdated.push({ name: attr.name, attr });
                        }
                      }
                    }
                    const existingFieldNames = Object.keys(attributes);
                    const fieldsNotInRequest = existingFieldNames.filter((name) => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                    if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                      const newField = newFieldsBeingCreated[0];
                      const oldFieldName = fieldsNotInRequest[0];
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Detected plugin component field rename: ${oldFieldName} -> ${newField.name}`);
                      delete attributes[oldFieldName];
                      processedAttributes.add(oldFieldName);
                    }
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name && processedAttributes.has(attr.name)) {
                        strapi.log.warn(`[webbyblog] EARLY: Skipping duplicate plugin component attribute: ${attr.name}`);
                        continue;
                      }
                      const action = attr.action || "update";
                      const attributeDef = { ...attr.properties };
                      const fieldExists = attributes.hasOwnProperty(attr.name);
                      if (fieldExists) {
                        const existingAttr = attributes[attr.name];
                        attributes[attr.name] = {
                          ...existingAttr,
                          ...attributeDef
                        };
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Updated existing plugin component attribute: ${attr.name} (action: ${action})`);
                      } else {
                        attributes[attr.name] = attributeDef;
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Created new plugin component attribute: ${attr.name} (action: ${action})`);
                      }
                      if (attributes[attr.name].type === "component") {
                        if (attributes[attr.name].component) {
                          strapi.log.info(`[webbyblog] EARLY: Processing plugin component nested component: ${attr.name} -> ${attributes[attr.name].component}`);
                        }
                        if (attributes[attr.name].repeatable === void 0) {
                          attributes[attr.name].repeatable = false;
                        }
                      }
                      if (attributes[attr.name].type === "dynamiczone") {
                        if (Array.isArray(attributes[attr.name].components)) {
                          strapi.log.info(`[webbyblog] EARLY: Processing plugin component dynamiczone: ${attr.name} with ${attributes[attr.name].components.length} components`);
                        }
                      }
                      if (attr.name) {
                        processedAttributes.add(attr.name);
                      }
                    }
                    const componentSchema = {
                      collectionName: component.collectionName || existingSchema.collectionName || `components_${pluginName}_${componentName.replace(/-/g, "_")}`,
                      info: {
                        ...component.info || existingSchema.info || {},
                        displayName: component.displayName || component.modelName || existingSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                        icon: component.info?.icon || existingSchema.info?.icon || "component",
                        description: component.info?.description || existingSchema.info?.description || ""
                      },
                      options: component.options || existingSchema.options || {},
                      attributes
                    };
                    fs.writeFileSync(schemaPath, JSON.stringify(componentSchema, null, 2), "utf8");
                    const globalComponentsDir = path.join(appDir, "src", "components", componentName);
                    const globalComponentsPath = path.join(globalComponentsDir, "schema.json");
                    fs.mkdirSync(globalComponentsDir, { recursive: true });
                    fs.writeFileSync(globalComponentsPath, JSON.stringify(componentSchema, null, 2), "utf8");
                    strapi.log.info(`[webbyblog] EARLY: \u2713 Also wrote to global components folder: ${globalComponentsPath}`);
                    if (fs.existsSync(schemaPath) && fs.existsSync(globalComponentsPath)) {
                      try {
                        const verifySchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                        const fileStats = fs.statSync(schemaPath);
                        strapi.log.info(`[webbyblog] ========================================`);
                        strapi.log.info(`[webbyblog] \u2713 PLUGIN COMPONENT SCHEMA CREATED/UPDATED`);
                        strapi.log.info(`[webbyblog] ========================================`);
                        strapi.log.info(`[webbyblog] \u2713 Extension file: ${schemaPath}`);
                        strapi.log.info(`[webbyblog] \u2713 Global components file: ${globalComponentsPath}`);
                        strapi.log.info(`[webbyblog] \u2713 File size: ${fileStats.size} bytes`);
                        strapi.log.info(`[webbyblog] \u2713 Schema is valid JSON`);
                        strapi.log.info(`[webbyblog] \u2713 Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                        fs.chmodSync(schemaPath, 420);
                        fs.chmodSync(globalComponentsPath, 420);
                        const now = /* @__PURE__ */ new Date();
                        fs.utimesSync(schemaPath, now, now);
                        fs.utimesSync(globalComponentsPath, now, now);
                        strapi.log.info(`[webbyblog] \u2713 Both files touched - file watcher will trigger auto-restart`);
                      } catch (verifyError) {
                        strapi.log.error(`[webbyblog] \u2717 Component schema file verification failed: ${verifyError.message}`);
                      }
                    } else {
                      strapi.log.error(`[webbyblog] \u2717 Component schema file was not created properly`);
                    }
                    strapi.log.info(`[webbyblog] EARLY: \u2713 Created/updated plugin component schema: ${schemaPath}`);
                    ctx.state.componentsCreated = true;
                  }
                }
              } else if (component.uid.startsWith("api::")) {
                hasApiComponents = true;
                const uidParts = component.uid.split("::");
                if (uidParts.length === 2) {
                  const apiAndComponent = uidParts[1].split(".");
                  if (apiAndComponent.length >= 2) {
                    const apiName = apiAndComponent[0];
                    const componentName = apiAndComponent[1];
                    const apiDir = path.join(appDir, "src", "api", apiName);
                    const componentsDir = path.join(apiDir, "components", componentName);
                    const schemaPath = path.join(componentsDir, "schema.json");
                    strapi.log.info(`[webbyblog] EARLY: Processing API component: ${component.uid}`);
                    if (component.action === "delete") {
                      if (fs.existsSync(schemaPath)) {
                        fs.unlinkSync(schemaPath);
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted API component schema: ${schemaPath}`);
                        const now = /* @__PURE__ */ new Date();
                        const contentTypeDir = path.join(apiDir, "content-types");
                        if (fs.existsSync(contentTypeDir)) {
                          const contentTypeDirs = fs.readdirSync(contentTypeDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
                          if (contentTypeDirs.length > 0) {
                            const firstContentType = contentTypeDirs[0];
                            const contentTypeSchemaPath = path.join(contentTypeDir, firstContentType, "schema.json");
                            if (fs.existsSync(contentTypeSchemaPath)) {
                              fs.utimesSync(contentTypeSchemaPath, now, now);
                            }
                          }
                        }
                      }
                      ctx.state.componentsDeleted = true;
                      continue;
                    }
                    fs.mkdirSync(componentsDir, { recursive: true });
                    let existingSchema = {};
                    if (fs.existsSync(schemaPath)) {
                      try {
                        existingSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                      } catch (e) {
                        existingSchema = {};
                      }
                    }
                    const attributes = { ...existingSchema.attributes || {} };
                    const processedAttributes = /* @__PURE__ */ new Set();
                    const attributesToDelete = [];
                    const attributesToCreateOrUpdate = [];
                    if (component.attributes && Array.isArray(component.attributes)) {
                      for (const attr of component.attributes) {
                        const action = attr.action || "update";
                        if (action === "delete" && attr.name) {
                          attributesToDelete.push(attr);
                        } else if (attr.name && attr.properties) {
                          attributesToCreateOrUpdate.push(attr);
                        }
                      }
                    }
                    for (const attr of attributesToDelete) {
                      if (attr.name && attributes[attr.name]) {
                        delete attributes[attr.name];
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted API component attribute: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      }
                    }
                    const fieldsInRequest = /* @__PURE__ */ new Set();
                    const newFieldsBeingCreated = [];
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name) {
                        fieldsInRequest.add(attr.name);
                        if (!attributes.hasOwnProperty(attr.name)) {
                          newFieldsBeingCreated.push({ name: attr.name, attr });
                        }
                      }
                    }
                    const existingFieldNames = Object.keys(attributes);
                    const fieldsNotInRequest = existingFieldNames.filter((name) => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                    if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                      const oldFieldName = fieldsNotInRequest[0];
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Detected API component field rename: ${oldFieldName} -> ${newFieldsBeingCreated[0].name}`);
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
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Updated existing API component attribute: ${attr.name}`);
                      } else {
                        attributes[attr.name] = attributeDef;
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Created new API component attribute: ${attr.name}`);
                      }
                      if (attributes[attr.name].type === "component" && attributes[attr.name].repeatable === void 0) {
                        attributes[attr.name].repeatable = false;
                      }
                      if (attr.name) {
                        processedAttributes.add(attr.name);
                      }
                    }
                    const componentSchema = {
                      collectionName: component.collectionName || existingSchema.collectionName || `components_${apiName}_${componentName.replace(/-/g, "_")}`,
                      info: {
                        ...component.info || existingSchema.info || {},
                        displayName: component.displayName || component.modelName || existingSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                        icon: component.info?.icon || existingSchema.info?.icon || "component",
                        description: component.info?.description || existingSchema.info?.description || ""
                      },
                      options: component.options || existingSchema.options || {},
                      attributes
                    };
                    fs.writeFileSync(schemaPath, JSON.stringify(componentSchema, null, 2), "utf8");
                    if (fs.existsSync(schemaPath)) {
                      try {
                        const verifySchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                        const fileStats = fs.statSync(schemaPath);
                        strapi.log.info(`[webbyblog] ========================================`);
                        strapi.log.info(`[webbyblog] \u2713 API COMPONENT SCHEMA CREATED/UPDATED`);
                        strapi.log.info(`[webbyblog] ========================================`);
                        strapi.log.info(`[webbyblog] \u2713 File: ${schemaPath}`);
                        strapi.log.info(`[webbyblog] \u2713 File size: ${fileStats.size} bytes`);
                        strapi.log.info(`[webbyblog] \u2713 Schema is valid JSON`);
                        strapi.log.info(`[webbyblog] \u2713 Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                        fs.chmodSync(schemaPath, 420);
                        const now = /* @__PURE__ */ new Date();
                        fs.utimesSync(schemaPath, now, now);
                        strapi.log.info(`[webbyblog] \u2713 File touched - file watcher will trigger auto-restart`);
                      } catch (verifyError) {
                        strapi.log.error(`[webbyblog] \u2717 Component schema file verification failed: ${verifyError.message}`);
                      }
                    } else {
                      strapi.log.error(`[webbyblog] \u2717 Component schema file was not created: ${schemaPath}`);
                    }
                    strapi.log.info(`[webbyblog] EARLY: \u2713 Created/updated API component schema: ${schemaPath}`);
                    ctx.state.componentsCreated = true;
                  }
                }
              }
            }
            let hasApiContentTypes = false;
            let hasPluginContentTypes = false;
            for (const contentType of contentTypes2) {
              if (contentType.uid && contentType.uid.startsWith("plugin::")) {
                hasPluginContentTypes = true;
                const uidParts = contentType.uid.split("::");
                if (uidParts.length === 2) {
                  const pluginAndType = uidParts[1].split(".");
                  if (pluginAndType.length >= 2) {
                    const pluginName = pluginAndType[0];
                    const contentTypeName = pluginAndType[1];
                    const extensionsDir = path.join(appDir, "src", "extensions", pluginName, "content-types", contentTypeName);
                    const schemaPath = path.join(extensionsDir, "schema.json");
                    strapi.log.info(`[webbyblog] EARLY: Processing plugin content type: ${contentType.uid}`);
                    if (contentType.action === "delete") {
                      if (fs.existsSync(schemaPath)) {
                        fs.unlinkSync(schemaPath);
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted plugin schema: ${schemaPath}`);
                      }
                      continue;
                    }
                    fs.mkdirSync(extensionsDir, { recursive: true });
                    let existingSchema = {};
                    if (fs.existsSync(schemaPath)) {
                      try {
                        existingSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                      } catch (e) {
                        existingSchema = {};
                      }
                    }
                    const attributes = { ...existingSchema.attributes || {} };
                    const processedAttributes = /* @__PURE__ */ new Set();
                    const attributesToDelete = [];
                    const attributesToCreateOrUpdate = [];
                    if (contentType.attributes && Array.isArray(contentType.attributes)) {
                      for (const attr of contentType.attributes) {
                        const action = attr.action || "update";
                        if (action === "delete" && attr.name) {
                          attributesToDelete.push(attr);
                        } else if (attr.name && attr.properties) {
                          attributesToCreateOrUpdate.push(attr);
                        }
                      }
                    }
                    for (const attr of attributesToDelete) {
                      if (attr.name && attributes[attr.name]) {
                        delete attributes[attr.name];
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted plugin attribute: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      } else if (attr.name) {
                        strapi.log.warn(`[webbyblog] EARLY: Plugin attribute not found for deletion: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      }
                    }
                    const fieldsInRequest = /* @__PURE__ */ new Set();
                    const newFieldsBeingCreated = [];
                    const fieldsBeingUpdated = [];
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name) {
                        fieldsInRequest.add(attr.name);
                        const action = attr.action || "update";
                        if (!attributes.hasOwnProperty(attr.name)) {
                          newFieldsBeingCreated.push({ name: attr.name, attr, action });
                        } else {
                          fieldsBeingUpdated.push({ name: attr.name, attr });
                        }
                      }
                    }
                    strapi.log.info(`[webbyblog] EARLY: Plugin fields in request: ${Array.from(fieldsInRequest).join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Plugin existing fields: ${Object.keys(attributes).join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Plugin new fields being created: ${newFieldsBeingCreated.map((f) => f.name).join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Plugin fields being updated: ${fieldsBeingUpdated.map((f) => f.name).join(", ")}`);
                    const existingFieldCount = Object.keys(attributes).length;
                    const requestFieldCount = fieldsInRequest.size;
                    const existingFieldNames = Object.keys(attributes);
                    const fieldsNotInRequest = existingFieldNames.filter((name) => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                    strapi.log.info(`[webbyblog] EARLY: Plugin fields not in request (might be renamed): ${fieldsNotInRequest.join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Plugin field count - Existing: ${existingFieldCount}, Request: ${requestFieldCount}, New: ${newFieldsBeingCreated.length}`);
                    if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                      const newField = newFieldsBeingCreated[0];
                      const oldFieldName = fieldsNotInRequest[0];
                      const newFieldDef = { ...newField.attr.properties };
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Detected plugin field rename: ${oldFieldName} -> ${newField.name}`);
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Deleting old plugin field: ${oldFieldName}`);
                      delete attributes[oldFieldName];
                      processedAttributes.add(oldFieldName);
                    }
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name && processedAttributes.has(attr.name)) {
                        strapi.log.warn(`[webbyblog] EARLY: Skipping duplicate plugin attribute in request: ${attr.name}`);
                        continue;
                      }
                      const action = attr.action || "update";
                      const attributeDef = { ...attr.properties };
                      const fieldExists = attributes.hasOwnProperty(attr.name);
                      if (fieldExists) {
                        const existingAttr = attributes[attr.name];
                        attributes[attr.name] = {
                          ...existingAttr,
                          ...attributeDef
                        };
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Updated existing plugin attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || existingAttr.type || "unknown"})`);
                      } else {
                        attributes[attr.name] = attributeDef;
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Created new plugin attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || "unknown"})`);
                      }
                      if (attributes[attr.name].type === "component") {
                        if (attributes[attr.name].component) {
                          strapi.log.info(`[webbyblog] EARLY: Processing plugin component attribute: ${attr.name} -> ${attributes[attr.name].component}`);
                        }
                        if (attributes[attr.name].repeatable === void 0) {
                          attributes[attr.name].repeatable = false;
                        }
                      }
                      if (attributes[attr.name].type === "dynamiczone") {
                        if (Array.isArray(attributes[attr.name].components)) {
                          strapi.log.info(`[webbyblog] EARLY: Processing plugin dynamiczone: ${attr.name} with ${attributes[attr.name].components.length} components`);
                        }
                      }
                      if (attributes[attr.name].type === "relation") {
                        if (attributes[attr.name].target) {
                          strapi.log.info(`[webbyblog] EARLY: Processing plugin relation: ${attr.name} -> ${attributes[attr.name].target}`);
                        }
                      }
                      if (attr.name) {
                        processedAttributes.add(attr.name);
                      }
                    }
                    const schema = {
                      kind: contentType.kind || existingSchema.kind || "collectionType",
                      collectionName: contentType.collectionName || existingSchema.collectionName || `${contentTypeName}s`,
                      info: {
                        singularName: contentType.singularName || existingSchema.info?.singularName || contentTypeName,
                        pluralName: contentType.pluralName || existingSchema.info?.pluralName || `${contentTypeName}s`,
                        displayName: contentType.displayName || contentType.modelName || existingSchema.info?.displayName || contentTypeName,
                        description: contentType.description || existingSchema.info?.description || ""
                      },
                      options: {
                        draftAndPublish: contentType.draftAndPublish !== void 0 ? contentType.draftAndPublish : existingSchema.options?.draftAndPublish !== void 0 ? existingSchema.options.draftAndPublish : false
                      },
                      pluginOptions: contentType.pluginOptions || existingSchema.pluginOptions || {
                        "content-manager": { visible: true },
                        "content-api": { visible: true }
                      },
                      attributes
                    };
                    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), "utf8");
                    strapi.log.info(`[webbyblog] EARLY: \u2713 Created/updated plugin schema: ${schemaPath}`);
                    ctx.state.schemaFileCreated = true;
                  }
                }
              } else if (contentType.uid && contentType.uid.startsWith("api::")) {
                hasApiContentTypes = true;
                const uidParts = contentType.uid.split("::");
                if (uidParts.length === 2) {
                  const apiAndType = uidParts[1].split(".");
                  if (apiAndType.length >= 2) {
                    const apiName = apiAndType[0];
                    const contentTypeName = apiAndType[1];
                    const apiDir = path.join(appDir, "src", "api", apiName);
                    const contentTypeDir = path.join(apiDir, "content-types", contentTypeName);
                    const schemaPath = path.join(contentTypeDir, "schema.json");
                    if (contentType.action === "delete") {
                      strapi.log.info(`[webbyblog] EARLY: Deleting collection: ${contentType.uid}`);
                      if (fs.existsSync(apiDir)) {
                        try {
                          const contentTypesDir = path.join(apiDir, "content-types");
                          const otherContentTypes = [];
                          if (fs.existsSync(contentTypesDir)) {
                            const allContentTypes = fs.readdirSync(contentTypesDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
                            otherContentTypes.push(...allContentTypes.filter((name) => name !== contentTypeName));
                          }
                          if (otherContentTypes.length === 0) {
                            strapi.log.info(`[webbyblog] EARLY: This is the only content type in API folder, deleting entire API folder: ${apiDir}`);
                            fs.rmSync(apiDir, { recursive: true, force: true });
                            strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted entire API folder: ${apiDir}`);
                          } else {
                            strapi.log.info(`[webbyblog] EARLY: Other content types exist, deleting only ${contentTypeName} files`);
                            if (fs.existsSync(contentTypeDir)) {
                              fs.rmSync(contentTypeDir, { recursive: true, force: true });
                              strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted content type directory: ${contentTypeDir}`);
                            }
                            const controllerFile2 = path.join(apiDir, "controllers", `${contentTypeName}.js`);
                            if (fs.existsSync(controllerFile2)) {
                              fs.unlinkSync(controllerFile2);
                              strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted controller file: ${controllerFile2}`);
                            }
                            const serviceFile2 = path.join(apiDir, "services", `${contentTypeName}.js`);
                            if (fs.existsSync(serviceFile2)) {
                              fs.unlinkSync(serviceFile2);
                              strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted service file: ${serviceFile2}`);
                            }
                            const routeFile2 = path.join(apiDir, "routes", `${contentTypeName}.js`);
                            if (fs.existsSync(routeFile2)) {
                              fs.unlinkSync(routeFile2);
                              strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted route file: ${routeFile2}`);
                            }
                          }
                        } catch (error) {
                          strapi.log.error(`[webbyblog] EARLY: \u2717 Error deleting API folder: ${error.message}`);
                          strapi.log.error(`[webbyblog] EARLY: Error stack: ${error.stack}`);
                        }
                      } else {
                        strapi.log.warn(`[webbyblog] EARLY: API folder does not exist: ${apiDir}`);
                      }
                      ctx.state.schemaFileCreated = true;
                      ctx.state.schemaDeleted = true;
                      continue;
                    }
                    fs.mkdirSync(contentTypeDir, { recursive: true });
                    let existingSchema = {};
                    if (fs.existsSync(schemaPath)) {
                      try {
                        existingSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                      } catch (e) {
                        existingSchema = {};
                      }
                    }
                    const attributes = { ...existingSchema.attributes || {} };
                    const processedAttributes = /* @__PURE__ */ new Set();
                    const attributesToDelete = [];
                    const attributesToCreateOrUpdate = [];
                    if (contentType.attributes && Array.isArray(contentType.attributes)) {
                      for (const attr of contentType.attributes) {
                        const action = attr.action || "update";
                        if (action === "delete" && attr.name) {
                          attributesToDelete.push(attr);
                        } else if (attr.name && attr.properties) {
                          attributesToCreateOrUpdate.push(attr);
                        }
                      }
                    }
                    for (const attr of attributesToDelete) {
                      if (attr.name && attributes[attr.name]) {
                        delete attributes[attr.name];
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleted attribute: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      } else if (attr.name) {
                        strapi.log.warn(`[webbyblog] EARLY: Attribute not found for deletion: ${attr.name}`);
                        processedAttributes.add(attr.name);
                      }
                    }
                    const fieldsInRequest = /* @__PURE__ */ new Set();
                    const newFieldsBeingCreated = [];
                    const fieldsBeingUpdated = [];
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name) {
                        fieldsInRequest.add(attr.name);
                        const action = attr.action || "update";
                        if (!attributes.hasOwnProperty(attr.name)) {
                          newFieldsBeingCreated.push({ name: attr.name, attr, action });
                        } else {
                          fieldsBeingUpdated.push({ name: attr.name, attr });
                        }
                      }
                    }
                    strapi.log.info(`[webbyblog] EARLY: Fields in request: ${Array.from(fieldsInRequest).join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Existing fields: ${Object.keys(attributes).join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: New fields being created: ${newFieldsBeingCreated.map((f) => f.name).join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Fields being updated: ${fieldsBeingUpdated.map((f) => f.name).join(", ")}`);
                    const existingFieldCount = Object.keys(attributes).length;
                    const requestFieldCount = fieldsInRequest.size;
                    const existingFieldNames = Object.keys(attributes);
                    const fieldsNotInRequest = existingFieldNames.filter((name) => !fieldsInRequest.has(name) && !processedAttributes.has(name));
                    strapi.log.info(`[webbyblog] EARLY: Fields not in request (might be renamed): ${fieldsNotInRequest.join(", ")}`);
                    strapi.log.info(`[webbyblog] EARLY: Field count - Existing: ${existingFieldCount}, Request: ${requestFieldCount}, New: ${newFieldsBeingCreated.length}`);
                    if (newFieldsBeingCreated.length === 1 && fieldsNotInRequest.length === 1) {
                      const newField = newFieldsBeingCreated[0];
                      const oldFieldName = fieldsNotInRequest[0];
                      const oldField = attributes[oldFieldName];
                      const newFieldDef = { ...newField.attr.properties };
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Detected field rename: ${oldFieldName} -> ${newField.name}`);
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Deleting old field: ${oldFieldName}`);
                      delete attributes[oldFieldName];
                      processedAttributes.add(oldFieldName);
                    } else if (newFieldsBeingCreated.length === 1) {
                      const newField = newFieldsBeingCreated[0];
                      const newFieldDef = { ...newField.attr.properties };
                      const candidateFieldsToRemove = [];
                      for (const updateField of fieldsBeingUpdated) {
                        const existingField = attributes[updateField.name];
                        if (existingField && existingField.type === newFieldDef.type && updateField.name !== newField.name) {
                          candidateFieldsToRemove.push(updateField.name);
                        }
                      }
                      for (const oldFieldName of fieldsNotInRequest) {
                        const oldField = attributes[oldFieldName];
                        if (oldField && oldField.type === newFieldDef.type) {
                          candidateFieldsToRemove.push(oldFieldName);
                        }
                      }
                      if (candidateFieldsToRemove.length === 1) {
                        const oldFieldName = candidateFieldsToRemove[0];
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Detected field rename (by type match): ${oldFieldName} -> ${newField.name}`);
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Deleting old field: ${oldFieldName}`);
                        delete attributes[oldFieldName];
                        processedAttributes.add(oldFieldName);
                      } else if (candidateFieldsToRemove.length > 1) {
                        strapi.log.warn(`[webbyblog] EARLY: Multiple rename candidates found, cannot auto-detect rename`);
                      } else if (candidateFieldsToRemove.length === 0 && fieldsBeingUpdated.length === 1) {
                        const updatedField = fieldsBeingUpdated[0];
                        const updatedFieldDef = attributes[updatedField.name];
                        if (updatedFieldDef && updatedFieldDef.type === newFieldDef.type && updatedField.name !== newField.name) {
                          strapi.log.info(`[webbyblog] EARLY: \u2713 Detected field rename (updated field with same type): ${updatedField.name} -> ${newField.name}`);
                          strapi.log.info(`[webbyblog] EARLY: \u2713 Deleting old field: ${updatedField.name}`);
                          delete attributes[updatedField.name];
                          processedAttributes.add(updatedField.name);
                        }
                      } else if (candidateFieldsToRemove.length === 0) {
                        const fieldsWithSameType = existingFieldNames.filter((name) => {
                          const field = attributes[name];
                          return field && field.type === newFieldDef.type && !processedAttributes.has(name);
                        });
                        if (fieldsWithSameType.length === 1) {
                          const oldFieldName = fieldsWithSameType[0];
                          strapi.log.info(`[webbyblog] EARLY: \u2713 Detected field rename (last resort - single field with same type): ${oldFieldName} -> ${newField.name}`);
                          strapi.log.info(`[webbyblog] EARLY: \u2713 Deleting old field: ${oldFieldName}`);
                          delete attributes[oldFieldName];
                          processedAttributes.add(oldFieldName);
                        }
                      }
                    }
                    for (const attr of attributesToCreateOrUpdate) {
                      if (attr.name && processedAttributes.has(attr.name)) {
                        strapi.log.warn(`[webbyblog] EARLY: Skipping duplicate attribute in request: ${attr.name}`);
                        continue;
                      }
                      const action = attr.action || "update";
                      const attributeDef = { ...attr.properties };
                      const fieldExists = attributes.hasOwnProperty(attr.name);
                      if (fieldExists) {
                        const existingAttr = attributes[attr.name];
                        attributes[attr.name] = {
                          ...existingAttr,
                          ...attributeDef
                        };
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Updated existing attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || existingAttr.type || "unknown"})`);
                      } else {
                        attributes[attr.name] = attributeDef;
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Created new attribute: ${attr.name} (action: ${action}, type: ${attributeDef.type || "unknown"})`);
                      }
                      if (attributes[attr.name].type === "component") {
                        if (attributes[attr.name].component) {
                          strapi.log.info(`[webbyblog] EARLY: Processing component attribute: ${attr.name} -> ${attributes[attr.name].component}`);
                        }
                        if (attributes[attr.name].repeatable === void 0) {
                          attributes[attr.name].repeatable = false;
                        }
                      }
                      if (attributes[attr.name].type === "dynamiczone") {
                        if (Array.isArray(attributes[attr.name].components)) {
                          strapi.log.info(`[webbyblog] EARLY: Processing dynamiczone: ${attr.name} with ${attributes[attr.name].components.length} components`);
                        }
                      }
                      if (attributes[attr.name].type === "relation") {
                        if (attributes[attr.name].target) {
                          strapi.log.info(`[webbyblog] EARLY: Processing relation: ${attr.name} -> ${attributes[attr.name].target}`);
                        }
                      }
                      if (attr.name) {
                        processedAttributes.add(attr.name);
                      }
                    }
                    const schema = {
                      kind: contentType.kind || existingSchema.kind || "collectionType",
                      collectionName: contentType.collectionName || existingSchema.collectionName || (contentType.kind === "singleType" ? contentTypeName : `${contentTypeName}s`),
                      info: {
                        singularName: contentType.singularName || existingSchema.info?.singularName || contentTypeName,
                        pluralName: contentType.pluralName || existingSchema.info?.pluralName || (contentType.kind === "singleType" ? contentTypeName : `${contentTypeName}s`),
                        displayName: contentType.displayName || contentType.modelName || existingSchema.info?.displayName || contentTypeName,
                        description: contentType.description || existingSchema.info?.description || ""
                      },
                      options: {
                        draftAndPublish: contentType.draftAndPublish !== void 0 ? contentType.draftAndPublish : existingSchema.options?.draftAndPublish !== void 0 ? existingSchema.options.draftAndPublish : false
                      },
                      pluginOptions: contentType.pluginOptions || existingSchema.pluginOptions || {
                        "content-manager": {
                          visible: true
                        },
                        "content-api": {
                          visible: true
                        }
                      },
                      attributes
                    };
                    const schemaJson = JSON.stringify(schema, null, 2);
                    fs.writeFileSync(schemaPath, schemaJson, "utf8");
                    if (fs.existsSync(schemaPath)) {
                      try {
                        const verifySchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
                        const fileStats = fs.statSync(schemaPath);
                        strapi.log.info(`[webbyblog] ========================================`);
                        strapi.log.info(`[webbyblog] \u2713 COLLECTION SCHEMA CREATED/UPDATED`);
                        strapi.log.info(`[webbyblog] ========================================`);
                        strapi.log.info(`[webbyblog] \u2713 File: ${schemaPath}`);
                        strapi.log.info(`[webbyblog] \u2713 File size: ${fileStats.size} bytes`);
                        strapi.log.info(`[webbyblog] \u2713 Schema is valid JSON`);
                        strapi.log.info(`[webbyblog] \u2713 Total attributes: ${Object.keys(verifySchema.attributes || {}).length}`);
                        fs.chmodSync(schemaPath, 420);
                        const now = /* @__PURE__ */ new Date();
                        fs.utimesSync(schemaPath, now, now);
                        ctx.state.schemaFileCreated = true;
                        ctx.state.schemaPath = schemaPath;
                        ctx.state.contentTypeUid = contentType.uid;
                      } catch (verifyError) {
                        strapi.log.error(`[webbyblog] \u2717 Schema file verification failed: ${verifyError.message}`);
                      }
                    } else {
                      strapi.log.error(`[webbyblog] \u2717 Schema file was not created: ${schemaPath}`);
                    }
                    const controllersDir = path.join(apiDir, "controllers");
                    const servicesDir = path.join(apiDir, "services");
                    const routesDir = path.join(apiDir, "routes");
                    [controllersDir, servicesDir, routesDir].forEach((dir) => {
                      if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                        strapi.log.info(`[webbyblog] EARLY: \u2713 Created directory: ${dir}`);
                      }
                    });
                    const controllerFile = path.join(controllersDir, `${contentTypeName}.js`);
                    if (!fs.existsSync(controllerFile)) {
                      const controllerContent = `'use strict';

/**
 * ${contentTypeName} controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('${contentType.uid}');
`;
                      fs.writeFileSync(controllerFile, controllerContent, "utf8");
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Created controller file: ${controllerFile}`);
                    }
                    const serviceFile = path.join(servicesDir, `${contentTypeName}.js`);
                    if (!fs.existsSync(serviceFile)) {
                      const serviceContent = `'use strict';

/**
 * ${contentTypeName} service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('${contentType.uid}');
`;
                      fs.writeFileSync(serviceFile, serviceContent, "utf8");
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Created service file: ${serviceFile}`);
                    }
                    const routeFile = path.join(routesDir, `${contentTypeName}.js`);
                    if (!fs.existsSync(routeFile)) {
                      const routeContent = `'use strict';

/**
 * ${contentTypeName} router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('${contentType.uid}');
`;
                      fs.writeFileSync(routeFile, routeContent, "utf8");
                      strapi.log.info(`[webbyblog] EARLY: \u2713 Created route file: ${routeFile}`);
                    }
                  }
                }
              }
            }
            if (hasPluginContentTypes) {
              const filteredContentTypes = contentTypes2.filter((ct) => !ct.uid || !ct.uid.startsWith("plugin::"));
              if (data.contentTypes) {
                data.contentTypes = filteredContentTypes;
              } else {
                body.contentTypes = filteredContentTypes;
              }
              strapi.log.info(`[webbyblog] EARLY: Filtered out ${contentTypes2.length - filteredContentTypes.length} plugin content types from request`);
            }
            let filteredComponents = components;
            let componentsFiltered = false;
            if (hasPluginComponents || hasSharedComponents) {
              filteredComponents = components.filter((comp) => {
                if (!comp.uid) return true;
                return comp.uid.startsWith("api::");
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
            const hasContentTypes = (ctx.state.schemaFileCreated || ctx.state.schemaDeleted) && (hasApiContentTypes || hasPluginContentTypes);
            const hasComponents = (ctx.state.componentsCreated === true || ctx.state.componentsDeleted === true) && (hasApiComponents || hasPluginComponents || hasSharedComponents);
            if (hasContentTypes || hasComponents) {
              strapi.log.info(`[webbyblog] EARLY: \u2713 Schema file(s) created successfully`);
              if (hasContentTypes) {
                strapi.log.info(`[webbyblog] EARLY: \u2713 Content type schema(s) written`);
              }
              if (hasComponents) {
                strapi.log.info(`[webbyblog] EARLY: \u2713 Component schema(s) written`);
              }
              strapi.log.info(`[webbyblog] EARLY: \u2713 File watcher will detect change and trigger auto-restart`);
              strapi.log.info(`[webbyblog] EARLY: \u2713 After restart, collections and components will be automatically registered with all fields`);
              ctx.status = 200;
              ctx.set("Content-Type", "application/json");
              ctx.body = {
                data: {
                  contentTypes: contentTypes2.filter((ct) => ct.uid && (ct.uid.startsWith("api::") || ct.uid.startsWith("plugin::"))).map((ct) => {
                    if (ct.uid.startsWith("api::")) {
                      const uidParts = ct.uid.split("::");
                      const apiAndType = uidParts.length === 2 ? uidParts[1].split(".") : [];
                      return {
                        uid: ct.uid,
                        apiID: ct.uid,
                        schema: {
                          kind: ct.kind || "collectionType",
                          collectionName: ct.collectionName || (ct.kind === "singleType" ? apiAndType[1] : `${apiAndType[1]}s`),
                          info: {
                            singularName: ct.singularName || apiAndType[1],
                            pluralName: ct.pluralName || (ct.kind === "singleType" ? apiAndType[1] : `${apiAndType[1]}s`),
                            displayName: ct.displayName || ct.modelName || apiAndType[1],
                            description: ct.description || ""
                          },
                          options: {
                            draftAndPublish: ct.draftAndPublish !== void 0 ? ct.draftAndPublish : false
                          }
                        }
                      };
                    } else if (ct.uid.startsWith("plugin::")) {
                      const uidParts = ct.uid.split("::");
                      const pluginAndType = uidParts.length === 2 ? uidParts[1].split(".") : [];
                      return {
                        uid: ct.uid,
                        apiID: ct.uid,
                        schema: {
                          kind: ct.kind || "collectionType",
                          collectionName: ct.collectionName || `${pluginAndType[1]}s`,
                          info: {
                            singularName: ct.singularName || pluginAndType[1],
                            pluralName: ct.pluralName || `${pluginAndType[1]}s`,
                            displayName: ct.displayName || ct.modelName || pluginAndType[1],
                            description: ct.description || ""
                          },
                          options: {
                            draftAndPublish: ct.draftAndPublish !== void 0 ? ct.draftAndPublish : false
                          }
                        }
                      };
                    }
                    return null;
                  }).filter(Boolean),
                  components: (components || []).filter((comp) => comp.uid && (comp.uid.startsWith("api::") || comp.uid.startsWith("plugin::") || !comp.uid.startsWith("api::") && !comp.uid.startsWith("plugin::"))).map((comp) => {
                    if (comp.uid && !comp.uid.startsWith("api::") && !comp.uid.startsWith("plugin::")) {
                      const uidParts = comp.uid.split(".");
                      const category = uidParts[0] || "shared";
                      const componentName = uidParts.slice(1).join(".") || comp.uid;
                      return {
                        uid: comp.uid,
                        category,
                        apiID: comp.uid,
                        schema: {
                          collectionName: comp.collectionName || "components_" + comp.uid.replace(/\./g, "_"),
                          info: {
                            displayName: comp.info?.displayName || comp.displayName || comp.modelName || componentName || "New Component",
                            description: comp.info?.description || comp.description || "",
                            icon: comp.info?.icon || "component"
                          }
                        }
                      };
                    }
                    if (comp.uid.startsWith("plugin::")) {
                      const uidParts = comp.uid.split("::");
                      const pluginAndComponent = uidParts.length === 2 ? uidParts[1].split(".") : [];
                      const registeredComponent = strapi.get("components").get(comp.uid);
                      const componentCategory = registeredComponent?.category || comp.category || registeredComponent?.info?.category || comp.info?.category || pluginAndComponent[0] || "webby-blog";
                      const componentDisplayName = registeredComponent?.info?.displayName || registeredComponent?.displayName || comp.info?.displayName || comp.displayName || comp.modelName || pluginAndComponent[1]?.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "New Component";
                      const componentIcon = registeredComponent?.info?.icon || comp.info?.icon || "component";
                      const response = {
                        uid: comp.uid,
                        category: componentCategory,
                        apiID: comp.uid,
                        schema: {
                          collectionName: registeredComponent?.collectionName || comp.collectionName || "components_" + comp.uid.replace(/::/g, "_").replace(/\./g, "_"),
                          info: {
                            displayName: componentDisplayName,
                            description: registeredComponent?.info?.description || comp.info?.description || comp.description || "",
                            icon: componentIcon
                          }
                        }
                      };
                      if (comp.uid.startsWith("webby-blog.")) {
                        strapi.log.info(`[webbyblog] Component in update-schema response: ${comp.uid} -> "${componentDisplayName}"`);
                      }
                      return response;
                    } else if (comp.uid.startsWith("api::")) {
                      const uidParts = comp.uid.split("::");
                      const apiAndComponent = uidParts.length === 2 ? uidParts[1].split(".") : [];
                      return {
                        uid: comp.uid,
                        category: apiAndComponent[0] || "",
                        apiID: comp.uid,
                        schema: {
                          collectionName: comp.collectionName || "components_" + comp.uid.replace(/::/g, "_").replace(/\./g, "_"),
                          info: {
                            displayName: comp.info?.displayName || comp.displayName || comp.modelName || apiAndComponent[1] || "New Component",
                            description: comp.info?.description || comp.description || "",
                            icon: comp.info?.icon || "component"
                          }
                        }
                      };
                    }
                    return null;
                  }).filter(Boolean)
                }
              };
              strapi.log.info(`[webbyblog] EARLY: \u2713 Success response sent - request handled`);
              strapi.log.info(`[webbyblog] EARLY: \u2713 Returning early to prevent Strapi from processing request again`);
              return;
            }
          } catch (error) {
            strapi.log.error("[webbyblog] EARLY: Error in content-type-builder fix:", error.message);
            strapi.log.error("[webbyblog] EARLY: Stack:", error.stack);
          }
        }
        return next();
      });
      strapi.server.use(async (ctx, next) => {
        if (ctx.path && ctx.path.includes("/content-type-builder/components") && ctx.method === "GET") {
          await next();
          if (ctx.status === 200 && ctx.body) {
            try {
              let components = Array.isArray(ctx.body) ? ctx.body : ctx.body.data || [];
              if (Array.isArray(components)) {
                components = components.filter((comp) => {
                  if (!comp || !comp.uid) {
                    strapi.log.warn("[webbyblog] Filtering out invalid component (missing uid)");
                    return false;
                  }
                  if (comp.uid.startsWith("webby-blog.")) {
                    const registeredComponent = strapi.get("components").get(comp.uid);
                    if (!registeredComponent || !registeredComponent.attributes) {
                      strapi.log.warn(`[webbyblog] Filtering out invalid component ${comp.uid} (not properly registered)`);
                      return false;
                    }
                  }
                  return true;
                });
                const enhancedComponents = components.map((comp) => {
                  if (comp.uid && comp.uid.startsWith("webby-blog.")) {
                    let registeredComponent = strapi.get("components").get(comp.uid);
                    if (!registeredComponent) {
                      strapi.log.warn(`[webbyblog] Component ${comp.uid} not found in registry during API call, attempting to register...`);
                      const componentName = comp.uid.replace("webby-blog.", "");
                      let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
                      if (fs.existsSync(componentPath)) {
                        try {
                          const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                          const globalId = `ComponentPluginWebbyblog${componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
                          const componentData = {
                            ...componentSchema,
                            uid: comp.uid,
                            modelType: "component",
                            type: "component",
                            // CRITICAL: Ensure type property exists
                            modelName: componentName,
                            globalId,
                            category: componentSchema.info?.category || "webby-blog",
                            info: {
                              displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                              icon: componentSchema.info?.icon || "component",
                              description: componentSchema.info?.description || ""
                            },
                            collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, "_")}`,
                            options: componentSchema.options || {},
                            attributes: componentSchema.attributes || {}
                          };
                          try {
                            strapi.get("components").set(comp.uid, componentData);
                            registeredComponent = strapi.get("components").get(comp.uid);
                            strapi.log.info(`[webbyblog] Re-registered component ${comp.uid} during API call`);
                          } catch (error) {
                            if (error.message && error.message.includes("already been registered")) {
                              registeredComponent = strapi.get("components").get(comp.uid);
                              if (registeredComponent && !registeredComponent.type) {
                                registeredComponent.type = "component";
                                strapi.get("components").set(comp.uid, registeredComponent);
                              }
                            }
                          }
                        } catch (error) {
                          strapi.log.error(`[webbyblog] Error re-registering component ${comp.uid}: ${error.message}`);
                        }
                      }
                    }
                    if (registeredComponent) {
                      if (!registeredComponent.type) {
                        registeredComponent.type = "component";
                        try {
                          strapi.get("components").set(comp.uid, registeredComponent);
                        } catch (error) {
                        }
                      }
                      const displayName = registeredComponent.info?.displayName || registeredComponent.displayName || comp.schema?.info?.displayName || comp.uid.split(".").pop().split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                      const icon = registeredComponent.info?.icon || registeredComponent.icon || comp.schema?.info?.icon || "component";
                      const category = registeredComponent.category || registeredComponent.info?.category || comp.category || "webby-blog";
                      const description = registeredComponent.info?.description || comp.schema?.info?.description || "";
                      if (!comp.schema) comp.schema = {};
                      if (!comp.schema.info) comp.schema.info = {};
                      comp.schema.info.displayName = displayName;
                      comp.schema.info.icon = icon;
                      comp.schema.info.description = description;
                      comp.category = category;
                      comp.displayName = displayName;
                      comp.icon = icon;
                      if (!comp.info) comp.info = {};
                      comp.info.displayName = displayName;
                      comp.info.icon = icon;
                      comp.info.description = description;
                      strapi.log.info(`[webbyblog] Enhanced component API response: ${comp.uid} -> "${displayName}" (icon: ${icon}, category: ${category})`);
                    } else {
                      strapi.log.error(`[webbyblog] \u26A0\uFE0F  Component ${comp.uid} still not found after re-registration attempt!`);
                    }
                  }
                  return comp;
                });
                if (Array.isArray(ctx.body)) {
                  ctx.body = enhancedComponents;
                } else if (ctx.body.data) {
                  ctx.body.data = enhancedComponents;
                }
              }
            } catch (error) {
              strapi.log.error("[webbyblog] Error enhancing component list:", error.message);
              strapi.log.error("[webbyblog] Error stack:", error.stack);
            }
          }
        } else {
          return next();
        }
      });
      strapi.server.use(async (ctx, next) => {
        const isBlogPostEndpoint = ctx.path && ctx.path.includes("/content-manager/collection-types/plugin::webbyblog.blog-post") && ctx.method === "GET" && !ctx.path.includes("/entries");
        const isBlogCategoryEndpoint = ctx.path && ctx.path.includes("/content-manager/collection-types/plugin::webbyblog.blog-category") && ctx.method === "GET" && !ctx.path.includes("/entries");
        if (isBlogPostEndpoint || isBlogCategoryEndpoint) {
          await next();
          if (ctx.status === 200 && ctx.body && ctx.body.data) {
            try {
              const contentType = ctx.body.data;
              if (contentType && contentType.contentType && contentType.contentType.schema) {
                const schema = contentType.contentType.schema;
                if (schema.attributes) {
                  for (const [attrName, attr] of Object.entries(schema.attributes)) {
                    if (attr && attr.type === "dynamiczone" && Array.isArray(attr.components)) {
                      const validComponents = [];
                      for (const componentUid of attr.components) {
                        if (componentUid.startsWith("webby-blog.")) {
                          const component = strapi.get("components").get(componentUid);
                          if (component && component.attributes && typeof component.attributes === "object") {
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
              strapi.log.error("[webbyblog] Error processing content manager schema:", error.message);
            }
          }
        } else {
          return next();
        }
      });
      strapi.server.use(async (ctx, next) => {
        const isBlogPostConfig = ctx.path && ctx.path.includes("/content-manager/collection-types/plugin::webbyblog.blog-post") && ctx.method === "GET" && !ctx.path.includes("/entries") && !ctx.path.includes("?");
        const isBlogCategoryConfig = ctx.path && ctx.path.includes("/content-manager/collection-types/plugin::webbyblog.blog-category") && ctx.method === "GET" && !ctx.path.includes("/entries") && !ctx.path.includes("?");
        if (isBlogPostConfig || isBlogCategoryConfig) {
          await next();
          if (ctx.status === 200 && ctx.body && ctx.body.data) {
            try {
              const response = ctx.body.data;
              let schema = null;
              if (response.contentType && response.contentType.schema) {
                schema = response.contentType.schema;
              } else if (response.schema) {
                schema = response.schema;
              }
              if (schema && schema.attributes) {
                for (const [attrName, attr] of Object.entries(schema.attributes)) {
                  if (attr && attr.type === "dynamiczone" && Array.isArray(attr.components)) {
                    const validComponents = [];
                    for (const componentUid of attr.components) {
                      if (typeof componentUid === "string" && componentUid.startsWith("webby-blog.")) {
                        let component = strapi.get("components").get(componentUid);
                        if (!component) {
                          const componentName = componentUid.replace("webby-blog.", "");
                          let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
                          if (fs.existsSync(componentPath)) {
                            try {
                              const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                              const globalId = `ComponentWebbyBlog${componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
                              const componentData = {
                                ...componentSchema,
                                uid: componentUid,
                                modelType: "component",
                                type: "component",
                                modelName: componentName,
                                globalId,
                                category: componentSchema.info?.category || "webby-blog",
                                info: {
                                  displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                                  icon: componentSchema.info?.icon || "component",
                                  description: componentSchema.info?.description || ""
                                },
                                collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, "_")}`,
                                options: componentSchema.options || {},
                                attributes: componentSchema.attributes || {}
                              };
                              try {
                                strapi.get("components").set(componentUid, componentData);
                                component = strapi.get("components").get(componentUid);
                              } catch (error) {
                                if (error.message && error.message.includes("already been registered")) {
                                  component = strapi.get("components").get(componentUid);
                                }
                              }
                            } catch (error) {
                              strapi.log.error(`[webbyblog] Error registering component ${componentUid}: ${error.message}`);
                            }
                          }
                        }
                        if (component && !component.type) {
                          component.type = "component";
                        }
                        if (component && component.attributes && typeof component.attributes === "object") {
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
              strapi.log.error("[webbyblog] Error processing content-manager config:", error.message);
              strapi.log.error("[webbyblog] Error stack:", error.stack);
            }
          }
        } else {
          return next();
        }
      });
      strapi.server.use(async (ctx, next) => {
        if (ctx.path && ctx.path.includes("/content-manager/collection-types/") && ctx.method === "GET") {
          await next();
          if (ctx.status === 200 && ctx.body && ctx.body.data) {
            try {
              const enhanceBlocks = (entity) => {
                if (!entity || typeof entity !== "object") return;
                if (entity.blocks && Array.isArray(entity.blocks)) {
                  entity.blocks = entity.blocks.map((block) => {
                    if (block && block.__component) {
                      let componentUid = block.__component;
                      if (componentUid.startsWith("plugin::webbyblog.")) {
                        const oldComponentName = componentUid.replace("plugin::webbyblog.", "");
                        componentUid = `webby-blog.${oldComponentName}`;
                        block.__component = componentUid;
                        strapi.log.info(`[webbyblog] Migrated block component UID: plugin::webbyblog.${oldComponentName} -> ${componentUid}`);
                      }
                      let component = strapi.get("components").get(componentUid);
                      if (!component && componentUid.startsWith("webby-blog.")) {
                        strapi.log.warn(`[webbyblog] Component ${componentUid} not found in registry for block enhancement`);
                        const componentName = componentUid.replace("webby-blog.", "");
                        let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
                        if (fs.existsSync(componentPath)) {
                          try {
                            const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                            const globalId = `ComponentPluginWebbyblog${componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
                            const componentData = {
                              ...componentSchema,
                              uid: componentUid,
                              modelType: "component",
                              modelName: componentName,
                              globalId,
                              category: componentSchema.info?.category || "webby-blog",
                              info: {
                                displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                                icon: componentSchema.info?.icon || "component",
                                description: componentSchema.info?.description || ""
                              },
                              collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, "_")}`,
                              options: componentSchema.options || {},
                              attributes: componentSchema.attributes || {}
                            };
                            strapi.get("components").set(componentUid, componentData);
                            component = strapi.get("components").get(componentUid);
                            strapi.log.info(`[webbyblog] Re-registered component ${componentUid} during block enhancement`);
                          } catch (error) {
                            strapi.log.error(`[webbyblog] Error re-registering component ${componentUid}: ${error.message}`);
                          }
                        }
                      }
                      if (component) {
                      } else {
                      }
                    }
                    return block;
                  });
                }
                for (const key in entity) {
                  if (entity[key] && typeof entity[key] === "object") {
                    if (Array.isArray(entity[key])) {
                      entity[key].forEach((item) => enhanceBlocks(item));
                    } else {
                      enhanceBlocks(entity[key]);
                    }
                  }
                }
              };
              if (Array.isArray(ctx.body.data)) {
                ctx.body.data.forEach(enhanceBlocks);
              } else {
                enhanceBlocks(ctx.body.data);
              }
            } catch (error) {
              strapi.log.error("[webbyblog] Error enhancing blocks metadata:", error.message);
              strapi.log.error("[webbyblog] Error stack:", error.stack);
            }
          }
        } else {
          return next();
        }
      });
      strapi.server.use(async (ctx, next) => {
        const isBlogPostOrCategory = ctx.path && (ctx.path.includes("plugin::webbyblog.blog-post") || ctx.path.includes("plugin::webbyblog.blog-category"));
        if (isBlogPostOrCategory && (ctx.path.includes("/content-type-builder/content-types/") || ctx.path.includes("/content-manager/content-types/")) && ctx.method === "GET") {
          await next();
          if (ctx.status === 200 && ctx.body && ctx.body.data) {
            try {
              const contentType = ctx.body.data;
              if (contentType.schema && contentType.schema.attributes) {
                for (const [attrName, attr] of Object.entries(contentType.schema.attributes)) {
                  if (attr.type === "dynamiczone" && Array.isArray(attr.components)) {
                    const validComponents = [];
                    for (const componentUid of attr.components) {
                      if (componentUid.startsWith("webby-blog.")) {
                        let component = strapi.get("components").get(componentUid);
                        if (!component) {
                          strapi.log.warn(`[webbyblog] Component ${componentUid} not found when loading content type schema, attempting to register...`);
                          const componentName = componentUid.replace("webby-blog.", "");
                          let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
                          if (fs.existsSync(componentPath)) {
                            try {
                              const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                              const globalId = `ComponentWebbyBlog${componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
                              const componentData = {
                                ...componentSchema,
                                uid: componentUid,
                                modelType: "component",
                                modelName: componentName,
                                globalId,
                                category: componentSchema.info?.category || "webby-blog",
                                info: {
                                  displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                                  icon: componentSchema.info?.icon || "component",
                                  description: componentSchema.info?.description || ""
                                },
                                collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, "_")}`,
                                options: componentSchema.options || {},
                                attributes: componentSchema.attributes || {}
                              };
                              try {
                                strapi.get("components").set(componentUid, componentData);
                                component = strapi.get("components").get(componentUid);
                                strapi.log.info(`[webbyblog] Registered component ${componentUid} during content type schema load`);
                              } catch (error) {
                                if (error.message && error.message.includes("already been registered")) {
                                  component = strapi.get("components").get(componentUid);
                                }
                              }
                            } catch (error) {
                              strapi.log.error(`[webbyblog] Error registering component ${componentUid}: ${error.message}`);
                            }
                          }
                        }
                        if (component) {
                          if (!component.attributes || typeof component.attributes !== "object") {
                            strapi.log.warn(`[webbyblog] Component ${componentUid} missing attributes, attempting to fix...`);
                            const componentName = componentUid.replace("webby-blog.", "");
                            let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
                            if (fs.existsSync(componentPath)) {
                              try {
                                const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
                                component.attributes = componentSchema.attributes || {};
                                component.info = component.info || componentSchema.info || {};
                                component.collectionName = component.collectionName || componentSchema.collectionName;
                                strapi.get("components").set(componentUid, component);
                              } catch (error) {
                                strapi.log.error(`[webbyblog] Error fixing component ${componentUid}: ${error.message}`);
                              }
                            }
                          }
                          if (!component.type) {
                            component.type = "component";
                          }
                          if (component.attributes && typeof component.attributes === "object") {
                            validComponents.push(componentUid);
                          } else {
                            strapi.log.warn(`[webbyblog] Component ${componentUid} still missing proper structure, removing from dynamiczone`);
                          }
                        } else {
                          strapi.log.warn(`[webbyblog] Component ${componentUid} not found, removing from dynamiczone`);
                        }
                      } else {
                        validComponents.push(componentUid);
                      }
                    }
                    attr.components = validComponents;
                  }
                }
              }
            } catch (error) {
              strapi.log.error("[webbyblog] Error processing content type schema:", error.message);
            }
          }
        } else {
          return next();
        }
      });
      strapi.server.use(async (ctx, next) => {
        if (ctx.path && ctx.path.includes("/content-manager/collection-types/plugin::webbyblog.blog-post") && (ctx.method === "POST" || ctx.method === "PUT")) {
          if (ctx.request.body && ctx.request.body.blocks && Array.isArray(ctx.request.body.blocks)) {
            try {
              ctx.request.body.blocks = ctx.request.body.blocks.map((block) => {
                if (block && block.__component && block.__component.startsWith("plugin::webbyblog.")) {
                  const oldComponentName = block.__component.replace("plugin::webbyblog.", "");
                  block.__component = `webby-blog.${oldComponentName}`;
                  strapi.log.info(`[webbyblog] Migrated block component UID on save: plugin::webbyblog.${oldComponentName} -> webby-blog.${oldComponentName}`);
                }
                return block;
              });
            } catch (error) {
              strapi.log.error("[webbyblog] Error migrating component UIDs on save:", error.message);
            }
          }
        }
        return next();
      });
      const originalGet = strapi.get("components").get.bind(strapi.get("components"));
      strapi.get("components").get = function(uid) {
        const component = originalGet(uid);
        if (!component && uid && uid.startsWith("webby-blog.")) {
          strapi.log.warn(`[webbyblog] Component ${uid} not found in registry, attempting to register...`);
          const componentName = uid.replace("webby-blog.", "");
          let componentPath = path.join(__dirname, "components", "webby-blog", `${componentName}.json`);
          if (fs.existsSync(componentPath)) {
            try {
              const componentSchema = JSON.parse(fs.readFileSync(componentPath, "utf8"));
              const globalId = `ComponentPluginWebbyblog${componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
              const componentData = {
                ...componentSchema,
                uid,
                modelType: "component",
                type: "component",
                // CRITICAL: Ensure type property exists for frontend
                modelName: componentName,
                globalId,
                category: componentSchema.info?.category || "webby-blog",
                info: {
                  displayName: componentSchema.info?.displayName || componentName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                  icon: componentSchema.info?.icon || "component",
                  description: componentSchema.info?.description || ""
                },
                collectionName: componentSchema.collectionName || `components_webby-blog_${componentName.replace(/-/g, "_")}`,
                options: componentSchema.options || {},
                attributes: componentSchema.attributes || {}
              };
              try {
                strapi.get("components").set(uid, componentData);
                strapi.log.info(`[webbyblog] \u2713 Registered component ${uid} on-demand: "${componentData.info.displayName}"`);
                return strapi.get("components").get(uid);
              } catch (error) {
                if (error.message && error.message.includes("already been registered")) {
                  return strapi.get("components").get(uid);
                }
                throw error;
              }
            } catch (error) {
              strapi.log.error(`[webbyblog] Error registering component ${uid} on-demand: ${error.message}`);
            }
          }
        }
        if (component && !component.type) {
          component.type = "component";
        }
        return component;
      };
      strapi.log.info("[webbyblog] Plugin bootstrapped successfully");
      strapi.log.info("[webbyblog] Component service hook installed - components will be registered on-demand if missing");
      strapi.log.info("[webbyblog] ========================================");
    };
  }
});

// server/src/destroy.js
var require_destroy = __commonJS({
  "server/src/destroy.js"(exports2, module2) {
    "use strict";
    module2.exports = async ({ strapi }) => {
      strapi.log.info("Destroying webbyblog plugin...");
    };
  }
});

// server/src/config/index.js
var require_config = __commonJS({
  "server/src/config/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      default: {},
      validator: () => {
      }
    };
  }
});

// server/src/controllers/controller.js
var require_controller = __commonJS({
  "server/src/controllers/controller.js"(exports2, module2) {
    "use strict";
    module2.exports = ({ strapi }) => ({
      async getSettings(ctx) {
        try {
          const settings = await strapi.plugin("webbyblog").service("service").getSettings();
          ctx.body = { data: settings || {} };
        } catch (error) {
          ctx.throw(500, error);
        }
      },
      async updateSettings(ctx) {
        try {
          const { body } = ctx.request;
          const settings = await strapi.plugin("webbyblog").service("service").updateSettings(body);
          ctx.body = { data: settings };
        } catch (error) {
          ctx.throw(500, error);
        }
      },
      async health(ctx) {
        ctx.body = {
          status: "ok",
          plugin: "webbyblog",
          version: "1.0.0",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    });
  }
});

// server/src/controllers/blogPost.js
var require_blogPost = __commonJS({
  "server/src/controllers/blogPost.js"(exports2, module2) {
    "use strict";
    module2.exports = ({ strapi }) => {
      const shallowPostPopulate = {
        category: true,
        tags: true,
        author: true,
        featured_image: true,
        blocks: { populate: "*" }
      };
      const defaultPopulate = {
        author: true,
        featured_image: true,
        blocks: { populate: "*" },
        category: {
          populate: {
            posts: { populate: shallowPostPopulate }
          }
        },
        tags: {
          populate: {
            posts: { populate: shallowPostPopulate }
          }
        }
      };
      return {
        async getPosts(ctx) {
          try {
            const { query } = ctx;
            const populate = query?.populate ?? defaultPopulate;
            const posts = await strapi.entityService.findMany("plugin::webbyblog.blog-post", {
              ...query,
              populate
            });
            ctx.body = { data: posts };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async getPost(ctx) {
          try {
            const { id } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const post = await strapi.entityService.findOne("plugin::webbyblog.blog-post", id, {
              populate
            });
            if (!post) {
              return ctx.notFound("Post not found");
            }
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async getPostBySlug(ctx) {
          try {
            const { slug } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const posts = await strapi.entityService.findMany("plugin::webbyblog.blog-post", {
              filters: { slug },
              populate
            });
            if (!posts || posts.length === 0) {
              return ctx.notFound("Post not found");
            }
            ctx.body = { data: posts[0] };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async createPost(ctx) {
          try {
            const { body } = ctx.request;
            const post = await strapi.entityService.create("plugin::webbyblog.blog-post", {
              data: body,
              populate: defaultPopulate
            });
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async updatePost(ctx) {
          try {
            const { id } = ctx.params;
            const { body } = ctx.request;
            const post = await strapi.entityService.update("plugin::webbyblog.blog-post", id, {
              data: body,
              populate: defaultPopulate
            });
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async deletePost(ctx) {
          try {
            const { id } = ctx.params;
            const post = await strapi.entityService.delete("plugin::webbyblog.blog-post", id, {
              populate: defaultPopulate
            });
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        // Standard content API methods
        async find(ctx) {
          try {
            const { query } = ctx;
            const populate = query?.populate ?? defaultPopulate;
            const posts = await strapi.entityService.findMany("plugin::webbyblog.blog-post", {
              ...query,
              populate
            });
            ctx.body = { data: posts };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async findOne(ctx) {
          try {
            const { id } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const post = await strapi.entityService.findOne("plugin::webbyblog.blog-post", id, {
              populate
            });
            if (!post) {
              return ctx.notFound("Post not found");
            }
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async create(ctx) {
          try {
            const { body } = ctx.request;
            const post = await strapi.entityService.create("plugin::webbyblog.blog-post", {
              data: body.data || body,
              populate: defaultPopulate
            });
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async update(ctx) {
          try {
            const { id } = ctx.params;
            const { body } = ctx.request;
            const post = await strapi.entityService.update("plugin::webbyblog.blog-post", id, {
              data: body.data || body,
              populate: defaultPopulate
            });
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async delete(ctx) {
          try {
            const { id } = ctx.params;
            const post = await strapi.entityService.delete("plugin::webbyblog.blog-post", id, {
              populate: defaultPopulate
            });
            ctx.body = { data: post };
          } catch (error) {
            ctx.throw(500, error);
          }
        }
      };
    };
  }
});

// server/src/controllers/blogCategory.js
var require_blogCategory = __commonJS({
  "server/src/controllers/blogCategory.js"(exports2, module2) {
    "use strict";
    module2.exports = ({ strapi }) => {
      const shallowPostPopulate = {
        category: true,
        tags: true,
        author: true,
        featured_image: true,
        blocks: { populate: "*" }
      };
      const postPopulateWithTaxonomyPosts = {
        author: true,
        featured_image: true,
        blocks: { populate: "*" },
        category: { populate: { posts: { populate: shallowPostPopulate } } },
        tags: { populate: { posts: { populate: shallowPostPopulate } } }
      };
      const defaultPopulate = {
        posts: {
          populate: {
            ...postPopulateWithTaxonomyPosts
          }
        }
      };
      return {
        async getCategories(ctx) {
          try {
            const { query } = ctx;
            const populate = query?.populate ?? defaultPopulate;
            const categories = await strapi.entityService.findMany("plugin::webbyblog.blog-category", {
              ...query,
              populate
            });
            ctx.body = { data: categories };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async getCategory(ctx) {
          try {
            const { id } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const category = await strapi.entityService.findOne("plugin::webbyblog.blog-category", id, { populate });
            if (!category) {
              return ctx.notFound("Category not found");
            }
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async getCategoryBySlug(ctx) {
          try {
            const { slug } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const categories = await strapi.entityService.findMany("plugin::webbyblog.blog-category", {
              filters: { slug },
              populate
            });
            if (!categories || categories.length === 0) {
              return ctx.notFound("Category not found");
            }
            ctx.body = { data: categories[0] };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async createCategory(ctx) {
          try {
            const { body } = ctx.request;
            const category = await strapi.entityService.create("plugin::webbyblog.blog-category", {
              data: body,
              populate: defaultPopulate
            });
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async updateCategory(ctx) {
          try {
            const { id } = ctx.params;
            const { body } = ctx.request;
            const category = await strapi.entityService.update("plugin::webbyblog.blog-category", id, {
              data: body,
              populate: defaultPopulate
            });
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async deleteCategory(ctx) {
          try {
            const { id } = ctx.params;
            const category = await strapi.entityService.delete("plugin::webbyblog.blog-category", id, {
              populate: defaultPopulate
            });
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        // Standard content API methods
        async find(ctx) {
          try {
            const { query } = ctx;
            const populate = query?.populate ?? defaultPopulate;
            const categories = await strapi.entityService.findMany("plugin::webbyblog.blog-category", {
              ...query,
              populate
            });
            ctx.body = { data: categories };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async findOne(ctx) {
          try {
            const { id } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const category = await strapi.entityService.findOne("plugin::webbyblog.blog-category", id, { populate });
            if (!category) {
              return ctx.notFound("Category not found");
            }
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async create(ctx) {
          try {
            const { body } = ctx.request;
            const category = await strapi.entityService.create("plugin::webbyblog.blog-category", {
              data: body.data || body,
              populate: defaultPopulate
            });
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async update(ctx) {
          try {
            const { id } = ctx.params;
            const { body } = ctx.request;
            const category = await strapi.entityService.update("plugin::webbyblog.blog-category", id, {
              data: body.data || body,
              populate: defaultPopulate
            });
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async delete(ctx) {
          try {
            const { id } = ctx.params;
            const category = await strapi.entityService.delete("plugin::webbyblog.blog-category", id, {
              populate: defaultPopulate
            });
            ctx.body = { data: category };
          } catch (error) {
            ctx.throw(500, error);
          }
        }
      };
    };
  }
});

// server/src/controllers/blogTag.js
var require_blogTag = __commonJS({
  "server/src/controllers/blogTag.js"(exports2, module2) {
    "use strict";
    module2.exports = ({ strapi }) => {
      const shallowPostPopulate = {
        category: true,
        tags: true,
        author: true,
        featured_image: true,
        blocks: { populate: "*" }
      };
      const postPopulateWithTaxonomyPosts = {
        author: true,
        featured_image: true,
        blocks: { populate: "*" },
        category: { populate: { posts: { populate: shallowPostPopulate } } },
        tags: { populate: { posts: { populate: shallowPostPopulate } } }
      };
      const defaultPopulate = {
        posts: {
          populate: {
            ...postPopulateWithTaxonomyPosts
          }
        }
      };
      return {
        async getTags(ctx) {
          try {
            const { query } = ctx;
            const populate = query?.populate ?? defaultPopulate;
            const tags = await strapi.entityService.findMany("plugin::webbyblog.blog-tag", {
              ...query,
              populate
            });
            ctx.body = { data: tags };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async getTag(ctx) {
          try {
            const { id } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const tag = await strapi.entityService.findOne("plugin::webbyblog.blog-tag", id, { populate });
            if (!tag) {
              return ctx.notFound("Tag not found");
            }
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async getTagBySlug(ctx) {
          try {
            const { slug } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const tags = await strapi.entityService.findMany("plugin::webbyblog.blog-tag", {
              filters: { slug },
              populate
            });
            if (!tags || tags.length === 0) {
              return ctx.notFound("Tag not found");
            }
            ctx.body = { data: tags[0] };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async createTag(ctx) {
          try {
            const { body } = ctx.request;
            const tag = await strapi.entityService.create("plugin::webbyblog.blog-tag", {
              data: body,
              populate: defaultPopulate
            });
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async updateTag(ctx) {
          try {
            const { id } = ctx.params;
            const { body } = ctx.request;
            const tag = await strapi.entityService.update("plugin::webbyblog.blog-tag", id, {
              data: body,
              populate: defaultPopulate
            });
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async deleteTag(ctx) {
          try {
            const { id } = ctx.params;
            const tag = await strapi.entityService.delete("plugin::webbyblog.blog-tag", id, {
              populate: defaultPopulate
            });
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        // Standard content API methods
        async find(ctx) {
          try {
            const { query } = ctx;
            const populate = query?.populate ?? defaultPopulate;
            const tags = await strapi.entityService.findMany("plugin::webbyblog.blog-tag", {
              ...query,
              populate
            });
            ctx.body = { data: tags };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async findOne(ctx) {
          try {
            const { id } = ctx.params;
            const populate = ctx.query?.populate ?? defaultPopulate;
            const tag = await strapi.entityService.findOne("plugin::webbyblog.blog-tag", id, { populate });
            if (!tag) {
              return ctx.notFound("Tag not found");
            }
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async create(ctx) {
          try {
            const { body } = ctx.request;
            const tag = await strapi.entityService.create("plugin::webbyblog.blog-tag", {
              data: body.data || body,
              populate: defaultPopulate
            });
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async update(ctx) {
          try {
            const { id } = ctx.params;
            const { body } = ctx.request;
            const tag = await strapi.entityService.update("plugin::webbyblog.blog-tag", id, {
              data: body.data || body,
              populate: defaultPopulate
            });
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        },
        async delete(ctx) {
          try {
            const { id } = ctx.params;
            const tag = await strapi.entityService.delete("plugin::webbyblog.blog-tag", id, {
              populate: defaultPopulate
            });
            ctx.body = { data: tag };
          } catch (error) {
            ctx.throw(500, error);
          }
        }
      };
    };
  }
});

// server/src/controllers/index.js
var require_controllers = __commonJS({
  "server/src/controllers/index.js"(exports2, module2) {
    "use strict";
    var controller = require_controller();
    var blogPost = require_blogPost();
    var blogCategory = require_blogCategory();
    var blogTag = require_blogTag();
    module2.exports = {
      controller,
      blogPost,
      blogCategory,
      blogTag
    };
  }
});

// server/src/utils/seed-data.js
var require_seed_data = __commonJS({
  "server/src/utils/seed-data.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var util = require("util");
    var os = require("os");
    var { randomUUID } = require("crypto");
    var SEED_PLACEHOLDER_IMAGE_NAME = "webbyblog-seed-placeholder.png";
    var SEED_PLACEHOLDER_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X8p8sAAAAASUVORK5CYII=";
    var _placeholderImageId = null;
    var _placeholderImagePromise = null;
    async function getOrCreatePlaceholderImageId(strapi) {
      if (_placeholderImageId) return _placeholderImageId;
      if (_placeholderImagePromise) return _placeholderImagePromise;
      _placeholderImagePromise = (async () => {
        try {
          const existing = await strapi.entityService.findMany("plugin::upload.file", {
            filters: { name: { $eq: SEED_PLACEHOLDER_IMAGE_NAME } },
            limit: 1
          });
          if (Array.isArray(existing) && existing[0]?.id) {
            _placeholderImageId = existing[0].id;
            return _placeholderImageId;
          }
        } catch (e) {
        }
        const uploadService = strapi?.plugin?.("upload")?.service?.("upload");
        if (!uploadService?.upload) {
          strapi.log.warn("[webbyblog] Upload plugin service not available; cannot create placeholder image.");
          return null;
        }
        const buffer = Buffer.from(SEED_PLACEHOLDER_PNG_BASE64, "base64");
        const tmpPath = path.join(os.tmpdir(), `${randomUUID()}-${SEED_PLACEHOLDER_IMAGE_NAME}`);
        try {
          fs.writeFileSync(tmpPath, buffer);
          const fileSize = (() => {
            try {
              return fs.statSync(tmpPath).size;
            } catch {
              return buffer.length;
            }
          })();
          const filesPayload = {
            path: tmpPath,
            filepath: tmpPath,
            tmpPath,
            name: SEED_PLACEHOLDER_IMAGE_NAME,
            originalFilename: SEED_PLACEHOLDER_IMAGE_NAME,
            filename: SEED_PLACEHOLDER_IMAGE_NAME,
            type: "image/png",
            mimetype: "image/png",
            size: fileSize
          };
          const doUpload = async () => uploadService.upload({
            data: {
              fileInfo: {
                name: SEED_PLACEHOLDER_IMAGE_NAME,
                alternativeText: "Seed placeholder image",
                caption: "Seed placeholder image"
              }
            },
            files: filesPayload
          });
          let uploaded;
          try {
            uploaded = await doUpload();
          } catch (e) {
            const msg = e?.message || String(e);
            strapi.log.warn(`[webbyblog] Placeholder image upload failed (will retry once): ${msg}`);
            await new Promise((r) => setTimeout(r, 250));
            uploaded = await doUpload();
          }
          const uploadedFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;
          if (!uploadedFile?.id) {
            strapi.log.warn(`[webbyblog] Placeholder upload did not return an id: ${safeStringify(uploadedFile)}`);
            return null;
          }
          _placeholderImageId = uploadedFile.id;
          strapi.log.info(`[webbyblog] \u2713 Uploaded placeholder image (id=${_placeholderImageId}) for seed image-blocks`);
          return _placeholderImageId;
        } catch (e) {
          strapi.log.error(`[webbyblog] Failed to upload placeholder image: ${e?.message || e}`);
          return null;
        } finally {
          try {
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
          } catch (e) {
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
      const seen = /* @__PURE__ */ new WeakSet();
      return JSON.stringify(
        value,
        (key, val) => {
          if (typeof val === "object" && val !== null) {
            if (seen.has(val)) return "[Circular]";
            seen.add(val);
          }
          if (typeof val === "bigint") return val.toString();
          if (val instanceof Error) {
            const anyErr = val;
            return {
              name: val.name,
              message: val.message,
              stack: val.stack,
              details: anyErr["details"],
              cause: anyErr["cause"]
            };
          }
          return val;
        },
        2
      );
    }
    async function publishBlogPostIfPossible(strapi, postEntity, { logPrefix = "[webbyblog]" } = {}) {
      const uid = "plugin::webbyblog.blog-post";
      if (!postEntity?.id) return;
      const documentManager = strapi?.plugin?.("content-manager")?.service?.("document-manager");
      let documentId = postEntity.documentId;
      if (!documentId) {
        try {
          const fresh = await strapi.entityService.findOne(uid, postEntity.id, { fields: ["documentId"] });
          documentId = fresh?.documentId;
        } catch (e) {
        }
      }
      if (!documentId) {
        try {
          const fresh = await strapi.db.query(uid).findOne({ where: { id: postEntity.id }, select: ["documentId"] });
          documentId = fresh?.documentId;
        } catch (e) {
        }
      }
      if (!documentId) {
        try {
          const fresh = await strapi.db.query(uid).findOne({ where: { id: postEntity.id }, select: ["document_id"] });
          documentId = fresh?.document_id;
        } catch (e) {
        }
      }
      if (!documentId) {
        try {
          const fresh = await strapi.db.query(uid).findOne({ where: { id: postEntity.id } });
          documentId = fresh?.documentId || fresh?.document_id;
        } catch (e) {
        }
      }
      if (documentManager?.publish && documentId) {
        try {
          await documentManager.publish(documentId, uid);
          strapi.log.info(`${logPrefix} \u2713 Published post: ${postEntity.title || postEntity.slug || postEntity.id}`);
          return;
        } catch (e) {
          strapi.log.warn(
            `${logPrefix} Could not publish post "${postEntity.title || postEntity.slug || postEntity.id}": ${e?.message || e}`
          );
        }
      }
      if (documentManager?.publish) {
        try {
          await documentManager.publish(postEntity.id, uid);
          strapi.log.info(`${logPrefix} \u2713 Published post (by id): ${postEntity.title || postEntity.slug || postEntity.id}`);
          return;
        } catch (e) {
        }
      }
      try {
        await strapi.entityService.update(uid, postEntity.id, { data: { publishedAt: /* @__PURE__ */ new Date() } });
        strapi.log.info(`${logPrefix} \u2713 Republished post (fallback): ${postEntity.title || postEntity.slug || postEntity.id}`);
      } catch (e) {
        strapi.log.warn(
          `${logPrefix} Could not republish post "${postEntity.title || postEntity.slug || postEntity.id}" (fallback): ${e?.message || e}`
        );
      }
    }
    async function normalizeBlocks(strapi, blocks, { logPrefix = "[webbyblog]" } = {}) {
      if (!Array.isArray(blocks)) return [];
      const normalized = [];
      for (const rawBlock of blocks) {
        if (!rawBlock || typeof rawBlock !== "object") continue;
        const block = { ...rawBlock };
        let uid = block.__component;
        if (typeof uid === "string") {
          if (uid.startsWith("plugin::webbyblog.")) {
            uid = uid.replace("plugin::webbyblog.", "webby-blog.");
            block.__component = uid;
          }
        } else {
          strapi.log.warn(`${logPrefix} Skipping block without valid __component: ${safeStringify(rawBlock)}`);
          continue;
        }
        const component = strapi?.get?.("components")?.get?.(uid);
        if (component?.attributes && typeof component.attributes === "object") {
          let isValid = true;
          for (const [attrName, attr] of Object.entries(component.attributes)) {
            if (!attr || !attr.required) continue;
            const value = block[attrName];
            const isEmptyArray = Array.isArray(value) && value.length === 0;
            const isEmptyString = typeof value === "string" && value.trim().length === 0;
            const isMissing = value === null || value === void 0 || isEmptyArray || isEmptyString;
            if (isMissing) {
              if (uid === "webby-blog.image-block" && attrName === "image") {
                const placeholderId = await getOrCreatePlaceholderImageId(strapi);
                if (placeholderId) {
                  block.image = placeholderId;
                  continue;
                }
              }
              isValid = false;
              strapi.log.warn(
                `${logPrefix} Dropping invalid block ${uid} (missing required '${attrName}'). Block: ${safeStringify(block)}`
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
    async function seedDemoData(strapi) {
      try {
        strapi.log.info("[webbyblog] Starting blog demo data seeding...");
        const possiblePaths = [
          path.join(__dirname, "../data/blog-seed-data.json"),
          // Development
          path.join(__dirname, "../../data/blog-seed-data.json"),
          // Alternative dev path
          path.join(__dirname, "../../server/src/data/blog-seed-data.json"),
          // Source path
          path.join(__dirname, "../../../server/src/data/blog-seed-data.json")
          // Alternative source
        ];
        try {
          const pluginRoot = path.resolve(__dirname, "../../../../");
          const packageJsonPath = path.join(pluginRoot, "package.json");
          if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
            if (packageJson.name === "@webbycrown/webbyblog") {
              possiblePaths.push(path.join(pluginRoot, "dist/server/data/blog-seed-data.json"));
              possiblePaths.push(path.join(pluginRoot, "server/src/data/blog-seed-data.json"));
            }
          }
          let currentDir = __dirname;
          for (let i = 0; i < 10; i++) {
            const nodeModulesPath = path.join(currentDir, "node_modules", "@webbycrown", "webbyblog", "dist", "server", "data", "blog-seed-data.json");
            if (fs.existsSync(nodeModulesPath)) {
              possiblePaths.push(nodeModulesPath);
              break;
            }
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) break;
            currentDir = parentDir;
          }
        } catch (e) {
        }
        let seedDataPath = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            seedDataPath = possiblePath;
            break;
          }
        }
        if (!seedDataPath) {
          throw new Error(`Blog seed data file not found. Tried paths: ${possiblePaths.join(", ")}`);
        }
        const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));
        const entityMap = {
          categories: /* @__PURE__ */ new Map(),
          tags: /* @__PURE__ */ new Map(),
          posts: []
        };
        await seedCategories(strapi, seedData.categories, entityMap);
        await seedTags(strapi, seedData.tags, entityMap);
        await seedPosts(strapi, seedData.posts, entityMap);
        strapi.log.info("[webbyblog] Blog demo data seeding completed successfully!");
        return {
          success: true,
          message: `Successfully seeded ${entityMap.categories.size} categories, ${entityMap.tags.size} tags, and ${entityMap.posts.length} blog posts`
        };
      } catch (error) {
        strapi.log.error("[webbyblog] Error seeding blog demo data:", error);
        throw error;
      }
    }
    async function seedCategories(strapi, categories, entityMap) {
      strapi.log.info("[webbyblog] Seeding blog categories...");
      for (const category of categories) {
        try {
          const existingCategories = await strapi.entityService.findMany("plugin::webbyblog.blog-category", {
            filters: { name: category.name }
          });
          if (existingCategories.length > 0) {
            const existingCategory = existingCategories[0];
            strapi.log.info(`[webbyblog] Category "${category.name}" already exists, skipping...`);
            entityMap.categories.set(category.name, existingCategory);
            continue;
          }
          const categoryData = {
            name: category.name,
            description: category.description || ""
          };
          if (category.slug) {
            categoryData.slug = category.slug;
          }
          const createdCategory = await strapi.entityService.create("plugin::webbyblog.blog-category", {
            data: categoryData
          });
          entityMap.categories.set(category.name, createdCategory);
          strapi.log.info(`[webbyblog] \u2713 Created category: ${category.name}`);
        } catch (error) {
          strapi.log.error(`[webbyblog] Error creating category ${category.name}:`, error.message);
        }
      }
      strapi.log.info(`[webbyblog] Categories seeding completed. Created: ${entityMap.categories.size}`);
    }
    async function seedTags(strapi, tags, entityMap) {
      strapi.log.info("[webbyblog] Seeding blog tags...");
      for (const tag of tags) {
        try {
          const existingTags = await strapi.entityService.findMany("plugin::webbyblog.blog-tag", {
            filters: { name: tag.name }
          });
          if (existingTags.length > 0) {
            const existingTag = existingTags[0];
            strapi.log.info(`[webbyblog] Tag "${tag.name}" already exists, skipping...`);
            entityMap.tags.set(tag.name, existingTag);
            continue;
          }
          const tagData = {
            name: tag.name,
            description: tag.description || ""
          };
          if (tag.slug) {
            tagData.slug = tag.slug;
          }
          const createdTag = await strapi.entityService.create("plugin::webbyblog.blog-tag", {
            data: tagData
          });
          entityMap.tags.set(tag.name, createdTag);
          strapi.log.info(`[webbyblog] \u2713 Created tag: ${tag.name}`);
        } catch (error) {
          const errorMessage = error.message || error.toString() || "Unknown error";
          strapi.log.error(`[webbyblog] Error creating tag ${tag.name}:`, errorMessage);
          if (error.stack) {
            strapi.log.error(`[webbyblog] Error stack:`, error.stack);
          }
        }
      }
      strapi.log.info(`[webbyblog] Tags seeding completed. Created: ${entityMap.tags.size}`);
    }
    async function seedPosts(strapi, posts, entityMap) {
      strapi.log.info("[webbyblog] Seeding blog posts...");
      for (const post of posts) {
        try {
          let categoryId = null;
          if (post.category) {
            const category = entityMap.categories.get(post.category);
            if (category) {
              categoryId = category.id;
            } else {
              strapi.log.warn(`[webbyblog] Category "${post.category}" not found for post "${post.title}"`);
            }
          }
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
          let existingPosts = [];
          if (post.slug) {
            existingPosts = await strapi.entityService.findMany("plugin::webbyblog.blog-post", {
              filters: {
                slug: {
                  $eq: post.slug
                }
              }
            });
          }
          if (existingPosts.length === 0) {
            existingPosts = await strapi.entityService.findMany("plugin::webbyblog.blog-post", {
              filters: {
                title: {
                  $eq: post.title
                }
              }
            });
          }
          if (existingPosts.length === 0) {
            existingPosts = await strapi.entityService.findMany("plugin::webbyblog.blog-post", {
              filters: { title: post.title }
            });
          }
          if (existingPosts.length > 0) {
            const existingPost = existingPosts[0];
            let didMutate = false;
            if (post.slug && existingPost.slug !== post.slug) {
              try {
                await strapi.entityService.update("plugin::webbyblog.blog-post", existingPost.id, {
                  data: { slug: post.slug }
                });
                strapi.log.info(`[webbyblog] Updated slug for post "${post.title}": ${post.slug}`);
                didMutate = true;
              } catch (updateError) {
                strapi.log.debug(`[webbyblog] Slug update skipped for post "${post.title}" (auto-managed by Strapi)`);
              }
            }
            if (post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
              const blocks = await normalizeBlocks(strapi, post.blocks);
              if (blocks.length > 0) {
                try {
                  await strapi.entityService.update("plugin::webbyblog.blog-post", existingPost.id, {
                    data: { blocks }
                  });
                  strapi.log.info(`[webbyblog] \u2713 Updated blocks for existing post "${post.title}"`);
                  didMutate = true;
                } catch (updateErr) {
                  strapi.log.warn(
                    `[webbyblog] Could not update blocks for existing post "${post.title}": ${updateErr?.message || updateErr}`
                  );
                }
              }
            }
            if (categoryId) {
              try {
                await strapi.entityService.update("plugin::webbyblog.blog-post", existingPost.id, {
                  data: { category: categoryId }
                });
                didMutate = true;
              } catch (e) {
              }
            }
            if (tagIds.length > 0) {
              try {
                await strapi.entityService.update("plugin::webbyblog.blog-post", existingPost.id, {
                  data: { tags: tagIds }
                });
                didMutate = true;
              } catch (e) {
              }
            }
            await publishBlogPostIfPossible(strapi, existingPost);
            strapi.log.info(`[webbyblog] Post "${post.title}" already exists, skipping create...`);
            entityMap.posts.push(existingPost);
            continue;
          }
          const postData = {
            title: post.title,
            excerpt: post.excerpt || "",
            content: post.content || "",
            meta_title: post.meta_title || post.title,
            meta_description: post.meta_description || post.excerpt || "",
            meta_keywords: post.meta_keywords || "",
            views: 0,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : /* @__PURE__ */ new Date()
          };
          if (post.slug) {
            postData.slug = post.slug;
          }
          if (post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
            const blocks = await normalizeBlocks(strapi, post.blocks);
            if (blocks.length > 0) {
              postData.blocks = blocks;
            }
          }
          if (categoryId) {
            postData.category = categoryId;
          }
          if (tagIds.length > 0) {
            postData.tags = tagIds;
          }
          const createdPost = await strapi.entityService.create("plugin::webbyblog.blog-post", {
            data: postData
          });
          await publishBlogPostIfPossible(strapi, createdPost);
          entityMap.posts.push(createdPost);
          strapi.log.info(`[webbyblog] \u2713 Created post: ${post.title}`);
        } catch (error) {
          const errorMessage = error?.message || error?.toString?.() || String(error);
          strapi.log.error(`[webbyblog] Error creating post ${post.title}: ${errorMessage}`);
          if (error?.details) {
            strapi.log.error(`[webbyblog] Post create error.details: ${safeStringify(error.details)}`);
          }
          if (error?.errors) {
            strapi.log.error(`[webbyblog] Post create error.errors: ${safeStringify(error.errors)}`);
          }
          try {
            strapi.log.error(
              `[webbyblog] Post create error (inspect): ${util.inspect(error, { depth: 10, colors: false })}`
            );
          } catch (e) {
          }
          if (error?.stack) {
            strapi.log.error(`[webbyblog] Post create error stack:
${error.stack}`);
          }
        }
      }
      strapi.log.info(`[webbyblog] Posts seeding completed. Created: ${entityMap.posts.length}`);
    }
    module2.exports = {
      seedDemoData
    };
  }
});

// server/src/services/service.js
var require_service = __commonJS({
  "server/src/services/service.js"(exports2, module2) {
    "use strict";
    var { seedDemoData } = require_seed_data();
    var DEFAULT_SUGGESTION_APIS = [
      {
        id: "blog-posts-list",
        name: "Blog posts (list)",
        method: "GET",
        path: "/api/blog-posts",
        description: "List blog posts with default populate.",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": [
    {
      "id": 83,
      "title": "Modern CSS Techniques for 2024",
      "slug": "modern-css-techniques-for-2024",
      "category": { "id": 23, "name": "Design", "posts": [] },
      "tags": [{ "id": 34, "name": "CSS", "posts": [] }],
      "featured_image": null,
      "blocks": []
    }
  ]
}`,
        typicalUsage: "Use this endpoint to build the blog listing page. Supports filters, pagination, and sorting via Strapi query params.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-posts",
        enabled: true
      },
      {
        id: "blog-posts-single",
        name: "Blog posts (single)",
        method: "GET",
        path: "/api/blog-posts/:id",
        description: "Get one blog post by id with default populate.",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 83,
    "title": "Modern CSS Techniques for 2024",
    "slug": "modern-css-techniques-for-2024",
    "category": { "id": 23, "name": "Design", "posts": [] },
    "tags": [{ "id": 34, "name": "CSS", "posts": [] }],
    "featured_image": null,
    "blocks": []
  }
}`,
        typicalUsage: "Use this endpoint to render a blog post detail page by numeric id.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-posts/83",
        enabled: true
      },
      {
        id: "blog-post-by-slug-clean",
        name: "Blog post (by slug, clean route)",
        method: "GET",
        path: "/api/blog-post/:slug",
        description: "Get one blog post by slug with default populate (clean route).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 83,
    "title": "Modern CSS Techniques for 2024",
    "slug": "modern-css-techniques-for-2024"
  }
}`,
        typicalUsage: "Cleaner alias for fetching a single post by slug.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-post/modern-css-techniques-for-2024",
        enabled: true
      },
      {
        id: "blog-posts-create",
        name: "Blog posts (create)",
        method: "POST",
        path: "/api/blog-posts",
        description: "Create a blog post.",
        auth: "public",
        requestBodyExample: `{
  "data": {
    "title": "My post",
    "slug": "my-post",
    "excerpt": "Short excerpt",
    "content": "Long content"
  }
}`,
        responseBodyExample: `{
  "data": {
    "id": 123,
    "title": "My post",
    "slug": "my-post"
  }
}`,
        typicalUsage: "Use this endpoint to create new posts from an external form or integration.",
        curlExample: `curl -X POST http://localhost:1337/api/blog-posts -H "Content-Type: application/json" -d '{"data":{"title":"My post"}}'`,
        enabled: true
      },
      {
        id: "blog-posts-update",
        name: "Blog posts (update)",
        method: "PUT",
        path: "/api/blog-posts/:id",
        description: "Update a blog post.",
        auth: "public",
        requestBodyExample: `{
  "data": {
    "title": "Updated title"
  }
}`,
        responseBodyExample: `{
  "data": {
    "id": 83,
    "title": "Updated title"
  }
}`,
        typicalUsage: "Use this endpoint to update existing posts.",
        curlExample: `curl -X PUT http://localhost:1337/api/blog-posts/83 -H "Content-Type: application/json" -d '{"data":{"title":"Updated title"}}'`,
        enabled: true
      },
      {
        id: "blog-posts-delete",
        name: "Blog posts (delete)",
        method: "DELETE",
        path: "/api/blog-posts/:id",
        description: "Delete a blog post.",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 83
  }
}`,
        typicalUsage: "Use this endpoint to delete posts.",
        curlExample: "curl -X DELETE http://localhost:1337/api/blog-posts/83",
        enabled: true
      },
      {
        id: "blog-categories",
        name: "Blog categories",
        method: "GET",
        path: "/api/blog-categories",
        description: "List blog categories (includes posts by default).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": [
    {
      "id": 23,
      "name": "Design",
      "slug": "design",
      "posts": []
    }
  ]
}`,
        typicalUsage: "Use this endpoint to build a category filter or category pages.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-categories",
        enabled: true
      },
      {
        id: "blog-categories-single",
        name: "Blog categories (single)",
        method: "GET",
        path: "/api/blog-categories/:id",
        description: "Get one category by id (includes posts).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 23,
    "name": "Design",
    "slug": "design",
    "posts": []
  }
}`,
        typicalUsage: "Use this endpoint for a single category page.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-categories/23",
        enabled: true
      },
      {
        id: "blog-category-by-slug-clean",
        name: "Blog category (by slug, clean route)",
        method: "GET",
        path: "/api/blog-category/:slug",
        description: "Get one category by slug (includes posts by default).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 23,
    "name": "Design",
    "slug": "design",
    "posts": []
  }
}`,
        typicalUsage: "Cleaner alias for a single category page by slug.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-category/design",
        enabled: true
      },
      {
        id: "blog-categories-create",
        name: "Blog categories (create)",
        method: "POST",
        path: "/api/blog-categories",
        description: "Create a blog category.",
        auth: "public",
        requestBodyExample: `{
  "data": {
    "name": "New Category",
    "slug": "new-category"
  }
}`,
        responseBodyExample: `{
  "data": { "id": 55, "name": "New Category", "slug": "new-category" }
}`,
        typicalUsage: "Use this endpoint to create categories.",
        curlExample: `curl -X POST http://localhost:1337/api/blog-categories -H "Content-Type: application/json" -d '{"data":{"name":"New Category"}}'`,
        enabled: true
      },
      {
        id: "blog-categories-update",
        name: "Blog categories (update)",
        method: "PUT",
        path: "/api/blog-categories/:id",
        description: "Update a blog category.",
        auth: "public",
        requestBodyExample: `{
  "data": {
    "name": "Updated Category"
  }
}`,
        responseBodyExample: `{
  "data": { "id": 23, "name": "Updated Category" }
}`,
        typicalUsage: "Use this endpoint to update categories.",
        curlExample: `curl -X PUT http://localhost:1337/api/blog-categories/23 -H "Content-Type: application/json" -d '{"data":{"name":"Updated Category"}}'`,
        enabled: true
      },
      {
        id: "blog-categories-delete",
        name: "Blog categories (delete)",
        method: "DELETE",
        path: "/api/blog-categories/:id",
        description: "Delete a blog category.",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": { "id": 23 }
}`,
        typicalUsage: "Use this endpoint to delete categories.",
        curlExample: "curl -X DELETE http://localhost:1337/api/blog-categories/23",
        enabled: true
      },
      {
        id: "blog-tags",
        name: "Blog tags",
        method: "GET",
        path: "/api/blog-tags",
        description: "List blog tags (includes posts by default).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": [
    {
      "id": 34,
      "name": "CSS",
      "slug": "css",
      "posts": []
    }
  ]
}`,
        typicalUsage: "Use this endpoint to build tag filters or tag pages.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-tags",
        enabled: true
      },
      {
        id: "blog-tags-single",
        name: "Blog tags (single)",
        method: "GET",
        path: "/api/blog-tags/:id",
        description: "Get one tag by id (includes posts).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 34,
    "name": "CSS",
    "slug": "css",
    "posts": []
  }
}`,
        typicalUsage: "Use this endpoint for a single tag page.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-tags/34",
        enabled: true
      },
      {
        id: "blog-tag-by-slug-clean",
        name: "Blog tag (by slug, clean route)",
        method: "GET",
        path: "/api/blog-tag/:slug",
        description: "Get one tag by slug (includes posts by default).",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "id": 34,
    "name": "CSS",
    "slug": "css",
    "posts": []
  }
}`,
        typicalUsage: "Cleaner alias for a single tag page by slug.",
        curlExample: "curl -X GET http://localhost:1337/api/blog-tag/css",
        enabled: true
      },
      {
        id: "blog-tags-create",
        name: "Blog tags (create)",
        method: "POST",
        path: "/api/blog-tags",
        description: "Create a blog tag.",
        auth: "public",
        requestBodyExample: `{
  "data": {
    "name": "New Tag",
    "slug": "new-tag"
  }
}`,
        responseBodyExample: `{
  "data": { "id": 77, "name": "New Tag", "slug": "new-tag" }
}`,
        typicalUsage: "Use this endpoint to create tags.",
        curlExample: `curl -X POST http://localhost:1337/api/blog-tags -H "Content-Type: application/json" -d '{"data":{"name":"New Tag"}}'`,
        enabled: true
      },
      {
        id: "blog-tags-update",
        name: "Blog tags (update)",
        method: "PUT",
        path: "/api/blog-tags/:id",
        description: "Update a blog tag.",
        auth: "public",
        requestBodyExample: `{
  "data": {
    "name": "Updated Tag"
  }
}`,
        responseBodyExample: `{
  "data": { "id": 34, "name": "Updated Tag" }
}`,
        typicalUsage: "Use this endpoint to update tags.",
        curlExample: `curl -X PUT http://localhost:1337/api/blog-tags/34 -H "Content-Type: application/json" -d '{"data":{"name":"Updated Tag"}}'`,
        enabled: true
      },
      {
        id: "blog-tags-delete",
        name: "Blog tags (delete)",
        method: "DELETE",
        path: "/api/blog-tags/:id",
        description: "Delete a blog tag.",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": { "id": 34 }
}`,
        typicalUsage: "Use this endpoint to delete tags.",
        curlExample: "curl -X DELETE http://localhost:1337/api/blog-tags/34",
        enabled: true
      },
      {
        id: "webbyblog-health",
        name: "WebbyBlog health check",
        method: "GET",
        path: "/api/webbyblog/health",
        description: "Verify the WebbyBlog plugin is installed and running.",
        auth: "public",
        requestBodyExample: "",
        responseBodyExample: `{
  "status": "ok",
  "plugin": "webbyblog",
  "version": "1.0.0"
}`,
        typicalUsage: "Use this endpoint for monitoring and environment checks.",
        curlExample: "curl -X GET http://localhost:1337/api/webbyblog/health",
        enabled: true
      },
      {
        id: "webbyblog-settings-get",
        name: "WebbyBlog settings (get)",
        method: "GET",
        path: "/api/webbyblog/settings",
        description: "Get WebbyBlog plugin settings (used by admin UI).",
        auth: "admin",
        requestBodyExample: "",
        responseBodyExample: `{
  "data": {
    "suggestionApis": []
  }
}`,
        typicalUsage: "Used by the plugin admin settings page.",
        curlExample: "curl -X GET http://localhost:1337/api/webbyblog/settings",
        enabled: true
      },
      {
        id: "webbyblog-settings-put",
        name: "WebbyBlog settings (update)",
        method: "PUT",
        path: "/api/webbyblog/settings",
        description: "Update WebbyBlog plugin settings (used by admin UI).",
        auth: "admin",
        requestBodyExample: `{
  "suggestionApis": []
}`,
        responseBodyExample: `{
  "data": {
    "suggestionApis": []
  }
}`,
        typicalUsage: "Used by the plugin admin settings page.",
        curlExample: `curl -X PUT http://localhost:1337/api/webbyblog/settings -H "Content-Type: application/json" -d '{"suggestionApis": []}'`,
        enabled: true
      }
    ];
    var getDefaultSettings = () => ({
      suggestionApis: DEFAULT_SUGGESTION_APIS
    });
    var mergeSuggestionApis = (defaultsList, storedList) => {
      const stored = Array.isArray(storedList) ? storedList : [];
      const storedById = /* @__PURE__ */ new Map();
      for (const item of stored) {
        if (!item || typeof item !== "object") continue;
        const id = typeof item.id === "string" ? item.id.trim() : "";
        if (!id) continue;
        storedById.set(id, item);
      }
      return defaultsList.map((def) => {
        const override = storedById.get(def.id);
        return override ? { ...def, ...override } : def;
      });
    };
    var normalizeSuggestionApis = (value) => {
      if (!Array.isArray(value)) return DEFAULT_SUGGESTION_APIS;
      const seenIds = /* @__PURE__ */ new Set();
      const normalized = [];
      for (const raw of value) {
        if (!raw || typeof raw !== "object") continue;
        const id = typeof raw.id === "string" ? raw.id.trim() : "";
        const name = typeof raw.name === "string" ? raw.name.trim() : "";
        const method = typeof raw.method === "string" ? raw.method.trim().toUpperCase() : "GET";
        const path = typeof raw.path === "string" ? raw.path.trim() : "";
        const description = typeof raw.description === "string" ? raw.description.trim() : "";
        const auth = typeof raw.auth === "string" ? raw.auth.trim() : "public";
        const requestBodyExample = typeof raw.requestBodyExample === "string" ? raw.requestBodyExample : "";
        const responseBodyExample = typeof raw.responseBodyExample === "string" ? raw.responseBodyExample : "";
        const typicalUsage = typeof raw.typicalUsage === "string" ? raw.typicalUsage : "";
        const curlExample = typeof raw.curlExample === "string" ? raw.curlExample : "";
        const enabled = raw.enabled !== false;
        if (!id || !name || !path) continue;
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        normalized.push({
          id,
          name,
          method,
          path,
          description,
          auth,
          requestBodyExample,
          responseBodyExample,
          typicalUsage,
          curlExample,
          enabled
        });
      }
      return normalized.length ? normalized : DEFAULT_SUGGESTION_APIS;
    };
    module2.exports = ({ strapi }) => ({
      async getSettings() {
        const store = strapi.store({ type: "plugin", name: "webbyblog" });
        const stored = await store.get({ key: "settings" }) || {};
        const defaults = getDefaultSettings();
        const mergedSuggestionApis = mergeSuggestionApis(
          defaults.suggestionApis,
          stored.suggestionApis
        );
        return {
          ...defaults,
          ...stored,
          suggestionApis: normalizeSuggestionApis(mergedSuggestionApis)
        };
      },
      async updateSettings(settings) {
        const store = strapi.store({ type: "plugin", name: "webbyblog" });
        const safeSettings = {
          ...settings && typeof settings === "object" ? settings : {}
        };
        safeSettings.suggestionApis = normalizeSuggestionApis(safeSettings.suggestionApis);
        await store.set({ key: "settings", value: safeSettings });
        return await store.get({ key: "settings" });
      },
      async seedDemoData() {
        return await seedDemoData(strapi);
      }
    });
  }
});

// server/src/services/index.js
var require_services = __commonJS({
  "server/src/services/index.js"(exports2, module2) {
    "use strict";
    var service = require_service();
    module2.exports = {
      service
    };
  }
});

// server/src/middlewares/index.js
var require_middlewares = __commonJS({
  "server/src/middlewares/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {};
  }
});

// server/src/policies/index.js
var require_policies = __commonJS({
  "server/src/policies/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {};
  }
});

// server/src/content-types/blog-post/schema.json
var require_schema = __commonJS({
  "server/src/content-types/blog-post/schema.json"(exports2, module2) {
    module2.exports = {
      kind: "collectionType",
      collectionName: "blog_posts",
      info: {
        singularName: "blog-post",
        pluralName: "blog-posts",
        displayName: "Blog Post",
        description: "Blog posts and articles"
      },
      options: {
        draftAndPublish: true
      },
      pluginOptions: {
        "content-manager": {
          visible: true
        },
        "content-api": {
          visible: true
        }
      },
      attributes: {
        title: {
          type: "string",
          required: true
        },
        slug: {
          type: "uid",
          targetField: "title",
          required: false
        },
        content: {
          type: "richtext",
          required: false
        },
        blocks: {
          type: "dynamiczone",
          components: [
            "webby-blog.text-block",
            "webby-blog.image-block",
            "webby-blog.image-content-block",
            "webby-blog.quote-block",
            "webby-blog.code-block",
            "webby-blog.video-block",
            "webby-blog.gallery-block",
            "webby-blog.cta-block",
            "webby-blog.heading-block",
            "webby-blog.divider-block",
            "webby-blog.faq-block",
            "webby-blog.images-slider-block"
          ],
          required: false
        },
        excerpt: {
          type: "text",
          required: false
        },
        featured_image: {
          type: "media",
          multiple: false,
          required: false,
          allowedTypes: ["images"]
        },
        category: {
          type: "relation",
          relation: "manyToOne",
          target: "plugin::webbyblog.blog-category",
          inversedBy: "posts"
        },
        tags: {
          type: "relation",
          relation: "manyToMany",
          target: "plugin::webbyblog.blog-tag",
          inversedBy: "posts"
        },
        author: {
          type: "relation",
          relation: "manyToOne",
          target: "plugin::users-permissions.user",
          required: false
        },
        meta_title: {
          type: "string",
          required: false
        },
        meta_description: {
          type: "text",
          required: false
        },
        meta_keywords: {
          type: "string",
          required: false
        },
        views: {
          type: "integer",
          default: 0,
          required: false
        }
      }
    };
  }
});

// server/src/content-types/blog-post/index.js
var require_blog_post = __commonJS({
  "server/src/content-types/blog-post/index.js"(exports2, module2) {
    "use strict";
    var schema = require_schema();
    module2.exports = {
      schema
    };
  }
});

// server/src/content-types/blog-category/schema.json
var require_schema2 = __commonJS({
  "server/src/content-types/blog-category/schema.json"(exports2, module2) {
    module2.exports = {
      kind: "collectionType",
      collectionName: "blog_categories",
      info: {
        singularName: "blog-category",
        pluralName: "blog-categories",
        displayName: "Blog Category",
        description: "Blog post categories"
      },
      options: {
        draftAndPublish: false
      },
      pluginOptions: {
        "content-manager": {
          visible: true
        },
        "content-api": {
          visible: true
        }
      },
      attributes: {
        name: {
          type: "string",
          required: true
        },
        slug: {
          type: "uid",
          targetField: "name",
          required: false
        },
        description: {
          type: "text",
          required: false
        },
        posts: {
          type: "relation",
          relation: "oneToMany",
          target: "plugin::webbyblog.blog-post",
          mappedBy: "category"
        }
      }
    };
  }
});

// server/src/content-types/blog-category/index.js
var require_blog_category = __commonJS({
  "server/src/content-types/blog-category/index.js"(exports2, module2) {
    "use strict";
    var schema = require_schema2();
    module2.exports = {
      schema
    };
  }
});

// server/src/content-types/blog-tag/schema.json
var require_schema3 = __commonJS({
  "server/src/content-types/blog-tag/schema.json"(exports2, module2) {
    module2.exports = {
      kind: "collectionType",
      collectionName: "blog_tags",
      info: {
        singularName: "blog-tag",
        pluralName: "blog-tags",
        displayName: "Blog Tag",
        description: "Blog post tags"
      },
      options: {
        draftAndPublish: false
      },
      pluginOptions: {
        "content-manager": {
          visible: true
        },
        "content-api": {
          visible: true
        }
      },
      attributes: {
        name: {
          type: "string",
          required: true,
          unique: true
        },
        slug: {
          type: "uid",
          targetField: "name",
          required: false
        },
        description: {
          type: "text",
          required: false
        },
        posts: {
          type: "relation",
          relation: "manyToMany",
          target: "plugin::webbyblog.blog-post",
          mappedBy: "tags"
        }
      }
    };
  }
});

// server/src/content-types/blog-tag/index.js
var require_blog_tag = __commonJS({
  "server/src/content-types/blog-tag/index.js"(exports2, module2) {
    "use strict";
    var schema = require_schema3();
    module2.exports = {
      schema
    };
  }
});

// server/src/content-types/index.js
var require_content_types = __commonJS({
  "server/src/content-types/index.js"(exports2, module2) {
    "use strict";
    var blogPost = require_blog_post();
    var blogCategory = require_blog_category();
    var blogTag = require_blog_tag();
    module2.exports = {
      "blog-post": blogPost,
      "blog-category": blogCategory,
      "blog-tag": blogTag
    };
  }
});

// server/src/index.js
var register = require_register();
var bootstrap = require_bootstrap();
var destroy = require_destroy();
var config = require_config();
var controllers = require_controllers();
var routes = require_routes();
var services = require_services();
var middlewares = require_middlewares();
var policies = require_policies();
var contentTypes = require_content_types();
module.exports = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  contentTypes,
  policies,
  middlewares,
  routes,
  services
};
