import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  title: "MagicMirror² Docker Setup",
  base: "/magicmirror/",
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: "logo.png",
    sidebar: [
      {
        text: "Docker setup",
        collapsible: true,
        children: [
          "/",
          "/docs/installation.md",
          "/docs/configuration.md",
          "/docs/images.md",
          "/docs/faq.md",
          "/docs/pi-modules.md",
        ],
      },
    ],
  }),
});
