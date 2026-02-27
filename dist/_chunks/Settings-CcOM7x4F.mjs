import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { Box, Typography, Alert, Table, Thead, Tr, Th, Tbody, Td, Flex, Button, Pagination, PreviousLink, NextLink, Modal, PageLink, Dots, Main } from "@strapi/design-system";
import { P as PLUGIN_ID } from "./index-ZVDjkal2.mjs";
const CodeBlock = ({ children }) => /* @__PURE__ */ jsx(Box, { background: "neutral100", padding: 4, hasRadius: true, borderColor: "neutral200", borderWidth: "1px", children: /* @__PURE__ */ jsx(Typography, { as: "pre", fontFamily: "monospace", style: { margin: 0, whiteSpace: "pre-wrap" }, children }) });
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
    if (typeof activeIndex !== "number") return null;
    if (activeIndex < 0 || activeIndex >= suggestionApis.length) return null;
    return suggestionApis[activeIndex];
  }, [activeIndex, suggestionApis]);
  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return suggestionApis.slice(start, end).map((row, idx) => ({ row, index: start + idx }));
  }, [page, suggestionApis]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
    if (page < 1) setPage(1);
  }, [pageCount, suggestionApis.length]);
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/webbyblog/settings`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const payload = await response.json();
        setSettings(payload?.data || {});
      } catch (error) {
        setMessage({
          type: "danger",
          text: formatMessage({
            id: `${PLUGIN_ID}.settings.configure.load.error`,
            defaultMessage: "Failed to load settings."
          })
        });
      } finally {
        setLoading(false);
      }
    })();
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
      return Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsx(
        PageLink,
        {
          number: n,
          href: "#",
          onClick: (e) => handleLinkClick(e, n),
          "aria-current": n === page ? "page" : void 0
        },
        n
      ));
    }
    const items = [];
    const pushPage = (n) => items.push(
      /* @__PURE__ */ jsx(
        PageLink,
        {
          number: n,
          href: "#",
          onClick: (e) => handleLinkClick(e, n),
          "aria-current": n === page ? "page" : void 0
        },
        n
      )
    );
    const left = Math.max(2, page - 1);
    const right = Math.min(pageCount - 1, page + 1);
    pushPage(1);
    if (left > 2) items.push(/* @__PURE__ */ jsx(Dots, { children: "…" }, "dots-left"));
    for (let n = left; n <= right; n++) pushPage(n);
    if (right < pageCount - 1) items.push(/* @__PURE__ */ jsx(Dots, { children: "…" }, "dots-right"));
    pushPage(pageCount);
    return items;
  };
  if (loading) {
    return /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Typography, { variant: "omega", children: formatMessage({
      id: `${PLUGIN_ID}.settings.configure.loading`,
      defaultMessage: "Loading settings..."
    }) }) });
  }
  return /* @__PURE__ */ jsxs(Box, { children: [
    /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
      id: `${PLUGIN_ID}.settings.configure.description`,
      defaultMessage: "Configure global settings for the WebbyBlog plugin."
    }) }) }),
    message && /* @__PURE__ */ jsx(
      Alert,
      {
        closeLabel: "Close",
        title: message.text,
        variant: message.type,
        onClose: () => setMessage(null)
      }
    ),
    /* @__PURE__ */ jsxs(Box, { paddingTop: 6, children: [
      /* @__PURE__ */ jsxs(Box, { paddingBottom: 4, children: [
        /* @__PURE__ */ jsx(Typography, { variant: "delta", children: formatMessage({
          id: `${PLUGIN_ID}.settings.suggestionApis.title`,
          defaultMessage: "API Collections"
        }) }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
          id: `${PLUGIN_ID}.settings.suggestionApis.description`,
          defaultMessage: "Reference for the public endpoints exposed by the WebbyBlog plugin."
        }) })
      ] }),
      /* @__PURE__ */ jsxs(Box, { background: "neutral0", children: [
        /* @__PURE__ */ jsxs(Table, { colCount: 5, rowCount: pagedRows.length, children: [
          /* @__PURE__ */ jsx(Thead, { children: /* @__PURE__ */ jsxs(Tr, { children: [
            /* @__PURE__ */ jsx(Th, { children: /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.columns.method`,
              defaultMessage: "Method"
            }) }) }),
            /* @__PURE__ */ jsx(Th, { children: /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.columns.name`,
              defaultMessage: "Name"
            }) }) }),
            /* @__PURE__ */ jsx(Th, { children: /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.columns.path`,
              defaultMessage: "Path"
            }) }) }),
            /* @__PURE__ */ jsx(Th, { children: /* @__PURE__ */ jsx(Typography, { variant: "sigma", children: formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.columns.description`,
              defaultMessage: "Summary"
            }) }) })
          ] }) }),
          /* @__PURE__ */ jsx(Tbody, { children: pagedRows.map(({ row, index }) => /* @__PURE__ */ jsxs(Tr, { children: [
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Typography, { variant: "omega", fontWeight: "bold", textColor: "success600", children: (row?.method || "GET").toUpperCase() }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Typography, { variant: "omega", children: row?.name || "-" }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral700", children: row?.path || "-" }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: row?.description || "-" }) }),
            /* @__PURE__ */ jsx(Td, { children: /* @__PURE__ */ jsx(Flex, { justifyContent: "flex-end", children: /* @__PURE__ */ jsx(Button, { variant: "tertiary", onClick: () => openDetails(index), children: formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.showDetails`,
              defaultMessage: "Show details"
            }) }) }) })
          ] }, row?.id || index)) })
        ] }),
        suggestionApis.length === 0 && /* @__PURE__ */ jsx(Box, { paddingTop: 3, children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
          id: `${PLUGIN_ID}.settings.suggestionApis.empty`,
          defaultMessage: "No APIs configured yet."
        }) }) }),
        suggestionApis.length > 0 && pageCount > 1 && /* @__PURE__ */ jsx(Box, { paddingTop: 4, children: /* @__PURE__ */ jsx(Flex, { justifyContent: "flex-end", children: /* @__PURE__ */ jsxs(
          Pagination,
          {
            activePage: page,
            pageCount,
            label: formatMessage({
              id: `${PLUGIN_ID}.settings.suggestionApis.pagination`,
              defaultMessage: "Pagination"
            }),
            children: [
              /* @__PURE__ */ jsx(
                PreviousLink,
                {
                  href: "#",
                  onClick: (e) => handleLinkClick(e, page - 1),
                  "aria-disabled": page === 1
                }
              ),
              renderPageLinks(),
              /* @__PURE__ */ jsx(
                NextLink,
                {
                  href: "#",
                  onClick: (e) => handleLinkClick(e, page + 1),
                  "aria-disabled": page === pageCount
                }
              )
            ]
          }
        ) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Modal.Root, { open: detailsOpen, onOpenChange: setDetailsOpen, children: /* @__PURE__ */ jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsx(Modal.Header, { children: /* @__PURE__ */ jsx(Modal.Title, { children: activeRow?.name || formatMessage({
        id: `${PLUGIN_ID}.settings.suggestionApis.detailsTitle`,
        defaultMessage: "API details"
      }) }) }),
      /* @__PURE__ */ jsx(Modal.Body, { children: activeRow ? /* @__PURE__ */ jsxs(Box, { padding: 4, children: [
        /* @__PURE__ */ jsx(Box, { paddingBottom: 3, children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: activeRow?.description || "" }) }),
        /* @__PURE__ */ jsx(Box, { paddingBottom: 2, children: /* @__PURE__ */ jsxs(Typography, { variant: "omega", fontWeight: "bold", children: [
          (activeRow?.method || "GET").toUpperCase(),
          " ",
          activeRow?.path || ""
        ] }) }),
        /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxs(Typography, { variant: "omega", textColor: "neutral600", children: [
          "Auth: ",
          activeRow?.auth || "public",
          "."
        ] }) }),
        activeRow?.requestBodyExample ? /* @__PURE__ */ jsxs(Box, { paddingBottom: 4, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "delta", children: "Request body" }),
          /* @__PURE__ */ jsx(Box, { paddingTop: 2, children: /* @__PURE__ */ jsx(CodeBlock, { children: activeRow.requestBodyExample }) })
        ] }) : null,
        activeRow?.responseBodyExample ? /* @__PURE__ */ jsxs(Box, { paddingBottom: 4, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "delta", children: "Successful response (200 OK)" }),
          /* @__PURE__ */ jsx(Box, { paddingTop: 2, children: /* @__PURE__ */ jsx(CodeBlock, { children: activeRow.responseBodyExample }) })
        ] }) : null,
        activeRow?.typicalUsage ? /* @__PURE__ */ jsxs(Box, { paddingBottom: 4, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "delta", children: "Typical usage" }),
          /* @__PURE__ */ jsx(Box, { paddingTop: 2, children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: activeRow.typicalUsage }) })
        ] }) : null,
        activeRow?.curlExample ? /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(Typography, { variant: "delta", children: "curl" }),
          /* @__PURE__ */ jsx(Box, { paddingTop: 2, children: /* @__PURE__ */ jsx(CodeBlock, { children: activeRow.curlExample }) })
        ] }) : null
      ] }) : /* @__PURE__ */ jsx(Box, { padding: 4, children: /* @__PURE__ */ jsx(Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
        id: `${PLUGIN_ID}.settings.suggestionApis.noSelection`,
        defaultMessage: "Select an API row to see details."
      }) }) }) }),
      /* @__PURE__ */ jsx(Modal.Footer, { children: /* @__PURE__ */ jsx(Flex, { justifyContent: "flex-end", width: "100%", children: /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setDetailsOpen(false), children: formatMessage({
        id: `${PLUGIN_ID}.settings.suggestionApis.close`,
        defaultMessage: "Close"
      }) }) }) })
    ] }) })
  ] });
};
const Settings = () => {
  const { formatMessage } = useIntl();
  const [activeView, setActiveView] = useState("configure");
  const titleId = `${PLUGIN_ID}-settings-title`;
  return /* @__PURE__ */ jsx(Main, { labelledBy: titleId, children: /* @__PURE__ */ jsxs(Box, { padding: 8, background: "neutral100", children: [
    /* @__PURE__ */ jsx(Box, { paddingBottom: 4, children: /* @__PURE__ */ jsx(Typography, { id: titleId, variant: "alpha", as: "h1", children: formatMessage({
      id: `${PLUGIN_ID}.settings.section`,
      defaultMessage: "WebbyBlog"
    }) }) }),
    /* @__PURE__ */ jsxs(Box, { background: "neutral0", padding: 6, shadow: "filterShadow", hasRadius: true, children: [
      /* @__PURE__ */ jsx(Flex, { gap: 2, marginBottom: 6, wrap: "wrap", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: activeView === "configure" ? "default" : "tertiary",
          onClick: () => setActiveView("configure"),
          children: formatMessage({
            id: `${PLUGIN_ID}.settings.configure.title`,
            defaultMessage: "Configure"
          })
        }
      ) }),
      activeView === "configure" && /* @__PURE__ */ jsx(ConfigureContent, {})
    ] })
  ] }) });
};
export {
  Settings as default
};
