//= require_self
//= require angular-rails-templates
//= require_tree ./templates
'use strict';
window.angular = require('angular');
window.gMaps = false;
angular.module('achaBus', [require('angular-material'), require('angular-ui-router'), 'templates'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('home');

        $stateProvider.state('home', {
            url: '/home',
            controller: 'HomeController as home',
            templateUrl: 'home.html'
        });
        $stateProvider.state('map', {
            url: '/map',
            controller: 'MapController as ctrl',
            templateUrl: 'map.html'
        });
    })
    .controller('MainController', require('frontend/controllers/main-controller'))
    .controller('HomeController', require('frontend/controllers/home-controller'))
    .controller('MapController', require('frontend/controllers/map-controller'));
function initMap() {
    window.gMaps = true;
}