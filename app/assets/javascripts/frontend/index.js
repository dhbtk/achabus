'use strict';

require('angular').module('achaBus', [require('angular-material'), require('angular-ui-router')])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('home');
        $urlRouterProvider.when('','/');

        $stateProvider.state('home', {
            url: '/',
            controller: 'HomeController as home',
            templateUrl: '/templates/home.html'
        });
        $stateProvider.state('map', {
            url: '/map',
            controller: 'MapController as ctrl',
            templateUrl: '/templates/map.html'
        });
    })
    .controller('MainController', require('./controllers/main-controller'))
    .controller('HomeController', require('./controllers/home-controller'))
    .controller('MapController', require('./controllers/map-controller'));
