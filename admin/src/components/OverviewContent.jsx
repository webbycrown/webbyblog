import { Box, Grid, Typography, Divider, Flex, Link } from '@strapi/design-system';
import { Mail, Phone } from '@strapi/icons';
import { PLUGIN_ID } from '../pluginId';
import pluginPackage from '../../../package.json';


const BENEFITS = [
  'Complete blog backend for Strapi with posts, categories, and tags.',
  'Faster setup with prebuilt content-types, controllers, routes, and services.',
  'SEO-ready structure with slugs, metadata fields, and publish workflows.',
  'Clean API support for headless frontend builds and custom blog UIs.',
  'Production-focused architecture with validation and extensibility in mind.',
];

const MODULE_FEATURES = [
  {
    title: '1. Blog Post Management',
    points: [
      'Create and manage rich blog posts with title, slug, excerpt, and full content.',
      'Supports relations for category, tags, author, and featured image workflows.',
    ],
  },
  {
    title: '2. Category & Tag Organization',
    points: [
      'Organize posts with dedicated blog categories and tags.',
      'Includes slug-based structures for cleaner SEO and frontend filtering.',
    ],
  },
  {
    title: '3. SEO & Metadata Support',
    points: [
      'Built-in meta title, description, and keywords for better discoverability.',
      'Designed for content teams that need consistent SEO authoring.',
    ],
  },
  {
    title: '4. API-First Headless Delivery',
    points: [
      'Expose blog content through Strapi APIs for web and mobile frontends.',
      'Works with filters, sorting, populate, and pagination query patterns.',
    ],
  },
  {
    title: '5. Seed Data & Developer Experience',
    points: [
      'Includes a seed script to bootstrap demo content quickly.',
      'Helps teams test structure and go live faster with clear conventions.',
    ],
  },
];

const HOW_TO_USE = [
  'Install and enable WebbyBlog in your Strapi project.',
  'Restart Strapi so plugin content-types and routes are registered.',
  'Open Settings > WebbyBlog to review plugin information.',
  `Use ${PLUGIN_ID} content types inside Content Manager.`,
  'Create blog posts, categories, and tags for your publishing flow.',
  'Connect your frontend and start serving blog content via API.',
];

const FAQS = [
  {
    q: 'Is WebbyBlog production-ready?',
    a: 'Yes. It is designed as a production-focused plugin with practical defaults and extensible architecture.',
  },
  {
    q: 'Can I use WebbyBlog with Next.js, Nuxt, or custom frontend apps?',
    a: 'Yes. WebbyBlog is built for headless usage and works with any frontend consuming Strapi APIs.',
  },
  {
    q: 'Does it include prebuilt blog structure out of the box?',
    a: 'Yes. It provides blog posts, categories, and tags so teams can start publishing quickly.',
  },
];

const MORE_APPS = [
  {
    name: 'WebbyCommerce Plugin',
    description: 'Complete ecommerce-ready plugin toolkit for Strapi projects.',
    url: 'https://market.strapi.io/plugins/@webbycrown-webbycommerce',
  },
  {
    name: 'Advanced Fields Plugin',
    description: 'Create cleaner content models with powerful custom field controls.',
    url: 'https://market.strapi.io/plugins/@webbycrown-advanced-fields',
  },
  {
    name: 'Strapi Advanced Sitemap',
    description: 'Generate SEO-focused sitemaps with advanced routing controls.',
    url: 'https://market.strapi.io/plugins/@webbycrown-strapi-advanced-sitemap',
  },
];

const latestVersion = '1.0.0';
const currentVersion = pluginPackage.version;
const hasUpdate = currentVersion !== latestVersion;

const SectionCard = ({ title, children }) => (
  <Box background="neutral0" borderColor="neutral150" hasRadius padding={6} shadow="filterShadow">
    {title ? (
      <>
        <Typography variant="delta" tag="h2">
          {title}
        </Typography>
        <Box paddingTop={4}>{children}</Box>
      </>
    ) : (
      children
    )}
  </Box>
);

