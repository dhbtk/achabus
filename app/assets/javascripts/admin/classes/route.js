import RoutePoint from './route_point';
import $ from 'jquery';

class Route {
    constructor(nameOrObject, map, points) {
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
        this.map = map;
        this.poly = new google.maps.Polyline({
            map: this.map,
            strokeColor: this.color,
            strokeOpacity: 1.0,
            strokeWeight: 5
        });
        this.poly.setVisible(false);
        this.points = [];
        this.poly.setPath(this.path);
        console.log(nameOrObject);
        if(nameOrObject.route_lonlat) {
            nameOrObject.route_lonlat.forEach(p => this.path.push(new google.maps.LatLng({lat: p.lat, lng: p.lon})));
        }
        if(nameOrObject.route_points) {
            nameOrObject.route_points.forEach(p => this.points.push(new RoutePoint(points[p.point_id], p.polyline_index)));
        }
    }

    handleClick(point) {
        for (let i = 0; i < this.points.length; i++) {
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
    }

    hide() {
        this.poly.setVisible(false);
    }

    show() {
        this.poly.setVisible(true);
    }

    save() {
        $.ajax({url: '/routes/' + this.id + '.json', method: 'PATCH', data: this._serialize()});
        this._serializePoints().forEach(p => $.ajax({url: '/route_points.json', method: 'POST', data: p}));
    }
    
    _addPoint(point) {
        if (this.points.length < 1) {
            this.points.push(new RoutePoint(point, 0));
        }
        else {
            const svc = new google.maps.DirectionsService();
            svc.route({
                origin: this.points[this.points.length - 1].point.marker.getPosition(),
                destination: point.marker.getPosition(),
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }, (res, status) => {
                if (status == google.maps.DirectionsStatus.OK) {
                    const line = res.routes[0].overview_path;
                    for (let i = 0; i < line.length; i++) {
                        this.path.push(line[i]);
                    }
                    this.points.push(new RoutePoint(point, this.path.getLength() - 1));
                }
            });
        }
    }
    
    _removePoint(point) {
        let index = -1;
        const routePoint = this.points.find(function (el, i) {
            if (el.point.id == point.id) {
                index = i;
                return true;
            }
            return false;
        }, this);
        console.log(routePoint);
        console.log(index);

        if (index === 0) {
            this.points.pop();
            return;
        }

        const prevPoint = this.points[index - 1];
        for (let i = this.path.getLength() - 1; i > prevPoint.pathIndex; i--) {
            this.path.removeAt(i);
        }
        this.points.pop();
    }
    

    
    _serializePoints() {
        return this.points.map((p, i) => p._serialize(this, i));
    }
    
    _serializeRoute() {
        return 'LINESTRING(' + this.path.getArray().map(p => p.lng() + ' ' + p.lat()).join(',') + ')';
    }
    
    _serialize() {
        return {
            route: {
                name: this.name,
                line_id: this.line_id,
                parent_route_id: this.parent_route_id,
                route: this._serializeRoute()
            }
        };
    }
    

}

module.exports = Route;