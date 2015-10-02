// Enums
var UserRoles = function () {
    return {
        'Unknown': "0",
        'User': "1",
        'ReadOnlyUser': "9",
        'Admin': "2",
        'ReadOnlyAdmin': "10",
        'System': "4",
        'None': "32"
    }
}();

var folderPickerProvider = "Shares"; // default is AD Shares. Can be Box, Dropbox, etc

// Add computed properties used by UI
function ToUIModel(items, provider) {
    if (items == null)
        return;
    
    var dateNow = new Date();
    for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        item.IconClass = item.Type == 1 ? "fa-file" : "fa-folder-o"; // set row icon

        item.sharedLinkVisibility = "hidden";
        item.sharedLinkTooltip = "";

        // Add property for row icon.
        if (item.Type == 1) {
            item.PathType = "Document";
            item.ImageSource = "./img/icons/" + GetFileTypeIcon(item.Name);
            //if (self.ActiveProvider == "SP")
            //    item.FormattedBytes = "";
            //else
                item.FormattedBytes = FormattedBytes(item.Size);

            if (item.SharedInfo != null && item.SharedInfo.Expired == false) {
                item.IconClass = "fa-link";
                item.sharedLinkVisibility = "visible";
                item.sharedLinkTooltip = item.FileIdentifier + "\r\n\r\nThis file is shared.  Share expires: " + toLocalDate(item.SharedInfo.ExpirationDate) + "\r\n\r\nLink:\r\n" + item.SharedInfo.LinkUrl;
            }

            self.itemCount++;
        } else if (item.Type == 2) {
            item.PathType = "Folder";
            item.ImageSource = "./img/icons/iconFOLDER-64.png";
            item.FormattedBytes = ""; // no size for folder
            self.groupCount++;
        } else if (item.Type == 6) {
            item.PathType = "Mail";
            item.ImageSource = "/Areas/UI/Content/img/icons/" + self.ActiveProvider + "/MailIcon.png";
            item.FormattedBytes = item.Version; //"";//FormattedBytes(item.Size);
            self.groupCount++;
        }

        item.FriendlyPath = FormattedPath(provider, item.FileIdentifier);
        item.CreationDateFormatted = toLocalDate(item.CreationDate);
        item.LastModified = toLocalDate(item.LastModifiedDate);
        if (item.LastModified != "") {
            item.DaysSinceModified = DateDiffInDays(dateNow, new Date(item.LastModifiedDate));
            item.DaysSinceModifiedString = item.DaysSinceModified + " days ago"; // Display the string but keep the number separate to calculate color representing age
            item.DaysSinceModifiedColor = GetFileModifiedColor(item.DaysSinceModified);
        }
        else {
            item.DaysSinceModified = item.DaysSinceModifiedString = "";
            item.DaysSinceModifiedColor = "#FFFFFF00"; // transparent
        }
        //this check is added for IE compatability. This field was undefined in IE without this.
        if (item.DaysSinceModifiedString == undefined) {
            item.DaysSinceModifiedString = "";
        }

    }
}

function DateDiffInDays(dt1, dt2) {
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate());
    var utc2 = Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate());

    return Math.floor((utc1 - utc2) / _MILLISECONDS_PER_DAY);
}

function GetFileExtension(filename) {

    if (filename == null || filename == "")
        return "";

    var a = filename.split(".");
    if (a.length === 1 || (a[0] === "" && a.length === 2)) {
        return "";
    }
    return a.pop().toLowerCase();
}

