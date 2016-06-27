/**
 * Created by eduardo on 27/06/16.
 */
'use strict';
require('../module').directive('block', () => {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            width: '='
        },
        transclude: true,
        templateUrl: '/templates/admin/block.html'
    }
});