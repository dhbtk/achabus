'use strict';

require('../module')
    .controller('MainController', require('./main-controller'))
    .controller('LinesController', require('./lines-controller'))
    .controller('LinePopupController', require('./line-popup-controller'))
    .controller('RoutePopupController', require('./route-popup-controller'))
    .controller('TimePopupController', require('./time-popup-controller.js'))
    .controller('PointEditorController', require('./point-editor-controller'))
    .controller('RouteEditorController', require('./route-editor-controller'));