function GetFileTypeIcon(filename) {
    var ext = GetFileExtension(filename);

    switch (ext) {
        case "avi":
            return "iconAVI-96.png";
            break;
        case "css":
            return "iconCSS-96.png";
            break;
        case "dll":
            return "iconDLL-96.png";
            break;
        case "doc":
            return "iconDOC-96.png";
            break;
        case "docx":
            return "iconDOCX-96.png";
            break;
        case "eps":
            return "iconEPS-96.png";
            break;
        case "htm":
            return "iconHTM-96.png";
            break;
        case "html":
            return "iconHTML-96.png";
            break;
        case "jpg":
            return "iconJPG-96.png";
            break;
        case "jpeg":
            return "iconJPEG-96.png";
            break;
        case "mp3":
            return "iconMP3-96.png";
            break;
        case "pdf":
            return "iconPDF-96.png";
            break;
        case "png":
            return "iconPNG-96.png";
            break;
        case "ppt":
            return "iconPPT-96.png";
            break;
        case "pptx":
            return "iconPPTX-96.png";
            break;
        case "psd":
            return "iconPSD-96.png";
            break;
        case "txt":
            return "iconTXT-96.png";
            break;
        case "wav":
            return "iconWAV-96.png";
            break;
        case "xls":
            return "iconXLS-96.png";
            break;
        case "xlsx":
            return "iconXLSX-96.png";
            break;
        case "zip":
            return "iconZIP-96.png";
            break;

/*
        case "vsd":
        case "vsdx":
            return "Visio2013Icon.png";
            break;

        case "bmp":
        case "jpg":
        case "png":
        case "gif":
        case "psd":
        case "tga":
        case "tif":
        case "tiff":
            return "PictureIcon.png";
            break;

        case "7z":
        case "zip":
            return "ZipFileIcon.png";
            break;
*/
        default:
            return "iconFile-96.png";
            break;    }

    return "iconFile-96.png";
}

function FormattedBytes(bytes) // for this provider
{
    var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var len = bytes;
    var order = 0;

    while (len >= 1024 && ((order + 1) < sizes.length)) {
        order++;
        len = len / 1024;
    }

    var formatted = String.Format("{0} {1}", Math.round(len, 1), sizes[order]); // 1 decimal place + size suffix

    // If fewer bytes than 1KB, prepend with '<' sign
    if (order == 0 && len < 1) {
        // formatted = "<1 KB";
        formatted = bytes + " B";
    }

    return formatted;
}

function FormattedPath(provider, path) {
    var formatted = path;
    if (provider == "Box") {
        var pos = path.indexOf("\\");
        formatted = path.slice(pos + 1);
    } if (provider == "Office 365 email") {
        var pos = path.indexOf("@");
        var p1 = path.substring(0, pos);
        p1 = p1 + "') Messages/Attachments";
        pos = path.lastIndexOf("/");
        p2 = path.substring(pos);
        formatted = p1 + p2;
    }
    return formatted;
}

String.Format = function (b) {
    var a = arguments;
    return b.replace(/(\{\{\d\}\}|\{\d\})/g, function (b) {
        if (b.substring(0, 2) == "{{") return b;
        var c = parseInt(b.match(/\d/)[0]);
        return a[c + 1]
    })
};

function GetFileModifiedColor(daysSinceModified) {

    var minValue = 0;
    var maxValue = 90;
    //Set color range. Default's to reddish and greenish.
    //It takes an array of three
    //integers as R, G and B values.
    var minColorValue = [255, 0, 64];
    var maxColorValue = [0, 160, 255];

    var maxcv = maxColorValue;
    var mincv = minColorValue;
    var maxv = maxValue;
    var minv = minValue;
    var diff = maxv - minv;

    var x = Math.max(minValue, Math.min(maxValue, daysSinceModified)); // Clamp the number inside the valid range
    //var x = 46;

    // linear interpolation
    var comp = function (i, x) {
        return Math.round((((maxcv[i] - mincv[i]) / diff) * (x - minv) + mincv[i]));
    };

    var result = rgbToHex([comp(0, x), comp(1, x), comp(2, x)]);
    return result;

}

function rgbToHex(srcArray, array) {
    if (srcArray.length < 3) return null;
    if (srcArray.length == 4 && srcArray[3] == 0 && !array) return 'transparent';
    var hex = [];
    for (var i = 0; i < 3; i++) {
        var bit = (srcArray[i] - 0).toString(16);
        hex.push((bit.length == 1) ? '0' + bit : bit);
    }
    return (array) ? hex : '#' + hex.join('');
};

function GetFormattedInterval(scheduleObj) {
    if ((scheduleObj == null) || (scheduleObj.Interval == 0))
        return "";

    return scheduleObj.Interval.toString() + " " + IntervalTypeToString(scheduleObj.IntervalUnit);
}


