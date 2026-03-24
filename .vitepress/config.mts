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
              text: "11. コンテナイメージの取得と削除",
              link: "/guide/10_podman/11_image",
            },
            {
              text: "12. コンテナの起動・停止・削除",
              link: "/guide/10_podman/12_container",
            },
            {
              text: "13. コンテナイメージをビルドして修正する",
              link: "/guide/10_podman/13_build",
            },
          ],
        },
        {
          text: "20. Kubernetes 編",
          link: "/guide/20_kubernetes/",
          collapsed: true,
          items: [
            {
              text: "21. k3s を使って簡易的に起動する",
              link: "/guide/20_kubernetes/21_k3s",
            },
            {
              text: "22. Manifest でデプロイする",
              link: "/guide/20_kubernetes/22_manifest",
            },
          ],
        },
        {
          text: "30. アプリ編",
          collapsed: true,
          link: "/guide/30_app/",
          items: [
            {
              text: "31. 簡単なアプリ",
              link: "/guide/30_app/31_simple_app",
            },
            {
              text: "32. Java のアプリ",
              link: "/guide/30_app/32_java_app",
            },
            {
              text: "33. 開発環境として利用する",
              link: "/guide/30_app/33_dev_env",
            },
          ],
        },
        {
          text: "90. まとめ",
          collapsed: true,
          link: "/guide/90_conclusion/",
          items: [
            { text: "91. まとめ", link: "/guide/90_conclusion/91_summary" },
            {
              text: "92. 次のステップ",
              link: "/guide/90_conclusion/92_next_steps",
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
