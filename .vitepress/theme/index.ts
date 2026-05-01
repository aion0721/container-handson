import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ImageViewer from "@miletorix/vitepress-image-viewer";
import "@miletorix/vitepress-image-viewer/style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    ImageViewer(app);
  },
} satisfies Theme;