function GetJobStatusString(statusNumber) {

    if (statusNumber == null)
        return "Unknown";

    switch (Number(statusNumber)) { // convert enum number to string
        case 0:
            return "New";
            break;
        case 1:
            return "Finished";
            break;
        case 2:
            return "Finished with error";
            break;
        case 3:
            return "Failed";
            break;
        case 4:
            return "Running";
            break;
        case 5:
            return "Suspended";
            break;
        case 6:
            return "Pending credentials";
            break;
        case 7:
            return "Cancelled";
            break;
        case 8:
            return "Scheduled";
            break;
            //case 9:
            //job.status = "All";
            //    break;
    }

    return statusNumber.toString();
}

function GetJobTypeString(jobTypeNumber) {
    switch (Number(jobTypeNumber)) { // convert enum number to string
        case 0:
            return "Copy";
            break;
        case 1:
            return "Move";
            break;
        case 2:
            return "Sync";
            break;
        case 3:
            return "Search";
            break;
        case 4:
            return "System";
            break;
    }

    return jobTypeNumber;
}

function GetProviderString(providerNumber) {
    switch (Number(providerNumber)) { // convert enum number to string
        case 0:
            return "";
            break;
        case 1:
            return "My Domain";
            break;
        case 2:
            return "SharePoint";
            break;
        case 3:
            return "Box";
            break;
        case 4:
            return "Dropbox";
            break;
        case 5:
            return "Cubby";
            break;
        case 6:
            return "Print";
            break;
        case 7:
            return "SharePoint Online";
            break;
        case 8:
            return "OneDrive for Business";
            break;
        case 9:
            return "Office 365 email";
            break;
    }

    return providerNumber;
}

function IntervalTypeToString(intervalType) {
    switch (intervalType) {
        case 0:
            return "Seconds";
        case 1:
            return "Minutes";
        case 2:
            return "Hours";
        case 3:
            return "Days";
        default:
            return "(unknown interval type: " + intervalType + ")";
    }
}


function HandleStatus(status, controllerName, headers, text) {
    switch (status) {
        case 401:
            console.log("Need to Login");
            ShowLogin();
            break;

        case 403:
            console.log("Forbidden: " + status);
            break;
            
        case 404:
            if (text != null)
                alert(text)
            else
                alert(status)
            break;

        case 500:
            if( headers )
            {
                var header = headers("HAPI-Reset-Provider");
                if (header) {   
                    window.location.url = 'ajax/hapiADShares.html';
                    //LoadAjaxContent(url);
                    return true;
                }
                header = headers('HAPI-External-Auth-Required');
                console.log("HAPI-External-Auth-Required: " + header);
                if (header) {
                    window.location.href = header;
                    return true;
                }
                else
                {
                    alert("Error:\r\n" + status + ":" + text + "\r\n");
                    return false;
                }
            }
            else
            {
                alert("Error:\r\n" + status + ":" +  text + "\r\n");
                return false;
            }
            break;
            
        default:
            alert("Error:\r\n" + status);
            break;
    }
}

function HandleError(xhr, status) {
    switch (xhr.status) {
        case 401:
            console.log("Need to Login");
            ShowLogin();
            return true;

        case 403:
            console.log("Forbidden: " + xhr.responseText);
            return true;
            
        case 404:
            alert(xhr.responseText)
            return true;

        case 500:
            var header = xhr.getResponseHeader("HAPI-Reset-Provider");
            if (header) {   
                window.location.href = 'ajax/hapiADShares.html';
                //LoadAjaxContent(url);
                return true;
            }
            header = xhr.getResponseHeader("HAPI-External-Auth-Required");
            console.log("HAPI-External-Auth-Required: " + header);
            if (header) {
                window.location.href = CreateNewRedirectDropboxUrl(header);
                return true;
            }
            
            alert("Error:\r\n" + status + "\r\n" + JSON.stringify(xhr));
            return false;
            
        default:
            alert("Error:\r\n" + status + "\r\n" + xhr);
            return false;
    }
    
    return false;
}

function CreateNewRedirectDropboxUrl(oldUrl)
{
    pos = oldUrl.lastIndexOf('&')
    firstPart = oldUrl.substring(0, pos)
    lastPart = oldUrl.substring(pos)
    fullurl = firstPart + '|' + location.protocol + '//' + location.host + lastPart
    return fullurl
}

