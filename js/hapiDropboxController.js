app.controller('DropboxController', function ($scope, $compile, $http, $location) {
    $scope.FilesAndFolders = [];
    $scope.GetFilesAndFolders = function () {
        var urlSuffix = "/route/hapi/Dropbox/GetFilesAndFolders"; // Note: individual "Share", not "Shares"
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");

        var postData = JSON.stringify({ fileIdentifier: contextItem.FileIdentifier, filters: "[]" });
        
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
              ToUIModel(data.Items);
              $scope.FilesAndFolders = data.Items;

              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              HandleStatus(status, "DropboxController", headers);
              $('#main').css( 'cursor', 'default' );
          });
        
    };
    
    $scope.selectedItem = null;
    $scope.setSelected = function (item) {
        $scope.selectedItem = item;
    };

    $scope.destinationFolder = null;
    $scope.setDestinationFolder = function (item) {
        $scope.destinationFolder = item;
    };
    
    $scope.promptDeleteSelectedItems = function () {
        selectedItem = $scope.selectedItem;
        
        var header = 'Delete Confirmation';
        var message = "Are you sure you want to delete " + selectedItem.Name + "?";
        var form = $('<div class="form-group"><label class="control-label">' + message + '</label></div>');
        var delUrl = _hapiServer + "/route/hapi/Dropbox/DeleteFiles";
        var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="DeleteSelectedItems(\''+ delUrl + '\',' + '\'#DropboxController\'); return false;">Delete</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);            
    };

    $scope.promptCopy = function () {
        $scope.GetFolders(contextItem.FileIdentifier, '.preloader');
        $("#modalCopyPrompt").modal('show');    
    }
});


 