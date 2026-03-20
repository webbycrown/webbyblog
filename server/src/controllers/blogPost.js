'use strict';

module.exports = ({ strapi }) => {
  // Default populate for blog-post responses (dynamic zone blocks + featured image + taxonomy)
  // If a request explicitly provides `populate` in the query string, we respect it.
  // Note: We intentionally keep nested populates to 1-level deep to avoid recursive explosions:
  // - post -> tags -> posts (shallow)
  // - post -> category -> posts (shallow)
  const shallowPostPopulate = {
    category: true,
    tags: true,
    author: true,
    featured_image: true,
    blocks: { populate: '*' },
  };

  const defaultPopulate = {
    author: true,
    featured_image: true,
    blocks: { populate: '*' },
    category: {
      populate: {
        posts: { populate: shallowPostPopulate },
      },
    },
    tags: {
      populate: {
        posts: { populate: shallowPostPopulate },
      },
    },
  };

  return {
  async getPosts(ctx) {
    try {
      const { query } = ctx;
      const populate = query?.populate ?? defaultPopulate;
      const posts = await strapi.entityService.findMany('plugin::webbyblog.blog-post', {
        ...query,
        populate,
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
      const post = await strapi.entityService.findOne('plugin::webbyblog.blog-post', id, {
        populate,
      });
      if (!post) {
        return ctx.notFound('Post not found');
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
      const posts = await strapi.entityService.findMany('plugin::webbyblog.blog-post', {
        filters: { slug },
        populate,
      });
      if (!posts || posts.length === 0) {
        return ctx.notFound('Post not found');
      }
      ctx.body = { data: posts[0] };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async createPost(ctx) {
    try {
      const { body } = ctx.request;
      const post = await strapi.entityService.create('plugin::webbyblog.blog-post', {
        data: body,
        populate: defaultPopulate,
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
      const post = await strapi.entityService.update('plugin::webbyblog.blog-post', id, {
        data: body,
        populate: defaultPopulate,
      });
      ctx.body = { data: post };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async deletePost(ctx) {
    try {
      const { id } = ctx.params;
      const post = await strapi.entityService.delete('plugin::webbyblog.blog-post', id, {
        populate: defaultPopulate,
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
      const posts = await strapi.entityService.findMany('plugin::webbyblog.blog-post', {
        ...query,
        populate,
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
      const post = await strapi.entityService.findOne('plugin::webbyblog.blog-post', id, {
        populate,
      });
      if (!post) {
        return ctx.notFound('Post not found');
      }
      ctx.body = { data: post };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async create(ctx) {
    try {
      const { body } = ctx.request;
      const post = await strapi.entityService.create('plugin::webbyblog.blog-post', {
        data: body.data || body,
        populate: defaultPopulate,
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
      const post = await strapi.entityService.update('plugin::webbyblog.blog-post', id, {
        data: body.data || body,
        populate: defaultPopulate,
      });
      ctx.body = { data: post };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const post = await strapi.entityService.delete('plugin::webbyblog.blog-post', id, {
        populate: defaultPopulate,
      });
      ctx.body = { data: post };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  };
};