function GetUserFromSid(sid, callback) {
    if (callback == null)
        return;
    
    var postData = {
    };

    $.ajax({
        type: "GET",
        url: _hapiServer + "/route/hapi/Directory/GetUserBySid?userSID=" + sid,
        headers: { 'Content-Type': 'application/json', 'hapiToken': $.cookie("hapiToken") },
        success: function (user, status, xhr) {
            callback(user);
        },
        error: function (xhr, status, text) {
            if (!HandleError(xhr, status)) {
                console.log("GetUserFromSid: " + xhr.responseText);
            }
        }
    });
}

function DeleteSelectedItems(url, controller) {
    var postData = {
        FileIdentifiers: [selectedItem.FileIdentifier]
    }

    $('#main').css( 'cursor', 'wait' ); // cursor is set back to normal default in GetFilesAndFolders.
    $.ajax({
        type: "POST",
        url: url,
        //contentType: "application/json; charset=utf-8",
        headers: { 'Content-Type': 'application/json', 'hapiToken': $.cookie("hapiToken") },
        //dataType: "json", // intentionally remove dataType json to avoid error, as this method doesn't return anything
        data: JSON.stringify(postData),
        async: false, // force synchronous
        success: function (data, status, xhr) {
            // Reload the view data
            CloseModalBox();
            
            // Pause and then refresh
            var scope = angular.element(controller).scope();
            setTimeout(function() { 
                scope.GetFilesAndFolders() 
            }, 3000);
            
            // Close and Reset
            selectedItem = null;
        },
        error: function (xhr, status, text) {
            
            // Close and Reset
            $('#main').css( 'cursor', 'default' );
            CloseModalBox();
            selectedItem = null;
            HandleError(xhr, status);
        }
    });
}

function ShareSelectedItem() {
    
    var currentdate = new Date();
    var userSID = $.cookie("HAPI.UserSID");

    var postData = {
        Provider: "Share",
        FileIdentifier: selectedItem.FileIdentifier,
        DateShared: currentdate,
        UserSID: userSID,
        //AgentId: homeModel.agentId
    };

    if (postData.AgentId == undefined) {
        postData.AgentId = -1;
    }

    $.ajax({
        type: "POST",
        url: _hapiServer + "/api/SharedFile/AddSharedFile",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(postData),
        headers: { 'Content-Type': 'application/json', 'hapiToken': $.cookie("hapiToken") },
        
        success: function (data, status, xhr) {
            CloseModalBox();
            ShowSharingPropertiesDialog(data, false);
        },
        error: function (xhr, status, text) {
            alert("Share File Link Failed");
            if (xhr.status == 403) {
                alert(xhr.responseText);
                console.log("Forbidden: " + xhr.responseText);
            }
            else if (!handleAuthError(xhr, status)) {
                alert(xhr.status + " : " + text);
                console.log("DeleteItem: " + xhr.responseText);
            }
        }
    });
    
}

function CreateFolder(){

    var newName = $('#folderName').val();
    var fileIdentifier = contextItem.FileIdentifier;
    //alert("Create Folder " + folderName + " at " + contextItem.Name);
    
    if( fileIdentifier == null || newName == null )
    {
        alert("To create a folder, you must supply its name and location.");
        return;
    }

    var hapiToken = $.cookie("hapiToken");
    var url = _hapiServer + "/route/hapi/Share/CreateFolder"; // Note: individual "Share", not "Shares"

    var postData = { 
        NewName : newName,
        FileIdentifier : fileIdentifier
    };
    
    
    $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(postData),
        headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken },
        async: true,
        success: function (data, status, xhr) {
            //homeModel.loadItems();
            var scope = angular.element('#ADFilesController').scope();
            scope.GetFilesAndFolders();
            CloseModalBox();
        },
        error: function (xhr, status, text) {
                alert(xhr.status + " : " + text);
        }
    });
}


