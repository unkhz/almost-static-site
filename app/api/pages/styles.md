---
id: styles
title: Styles
ord: 5
styles:
  - example
  - gloomy
features:
  - content
---
## Dynamic Style Definitions

This page demonstrates the possibility to define styles that affect the different page features. Each style component has it's own main scss file in styles folder.

<span class="l-test">E.g. this content line has class *l-test* and is styled with the following CSS:</span>

    .ass-style-example .l-test {
      color:red;
    }


The whole page is colored with *gloomy* style, defined in *api/styles/gloomy.scss* with the following SCSS:

    .ass-style-gloomy {
      &.ass-menu ul li a {
        background-color:#e3e3f7;
      }
      .ass-mainmenu {
        li a {
          color:#8888aa;
        }
        li.ass-is-active a {
          color:#000088;
        }
      }
      &.ass-header,
      .ass-footer-inner {
        background-color:#c3c3e7;
        color:#1c1c6b;
      }
      &.ass-content-inner {
        background-color:#e3e3f7;
        overflow:hidden;
      }
    }
