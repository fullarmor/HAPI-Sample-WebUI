app.controller('LinksController', function ($scope, $compile, $http, $location) {
    $scope.Links = [];
    $scope.GetLinks = function () {

        var urlSuffix = "/api/SharedFile/GetSharedFiles";
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");

        var postData = JSON.stringify({ Provider: "None", IncludeExpired: true, FileIdentifier_Checksum: 0, UserSID: "" });

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
              ToUILinksModel(data.Items);
              $scope.Links = data.Items;
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

    $scope.clickLink = function(item) {
        var url = item.LinkUrl;
                
        var f = document.createElement("FORM");
        f.action = url;

        var indexQM = url.indexOf("?");
        if (indexQM>=0) {
            // the URL has parameters => convert them to hidden form inputs
            var params = url.substring(indexQM+1).split("&");
            for (var i=0; i<params.length; i++) {
                var keyValuePair = params[i].split("=");
                var input = document.createElement("INPUT");
                input.type="hidden";
                input.name  = keyValuePair[0];
                input.value = keyValuePair[1];
                f.appendChild(input);
            }
        }
        
        var token = document.createElement("INPUT");
        token.type="hidden";
        token.name  = "HAPIToken";
        token.value = $.cookie("hapiToken");
        f.appendChild(token);
        
        f.submit();
    }
    
    $scope.showSharingPropertiesDialog = function(item, showStopSharingButton){
        ShowSharingPropertiesDialog(item, showStopSharingButton);
    }
    
    $scope.StopSharing = function (linkUrlToUnshare) {
        
        var urlSuffix = "/api/SharedFile/RemoveSharedFile";
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");

        var postData = {
                SharedFileUrl: linkUrlToUnshare,
            };        

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
            
              $scope.GetLinks(); // Fetch updated Links
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status);
              $('#main').css( 'cursor', 'default' );
          });
    };
});

function ToUILinksModel(items) {
    
    var dateNow = new Date();
    for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        
        item.Type = 1;
        item.IconClass = item.Type == 1 ? "fa-file" : "fa-folder-o"; // set row icon

        item.FileName = item.FileIdentifier.substring(item.FileIdentifier.lastIndexOf("\\")+1);
        
        item.sharedLinkVisibility = "hidden";
        item.sharedLinkTooltip = "";
        item.StatusText = item.Expired == true ? "Expired" : "Active";
        item.StatusIcon = item.Expired == true ? "fa-times" : "fa-check-circle";

        // Add property for row icon.
        item.PathType = "Document";
        item.FormattedBytes = FormattedBytes(item.Size);

        item.ExpirationDateFormatted = toLocalDate(item.ExpirationDate);
        
        if (item.Expired == false) {
            item.IconClass = "fa-link";
            item.sharedLinkVisibility = "visible";
            item.sharedLinkTooltip = item.FileIdentifier + "\r\n\r\nThis file is shared.  Share expires: " + toLocalDate(item.ExpirationDate) + "\r\n\r\nLink:\r\n" + item.LinkUrl;
        }
        
        if( item.Sharer != null )
        {
            item.SharedByUsername = item.Sharer.DisplayName;
        }
    }
}

function StopSharing() {
    var linkUrlToUnshare = $('#sharedFileLinkAnchor').attr('href');
    
    var controllerScope;
    
    // Try Links Controller First
    var controller = angular.element('#LinksController');
    if( controller != undefined )
        controllerScope = controller.scope();
    
    // Try Files Controller
    if( controller == undefined || controllerScope == undefined)
    {
        controller = angular.element('#ADFilesController');
        controllerScope = controller.scope();
    }
    
    // Tell the Controller's scope to unshare
    if( controllerScope != undefined)
        controllerScope.StopSharing(linkUrlToUnshare);
}
