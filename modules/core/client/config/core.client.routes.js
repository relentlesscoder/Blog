(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('home', {
        url: '/',
        views: {
          '': {
            templateUrl: 'modules/core/client/views/home.client.view.html',
            controller: 'ArticlesController',
            controllerAs: 'vm'
          },
          'about@home': {
            templateUrl: 'modules/core/client/views/about.client.view.html'
          },
          'archives@home': {
            templateUrl: 'modules/core/client/views/archives.client.view.html',
            controller: 'ArticlesController',
            controllerAs: 'vm'
          }
        },
        data: {
          pageTitle: 'Home'
        }
      })
      .state('archives', {
        url: '/archives/:year/:month',
        views: {
          '': {
            templateUrl: 'modules/articles/client/views/archives.client.view.html',
            controller: 'ArticlesController',
            controllerAs: 'vm'
          },
          'about@archives': {
            templateUrl: 'modules/core/client/views/about.client.view.html'
          },
          'archives@archives': {
            templateUrl: 'modules/core/client/views/archives.client.view.html',
            controller: 'ArticlesController',
            controllerAs: 'vm'
          }
        },
        data: {
          pageTitle: 'Archives'
        }
      })
      .state('article', {
        url: '/article/:articleId',
        views: {
          '': {
            templateUrl: 'modules/articles/client/views/article-detail.client.view.html',
            controller: 'ArticlesController',
            controllerAs: 'vm'
          },
          'about@article': {
            templateUrl: 'modules/core/client/views/about.client.view.html'
          },
          'archives@article': {
            templateUrl: 'modules/core/client/views/archives.client.view.html',
            controller: 'ArticlesController',
            controllerAs: 'vm'
          }
        },
        data: {
          pageTitle: 'Article'
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Not-Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Bad-Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
}());
