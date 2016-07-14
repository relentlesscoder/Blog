(function() {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesController', ArticlesController);

  ArticlesController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Articles'];

  function ArticlesController($scope, $stateParams, $location, Authentication, Articles) {
    var vm = this;
    $scope.authentication = Authentication;

    // Create new Article
    $scope.create = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      // Create new Article object
      var article = new Articles({
        title: this.title,
        body: this.content,
        published: true,
        publishDate: new Date()
      });

      article.$save(function(response) {
        $location.path('articles/');

        $scope.title = '';
        $scope.body = '';
        $scope.published = false;
        $scope.publishDate = '';
      }, function(errResponse) {
        $scope.error = errResponse.data.message;
      });
    };

    // Find a list of Articles
    $scope.find = function() {
      $scope.articles = Articles.query();
    };

    // Find an existing Article
    $scope.findOne = function() {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
    };
  }
}());
