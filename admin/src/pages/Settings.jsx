'use strict';

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Main, Box, Flex, Typography, Button } from '@strapi/design-system';

import { PLUGIN_ID } from '../pluginId';
import ConfigureContent from '../components/ConfigureContent';

const Settings = () => {
  const { formatMessage } = useIntl();
  const [activeView, setActiveView] = useState('configure');

  const titleId = `${PLUGIN_ID}-settings-title`;

  return (
    <Main labelledBy={titleId}>
      <Box padding={8} background="neutral100">
        <Box paddingBottom={4}>
          <Typography id={titleId} variant="alpha" as="h1">
            {formatMessage({
              id: `${PLUGIN_ID}.settings.section`,
              defaultMessage: 'WebbyBlog',
            })}
          </Typography>
        </Box>

        <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
          <Flex gap={2} marginBottom={6} wrap="wrap">
            <Button
              variant={activeView === 'configure' ? 'default' : 'tertiary'}
              onClick={() => setActiveView('configure')}
            >
              {formatMessage({
                id: `${PLUGIN_ID}.settings.configure.title`,
                defaultMessage: 'Configure',
              })}
            </Button>
          </Flex>

          {activeView === 'configure' && <ConfigureContent />}
        </Box>
      </Box>
    </Main>
  );
};

export default Settings;
