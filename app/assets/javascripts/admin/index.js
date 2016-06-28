/**
 * Created by eduardo on 25/06/16.
 */
'use strict';
require('./theme');

require('./directives/block.js');
require('./controllers');

require('./module').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('home');
    $urlRouterProvider.when('', '/');
    $urlRouterProvider.when('/lines','/lines/index');

    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/templates/admin/home.html'
    });
    $stateProvider.state('lines', {
        url: '/lines',
        abstract: true,
        template: '<div ui-view/>'
    });
    $stateProvider.state('lines.index', {
        url: '/index',
        controller: 'LineListController as ctrl',
        templateUrl: '/templates/admin/lines-index.html'
    });
    $stateProvider.state('lines.show', {
        url: '/:id',
        controller: 'ShowLineController as ctrl',
        templateUrl: '/templates/admin/lines-show.html'
    });
});