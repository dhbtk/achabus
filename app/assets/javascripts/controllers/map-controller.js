mapEditor.controller('MapEditorController',function(uiGmapIsReady, uiGmapGoogleMapApi, $scope, $mdDialog, $mdMedia, $http)
{
	/*
	 * Classes
	 */
	var Route = function(name, color)
	{
		var lineSymbol = { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW };
		this.name = name;
		this.color = color || '#000000';
		this.points = {};
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
	/*
	 * Modelo
	 */

	$scope.map = null;
	var google = {};

	$scope.mapOptions = {
		center: {latitude: -25.53413, longitude: -54.56901},
		zoom: 14,
		options: {
			disableDoubleClickZoom: true,
			disableDefaultUI: false,
			styles:
				[{
					featureType: "poi",
					elementType: "labels",
					stylers: [ { visibility: "off" } ]
				}],
		}
	}

	$scope.kmlLayer = null;

	$scope.streetView = null;

	$scope.model = {
		line: null,
		selectedRoute: null,
		points: {},
		selectedPoint: null,
	};

	/*
	 * Métodos
	 */

  /** Baixa Pontos iniciais **/
  $scope.downloadPoints = function()
  {
    $http.get('/points.json').then(function(points)
    {
      console.log(points);
      $scope.syncPoints(points.data);
    });
  };

  /** Sincroniza o array dos pontos com a visualização do mapa **/
  $scope.syncPoints = function(points)
  {
    points = $.isArray(points) ? points : [points];
    $.each(points, function(i, point)
    {
      if($scope.model.points[point.id] === undefined)
      {
        $scope.model.points[point.id] = {};
      }
      angular.extend($scope.model.points[point.id], point);

      point = $scope.model.points[point.id];

      // Atualizando marcador
      if(!point.marker)
      {
        point.marker = new google.maps.Marker({
          map: $scope.map,
        });
				google.maps.event.addListener(point.marker, 'click', function(e)
				{
					$scope.model.selectedPoint = point;
					$scope.$apply();
				});
      }
      var nums = point.position.split('(')[1].split(' ');
      var lon = parseFloat(nums[0]);
      var lat = parseFloat(nums[1]);
      point.marker.setOptions({
        icon: { // google.maps.Symbol
					strokeColor: '#000099',
					strokeOpacity: 0.6,
					rotation: parseInt(point.heading),
					path: "M 2 7 L 13 0 L 23 7 M 13 0 L 13 13 L 7 13 L 7 21 L 19 21 L 19 13 L 13 13",
					anchor: new google.maps.Point(13, 13),
					scale: 1,
					strokeWeight: 2,
				},
        position: new google.maps.LatLng(lat, lon),
      });
    });
  };

	$scope.deletePoint = function(point)
	{
		if(confirm("Excluir ponto?"))
		{
			if(point.url)
			{
				$http.delete(point.url);
			}
			$scope.model.selectedPoint = null;
			$scope.model.points[point.id] = undefined;
			point.marker.setMap(null);
		}
	};

	/** Menu Linhas **/

	// Linhas -> Abrir linha
	$scope.openLine = function(ev)
	{
		$mdDialog.show({
			controller: OpenLineController,
			templateUrl: 'open-line.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true
		}).then(function(line)
		{
			if(line)
			{
				$scope.model.line = line;
			}
		});
	};

	// Troca de modo de visualização
	$scope.toggleStreetView = function()
	{
		if($scope.streetView == null)
		{
			var pov = $scope.map.getStreetView().getPov();
			// Jogando o mapa pro canto
			$('#map').detach().appendTo('.little-map-container');
			google.maps.event.trigger($scope.map, 'resize');
			if($scope.map.getStreetView().getLocation())
			{
				$scope.map.panTo($scope.map.getStreetView().getLocation().latLng);
			}
			// Abrindo o street view
			$('#street-view').show();
			$scope.streetView = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
			// Puxando o mapa junto quando andamos por aí
			google.maps.event.addListener($scope.streetView, "position_changed", function()
			{
				$scope.map.panTo($scope.streetView.getPosition());
			});
			// Preservando o pov
			$scope.streetView.setPov(pov);
			$scope.map.setStreetView($scope.streetView);
		}
		else
		{
			// Desmontando tudo
			$scope.map.setStreetView(null);
			$('#street-view').html('').hide();
			$scope.streetView = null;

			$('#map').detach().prependTo('.big-map-container');
			google.maps.event.trigger($scope.map, 'resize');
			$scope.map.getStreetView().setVisible(false); // Voltando para o modo normal
		}
	}

	/** Adicionar Ponto **/
	$scope.addPoint = function()
	{
		if($scope.streetView)
		{
			var position = $scope.streetView.getPosition();
			position = 'POINT(' + position.lng() + ' ' + position.lat() + ')';
			var heading = $scope.streetView.getPov().heading;
			var point = {};
			point["point[position]"] = position;
			point["point[heading]"] = heading;
			point["point[notable]"] = false;
			console.log(point);
			$http.post('/points.json',$.param(point), {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }).then(function(data)
      {
        console.log(data);
        $scope.syncPoints(data.data);
      });
		}
		else
		{
			alert('Só podemos adicionar pontos via street view no momento.');
		}
	}

	/*
	 * Inicialização
	 */

	/** API Google Maps **/
	 uiGmapIsReady.promise(1).then(function(instances) {
 		instances.forEach(function(inst) {
 			$scope.map = inst.map;
      $scope.downloadPoints();
			// Handler do modo street view
			google.maps.event.addListener(inst.map.getStreetView(), "visible_changed", function()
			{
				if(inst.map.getStreetView().getVisible() && $scope.streetView === null)
				{
					$scope.toggleStreetView();
				}
			});

			google.maps.event.addListener(inst.map, "click", function(e)
			{
				// Clicar no mapa para ir para lá no modo street view
				if($scope.streetView != null)
				{
					$scope.streetView.setPosition(e.latLng);
				}
				else
				{
					$scope.model.selectedPoint = null;
					$scope.$apply();
				}
			});
 		});
 	});
 	uiGmapGoogleMapApi.then(function(maps) {
 		google.maps = maps;
   });

	/** watches **/

	// mudanças de linha
	$scope.$watch('model.line',function(newVal, oldVal)
	{
    if(!google.maps) return;

		if($scope.kmlLayer != null)
		{
			$scope.kmlLayer.setMap(null);
		}
		var url = new URL($scope.model.line.itinerary_link);
		var kmlUrl;
		if(url.host.match(/www\.google\.com/))
		{
			kmlUrl = "https://www.google.com/maps/d/kml?mid=" + url.search.match(/mid=([^&]+)/)[1] + "&nl=1";
		}
		else
		{
			kmlUrl = url.href + "&output=kml";
		}

		$scope.kmlLayer = new google.maps.KmlLayer({
			url: kmlUrl,
			map: $scope.map,
			suppressInfoWindows: true,
			clickable: false,
			preserveViewport: false,
		});
	});

	// mudanças de ponto selecionado
	$scope.$watch('model.selectedPoint', function(oldVal, newVal)
	{
		if(newVal)
		{
			newVal.marker.setIcon(angular.extend(newVal.marker.getIcon(), {strokeColor: '#000099'}));
		}
		if(oldVal)
		{
			oldVal.marker.setIcon(angular.extend(oldVal.marker.getIcon(), {strokeColor: '#009999'}));
		}
	});
});
