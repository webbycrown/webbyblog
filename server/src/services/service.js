'use strict';

const { seedDemoData } = require('../utils/seed-data');

const DEFAULT_SUGGESTION_APIS = [
  {
    id: 'blog-posts-list',
    name: 'Blog posts (list)',
    method: 'GET',
    path: '/api/blog-posts',
    description: 'List blog posts with default populate.',
    auth: 'public',
    requestBodyExample: '',
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
    typicalUsage:
      'Use this endpoint to build the blog listing page. Supports filters, pagination, and sorting via Strapi query params.',
    curlExample:
      'curl -X GET http://localhost:1337/api/blog-posts',
    enabled: true,
  },
  {
    id: 'blog-posts-single',
    name: 'Blog posts (single)',
    method: 'GET',
    path: '/api/blog-posts/:id',
    description: 'Get one blog post by id with default populate.',
    auth: 'public',
    requestBodyExample: '',
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
    typicalUsage: 'Use this endpoint to render a blog post detail page by numeric id.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-posts/83',
    enabled: true,
  },
  {
    id: 'blog-post-by-slug-clean',
    name: 'Blog post (by slug, clean route)',
    method: 'GET',
    path: '/api/blog-post/:slug',
    description: 'Get one blog post by slug with default populate (clean route).',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "id": 83,
    "title": "Modern CSS Techniques for 2024",
    "slug": "modern-css-techniques-for-2024"
  }
}`,
    typicalUsage: 'Cleaner alias for fetching a single post by slug.',
    curlExample:
      'curl -X GET http://localhost:1337/api/blog-post/modern-css-techniques-for-2024',
    enabled: true,
  },
  {
    id: 'blog-posts-create',
    name: 'Blog posts (create)',
    method: 'POST',
    path: '/api/blog-posts',
    description: 'Create a blog post.',
    auth: 'public',
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
    typicalUsage: 'Use this endpoint to create new posts from an external form or integration.',
    curlExample:
      'curl -X POST http://localhost:1337/api/blog-posts -H "Content-Type: application/json" -d \'{"data":{"title":"My post"}}\'',
    enabled: true,
  },
  {
    id: 'blog-posts-update',
    name: 'Blog posts (update)',
    method: 'PUT',
    path: '/api/blog-posts/:id',
    description: 'Update a blog post.',
    auth: 'public',
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
    typicalUsage: 'Use this endpoint to update existing posts.',
    curlExample:
      'curl -X PUT http://localhost:1337/api/blog-posts/83 -H "Content-Type: application/json" -d \'{"data":{"title":"Updated title"}}\'',
    enabled: true,
  },
  {
    id: 'blog-posts-delete',
    name: 'Blog posts (delete)',
    method: 'DELETE',
    path: '/api/blog-posts/:id',
    description: 'Delete a blog post.',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "id": 83
  }
}`,
    typicalUsage: 'Use this endpoint to delete posts.',
    curlExample: 'curl -X DELETE http://localhost:1337/api/blog-posts/83',
    enabled: true,
  },
  {
    id: 'blog-categories',
    name: 'Blog categories',
    method: 'GET',
    path: '/api/blog-categories',
    description: 'List blog categories (includes posts by default).',
    auth: 'public',
    requestBodyExample: '',
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
    typicalUsage: 'Use this endpoint to build a category filter or category pages.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-categories',
    enabled: true,
  },
  {
    id: 'blog-categories-single',
    name: 'Blog categories (single)',
    method: 'GET',
    path: '/api/blog-categories/:id',
    description: 'Get one category by id (includes posts).',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "id": 23,
    "name": "Design",
    "slug": "design",
    "posts": []
  }
}`,
    typicalUsage: 'Use this endpoint for a single category page.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-categories/23',
    enabled: true,
  },
  {
    id: 'blog-category-by-slug-clean',
    name: 'Blog category (by slug, clean route)',
    method: 'GET',
    path: '/api/blog-category/:slug',
    description: 'Get one category by slug (includes posts by default).',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "id": 23,
    "name": "Design",
    "slug": "design",
    "posts": []
  }
}`,
    typicalUsage: 'Cleaner alias for a single category page by slug.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-category/design',
    enabled: true,
  },
  {
    id: 'blog-categories-create',
    name: 'Blog categories (create)',
    method: 'POST',
    path: '/api/blog-categories',
    description: 'Create a blog category.',
    auth: 'public',
    requestBodyExample: `{
  "data": {
    "name": "New Category",
    "slug": "new-category"
  }
}`,
    responseBodyExample: `{
  "data": { "id": 55, "name": "New Category", "slug": "new-category" }
}`,
    typicalUsage: 'Use this endpoint to create categories.',
    curlExample:
      'curl -X POST http://localhost:1337/api/blog-categories -H "Content-Type: application/json" -d \'{"data":{"name":"New Category"}}\'',
    enabled: true,
  },
  {
    id: 'blog-categories-update',
    name: 'Blog categories (update)',
    method: 'PUT',
    path: '/api/blog-categories/:id',
    description: 'Update a blog category.',
    auth: 'public',
    requestBodyExample: `{
  "data": {
    "name": "Updated Category"
  }
}`,
    responseBodyExample: `{
  "data": { "id": 23, "name": "Updated Category" }
}`,
    typicalUsage: 'Use this endpoint to update categories.',
    curlExample:
      'curl -X PUT http://localhost:1337/api/blog-categories/23 -H "Content-Type: application/json" -d \'{"data":{"name":"Updated Category"}}\'',
    enabled: true,
  },
  {
    id: 'blog-categories-delete',
    name: 'Blog categories (delete)',
    method: 'DELETE',
    path: '/api/blog-categories/:id',
    description: 'Delete a blog category.',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": { "id": 23 }
}`,
    typicalUsage: 'Use this endpoint to delete categories.',
    curlExample: 'curl -X DELETE http://localhost:1337/api/blog-categories/23',
    enabled: true,
  },
  {
    id: 'blog-tags',
    name: 'Blog tags',
    method: 'GET',
    path: '/api/blog-tags',
    description: 'List blog tags (includes posts by default).',
    auth: 'public',
    requestBodyExample: '',
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
    typicalUsage: 'Use this endpoint to build tag filters or tag pages.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-tags',
    enabled: true,
  },
  {
    id: 'blog-tags-single',
    name: 'Blog tags (single)',
    method: 'GET',
    path: '/api/blog-tags/:id',
    description: 'Get one tag by id (includes posts).',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "id": 34,
    "name": "CSS",
    "slug": "css",
    "posts": []
  }
}`,
    typicalUsage: 'Use this endpoint for a single tag page.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-tags/34',
    enabled: true,
  },
  {
    id: 'blog-tag-by-slug-clean',
    name: 'Blog tag (by slug, clean route)',
    method: 'GET',
    path: '/api/blog-tag/:slug',
    description: 'Get one tag by slug (includes posts by default).',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "id": 34,
    "name": "CSS",
    "slug": "css",
    "posts": []
  }
}`,
    typicalUsage: 'Cleaner alias for a single tag page by slug.',
    curlExample: 'curl -X GET http://localhost:1337/api/blog-tag/css',
    enabled: true,
  },
  {
    id: 'blog-tags-create',
    name: 'Blog tags (create)',
    method: 'POST',
    path: '/api/blog-tags',
    description: 'Create a blog tag.',
    auth: 'public',
    requestBodyExample: `{
  "data": {
    "name": "New Tag",
    "slug": "new-tag"
  }
}`,
    responseBodyExample: `{
  "data": { "id": 77, "name": "New Tag", "slug": "new-tag" }
}`,
    typicalUsage: 'Use this endpoint to create tags.',
    curlExample:
      'curl -X POST http://localhost:1337/api/blog-tags -H "Content-Type: application/json" -d \'{"data":{"name":"New Tag"}}\'',
    enabled: true,
  },
  {
    id: 'blog-tags-update',
    name: 'Blog tags (update)',
    method: 'PUT',
    path: '/api/blog-tags/:id',
    description: 'Update a blog tag.',
    auth: 'public',
    requestBodyExample: `{
  "data": {
    "name": "Updated Tag"
  }
}`,
    responseBodyExample: `{
  "data": { "id": 34, "name": "Updated Tag" }
}`,
    typicalUsage: 'Use this endpoint to update tags.',
    curlExample:
      'curl -X PUT http://localhost:1337/api/blog-tags/34 -H "Content-Type: application/json" -d \'{"data":{"name":"Updated Tag"}}\'',
    enabled: true,
  },
  {
    id: 'blog-tags-delete',
    name: 'Blog tags (delete)',
    method: 'DELETE',
    path: '/api/blog-tags/:id',
    description: 'Delete a blog tag.',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": { "id": 34 }
}`,
    typicalUsage: 'Use this endpoint to delete tags.',
    curlExample: 'curl -X DELETE http://localhost:1337/api/blog-tags/34',
    enabled: true,
  },
  {
    id: 'webbyblog-health',
    name: 'WebbyBlog health check',
    method: 'GET',
    path: '/api/webbyblog/health',
    description: 'Verify the WebbyBlog plugin is installed and running.',
    auth: 'public',
    requestBodyExample: '',
    responseBodyExample: `{
  "status": "ok",
  "plugin": "webbyblog",
  "version": "1.0.0"
}`,
    typicalUsage: 'Use this endpoint for monitoring and environment checks.',
    curlExample: 'curl -X GET http://localhost:1337/api/webbyblog/health',
    enabled: true,
  },
  {
    id: 'webbyblog-settings-get',
    name: 'WebbyBlog settings (get)',
    method: 'GET',
    path: '/api/webbyblog/settings',
    description: 'Get WebbyBlog plugin settings (used by admin UI).',
    auth: 'admin',
    requestBodyExample: '',
    responseBodyExample: `{
  "data": {
    "suggestionApis": []
  }
}`,
    typicalUsage: 'Used by the plugin admin settings page.',
    curlExample: 'curl -X GET http://localhost:1337/api/webbyblog/settings',
    enabled: true,
  },
  {
    id: 'webbyblog-settings-put',
    name: 'WebbyBlog settings (update)',
    method: 'PUT',
    path: '/api/webbyblog/settings',
    description: 'Update WebbyBlog plugin settings (used by admin UI).',
    auth: 'admin',
    requestBodyExample: `{
  "suggestionApis": []
}`,
    responseBodyExample: `{
  "data": {
    "suggestionApis": []
  }
}`,
    typicalUsage: 'Used by the plugin admin settings page.',
    curlExample: 'curl -X PUT http://localhost:1337/api/webbyblog/settings -H "Content-Type: application/json" -d \'{"suggestionApis": []}\'',
    enabled: true,
  },
];

