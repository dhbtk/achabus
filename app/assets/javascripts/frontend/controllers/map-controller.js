/**
 * Created by eduardo on 21/06/16.
 */
'use strict';

import $ from 'jquery';
import ol from 'openlayers';

class MapController {
    constructor($scope, $q, $http, $timeout, $state) {
        /**
         * Serviços
         */
        this.$http = $http;
        this.$q = $q;
        this.$timeout = $timeout;
        /**
         * Estado do controller
         */
        this.loading = true;
        this.sidenavOpen = false;
        /**
         * O objeto do mapa
         * @type {ol.Map}
         */
        this.map = null;
        /**
         * Nossas coordenadas
         */
        this.origin = null;
        this.originText = null;
        this.destination = null;
        this.destinationText = null;
        /**
         * Camadas do mapa
         */
        this.originLayer = null;
        this.originFeature = null;
        this.destinationLayer = null;
        this.destinationFeature = null;
        this.polylineLayer = null;
        this.markerLayer = null;
        /**
         * Informação das rotas
         */
        this.routes = [];

        $timeout(() => {
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
     * Abre e fecha nossa sidenav
     */
    toggleSidenav() {
        this.sidenavOpen = !this.sidenavOpen;
        this.$timeout(() => {
            this.map.updateSize();
        }, 25);
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
                        fill: new ol.style.Fill({color: [127,80,0,1]})
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
                        fill: new ol.style.Fill({color: [0,127,0,1]})
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
                if(!this.sidenavOpen) {
                    this.toggleSidenav();
                }
                if(this.polylineLayer) {
                    this.map.removeLayer(this.polylineLayer);
                }
                if(this.markerLayer) {
                    this.map.removeLayer(this.markerLayer);
                }
                const lines = [];
                const points = [];
                //const colors = ['#990000', '#009900', '#990099', '#000099', '#009999'];
                const colors = [[127, 0, 0, 1], [0, 127, 0, 1], [127, 0, 127, 1], [0, 0, 127, 1], [0, 127, 127, 1]];
                response.data.route.forEach((step, i) => {
                    if(step.route_path) {
                        const feature = new ol.format.WKT().readFeature(step.route_path);
                        feature.setStyle(new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: colors[i % (colors.length + 1)],
                                width: 5
                            })
                        }));
                        lines.push(feature);
                    }
                    step.stops.forEach(point => {
                        const feature = new ol.format.WKT().readFeature(point.wkt);
                        feature.setStyle(new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 10,
                                fill: new ol.style.Fill({color: colors[i % (colors.length + 1)]})
                            }),
                            text: new ol.style.Text({
                                text: (i + 1).toString(),
                                fill: new ol.style.Fill({color: [255, 255, 255, 1]})
                            })
                        }));
                        points.push(feature);
                    });
                });
                const walking_lines = response.data.walking_paths.between_routes;
                walking_lines.push(response.data.walking_paths.start);
                walking_lines.push(response.data.walking_paths.finish);
                walking_lines.forEach(line => {
                    const feature = new ol.format.WKT().readFeature(line);
                    feature.setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: [221, 177, 188, 1], // #DDB1BC
                            width: 5
                        })
                    }));
                    lines.push(feature);
                });

                this.polylineLayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: lines
                    })
                });
                this.markerLayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: points
                    })
                });

                this.map.addLayer(this.polylineLayer);
                this.map.addLayer(this.markerLayer);

                this.routes = response.data.route;
            }).finally(() => {
                this.loading = false;
            });
        } else {
            alert('Faltou os dois pontos.');
        }
    }
}
module.exports = MapController;
