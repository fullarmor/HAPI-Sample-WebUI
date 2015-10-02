//var app = angular.module('myApp', ['ui.bootstrap', 'ui.router', 'ngRoute']);
var app = angular.module('myApp', ['ui.bootstrap', 'ui.router', 'ngRoute']);

var _hapiServerDomain = "sandbox.fullarmorhapi.com";
var _hapiServer = "https://" + _hapiServerDomain;    
var _Url = "";
var _MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

var contextItem = ""; // last item navigated in views.
var folderPickerContextItem = ""; // last item navigated in folder picker.
var selectedItem = null; // item selected in views
var contextAgentId = -1; // Keep the agent context for drilling into many levels of files on an agent

app.controller('LoginController', function ($scope, $compile, $http, $location) {
});

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

app.directive('selectionClass', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var shiftKeyDown = false;
            var ctrlKeyDown = false;
            
            function updateSelection() {
                
                if( ctrlKeyDown )
                {
                    console.log("Ctrl key pressed");
                    element.toggleClass(attrs.selectionClass);
                }
                else
                {
                    //element.siblings.removeClass('active');
                    element.parent().children().removeClass(attrs.selectionClass);
                    element.addClass(attrs.selectionClass);
                }
            }
            
            element.bind('keydown', function (event) {
                if( event.ctrlKey ) { ctrlKeyDown = true; }
                if( event.shiftKey ) { shiftKeyDown = true; }

            });
            
            
        }
    };
});