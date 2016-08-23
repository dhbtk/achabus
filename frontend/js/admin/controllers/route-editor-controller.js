/**
 * Created by eduardo on 19/08/16.
 */
import ol from 'openlayers';

class RouteEditorController {
    constructor($timeout, $http) {
        /*-------------------------------------------------------------------
         *                             SERVICES
         *-------------------------------------------------------------------*/

        this.$timeout = $timeout;
        this.$http = $http;

        /*-------------------------------------------------------------------
         *                            ATTRIBUTES
         *-------------------------------------------------------------------*/

        /**
         * Mapa principal do editor.
         * @type {ol.Map}
         */
        this.map = null;
        /**
         * Lista de pontos, paradas e waypoints.
         * @type {ol.Collection}
         */
        this.points = new ol.Collection();
        /**
         * Camada das paradas e waypoints.
         * @type {ol.layer.Vector}
         */
        this.pointLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: this.points
            })
        });
        /**
         * Camada da rota atualmente sendo editada.
         * @type {ol.layer.Vector}
         */
        this.routeLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        /**
         * Objeto para interação com o mapa via click.
         * @type {ol.interaction.Select}
         */
        this.select = new ol.interaction.Select({
            layers: [this.pointLayer]
        });
        /**
         * Ponto atualmente selecionado.
         * @type {ol.Feature}
         */
        this.selectedPoint = null;

        // Timeout para inicializar o mapa do openstreetmap.
        $timeout(() => {
            this.map = new ol.Map({
                controls: [],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),
                    this.pointLayer,
                    this.routeLayer
                ],
                target: 'map',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: [-54.56901, -25.53413],
                    zoom: 14
                })
            });
            this.map.addInteraction(this.select);
            this.select.on('select', /** @type {ol.interaction.SelectEvent} */ event => {
                this.$timeout(() => {
                    const oldSelected = this.selectedPoint;
                    this.selectedPoint = event.selected[0];
                    if(oldSelected != null) {
                        this._updatePointStyle(oldSelected);
                    }
                    if(this.selectedPoint != null) {
                        this._updatePointStyle(this.selectedPoint);
                    }
                });
            });
            this._loadPoints();
        }, 500);
    }

    /*-------------------------------------------------------------------
     *                             BEHAVIORS
     *-------------------------------------------------------------------*/

    /**
     *
     * @private
     */
    _loadPoints() {
        this.$http.get('/points.json').then(data => {
            const points = data.data;
            points.forEach(point => {
                const feature = new ol.Feature({
                    id: point.id,
                    name: point.name,
                    waypoint: point.waypoint,
                    heading: point.heading,
                    geometry: new ol.geom.Point(point.coords)
                });
                this._updatePointStyle(feature);
                this.points.push(feature);
            });
        });
    }

    /**
     *
     * @param {ol.Feature} point
     * @private
     */
    _updatePointStyle(point) {
        const waypoint = point.get('waypoint');
        const id = point.get('id');
        const selected = this.selectedPoint != null && this.selectedPoint.get('id') == id;
        if(waypoint) {
            if(selected) {
                point.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({color: [205, 0, 0, 1]})
                    })
                }));
            } else {
                point.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({color: [255, 101, 0, 1]})
                    })
                }));
            }
        } else {
            if(selected) {
                point.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: '/images/waypoint_selected.svg',
                        scale: 0.15,
                        rotation: parseFloat(point.get('heading'))*(Math.PI/180)
                    })
                }));
            } else {
                point.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: '/images/waypoint.svg',
                        scale: 0.15,
                        rotation: parseFloat(point.get('heading'))*(Math.PI/180)
                    })
                }));
            }
        }
    }

    /**
     *
     * @param pointData
     * @private
     */
    _updatePointData(pointData) {
        /** @type {ol.Feature} */
        const point = this.points.getArray().find(p => p.get('id') == pointData.id);
        if(point) {
            point.set('name', pointData.name);
            point.set('waypoint', pointData.waypoint);
            point.set('heading', pointData.heading);
            point.getGeometry().setCoordinates(pointData.coords);
            this._updatePointStyle(point);
        }
    }

    /*-------------------------------------------------------------------
     *                             HANDLERS
     *-------------------------------------------------------------------*/

    /**
     *
     * @param id
     */
    moveLeft(id) {
        this.$http.post(`/points/${id}/left.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     *
     * @param id
     */
    moveRight(id) {
        this.$http.post(`/points/${id}/right.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     *
     * @param id
     */
    moveForward(id) {
        this.$http.post(`/points/${id}/forward.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     *
     * @param id
     */
    moveBackward(id) {
        this.$http.post(`/points/${id}/backward.json`).then(data => {
            this._updatePointData(data.data);
        });
    }
}

module.exports = RouteEditorController;