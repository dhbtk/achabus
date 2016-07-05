/**
 * Created by eduardo on 27/06/16.
 */
class MainController {
    constructor($scope, $state, $rootScope, $mdToast) {
        $scope.pageTitle = 'Manutenção';
        $scope.transitioning = false;

        /**
         * Handler de erro de rede
         */
        $rootScope.$on('networkError', (data) => $mdToast.showSimple(`Erro ${data.status}: ${data.statusText}`));
        /**
         * Handlers de transições
         */
        $rootScope.$on('$stateChangeStart', () => {
            $scope.transitioning = true;
        });
        $rootScope.$on('$stateChangeSuccess', () => {
            $scope.transitioning = false;
        });

        /**
         * 
         * @param title
         */
        $scope.setTitle = function(title) {
            $scope.pageTitle = title;
        };
    }
}

module.exports = MainController;
