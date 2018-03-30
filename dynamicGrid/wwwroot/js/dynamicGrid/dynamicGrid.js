'use strict';

// Declare app level module which depends on views, and components
angular.module("dynamicGrid", [])
    .directive("dynamicGrid", function () {
        return {
            replace: true,
            restrict: 'EA',
            scope: {
                gridData: '=?',
                gridPageSize: '=?',
                gridTableClass: '@?',
                gridHeaderRowClass: '@?',
                gridHeaderItemClass: '@?',
                gridDataRowClass: '@?',
                gridDataItemClass: '@?',
                gridFooterRowClass: '@?',
                gridNoDataClass: '@?',
                gridNoDataMessage: '@?'
            },
            controller: dynamicGridController,
            templateUrl: '/templates/dynamicGrid.html'
        };
    });

function dynamicGridController($scope) {
    $scope.hasData = false;
    $scope.gridTable = new gridTableObject();
    $scope.gridPageCounter = 0;
    $scope.changePage = changePage;
    $scope.changeToFirstPage = changeToFirstPage;
    $scope.changeToLastPage = changeToLastPage;


    if ($scope.gridNoDataMessage === null || $scope.gridNoDataMessage === undefined) {
        $scope.gridNoDataMessage = "No data to display.";
    }

    if ($scope.gridPageSize === null || $scope.gridPageSize === undefined) {
        $scope.gridPageSize = '-1';
    }

    if ($scope.gridData) {
        $scope.gridTable = refreshData($scope.gridData, parseInt($scope.gridPageSize));
    }

    $scope.$watch('gridData', refreshGridData);
    $scope.$watch('gridPageSize', resetPageSize);

    function refreshGridData() {
        $scope.gridTable = refreshData($scope.gridData, parseInt($scope.gridPageSize));
    }

    function refreshData(rawData, pageSize) {
        if (typeof (rawData) === 'object') {
            var table = createGridTableObject(rawData, pageSize);
            if (Array.isArray(rawData)) {
                if ($scope.gridData.length > 0) {
                    $scope.hasData = true;
                    table = convertObjectArrayToGridDataObject(rawData, pageSize);
                }
            }
            else {
                table = convertObjectToGridDataObject(rawData, pageSize);
            }

            table = updateTableDisplay(table);

            return table;
        }
    }

    function updateTableDisplay(table) {
        table.displayRows = table.rows;
        if (table.pageSize > 0) {
            let start = table.currentPage * table.pageSize;
            let end = (table.currentPage + 1) * table.pageSize;
            table.displayRows = table.rows.slice(start, end);
        }

        return table;
    }

    function changeToFirstPage() {
        let table = $scope.gridTable;
        table.currentPage = 0;
        $scope.gridTable = updateTableDisplay($scope.gridTable);
    }

    function changeToLastPage() {
        let table = $scope.gridTable;
        table.currentPage = table.totalPages;
        $scope.gridTable = updateTableDisplay($scope.gridTable);
    }

    function changePage(increment) {
        let table = $scope.gridTable;
        table.currentPage += increment;
        if (table.currentPage < 0) table.currentPage = 0;
        if (table.currentPage >= table.totalPages) table.currentPage = table.totalPages;
        $scope.gridTable = updateTableDisplay($scope.gridTable);
    }

    function resetPageSize() {
        let pageCount = 1, pageRemainder = 0;
        let table = $scope.gridTable;
        table.pageSize = parseInt($scope.gridPageSize);
        table.totalPages = 1;
        if (table.pageSize > 0 && table.totalItems > table.pageSize) {
            pageCount = table.totalItems / table.pageSize;
            pageRemainder = table.totalItems % table.pageSize;
            table.totalPages = pageCount + (pageRemainder > 0 ? 1 : 0);
        }
        table.currentPage = 0;
        $scope.gridTable = updateTableDisplay(table);
    }

    function convertObjectArrayToGridDataObject(rawData, pageSize) {
        var result = createGridTableObject(rawData, pageSize);
        result.totalItems = rawData.length;
        let pageCount = 1, pageRemainder = 0;
        if (pageSize > 0 && rawData.length > result.pageSize) {
            pageCount = rawData.length / result.pageSize;
            pageRemainder = rawData.length % result.pageSize;
        }

        result.totalPages = pageCount + (pageRemainder > 0 ? 1 : 0);
        for (let index = 0; index < rawData.length; index++) {
            if (result.columns.length <= 0) {
                result.columns = createDataColumns(rawData[index]);
            }
            result.rows.push(createDataRow(result.columns, rawData[index]));
        }
        return result;
    }

    function convertObjectToGridDataObject(rawData, pageSize) {
        var result = createGridTableObject(rawData, pageSize);
        var columns = createDataColumns(rawData);

        if (columns.indexOf('items') >= 0) {
            result = convertPagedListObjectToGridDataObject(rawData);
            return result;
        }

        if (columns.indexOf('rows') >= 0 && columns.indexOf('columns') >= 0) {
            result = convertDataTableObjectToGridDataObject(rawData);
            return result;
        }

        result.columns = columns;
        result.rows.push(createDataRow(columns, rawData));
        result.totalItems = 1;
        result.totalPages = 1;
        return result;
    }

    function convertDataTableObjectToGridDataObject(rawData, pageSize) {
        var result = createGridTableObject(rawData, pageSize);
        let totalRecords = 0, totalPages = 0;
        if (rawData.rows !== null && rawData.rows !== undefined) {
            totalRecords = rawData.rows.count;
            let pageCount = 1, pageRemainder = 0;
            if (pageSize > 0 && totalRecords > result.pageSize) {
                pageCount = totalRecords / result.pageSize;
                pageRemainder = totalRecords % result.pageSize;
            }
            totalPages = pageCount + (pageRemainder > 0 ? 1 : 0);
        }

        result.columns = createDataColumnsFromDataTable(rawData);

        for (var item in rawData.rows) {
            result.rows.push(createDataRow(result.columns, item));
        }
        return result;
    }

    function convertPagedListObjectToGridDataObject(rawData, pageSize) {
        var result = createGridTableObject(rawData, pageSize);
        let totalRecords = 0, totalPages = 0;
        if (rawData.totalRecords !== null && rawData.totalRecords !== undefined) {
            totalRecords = rawData.totalRecords;
        }
        if (rawData.totalPages !== null && rawData.totalPages !== undefined) {
            totalPages = rawData.totalPages;
        }

        for (var item in rawData.items) {
            if (result.columns.length <= 0) {
                result.columns = createDataColumns(item);
            }
            result.rows.push(createDataRow(result.columns, item));
        }

        return result;
    }

    function createDataColumns(obj) {
        var result = [];

        if (obj === null || obj === undefined) return result;
        let keySet = Object.keys(obj);
        for (let x = 0; x < keySet.length; x++) {
            result.push(keySet[x]);
        }
        return result;
    }

    function createDataRow(columns, dataRow) {
        let result = {};
        if (columns.length <= 0) return result;
        if (dataRow === undefined || dataRow === null) return result;
        for (let x = 0; x < columns.length; x++) {
            var col = columns[x];
            result[col] = dataRow[col];
        }
        return result;
    }

    function createDataColumnsFromDataTable(obj) {
        var result = [];
        if (obj === null || obj === undefined) return result;
        if (obj.columns === null || obj.columns === undefined) return result;

        for (let x = 0; x < obj.columns.length; x++) {
            var col = obj.columns[x];
            result.push(col.columnName);
        }

        return result;
    }

    function createGridTableObject(rawData, pageSize) {
        var result = new gridTableObject();
        result.rawData = rawData;
        result.pageSize = pageSize;
        return result;
    }

}

function gridTableObject() {
    this.columns = [];
    this.rows = [];
    this.rawData = null;
    this.displayRows = [];
    this.totalItems = 0;
    this.totalPages = 0;
    this.pageSize = 10;
    this.currentPage = 0;
}
