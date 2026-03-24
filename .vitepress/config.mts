import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Container-Handson",
  description: "podman, kuvernetes...",
  base: "/container-handson",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Hands-on Guide",
          items: [
            { text: "はじめに", link: "/guide/" },
            { text: "10. Podman 編", link: "/guide/10_podman/" },
            { text: "20. Kubernetes 編", link: "/guide/20_kubernetes/" },
            { text: "30. アプリ編", link: "/guide/30_app/" },
          ],
        },
      ],
      "/": [
        {
          text: "Examples",
          items: [
            { text: "Markdown Examples", link: "/markdown-examples" },
            { text: "Runtime API Examples", link: "/api-examples" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/aion0721/container-handson" },
    ],
  },
});
