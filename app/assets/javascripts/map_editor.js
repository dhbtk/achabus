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

mapEditor.controller('MapEditorController',function(uiGmapIsReady, uiGmapGoogleMapApi, $scope, $mdDialog, $mdMedia)
{
	var map, maps;
	var google = {};
	uiGmapIsReady.promise(1).then(function(instances) {
		instances.forEach(function(inst) {
			map = inst.map;
		});
	});
	uiGmapGoogleMapApi.then(function(maps) {
		google.maps = maps;
  });
	var Route = function(name, color)
	{
		var lineSymbol = { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW };
		this.name = name;
		this.color = color || '#000000';
		this.points = [];
		this.path = new google.maps.MVCArray();
		this.poly = new google.maps.Polyline({
			map: map,
			strokeColor: '#000000',
			strokeOpacity: 1.0,
			strokeWeight: 5,
			icons: [
				{icon: lineSymbol, offset: '0%'},
				{icon: lineSymbol, offset: '100%'},
				]
		});
	};
	$scope.map = {
		center: {latitude: -25.5531102, longitude: -54.5613718},
		zoom: 14,
		options: {
			disableDoubleClickZoom: true,
			disableDefaultUI: true,
			styles:
				[{
					featureType: "poi",
					elementType: "labels",
					stylers: [ { visibility: "off" } ]
				}],
		}
	}
	$scope.model = {
		routes: [],
		selectedRoute: null,
		points: [],
		selectedPoint: null,
	};

	$scope.loadKmlUrl = function()
	{
		var result = prompt("URL KML:");
		new google.maps.KmlLayer({
			url: result,
			map: map,
			clickable: false
		});
	}

	$scope.openLine = function(ev)
	{
		$mdDialog.show({
			controller: OpenLineController,
			templateUrl: 'open-line.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true
		});
	};
});
