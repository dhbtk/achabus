/**
 * Created by eduardo on 27/06/16.
 */
class MainController {
    constructor($scope) {
        $scope.pageTitle = 'Manutenção';

        /**
         * 
         * @param title
         */
        $scope.setTitle = function(title) {
            $scope.pageTitle = title;
        }
    }
}

module.exports = MainController;