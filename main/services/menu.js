'use strict';

var angular = require('angular');
//var _ = require('lodash');


module.exports = [
  'config', 'features', '$rootScope', '$q', '$http', '$sce', '$log', '$location',
  function MenuService(config, features, $rootScope, $q, $http, $sce, $log, $location) {

    function Page(data) {
      var page=this;
      angular.extend(this,{
        _dfds: {
          isReady: $q.defer()
        },
        ord:0,
        url:'',
        apiUrl:'',
        isFrontPage:false,
        isActive:false,
        promises:{},
        parent: null,
        children: [],
        features: ['content'],
        childrenById: {},
        rootPage: null
      },data);
      this.title = $sce.trustAsHtml(this.title);
      this.abbr = $sce.trustAsHtml(this.abbr);
      angular.forEach(page._dfds, function(dfd, id){
        page.promises[id] = dfd.promise;
      });
    }

    Page.prototype.fetch = function fetch() {
      var page=this;
      function ready() {
        page.isReady = true;
        page._dfds.isReady.resolve(page);
      }
      if ( page.content === undefined ) {
        $http.get(page.apiUrl)
        .success(function(res){
          page.content = res.content;
          ready();
        });
      } else {
        ready();
      }
      return page.promises.isReady;
    };

    Page.prototype.defineRelations = function() {
      var page=this;

      // Define tree structure
      page.parent = page.menu.pagesById[page.parentId];
      if ( page.parent ) {
        page.parent.children.push(page);
        page.parent.childrenById[page.id] = page;
        var url = page.id,
            p = page,
            level = 0;
        while ( p.parent ) {
          url = p.parent.id + '/' + url;
          p = p.parent;
          level++;
        }
        page.level = level;
        page.rootPage = p;
        page.url = page.isFrontPage ? '' : config.href(url);
      } else {
        page.rootPage = page;
        page.level = 0;
      }
    };

    Page.prototype.initialize = function initialize() {
      var page=this;
      // Convert menu features (String) into FeatureImplementation instances
      if ( page.features && page.features.length ) {
        page.features = features.createImplementations(page, page.features);
      }
      if ( page.styles && page.styles.length ) {
        page.stylesClassName = 'ass-style-' + page.styles.join(' ass-style-');
      } else {
        page.stylesClassName = '';
      }
    };

    Page.prototype.recurseParents = function recurseParents(fn) {
      var p = this;
      while ( p ) {
        fn(p);
        p = p.parent;
      }
    };

    Page.prototype.recurseChildren = function recurseChildren(fn) {
      fn(this);
      if ( this.children && this.children.length ) {
        angular.forEach(this.children, function(p){
          p.recurseChildren(fn);
        });
      }
    };

    Page.prototype.hasActiveChild = function hasActiveChild() {
      return this.children && this.children.length ? this.children.reduce(function(foundOne, p){
        return foundOne || p.isActive || p.hasActiveChild();
      },false) : false;
    };

    function Menu(data){
      var menu=this;
      angular.extend(menu,{
        _dfds: {
          isReady: $q.defer(),
          isComplete:  $q.defer()
        },
        apiUrl:'',
        rootPages:[],
        pages:[],
        pagesById:{},
        frontPage:null,
        activePage:null,
        isReady:false,
        promises:{}
      },data);
      angular.forEach(menu._dfds, function(dfd, id){
        menu.promises[id] = dfd.promise;
      });
      menu.fetch();
      $rootScope.$on('$routeChangeSuccess', function() {
        menu._setActivePage($location.path());
      });
    }

    Menu.prototype._setActivePage = function _setActivePage() {
      // Make sure service isReady before setting active page, so that it's actually available
      var menu=this,
          dfd = $q.defer(),
          path = $location.path().replace(/^\//, '').replace(/\/$/, '').split('/');
      menu.promises.isReady.then(function(){
        var page = menu.pagesById[path[path.length-1]] || menu.frontPage;
        if ( page ) {
          if ( menu.activePage ) {
            menu.activePage.isActive = false;
          }
          page.isActive = true;

          var oldPage = menu.activePage;
          menu.activePage = page;
          menu.activePage.promises.isReady.then(function(){
            $rootScope.$broadcast('activate:page', page, oldPage);
          });
          dfd.resolve();
        }
      });
      return dfd.promise;
    };

    Menu.prototype.fetch = function fetch() {
      var menu=this;
      $http.get(menu.apiUrl)
      .success(function(res){
        if ( res && res.pages ) {
          // 1st pass, get all page definitions
          angular.forEach(res.pages, function(pageData, ord){
            var page = new Page(angular.extend(pageData,{
              ord: pageData.ord !== undefined ? pageData.ord : ord,
              url: config.href(pageData.isFrontPage ? '' : pageData.id),
              apiUrl: config.url(pageData.url),
              menu:menu
            }));

            if ( page.isFrontPage ) {
              menu.frontPage = page;
            }

            menu.pagesById[page.id] = page;
            menu.pages.push(page);
          });

          delete res.pages;
          angular.extend(menu, res);

          // 2nd pass, define page relations
          angular.forEach(menu.pages, function(page){
            page.defineRelations();
            if ( page.level === 0 && !page.isNotDisplayedInMenu ) {
              menu.rootPages.push(page);
            }
          });

          // 3rd pass, initialize pages
          angular.forEach(menu.pages, function(page){
            page.initialize();
          });

          // Sort root pages
          menu.rootPages.sort(function(a,b){
            return a.ord > b.ord;
          });

          // 4th pass, fetch page content
          var fetches = [];
          angular.forEach(menu.pages, function(page){
            page.fetch();
            fetches.push(page.promises.isReady);
          });

          $q.all(fetches).then(function(){
            // Complete
            menu.isComplete = true;
            menu._dfds.isComplete.resolve();
          });

          menu.isReady = true;
          menu._dfds.isReady.resolve();
        } else {
          throw new Error('ASS Error: Invalid menu model received from API', res);
        }
      });
      return menu.promises.isReady;
    };

    return new Menu({
      apiUrl: config.url('api/menu.json')
    });
  }
];