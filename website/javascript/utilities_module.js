window.utilities_module = function(){ 

    var convertMouseCoordsToStatePlane = function( e ){
        var xMultiplier = ( this.presentMaxX - this.presentMinX ) / this.resizedMapWidth;
        var yMultiplier = ( this.presentMaxY - this.presentMinY ) / this.resizedMapHeight;
        var x = ( ( e.clientX - this.containerStyleLeft ) * xMultiplier + this.presentMinX );
        var y = ( this.presentMaxY - ( ( e.clientY - this.containerStyleTop) * yMultiplier ) );
        
        return { x: x, y: y };
    }.bind( window.theMap );
    
    // firstMapLoad only gets called on the first map load.
    function firstMapLoad(){
        window.$( 'loading_div' ).parentNode.removeChild( window.$( 'loading_div' ) );
        window.$( 'zoom_control' ).style.visibility = 'visible';
        this.removeEventListener( 'load', firstMapLoad );
        
        // This primes the first history position so that there will be a "state" if the person
        // uses the back button, then sets the onPopState variable to true so that an identical 
        // "state" won't be pushed onto the history stack.
        window.history.replaceState( {
                    minxOld : this.presentMinX,
                    maxxOld : this.presentMaxX,
                    minyOld : this.presentMinY,
                    maxyOld : this.presentMaxY,
                    zoom: window.$( 'zoom_slider' ).style.top,
                    title: "SnoCo Interactive Map"
                }, 
                "title 1",
                ( !window.theMap.infoFromUrl )?'?={"x":'+ this.presentMinX +',"mx":'+ this.presentMaxX +',"y":'+ this.presentMinY +',"my":'+ this.presentMaxY +',"z":'+ this.sliderPosition +'}' 
                : window.location.search
        );
        this.onPopState = true;
        window.citiesTownsSvg_module.resizeAllSvgCities();
        window.marker_module.makeInterStateShields();
        window.marker_module.isSimpleMarkerOnImage();
        window.scaleBarSvg_module.scaleBarInit();
        window.$('small_county_svg').style.opacity = 1;
    }

    function createMarkersFromInfoFromUrl(){
        
        // First check if the first char (after '?=') is a number, if so assume it is an APN that needs to be calculated,
        // otherwise assume it is a JSON object with pre-calculated marker information.
        if ( checkUrlForApn().doesExist ){
            window.$( 'find_parcel_number_input' ).value = checkUrlForApn().contents;
            window.marker_module.fromAPNtoSP();
        } else if( this.infoFromUrl && this.infoFromUrl.x ) {
            //this.infoFromUrl = JSON.parse( window.decodeURIComponent( location.search.replace( /^\?=/,'' ) ) );
            if ( this.infoFromUrl.mr ){
                this.infoFromUrl.mr.forEach( function( mrker ){
                    window.marker_module.makeMarker( null, mrker );
                } );
            }
        }

        // If there was an number pasted into #find_parcel_number_input, then style the "Search by APN"
        // anchor so it looks like a button.
        if ( /^\d/.test ( window.$( 'find_parcel_number_input' ).value ) ){
             window.$( 'find_parcel_number' ).className = 'findParcelNumberBorder';
        }
        this.infoFromUrl = undefined;
        this.removeEventListener( 'load', createMarkersFromInfoFromUrl );
    }

    function testProp( props ) {// Got this from leaflet
        var style = document.documentElement.style;

        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    }
    var getInfoFromUrl = function(){

        // First check to see if it is a JSON object, if it is then stick it in infoFromUrl,
        //  that will be checked for true/false then used to create the first map.
        try{
            if ( /^\?=\{/.test( window.decodeURIComponent( window.location.search ) ) ){
                this.infoFromUrl = JSON.parse( window.decodeURIComponent( window.location.search.replace( /^\?=/,'' ) ) );
                this.presentMinX = this.infoFromUrl.x;
                this.presentMaxX = this.infoFromUrl.mx;
                this.presentMinY = this.infoFromUrl.y;
                this.presentMaxY = this.infoFromUrl.my;
                this.sliderPosition = this.infoFromUrl.z;
                if( this.infoFromUrl.l && this.infoFromUrl.l.length !== 0 ){
                    window.drawSvgLine_module.createPolylinesFromUrl( this.infoFromUrl.l );
                }
            } else if ( checkUrlForApn().doesExist ){
                this.infoFromUrl = checkUrlForApn().contents;
            }
            // Either way call call a function that will attempt to create markers if is APN information.
            this.addEventListener( 'load', window.utilities_module.createMarkersFromInfoFromUrl );
        } catch ( error ){
            window.alert( 'There appears to be a problem with the URL.\n\nCryptic Error Message:\n  "  '+ 
                error +'  "\n\n'+
                'The URL length is: '+ ('1234567'+ location.pathname + location.search).length +
                ' characters.');
        }
    }.bind( window.theMap );

    // TODO: Can popState be re-factored in a smarter way?
    function popStateHandler( event ){
        var theMap = window.$('theMap_primary');
        
        if( !event.state ){ return false; }
        document.title = event.state.title;
        window.xml.getElementsByTagName( "ENVELOPE" )[0].attributes[0].nodeValue = event.state.minxOld;
        window.xml.getElementsByTagName( "ENVELOPE" )[0].attributes[2].nodeValue = event.state.maxxOld;
        window.xml.getElementsByTagName( "ENVELOPE" )[0].attributes[1].nodeValue = event.state.minyOld;
        window.xml.getElementsByTagName( "ENVELOPE" )[0].attributes[3].nodeValue = event.state.maxyOld;
        window.$( 'zoom_slider' ).style.top = event.state.zoom;
        window.theMap.sliderPosition = +event.state.zoom.replace( /px/, '' );
        window.utilities_module.makeArcXMLRequest( event.state.minxOld, event.state.maxxOld, event.state.minyOld, event.state.maxyOld, true );
        getInfoFromUrl();
        window.theMap.addEventListener( 'load', window.utilities_module.createMarkersFromInfoFromUrl );
    }

    var addPageHasFocusClickHandling = function(){

        // This controls pageHasFocus when the browser isn't focused (clicked outside the browser);
        // The visibility api doesn't fire off when someone clicks outside the browser.
        window.onblur = function(){ 
            window.pageHasFocus = false;
            
            // This is used to set the pageHasFocus variable to true if the person uses the mousewheel to 
            // zoom on the map. The zoom_module.zoomInOut function was setting pageHasFocus everytime
            // which was unnecessary.
            window.theMap.addEventListener( private_addRemoveEventListenersObj.mousewheelevt, onFocusMouseWheelEvnt );
            function onFocusMouseWheelEvnt( e ){
                window.pageHasFocus = true;
                this.removeEventListener( private_addRemoveEventListenersObj.mousewheelevt, onFocusMouseWheelEvnt );
            }
        };
        
        // From mdn "Using the Page Visibility API" 1/26/2014.
        // This controls pageHasFocus when switching between tabs.
        // First window.onblur will set pageHasFocus = false, then when switching back the visibly api will set pageHasFocus = true.
        if ( typeof document.hidden !== "undefined" ){ // Opera 12.10 and Firefox 18 and later support 
            document.addEventListener( "visibilitychange", function(){ window.pageHasFocus = true; } );
        } else if ( typeof document.mozHidden !== "undefined" ){
            document.addEventListener( "mozvisibilitychange", function(){ window.pageHasFocus = true; } );
        } else if ( typeof document.msHidden !== "undefined" ){
            document.addEventListener( "msvisibilitychange", function(){ window.pageHasFocus = true; } );
        } else if ( typeof document.webkitHidden !== "undefined" ){
            document.addEventListener( "webkitvisibilitychange", function(){ window.pageHasFocus = true; } );
        }

        // This will set a "click" event listener that will set pageHasFocus = true if the person clicks on 
        // the options panel or the zoom slider.
        window.$( 'options_container' ).addEventListener( 'click', function(){ window.pageHasFocus = true; } );
        window.$( 'zoom_control' ).addEventListener( 'click', function(){ window.pageHasFocus = true; } );
    }

    function checkUrlForApn(){
        return { doesExist: /^\?=\s*\d\d/.test( window.decodeURIComponent( window.location.search ) ) ,
                 contents: window.decodeURIComponent( window.location.search ).replace( /[\s|?=]/g, '' ) };
    }

    private_addRemoveEventListenersObj = {
        array: [
            [ window.$( 'zoom_slider' ), 'mousedown', window.zoom_module.sliderMouseDown ],
            [ window.$( 'zoom_in_button' ), 'click', window.zoom_module.plus ],
            [ window.$( 'zoom_out_button' ), 'click', window.zoom_module.minus],
            [ window.$( 'full_zoom_out_button' ), 'click', window.zoom_module.zoomAllTheWayOut],
            [ window.$( 'update_button' ), 'click', window.options_module.updateButtonHandler],
            [ window.$( 'save_button' ), 'click', window.options_module.updateButtonHandler],
            [ window.$( 'find_parcel_number' ), 'click', window.marker_module.fromAPNtoSP],
            [ window.$('theMap_container'), 'mousedown', window.mapControl_module.theMap_mouseDown],
        ],
        updateButton: window.$( 'update_button' ),
        saveButton: window.$( 'save_button' ),
        theMap: window.theMap,
        mousewheelevt: ( /Firefox/i.test( window.navigator.userAgent ) )? "DOMMouseScroll" : "mousewheel",
        svgController: window.options_module.svgController,
    };
    
    var addListeners = function(){
        var i = undefined;

        this.svgController( 'start addListeners' );
        this.theMap.setTimeoutt( function(){ window.options_module.svgController( 'finish addListeners' ); }, 2000 );
        this.theMap.mapContainer.addEventListener( this.mousewheelevt, window.zoom_module.zoomInOut );
        for( i = 0; i < this.array.length; ++i ){
            this.array[i][0].addEventListener( this.array[i][1], this.array[i][2], false );
        }
        for( i = 0; i < this.theMap.markersArray.length; ++i ){
            this.theMap.markersArray[i].addEventListener( this.mousewheelevt, window.zoom_module.zoomInOut );
        }
        this.updateButton.disabled = false;
        this.saveButton.disabled = false;        
    }.bind( private_addRemoveEventListenersObj )

    var removeListeners = function(){
        var i = undefined;

        this.svgController( 'start removeListeners' );
        this.theMap.mapContainer.removeEventListener( this.mousewheelevt, window.zoom_module.zoomInOut, false );
        for( i = 0; i < this.array.length; ++i ){
            this.array[i][0].removeEventListener( this.array[i][1], this.array[i][2]);
        }
        for( i = 0; i < this.theMap.markersArray.length; ++i ){
            this.theMap.markersArray[i].removeEventListener( this.mousewheelevt, window.zoom_module.zoomInOut );
        }
        this.updateButton.disabled = true;
        this.saveButton.disabled = true; 
    }.bind( private_addRemoveEventListenersObj )

    //http://jsfiddle.net/BXWDV/5/
    // getBase64image() is used to save the current map/image into the history so when the
    // user goes back in history the image will instantly appear without hitting the server.
    function getBase64Image( theMap ){
        var canvas = document.createElement( "canvas" );
            canvas.width = theMap.width;
            canvas.height = theMap.height;
        var ctx = canvas.getContext( "2d" );
            ctx.drawImage( theMap, 0, 0 );

        var dataURL = canvas.toDataURL( "image/png" );

        return dataURL;
    }

    function handleResize(){
        var theMap = window.theMap,
            middleOfContainerX = theMap._width / 2,
            middleOfContainerY = theMap._height / 2; 

        theMap.viewPortWidth  = window.innerWidth;
        theMap.viewPortHeight = window.innerHeight;
        calculateMaxWidthHeight();
        theMap.mapContainer.style.width = theMap.resizedMapWidth +'px';
        theMap.mapContainer.style.height = theMap.resizedMapHeight +'px';
        theMap.style.width = theMap.mapContainer.style.width;
        theMap.style.height = theMap.mapContainer.style.height;
        
        // This finds the top of the zoom slider on the screen, it changes when the screen resizes
        // because it's containers (#zoom_control) left and top are set as a percentage of the screen size.
        theMap.zoom_slider_container_styleTop = window.$( 'zoom_slider_container' ).getBoundingClientRect().top;       
        window.overlayMap_module.resizeOverlayMapContainer();
        window.smallCountySvg_module.smallCountySvgResize();
        window.scaleBarSvg_module.scaleBarResize();
        window.zoom_module.zoomStart( [ middleOfContainerX, middleOfContainerY ], theMap.viewPortWidth/2, theMap.viewPortHeight/2 );
    }

    var calculateMaxWidthHeight = function(){
        var maxWidthHeight = window.parameters.MAX_IMG_PIXELS;
            
        // If the viewPortHeight multiplied by viewPortWidth is greater than the max number
        // of pixels the server will serve then find the biggest size the map image can be.
        if ( this.viewPortHeight * this.viewPortWidth > maxWidthHeight ){
            
            // By default it will try to reduce the width of the map and and not touch 
            // the height so it will be full height.
            if ( this.viewPortWidth < window.parameters.MAX_WIDTH ){
                this.resizedMapWidth = ( function ( height, width, maxWidthHeight ){
                            while( true ){
                                --width;
                                if ( height * width > maxWidthHeight ){
                                    continue;
                                }
                                return width;
                            }
                        } )( this.viewPortHeight, this.viewPortWidth, maxWidthHeight );
                this.resizedMapHeight = this.viewPortHeight;
            } else {

                // If the persons resolution is just too big, then revert to the default
                // max width and height settings.
                this.resizedMapWidth = window.parameters.MAX_WIDTH;
                this.resizedMapHeight = window.parameters.MAX_HEIGHT;
            }
        } else {

            // If the view port is smaller than the max size the server will serve, then
            // set the image to fill up the browser window.
            this.resizedMapWidth = this.viewPortWidth;
            this.resizedMapHeight = this.viewPortHeight;
        }

        // Try to center the div that contains the map (#theMap_container).
        this.containerStyleLeft = ( this.viewPortWidth - this.resizedMapWidth ) / 2;
        this.containerStyleTop = ( this.viewPortHeight - this.resizedMapHeight ) / 2;
        this.containerStyleRight =  this.resizedMapWidth + this.containerStyleLeft; //not sure if right and bottom are necessary or used.
        this.containerStyleBottom = this.resizedMapHeight + this.containerStyleTop;
        this.mapContainer.setAttribute( 'style', 'opacity: 1; position:absolute; top:'+ this.containerStyleTop +'px; left:'+ this.containerStyleLeft +'px; height:'+ this._height +'px; width:'+ this._width +'px; ' );
    }.bind( window.theMap );

    // TODO: This was experimental.
    // function iframeLoadHandler(){
    //     var z = document.getElementsByTagName('iframe')[0];
    //         //z.contentDocument.GCvalue = [];
    //         try{ z.contentDocument.forms[0].target = ''; } catch(e){}
    //         console.log('iframeLoadHandler');
    //         try{
    //             var v = z.contentDocument.getElementsByTagName('a');
    //             [].forEach.call(v, function( anchor ){ anchor.onclick = function( e ){ e.preventDefault; window.parent.console.log( this.href ); return false;}; } );
    //         } catch( e ){}
    // }

    var removeTransitionFromMarkers = function(){
        var markers = this.markersArray;
        var len = markers.length;
        while ( len-- ){
            markers[len].style.cssText = markers[len].style.cssText.replace( /(-webkit-|-moz-|-ms-)?transition.*?;/g, '' );
        }
    }.bind( window.theMap );
    
    function simpleMessageBox( arg_innerHTML, arg_id, arg_width ){
        var message = document.createElement( 'div' );
        message.className = 'simpleMessageBox';
        message.style.width = ( arg_width && ( arg_widht +'px' ) ) || '300px';
        message.style.left = ( ( window.theMap.resizedMapWidth / 2 ) - ( ( arg_width && ( arg_width / 2 ) ) || 150 ) ) +'px';
        message.id = arg_id || 'simple_message_box';
        message.innerHTML = arg_innerHTML;
        message.onclick = function( e ){ e.stopPropagation(); this.parentNode.removeChild(this)};
        document.body.appendChild( message );
        return message;
    }

    function mainAjax( xmlRequest ){// TODO: this should be named better?

        //Remember  mainAjaxHTTPRequest is a global for testing.
        window.mainAjaxHTTPRequest.abort();
        var encodedResponse = undefined,
            url = window.parameters.urlPrefix + window.parameters.mapUrl;

        // TODO: Should theMap = 'this'?
        window.citiesTownsSvg_module.svgCitiesSetOpacityToZero();
        document.body.className = 'waiting';
        window.theMap.className = '';
         window.mainAjaxHTTPRequest.onload = function(){
             if( /error/i.test ( window.mainAjaxHTTPRequest.responseText ) ){
                handleAjaxError();
                return;
            }
            try{
                window.xml = ( new DOMParser() ).parseFromString( /<\?xml.*?'/.exec(  window.mainAjaxHTTPRequest.responseText )[0], "application/xml" );
            } catch ( tryCatchError ){
               handleAjaxError( tryCatchError );
               window.mapControl_module.resetMapOnError();
               return;
            } 
            window.mapControl_module.setImg();
        }
        window.mainAjaxHTTPRequest.onerror = function( e ){
            handleAjaxError( e );
            window.mapControl_module.resetMapOnError();
        }
        encodedResponse = window.encodeURIComponent( 'ArcXMLRequest' ) +'='+ window.encodeURIComponent( xmlRequest );
         window.mainAjaxHTTPRequest.open( 'POST', url, true );
         window.mainAjaxHTTPRequest.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
         window.mainAjaxHTTPRequest.send( encodedResponse );
    }

    function handleAjaxError( arg_Error ){
        var error = undefined;

        if( /error/i.test( window.mainAjaxHTTPRequest.responseText ) ){
            error = window.mainAjaxHTTPRequest.responseText.match(/<error.*?>(.*?)<\/error>/i);
            if( error ){
                error = error[1].replace( /\\/g , '' );
                console.error('There was an ajax error from onload: ', arg_Error );
                alert( 'There was an error: \n\n' + error );
            } else{
                console.error('There was an ajax error from onerror: ', arg_Error );
                alert( 'There was an error.' );
            }
        } else if ( arg_Error && arg_Error.type === 'error' ){
            console.error('There was an ajax error from onerror: ', arg_Error );
            alert( 'There was an error.' );
        }else {
            console.error('There was an error' );
            alert( 'There was an error.' );
        }
        window.mapControl_module.resetMapOnError();
    }

    var makeArcXMLRequest = function ( minX, maxX, minY, maxY, arg_onPopState, arg_overLayMap ){
        
        //TODO: Make sure all the comma's are there and not semicolons for the variables.
        // TODO: Add some if statements for different states of the map.
        var height = this.resizedMapHeight,
            width  = this.resizedMapWidth,
            options = this.optionsReference,
            sliderPositionNumber = this.zoomPowerNumber[this.sliderPosition];
            roadWidth = ~~(( sliderPositionNumber + 2 ) * 5 * (( width * height ) / (( maxX - minX ) * ( maxY - minY ))) + 2),
            roadColor = (( ( roadWidth + 165 ) > 210 )? 210: ( roadWidth + 165 )),
            interStateColor = '138, 173, 96',
            highwayColor = '230,170,150',
            multiplier = theMap.resizedMapWidth * theMap.resizedMapHeight / 5000000,
            roadNameOutlineColor = '0,0,0',
            showCityNames = ( sliderPositionNumber >= 2 ),
            cityNameCase = (( sliderPositionNumber <= 5 )? '': 'titlecaps'), //Title caps = first letter capitalized the rest lowercase.
            cityFontSize = (( sliderPositionNumber >= 8 )? '19': '24'),
            cityFontStyle = (( sliderPositionNumber >= 7 )? 'bold': ''),
            cityFontColor = '60,60,43',
            cityNameOutlineColor = '255,255,255',
            cityBoundaryWidth = (( sliderPositionNumber > 5 )? '2': '3'),
            cityBoundaryDash = 'solid',
            cityBoundaryColor = (( window.city )?'230,100,80': '178, 140, 98' ),
            cityFillTransparency = (( sliderPositionNumber > 6 )? '0.2': '0'),
            showCityBoundaries = (( sliderPositionNumber < 9 )? true: false ),
            cityRoadTransparency = 0.5,
            showParcelNumbers = (( options.showParcelNumbers_CheckMark )? 'PARCEL_ID': 'false'),
            parcelBoundryWidth = (( sliderPositionNumber <= 1 )? 2 : 1),
            parcelBoundryColor = '185,177,169',
            showWaterFeatures = true,
            showTerrain = false,
            // scaleBarWidth = width * 0.2,
            // scaleBarXCoord = (( width - scaleBarWidth ) - 15),
            // scaleBarYCoord = window.$('mini_footer').clientHeight + 5,
            xmlRequest = undefined,
            mapYearSelected = {'2012': false, '2007': false };

        if( window.city ){ //TODO: This is a test.
            cityBoundaryWidth = 4;
        }
        if( options.showSatelliteView_CheckMark ){
            cityFontColor = '255,255,255';
            cityNameOutlineColor = '20,20,10';
            cityBoundaryDash = 'dash';
            parcelBoundryColor = '230,230,230';
            showWaterFeatures = false;
            cityRoadTransparency = 0.3;
            showTerrain = true;
            if( options.show2007YearMap_CheckMark ){
                mapYearSelected['2007'] = true;
            } else {
                mapYearSelected['2012'] = true;
            }
        }
        if( options.showOverlayMap ){
            if( arg_overLayMap ){
                mapYearSelected['2012'] = true;
            } else {
                mapYearSelected['2007'] = true;
                window.setTimeout( function( makeArcXMLRequest ){ makeArcXMLRequest( minX, maxX, minY, maxY, arg_onPopState, true ); },200 ,makeArcXMLRequest );
            }
        }
        ( ( arg_onPopState )? this.onPopState = true: this.onPopState = false );
        roadWidth = ( sliderPositionNumber > 7 )? 2: roadWidth;
        window.startSend = Date.now();
        this.zoomStartTimer = undefined;
        removeListeners();
        xmlRequest = ['<?xml version="1.0" encoding="UTF-8" ?>',
'<ARCXML version="1.1">',
'<REQUEST>',
'<GET_IMAGE>',
'<PROPERTIES>',
'<ENVELOPE minx="'+ minX +'" miny="'+ minY +'" maxx="'+ maxX +'" maxy="'+ maxY +'"/>',
'<IMAGESIZE height="'+ height +'" width="'+ width +'"/>',
'<LAYERLIST order="false">',
'<LAYERDEF id="12" visible="true" >', // steet names
'<SIMPLELABELRENDERER field="TEXT" labelbufferratio="3.5"  howmanylabels="one_label_per_shape" >',
'<TEXTSYMBOL antialiasing="true" font="Verdana" fontcolor = "'+ cityFontColor +'" outline="'+ cityNameOutlineColor +'" printmode="" fontstyle="bold" fontsize="'+ (roadWidth * multiplier + 9) +'" shadow="" transparency ="1" blockout=""/>',
'</SIMPLELABELRENDERER>',
'</LAYERDEF>',
'<LAYERDEF id="4" visible="'+ options.showCities_CheckMark +'">', //city names and bound
(( window.city )? '<SPATIALQUERY where=" NAME=\''+ window.city +'\'" ></SPATIALQUERY>' :'') , // window.city is a global.

'<GROUPRENDERER>',// TODO: is this group renderer necessary
(( showCityBoundaries || window.city )?//'<SCALEDEPENDENTRENDERER lower="1:1" upper="999999999999">'
//'<GROUPRENDERER>'
'<SIMPLERENDERER>'
+'<SIMPLEPOLYGONSYMBOL boundarytype="solid" boundarytransparency="1" filltransparency="'+ cityFillTransparency +'" boundarywidth="'+ (+cityBoundaryWidth +2) +'" fillcolor="255,255,255" boundarycaptype="round"  boundarycolor="255,255,255"/>'// TODO: Change boundy/fill color, darker with no satellite image, lighter with satellite image.
+'</SIMPLERENDERER>'
+'<SIMPLERENDERER>'
+'<SIMPLEPOLYGONSYMBOL boundarytype="'+ cityBoundaryDash +'" antialiasing="true" boundarytransparency="1" filltransparency="0" boundarywidth="'+ cityBoundaryWidth +'" fillcolor="89,137,208" boundarycaptype="round" boundarycolor="'+ cityBoundaryColor +'"/>'// TODO: Change boundy/fill color, darker with no satellite image, lighter with satellite image.
+'</SIMPLERENDERER>': ''),
//+'</GROUPRENDERER>'
//+'</SCALEDEPENDENTRENDERER>'
//'<SCALEDEPENDENTRENDERER lower="1:3000" upper="1:240000000">',
(( sliderPositionNumber > 1 )?
'<SIMPLELABELRENDERER field="'+ ( ( showCityNames && options.showCities_CheckMark )? 'NAME': 'FALSE' ) +'">'
+'<TEXTSYMBOL antialiasing="true" font="Calibri" fontcolor = "'+ cityFontColor +'" outline="'+ cityNameOutlineColor +'" printmode="'+ cityNameCase +'" fontstyle="'+ cityFontStyle +'" fontsize="'+ cityFontSize +'" shadow="120,120,120" transparency ="1" blockout=""/>'
+'</SIMPLELABELRENDERER>' :''),
//'</SCALEDEPENDENTRENDERER>',
'</GROUPRENDERER>',
'</LAYERDEF>\n',
'<LAYERDEF id="11" visible="true" type="">',// parcel numbers and boundary lines
'<GROUPRENDERER>',
( ( options.showParcelBoundary_CheckMark )?
'<SIMPLERENDERER>'+
'<SIMPLELINESYMBOL type="solid" width="'+ parcelBoundryWidth +'" antialiasing="true" transparency="'+( ( ( 11.5 / ( sliderPositionNumber + 2 ) ) *.10 ) + 0.3 ) +'" captype="round" color="'+ parcelBoundryColor +'"/>'+
'</SIMPLERENDERER>': '' ),
'<SCALEDEPENDENTRENDERER lower="1:1" upper="1:2400">',
'<SIMPLELABELRENDERER field="'+ showParcelNumbers +'">',
'<TEXTSYMBOL antialiasing="true" font="Calibri" fontstyle="" fontsize="14" fontcolor = "'+ cityFontColor +'" outline="'+ cityNameOutlineColor +'"/>',
'</SIMPLELABELRENDERER>',
'</SCALEDEPENDENTRENDERER>',
'</GROUPRENDERER>',
'</LAYERDEF>',
 (( sliderPositionNumber < 5)?
'<LAYERDEF id="13" visible="'+ options.showAddresses_CheckMark +'" >'+
'<SIMPLELABELRENDERER field="'+(( sliderPositionNumber < 3 )?'SITUSLINE1': 'SITUSHOUSE')+'">'+
'<TEXTSYMBOL antialiasing="true" font="Calibri" fontstyle="" fontsize="12" fontcolor="90, 90, 90" outline="255,255,255"/>'+
'</SIMPLELABELRENDERER>'+
'</LAYERDEF>':
'<LAYERDEF id="13" visible="false"/>' ),
'<LAYERDEF id="20" visible="false"/>',
'<LAYERDEF id="9" visible="true" >', // County border
'<SPATIALQUERY where="LABEL=\'Snohomish County\'" >',
'</SPATIALQUERY>',
'<SIMPLERENDERER>',
'<SIMPLEPOLYGONSYMBOL boundarytype="solid"  boundarywidth="3" boundarycaptype="round" boundarycolor="205,197,189" filltransparency="0"/>',// TODO: Change boundy/fill color, darker with no satellite image, lighter with satellite image.
'</SIMPLERENDERER>',
'</LAYERDEF>',
'<LAYERDEF name="Railroad tracks" visible="true"/>',
'<LAYERDEF name="National Forest" visible="false"/>', // displays bright green
//'<LAYERDEF name="2007 Photo Extent" visible="true"/>',
'<LAYERDEF name="2007 Aerial Photo" visible="'+ mapYearSelected['2007'] +'"/>',
'<LAYERDEF id="19" visible="false"/>',
'<LAYERDEF id="18" visible="false"/>',
'<LAYERDEF id="17" visible="false"/>',
'<LAYERDEF id="31" visible="'+ options.$14SaleRecord_CheckMark +'"/>', //TODO: 2013 sales records doesn't work.
'<LAYERDEF id="32" visible="true"/>',
'<LAYERDEF id="33" visible="'+ options.$13SaleRecord_CheckMark +'"/>',
'<LAYERDEF id="34" visible="false"/>',
'<LAYERDEF id="35" visible="'+ options.$12SaleRecord_CheckMark +'"/>',
'<LAYERDEF id="36" visible="false"/>',
'<LAYERDEF id="30" visible="false"/>',// turns on property description, in blue;
'<LAYERDEF id="39" visible="'+ mapYearSelected['2012'] +'"/>',
'<LAYERDEF id="10" visible="'+ showWaterFeatures +'"/>',
'<LAYERDEF id="8" visible="true"/>',
'<LAYERDEF id="7" visible="true"/>',
'<LAYERDEF id="6" visible="'+ (!options.showSatelliteView_CheckMark && sliderPositionNumber < 8) +'" type="polygon">',// roads
'<GROUPRENDERER>',//roads
'<SIMPLERENDERER>',
'<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth + 2) +'" antialiasing="true" transparency="1" captype="round" color="120,120,120" overlap="true"/>',
'</SIMPLERENDERER>',
'<SIMPLERENDERER>',
'<SIMPLELINESYMBOL type="solid" width="'+ roadWidth +'" antialiasing="true" transparency="1" captype="round" color="255,255,255" overlap="true"/>',
'</SIMPLERENDERER>',
'<VALUEMAPRENDERER lookupfield="NAME" labelfield="HWY_NUM" linelabelposition="placeontop" howmanylabels="one_label_per_shape">',
'<EXACT value="I 5;I 405;SR 526" label="">',
 '<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth) +'" antialiasing="true" transparency="1" captype="round" color="'+ interStateColor +'" overlap="true"/>',
'</EXACT>',
'<EXACT value="SR 522;US 2;SR 9;SR 530;" label="">',
 '<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth) +'" antialiasing="true" transparency="1" captype="round" color="'+ highwayColor +'" overlap="true"/>',
//  //' <SHIELDSYMBOL antialiasing="true" font="Arial" fontstyle="regular" fontsize="10" type="usroad"/>',
// // '<TEXTSYMBOL antialiasing="true" interval="1130" font="Arial" fontcolor = "'+ cityFontColor +'" outline="'+ cityNameOutlineColor +'" printmode="'+ cityNameCase +'" fontstyle="" fontsize="15" shadow="120,120,120" transparency ="1" blockout=""/>',
 '</EXACT>',
// // '<OTHER>',
// // '<TEXTSYMBOL antialiasing="true" font="Arial" fontcolor = "'+ cityFontColor +'" outline="'+ cityNameOutlineColor +'" printmode="'+ cityNameCase +'" fontstyle="" fontsize="10" shadow="120,120,120" transparency ="1" blockout=""/>',
// // '</OTHER>',
  '</VALUEMAPRENDERER>',
'</GROUPRENDERER>',
'</LAYERDEF>',
'<LAYERDEF id="5" visible="true" >',
 '<GROUPRENDERER>',
 '<SIMPLERENDERER>',
 '<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth + 1) +'" antialiasing="true" transparency="'+ cityRoadTransparency +'" captype="round" color="200,200,200" overlap="true"/>',
 '</SIMPLERENDERER>',
 '<SIMPLERENDERER>',
 '<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth - 1) +'" antialiasing="true" transparency="'+ cityRoadTransparency +'" captype="round" color="255,255,255" overlap="true"/>',
 '</SIMPLERENDERER>',
 '<SIMPLELABELRENDERER field="HWY_NUM" labelbufferratio="3.5"  howmanylabels="one_label_per_shape" >',
 '<TEXTSYMBOL antialiasing="true" font="Calibri" fontcolor = "'+ cityFontColor +'" outline="'+ cityNameOutlineColor +'" printmode="" fontstyle="" fontsize="14" shadow="120,120,120" transparency ="1" blockout=""/>',
 '</SIMPLELABELRENDERER>',
'<VALUEMAPRENDERER lookupfield="HWY_NUM" labelfield="HWY_NUM" linelabelposition="placeontop" howmanylabels="one_label_per_shape">',
'<EXACT value="I-5;I-405;SR 526" label="">',
 '<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth) +'" antialiasing="true" transparency="1" captype="round" color="'+ interStateColor +'" overlap="true"/>',
'</EXACT>',
'<EXACT value="SR 522;US 2;SR 9;SR 530;" label="">',
 '<SIMPLELINESYMBOL type="solid" width="'+ (roadWidth) +'" antialiasing="true" transparency="1" captype="round" color="'+ highwayColor +'" overlap="true"/>',
'</EXACT>',
  '</VALUEMAPRENDERER>',
'</GROUPRENDERER>',
'</LAYERDEF>',
'<LAYERDEF id="38" visible="false"/>',
'<LAYERDEF id="37" visible="false"/>',
'<LAYERDEF id="3" visible="false"/>',
'<LAYERDEF id="1" visible="false"/>',
//'<LAYERDEF id="2" visible="'+ options.showSatelliteView_CheckMark +'"/>', //satellite view
'<LAYERDEF id="0" visible="'+ showTerrain +'"/>',
'</LAYERLIST>',
'<BACKGROUND color="245,240,235"/>',
'</PROPERTIES>',
// '<LAYER type="acetate" name="theScaleBar">',
// '<OBJECT units="pixel">',
// '<SCALEBAR coords="'+ scaleBarXCoord +' '+ scaleBarYCoord +'" outline="'+ cityNameOutlineColor +'" font="Arial" fontcolor="'+ cityFontColor +'" style="Bold" barcolor="255,255,255" mapunits="feet" scaleunits="feet" antialiasing="True" screenlength="'+ scaleBarWidth +'" fontsize="15" barwidth="7" overlap="False"/>',

// '</OBJECT>',
// '</LAYER>',
'</GET_IMAGE>',
'</REQUEST>',
'</ARCXML>'].join( '' );
    window.city = false; // TODO: This is a global.
    if( !arg_overLayMap ){
        mainAjax( xmlRequest );
    } else {
        window.overlayMap_module.overlayAjax( xmlRequest );
    }
    }.bind( window.theMap );

    return {
        convertMouseCoordsToStatePlane: convertMouseCoordsToStatePlane,
        firstMapLoad: firstMapLoad,
        createMarkersFromInfoFromUrl: createMarkersFromInfoFromUrl,
        getInfoFromUrl: getInfoFromUrl,
        popStateHandler: popStateHandler,
        addPageHasFocusClickHandling: addPageHasFocusClickHandling,
        checkUrlForApn: checkUrlForApn,
        addListeners: addListeners,
        handleAjaxError: handleAjaxError, 
        removeListeners: removeListeners,
        getBase64Image: getBase64Image,
        handleResize: handleResize,
        calculateMaxWidthHeight:calculateMaxWidthHeight,
        removeTransitionFromMarkers: removeTransitionFromMarkers,
        testProp: testProp,
        simpleMessageBox: simpleMessageBox,
        mainAjax: mainAjax,
        makeArcXMLRequest: makeArcXMLRequest,
    }
}();

/*errors: <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=Cp1252"><HTML><HEAD><TITLE>Default Form</TITLE><!-- Title must match jsForm.htm's title --><SCRIPT TYPE="text/javascript" LANGUAGE="JavaScript">function passXML() {

var XMLResponse='<?xml version="1.0" encoding="UTF-8"?><ARCXML version="1.1"><RESPONSE><ERROR>Server: Assessor was not found.</ERROR></RESPONSE></ARCXML>';
null(XMLResponse);
}</SCRIPT></HEAD><BODY BGCOLOR="null" onload="passXML()"><FORM ACTION="" METHOD="POST" name="theForm"><!--- <input type="Hidden" name="Form" value="True"> ---><INPUT TYPE="Hidden" NAME="ArcXMLRequest" VALUE=""><INPUT TYPE="Hidden" NAME="JavaScriptFunction" VALUE="parent.MapFrame.processXML"><INPUT TYPE="Hidden" NAME="BgColor" VALUE="null"><INPUT TYPE="Hidden" NAME="FormCharset" VALUE="Cp1252"><INPUT TYPE="Hidden" NAME="RedirectURL" VALUE=""><INPUT TYPE="Hidden" NAME="HeaderFile" VALUE=""><INPUT TYPE="Hidden" NAME="FooterFile" VALUE=""></FORM></BODY></HTML>

*/