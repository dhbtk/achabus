class RoutePoint {
    constructor(point, pathIndex) {
        this.point = point;
        this.pathIndex = pathIndex;
    }

    _serialize(route, order) {
        return {
            route_point: {
                route_id: route.routeData.id,
                point_id: this.point.get('id'),
                order: order,
                polyline_index: this.pathIndex
            }
        };
    }
}

module.exports = RoutePoint;