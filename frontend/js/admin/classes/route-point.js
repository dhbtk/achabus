class RoutePoint {
    constructor(point, pathIndex) {
        this.point = point;
        this.pathIndex = pathIndex;
    }

    _serialize(route, order) {
        return {
            route_point: {
                route_id: route.id,
                point_id: this.point.id,
                order: order,
                polyline_index: this.pathIndex
            }
        };
    }
}

module.exports = RoutePoint;