(function () {
  'use strict';

  // Setting up route
  angular
    .module('articles')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('articles.list', {
        url: '',
        templateUrl: 'modules/articles/client/views/article-list.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm'
      })
      .state('articles.create', {
        url: '/create',
        templateUrl: 'modules/articles/client/views/article-create.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('articles.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/articles/client/views/article-edit.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
}());
