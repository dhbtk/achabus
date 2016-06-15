var Route = function (nameOrObject, map) {
    var lineSymbol = {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW};
    if (typeof nameOrObject === 'object') {
        this.name = nameOrObject.name;
        this.id = nameOrObject.id;
        this.line_id = nameOrObject.line_id;
        this.parent_route_id = nameOrObject.parent_route_id;
    }
    else {
        this.name = nameOrObject;
    }
    this.color = '#000000';
    this.path = new google.maps.MVCArray();
    this.poly = new google.maps.Polyline({
        map: map,
        strokeColor: this.color,
        strokeOpacity: 1.0,
        strokeWeight: 5,
    });
    this.points = [];
    this.poly.setPath(this.path);
    var self = this;
    console.log(nameOrObject);
    if(nameOrObject.route_lonlat) {
        nameOrObject.route_lonlat.forEach(function(p) {
           self.path.push(new google.maps.LatLng({lat: p.lat, lng: p.lon}));
        });
    }
    if(nameOrObject.route_points) {
        nameOrObject.route_points.forEach(function(p) {
            self.points.push(new RoutePoint($(document.body).scope().model.points[p.point_id], p.polyline_index));
        });
    }
};

Route.prototype._addPoint = function (point) {
    if (this.points.length < 1) {
        this.points.push(new RoutePoint(point, 0));
    }
    else {
        var svc = new google.maps.DirectionsService();
        var path = this.path; // eu detesto JS
        var points = this.points;
        svc.route({
            origin: this.points[this.points.length - 1].point.marker.getPosition(),
            destination: point.marker.getPosition(),
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }, function (res, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var line = res.routes[0].overview_path;
                for (var i = 0; i < line.length; i++) {
                    path.push(line[i]);
                }
                points.push(new RoutePoint(point, path.getLength() - 1));
            }
        });
    }
};

Route.prototype._removePoint = function (point) {
    var index;
    var routePoint = this.points.find(function (el, i) {
        if (el.point.id == point.id) {
            index = i;
            return true;
        }
        return false;
    }, this);
    console.log(routePoint);
    console.log(index);

    if (index == 0) {
        this.points.pop();
        return;
    }

    var prevPoint = this.points[index - 1];
    for (var i = this.path.getLength() - 1; i > prevPoint.pathIndex; i--) {
        this.path.removeAt(i);
    }
    this.points.pop();
};

Route.prototype.handleClick = function (point) {
    for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].point.id == point.id) {
            // Só remover caso seja o último, senão não fazemos nada
            if (this.points[i].point.id == this.points[this.points.length - 1].point.id) {
                this._removePoint(point);
            }
            return;
        }
    }
    // Caso não achemos
    this._addPoint(point);
};

Route.prototype.serializePoints = function () {
    return this.points.map((p, i) => p.serialize(this, i));
};

Route.prototype._serializeRoute = function () {
    return 'LINESTRING(' + this.path.getArray().map(p => p.lng() + ' ' + p.lat()).join(',') + ')';
};

Route.prototype.serialize = function () {
    return {
        route: {
            name: this.name,
            line_id: this.line_id,
            parent_route_id: this.parent_route_id,
            route: this._serializeRoute(),
        },
    };
};

Route.prototype.unload = function () {
    this.poly.setMap(null);
};

Route.prototype.save = function () {
    $.ajax({url: '/routes/' + this.id + '.json', method: 'PATCH', data: this.serialize()});
    this.serializePoints().forEach(function (p) {
        $.ajax({url: '/route_points.json', method: 'POST', data: p})
    });
}
