"use strict";
const react = require("react");
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const PLUGIN_ID = "webbyblog";
const provideCheckUserHasPermissions = () => {
  const defaultImpl = async () => true;
  if (typeof window !== "undefined") {
    if (!window.checkUserHasPermissions) {
      window.checkUserHasPermissions = defaultImpl;
    }
  }
  if (typeof globalThis !== "undefined") {
    if (!globalThis.checkUserHasPermissions) {
      globalThis.checkUserHasPermissions = defaultImpl;
    }
  }
  if (typeof global !== "undefined") {
    if (!global.checkUserHasPermissions) {
      global.checkUserHasPermissions = defaultImpl;
    }
  }
};
provideCheckUserHasPermissions();
const Initializer = () => {
  const hasInitialized = react.useRef(false);
  react.useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      provideCheckUserHasPermissions();
      try {
        const checkInterval = setInterval(() => {
          if (window.strapi?.app && typeof window.strapi.app.checkUserHasPermissions === "undefined") {
            window.strapi.app.checkUserHasPermissions = async () => true;
            clearInterval(checkInterval);
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5e3);
      } catch (error) {
      }
    }
  }, []);
  return null;
};
if (typeof globalThis !== "undefined") {
  if (!globalThis.checkUserHasPermissions) {
    globalThis.checkUserHasPermissions = async () => true;
  }
}
const index = {
  register(app) {
    if (app && typeof app.checkUserHasPermissions === "undefined") {
      app.checkUserHasPermissions = async () => true;
    }
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      // Use a function for isReady to ensure proper initialization order
      // This helps prevent conflicts with Strapi's core (tours, etc.)
      isReady: () => true,
      name: "WebbyBlog"
    });
    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: {
          id: `${PLUGIN_ID}.settings.section`,
          defaultMessage: "WebbyBlog"
        }
      },
      [
        {
          intlLabel: {
            id: `${PLUGIN_ID}.settings.configure.title`,
            defaultMessage: "Configure"
          },
          id: "configure",
          to: `${PLUGIN_ID}`,
          Component: () => Promise.resolve().then(() => require("./Settings-3DKBWEfm.js")),
          permissions: []
        }
      ]
    );
  },
  bootstrap(app) {
    if (app && typeof app.checkUserHasPermissions === "undefined") {
      app.checkUserHasPermissions = async () => true;
    }
  },
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        if (locale === "en") {
          try {
            const { default: data } = await Promise.resolve().then(() => require("./en-C1kbFGU-.js"));
            return { data, locale };
          } catch {
            return { data: {}, locale };
          }
        }
        try {
          const { default: data } = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./translations/en.json": () => Promise.resolve().then(() => require("./en-C1kbFGU-.js")) }), `./translations/${locale}.json`, 3);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  }
};
exports.PLUGIN_ID = PLUGIN_ID;
exports.index = index;
