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
        this.walkingPolylines = [];

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