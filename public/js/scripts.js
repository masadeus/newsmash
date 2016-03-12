/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();

// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            stylers: [
                {saturation: -80 }
            ]
        },
        {
            elementType: "labels",
            stylers: [
                { lightness: 10 },
                { visibility: "simplified" }
            ]
        },

        /**  // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                { hue: "#00ffee" },
                { saturation: -10 },
                {visibility: "off"}
            ]
        },
        */
        // show roads.arterial
        {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [
              { hue: "#00ffee" },
              { saturation: 20 },
           ]

        }
        
    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 42.3770, lng: -71.1256}, // Cambridge, Massachusetts
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

});

/**
 * Adds marker for place to map.
 */
function addMarker(place)
{
    // ensure coordinates are numbers
    var lt = (_.isNumber(place.latitude)) ? place.latitude : parseFloat(place.latitude);
    var ln = (_.isNumber(place.longitude)) ? place.longitude : parseFloat(place.longitude);

    
    var marker = new MarkerWithLabel({
    position: new google.maps.LatLng(lt, ln),
    map: map,
    title: place.place_name,
    labelContent: place.place_name,
    labelAnchor: new google.maps.Point(33, -5),
    labelClass: "label", // the CSS class for the label
    labelStyle: {opacity: 0.75},
    icon:'http://pset8/img/news.png'
    });
    
    
    // add mouse event
    google.maps.event.addListener(marker, "click", function () { articles(marker, place.postal_code); });    
    
    // add marker to markers[]
    markers.push(marker);
}    
function articles(marker, location)
{   
    // get JSON from articles.php
    var parameters = "geo=" + location;

    $.getJSON("articles.php", parameters)
    .done(function(data, textStatus, jqXHR) {
    
        // security check. Works perfect. data is fine
        // for (var entry in data) {
        //     console.log(data[entry].title, data[entry].link);
        // }
        
        // dinamically build html ul
        
        var content;
        
        if(data.length > 0){
            content = "<ul>";
            for(var i in data){
                content += "<li><a href='" + data[i].link + "' target=_blank>" + data[i].title + "</a></li>";
            }
            
            content += "</ul>"; 
        }

        showInfo(marker, content);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    }); 
}

/**
 * Configures application.
 */
 

function configure()
{
    // update UI after map has been dragged
    google.maps.event.addListener(map, "dragend", function() {
        update();
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

    // remove markers whilst dragging
    google.maps.event.addListener(map, "dragstart", function() {
        removeMarkers();
    });

    // configure typeahead
    // https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
    $("#q").typeahead({
        autoselect: true,
        highlight: true,
        minLength: 2
    },
    {
        source: search,
        templates: {
            empty: "no places found yet",
            suggestion: _.template("<p><%- place_name %>, <%- admin_name1 %>, <%- postal_code %></p>")
        }
    });
 
    // re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {
        
        // primer pas es trucar search i demanar longitut i latitut.
        
        
        // ensure coordinates are numbers
        var latitude = (_.isNumber(suggestion.latitude)) ? suggestion.latitude : parseFloat(suggestion.latitude);
        var longitude = (_.isNumber(suggestion.longitude)) ? suggestion.longitude : parseFloat(suggestion.longitude);

        // set map's center
        map.setCenter({lat: latitude, lng: longitude});

        // update UI
        update();
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        hideInfo();
    });

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();

    // give focus to text box
    $("#q").focus();
}

/**
 * Hides info window.
 */
function hideInfo()
{
    info.close();
}

/**
 * Removes markers from map.
 */
function removeMarkers()
{

    for(var marker in markers){
        markers[marker].setMap(null);
    }
    
    markers.length = 0;
}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, cb)
{
    // get places matching query (asynchronously)
    var parameters = {
        geo: query
    };
    $.getJSON("search.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // call typeahead's callback with search results (i.e., places)
        cb(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
}

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content) // amb l'operador += concatenem strings. x=  x+y => x += y
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) === "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='img/ajax-loader.gif'/>";
        div += "<span> Slow news day...</span>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}

/**
 * Updates UI's markers.
 */
function update() 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        sw: sw.lat() + "," + sw.lng()
    };
    $.getJSON("update.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // remove old markers from map
        removeMarkers();

        // add new markers to map
        for (var i = 0; i < data.length; i++)
        {
            addMarker(data[i]);
        }
     })
     .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
};
