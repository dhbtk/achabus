/**
 * Created by eduardo on 29/06/16.
 */
'use strict';
class LinesController {
    constructor($state, $http, $scope, $rootScope, $mdToast, $q) {
        /**
         * Serviços
         */
        this.$http = $http;
        this.$scope = $scope;
        this.$state = $state;
        this.$mdToast = $mdToast;
        this.$q = $q;

        /**
         * Estado
         */
        this.lines = [];
        this.line = null;
        this.newRoute = null;
        this.filters = '';
        this.query = {
            limit: 10,
            page: 1
        };

        /**
         * Buga buga ES5!!!
         * @type {LinesController}
         */
        const self = this;
        /**
         * Detectando que estado estamos
         */
        $rootScope.$on('$stateChangeStart', (event, state, params) => {
            this.checkState(state, params);
        });

        /**
         * Paginação da tabela. Isso tem que ficar aqui por questões de o md-data-table ser tanso
         *
         * @param page
         * @param limit
         * @returns {*}
         */
        this.$scope.getLines = function(page = 1, limit = 10) {
            let def = $q.defer();
            $http.get('/lines.json', {params: {filter: self.filters, page: page, size: limit}}).then(data => {
                def.resolve(data.data.content);
                self.lines = data.data;
            }, a => def.reject(a));
            return def.promise;
        };

        this.checkState($state.current, $state.params);

        $scope.$watch('ctrl.filters', () => this.$scope.getLines(1, 10));
    }

    /**
     * Helper para as transições de estado
     * 
     * @param state
     * @param params
     */
    checkState(state, params) {
        switch(state.name) {
            case "lines.index":
                this.loadLines();
                break;
            case "lines.show":
                this.loadLine(params.id);
                break;
        }
    }

    /**
     *
     * LISTA DE LINHAS
     *
     */
    loadLines() {
        this.$scope.setTitle('Linhas');
        this.filters = '';
        this.$scope.getLines();
    }

    /**
     *
     * VISUALIZAR LINHA
     *
     */
    loadLine(id) {
        this.$http.get('/lines/' + id + '.json').then(data => {
            this.line = data.data;
            this.newRoute = {
                line_id: this.line.id
            };
            this.$scope.setTitle(this.line.short_name + ' - ' + this.line.name);
        });
    }

    createRoute() {
        if(this.line && this.newRoute && this.routeForm.$valid) {
            this.$http.post('/routes.json', {route: this.newRoute}).then(() => {
                this.$mdToast.showSimple('Rota adicionada com sucesso.');
                loadLine(this.line.id);
            }, (data) => {
                this.$mdToast.showSimple('Não foi possível adicionar a rota.');
                console.log(data);
            });
        }
    }
    
    deleteRoute(id) {
        if(confirm('Excluir rota?')) {
            this.$http.delete('/routes/' + id + '.json').then(() => {
                this.$mdToast.showSimple('Rota excluída com sucesso.');
                loadLine(this.line.id);
            });
        }
    }
}

module.exports = LinesController;