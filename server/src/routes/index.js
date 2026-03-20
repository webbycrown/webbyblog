'use strict';

const PLUGIN_ID = 'webbyblog';

module.exports = {
  admin: {
    routes: [],
  },
  'content-api': {
    type: 'content-api',
    routes: [
      // Plugin Settings (used by the admin UI)
      {
        method: 'GET',
        path: '/settings',
        handler: 'controller.getSettings',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/settings',
        handler: 'controller.updateSettings',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/health',
        handler: 'controller.health',
        config: {
          auth: false,
          policies: [],
        },
      },
      // Blog Posts - All CRUD actions
      {
        method: 'GET',
        path: '/blog-posts',
        handler: 'blogPost.find',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/blog-posts/:id',
        handler: 'blogPost.findOne',
        config: {
          auth: false,
          policies: [],
        },
      },
      // Blog Posts - Single by slug (clean route)
      {
        method: 'GET',
        path: '/blog-post/:slug',
        handler: 'blogPost.getPostBySlug',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/blog-posts',
        handler: 'blogPost.create',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/blog-posts/:id',
        handler: 'blogPost.update',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'DELETE',
        path: '/blog-posts/:id',
        handler: 'blogPost.delete',
        config: {
          auth: false,
          policies: [],
        },
      },
      // Blog Categories - All CRUD actions
      {
        method: 'GET',
        path: '/blog-categories',
        handler: 'blogCategory.find',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/blog-categories/:id',
        handler: 'blogCategory.findOne',
        config: {
          auth: false,
          policies: [],
        },
      },
      // Blog Categories - Single by slug (clean route)
      {
        method: 'GET',
        path: '/blog-category/:slug',
        handler: 'blogCategory.getCategoryBySlug',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/blog-categories',
        handler: 'blogCategory.create',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/blog-categories/:id',
        handler: 'blogCategory.update',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'DELETE',
        path: '/blog-categories/:id',
        handler: 'blogCategory.delete',
        config: {
          auth: false,
          policies: [],
        },
      },
      // Blog Tags - All CRUD actions
      {
        method: 'GET',
        path: '/blog-tags',
        handler: 'blogTag.find',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/blog-tags/:id',
        handler: 'blogTag.findOne',
        config: {
          auth: false,
          policies: [],
        },
      },
      // Blog Tags - Single by slug (clean route)
      {
        method: 'GET',
        path: '/blog-tag/:slug',
        handler: 'blogTag.getTagBySlug',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/blog-tags',
        handler: 'blogTag.create',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/blog-tags/:id',
        handler: 'blogTag.update',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'DELETE',
        path: '/blog-tags/:id',
        handler: 'blogTag.delete',
        config: {
          auth: false,
          policies: [],
        },
      },
    ],
  },
};
