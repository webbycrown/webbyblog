"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const reactIntl = require("react-intl");
const designSystem = require("@strapi/design-system");
const index = require("./index-Du51rxfB.js");
const CodeBlock = ({ children }) => /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { background: "neutral100", padding: 4, hasRadius: true, borderColor: "neutral200", borderWidth: "1px", children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { as: "pre", fontFamily: "monospace", style: { margin: 0, whiteSpace: "pre-wrap" }, children }) });
const ConfigureContent = () => {
  const { formatMessage } = reactIntl.useIntl();
  const [settings, setSettings] = react.useState({});
  const [loading, setLoading] = react.useState(true);
  const [message, setMessage] = react.useState(null);
  const [detailsOpen, setDetailsOpen] = react.useState(false);
  const [activeIndex, setActiveIndex] = react.useState(null);
  const [page, setPage] = react.useState(1);
  const PAGE_SIZE = 6;
  const suggestionApis = Array.isArray(settings?.suggestionApis) ? settings.suggestionApis : [];
  const pageCount = Math.max(1, Math.ceil(suggestionApis.length / PAGE_SIZE));
  const activeRow = react.useMemo(() => {
    if (typeof activeIndex !== "number") return null;
    if (activeIndex < 0 || activeIndex >= suggestionApis.length) return null;
    return suggestionApis[activeIndex];
  }, [activeIndex, suggestionApis]);
  const pagedRows = react.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return suggestionApis.slice(start, end).map((row, idx) => ({ row, index: start + idx }));
  }, [page, suggestionApis]);
  react.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
    if (page < 1) setPage(1);
  }, [pageCount, suggestionApis.length]);
  react.useEffect(() => {
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
            id: `${index.PLUGIN_ID}.settings.configure.load.error`,
            defaultMessage: "Failed to load settings."
          })
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const openDetails = (index2) => {
    setActiveIndex(index2);
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
      return Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsxRuntime.jsx(
        designSystem.PageLink,
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
      /* @__PURE__ */ jsxRuntime.jsx(
        designSystem.PageLink,
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
    if (left > 2) items.push(/* @__PURE__ */ jsxRuntime.jsx(designSystem.Dots, { children: "…" }, "dots-left"));
    for (let n = left; n <= right; n++) pushPage(n);
    if (right < pageCount - 1) items.push(/* @__PURE__ */ jsxRuntime.jsx(designSystem.Dots, { children: "…" }, "dots-right"));
    pushPage(pageCount);
    return items;
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", children: formatMessage({
      id: `${index.PLUGIN_ID}.settings.configure.loading`,
      defaultMessage: "Loading settings..."
    }) }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
      id: `${index.PLUGIN_ID}.settings.configure.description`,
      defaultMessage: "Configure global settings for the WebbyBlog plugin."
    }) }) }),
    message && /* @__PURE__ */ jsxRuntime.jsx(
      designSystem.Alert,
      {
        closeLabel: "Close",
        title: message.text,
        variant: message.type,
        onClose: () => setMessage(null)
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { paddingTop: 6, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { paddingBottom: 4, children: [
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", children: formatMessage({
          id: `${index.PLUGIN_ID}.settings.suggestionApis.title`,
          defaultMessage: "API Collections"
        }) }),
        /* @__PURE__ */ jsxRuntime.jsx("br", {}),
        /* @__PURE__ */ jsxRuntime.jsx("br", {}),
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
          id: `${index.PLUGIN_ID}.settings.suggestionApis.description`,
          defaultMessage: "Reference for the public endpoints exposed by the WebbyBlog plugin."
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { background: "neutral0", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Table, { colCount: 5, rowCount: pagedRows.length, children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Thead, { children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Tr, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Th, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: formatMessage({
              id: `${index.PLUGIN_ID}.settings.suggestionApis.columns.method`,
              defaultMessage: "Method"
            }) }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Th, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: formatMessage({
              id: `${index.PLUGIN_ID}.settings.suggestionApis.columns.name`,
              defaultMessage: "Name"
            }) }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Th, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: formatMessage({
              id: `${index.PLUGIN_ID}.settings.suggestionApis.columns.path`,
              defaultMessage: "Path"
            }) }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Th, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", children: formatMessage({
              id: `${index.PLUGIN_ID}.settings.suggestionApis.columns.description`,
              defaultMessage: "Summary"
            }) }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Tbody, { children: pagedRows.map(({ row, index: index$1 }) => /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Tr, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Td, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", fontWeight: "bold", textColor: "success600", children: (row?.method || "GET").toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Td, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", children: row?.name || "-" }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Td, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral700", children: row?.path || "-" }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Td, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: row?.description || "-" }) }),
            /* @__PURE__ */ jsxRuntime.jsx(designSystem.Td, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { justifyContent: "flex-end", children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Button, { variant: "tertiary", onClick: () => openDetails(index$1), children: formatMessage({
              id: `${index.PLUGIN_ID}.settings.suggestionApis.showDetails`,
              defaultMessage: "Show details"
            }) }) }) })
          ] }, row?.id || index$1)) })
        ] }),
        suggestionApis.length === 0 && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 3, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
          id: `${index.PLUGIN_ID}.settings.suggestionApis.empty`,
          defaultMessage: "No APIs configured yet."
        }) }) }),
        suggestionApis.length > 0 && pageCount > 1 && /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 4, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { justifyContent: "flex-end", children: /* @__PURE__ */ jsxRuntime.jsxs(
          designSystem.Pagination,
          {
            activePage: page,
            pageCount,
            label: formatMessage({
              id: `${index.PLUGIN_ID}.settings.suggestionApis.pagination`,
              defaultMessage: "Pagination"
            }),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                designSystem.PreviousLink,
                {
                  href: "#",
                  onClick: (e) => handleLinkClick(e, page - 1),
                  "aria-disabled": page === 1
                }
              ),
              renderPageLinks(),
              /* @__PURE__ */ jsxRuntime.jsx(
                designSystem.NextLink,
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
    /* @__PURE__ */ jsxRuntime.jsx(designSystem.Modal.Root, { open: detailsOpen, onOpenChange: setDetailsOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(designSystem.Modal.Header, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Modal.Title, { children: activeRow?.name || formatMessage({
        id: `${index.PLUGIN_ID}.settings.suggestionApis.detailsTitle`,
        defaultMessage: "API details"
      }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx(designSystem.Modal.Body, { children: activeRow ? /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { padding: 4, children: [
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 3, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: activeRow?.description || "" }) }),
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 2, children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "omega", fontWeight: "bold", children: [
          (activeRow?.method || "GET").toUpperCase(),
          " ",
          activeRow?.path || ""
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: [
          "Auth: ",
          activeRow?.auth || "public",
          "."
        ] }) }),
        activeRow?.requestBodyExample ? /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { paddingBottom: 4, children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", children: "Request body" }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 2, children: /* @__PURE__ */ jsxRuntime.jsx(CodeBlock, { children: activeRow.requestBodyExample }) })
        ] }) : null,
        activeRow?.responseBodyExample ? /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { paddingBottom: 4, children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", children: "Successful response (200 OK)" }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 2, children: /* @__PURE__ */ jsxRuntime.jsx(CodeBlock, { children: activeRow.responseBodyExample }) })
        ] }) : null,
        activeRow?.typicalUsage ? /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { paddingBottom: 4, children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", children: "Typical usage" }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 2, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: activeRow.typicalUsage }) })
        ] }) : null,
        activeRow?.curlExample ? /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "delta", children: "curl" }),
          /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingTop: 2, children: /* @__PURE__ */ jsxRuntime.jsx(CodeBlock, { children: activeRow.curlExample }) })
        ] }) : null
      ] }) : /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { padding: 4, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "omega", textColor: "neutral600", children: formatMessage({
        id: `${index.PLUGIN_ID}.settings.suggestionApis.noSelection`,
        defaultMessage: "Select an API row to see details."
      }) }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx(designSystem.Modal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { justifyContent: "flex-end", width: "100%", children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Button, { variant: "secondary", onClick: () => setDetailsOpen(false), children: formatMessage({
        id: `${index.PLUGIN_ID}.settings.suggestionApis.close`,
        defaultMessage: "Close"
      }) }) }) })
    ] }) })
  ] });
};
const Settings = () => {
  const { formatMessage } = reactIntl.useIntl();
  const [activeView, setActiveView] = react.useState("configure");
  const titleId = `${index.PLUGIN_ID}-settings-title`;
  return /* @__PURE__ */ jsxRuntime.jsx(designSystem.Main, { labelledBy: titleId, children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { padding: 8, background: "neutral100", children: [
    /* @__PURE__ */ jsxRuntime.jsx(designSystem.Box, { paddingBottom: 4, children: /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { id: titleId, variant: "alpha", as: "h1", children: formatMessage({
      id: `${index.PLUGIN_ID}.settings.section`,
      defaultMessage: "WebbyBlog"
    }) }) }),
    /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { background: "neutral0", padding: 6, shadow: "filterShadow", hasRadius: true, children: [
      /* @__PURE__ */ jsxRuntime.jsx(designSystem.Flex, { gap: 2, marginBottom: 6, wrap: "wrap", children: /* @__PURE__ */ jsxRuntime.jsx(
        designSystem.Button,
        {
          variant: activeView === "configure" ? "default" : "tertiary",
          onClick: () => setActiveView("configure"),
          children: formatMessage({
            id: `${index.PLUGIN_ID}.settings.configure.title`,
            defaultMessage: "Configure"
          })
        }
      ) }),
      activeView === "configure" && /* @__PURE__ */ jsxRuntime.jsx(ConfigureContent, {})
    ] })
  ] }) });
};
exports.default = Settings;
