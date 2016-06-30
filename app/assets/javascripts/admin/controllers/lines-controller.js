/**
 * Created by eduardo on 29/06/16.
 */
'use strict';
class LinesController {
    constructor($state, $http, $scope, $rootScope) {
        /**
         * Serviços
         */
        this.$http = $http;
        this.$scope = $scope;
        this.$state = $state;

        /**
         * Estado
         */
        this.lines = [];
        this.line = null;
        this.newRoute = null;
        /**
         * Detectando que estado estamos
         */
        $rootScope.$on('$stateChangeStart', (event, state, params) => {
            this.checkState(state, params);
        });

        this.checkState($state.current, $state.params);
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
        this.$http.get('/lines.json').then(data => {
            this.lines = data.data;
        });
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
                alert('Deu certo!');
                loadLine(this.line.id);
            }, (data) => {
                alert('Erro!');
                console.log(data);
            });
        }
    }
    
    deleteRoute(id) {
        if(confirm('Excluir rota?')) {
            this.$http.delete('/routes/' + id + '.json').then(() => {
                alert('Rota excluída com sucesso.');
                loadLine(this.line.id);
            });
        }
    }
}

module.exports = LinesController;