module.exports = [
  'config', '$rootScope', '$q', '$http', '$sce', '$log',
  function MenuService(config, $rootScope, $q, $http, $sce, $log) {

    var Page = function(data) {
      var page=this;
      angular.extend(this,{
        _dfds: {
          ready: $q.defer()
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

    Page.prototype.fetch = function() {
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
        page._dfds.ready.resolve(page);
      });
      return page.promises.ready;
    }

    var Menu = function(data){
      var menu=this;
      angular.extend(menu,{
        _dfds: {
          ready: $q.defer()
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
        menu._setActivePage(toState.params.pageId, toState.params.subPageId);
      });
    }

    Menu.prototype._setActivePage = function(id, subId) {
      // Make sure service is ready
      var menu=this,
          dfd = $q.defer();
      menu.promises.ready.then(function(){
        var page = menu.pagesById[subId] || menu.pagesById[id] || menu.frontPage;
        if ( page ) {
          if ( menu.activePage ) {
            menu.activePage.isActive = false;
            if ( menu.activePage.rootPage ) {
              menu.activePage.rootPage.hasActiveChild = false;
            }
          }
          page.isActive = true;
          if ( page.rootPage ) {
            page.rootPage.hasActiveChild = true;
          }
          var oldPage = menu.activePage;
          menu.activePage = page;
          menu.activePage.promises.ready.then(function(){
            $rootScope.$broadcast("activate:page", page, oldPage);
          });
          dfd.resolve();
        }
      });
      return dfd.promise;
    }

    Menu.prototype.fetch = function() {
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
            fetches.push(page.promises.ready);
          });

          $q.all(fetches).then(function(){
            // 3rd pass, define 1st level pages
            var fetches = [];
            angular.forEach(menu.pages, function(page){
              if ( !page.parent ) {
                page.rootPage = page;
                menu.rootPages.push(page);
              } else if ( !page.isFrontPage ) {
                var url = page.id,
                    p = page;
                while ( p.parent ) {
                  url = p.parent.id + '/' + url;
                  p = p.parent;
                }
                page.rootPage = p;
                page.url = config.href(url);
              }
            });
            menu.rootPages.sort(function(a,b){
              return a.ord > b.ord;
            });
          });

          menu.isReady = true;
          menu._dfds.ready.resolve();
        } else {
          throw new Error('ASS Error: Invalid menu model received from API', res);
        }
      });
      return menu.promises.ready;
    }

    return new Menu({
      apiUrl: config.url('api/menu.json')
    });
  }
];