'use strict';

import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Alert,
  Box,
  Button,
  Flex,
  Modal,
  Pagination,
  PreviousLink,
  NextLink,
  PageLink,
  Dots,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Typography,
} from '@strapi/design-system';

import { PLUGIN_ID } from '../pluginId';

const CodeBlock = ({ children }) => (
  <Box background="neutral100" padding={4} hasRadius borderColor="neutral200" borderWidth="1px">
    <Typography as="pre" fontFamily="monospace" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
      {children}
    </Typography>
  </Box>
);

const ConfigureContent = () => {
  const { formatMessage } = useIntl();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  const suggestionApis = Array.isArray(settings?.suggestionApis) ? settings.suggestionApis : [];
  const pageCount = Math.max(1, Math.ceil(suggestionApis.length / PAGE_SIZE));

  const activeRow = useMemo(() => {
    if (typeof activeIndex !== 'number') return null;
    if (activeIndex < 0 || activeIndex >= suggestionApis.length) return null;
    return suggestionApis[activeIndex];
  }, [activeIndex, suggestionApis]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return suggestionApis.slice(start, end).map((row, idx) => ({ row, index: start + idx }));
  }, [page, suggestionApis]);

  useEffect(() => {
    // keep page in range when data changes
    if (page > pageCount) setPage(pageCount);
    if (page < 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount, suggestionApis.length]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/webbyblog/settings`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const payload = await response.json();
        setSettings(payload?.data || {});
      } catch (error) {
        setMessage({
          type: 'danger',
          text: formatMessage({
            id: `${PLUGIN_ID}.settings.configure.load.error`,
            defaultMessage: 'Failed to load settings.',
          }),
        });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetails = (index) => {
    setActiveIndex(index);
    setDetailsOpen(true);
  };

  const onPageChange = (nextPage) => {
    const safe = Math.min(Math.max(1, nextPage), pageCount);
    setPage(safe);
  };

  const handleLinkClick = (e, nextPage) => {
    e.preventDefault();
    onPageChange(nextPage);
  };

  const renderPageLinks = () => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <PageLink
          key={n}
          number={n}
          href="#"
          onClick={(e) => handleLinkClick(e, n)}
          aria-current={n === page ? 'page' : undefined}
        />
      ));
    }

    const items = [];
    const pushPage = (n) =>
      items.push(
        <PageLink
          key={n}
          number={n}
          href="#"
          onClick={(e) => handleLinkClick(e, n)}
          aria-current={n === page ? 'page' : undefined}
        />
      );

    const left = Math.max(2, page - 1);
    const right = Math.min(pageCount - 1, page + 1);

    pushPage(1);
    if (left > 2) items.push(<Dots key="dots-left">…</Dots>);
    for (let n = left; n <= right; n++) pushPage(n);
    if (right < pageCount - 1) items.push(<Dots key="dots-right">…</Dots>);
    pushPage(pageCount);

    return items;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="omega">
          {formatMessage({
            id: `${PLUGIN_ID}.settings.configure.loading`,
            defaultMessage: 'Loading settings...',
          })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box paddingBottom={4}>
        <Typography variant="omega" textColor="neutral600">
          {formatMessage({
            id: `${PLUGIN_ID}.settings.configure.description`,
            defaultMessage: 'Configure global settings for the WebbyBlog plugin.',
          })}
        </Typography>
      </Box>

      {message && (
        <Alert
          closeLabel="Close"
          title={message.text}
          variant={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      <Box paddingTop={6}>
        <Box paddingBottom={4}>
          <Typography variant="delta">
            {formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.title`,
              defaultMessage: 'API Collections',
            })}
          </Typography>
          <br/>
          <br/>
          <Typography variant="omega" textColor="neutral600">
            {formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.description`,
              defaultMessage:
                'Reference for the public endpoints exposed by the WebbyBlog plugin.',
            })}
          </Typography>
        </Box>

        <Box background="neutral0">
          <Table colCount={5} rowCount={pagedRows.length}>
            <Thead>
              <Tr>
                <Th>
                  <Typography variant="sigma">
                    {formatMessage({
                      id: `${PLUGIN_ID}.settings.suggestionApis.columns.method`,
                      defaultMessage: 'Method',
                    })}
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">
                    {formatMessage({
                      id: `${PLUGIN_ID}.settings.suggestionApis.columns.name`,
                      defaultMessage: 'Name',
                    })}
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">
                    {formatMessage({
                      id: `${PLUGIN_ID}.settings.suggestionApis.columns.path`,
                      defaultMessage: 'Path',
                    })}
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">
                    {formatMessage({
                      id: `${PLUGIN_ID}.settings.suggestionApis.columns.description`,
                      defaultMessage: 'Summary',
                    })}
                  </Typography>
                </Th>
                {/* <Th>
                  <Typography variant="sigma" textAlign="right">
                    {formatMessage({
                      id: `${PLUGIN_ID}.settings.suggestionApis.columns.actions`,
                      defaultMessage: 'Actions',
                    })}
                  </Typography>
                </Th> */}
              </Tr>
            </Thead>
            <Tbody>
              {pagedRows.map(({ row, index }) => (
                <Tr key={row?.id || index}>
                  <Td>
                    <Typography variant="omega" fontWeight="bold" textColor="success600">
                      {(row?.method || 'GET').toUpperCase()}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography variant="omega">{row?.name || '-'}</Typography>
                  </Td>
                  <Td>
                    <Typography variant="omega" textColor="neutral700">
                      {row?.path || '-'}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography variant="omega" textColor="neutral600">
                      {row?.description || '-'}
                    </Typography>
                  </Td>
                  <Td>
                    <Flex justifyContent="flex-end">
                      <Button variant="tertiary" onClick={() => openDetails(index)}>
                        {formatMessage({
                          id: `${PLUGIN_ID}.settings.suggestionApis.showDetails`,
                          defaultMessage: 'Show details',
                        })}
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {suggestionApis.length === 0 && (
            <Box paddingTop={3}>
              <Typography variant="omega" textColor="neutral600">
                {formatMessage({
                  id: `${PLUGIN_ID}.settings.suggestionApis.empty`,
                  defaultMessage: 'No APIs configured yet.',
                })}
              </Typography>
            </Box>
          )}

          {suggestionApis.length > 0 && pageCount > 1 && (
            <Box paddingTop={4}>
              <Flex justifyContent="flex-end">
                <Pagination
                  activePage={page}
                  pageCount={pageCount}
                  label={formatMessage({
                    id: `${PLUGIN_ID}.settings.suggestionApis.pagination`,
                    defaultMessage: 'Pagination',
                  })}
                >
                  <PreviousLink
                    href="#"
                    onClick={(e) => handleLinkClick(e, page - 1)}
                    aria-disabled={page === 1}
                  />
                  {renderPageLinks()}
                  <NextLink
                    href="#"
                    onClick={(e) => handleLinkClick(e, page + 1)}
                    aria-disabled={page === pageCount}
                  />
                </Pagination>
              </Flex>
            </Box>
          )}
        </Box>
      </Box>

      <Modal.Root open={detailsOpen} onOpenChange={setDetailsOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {activeRow?.name ||
                formatMessage({
                  id: `${PLUGIN_ID}.settings.suggestionApis.detailsTitle`,
                  defaultMessage: 'API details',
                })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {activeRow ? (
              <Box padding={4}>
                <Box paddingBottom={3}>
                  <Typography variant="omega" textColor="neutral600">
                    {activeRow?.description || ''}
                  </Typography>
                </Box>

                <Box paddingBottom={2}>
                  <Typography variant="omega" fontWeight="bold">
                    {(activeRow?.method || 'GET').toUpperCase()} {activeRow?.path || ''}
                  </Typography>
                </Box>

                <Box paddingBottom={4}>
                  <Typography variant="omega" textColor="neutral600">
                    Auth: {activeRow?.auth || 'public'}.
                  </Typography>
                </Box>

                {activeRow?.requestBodyExample ? (
                  <Box paddingBottom={4}>
                    <Typography variant="delta">Request body</Typography>
                    <Box paddingTop={2}>
                      <CodeBlock>{activeRow.requestBodyExample}</CodeBlock>
                    </Box>
                  </Box>
                ) : null}

                {activeRow?.responseBodyExample ? (
                  <Box paddingBottom={4}>
                    <Typography variant="delta">Successful response (200 OK)</Typography>
                    <Box paddingTop={2}>
                      <CodeBlock>{activeRow.responseBodyExample}</CodeBlock>
                    </Box>
                  </Box>
                ) : null}

                {activeRow?.typicalUsage ? (
                  <Box paddingBottom={4}>
                    <Typography variant="delta">Typical usage</Typography>
                    <Box paddingTop={2}>
                      <Typography variant="omega" textColor="neutral600">
                        {activeRow.typicalUsage}
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                {activeRow?.curlExample ? (
                  <Box>
                    <Typography variant="delta">curl</Typography>
                    <Box paddingTop={2}>
                      <CodeBlock>{activeRow.curlExample}</CodeBlock>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            ) : (
              <Box padding={4}>
                <Typography variant="omega" textColor="neutral600">
                  {formatMessage({
                    id: `${PLUGIN_ID}.settings.suggestionApis.noSelection`,
                    defaultMessage: 'Select an API row to see details.',
                  })}
                </Typography>
              </Box>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Flex justifyContent="flex-end" width="100%">
              <Button variant="secondary" onClick={() => setDetailsOpen(false)}>
                {formatMessage({
                  id: `${PLUGIN_ID}.settings.suggestionApis.close`,
                  defaultMessage: 'Close',
                })}
              </Button>
            </Flex>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </Box>
  );
};

export default ConfigureContent;

