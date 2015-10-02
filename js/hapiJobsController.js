app.controller('JobsController', function ($scope, $compile, $http, $location) {
    $scope.Jobs = []; // all jobs, including child jobs
    $scope.ChildJobs = []; // just the child jobs
    $scope.GetJobs = function () {

        var urlSuffix = "/route/hapi/HAPIJob/ListJobs?status=9";
        _Url = _hapiServer + urlSuffix;

        var hapiToken = $.cookie("hapiToken");//localStorage["HAPI.Token"];

        var postData = JSON.stringify({ filters: "[]", MaxLevels: "0" });

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
                  var job = data[i];
                  
                  if( job.ParentJobId == "undefined" || job.ParentJobId == null || job.ParentJobId == "")
                    job.ParentJobId = "00000000-0000-0000-0000-000000000000";
                  
                  job.Status = GetJobStatusString(job.Status);
                  job.JobType = GetJobTypeString(job.JobType);
                  job.SourceProvider = GetProviderString(job.SourceProvider);
                  job.DestProvider = GetProviderString(job.DestProvider);
                  job.StartDateFormatted = toLocalDate(job.StartDate);//new Date(job.StartDate);
                  job.LastModifiedDateFormatted = toLocalDate(job.LastModifiedDate);//new Date(job.LastModifiedDate);
                  job.ScheduleFormatted = GetFormattedInterval(job.Schedule); // interval
                  if (job.SourceFiles != null && job.SourceFiles.length > 0) {
                      job.SourcePath = FormattedPath(job.SourceProvider, job.SourceFiles[0].FileIdentifier);
                      job.SourceItemName = job.SourcePath.indexOf('/') > -1 ? job.SourcePath.split('/').pop() :  job.SourcePath.split('\\').pop(); // parse out just the name, no path
                  } else {
                      job.SourcePath = "";
                      job.SourceItemName = "";
                  }
                  job.DestPath = FormattedPath(job.DestProvider, job.DestPath);
                  if( job.Description )
                      job.SourceItemName = job.Description; // for system jobs, show description as name

              }

              $scope.Jobs = data;
              $scope.actions.updateJob(); // set default filter to hide system jobs
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status);
              $('#main').css( 'cursor', 'default' );
          });
    };
    
    $scope.JobMigrationItems = []; // Initialize the array so it is not null
    $scope.ShowJobMigrationDetail = function (item) {
        if( $scope.ChildJobs.length < 1 ) {
            // Hide appropriate Job History Section
            $('#JobPropertyMultipleHistory').hide();
            $('#JobPropertySingleHistory').show();
        }
        else{
            // Show appropriate Job History Section
            $('#JobPropertyMultipleHistory').show();
            $('#JobPropertySingleHistory').hide();
        }
        
        $scope.LoadJobMigrationItems(item);
    }

    $scope.selectedItem = null;
    $scope.setSelected = function (item) {
        $scope.selectedItem = item;
    };
    
    $scope.selectedHistoryItem = null;
    $scope.setSelectedHistory = function (item) {
        $scope.selectedHistoryItem = item;
    };
    
    $scope.showJobDetailsDialog = function(item){
        ShowJobDetailsDialog(item);
    }
    
    $scope.jobsFilter = {
        includeSystemJobs: false,
        ParentJobId: '00000000-0000-0000-0000-000000000000',
        JobType: '',
        search: ''
    };
    
    $scope.actions = {
        updateJob: function () {
            if($scope.jobsFilter.includeSystemJobs) {
                $scope.jobsFilter.JobType = '';
            } else {
                 $scope.jobsFilter.JobType = '!System';   
            }
        }
    };
    
    $scope.ShowJobPropertiesDialog = function(item) {

        $('#JobPropType').text(item.JobType);
        $('#JobPropName').text(item.SourceItemName);
        $('#JobPropFrom').text(item.SourceProvider);
        $('#JobPropSourcePath').text(item.SourcePath);
        $('#JobPropTo').text(item.DestProvider);
        $('#JobPropDestPath').text(item.DestPath);
        $('#JobPropStatus').text(item.Status);
        $('#JobPropStartTime').text(item.StartDateFormatted);
        $('#JobPropUpdated').text(item.LastModifiedDateFormatted);
        $('#JobPropInterval').text(item.ScheduleFormatted);
        $('#JobPropDescription').text(item.Description);
        
        $('#jobPropertiesDialog').modal('show');

        // Filter the child jobs out of the main jobs array (for the specified parent job)
        $scope.ChildJobs = $.grep($scope.Jobs, function(e) { return e.ParentJobId == item.JobId });
        
        $scope.JobMigrationItems.length = 0; //clear out the old data
        $scope.ShowJobMigrationDetail(item);
    }

    $scope.ShowJobPropertyHistoryDialog = function(item) {
        
        $scope.LoadJobMigrationItems(item);
        
        $('#jobHistoryPropertyStatus').text(item.Status);
        $('#jobHistoryPropertyChanges').text(item.Changes);
        $('#jobHistoryPropertyStartTime').text(item.StartDateFormatted);
        $('#jobHistoryPropertyUpdated').text(item.LastModifiedDateFormatted);
        
        $('#jobPropertyHistoryDialog').show();
    }
    
    $scope.LoadJobMigrationItems = function(item){
        $scope.JobMigrationItems.length = 0; // clear any old detail
        var urlSuffix = "/route/hapi/HAPIJob/GetJobResultDetail?JobId=" + item.JobId;
        _Url = _hapiServer + urlSuffix;
        var hapiToken = $.cookie("hapiToken");//localStorage["HAPI.Token"];

        $('#main').css( 'cursor', 'wait' );
        // Simple POST request example (passing data) :
        $http({
            url: _Url,
            method: "POST",
            //data: postData,
            headers: { 'Content-Type': 'application/json', 'hapiToken': hapiToken }
        }).
          success(function (data, status, headers, config) {
            
              // this callback will be called asynchronously
              // when the response is available
              if( data != "null" )
              {
                $scope.JobMigrationItems = jQuery.map(data.MigrationDetail, function (detailItem) {
                    if (detailItem.ConflictDetails == "null" || detailItem.ConflictDetails === "")
                        detailItem.ConflictDetails = "None";

                    return item;
                });
                
                if($scope.$$phase != "$digest" && $scope.$$phase != "$apply") // if angular isn't already doing digest/apply...
                    $scope.$apply(); // ask angular to update so we see our new data
              }
            else
                console.log("data is null");
            
              $('#main').css( 'cursor', 'default' );
          }).
          error(function (data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              HandleStatus(status);
              $('#main').css( 'cursor', 'default' );
          });
        
    }
    
});

