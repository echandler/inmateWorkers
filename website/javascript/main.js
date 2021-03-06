var main = function ( x ){
    var theMap = window.theMap,
        $ = window.$,
        parameters = window.parameters;

    theMap.panningAnimationTrueFalse = parameters.panningAnimationTrueFalse;
    theMap.resizedMapHeight = undefined;
    theMap.resizedMapWidth  = undefined;
    theMap.viewPortWidth  = window.innerWidth;
    theMap.viewPortHeight = window.innerHeight;
    theMap._left   = 0;
    theMap._top    = 0;
    theMap._width  = undefined; // This gets modified when zooming. Can't use theMap.width have to use theMap._width.
    theMap._height = undefined; // This gets modified when zooming. Can't use theMap.height have to use theMap._height.
    theMap.calculateMarkerPosition = window.marker_module.calculateMarkerPosition;
    theMap.zoomPower = {'0': 350, '20': 700, '40': 1400, '60': 2800, '80': 5600, '100': 11200, '120': 22400, '140': 44800, '160': 89600, '180': 179200, '200': 358400 };
    theMap.zoomPowerNumber = {'0': 0, '20': 1, '40': 2, '60': 3, '80': 4, '100': 5, '120': 6, '140': 7, '160': 8, '180': 9, '200': 10 };
    theMap.hiddenImage = $( 'theMap_secondary' );
    theMap.zoomStrartTimer = undefined;
    theMap.setTimeoutt = window.setTimeout.bind( window );
    theMap.clearTimeoutt = window.clearTimeout.bind( window );
    theMap.presentMinX = parameters.FULLZOOMMINX;
    theMap.presentMaxX = parameters.FULLZOOMMAXX;
    theMap.presentMinY = parameters.FULLZOOMMINY;
    theMap.presentMaxY = parameters.FULLZOOMMAXY;
    theMap.pan = { panningXYOld: undefined, panningXYNew: undefined,
                oldMouseY: undefined, oldMouseX: undefined,
                oldMouseXpan: undefined, oldMouseXpan: undefined,
                mouseMoveFunction: undefined };
    theMap.sliderPosition = 200;
    theMap.markersArray = new Array();
    theMap.zoomSliderStyle = $( 'zoom_slider' ).style;
    theMap.optionsReference = parameters.optionsCheckMarkDefaults;
    theMap.zoom_slider_container_styleTop = $( 'zoom_slider_container' ).getBoundingClientRect().top;
    theMap.mapContainer = $( 'theMap_container' );
    theMap.containerStyleLeft = undefined;
    theMap.containerStyleTop = undefined;
    theMap.containerStyleRight = undefined;
    theMap.containerStyleBottom = undefined;
    theMap.cssTransform = window.utilities_module.testProp(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);
    theMap.tempTransformText = '';
    theMap.tempTransformString = '';
    theMap.dragDiv = window.$( 'drag_div' );
    theMap.dragDiv._left = 0;
    theMap.dragDiv._top = 0;
    theMap.mousewheelevt = ( /Firefox/i.test( window.navigator.userAgent ) )? "DOMMouseScroll" : "mousewheel";
    theMap.onPopState = undefined;
    theMap.infoFromUrl = false;
    theMap.boxZoom = undefined; // TODO: This is for the box zoom test.
    theMap.zoomAllTheWayOut = window.zoom_module.zoomAllTheWayOut;
    theMap.style[theMap.cssTransform] = 'translate3d(0px,0px,0px)';
    if ( theMap.panningAnimationTrueFalse ){
        theMap.pan.mouseMoveFunction = window.mapControl_module.mapDragAndAnimation;
    } else {
        theMap.pan.mouseMoveFunction = window.mapContainer_module.mapDragOnly;
    }

    // Calculate the initial max width and height, set the container size
    // and set _width and _height to the container size.
    window.utilities_module.calculateMaxWidthHeight();
    theMap.mapContainer.style.width = theMap.resizedMapWidth +'px';
    theMap.mapContainer.style.height = theMap.resizedMapHeight +'px';
    theMap._width  = theMap.resizedMapWidth;
    theMap._height = theMap.resizedMapHeight;
    window.options_module.initOptionsPanel();
    theMap.addEventListener( 'load', window.utilities_module.firstMapLoad );

    // Check the url and see if there is any search information in it.
    //window.location.search = 
    if ( true ){
        window.utilities_module.getInfoFromUrl();
    }
    window.utilities_module.makeArcXMLRequest( theMap.presentMinX, theMap.presentMaxX, theMap.presentMinY, theMap.presentMaxY );
    $( 'zoom_slider' ).style.top = theMap.sliderPosition +'px';

    // If the panning animation is turned off, remove the slider from the options panel.
    if ( !parameters.panningAnimationTrueFalse ){
        $('panning_control_row').parentNode.removeChild( $('panning_control_row') );
    }

    // addPageHasFocusClickHandling() makes it so when the person clicks out of the browser or tab and then 
    // clicks back in, they won't  inadvertently create an unwanted parcel marker, when what they really 
    // wanted was just to get focus back on the map so they can zoom or what ever they wanted to do.
    window.utilities_module.addPageHasFocusClickHandling();

    theMap.addEventListener( 'load', mapControl_module.mapLoad );
    theMap.addEventListener( 'error', mapControl_module.mapLoadError );
    window.citiesTownsSvg_module.cityCoordinatesInit();
    window.smallCountySvg_module.smallCountySvgInit();
    window.drawSvgLine_module.drawLineInit()
    window.onpopstate = window.utilities_module.popStateHandler;
}

window.onresize = function( e ){
    window.clearTimeout( window.utilities_module.throttleResize );
    window.utilities_module.throttleResize = setTimeout( function(){ window.utilities_module.handleResize() }, 500);
}

window.onload = window.main;

/*TODO http://jsfiddle.net/jPqBh/6/ ☑
    * appears to be done: For some reason the map blinks when there is only APN's in the search part of the Url, not when JSON object is in it.
    * appears to be done:make the div around the spinning gear easier to click when the options div is open, it is too small.
    * do something about the "xml" global variable.
    * Done: add buttons to slider for plus and minus.
    * appears to be done: makeURL() doesn't work correctly in IE, also IE doesn't like long urls.
    * done: is 'smoothTransition()' still needed?
    * Done: the apn search text input is non selectable in IE.
*/
// svg zoom thingy http://jsbin.com/OPeJujEf/4/edit
// http://192.168.254.42:8080/PostFrame.htm?={"mr":[{"a":"29051700402000","x":1307532.8579006088,"y":365918.399693678,"m":"This%20old%20house...%0A%0A%3Cimg%20src%3D%22http%3A%2F%2Fwww.snoco.org%2Fdocs%2Fsas%2Fphotos%2F0055%2F00553100600100R011.jpg%22%20width%3D%22300%22%3E","i":"http%3A%2F%2Fwww.snoco.org%2Fdocs%2Fsas%2Fphotos%2F0055%2F00553100600100R011.jpg"}],"x":1303643.34760926,"mx":1316066.11812154,"y":365755.720556014,"my":371967.105812158,"z":80}