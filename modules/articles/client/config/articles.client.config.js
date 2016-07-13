(function() {
  'use strict';

  // Articles module config
  angular
    .module('articles')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Articles',
      state: 'articles',
      type: 'dropdown',
      roles: ['*']
    });

    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'List Articles',
      state: 'articles.list'
    });

    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'Create Articles',
      state: 'articles.create',
      roles: ['user']
    });
  }
}());
