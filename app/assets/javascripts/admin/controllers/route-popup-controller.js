/**
 * Created by eduardo on 02/07/16.
 */
class RoutePopupController {
    constructor($mdDialog, $http, $mdToast, route, line) {
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;
        this.$http = $http;
        this.route = route;
        this.line = line;
    }

    cancel() {
        this.$mdDialog.cancel();
    }

    confirm() {
        let action = (data) => {
            this.$mdToast.showSimple(`Rota "${data.data.name}" salva com sucesso.`);
            this.$mdDialog.hide();
        };
        let error = (data) => {
            console.log(data);
        };
        if(this.route.id) {
            this.$http.patch(`/routes/${this.route.id}.json`, {route: this.route}).then(action, error);
        } else {
            this.$http.post(`/lines/${this.route.line_id}/routes.json`, {route: this.route}).then(action, error);
        }
    }
}

module.exports = RoutePopupController;