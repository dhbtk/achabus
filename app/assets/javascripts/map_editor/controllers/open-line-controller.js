function OpenLineController($scope, $mdDialog, $http) {
    $scope.model = {
        line_groups: [],
        line_group: null,
        lines: [],
        line: null
    };
    $http.get('/line_groups.json')
        .then(function (data) {
            $scope.model.line_groups = data.data;
        });
    $scope.cancel = function () {
        $mdDialog.cancel();
    }
    $scope.confirm = function () {
        $mdDialog.hide($scope.model.line);
    }

    $scope.$watch('model.line_group', function (newVal, oldVal) {
        console.log('new');
        console.log(newVal);
        console.log('old');
        console.log(oldVal);
        if (newVal) {
            $http.get('/line_groups/' + newVal.id + '.json')
                .then(function (data) {
                    $scope.model.lines = data.data.lines;
                });
        }
    });
}
