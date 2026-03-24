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
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Hands-on Guide",
          link: "/guide/",
        },
        {
          text: "10. Podman 編",
          link: "/guide/10_podman/",
          collapsed: true,
          items: [
            {
              text: "1. コンテナイメージの取得と削除",
              link: "/guide/10_podman/01_image",
            },
            {
              text: "2. コンテナの起動・停止・削除",
              link: "/guide/10_podman/02_container",
            },
            {
              text: "3. コンテナイメージをビルドして修正する",
              link: "/guide/10_podman/03_build",
            },
          ],
        },
        {
          text: "20. Kubernetes 編",
          link: "/guide/20_kubernetes/",
          collapsed: true,
          items: [
            {
              text: "4. k3s を使って簡易的に起動する",
              link: "/guide/20_kubernetes/04_k3s",
            },
            {
              text: "5. Manifest でデプロイする",
              link: "/guide/20_kubernetes/05_manifest",
            },
          ],
        },
        {
          text: "30. アプリ編",
          collapsed: true,
          link: "/guide/30_app/",
          items: [
            {
              text: "6. 最後に簡単なアプリを起動する",
              link: "/guide/30_app/06_simple_app",
            },
          ],
        },
        {
          text: "90. まとめ",
          collapsed: true,
          link: "/guide/90_conclusion/",
          items: [
            { text: "7. まとめ", link: "/guide/90_conclusion/07_summary" },
            {
              text: "8. 次のステップ",
              link: "/guide/90_conclusion/08_next_steps",
            },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/aion0721/container-handson" },
    ],
  },
});
