/**
 * Created by eduardo on 21/06/16.
 */
'use strict';

import $ from 'jquery';
import ol from 'openlayers';

class MapController {
    constructor($scope, $q, $http, $interval, $timeout, $state) {
        this.$http = $http;
        this.$q = $q;
        this.loading = true;
        this.map = null;
        this.origin = null;
        this.originText = null;
        this.destination = null;
        this.originLayer = null;
        this.originFeature = null;
        this.destinationLayer = null;
        this.destinationFeature = null;
        this.polylineLayer = null;
        this.markerLayer = null;
        this.destinationText = null;
        this.polylines = [];
        this.markers = [];
        this.walkingPolylines = [];

        let mapWatch = $timeout(() => {
            this.map = new ol.Map({
                controls: [],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                ],
                target: 'map',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: [-54.56901, -25.53413],
                    zoom: 14
                })
            });
            this.loading = false;
            let coords;
            const goToLocation = (coords) => {
                this.origin = coords;
                this.originFeature = new ol.Feature({
                    geometry: new ol.geom.Point([coords.lng, coords.lat]),
                    style: new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 50,
                            fill: new ol.style.Fill({color: '#995000'})
                        })
                    })
                });
                this.originLayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [this.originFeature]
                    })
                });
                this.map.addLayer(this.originLayer);
                this.reverseGeocodeCoords(coords).then(address => this.originText = address);
                this.map.getView().setCenter([coords.lng, coords.lat]);
            };
            if($state.params.location) {
                coords = $state.params.location;
                goToLocation(coords);
            } else {
                navigator.geolocation.getCurrentPosition(pos => {
                    coords = {lat: pos.coords.latitude, lng: pos.coords.longitude};
                    goToLocation(coords);
                });
            }
        }, 500);
    }

    /**
     * Abre e fecha a caixinha de origem
     */
    toggleOrigin() {
        $('#origin-container').toggleClass('show');
    }

    /**
     * Faz o geocoding reverso de uma coordenada.
     *
     * @param latLng
     * @returns {Promise} O endereço
     */
    reverseGeocodeCoords(latLng) {
        const geocoder = new google.maps.Geocoder();
        const def = this.$q.defer();
        geocoder.geocode({location: latLng}, (res, status) => {
            if(status === google.maps.GeocoderStatus.OK) {
                if(res[1]) {
                    console.log(res[1]);
                    def.resolve(res[1].formatted_address);
                } else {
                    def.reject();
                }
            } else {
                def.reject();
            }
        });
        return def.promise;
    }

    setOriginPoint() {
        this.map.once('click', (event) => {
            const coords = {lat: event.coordinate[1], lng: event.coordinate[0]};
            if(this.originLayer) {
                this.map.removeLayer(this.originLayer);
            }
            this.origin = coords;
            this.originFeature = new ol.Feature({
                geometry: new ol.geom.Point([coords.lng, coords.lat]),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 50,
                        fill: new ol.style.Fill({color: '#995000'})
                    })
                })
            });
            this.originLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [this.originFeature]
                })
            });
            this.map.addLayer(this.originLayer);
            this.reverseGeocodeCoords(coords).then(address => this.originText = address);
        });
    }

    setDestinationPoint() {
        this.map.once('click', (event) => {
            const coords = {lat: event.coordinate[1], lng: event.coordinate[0]};
            if(this.destinationLayer) {
                this.map.removeLayer(this.destinationLayer);
            }
            this.destination = coords;
            this.destinationFeature = new ol.Feature({
                geometry: new ol.geom.Point([coords.lng, coords.lat]),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 50,
                        fill: new ol.style.Fill({color: '#009900'})
                    })
                })
            });
            this.destinationLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [this.destinationFeature]
                })
            });
            this.map.addLayer(this.destinationLayer);
            this.reverseGeocodeCoords(coords).then(address => this.destinationText = address);
        });
    }

    traceRoute() {
        if(this.origin && this.destination) {
            this.loading = true;
            this.$http({
                method: 'GET',
                url: '/trace_route.json',
                params: {
                    src_lat: this.origin.lat,
                    src_lon: this.origin.lng,
                    dest_lat: this.destination.lat,
                    dest_lon: this.destination.lng
                }
            }).then((response) => {
                console.log(response.data);
                if(this.polylineLayer) {
                    this.map.removeLayer(this.polylineLayer);
                }
                if(this.markerLayer) {
                    this.map.removeLayer(this.markerLayer);
                }
                const lines = [];
                const markers = [];
                response.data.forEach((step, i) => {
                    if(step.route_path) {
                        const feature = new ol.format.WKT().readFeature(step.route_path);
                        feature.setStyle(new ol.style.Style());
                    }
                });
                return;
                this.polylines.forEach((p) => p.setMap(null));
                this.walkingPolylines.forEach((p) => p.setMap(null));
                this.markers.forEach((p) => p.setMap(null));
                let colors = ['#990000', '#009900', '#990099', '#000099', '#009999'];
                response.data.forEach((step, i) => {
                    if(step.route_path){
                        this.polylines.push(new google.maps.Polyline({
                            map: this.map,
                            path: step.route_path,
                            strokeColor: colors[i]
                        }));
                    }
                    step.stops.forEach((p) => {
                        this.markers.push(new google.maps.Marker({
                            map: this.map,
                            position: p,
                            label: i.toString()
                        }));
                    });
                });
                if(response.data.length > 0) {
                    this.$http({
                        method: 'GET',
                        url: '/walking_path.json',
                        params: {
                            src_lat: this.origin.lat(),
                            src_lon: this.origin.lng(),
                            dest_lat: response.data[0].route_path[0].lat,
                            dest_lon: response.data[0].route_path[0].lng
                        }
                    }).then(data => {
                        console.log(data);
                        this.walkingPolylines.push(new google.maps.Polyline({
                            map: this.map,
                            path: data.data.route,
                            strokeColor: '#DDB1BC'
                        }));
                    });
                    const last_data = response.data[response.data.length - 1];
                    this.walkingPolylines.push(new google.maps.Polyline({
                        map: this.map,
                        path: [this.destination, last_data.route_path[last_data.route_path.length - 1]],
                        strokeColor: '#DDB1BC'
                    }));
                    for(let i = 0; i < response.data.length - 2; i++) {
                        this.walkingPolylines.push(new google.maps.Polyline({
                            map: this.map,
                            path: [response.data[i].route_path[response.data[i].route_path.length - 1], response.data[i + 1].route_path[0]],
                            strokeColor: '#DDB1BC'
                        }));
                    }
                }
            }).finally(() => {
                this.loading = false;
            });
        } else {
            alert('Faltou os dois pontos.');
        }
    }
}
module.exports = MapController;
