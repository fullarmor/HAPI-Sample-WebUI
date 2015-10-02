app.controller('DeviceSharesController', function ($scope, $compile, $http, $location) {
    $scope.Shares = [];
    $scope.GetShares = function () {

        contextAgentId = contextItem.AgentId;
        var urlSuffix = "/route/hapi/Directory/GetFilesAndFolders";
        if (contextAgentId > -1)
            urlSuffix = "/route/agent/" + contextAgentId + "/Share/GetFilesAndFolders"; // Note: individual "Share", not "Shares"

        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");
        
        var postData = JSON.stringify({ FileIdentifier: contextItem.FileIdentifier, filters: [], MaxLevels: "0" });

        $('#main').css( 'cursor', 'wait' );
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
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            if( status == 500)
            {
                $("#naviDataTable > tbody").html('<i class="fa fa-info-circle hapi-row-icon"></i>The agent for device ' + contextItem.ComputerName + ' seems to be offline.');
            }
            else
                HandleStatus(status, 'DeviceSharesController');
              $('#main').css( 'cursor', 'default' );
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
