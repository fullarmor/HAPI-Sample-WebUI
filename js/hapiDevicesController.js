app.controller('DevicesController', function ($scope, $compile, $http, $location) {
    $scope.Devices = [];
    $scope.GetDevices = function () {

        contextAgentId = -1;  //reset the context agent id until the user picks a new device
        var urlSuffix = "/api/Configuration/GetAllComputers";
        _Url = _hapiServer + urlSuffix;
        //console.log(_Url);

        var hapiToken = $.cookie("hapiToken");//localStorage["HAPI.Token"];
        //console.log("hapiToken: " + hapiToken);

        var rawData = {
            FileIdentifier: "",
            Filters: [{
                    FilterTypeInt: "12",
                    FilterOperationInt: "3",
                    FilterValueTypeInt: "2",
                    FilterValue: ""
                }]
        };
        var postData = JSON.stringify(rawData);
        //console.log("PostData: " + postData);

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

              // TO UI Model
              for (var i = 0, len = data.length; i < len; i++) {
                  var item = data[i];
                  item.FileIdentifier = "\\\\" + item.ComputerName;
                  //item.AgentIcon = item.AgentId > -1 ? "fa-check" : "";
                  item.AgentIcon = "";
                  if( item.AgentId > -1 )
                  {
                      if( item.OperatingSystem != null )
                      {
                          if( item.OperatingSystem.lastIndexOf("Microsoft", 0) === 0 ||
                              item.OperatingSystem.lastIndexOf("Windows", 0) === 0)
                              item.AgentIcon = "fa-windows";
                          else if( item.OperatingSystem.lastIndexOf("Mac OS X", 0) === 0 )
                              item.AgentIcon = "fa-apple";
                      }
                      
                      if( item.AgentIcon === "" )
                          item.AgentIcon = "fa-gear";
                      
                      item.FileIdentifier = "/";
                  }
              }

              // Bind
              $scope.Devices = data;
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status);
              $('#main').css( 'cursor', 'default' );
          });
    };

    $scope.selectedItem = null;
    $scope.setSelected = function (item) {
        $scope.selectedItem = item;
    };
    
});
