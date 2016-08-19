/**
 * Created by eduardo on 01/07/16.
 */
import $ from "jquery";
import angular from "angular";

class PointEditorController {
    constructor($scope, $mdDialog, $mdToast, $http, $timeout, $interval) {
        /*
         * Modelo
         */

        $scope.map = null;
        $scope.icons = {};

        $scope.mapOptions = {
            center: {latitude: -25.53413, longitude: -54.56901},
            zoom: 14,
            options: {
                disableDoubleClickZoom: true,
                disableDefaultUI: false,
                styles: [{
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{visibility: "off"}]
                }]
            }
        };

        $scope.kmlLayer = null;

        $scope.streetView = null;

        $scope.model = {
            points: {},
            selectedPoint: null
        };

        /*
         * Métodos
         */

        /** Baixa Pontos iniciais **/
        $scope.downloadPoints = function () {
            $http.get('/points.json').then(function (points) {
                console.log(points);
                $scope.syncPoints(points.data);
            });
        };

        /** Sincroniza o array dos pontos com a visualização do mapa **/
        $scope.syncPoints = function (points) {
            points = $.isArray(points) ? points : [points];
            $.each(points, function (i, point) {
                if ($scope.model.points[point.id] === undefined) {
                    $scope.model.points[point.id] = {};
                }
                angular.extend($scope.model.points[point.id], point);

                point = $scope.model.points[point.id];

                // Atualizando marcador
                if (!point.marker) {
                    point.marker = new google.maps.Marker({
                        map: $scope.map
                    });
                    google.maps.event.addListener(point.marker, 'click', function (e) {
                        $timeout(function () {
                            $scope.model.selectedPoint = point;
                        });
                    });
                }
                const nums = point.position.split('(')[1].split(' ');
                const lon = parseFloat(nums[0]);
                const lat = parseFloat(nums[1]);
                let color, anchor, path;
                if (point.waypoint) {
                    path = $scope.icons.waypoint.path;
                    anchor = $scope.icons.waypoint.anchor;
                    if ($scope.model.selectedPoint && $scope.model.selectedPoint.id == point.id) {
                        color = $scope.icons.waypoint.selectedColor;
                    }
                    else {
                        color = $scope.icons.waypoint.unselectedColor;
                    }
                }
                else {
                    path = $scope.icons.stop.path;
                    anchor = $scope.icons.stop.anchor;
                    if ($scope.model.selectedPoint && $scope.model.selectedPoint.id == point.id) {
                        color = $scope.icons.stop.selectedColor;
                    }
                    else {
                        color = $scope.icons.stop.unselectedColor;
                    }
                }
                point.marker.setOptions({
                    icon: { // google.maps.Symbol
                        strokeColor: color,
                        strokeOpacity: 0.6,
                        rotation: parseInt(point.heading),
                        path: path,
                        anchor: anchor,
                        scale: 1,
                        strokeWeight: 2
                    },
                    position: new google.maps.LatLng(lat, lon)
                });
            });
        };

        $scope.updatePointIcon = function (point) {
            let color, anchor, path;
            if (point.waypoint) {
                path = $scope.icons.waypoint.path;
                anchor = $scope.icons.waypoint.anchor;
                if ($scope.model.selectedPoint && $scope.model.selectedPoint.id == point.id) {
                    color = $scope.icons.waypoint.selectedColor;
                }
                else {
                    color = $scope.icons.waypoint.unselectedColor;
                }
            }
            else {
                path = $scope.icons.stop.path;
                anchor = $scope.icons.stop.anchor;
                if ($scope.model.selectedPoint && $scope.model.selectedPoint.id == point.id) {
                    color = $scope.icons.stop.selectedColor;
                }
                else {
                    color = $scope.icons.stop.unselectedColor;
                }
            }
            point.marker.setOptions({
                icon: { // google.maps.Symbol
                    strokeColor: color,
                    strokeOpacity: 0.6,
                    rotation: parseInt(point.heading),
                    path: path,
                    anchor: anchor,
                    scale: 1,
                    strokeWeight: 2
                }
            });
        };

        $scope.deletePoint = function (point) {
            if (confirm("Excluir ponto?")) {
                if (point.url) {
                    $http.delete(point.url);
                }
                $scope.model.selectedPoint = null;
                $scope.model.points[point.id] = undefined;
                point.marker.setMap(null);
            }
        };

