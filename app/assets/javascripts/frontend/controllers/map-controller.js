/**
 * Created by eduardo on 21/06/16.
 */
'use strict';

import $ from 'jquery';

class MapController {
    constructor($scope, $q, $http, $interval, $timeout) {
        this.$http = $http;
        this.$q = $q;
        this.loading = true;
        this.map = null;
        this.origin = null;
        this.originText = null;
        this.destination = null;
        this.originMarker = null;
        this.destinationMarker = null;
        this.destinationText = null;
        this.polylines = [];
        this.markers = [];
        this.walkingPolylines = [];

        let mapWatch = $interval(() => {
            if(window.google !== undefined) {
                $interval.cancel(mapWatch);
                $timeout(() => {
                    this.map = new google.maps.Map(document.getElementById('map'), {
                        center: {lat: -25.53413, lng: -54.56901},
                        zoom: 14,
                        options: {
                            disableDoubleClickZoom: true,
                            disableDefaultUI: true,
                            styles: [{
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{visibility: "off"}]
                            }]
                        }
                    });
                    this.loading = false;
                    navigator.geolocation.getCurrentPosition(pos => {
                        const coords = new google.maps.LatLng({lat: pos.coords.latitude, lng: pos.coords.longitude});
                        this.origin = coords;
                        this.originMarker = new google.maps.Marker({
                            clickable: false,
                            map: this.map,
                            position: coords,
                            label: 'S'
                        });
                        this.reverseGeocodeCoords(coords).then(address => this.originText = address);
                    });
                }, 0);
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
        let ev = google.maps.event.addListener(this.map, "click", (event) => {
            if(this.originMarker) {
                this.origin = null;
                this.originMarker.setMap(null);
                this.originMarker = null;
            }
            this.origin = event.latLng;
            this.originMarker = new google.maps.Marker({
                clickable: false,
                map: this.map,
                position: event.latLng,
                label: 'S'
            });
            ev.remove();
            this.reverseGeocodeCoords(event.latLng).then(address => this.originText = address);
        });
    }

    setDestinationPoint() {
        let ev = google.maps.event.addListener(this.map, "click", (event) => {
            if(this.destinationMarker) {
                this.destination = null;
                this.destinationMarker.setMap(null);
                this.destinationMarker = null;
            }
            this.destination = event.latLng;
            this.destinationMarker = new google.maps.Marker({
                clickable: false,
                map: this.map,
                position: event.latLng,
                label: 'F'
            });
            ev.remove();
            this.reverseGeocodeCoords(event.latLng).then(address => this.destinationText = address);
        });
    }

    traceRoute() {
        if(this.origin && this.destination) {
            this.loading = true;
            this.$http({
                method: 'GET',
                url: '/route_tracer/trace.json',
                params: {
                    src_lat: this.origin.lat(),
                    src_lon: this.origin.lng(),
                    dest_lat: this.destination.lat(),
                    dest_lon: this.destination.lng()
                }
            }).then((response) => {
                console.log(response.data);
                this.polylines.forEach((p) => p.setMap(null));
                this.walkingPolylines.forEach((p) => p.setMap(null));
                this.markers.forEach((p) => p.setMap(null));
                let colors = ['#990000', '#009900', '#999900', '#000099'];
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
                this.walkingPolylines.push(new google.maps.Polyline({
                    map: this.map,
                    path: [this.origin, response.data[0].route_path[0]],
                    strokeColor: '#FFD1DC'
                }));
                var last_data = response.data[response.data.length - 1];
                this.walkingPolylines.push(new google.maps.Polyline({
                    map: this.map,
                    path: [this.destination, last_data.route_path[last_data.route_path.length - 1]],
                    strokeColor: '#FFD1DC'
                }));
                for(var i = 0; i < response.data.length - 2; i++) {
                    this.walkingPolylines.push(new google.maps.Polyline({
                        map: this.map,
                        path: [response.data[i].route_path[response.data[i].route_path.length - 1], response.data[i + 1].route_path[0]],
                        strokeColor: '#FFD1DC'
                    }));
                }
            }).finally(() => {
                this.loading = false;
            })
        } else {
            alert('Faltou os dois pontos.');
        }
    }
}
module.exports = MapController;