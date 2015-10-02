var breadcrumbs = [];

function ClearBreadcrumbs(){
    breadcrumbs = [];
}

function AddBreadcrumb(item){

    for (var n = 0; n < breadcrumbs.length; n++ ){
        var crumb = breadcrumbs[n];
        if( crumb.FileIdentifier == item.FileIdentifier )
            return; // crumb already added
    }
    
    breadcrumbs.push(item);
}

function TrimBreadcrumbs(item){
    
    console.log("TrimBreadcrumbs-Before Trim Breadcrumbs");
    console.dir(breadcrumbs);
    
    for (var n = 0; n < breadcrumbs.length; n++ ){
        var crumb = breadcrumbs[n];
        if( crumb.FileIdentifier == item.FileIdentifier )
        {
            breadcrumbs = breadcrumbs.splice(0, n+1); // truncate everything after the breadcrumb we clicked on
            break;
        }
    }
    
    console.log("TrimBreadcrumbs-After Trim Breadcrumbs");
    console.dir(breadcrumbs);
    
    UpdateBreadcrumbUI();
}

function UpdateBreadcrumbUI(){

    console.log("UpdateBreadcrumbUI-Breadcrumbs:");
    
    $('#breadcrumb ol').empty();
    
    for( var n = 0; n < breadcrumbs.length; n++ ){
        var crumb = breadcrumbs[n];
    //console.dir(crumb);
        
        /*
        $('#breadcrumb ol').append(
            $('<li>').append(
                $('<a>').attr('href', crumb.FileIdentifier).append(crumb.Name )
        ));*/
        
        //$("#breadcrumb ol").append('<li><a href="/user/messages"><span class="tab">Message Center</span></a></li>');        
        //$("#breadcrumb ol").append('<li><a href="' + crumb.FileIdentifier + '" data-context=' + crumb + ' class="ajax-link">' + crumb.Name + '</a></li>');        
        $("#breadcrumb ol").append("<li><a href='" + crumb.FileIdentifier + "' class='breadcrumb-link' data-context='" + JSON.stringify(crumb) + "'>" + crumb.Name + "</a></li>");        
    }
}