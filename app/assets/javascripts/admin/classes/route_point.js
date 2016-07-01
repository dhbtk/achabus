var RoutePoint = function (point, pathIndex) {
    this.point = point;
    this.pathIndex = pathIndex;
};

RoutePoint.prototype.serialize = function (route, i) {
    return {
        route_point: {
            route_id: route.id,
            point_id: this.point.id,
            order: i,
            polyline_index: this.pathIndex
        }
    };
};

module.exports = RoutePoint;