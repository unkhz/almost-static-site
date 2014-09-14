module.exports = [
  'config', '$rootScope', '$q', '$http', '$sce', '$log', '$location',
  function MenuService(config, $rootScope, $q, $http, $sce, $log, $location) {

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
        childrenById: {},
        rootPage: null
      },data);
      angular.forEach(page._dfds, function(dfd, id){
        page.promises[id] = dfd.promise;
      });
    }

    Page.prototype.fetch = function fetch() {
      var page=this;
      $http.get(page.apiUrl)
      .success(function(res){
        page.content = res.content;
        page.parent = page.menu.pagesById[page.parentId];
        if ( page.parent ) {
          page.parent.children.push(page);
          page.parent.childrenById[page.id] = page;
        }
        page.isReady = true;
        page._dfds.isReady.resolve(page);
      });
      return page.promises.isReady;
    }

    Page.prototype.recurseParents = function recurseParents(fn) {
      var p = this;
      while ( p ) {
        fn(p);
        p = p.parent;
      }
    }

    Page.prototype.hasActiveChild = function hasActiveChild() {
      return this.children && this.children.length ? this.children.reduce(function(foundOne, p){
        return foundOne || p.isActive || p.hasActiveChild();
      },false) : false;
    }

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
      $rootScope.$on('$routeChangeSuccess', function(event,toState) {
        menu._setActivePage($location.path());
      });
    }

    Menu.prototype._setActivePage = function _setActivePage(pageUrl) {
      // Make sure service isReady before setting active page, so that it's actually available
      var menu=this,
          dfd = $q.defer(),
          path = pageUrl ? pageUrl.replace(/^\//,'').split('/') : [];
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
            $rootScope.$broadcast("activate:page", page, oldPage);
          });
          dfd.resolve();
        }
      });
      return dfd.promise;
    }

    Menu.prototype.fetch = function fetch() {
      var menu=this;
      $http.get(menu.apiUrl)
      .success(function(res){
        if ( res && res.pages ) {
          // 1st pass, get all pages
          angular.forEach(res.pages, function(pageData, ord){
            var page = new Page(angular.extend(pageData,{
              ord: pageData.ord !== undefined ? pageData.ord : ord,
              url: config.href(pageData.isFrontPage ? '' : pageData.id),
              apiUrl: config.url(pageData.url),
              menu:menu
            }));

            if ( page.isFrontPage ) {
              res.frontPage = page;
            }

            menu.pagesById[page.id] = page;
            menu.pages.push(page);
          });

          delete res.pages;
          angular.extend(menu, res);

          // 2nd pass, fetch page data
          var fetches = [];
          angular.forEach(menu.pages, function(page){
            page.fetch();
            fetches.push(page.promises.isReady);
          });

          $q.all(fetches).then(function(){
            // 3rd pass, define 1st level pages
            var fetches = [];
            angular.forEach(menu.pages, function(page){
              if ( !page.parent ) {
                page.rootPage = page;
                page.level = 0;
                if ( !page.isNotDisplayedInMenu ) {
                  menu.rootPages.push(page);
                }
              } else {
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
              }
            });
            menu.rootPages.sort(function(a,b){
              return a.ord > b.ord;
            });
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
    }

    return new Menu({
      apiUrl: config.url('api/menu.json')
    });
  }
];