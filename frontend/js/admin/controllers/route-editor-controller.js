/**
 * Created by eduardo on 19/08/16.
 */
import ol from 'openlayers';
import Route from '../classes/route';

class RouteEditorController {
    constructor($timeout, $http, $mdToast, $mdDialog, $scope) {
        /*-------------------------------------------------------------------
         *                             SERVICES
         *-------------------------------------------------------------------*/

        this.$timeout = $timeout;
        this.$http = $http;
        this.$mdToast = $mdToast;
        this.$mdDialog = $mdDialog;

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
        /**
         * Dados do ponto atualmente selecionado.
         */
        this.selectedPointData = {};

        /**
         * Linha atualmente ativa.
         */
        this.line = null;
        /**
         * Rota atualmente ativa.
         * @type {Route}
         */
        this.route = null;
        /**
         * Rota selecionada nas opções.
         */
        this.selectedRoute = null;

        //
        //
        //

        // Timeout para inicializar o mapa do openstreetmap.
        $timeout(() => {
            this.map = new ol.Map({
                controls: [],
                interactions: ol.interaction.defaults({doubleClickZoom: false}),
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
                    if(oldSelected) {
                        this._updatePointStyle(oldSelected);
                    }
                    if(this.selectedPoint) {
                        this._updatePointStyle(this.selectedPoint);
                        this.selectedPointData = {
                            id: this.selectedPoint.get('id'),
                            name: this.selectedPoint.get('name'),
                            waypoint: this.selectedPoint.get('waypoint'),
                            heading: parseFloat(this.selectedPoint.get('heading'))
                        };
                        if(this.route) {
                            this.route.handleClick(this.selectedPoint);
                        }
                    }
                });
            });
            this.map.on('dblclick', /** @type {ol.MapBrowserEvent} */ event => {
                console.log(event);
                if(!this.selectedPoint) {
                    const point = {
                        position: "POINT (" + event.coordinate[0] + " " + event.coordinate[1] + ")",
                        waypoint: true,
                        heading: 0
                    };
                    this.$http.post('/points.json', {point: point}).then(data => {
                        this._createPoint(data.data);
                    });
                }
            });
            this._loadPoints();
        }, 500);

        $scope.$watch('ctrl.selectedRoute', () => this.onSelectRoute());
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
                this._createPoint(point);
            });
        });
    }

    /**
     *
     * @param point
     * @private
     */
    _createPoint(point) {
        const feature = new ol.Feature({
            id: point.id,
            name: point.name,
            waypoint: point.waypoint,
            heading: point.heading,
            geometry: new ol.geom.Point(point.coords)
        });
        this._updatePointStyle(feature);
        this.points.push(feature);
    }

    /**
     * Atualiza a visualização de um ponto no mapa.
     *
     * @param {ol.Feature} point
     * @private
     */
    _updatePointStyle(point) {
        const waypoint = point.get('waypoint');
        const id = point.get('id');
        const selected = this.selectedPoint && this.selectedPoint.get('id') == id;
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
     * Atualiza os dados de um ponto a partir da informação recebida do backend.
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

    /**
     * Fecha uma linha em preparação para abrir outra.
     * @private
     */
    _closeLine() {
        // TODO esconder as rotas atuais, limpar as camadas etc
    }

    /**
     * Abre uma rota no editor.
     *
     * @param id identificador da rota
     * @private
     */
    _openRoute(id) {
        this.$http.get(`/routes/${id}.json`).then(data => {
            this.route = new Route(data.data, this.routeLayer, this.points, this.$http);
        });
    }

    /**
     * Fecha uma rota.
     * @private
     */
    _closeRoute() {

    }

    /*-------------------------------------------------------------------
     *                             HANDLERS
     *-------------------------------------------------------------------*/

    //
    // Pontos
    //

    /**
     * Move o ponto para a esquerda.
     *
     * @param id
     */
    moveLeft(id) {
        this.$http.post(`/points/${id}/left.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     * Move o ponto para a direita.
     *
     * @param id
     */
    moveRight(id) {
        this.$http.post(`/points/${id}/right.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     * Move o ponto para frente.
     *
     * @param id
     */
    moveForward(id) {
        this.$http.post(`/points/${id}/forward.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     * Move o ponto para trás.
     *
     * @param id
     */
    moveBackward(id) {
        this.$http.post(`/points/${id}/backward.json`).then(data => {
            this._updatePointData(data.data);
        });
    }

    /**
     * Salva o ponto selecionado.
     */
    savePoint() {
        if(this.selectedPoint) {
            const data = {
                name: this.selectedPointData.name,
                heading: this.selectedPointData.heading,
                waypoint: this.selectedPointData.waypoint
            };
            this.$http.patch(`/points/${this.selectedPointData.id}.json`, {point: data}).then(data => {
                console.log(data);
                this._updatePointData(data.data);
                this.$mdToast.showSimple('Ponto atualizado com sucesso.');
            });
        }
    }

    /**
     * Delete o ponto selecionado.
     */
    deletePoint() {
        if(this.selectedPoint && confirm('Excluir o ponto selecionado?')) {
            const id = this.selectedPointData.id;
            this.$http.delete(`/points/${id}.json`).then(data => {
                this.$mdToast.showSimple('Ponto removido com sucesso.');
                this.points.remove(this.selectedPoint);
                this.selectedPoint = null;
            });
        }
    }

    //
    // Linhas
    //

    openLine() {
        this.$mdDialog.show({
            controller: function($scope, $http, $mdDialog, $q) {
                $scope.lines = [];
                $scope.line = null;
                $scope.text = '';

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.confirm = function () {
                    $mdDialog.hide($scope.line);
                };

                $scope.findLine = function(text) {
                    let def = $q.defer();
                    $http.get('/lines.json', {params: {filter: text}}).then(data => def.resolve(data.data.content), a => def.reject(a));
                    return def.promise;
                };
            },
            templateUrl: '/templates/admin/map-editor/route-editor-open-line.html'
        }).then(line => {
            this._closeLine();
            this.line = line;
        });
    }

    //
    // Rotas
    //

    onSelectRoute() {
        if(this.selectedRoute) {
            this._openRoute(this.selectedRoute);
        }
    }
}

module.exports = RouteEditorController;