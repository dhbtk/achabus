/**
 * Created by eduardo on 27/06/16.
 */
class LinesController {
    constructor($http) {
        this.lines = [];

        $http.get('/lines.json').then((data) => {
            this.lines = data.data;
        });
    }
}

module.exports = LinesController;