const getDefaultSettings = () => ({
  suggestionApis: DEFAULT_SUGGESTION_APIS,
});

const mergeSuggestionApis = (defaultsList, storedList) => {
  const stored = Array.isArray(storedList) ? storedList : [];
  const storedById = new Map();

  for (const item of stored) {
    if (!item || typeof item !== 'object') continue;
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    if (!id) continue;
    storedById.set(id, item);
  }

  // Only return defaults (optionally overridden by stored settings).
  // We intentionally DO NOT append stored items that are no longer present in defaults,
  // so deleting a default endpoint from code removes it from the admin UI too.
  return defaultsList.map((def) => {
    const override = storedById.get(def.id);
    return override ? { ...def, ...override } : def;
  });
};

const normalizeSuggestionApis = (value) => {
  if (!Array.isArray(value)) return DEFAULT_SUGGESTION_APIS;

  const seenIds = new Set();
  const normalized = [];

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;

    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    const method = typeof raw.method === 'string' ? raw.method.trim().toUpperCase() : 'GET';
    const path = typeof raw.path === 'string' ? raw.path.trim() : '';
    const description = typeof raw.description === 'string' ? raw.description.trim() : '';
    const auth = typeof raw.auth === 'string' ? raw.auth.trim() : 'public';
    const requestBodyExample =
      typeof raw.requestBodyExample === 'string' ? raw.requestBodyExample : '';
    const responseBodyExample =
      typeof raw.responseBodyExample === 'string' ? raw.responseBodyExample : '';
    const typicalUsage = typeof raw.typicalUsage === 'string' ? raw.typicalUsage : '';
    const curlExample = typeof raw.curlExample === 'string' ? raw.curlExample : '';
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
      enabled,
    });
  }

  return normalized.length ? normalized : DEFAULT_SUGGESTION_APIS;
};

module.exports = ({ strapi }) => ({
  async getSettings() {
    const store = strapi.store({ type: 'plugin', name: 'webbyblog' });
    const stored = (await store.get({ key: 'settings' })) || {};
    const defaults = getDefaultSettings();
    const mergedSuggestionApis = mergeSuggestionApis(
      defaults.suggestionApis,
      stored.suggestionApis
    );

    return {
      ...defaults,
      ...stored,
      suggestionApis: normalizeSuggestionApis(mergedSuggestionApis),
    };
  },

  async updateSettings(settings) {
    const store = strapi.store({ type: 'plugin', name: 'webbyblog' });
    const safeSettings = {
      ...(settings && typeof settings === 'object' ? settings : {}),
    };

    safeSettings.suggestionApis = normalizeSuggestionApis(safeSettings.suggestionApis);

    await store.set({ key: 'settings', value: safeSettings });
    return await store.get({ key: 'settings' });
  },

  async seedDemoData() {
    return await seedDemoData(strapi);
  },
});
