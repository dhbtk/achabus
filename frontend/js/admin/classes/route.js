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
        } else {
            this.layer.setSource(new ol.source.Vector());
        }
        this.routeData.route_points.forEach(routePoint => {
            const point = this.points.getArray().find(p => p.get('id') == routePoint.point_id);
            this.routePoints.push(new RoutePoint(point, routePoint.polyline_index));
        });
    }

    /**
     *
     * @param {ol.Feature} point
     */
    handleClick(point) {
        for(let i = 0; i < this.routePoints.length; i++) {
            if(point.get('id') == this.routePoints[i].point.get('id')) {
                if(this.routePoints.length == i + 1) {
                    this._removeLastPoint();
                    this.dirty = true;
                }
                return;
            }
        }
        // Caso não achemos
        this._addPoint(point);
    }

    /**
     *
     */
    save() {
        $.ajax({url: '/routes/' + this.routeData.id + '.json', method: 'PATCH', data: this._serialize()});
        this._serializePoints().forEach(p => $.ajax({url: '/route_points.json', method: 'POST', data: p}));
        this.dirty = false;
    }

    /**
     *
     * @param point
     * @private
     */
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
                routePoint.pathIndex = this.layer.getSource().getFeatures()[0].getGeometry().getCoordinates().length - 1;
            });
        }
    }

    /**
     *
     * @returns {Array}
     * @private
     */
    _serializePoints() {
        return this.routePoints.map((p, i) => p._serialize(this, i));
    }

    /**
     *
     * @private
     */
    _serializeRoute() {
        return new ol.format.WKT().writeGeometry(this.layer.getSource().getFeatures()[0].getGeometry());
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _pointsQuery() {
        return this.routePoints.map(p => {
            const coords = p.point.getGeometry().getCoordinates();
            return coords[0] + ',' + coords[1];
        }).join(':');
    }

    /**
     *
     * @returns {{route: {name: *, line_id: *, parent_route_id: *, route: *}}}
     * @private
     */
    _serialize() {
        return {
            route: {
                name: this.routeData.name,
                line_id: this.routeData.line_id,
                parent_route_id: this.routeData.parent_route_id,
                route: this._serializeRoute()
            }
        };
    }


    /**
     *
     * @private
     */
    _removeLastPoint() {
        this.routePoints.pop();
        if(this.routePoints.length > 1) {
            this.$http.get(`/route_path/${this._pointsQuery()}`).then(data => {
                this.layer.setSource(new ol.source.Vector({
                    features: [new ol.format.WKT().readFeature(data.data.wkt)]
                }));
            });
        } else {
            this.layer.setSource(new ol.source.Vector());
        }
    }
}

module.exports = Route;