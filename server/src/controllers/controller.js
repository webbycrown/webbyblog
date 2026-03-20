'use strict';

module.exports = ({ strapi }) => ({
  async getSettings(ctx) {
    try {
      const settings = await strapi
        .plugin('webbyblog')
        .service('service')
        .getSettings();
      ctx.body = { data: settings || {} };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async updateSettings(ctx) {
    try {
      const { body } = ctx.request;
      const settings = await strapi
        .plugin('webbyblog')
        .service('service')
        .updateSettings(body);
      ctx.body = { data: settings };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async health(ctx) {
    ctx.body = {
      status: 'ok',
      plugin: 'webbyblog',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  },
});
