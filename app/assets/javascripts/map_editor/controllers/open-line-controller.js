function OpenLineController($scope, $mdDialog, $http) {
    $scope.model = {
        line_groups: [],
        line_group: null,
        lines: [],
        line: null
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    $scope.confirm = function () {
        $mdDialog.hide($scope.model.lines[$scope.model.line]);
    };

    $http.get('/lines.json').then(function(data) {
        console.log(data);
        $scope.model.lines = data.data;
    });
}
