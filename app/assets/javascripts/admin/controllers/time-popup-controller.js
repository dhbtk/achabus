/**
 * Created by eduardo on 04/07/16.
 */

class TimePopupController {
    constructor($mdDialog, $http, $mdToast, $filter, time, routes) {
        this.$mdDialog = $mdDialog;
        this.$http = $http;
        this.$mdToast = $mdToast;
        this.time = time;
        this.time.time = $filter('date')(time.time, 'HH:mm');
        this.routes = routes;
    }

    cancel() {
        this.$mdDialog.cancel();
    }

    confirm() {
        this.$http.patch(`/timetables/${this.time.id}.json`, {time: this.time}).then(data => this.$mdDialog.hide(),
            data => this.$mdToast.showSimple(`Erro ${data.status}: ${data.statusText}`));
    }

    destroy() {
        if(confirm('Excluir horário?')) {
            this.$http.delete(`/timetables/${this.time.id}.json`).then(() => this.$mdDialog.hide());
        }
    }
}

module.exports = TimePopupController;