function HomeController($scope, $q) {
    var self = this;
    self.places = {};
    self.search = {
        place: null,
        text: null
    };
    self.searchPlaces = function () {
        return $q.defer().promise;
    }

    $('<img />').attr('src', '/cataratas.jpg').load(function () {
        $('#home-picture').css('background-image', 'url(/cataratas.jpg)').css('opacity', '1');
    });

    navigator.geolocation.getCurrentPosition(function(pos) { console.log(pos); });
}
