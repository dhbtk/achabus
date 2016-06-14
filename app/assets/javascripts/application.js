// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require lodash/lodash
//= require angular/angular
//= require angular-simple-logger/dist/angular-simple-logger
//= require angular-google-maps/dist/angular-google-maps
//= require angular-ui-router/release/angular-ui-router
//= require angular-animate/angular-animate
//= require angular-aria/angular-aria
//= require angular-material/angular-material
//= require angular-rails-templates
//= require_tree ./templates
//= require_tree ./frontend
//= require_self

angular.module('achaBus', ['ngMaterial', 'ui.router', 'templates'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('');

        $stateProvider.state('home', {
            url: '/',
            controller: 'HomeController as home',
            templateUrl: 'home.html'
        });
    })
    .controller('MainController', MainController)
    .controller('HomeController', HomeController);
