/**
 * Created by eduardo on 25/06/16.
 */
'use strict';

require('./directives/block.js');
require('./controllers');

require('./module').config(function ($stateProvider, $urlRouterProvider, $breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        prefixStateName: 'home',
        templateUrl: '/templates/admin/breadcrumb.html'
    });
    /**
     * ESTADOS
     */
    $urlRouterProvider.otherwise('home');
    $urlRouterProvider.when('', '/');

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
            label: '{{ctrl.line.short_name}} - {{ctrl.line.name}}',
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
});
