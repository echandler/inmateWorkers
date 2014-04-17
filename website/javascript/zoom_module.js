window.zoom_module = function (){
    var math = window.Math,
        theMap = window.theMap;// TODO: can this be deleted?

    // TODO: This is the old way of calculating the new coordinates to send to the server.
    // I'm not even sure exactly how it works anymore :/, but here is an attempt at explaining it.
    var centerMainImage = function ( mousex, mousey, mouseX, mouseY ){
        var presentStatePlaneWidth = this.presentMaxX - this.presentMinX,
            presentStatePlaneHeight = this.presentMaxY - this.presentMinY,

            // Calculate a multiplier to convert the old coordinates to new coordinates.
            // _width and _height are the zoomed in or out width and height.
            xMultiplier = presentStatePlaneWidth / this._width, //example: ( 1311592.01401389 - 1301107.16345745 ) / 2940.414201183432 = 3.5657733363619664. This is the X multiplier.
            yMultiplier = presentStatePlaneHeight / this._height, 

            // Find the state plane coordinate that is half way between the min and max. 
            // halfStatePlaneWidth,halfStatePlaneHeight = middle point;
            halfStatePlaneWidth = ( presentStatePlaneWidth ) / 2, //example: 1311592.01401389 - 1301107.16345745 = 10484.850556439953 / 2 = 5242.4252782199765
            halfStatePlaneHeight = ( presentStatePlaneHeight ) / 2,

            // Adjust the coordinates so that the spot the person was zooming in on is 
            // in the center, by converting that spot to state plane coordinates, then 
            // subtracting half the width and height from all corners. That will move 
            // that spot to the center.
            minx = ( ( mousex * xMultiplier ) + this.presentMinX ) - halfStatePlaneWidth, //example: ( ( 1310.9346646942802 * 3.5657733363619664 ) + 1301107.16345745 ) - 5242.4252782199765 = 1300539.2340523093 
            maxx = ( ( mousex * xMultiplier ) + this.presentMaxX ) - halfStatePlaneWidth, 
            miny = ( ( this._height - mousey ) * yMultiplier ) + this.presentMinY - halfStatePlaneHeight,
            maxy = ( ( this._height - mousey ) * yMultiplier ) + this.presentMaxY - halfStatePlaneHeight,

            // This calculates the zooming in or zooming out by expanding or contracting 
            // the state plane width and height accordingly.
            doTheZoomWidth = presentStatePlaneWidth - ( /* I got this by accident */ this.zoomPower[this.sliderPosition] / ( this.resizedMapHeight / this.viewPortHeight ) ),
            doTheZoomHeight = presentStatePlaneHeight - ( /* I got this by accident */ this.zoomPower[this.sliderPosition] / ( this.resizedMapWidth / this.viewPortHeight ) );
        
        // Calculate the half width and height of the new zoomed width and height.
        halfStatePlaneWidth = doTheZoomWidth / 2;
        halfStatePlaneHeight = doTheZoomHeight / 2;

        // Adjust the min/max state plane coordinates.
        minx = minx + halfStatePlaneWidth;
        maxx = maxx - halfStatePlaneWidth;
        miny = miny + halfStatePlaneHeight;
        maxy = maxy - halfStatePlaneHeight;

        // Calculate a new half width and height again.
        halfStatePlaneWidth = ( maxx - minx ) / 2;
        halfStatePlaneHeight = ( maxy - miny ) / 2; 

        // Change course a bit and calculate a multiplier for the new min/max
        // coordinates by the size that the final map will be on the screen.
        xMultiplier = ( maxx - minx ) / this.resizedMapWidth;
        yMultiplier = ( maxy - miny ) / this.resizedMapHeight;

        // Adjust the mouseX (e.clientX) and mouseY (e.clientY) so that they reflect
        // where they are on the mapContainer ( may be smaller than the actual screen)
        // if the screen is bigger than the window.parameters.MAX_IMG_PIXELS contestant.
        mouseX = mouseX - this.containerStyleLeft;
        mouseY = mouseY - this.containerStyleTop;
        
        // Finish it by moving the spot that the person was zooming in/out away from
        // the center and back to where it was originally. Previously we subtracted the 
        // half width and height to move the spot to the center, now we are adding the 
        // half width and height back and subtracting converted mouseX(Y) coordinates
        // so that the spot will be under their mouse like they expect.
        minx = halfStatePlaneWidth + minx - ( mouseX * xMultiplier );
        maxx = halfStatePlaneWidth + maxx - ( mouseX * xMultiplier );
        maxy = halfStatePlaneHeight + maxy - ( ( this.resizedMapHeight - mouseY ) * yMultiplier );
        miny = halfStatePlaneHeight + miny - ( ( this.resizedMapHeight - mouseY ) * yMultiplier );
        
        // So basically: 
        // 1) move the spot the person was zooming at to the center.
        // 2) zoom in/out.
        // 3) move the spot back under the mouse pointer.

        // Send it off to make some XML.
        window.utilities_module.makeArcXMLRequest( minx, maxx, miny, maxy );
    }.bind( window.theMap );

    var plus = function (){
        zoomInOut( {
                    wheelDelta: 120,
                    clientX: this.viewPortWidth/2,
                    clientY: this.viewPortHeight/2,
                    } );
    }

    var minus = function (){
        zoomInOut( {
                    wheelDelta: -120,
                    clientX: this.viewPortWidth/2,
                    clientY: this.viewPortHeight/2,
                    } );
    }

    function sliderMouseDown( e ){
        document.body.style.cursor = 'pointer';
        window.addEventListener( 'mousemove', sliderMove, true );
        window.addEventListener( 'mouseup', sliderMouseUp, false );
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    var sliderMouseUp = function ( e ){
        document.body.style.cursor = 'default'; 
        window.removeEventListener( 'mousemove', sliderMove, true );
        window.removeEventListener( 'mouseup', sliderMouseUp, false );
        zoomStart( [ this._width/2, this._height/2 ] , this.viewPortWidth/2, this.viewPortHeight/2 );
        e.preventDefault();
        e.stopImmediatePropagation();
    }.bind( window.theMap )

    // This is fairly lazy, I didn't want to make a whole new zoom function,
    // probably should thou because if the person zooms in and out to fast,
    // it will get confused.
    var sliderMove = function ( e ){
        var z = this.round( ( e.clientY - this.theMap.zoom_slider_container_styleTop ) / 11 ) * 10; 
        if ( z >= -10 && z < 210 && z !== this.theMap.sliderPosition && z % 20 === 0 ){
            if ( z > this.theMap.sliderPosition ){
                zoomInOut( {
                            wheelDelta: -120,
                            clientX: this.theMap.viewPortWidth/2,
                            clientY: this.theMap.viewPortHeight/2,
                            }, true );
            } else { 
                zoomInOut( {
                            wheelDelta: 120,
                            clientX: this.theMap.viewPortWidth/2,
                            clientY: this.theMap.viewPortHeight/2,
                            }, true ); 
            }
            this.theMap.sliderPosition = z;
            this.zoom_slider.top = z +'px';
        }
    }.bind( {   theMap: window.theMap,
                zoom_slider: window.$( 'zoom_slider' ).style,
                round: Math.round,
            });

    var zoomInOut = function( e, slider ){
        var evt = undefined, // This is need for the delta.
            delta = ( ( e.wheelDelta )? e.wheelDelta: ( evt = ( window.event || e ), evt.detail * - 120 ) ),
            clientX = e.clientX - this.containerStyleLeft,
            clientY = e.clientY - this.containerStyleTop,
        
            // Find where the mouse is on the map img its self, not where the mouse is in the viewport (aka screen).
            XcoordOnMapImg = ( clientX - this.dragDiv._left ) - this._left,
            YcoordOnMapImg = (  clientY - this.dragDiv._top ) - this._top ,
            markers = this.markersArray, i = markers.length,
            ratio = undefined,
            xMultiplier = undefined,
            yMultiplier = undefined,
            x = undefined,
            y = undefined;
            
        this.clearTimeoutt( this.zoomStartTimer );
        if ( delta <= -120 && this.sliderPosition <= 200 ){ //zoom out
            ratio = ( this.sliderPosition  !== 200 )? 0.5: 1;
            if ( !slider && this.sliderPosition  !== 200 ){
                this.sliderPosition += 20;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            } else if ( !slider ){
                this.sliderPosition = 200;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            }
        } else if ( delta >= 120 && this.sliderPosition >= 0 ){ // zoom in
            ratio = ( this.sliderPosition  !== 0 )? 2: 1;
            if ( !slider && this.sliderPosition  !== 0 ){
                this.sliderPosition -= 20;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            } else if ( !slider ){
               this.sliderPosition = 0;
            }
        }
        this.className = "smoothTransition";
        this._left = this._left - ( ( XcoordOnMapImg / this._width ) * ( ratio * this._width ) ) + XcoordOnMapImg ;
        this._top  = this._top  - ( ( YcoordOnMapImg / this._height ) * ( ratio * this._height ) - YcoordOnMapImg );
        this._height = this._height * ratio;
        this._width  = this._width * ratio;
        if( ratio === 2 ){
            x = clientX - ( this.resizedMapWidth / 2 );
            y = clientY - ( this.resizedMapHeight / 2 );
            this.tempTransformString = 'translate3d('+ (0-x) +'px,'+ (0-y) +'px, 0px) scale(2)' + this.tempTransformString;
        } else if( ratio === 0.5 ){
            x = ( clientX - (this.resizedMapWidth / 2 ) )/2;
            y = ( clientY - (this.resizedMapHeight / 2 ) )/2;
            this.tempTransformString = 'translate3d('+ x +'px,'+ y +'px, 0px) scale(0.5)' + this.tempTransformString;
        }
        this.style[this.cssTransform] = this.tempTransformText + this.tempTransformString;
        if ( i  !== 0 ){
            xMultiplier = ( this.presentMaxX - this.presentMinX ) / this._width;
            yMultiplier = ( this.presentMaxY - this.presentMinY ) / this._height;
            while( i-- ){
                m = markers[i];
                markers[i].styleLeft = ( ( markers[i].statePlaneCoordX - this.presentMinX ) / xMultiplier ) - markers[i].offsetwidth - 3;
                markers[i].styleTop  = ( ( this.presentMaxY - markers[i].statePlaneCoordY ) / yMultiplier ) - markers[i].offsetheight;
                markers[i].style.transition = 'all 0.4s cubic-bezier( 0,0,0.25,1 )';
                markers[i].style[this.cssTransform] = 'translate3d( '+ ~~( markers[i].styleLeft + this._left ) +'px, '+ ~~( markers[i].styleTop + this._top  ) +'px,0px)';
            }
        }
        if ( !slider ){
            this.zoomStartTimer = this.setTimeoutt( function( newMousePosition, x, y ){ zoomStart( newMousePosition, x, y ); window.utilities_module.removeTransitionFromMarkers(); }, 1000, [ e.clientX - this.containerStyleLeft - this.dragDiv._left - this._left, e.clientY - this.containerStyleTop - this.dragDiv._top - this._top  ], e.clientX, e.clientY );
        }
    }.bind( window.theMap );

    // TODO: rename newMousePostion and x,y to be more readable.
    // @params newMousePostion = mouse x,y coords on map (map could be zoomed in or out);
    // @params x,y = mouse x,y coord on the monitor (e.clientX, e.clientY);
    var zoomStart = function( newMousePosition, x, y ){
        if ( this.sliderPosition === 200 ){ //zoomed all the way out
            zoomAllTheWayOut();
        } else {
            centerMainImage( newMousePosition[0], newMousePosition[1], x, y );
        }
    }.bind( window.theMap );

    var zoomAllTheWayOut = function(){
        this.sliderPosition = 200;
        this.zoomSliderStyle.top = this.sliderPosition +'px';
        window.utilities_module.makeArcXMLRequest( window.parameters.FULLZOOMMINX, window.parameters.FULLZOOMMAXX, window.parameters.FULLZOOMMINY, window.parameters.FULLZOOMMAXY );
    }.bind( theMap );

    return {
        zoomStart: zoomStart,
        zoomAllTheWayOut: zoomAllTheWayOut,
        plus: plus,
        minus: minus,
        sliderMove: sliderMove,
        sliderMouseUp: sliderMouseUp,
        sliderMouseDown: sliderMouseDown,
        zoomInOut: zoomInOut,
        centerMainImage: centerMainImage,
    }
}()
// failed: 3d rendering http://jsfiddle.net/94D62/6/
// !failed: http://jsfiddle.net/Ua5LG/2/
//http://jsbin.com/zasebewu/8/edit
/* TODO
    * clean up makeArcXMLRequest().
    * done: make it so the pan works on full zoom out.
    * Done: rename "t".
    * delete unused properties and methods in the window.zoom_module.js return object.
    * make it so the marker information ( message, image url ) is saved in local storage.
    * Done: add the "sliderPosition" variable to the "theMap".
*/