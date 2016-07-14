(function() {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesController', ArticlesController);

  ArticlesController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Articles'];

  function ArticlesController($scope, $stateParams, $location, Authentication, Articles) {
    var vm = this;
    $scope.authentication = Authentication;

    // Configure tinymce options
    $scope.tinymceOptions = {
      selector: 'textarea',
      inline: false,
      skin: 'lightgray',
      theme: 'modern',
      plugins: [
        'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
        'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
        'save table contextmenu directionality emoticons template paste textcolor'
      ],
      menubar: 'edit insert view format tools',
      toolbar: ['undo redo cut copy paste | link image | print preview fullscreen',
        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor | formatselect fontselect fontsizeselect '
      ],
      file_browser_callback: function(field_name, url, type, win) {
        // Configure the file browser callback
      }
    };

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
