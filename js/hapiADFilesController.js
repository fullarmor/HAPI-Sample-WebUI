app.controller('ADFilesController', function ($scope, $compile, $http, $location) {
    $scope.FilesAndFolders = [];
    $scope.GetFilesAndFolders = function () {
        var urlSuffix = "/route/hapi/Share/GetFilesAndFolders"; // Note: individual "Share", not "Shares"
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
          }).error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status, "ADFilesController", headers, data);
              $('#main').css( 'cursor', 'default' );
          });
    };

    $scope.Folders = [];
    $scope.GetFolders = function (fileIdentifier) {
        $('.preloader').show();

        $scope.Folders = [];
        $scope.destinationFolder = null; // clear the selected folder, if any
        
        var urlSuffix = "/route/hapi/" + folderPickerProvider + "/GetFilesAndFolders"; // Note: individual "Share", not "Shares"
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");

        var postData = JSON.stringify({ FileIdentifier: fileIdentifier, Filters: "[]", MaxLevels: "0"});

        $('#main').css( 'cursor', 'wait' );
        // Simple POST request example (passing data) :
        $http({
            url: _Url,
            method: "POST",
            data: postData,
            headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken }
        }).
          success(function (data, status, headers, config) {
            	$('.preloader').hide();

              // this callback will be called asynchronously
              // when the response is available
            
                var items = jQuery.map(data.Items, function (item) {
                    if( item.Type == 2 )
                        return item;
                });
            
              ToUIModel(items);
              $scope.Folders = items;
            
            if( folderPickerProvider == "shares" )
                folderPickerProvider = "Share";
            
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
        var delUrl = _hapiServer + "/route/hapi/Share/DeleteFiles";
        var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="DeleteSelectedItems(\'' + delUrl + '\',' + '\'#ADFilesController\'); return false;">Delete</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);            
    };

    $scope.promptCopy = function (provider) {
        folderPickerProvider = provider;
        $scope.GetFolders("");
        $("#modalCopyPrompt").modal('show');    
        
        var currentDate = moment().format('YYYY-MM-DD');
        $('#copystartdate').val( moment(currentDate).toNow() );        
        $('#copystarttime').val("Today, in a few seconds");
    }

    $scope.copySelectedItemsToDestination = function(){
        var selectedItem = $scope.selectedItem;
        selectedItem.TargetFileName = selectedItem.FileIdentifier.substring(selectedItem.FileIdentifier.lastIndexOf('\\') + 1);

        if( selectedItem.Type == 2 )
            selectedItem.IsFolder = "True"
        else
            selectedItem.IsFolder = "False";

        
        /////////////////////////////////////////
        // Get Conflict setting from UI
        //var collisionBehavior = "KeepBoth";
        var collisionBehavior = $("#copyFileConflictSection > input:radio[name=collisionBehavior]:checked").val();
        if (collisionBehavior) {
            // Save the user's default file conflict handling preference
            if ($('#copyFileConflictSection').find('#rememberCollisionSetting').prop('checked')) {
                collisionBehavior = $("#copyFileConflictSection > input:radio[name=collisionBehavior]:checked").val();
                setSetting("collisionBehavior", collisionBehavior);
            } else {
                deleteSetting("collisionBehavior");
            }
        }
        else
            collisionBehavior = "KeepBoth"
        
        
        /////////////////////////////////////////
        // Get Copy When from UI
        var isOneTime = "True";
        /*
        var domElement = $("#copyWhenPicker")[0];
        var dateTimeString = $('#copyDateTimeInput1').val() + "T" + $('#copyDateTimeInput2').val();
        var dt;
        if(IsIE() == true)
            dt = new Date(dateTimeString); //new Date(new Date(dateTimeString).getTime() + tzOffset);
        else
            dt = new Date(new Date(dateTimeString).getTime() + tzOffset);

        switch (domElement.selectedIndex) {
            case 0: {
                break;
            }

            case 1: {
                break;
            }

            case 2: {
                isOneTime = "False";
                break;
            }
        }*/
        
        var hapiToken = $.cookie("hapiToken");
        var postData = {
            TargetProvider: folderPickerProvider,//"share",
            TargetFolderIdentifier: $scope.destinationFolder.FileIdentifier,
            CollisionHandling: collisionBehavior,
            Interval: "5",
            IntervalUnit: "1",
            NextRunTime: null,

            /*
            SourceFiles: $.map(folderpickerModel.sourceItems, function (sourceItem) {
                return {
                    FileIdentifier: sourceItem.FileIdentifier,
                    TargetFileName: sourceItem.Name,
                    IsFolder: sourceItem.Type == 2
                };
            }),*/
            
            SourceFiles: [$scope.selectedItem],            

            /*
            Interval: $('#copyIntervalAmount').val(), // a number
            IntervalUnit: $('#copyIntervalPicker').val(), // 0 = second, 1 = minute, 2 = hour, 3 = day
            */
            IsOneTime: isOneTime, // one time is copy now or deferred copy, but not scheduled
            /*NextRunTime: dt.getTime() / 1000*/
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
                //homeModel.loadItems();
                alert("Copy complete.");
            },
            error: function (xhr, status, text) {
                if (!handleAuthError(xhr, status)) {
                    alert(xhr.status + " : " + text);
                    //console.log(homeModel.ActiveProvider + "/" + homeModel.Method + ": " + xhr.responseText);
                }
            }
        });
    }
    
    $scope.promptShareFileAsLink = function() {
        //alert("Share Link");
        /*
        $('#confirmationMessage').text('Share the file?\r\n\r\n' + item.FileIdentifier + '\r\n\r\nThis will create a web browser link so that others may access the file.');
        document.getElementById('confirmationActionButton').onclick = function () {
            AddSharedFileRequest(item);
            $('#confirmationDialog').modal('hide');
        };

        $('#confirmationDialog').modal('show');*/
        
        selectedItem = $scope.selectedItem;
        
        var header = 'Share the File?';
        var message = selectedItem.FileIdentifier + "<br/><br/>This will create a web browser link that you can send to other people so they may access the file.";
        var form = $('<div class="form-group"><label class="control-label">' + message + '</label></div>');
        var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="ShareSelectedItem(); return false;">Share</a><a href="#" class="btn btn-primary" onclick="CloseModalBox();">Cancel</a></div>');
        OpenModalBox(header, form, buttons);            
        
    }
    
    $scope.downloadAndOpenItem = function(){
        var dlurl = _hapiServer + "/route/hapi/Share/Download?fileIdentifier=" + encodeURIComponent($scope.selectedItem.FileIdentifier) + "&HAPIToken=" + $.cookie("hapiToken"); 
        
        window.open(dlurl);
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
              $scope.GetFilesAndFolders(); // Fetch updated info
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status);
              $('#main').css( 'cursor', 'default' );
          });
    };
    
    $scope.downloadItem = function() {
        var dlurl = _hapiServer + "/route/hapi/Share/Download?fileIdentifier=" + encodeURIComponent($scope.selectedItem.FileIdentifier) + "&HAPIToken=" + $.cookie("hapiToken"); 
        
        window.location.href = dlurl;
    }
    
});

