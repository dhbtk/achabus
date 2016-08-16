/**
 * Created by eduardo on 25/06/16.
 */
'use strict';

require('./controllers');

require('./module').config(function ($stateProvider, $urlRouterProvider, $breadcrumbProvider, $httpProvider, $mdThemingProvider) {
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
        templateUrl: '/templates/admin/lines/lines-index.html',
        ncyBreadcrumb: {label: 'Linhas'}
    });
    $stateProvider.state('lines.show', {
        url: '/:id',
        templateUrl: '/templates/admin/lines/lines-show.html',
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
        templateUrl: '/templates/admin/map-editor/map-editor.html'
    });


    /**
     * Tema
     */
    $mdThemingProvider.definePalette('gray', {
        '50': '#b7b7b7',
        '100': '#909090',
        '200': '#747474',
        '300': '#515151',
        '400': '#414141',
        '500': '#323232',
        '600': '#232323',
        '700': '#131313',
        '800': '#040404',
        '900': '#000000',
        'A100': '#b7b7b7',
        'A200': '#909090',
        'A400': '#414141',
        'A700': '#131313',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 A100 A200'
    });
    $mdThemingProvider.definePalette('orange', {
        '50': '#fff4e9',
        '100': '#ffce9d',
        '200': '#ffb265',
        '300': '#ff8f1d',
        '400': '#fe7f00',
        '500': '#df7000',
        '600': '#c06100',
        '700': '#a25100',
        '800': '#834200',
        '900': '#653300',
        'A100': '#fff4e9',
        'A200': '#ffce9d',
        'A400': '#fe7f00',
        'A700': '#a25100',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 400 500 A100 A200 A400'
    });
    $mdThemingProvider.theme('default')
        .primaryPalette('gray')
        .accentPalette('orange');
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