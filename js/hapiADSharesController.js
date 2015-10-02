app.controller('ADSharesController', function ($scope, $compile, $http, $location) {
    $scope.Shares = [];
    $scope.GetShares = function () {

        var urlSuffix = "/route/hapi/Shares/GetFilesAndFolders";
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");
        
        var postData = JSON.stringify({ fileIdentifier: "", filters: "[]" });

        // Simple POST request example (passing data) :
        $http({
            url: _Url,
            method: "POST",
            data: postData,
            headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken }
        }).
          success(function (data, status, headers, config) {
              // this callback will be called asynchronously
              // when the response is available
              $scope.Shares = data.Items;
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status, 'ADSharesController');
          });
        
    };

    $scope.selectedItem = null;
    $scope.setSelected = function (item) {
        $scope.selectedItem = item;
    };
    
    $scope.Login = function navigate() {
        window.location = "hapi_login.html";
    }

});