        // Troca de modo de visualização
        $scope.toggleStreetView = function () {
            if ($scope.streetView === null) {
                const pov = $scope.map.getStreetView().getPov();
                // Jogando o mapa pro canto
                $('#map').detach().appendTo('.little-map-container');
                google.maps.event.trigger($scope.map, 'resize');
                if ($scope.map.getStreetView().getLocation()) {
                    $scope.map.panTo($scope.map.getStreetView().getLocation().latLng);
                }
                // Abrindo o street view
                $('#street-view').show();
                $scope.streetView = new google.maps.StreetViewPanorama(document.getElementById('street-view'));
                // Puxando o mapa junto quando andamos por aí
                google.maps.event.addListener($scope.streetView, "position_changed", function () {
                    $scope.map.panTo($scope.streetView.getPosition());
                });
                // Preservando o pov
                $scope.streetView.setPov(pov);
                $scope.map.setStreetView($scope.streetView);
            }
            else {
                // Desmontando tudo
                $scope.map.setStreetView(null);
                $('#street-view').html('').hide();
                $scope.streetView = null;

                $('#map').detach().prependTo('.big-map-container');
                google.maps.event.trigger($scope.map, 'resize');
                $scope.map.getStreetView().setVisible(false); // Voltando para o modo normal
            }
        };

        /** Adicionar Ponto **/
        $scope.addPoint = function () {
            if ($scope.streetView) {
                let position = $scope.streetView.getPosition();
                position = 'POINT(' + position.lng() + ' ' + position.lat() + ')';
                const heading = $scope.streetView.getPov().heading;
                const point = {};
                point["point[position]"] = position;
                point["point[heading]"] = heading;
                point["point[notable]"] = false;
                console.log(point);
                $http.post('/points.json', $.param(point), {
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
                    }
                }).then(function (data) {
                    console.log(data);
                    $scope.syncPoints(data.data);
                });
            }
            else {
                alert('Só podemos adicionar pontos via street view no momento.');
            }
        };

        $scope.addWaypoint = function (position) {
            const point = {
                point: {
                    position: 'POINT(' + position.lng() + ' ' + position.lat() + ')',
                    waypoint: true,
                    heading: 0,
                    notable: false
                }
            };
            $http.post('/points.json', point).then(function (data) {
                console.log(data);
                $scope.syncPoints(data.data);
            });
        };

        /** Mover ponto **/
        $scope.movePoint = function (id, dir) {
            $http.post('/points/' + id + '/' + dir + '.json').then(function (data) {
                console.log(data);
                $scope.syncPoints(data.data);
            });
        };

        /*
         * Inicialização
         */
        let mapWatch = $interval(() => {
            if(window.google !== undefined) {
                angular.extend($scope.icons, {
                    stop: {
                        selectedColor: "#990000",
                        unselectedColor: "#990099",
                        path: "M 9 5 L 13 0 L 17 5 M 13 0 L 13 13 L 9 13 L 9 21 L 17 21 L 17 13 L 13 13",
                        anchor: new google.maps.Point(13, 21)
                    },
                    waypoint: {
                        selectedColor: "#990000",
                        unselectedColor: "#990099",
                        path: "M 13 13 L 9 13 L 9 21 L 17 21 L 17 13 L 13 13",
                        anchor: new google.maps.Point(13, 21)
                    }
                });
                $scope.map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: -25.53413, lng: -54.56901},
                    zoom: 14,
                    options: {
                        disableDoubleClickZoom: true,
                        disableDefaultUI: false,
                        styles: [{
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{visibility: "off"}]
                        }]
                    }
                });
                $scope.downloadPoints();
                // Handler do modo street view
                google.maps.event.addListener($scope.map.getStreetView(), "visible_changed", function () {
                    if ($scope.map.getStreetView().getVisible() && $scope.streetView === null) {
                        $scope.toggleStreetView();
                    }
                });

                google.maps.event.addListener($scope.map, "click", function (e) {
                    // Clicar no mapa para ir para lá no modo street view
                    if ($scope.streetView !== null) {
                        $scope.streetView.setPosition(e.latLng);
                    }
                    else {
                        $timeout(function () {
                            if (!$scope.model.selectedPoint) {
                                $scope.addWaypoint(e.latLng);
                            }
                            $scope.model.selectedPoint = null;
                        });
                    }
                });
                $interval.cancel(mapWatch);
            }
        }, 500);

        /** watches **/

        // mudanças de ponto selecionado
        $scope.$watch('model.selectedPoint', function (oldVal, newVal) {
            if (newVal) {
                $scope.updatePointIcon(newVal);
            }
            if (oldVal) {
                $scope.updatePointIcon(oldVal);
            }
        });
    }
}

module.exports = PointEditorController;