function ShowSharingPropertiesDialog(item, showStopSharingButton) {
    // from files view, we get a file item with SharedInfo property.  From Links view, we get SharedInfo object directly.
    var sharedInfo = GetSharedInfo(item)

    $('#sharedFilePathName').text(sharedInfo.FileIdentifier);
    $('#sharedFileLinkAnchor').attr("href", sharedInfo.LinkUrl);
    $('#sharedFileLinkAnchor').text(sharedInfo.LinkUrl);

    var userName = "HAPI user";
    var userRole = "";
    if (sharedInfo != null && sharedInfo.Sharer != null) {
        userName = sharedInfo.Sharer.DisplayName;
        userRole = GetUserRole(sharedInfo.Sharer.Role);
    }

    $('#sharedByUsername').text(userName);
    $('#sharedByUserRole').text(userRole);

    var expirationDate = new Date(sharedInfo.ExpirationDate);
    $('#sharedFileEndTime').text( expirationDate );
    var shareDaysRemaining = Math.floor((expirationDate - Date.now()) / 86400000);
    $('#sharedFileTimeRemaining').text( shareDaysRemaining + " days");

    $('#sharedByUserPic').attr("src", sharedInfo.Sharer.ThumbnailPhoto);

    
    if (showStopSharingButton == true) {
        $('#stopSharingButtonId').css("visibility", "visible");
        document.getElementById('closeSharingButtonId').setAttribute('onclick', "CloseSharePropertiesDialog(false)"); // close the dialog
    }
    else {
        $('#stopSharingButtonId').css("visibility", "hidden");
        document.getElementById('closeSharingButtonId').setAttribute('onclick', "CloseSharePropertiesDialog(true);"); // close the dialog and refresh the view
    }

    $('#shareLinkPropertiesDialog').modal('show')
}

function CloseSharePropertiesDialog(refreshView) {

    $('#shareLinkPropertiesDialog').modal('hide');
}

function PromptStopSharing(fileIdentifier, url) {
    $("#confirmationMessage").text("Stop sharing the file?\r\n\r\n" + fileIdentifier);

    $('#confirmationActionButton').data('url', url);
    document.getElementById('confirmationActionButton').setAttribute('onclick', "StopSharing(); $('#confirmationDialog').modal('hide');");
    $("#confirmationDialog").modal("show");

}

function GetSharedInfo(item) {
    var sharedInfo = null;
    if (item.Sharer != null)
        sharedInfo = item;
    else if (item.SharedInfo != null)
        sharedInfo = item.SharedInfo;

    return sharedInfo;
}

function GetUserRole(inrole){
    switch (Number(inrole)) { // convert enum number to string
        case 0:
            return "Unknown";
            break;
        case 1:
            return "User";
            break;
        case 2:
            return "Admin";
            break;
        case 4:
            return "System";
            break;
        case 9:
            return "Read Only User";
            break;
        case 10:
            return "Read Only Admin";
            break;
        case 32:
            return "Denied";
            break;
    }
}

function toLocalDate(date) {
    if (date == "0001-01-01T00:00:00") {
        return "";
    }

    var localTime  = moment.utc(date).toDate();
    localTime = moment(localTime).lang("en").format('lll'); // formatting options are documented at momentjs.com
    
    return localTime;
}

function HAPILogout(){
    $.ajax({
        type: "DELETE",
        url: _hapiServer + "/route/hapi/login",
        success: function (data, status, xhr) {
            $.cookie("hapiToken", null, {expires: 0, path: "/"});
            ShowLogin();
        },
        error: function (xhr, status, text) {
            console.log("Logoff ajax error: " + xhr.responseText);
            $.cookie("hapiToken", null, {expires: 0, path: "/"});
            ShowLogin();
        }
    });
}
        
function SetUserPic() {
    var userImgSrc = $('.avatar img').attr("src");
    if( userImgSrc == "img/avatar.jpg")
    {
        // var userSID = = localStorage["HAPI.UserSID"];
        var userSID = $.cookie("HAPI.UserSID");
        if( userSID != null ) {
            GetUserFromSid(userSID, function (user) {
                //console.dir(user);
                if (user.ThumbnailPhoto != null) {
                    $('.avatar img').attr("src", user.ThumbnailPhoto);
                } else {
                    $('.avatar img').attr("src", "img/avatar2.jpg"); // default avatar image
                }

                if( user.Description != null)
                    $('#avatarTitle').text(user.DisplayName);
                else
                    $('#avatarTitle').text("");
            })
        }
    }
}
        
