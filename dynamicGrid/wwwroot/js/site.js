// Write your JavaScript code.
angular.module('app', ["dynamicGrid"]).controller("home", homeController);

function homeController($scope, $http) {
    $scope.dataType = '0';
    $scope.dataResult = [];
    $scope.getData = getData;
    $scope.pageSize = '-1';
    getData();

    function getData() {
        if ($scope.dataType === '0') {
            $http.post('/api/data/getDataTable/').then(function (result) {
                $scope.dataResult = result.data;
            });;
            return;
        }
        if ($scope.dataType === '1') {
            $http.post('/api/data/getDataObject/').then(function (result) {
                $scope.dataResult = result.data;
            });;
            return;
        }
        if ($scope.dataType === '2') {
            $http.post('/api/data/getDataArray/').then(function (result) {
                $scope.dataResult = result.data;
            });;
            return;
        }
    }
}