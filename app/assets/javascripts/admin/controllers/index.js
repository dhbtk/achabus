'use strict';

require('../module')
    .controller('MainController', require('./main-controller.js'))
    .controller('LinesController', require('./lines-controller.js'))
    .controller('LinePopupController', require('./line-popup-controller.js'))
    .controller('MapEditorController', require('./map-editor-controller'));