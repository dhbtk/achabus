'use strict';
import $ from 'jquery';

class HomeController {
    constructor($q, $state) {
        this.$q = $q;
        this.places = {};
        this.search = {
            place: null,
            text: null
        };
        this.geolocationPromise = $q.defer();
        this.geolocation = null;
        this.homeAddress = null;

        $('#home-picture').css('background-image', 'url(/cataratas.jpg)').css('opacity', '1');

        this.geolocationPromise.promise.then(data => this.geolocation = {lat: data.coords.latitude, lng: data.coords.longitude}, data => {
            if(data.coords) {
                this.geolocation = {lat: data.coords.latitude, lng: data.coords.longitude};
                $state.go('map', {location: this.geolocation});
            } else {
                $state.go('map');
            }
        });
        navigator.geolocation.getCurrentPosition(data => {
            if(data.coords.accuracy < 1000) {
                this.geolocationPromise.resolve(data);
            } else {
                this.geolocationPromise.reject(data);
            }
        }, err => {
            this.geolocationPromise.reject();
        });
    }

    searchPlaces() {
        return this.$q.defer().promise;
    }
}
module.exports = HomeController;
