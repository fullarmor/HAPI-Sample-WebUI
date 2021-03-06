app.controller('BoxController', function ($scope, $compile, $http, $location) {
    $scope.FilesAndFolders = [];
    $scope.GetFilesAndFolders = function () {
        var urlSuffix = "/route/hapi/Box/GetFilesAndFolders"; // Note: individual "Share", not "Shares"
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
              //console.dir(data);
              ToUIModel(data.Items, 'Box');
              $scope.FilesAndFolders = data.Items;
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status, "BoxController", headers);
              $('#main').css( 'cursor', 'default' );
          });
    };

    $scope.Folders = [];
    $scope.GetFolders = function (fileIdentifier, progressLoaderClass) {
        //$('.preloader').show();
        if( progressLoaderClass != null )
            $(progressLoaderClass).show();
        

        $scope.Folders = [];
        $scope.destinationFolder = null; // clear the selected folder, if any
        
        var urlSuffix = "/route/hapi/Share/GetFilesAndFolders"; // Note: individual "Share", not "Shares"
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");
        console.log("hapiToken: " + hapiToken);

        var postData = JSON.stringify({ FileIdentifier: fileIdentifier, Filters: "[]", MaxLevels: "0"});
        console.log("PostData: " + postData);

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
                if( progressLoaderClass != null )
                    $(progressLoaderClass).hide();

                var items = jQuery.map(data.Items, function (item) {
                    if( item.Type == 2 )
                        return item;
                });
            
              ToUIModel(items);
              $scope.Folders = items;
            
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
            	$('.preloader').hide();

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

    $scope.destinationFolder = null;
    $scope.setDestinationFolder = function (item) {
        $scope.destinationFolder = item;
    };
    
    $scope.itemClickHandler = function (item) {
        console.dir(item);
        if (item.Type == 1) {
            
            $("#modalDownloadPrompt").modal('show');
        }
    }
    
    $scope.promptNewFolder = function() {
        var header = 'New Folder';
        var message = "Create a new folder under " + contextItem.Name;
        var form = $('<fieldset><label class="control-label">' + message + '</label><br/><label class="control-label">Name:</label> <input id="folderName" type="text"/><br/></fieldset>');
        var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="CreateFolder(); return false;">Create</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);
    }
    
    $scope.promptDeleteSelectedItems = function () {
        selectedItem = $scope.selectedItem;
        
        var header = 'Delete Confirmation';
        var message = "Are you sure you want to delete " + selectedItem.Name + "?";
        var form = $('<div class="form-group"><label class="control-label">' + message + '</label></div>');
        var delUrl = _hapiServer + "/route/hapi/Box/DeleteFiles";
        var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="DeleteSelectedItems(\'' + delUrl + '\',' + '\'#BoxController\'); return false;">Delete</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);            
    };

    $scope.promptCopy = function () {
        $scope.GetFolders(contextItem.FileIdentifier, '.preloader');
        $("#modalCopyPrompt").modal('show');    
    }

    $scope.copySelectedItemsToDestination = function(){
        
        var selectedItem = $scope.selectedItem;
        selectedItem.TargetFileName = selectedItem.FileIdentifier.substring(selectedItem.FileIdentifier.lastIndexOf('\\') + 1);

        if( selectedItem.Type == 2 )
            selectedItem.IsFolder = "True"
        else
            selectedItem.IsFolder = "False";

        
        var isOneTime = "True";
        var collisionBehavior = "KeepBoth";
        var hapiToken = $.cookie("hapiToken");
        
        var postData = {
            TargetProvider: "share",
            TargetFolderIdentifier: $scope.destinationFolder.FileIdentifier,
            CollisionHandling: collisionBehavior,
            Interval: "5",
            IntervalUnit: "1",
            NextRunTime: null,

            SourceFiles: [$scope.selectedItem],            

            IsOneTime: isOneTime, // one time is copy now or deferred copy, but not scheduled
        };
        
        var urlSuffix = "/route/hapi/Share/CopyFiles"; // Note: individual "Share", not "Shares"
        _Url = _hapiServer + urlSuffix;        
        
        $.ajax({
            type: "POST",
            url: _Url,//homeModel.getRequestPath() + homeModel.ActiveProvider + "/CopyFiles",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(postData),
            headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken },
            success: function (data, status, xhr) {
                alert("Copy complete.");
            },
            error: function (xhr, status, text) {
                if (!handleAuthError(xhr, status)) {
                    alert(xhr.status + " : " + text);
                }
            }
        });
    }
    
    $scope.promptShareFileAsLink = function() {
        selectedItem = $scope.selectedItem;
        
        var header = 'Share the File?';
        var message = selectedItem.FileIdentifier + "<br/><br/>This will create a web browser link that you can send to other people so they may access the file.";
        var form = $('<div class="form-group"><label class="control-label">' + message + '</label></div>');
        var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="ShareSelectedItem(); return false;">Share</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);            
    }
    
    $scope.downloadAndOpenItem = function(){
        var dlurl = _hapiServer + "/route/hapi/Box/Download?fileIdentifier=" + encodeURIComponent($scope.selectedItem.FileIdentifier) + "&HAPIToken=" + $.cookie("hapiToken"); 
        
        window.open(dlurl);
    }

    $scope.showSharingPropertiesDialog = function(item, showStopSharingButton){
        ShowSharingPropertiesDialog(item, showStopSharingButton);
    }
    
    $scope.downloadItem = function() {
        var dlurl = _hapiServer + "/route/hapi/Box/Download?fileIdentifier=" + encodeURIComponent($scope.selectedItem.FileIdentifier) + "&HAPIToken=" + $.cookie("hapiToken"); 
        
        window.location.href = dlurl;
    }
});
