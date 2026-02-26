# WebbyBlog Plugin

A complete, production-ready blog solution for Strapi CMS. This plugin provides a comprehensive backend for managing blog functionality without requiring developers to manually create content types, routes, or controllers. Simply install, configure, and start publishing.

## 🎯 Plugin Goal

This plugin is designed to be a **drop-in blog backend layer** for Strapi:

- **Zero Manual Setup**: No need to create content types, routes, or controllers manually
- **Ready-to-Use APIs**: All blog endpoints are pre-built and documented
- **Admin Configuration**: Manage all settings through the Strapi admin panel
- **Production Ready**: Built with security, validation, and best practices in mind

## 📦 Installation

### Local Development

If you're developing locally, you can enable it from the local path:

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'webbyblog': {
    enabled: true,
    resolve: './src/plugins/webbyblog',
  },
});
```

## ⚙️ Initial Setup

1. **Enable the Plugin**: Add the plugin configuration to `config/plugins.js` (see Installation above)

2. **Restart Strapi**: Restart your Strapi server to load the plugin

3. **Access Admin Panel**: 
   - Go to **Strapi Admin → Settings → WebbyBlog**
   - Configure your settings if needed

4. **Start Creating Content**:
   - Navigate to **Content Manager**
   - You'll see **Blog Post**, **Blog Category**, and **Blog Tag** content types
   - Start creating your blog content!

## 🌱 Seed Data

The plugin includes a seed script to populate your blog with demo data. This is useful for:
- Testing the plugin functionality
- Getting started quickly with sample content
- Understanding the data structure

### Running the Seed Script

To seed your blog with demo data, you can use either:

**Using npm script (recommended):**
```bash
npm run seed:blog
```

**Or directly with node:**
```bash
node scripts/seed-blog.js
```

### What Gets Seeded

The seed script creates:

**Categories** (5 categories):
- Technology
- Web Development
- Design
- Business
- Lifestyle

**Tags** (10 tags):
- JavaScript, React, Node.js, CSS, HTML
- Tutorial, Tips, Best Practices
- Beginner, Advanced

**Sample Blog Posts**:
- Multiple blog posts with full content
- Properly linked to categories and tags
- Includes SEO meta fields
- Sample content blocks

### Notes

- The script is **idempotent** - it won't create duplicates. If a category, tag, or post already exists (matched by name/slug), it will be skipped.
- You can run the script multiple times safely.
- The seed data includes realistic content that demonstrates all features of the plugin.

### Seed Script Options

```bash
# Run with help
npm run seed:blog -- --help
# or
node scripts/seed-blog.js --help

# Run in non-interactive mode
npm run seed:blog -- --yes
# or
node scripts/seed-blog.js --yes
```

## 📚 Content Types

The plugin provides three main content types:

### Blog Post
- **Title**: Post title
- **Slug**: Auto-generated URL-friendly identifier
- **Content**: Rich text content
- **Excerpt**: Short description
- **Featured Image**: Main image for the post
- **Category**: Post category (relation)
- **Tags**: Post tags (relation)
- **Author**: Post author (relation to user)
- **Published At**: Publication date
- **Meta Fields**: SEO meta title, description, keywords
- **Views**: View counter

### Blog Category
- **Name**: Category name
- **Slug**: Auto-generated URL-friendly identifier
- **Description**: Category description
- **Posts**: Related posts (relation)

### Blog Tag
- **Name**: Tag name (unique)
- **Slug**: Auto-generated URL-friendly identifier
- **Description**: Tag description
- **Posts**: Related posts (relation)

## 🔌 API Endpoints

The plugin uses Strapi's standard content API structure. All content types are automatically available at their standard endpoints.

### Blog Posts
- `GET /api/blog-posts` - Get all posts (with filters, pagination, sorting)
- `GET /api/blog-posts/:id` - Get post by ID
- `GET /api/blog-post/:slug` - Get post by slug (custom route)
- `POST /api/blog-posts` - Create post (requires authentication)
- `PUT /api/blog-posts/:id` - Update post (requires authentication)
- `DELETE /api/blog-posts/:id` - Delete post (requires authentication)

### Blog Categories
- `GET /api/blog-categories` - Get all categories (with filters, pagination, sorting)
- `GET /api/blog-categories/:id` - Get category by ID
- `GET /api/blog-category/:slug` - Get category by slug
- `POST /api/blog-categories` - Create category (requires authentication)
- `PUT /api/blog-categories/:id` - Update category (requires authentication)
- `DELETE /api/blog-categories/:id` - Delete category (requires authentication)

### Blog Tags
- `GET /api/blog-tags` - Get all tags (with filters, pagination, sorting)
- `GET /api/blog-tags/:id` - Get tag by ID
- `GET /api/blog-tag/:slug` - Get tag by slug
- `POST /api/blog-tags` - Create tag (requires authentication)
- `PUT /api/blog-tags/:id` - Update tag (requires authentication)
- `DELETE /api/blog-tags/:id` - Delete tag (requires authentication)

### Query Parameters

All GET endpoints support Strapi's standard query parameters:
- `?populate=*` - Populate relations
- `?filters[field][$eq]=value` - Filter by field
- `?sort=field:asc` - Sort results
- `?pagination[page]=1` - Pagination
- `?pagination[pageSize]=10` - Page size

Example:
```
GET /api/blog-posts?populate=*&filters[category][slug][$eq]=tech&sort=publishedAt:desc
```

## 🛠️ Development

### Build the Plugin

```bash
cd src/plugins/webbyblog
npm install
npm run build
```

### Watch Mode (Development)

```bash
npm run watch
```

## 📌 Changelog

### 1.0.0

- Initial release: Blog Post / Blog Category / Blog Tag content types
- Ready-to-use REST APIs (including slug-based lookup routes)
- Admin settings page
- Seed script for demo content

## 📝 License

MIT

## 👤 Author

**WebbyCrown**
- Email: info@webbycrown.com
- Website: https://webbycrown.com
