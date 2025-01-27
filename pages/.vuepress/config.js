import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  title: "MagicMirror² Docker Setup",
  base: "/magicmirror/",
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: "logo.png",
    navbar: [{ text: "Forum", link: "https://forum.magicmirror.builders" }],
    repo: "https://gitlab.com/khassel/magicmirror",
    repoLabel: "GitLab",
    editLink: false,
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
