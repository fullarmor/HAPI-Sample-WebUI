app.controller('SharePointSitesController', function ($scope, $compile, $http, $location) {
    $scope.Shares = [];
    $scope.GetShares = function () {

        var urlSuffix = "/api/SharepointSite/GetSharepointSites";
        _Url = _hapiServer + urlSuffix;
        //console.log(_Url);

        var hapiToken = $.cookie("hapiToken");
        
        var postData = JSON.stringify({ fileIdentifier: "", filters: "[]" });
        //console.log("PostData: " + postData);

        $('#main').css( 'cursor', 'wait' );
        
        // Simple POST request example (passing data) :
        $http({
            url: _Url,
            method: "GET",
            data: postData,
            headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken }
        })
        .success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            //console.dir(data);
            
            $scope.Shares = jQuery.map(data, function (serverString) {
                var myObject = new Object();
                myObject.Name = serverString;
                myObject.FileIdentifier = serverString;
                return myObject;//JSON.stringify(myObject);                
            });
            
            $('#main').css( 'cursor', 'default' );
        })
        .error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            HandleStatus(status, 'SharePointSitesController', headers, data);
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

   $scope.addSharepointSite = function () {
       var siteUrl = $("#SharePointSiteUrl").val();
       $('#addSharePointSiteDialog').modal('hide');
        //showLoadingIndicator();
        $('#main').css( 'cursor', 'wait' );

        // Simple POST request example (passing data) :
        var urlSuffix = "/api/SharepointSite/AddSharepointSite";
        _Url = _hapiServer + urlSuffix;
        $http({
            url: _Url,
            method: "POST",
            dataType: "json",
            data: JSON.stringify({ SiteUrl: siteUrl, Filters: [] }),
            headers: { 'Content-Type': 'application/json', 'hapiToken': $.cookie("hapiToken") }
        })
        .success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            //console.dir(data);

            $scope.GetShares(); // Populate the view to show the changes
            $('#main').css( 'cursor', 'default' );
        })
        .error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            HandleStatus(status, 'SharePointSitesController', headers, data);
            $('#main').css( 'cursor', 'default' );
        });
    }

    $scope.promptAddSharePointSite = function () {
        PromptAddSharePointSite();
    }
    
    $scope.promptRemoveSelectedSharePointSite = function () {
        selectedItem = $scope.selectedItem;
        
        var header = 'Remove SharePoint Site Confirmation';
        var message = "Are you sure you want to remove " + selectedItem.Name + "?";
        var form = $('<div class="form-group"><label class="control-label">' + message + '</label></div>');
        //var delUrl = _hapiServer + "/route/hapi/Share/DeleteFiles";
        var buttons = $('<div class="text-center"><a href="#" class="btn btn-primary" onclick="RemoveSharePointSite(\'' + selectedItem.Name + '\'); return false;">Remove</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);            
    };
   
    RemoveSharePointSite = function(siteUrl){
        var scope = angular.element('#SharePointSitesController').scope();
        scope.removeSharepointSite(siteUrl);
    }
    
    $scope.removeSharepointSite = function (siteUrl) {
        $('#main').css( 'cursor', 'wait' );
        var urlSuffix = "/api/SharepointSite/RemoveSharepointSite";
        _Url = _hapiServer + urlSuffix;
        
        $http({
            url: _Url,
            method: "POST",
            dataType: "json",
            data: JSON.stringify({ SiteUrl: siteUrl }),
            headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken }
        })
        .success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            //console.dir(data);

            $scope.GetShares(); // Populate the view to show the changes
            $('#main').css( 'cursor', 'default' );
        })
        .error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            HandleStatus(status, 'SharePointSitesController');
            $('#main').css( 'cursor', 'default' );
        });
    }    
});
