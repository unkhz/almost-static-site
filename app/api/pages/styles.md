---
id: styles
title: Styles
abbr: STL
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

```javascript
  .ass-style-gloomy {
    &.ass-menu ul li a {
      background-color:#e3e3f7;
    }
    .ass-mainmenu {
      li a {
        color:#8888aa;
      }
      li.active a {
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
```
```html
  <section id="app" class="ass-app">
    <header id="header" class="page-header ass-header {{styles}}" ng-controller="HeaderCtrl">
      <div class="ass-header-inner" ng-bind-html="content"></div>
    </header>
    <nav id="menu"
      ng-controller="MenuCtrl"
      class="ass-menu {{activeClass}} {{styles}}"
      ng-include="template"
    ></nav>
    <section id="content" class="ass-content" ass-page-transition>
      <div class="ass-content-inner {{styles}}" ng-view ass-transition-element ass-broadcast-long-page></div>
    </section>
    <footer id="footer" class="ass-footer {{styles}}" ng-controller="FooterCtrl" ass-move-away-on-long-page>
      <div class="ass-footer-inner" ng-bind-html="content"></div>
    </footer>
  </section>
```
