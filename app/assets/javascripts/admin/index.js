/**
 * Created by eduardo on 25/06/16.
 */
'use strict';

require('./controllers');

require('./module').config(function ($stateProvider, $urlRouterProvider, $breadcrumbProvider, $httpProvider) {
    /**
     * Hook do $http para exibir/ocultar a barrinha de progresso.
     */
    $httpProvider.interceptors.push('progressInterceptor');
    /**
     * Breadcrumb mais legalzinha
     */
    $breadcrumbProvider.setOptions({
        prefixStateName: 'home',
        templateUrl: '/templates/admin/breadcrumb.html'
    });

    /**
     * ESTADOS
     */
    $urlRouterProvider.otherwise('home');
    $urlRouterProvider.when('', '/');
    /**
     * Home
     */
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/templates/admin/home.html',
        ncyBreadcrumb: {label: 'Home'}
    });
    /**
     * Linhas
     */
    $stateProvider.state('lines', {
        url: '/lines',
        abstract: true,
        controller: 'LinesController as ctrl',
        template: '<div ui-view/>'
    });
    $stateProvider.state('lines.index', {
        url: '',
        templateUrl: '/templates/admin/lines-index.html',
        ncyBreadcrumb: {label: 'Linhas'}
    });
    $stateProvider.state('lines.show', {
        url: '/:id',
        templateUrl: '/templates/admin/lines-show.html',
        ncyBreadcrumb: {
            label: '{{ctrl.line.identifier}} - {{ctrl.line.name}}',
            parent: 'lines.index'
        }
    });
    /**
     * Editor de Rotas
     */
    $stateProvider.state('map', {
        url: '/map',
        controller: 'MapEditorController',
        templateUrl: '/templates/admin/map-editor.html'
    });
})
.factory('progressInterceptor', ($q, $rootScope) => {
    let xhr = 0;

    function updateStatus() {
        $rootScope.loading = xhr !== 0;
    }

    return {
        request(config) {
            xhr++;
            updateStatus();
            return config;
        },
        requestError(config) {
            xhr--;
            updateStatus();
            return $q.reject(config);
        },
        response(data) {
            xhr--;
            updateStatus();
            return data;
        },
        responseError(data) {
            xhr--;
            updateStatus();
            $rootScope.$broadcast('networkError', data);
            return $q.reject(data);
        }
    };
});