function ShowLogin()  {
    var header = 'Please Login';
    var form = $('<h3 class="page-header"><img src="img/HAPI-Dark-96.png" alt="Hapi Login"></img></h3><div class="form-group"><label class="control-label">Username</label><input id="loginUsername" type="text" class="form-control" name="username" value="" /></div>'+
                '<div class="form-group"><label class="control-label">Password</label><input id="loginPassword" type="password" class="form-control" name="password" value=""/></div>');
    var buttons = $('<div class="text-center"><a href="index_v1.html" class="btn btn-primary" onclick="TryLogin(); return false;">Login</a></div>');

    OpenModalBox(header, form, buttons);            
    setTimeout(function(){ 
        $("#loginUsername").focus(); 
        $( "#loginPassword" ).on( "keydown", function(event) {
            if(event.which == 13) 
                TryLogin(); // login when user presses enter in password field
        }); 

    }, 100);
}
        
function TryLogin() {
    HAPILogin(_hapiServer, $("#loginUsername").val(), $("#loginPassword").val(), function () {
        CloseModalBox();
        SetUserPic();
        var url = "ajax/hapiADShares.html"
        window.location.hash = url;
        LoadAjaxContent(url);
    });
}

function HAPILogin(server, username, password, callback) {
    var urlSuffix = "/route/hapi/login";
    var loginUrl = server + urlSuffix;
    console.log(loginUrl);

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: loginUrl,
        data: JSON.stringify({ UserName: username, Password: password }),
        success: function (data) {
            $.cookie("hapiToken", data.Token, {expires: 7, path: "/"});
            $.cookie("HAPI.UserSID", data.UserSID, {expires: 7, path: "/"});
            $.cookie("HAPI.UserRole", data.Role, {expires: 7, path: "/"});
            
            if (callback != null)
                callback();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error: " + xhr.responseText + "\n" + thrownError);
        }
    });
}

function ShowHideRoleFeatures() {
    var userRole = $.cookie("HAPI.UserRole");
    if( userRole == UserRoles.ReadOnlyUser || userRole == UserRoles.ReadOnlyAdmin )
        $(".HideForReadOnly").each(function(){ $(this).addClass('UIHidden'); });
    else
        $(".HideForReadOnly").each(function(){ $(this).removeClass('UIHidden'); });
}

function unlinkDropboxConfirmationHandler() {
    $('#confirmationMessage').text('Unlink your Dropbox account from HAPI?');
    document.getElementById('confirmationActionButton').setAttribute('onclick', 'UnlinkDropboxAccount();')
    $('#confirmationDialog').modal('show');
}

function unlinkBoxConfirmationHandler() {
    $('#confirmationMessage').text('Unlink your box account from HAPI?');
    document.getElementById('confirmationActionButton').setAttribute('onclick', 'UnlinkBoxAccount();')
    $('#confirmationDialog').modal('show');
}

function UnlinkDropboxAccount() {
    var urlSuffix = "/route/hapi/Dropbox/UnlinkAccount";
    var Url = _hapiServer + urlSuffix;
    
    $.ajax({
        type: "GET",
        url: Url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: { 'Content-Type': 'application/json', 'hapiToken': $.cookie("hapiToken") },
        success: function (data, status, xhr) {
            alert("Your Dropbox account has been unlinked from HAPI.");
        },
        error: function (xhr, status, text) {
            if (!handleAuthError(xhr, status)) {
                alert(xhr.status + " : " + text);
                console.log("Error unlinking Dropbox account: " + xhr.responseText);
            }
        }
    });
}

function UnlinkBoxAccount() {
    var urlSuffix = "/route/hapi/box/UnlinkAccount";
    var Url = _hapiServer + urlSuffix;
    
    $.ajax({
        type: "GET",
        url: Url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: { 'Content-Type': 'application/json', 'hapiToken': $.cookie("hapiToken") },
        success: function (data, status, xhr) {
            alert("Your box account has been unlinked from HAPI.");
        },
        error: function (xhr, status, text) {
            if (!handleAuthError(xhr, status)) {
                alert(xhr.status + " : " + text);
                console.log("Error unlinking Box account: " + xhr.responseText);
            }
        }
    });
}