const StepCard = ({ index, text }) => (
  <Box background="neutral0" borderColor="neutral200" hasRadius padding={4} shadow="tableShadow" style={{width:"100%"}}>
    <Box
      background="primary100"
      borderColor="primary200"
      hasRadius
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
      width="fit-content"
    >
      <Typography variant="pi" fontWeight="bold" textColor="primary700">
        Step {index}
      </Typography>
    </Box>
    <Box paddingTop={3}>
      <Typography variant="omega" textColor="neutral700">
        {text}
      </Typography>
    </Box>
  </Box>
);

const OverviewContent = () => {
  return (
    <>
      <Grid.Root gap={6}>
        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard title="1. Introduction & Overview">
            <Flex alignItems="flex-start" gap={6} wrap="wrap">
              <Box style={{ flex: 1, minWidth: '320px' }}>
                <Flex direction="column" gap={2} alignItems="flex-start">
                  <Typography variant="omega" textColor="neutral700">
                    <strong>Plugin Name:</strong> WebbyBlog
                  </Typography>
                  <Typography variant="omega" textColor="neutral600">
                    <strong>Description:</strong> WebbyBlog is a complete blog-ready Strapi plugin
                    that helps teams manage posts, categories, tags, metadata, and publishing
                    workflows from one admin ecosystem.
                  </Typography>
                  <Box paddingTop={1}>
                    <Typography variant="delta" tag="h3">
                      Key Benefits
                    </Typography>
                    <Box as="ul" paddingTop={2} paddingLeft={5}>
                      {BENEFITS.map((benefit) => (
                        <Box as="li" key={benefit} paddingBottom={2}>
                          <Typography variant="omega" textColor="neutral700">
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Flex>
              </Box>
              {/* <Box style={{ flex: 1, minWidth: '320px' }}>
                <Flex direction="column" gap={3} alignItems="flex-start">
                  <Link href={VIDEO_LINK} isExternal>
                    <Box
                      as="img"
                      src={VIDEO_PREVIEW_IMAGE}
                      alt="WebbyBlog video preview"
                      width="100%"
                      style={{ maxWidth: '500px', borderRadius: '8px', border: '1px solid #dcdce4' }}
                    />
                  </Link>
                  <Typography variant="omega">
                    Video link:{' '}
                    <Link href={VIDEO_LINK} isExternal>
                      {VIDEO_LINK}
                    </Link>
                  </Typography>
                </Flex>
              </Box> */}
            </Flex>
          </SectionCard>
        </Grid.Item>

        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard title="Version Information">
            <Typography variant="omega" textColor="neutral700">
              <strong>Current Installed Version:</strong> {currentVersion}
            </Typography>
            <Box paddingTop={2}>
              <Typography variant="omega" textColor={hasUpdate ? 'warning600' : 'success600'}>
                {hasUpdate
                  ? 'Update available. Please consider upgrading to the latest version.'
                  : 'You are on the latest version.'}
              </Typography>
            </Box>
          </SectionCard>
        </Grid.Item>

        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard title="How to Use">
            <Grid.Root gap={4}>
              
              {HOW_TO_USE.map((step, idx) => (
                <Grid.Item key={step} col={4} s={12} xs={12} style={{width:"100%"}} >
                  <StepCard index={idx + 1} text={step} />
                </Grid.Item>
              ))}
            </Grid.Root>
          </SectionCard>
        </Grid.Item>

        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard title="2. Modules & Features">
            <Grid.Root gap={6}>
             
              <Grid.Item col={7} s={12} xs={12}>
                <Box>
                  {MODULE_FEATURES.map((feature) => (
                    <Box key={feature.title} paddingBottom={5}>
                      <Typography variant="delta" tag="h3">
                        {feature.title}
                      </Typography>
                      <Box as="ul" paddingLeft={5} paddingTop={2}>
                        {feature.points.map((point) => (
                          <Box as="li" key={point} paddingBottom={2}>
                            <Typography variant="omega" textColor="neutral700">
                              {point}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid.Item>
            </Grid.Root>
          </SectionCard>
        </Grid.Item>

        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard title="3. FAQs">
            {FAQS.map((item) => (
              <Box key={item.q} paddingBottom={4}>
                <Typography variant="delta" tag="h3">
                  {item.q}
                </Typography>
                <Box paddingTop={2}>
                  <Typography variant="omega" textColor="neutral700">
                    {item.a}
                  </Typography>
                </Box>
              </Box>
            ))}
          </SectionCard>
        </Grid.Item>

        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard title="Explore More Powerful Plugins">
            <Grid.Root gap={4}>
              {MORE_APPS.map((app) => (
                <Grid.Item key={app.name} col={4} s={12} xs={12}>
                  <Box
                    as="a"
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    background="neutral0"
                    borderColor="neutral200"
                    hasRadius
                    padding={5}
                    shadow="tableShadow"
                    style={{ textDecoration: 'none', display: 'block', minHeight: '140px',width: '100%' }}
                  >
                    <Typography variant="delta" tag="h3" textColor="primary600">
                      {app.name}
                    </Typography>
                    <Box paddingTop={2}>
                      <Typography variant="omega" textColor="neutral700">
                        {app.description}
                      </Typography>
                    </Box>
                    <Box paddingTop={3}>
                      <Typography variant="pi" textColor="primary600">
                        View Plugin
                      </Typography>
                    </Box>
                  </Box>
                </Grid.Item>
              ))}
            </Grid.Root>
          </SectionCard>
        </Grid.Item>

        <Grid.Item col={12} s={12} xs={12}>
          <SectionCard>
            <Typography variant="beta">Thank You for Visiting the WebbyBlog Plugin!</Typography>
            <Box paddingTop={4}>
              <Grid.Root gap={4}>
                <Grid.Item col={6} s={12} xs={12}>
                  <Box
                    background="primary100"
                    borderColor="primary200"
                    hasRadius
                    padding={5}
                    style={{ minHeight: '130px' }}
                  >
                    <Box display="flex" alignItems="center" gap={3}>
                      <Phone width="20px" height="20px" fill="#4945ff" />
                      <Typography variant="beta">Have Any Question ?</Typography>
                    </Box>
                    <Box paddingTop={3}>
                      <Typography variant="omega">
                        <Typography as="span" variant="omega" textColor="primary600">
                          Sales :
                        </Typography>{' '}
                        +91 (942) 867-7503
                      </Typography>
                    </Box>
                  </Box>
                </Grid.Item>

                <Grid.Item col={6} s={12} xs={12}>
                  <Box
                    background="primary100"
                    borderColor="primary200"
                    hasRadius
                    padding={5}
                    style={{ minHeight: '130px' }}
                  >
                    <Box display="flex" alignItems="center" gap={3}>
                      <Mail width="20px" height="20px" fill="#4945ff" />
                      <Typography variant="beta">Write &amp; Send Email</Typography>
                    </Box>
                    <Box paddingTop={3}>
                      <Typography variant="omega">
                        <Typography as="span" variant="omega" textColor="primary600">
                          Sales :
                        </Typography>{' '}
                        <Link href="mailto:sales@webbycrown.com">sales@webbycrown.com</Link>
                      </Typography>
                    </Box>
                    <Box paddingTop={2}>
                      <Typography variant="omega">
                        <Typography as="span" variant="omega" textColor="primary600">
                          Support :
                        </Typography>{' '}
                        <Link href="mailto:info@webbycrown.com">info@webbycrown.com</Link>
                      </Typography>
                    </Box>
                  </Box>
                </Grid.Item>
              </Grid.Root>
            </Box>
          </SectionCard>
        </Grid.Item>
      </Grid.Root>

      <Box paddingTop={6}>
        <Divider />
      </Box>
    </>
  );
};

export default OverviewContent;
