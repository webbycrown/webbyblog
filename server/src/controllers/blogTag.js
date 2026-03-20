'use strict';

module.exports = ({ strapi }) => {
  // Default populate for blog-tag responses (include related posts and their key relations/components)
  // If a request explicitly provides `populate` in the query string, we respect it.
  // Note: We intentionally keep nested populates to 1-level deep to avoid recursive explosions.
  const shallowPostPopulate = {
    category: true,
    tags: true,
    author: true,
    featured_image: true,
    blocks: { populate: '*' },
  };

  const postPopulateWithTaxonomyPosts = {
    author: true,
    featured_image: true,
    blocks: { populate: '*' },
    category: { populate: { posts: { populate: shallowPostPopulate } } },
    tags: { populate: { posts: { populate: shallowPostPopulate } } },
  };

  const defaultPopulate = {
    posts: {
      populate: {
        ...postPopulateWithTaxonomyPosts,
      },
    },
  };

  return ({
  async getTags(ctx) {
    try {
      const { query } = ctx;
      const populate = query?.populate ?? defaultPopulate;
      const tags = await strapi.entityService.findMany('plugin::webbyblog.blog-tag', {
        ...query,
        populate,
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
      const tag = await strapi.entityService.findOne('plugin::webbyblog.blog-tag', id, { populate });
      if (!tag) {
        return ctx.notFound('Tag not found');
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
      const tags = await strapi.entityService.findMany('plugin::webbyblog.blog-tag', {
        filters: { slug },
        populate,
      });
      if (!tags || tags.length === 0) {
        return ctx.notFound('Tag not found');
      }
      ctx.body = { data: tags[0] };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async createTag(ctx) {
    try {
      const { body } = ctx.request;
      const tag = await strapi.entityService.create('plugin::webbyblog.blog-tag', {
        data: body,
        populate: defaultPopulate,
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
      const tag = await strapi.entityService.update('plugin::webbyblog.blog-tag', id, {
        data: body,
        populate: defaultPopulate,
      });
      ctx.body = { data: tag };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async deleteTag(ctx) {
    try {
      const { id } = ctx.params;
      const tag = await strapi.entityService.delete('plugin::webbyblog.blog-tag', id, {
        populate: defaultPopulate,
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
      const tags = await strapi.entityService.findMany('plugin::webbyblog.blog-tag', {
        ...query,
        populate,
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
      const tag = await strapi.entityService.findOne('plugin::webbyblog.blog-tag', id, { populate });
      if (!tag) {
        return ctx.notFound('Tag not found');
      }
      ctx.body = { data: tag };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async create(ctx) {
    try {
      const { body } = ctx.request;
      const tag = await strapi.entityService.create('plugin::webbyblog.blog-tag', {
        data: body.data || body,
        populate: defaultPopulate,
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
      const tag = await strapi.entityService.update('plugin::webbyblog.blog-tag', id, {
        data: body.data || body,
        populate: defaultPopulate,
      });
      ctx.body = { data: tag };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const tag = await strapi.entityService.delete('plugin::webbyblog.blog-tag', id, {
        populate: defaultPopulate,
      });
      ctx.body = { data: tag };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  });
};
