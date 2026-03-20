'use strict';

module.exports = ({ strapi }) => {
  // Default populate for blog-category responses (include related posts and their key relations/components)
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
  async getCategories(ctx) {
    try {
      const { query } = ctx;
      const populate = query?.populate ?? defaultPopulate;
      const categories = await strapi.entityService.findMany('plugin::webbyblog.blog-category', {
        ...query,
        populate,
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
      const category = await strapi.entityService.findOne('plugin::webbyblog.blog-category', id, { populate });
      if (!category) {
        return ctx.notFound('Category not found');
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
      const categories = await strapi.entityService.findMany('plugin::webbyblog.blog-category', {
        filters: { slug },
        populate,
      });
      if (!categories || categories.length === 0) {
        return ctx.notFound('Category not found');
      }
      ctx.body = { data: categories[0] };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async createCategory(ctx) {
    try {
      const { body } = ctx.request;
      const category = await strapi.entityService.create('plugin::webbyblog.blog-category', {
        data: body,
        populate: defaultPopulate,
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
      const category = await strapi.entityService.update('plugin::webbyblog.blog-category', id, {
        data: body,
        populate: defaultPopulate,
      });
      ctx.body = { data: category };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async deleteCategory(ctx) {
    try {
      const { id } = ctx.params;
      const category = await strapi.entityService.delete('plugin::webbyblog.blog-category', id, {
        populate: defaultPopulate,
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
      const categories = await strapi.entityService.findMany('plugin::webbyblog.blog-category', {
        ...query,
        populate,
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
      const category = await strapi.entityService.findOne('plugin::webbyblog.blog-category', id, { populate });
      if (!category) {
        return ctx.notFound('Category not found');
      }
      ctx.body = { data: category };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async create(ctx) {
    try {
      const { body } = ctx.request;
      const category = await strapi.entityService.create('plugin::webbyblog.blog-category', {
        data: body.data || body,
        populate: defaultPopulate,
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
      const category = await strapi.entityService.update('plugin::webbyblog.blog-category', id, {
        data: body.data || body,
        populate: defaultPopulate,
      });
      ctx.body = { data: category };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const category = await strapi.entityService.delete('plugin::webbyblog.blog-category', id, {
        populate: defaultPopulate,
      });
      ctx.body = { data: category };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  });
};
