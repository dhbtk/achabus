/**
 * Created by eduardo on 21/06/16.
 */
'use strict';

class MapController {
    constructor($scope, $http, $interval) {
        this.$http = $http;
        this.loading = true;
        this.map = null;
        this.origin = null;
        this.destination = null;
        this.originMarker = null;
        this.destinationMarker = null;
        this.polylines = [];
        this.markers = [];

        let self = this;
        let mapWatch = $interval(() => {
            if(window.google !== undefined) {
                self.map = new google.maps.Map(document.getElementById('map'), {
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
                self.loading = false;
                $interval.cancel(mapWatch);
            }
        }, 500);
    }

    setOriginPoint() {
        let ev = google.maps.event.addListener(this.map, "click", (event) => {
            this.loading = true;
            this.$http({
                method: 'GET',
                url: '/route_points/closest_to.json',
                params: {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }
            }).then((response) => {
                if(this.originMarker) {
                    this.origin = null;
                    this.originMarker.setMap(null);
                    this.originMarker = null;
                }
                this.origin = response.data;
                this.originMarker = new google.maps.Marker({
                    clickable: false,
                    map: this.map,
                    position: {lat: response.data.point.lat, lng: response.data.point.lng}
                });
            }).finally(() => {
                this.loading = false;
                ev.remove();
            })
        });
    }

    setDestinationPoint() {
        let ev = google.maps.event.addListener(this.map, "click", (event) => {
            this.loading = true;
            this.$http({
                method: 'GET',
                url: '/route_points/closest_to.json',
                params: {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                }
            }).then((response) => {
                if(this.destinationMarker) {
                    this.destination = null;
                    this.destinationMarker.setMap(null);
                    this.destinationMarker = null;
                }
                this.destination = response.data;
                this.destinationMarker = new google.maps.Marker({
                    clickable: false,
                    map: this.map,
                    position: {lat: response.data.point.lat, lng: response.data.point.lng}
                });
            }).finally(() => {
                this.loading = false;
                ev.remove();
            })
        });
    }

    traceRoute() {
        if(this.origin && this.destination) {
            this.loading = true;
            this.$http({
                method: 'GET',
                url: '/route_points/' + this.origin.id + '/to.json',
                params: {
                    other_id: this.destination.id
                }
            }).then((response) => {
                console.log(response.data);
                this.polylines.forEach((p) => p.setMap(null));
                this.markers.forEach((p) => p.setMap(null));
                let colors = ['#990000', '#009900', '#999900', '#000099'];
                response.data.forEach((step, i) => {
                    if(step.route){
                        this.polylines.push(new google.maps.Polyline({
                            map: this.map,
                            path: step.route,
                            strokeColor: colors[i]
                        }));
                    }
                    step.stops.forEach((p) => {
                        this.markers.push(new google.maps.Marker({
                            map: this.map,
                            position: p
                        }));
                    });
                });
            }).finally(() => {
                this.loading = false;
            })
        } else {
            alert('Faltou os dois pontos.');
        }
    }
}
module.exports = MapController;