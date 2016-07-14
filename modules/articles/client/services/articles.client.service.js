(function () {
  'use strict';

  angular
    .module('articles')
    .factory('Articles', articlesService);

  articlesService.$inject = ['$resource'];

  function articlesService($resource) {
    // Public API
    return $resource('api/articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
