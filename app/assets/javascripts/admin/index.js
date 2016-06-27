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

    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/templates/admin/home.html'
    });
    $stateProvider.state('lines', {
        url: '/lines',
        controller: 'LinesController as ctrl',
        templateUrl: '/templates/admin/lines-index.html'
    });
});