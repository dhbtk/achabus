/**
 * Created by eduardo on 28/06/16.
 */
'use strict';
class ShowLineController {
    constructor($stateParams, $http, $scope) {
        this.lineId = $stateParams.id;
        this.$http = $http;
        this.$scope = $scope;
        this.line = null;

        this.loadLine();
    }

    /**
     *
     */
    loadLine() {
        this.$http.get('/lines/' + this.lineId + '.json').then(data => {
            this.line = data.data;
            this.$scope.setTitle(this.line.short_name + ' - ' + this.line.name);
        });
    }
}

module.exports = ShowLineController;