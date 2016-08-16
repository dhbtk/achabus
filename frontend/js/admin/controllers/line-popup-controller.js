/**
 * Created by eduardo on 02/07/16.
 */
class LinePopupController {
    constructor($mdDialog, $http, $mdToast, line) {
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;
        this.$http = $http;
        this.line = line;
        this.line_groups = [];

        $http.get('/line_groups.json').then(data => this.line_groups = data.data);
    }

    cancel() {
        this.$mdDialog.cancel();
    }

    confirm() {
        this.line.path = this.line.path.split(',').map(a => a.trim());
        let action = (data) => {
            this.$mdToast.showSimple(`Linha "${data.data.identifier} - ${data.data.name}" salva com sucesso.`);
            this.$mdDialog.hide();
        };
        let error = (data) => {
            console.log(data);
        };
        if(this.line.id) {
            this.$http.patch(`/lines/${this.line.id}.json`, {line: this.line}).then(action, error);
        } else {
            this.$http.post('/lines.json', {line: this.line}).then(action, error);
        }
    }
}

module.exports = LinePopupController;