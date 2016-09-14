import RoutePoint from './route-point';
import $ from 'jquery';
import ol from 'openlayers';

class Route {
    /**
     *
     * @param routeData
     * @param {ol.layer.Layer} layer
     * @param {ol.Collection} points
     * @param $http
     */
    constructor(routeData, layer, points, $http) {
        /**
         *
         */
        this.$http = $http;
        /**
         *
         */
        this.routeData = routeData;
        /**
         *
         * @type {ol.layer.Layer}
         */
        this.layer = layer;
        /**
         *
         * @type {ol.Collection}
         */
        this.points = points;
        /**
         *
         * @type {Array}
         */
        this.routePoints = [];
        /**
         * Flag indicando se a rota foi alterada.
         * @type {boolean}
         */
        this.dirty = false;

        if(this.routeData.route) {
            this.layer.setSource(new ol.source.Vector({
                features: [new ol.format.WKT().readFeature(this.routeData.route)]
            }));
        }
    }

    /**
     *
     * @param {ol.Feature} point
     */
    handleClick(point) {
        for(let i = 0; i < this.routePoints.length; i++) {
            if(point.get('id') == this.routePoints[i].point.get('id')) {
                if(this.routePoints.length == i + 1) {
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
        if (this.routePoints.length < 1) {
            this.routePoints.push(new RoutePoint(point, 0));
        }
        else {
            const routePoint = new RoutePoint(point, null);
            this.routePoints.push(routePoint);
            this.$http.get(`/route_path/${this._pointsQuery()}`).then(data => {
                this.layer.setSource(new ol.source.Vector({
                    features: [new ol.format.WKT().readFeature(data.data.wkt)]
                }));
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

    _pointsQuery() {
        return this.routePoints.map(p => {
            const coords = p.point.getGeometry().getCoordinates();
            return coords[0] + ',' + coords[1];
        }).join(':');
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