//= require jquery
//= require lodash/lodash
//= require angular/angular
//= require angular-simple-logger/dist/angular-simple-logger
//= require angular-google-maps/dist/angular-google-maps
//= require angular-route/angular-route
//= require angular-animate/angular-animate
//= require angular-aria/angular-aria
//= require angular-material/angular-material
//= require angular-rails-templates
//= require_tree ./templates
//= require_self
//= require_tree ./controllers

var mapEditor = angular.module('mapEditor',['ngMaterial', 'uiGmapgoogle-maps', 'templates'])
		.config(function(uiGmapGoogleMapApiProvider)
		{
			uiGmapGoogleMapApiProvider.configure({
				libraries: 'drawing,geometry'
			});
		});
