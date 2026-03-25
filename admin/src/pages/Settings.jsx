import { useState } from 'react';
import { Page, Layouts } from '@strapi/strapi/admin';
import { Box, Button, Flex } from '@strapi/design-system';
import ConfigureContent from '../components/ConfigureContent';
import OverviewContent from '../components/OverviewContent';

const SettingsPage = () => {
  const [activeView, setActiveView] = useState('overview');

  return (
    <Page.Main>
      <Layouts.Header
        title="WebbyBlog"
        subtitle="Complete blog management for Strapi with production-ready content workflows"
        as="h1"
      />
      <Layouts.Content>
        <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
          <Flex gap={2} marginBottom={6} wrap="wrap">
            <Button
              variant={activeView === 'overview' ? 'default' : 'tertiary'}
              onClick={() => setActiveView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeView === 'configure' ? 'default' : 'tertiary'}
              onClick={() => setActiveView('configure')}
            >
              Configure
            </Button>
          </Flex>

          {activeView === 'overview' ? <OverviewContent /> : <ConfigureContent />}
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
};

export default SettingsPage;
