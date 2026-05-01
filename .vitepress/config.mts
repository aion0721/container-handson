import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Container-Handson",
  description: "podman, kubernetes...",
  base: "/container-handson",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],
  themeConfig: {
    logo: {
      src: "/logo.svg",
      alt: "Container-Handson",
      width: 28,
      height: 28,
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Hands-on", link: "/handson/" },
      { text: "Guide", link: "/guide/" },
    ],

    sidebar: {
      "/handson/": [
        {
          text: "Hands-on Guide",
          link: "/handson/",
        },
        {
          text: "10. Podman 編",
          link: "/handson/10_podman/",
          collapsed: true,
          items: [
            {
              text: "11. コンテナイメージの取得と削除",
              link: "/handson/10_podman/11_image",
            },
            {
              text: "12. コンテナの起動・停止・削除",
              link: "/handson/10_podman/12_container",
            },
            {
              text: "13. コンテナイメージをビルドして修正する",
              link: "/handson/10_podman/13_build",
            },
            {
              text: "14. コンテナのメリットを体験",
              link: "/handson/10_podman/14_merit",
            },
          ],
        },
        {
          text: "20. Kubernetes 編",
          link: "/handson/20_kubernetes/",
          collapsed: true,
          items: [
            {
              text: "21. k3s を使って簡易的に起動",
              link: "/handson/20_kubernetes/21_k3s",
            },
            {
              text: "22. Manifest でデプロイ",
              link: "/handson/20_kubernetes/22_manifest",
            },
            {
              text: "23. Service と Ingress で公開",
              link: "/handson/20_kubernetes/23_network",
            },
            {
              text: "24. クラスターのメリットを体験",
              link: "/handson/20_kubernetes/24_merit",
            },
          ],
        },
        {
          text: "30. 発展編",
          collapsed: true,
          link: "/handson/30_app/",
          items: [
            {
              text: "31. 簡単なアプリ",
              link: "/handson/30_app/31_simple_app",
            },
            {
              text: "32. Java のアプリ",
              link: "/handson/30_app/32_java_app",
            },
            {
              text: "33. 開発環境として利用する",
              link: "/handson/30_app/33_dev_env",
            },
          ],
        },
        {
          text: "90. まとめ",
          collapsed: true,
          link: "/handson/90_conclusion/",
          items: [
            { text: "91. まとめ", link: "/handson/90_conclusion/91_summary" },
            {
              text: "92. 次のステップ",
              link: "/handson/90_conclusion/92_next_steps",
            },
          ],
        },
      ],
      "/guide/": [
        {
          text: "Guide",
          link: "/guide/",
        },
        {
          text: "コンテナとは",
          link: "/guide/container",
        },
        {
          text: "k3s とは",
          link: "/guide/k3s",
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/aion0721/container-handson" },
    ],
  },
});
