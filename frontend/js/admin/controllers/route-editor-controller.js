/**
 * Created by eduardo on 19/08/16.
 */
import ol from 'openlayers';

class RouteEditorController {
    constructor($timeout) {
        $timeout(() => {
            this.map = new ol.Map({
                controls: [],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                ],
                target: 'map',
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: [-54.56901, -25.53413],
                    zoom: 14
                })
            });
        }, 500);
    }
}

module.exports = RouteEditorController;