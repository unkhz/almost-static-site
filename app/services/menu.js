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
        isRoot:false,
        isActive:false,
        promises:{}
      },data);
      angular.forEach(page._dfds, function(dfd, id){
        page.promises[id] = dfd.promise;
      });
      page.fetch();
    }

    Page.prototype.fetch = function() {
      var page=this;
      $http.get(page.apiUrl)
      .success(function(res){
        page.data = res;
        page.isReady = true;
        page._dfds.ready.resolve(page);
      });
    }

    var Menu = function(data){
      var menu=this;
      angular.extend(menu,{
        _dfds: {
          ready: $q.defer()
        },
        apiUrl:'',
        pages:[],
        pagesById:{},
        rootPage:null,
        activePage:null,
        isReady:false,
        promises:{}
      },data);
      angular.forEach(menu._dfds, function(dfd, id){
        menu.promises[id] = dfd.promise;
      });
      menu.fetch();
      $rootScope.$on('$routeChangeSuccess', function(event,toState) {
        menu._setActivePage(toState.params.pageId);
      });
    }

    Menu.prototype._setActivePage = function(id) {
      // Make sure service is ready
      var menu=this,
          dfd = $q.defer();
      menu.promises.ready.then(function(){
        var page = menu.pagesById[id] || menu.rootPage;
        if ( page ) {
          if ( menu.activePage ) {
            menu.activePage.isActive = false;
          }
          page.isActive = true;
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
          angular.forEach(res.pages, function(pageData, ord){
            var page = new Page(angular.extend(pageData,{
              ord: ord,
              url: config.href(pageData.isRoot ? '' : pageData.id),
              apiUrl: config.url('api/pages/' + $sce.trustAsUrl(pageData.id) + '.json')
            }));

            if ( page.isRoot ) {
              res.rootPage = page;
            }

            menu.pagesById[page.id] = page;
            menu.pages.push(page);
          });
          delete res.pages;
          angular.extend(menu, res);
          menu.isReady = true;
          menu._dfds.ready.resolve();
        } else {
          throw new Error('ASS Error: Invalid menu model received from API', res);
        }
      });
    }

    return new Menu({
      apiUrl: config.url('api/menu.json')
    });
  }
];