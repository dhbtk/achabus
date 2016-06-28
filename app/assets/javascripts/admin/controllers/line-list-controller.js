/**
 * Created by eduardo on 27/06/16.
 */
class LineListController {
    constructor($http, $scope) {
        this.lines = [];

        $http.get('/lines.json').then((data) => {
            this.lines = data.data;
        });

        $scope.setTitle('Linhas');
    }
}

module.exports = LineListController;