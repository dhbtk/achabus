'use strict';
var $ = require('jquery');
class HomeController {
    constructor($q) {
        this.$q = $q;
        var self = this;
        self.places = {};
        self.search = {
            place: null,
            text: null
        };

        $('#home-picture').css('background-image', 'url(/cataratas.jpg)').css('opacity', '1');

        navigator.geolocation.getCurrentPosition(function(pos) { console.log(pos); });
    }

    searchPlaces() {
        return this.$q.defer().promise;
    }
}
module.exports = HomeController;
