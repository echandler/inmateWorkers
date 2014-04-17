window.mapControl_module = function(){

    var setImg = function(){
        var xmlEnvelope = window.xml.getElementsByTagName( "ENVELOPE" ),
            xmlOutput = window.xml.getElementsByTagName( "OUTPUT" );

        try{
            this.src = xmlOutput[0].getAttribute( 'url' );
            this.hiddenImage.style.cssText += 'visibility: visible;';
            this.hiddenImage.style[this.cssTransform] = this.style[this.cssTransform];
        } catch( e ){
            window.utilities_module.handleAjaxError( e );
            resetMapOnError();
            return;
        }
        this._left = 0 - this.dragDiv._left;
        this._top  = 0 - this.dragDiv._top;
        this._height = this.resizedMapHeight;
        this._width  = this.resizedMapWidth;
        this.setAttribute( 'style', 'opacity: 0; height:'+ this._height +'px; width:'+ this._width +'px;' );
        this.tempTransformText = 'translate3d('+ this._left +'px,'+ this._top  +'px, 0px)';
        this.style[this.cssTransform] = this.tempTransformText;
        this.tempTransformString = '';
        window.$( 'svg_container' ).style.top = this._top   +'px';
        window.$( 'svg_container' ).style.left = this._left +'px';
        if ( xmlEnvelope && xmlEnvelope[0] ){
            this.presentMinX = +xmlEnvelope[0].getAttribute( 'minx' );
            this.presentMaxX = +xmlEnvelope[0].getAttribute( 'maxx' );
            this.presentMinY = +xmlEnvelope[0].getAttribute( 'miny' );
            this.presentMaxY = +xmlEnvelope[0].getAttribute( 'maxy' );
        }
        window.smallCountySvg_module.smallCountySvgReCalc();
        window.overlayMap_module.overlayMapUpdateTopLeft( this._left, this._top  );
    }.bind( window.theMap );

    var mapLoad = function(){
        this.className += " transitionAll2sEaseOut";
        this.setTimeoutt( function(){ this.className = this.className.replace( / transitionAll2sEaseOut/, '' ); }.bind( this ), 500 );
        this.calculateMarkerPosition();
        this.style.opacity = '1';
        window.setTimeout( function(){
            this.hiddenImage.className = "";
            this.hiddenImage.style.visibility = 'hidden';
            this.hiddenImage.src = this.src;
            if ( !this.onPopState ){
                window.history.pushState( {
                    minxOld : this.presentMinX,
                    maxxOld : this.presentMaxX,
                    minyOld : this.presentMinY,
                    maxyOld : this.presentMaxY,
                    zoom: window.$( 'zoom_slider' ).style.top,
                    title: "SnoCo Interactive Map "+ (++window.popStateCounter),
                },
                "title 1", 
                '?={"x":'+ this.presentMinX +',"mx":'+ this.presentMaxX +',"y":'+ this.presentMinY +',"my":'+ this.presentMaxY +',"z":'+ this.sliderPosition +'}' 
                );
                document.title = "SnoCo Interactive Map "+ window.popStateCounter;
            } 
            
        }.bind( this ), 500);
        window.marker_module.isSimpleMarkerOnImage();
        window.utilities_module.addListeners();
        document.body.className = '';
        if ( this.panningAnimationTrueFalse ){
            window.panning_module.calculatePanTime( Date.now() );
        }
    }

    // This is attached to the map in main.js. 
    var mapLoadError = function( e ){
        window.utilities_module.addListeners();
        this.className = '';
        document.body.className = '';
        console.dir( e );
        window.alert(' There was a problem, the map image didn\'t load properly.\n\n Please try again.\n\n');
        resetMapOnError();
    }
    
    var resetMapOnError = function(){
        window.utilities_module.addListeners();
        this._left = 0 - this.dragDiv._left;
        this._top  = 0 - this.dragDiv._top;
        this._height = this.resizedMapHeight;
        this._width  = this.resizedMapWidth;
        this.setAttribute( 'style', 'opacity: 0; height:'+ this._height +'px; width:'+ this._width +'px;' );
        this.tempTransformText = 'translate3d('+ this._left +'px,'+ this._top  +'px, 0px)';
        this.style[this.cssTransform] = this.tempTransformText;
        this.tempTransformString = '';
        this.style.opacity = '1';
        document.body.className = '';
        this.calculateMarkerPosition();
    }.bind( window.theMap );

    var theMap_mouseDown = function ( e ){ // mouse down on theMap, either set a marker or drag the map.
        if ( e.which !== 1 ){ return; }
        if ( e.shiftKey ){ window.boxZoom_module.boxZoom_mouseDown( e ); return false; }
        e.preventDefault();
        this.clearTimeoutt( this.zoomStartTimer );
        this.className = '';
        this.pan.oldMouseX = e.clientX;
        this.pan.oldMouseY = e.clientY;
        this.pan.oldMouseXpan = e.clientX - this.dragDiv._left ;
        this.pan.oldMouseYpan = e.clientY - this.dragDiv._top ;
        this.pan.panningXYOld = undefined;
        this.pan.panningXYNew = undefined;
        window.utilities_module.removeTransitionFromMarkers();
        document.addEventListener( 'mouseout', private_mapMouseUp );
        document.addEventListener( 'mouseup', private_mapMouseUp );
        document.addEventListener( 'mousemove', this.pan.mouseMoveFunction );
    }.bind( window.theMap );

    var private_mapMouseUp = function ( e ){// mouse up for the image
        var xyCoords = undefined;

        if ( e.relatedTarget ){ return }
        e.preventDefault();
        this.document.removeEventListener( 'mouseup', private_mapMouseUp );
        this.document.removeEventListener( 'mouseout', private_mapMouseUp ); 
        this.document.removeEventListener( 'mousemove',  this.theMap.pan.mouseMoveFunction );
        if ( !window.pageHasFocus ){ 
            window.pageHasFocus = true;
            if ( e.clientY - this.theMap.pan.oldMouseY === 0 && e.clientX - this.theMap.pan.oldMouseX === 0 ){
                return;
            }
         }
        if ( !this.theMap.zoomStartTimer && e.clientY - this.theMap.pan.oldMouseY === 0 && e.clientX - this.theMap.pan.oldMouseX === 0 ){
            window.marker_module.makeMarker( e );
        } else {
            if ( this.theMap.panningAnimationTrueFalse ){
                 this.panningAnimationMouseUp( e );
            }
            xyCoords = theMap.dragDiv.style[this.theMap.cssTransform].match(/(-?[\d.]*?)px, (-?[\d.]*?)px/);
            theMap.dragDiv._top = +xyCoords[2];
            theMap.dragDiv._left = +xyCoords[1];
            window.zoom_module.zoomStart(
                [( e.clientX - this.theMap.containerStyleLeft  - theMap.dragDiv._left - +this.theMap._left ) , 
                 ( e.clientY - this.theMap.containerStyleTop - theMap.dragDiv._top - +this.theMap._top  )],
                e.clientX,  e.clientY );
        }
    }.bind( { theMap: window.theMap, document: window.document, panningAnimationMouseUp: window.panning_module.panningAnimationMouseUp } );

    var mapDragOnly = function( e ){
        if ( e.clientY - this.pan.oldMouseY == 0 && e.clientX - this.pan.oldMouseX == 0 ){ return; }
        var y = e.clientY - this.pan.oldMouseYpan,
            x = e.clientX - this.pan.oldMouseXpan,
            markers = this.markersArray,
            len = markers.length;

        this.dragDiv.style.top = this.dragDiv._top + (e.clientY - this.pan.oldMouseY) +'px';
        this.dragDiv.style.left= this.dragDiv._left + (e.clientX - this.pan.oldMouseX) +'px';
    }.bind( window.theMap );

    var mapDragAndAnimation = function( e ){
        if ( e.clientY - this.theMap.pan.oldMouseY == 0 && e.clientX - this.theMap.pan.oldMouseX == 0 ){ return; }
        var y =  e.clientY - this.theMap.pan.oldMouseYpan,
            x =  e.clientX - this.theMap.pan.oldMouseXpan,
            markers = this.theMap.markersArray,
            len = markers.length;

        this.theMap.pan.panningXYOld = this.theMap.pan.panningXYNew || [x, y];
        this.theMap.pan.panningXYNew = [x, y, this.date.now()];
        //this.theMap.dragDiv.style.top = this.theMap.dragDiv._top + (e.clientY - this.theMap.pan.oldMouseY) +'px';
        //this.theMap.dragDiv.style.left= this.theMap.dragDiv._left + (e.clientX - this.theMap.pan.oldMouseX) +'px';
        this.theMap.dragDiv.style[this.theMap.cssTransform] = 'translate3d('+ (this.theMap.dragDiv._left + (e.clientX - this.theMap.pan.oldMouseX)) +'px,'+ (this.theMap.dragDiv._top + (e.clientY - this.theMap.pan.oldMouseY)) +'px, 0px)';
    }.bind( { theMap: window.theMap, date: window.Date } );

    return {
        setImg: setImg,
        mapLoad: mapLoad,
        mapLoadError: mapLoadError,
        resetMapOnError:  resetMapOnError,
        theMap_mouseDown: theMap_mouseDown,
        mapDragOnly: mapDragOnly,
        mapDragAndAnimation: mapDragAndAnimation,
    }
}();