'use strict';

const blogPost = require('./blog-post');
const blogCategory = require('./blog-category');
const blogTag = require('./blog-tag');

module.exports = {
  'blog-post': blogPost,
  'blog-category': blogCategory,
  'blog-tag': blogTag,
};
