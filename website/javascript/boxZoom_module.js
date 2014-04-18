var boxZoom_module = function(){

// TODO: Re-factor these 'box' functions.
    function boxZoom_mouseDown(e){
        var zoomBox = document.createElement('div');

        e.preventDefault();
        zoomBox.id = 'boxZoom';
        zoomBox.className = 'boxZoom';
        window.$( 'theMap_container' ).appendChild( zoomBox );
        zoomBox.style.top  = e.clientY - window.theMap.containerStyleTop +'px';
        zoomBox.style.left = e.clientX - window.theMap.containerStyleLeft +'px';
        zoomBox.start = {x: undefined, y: undefined };// TODO: is this still used anywhere?
        zoomBox.start.clientX = e.clientX;
        zoomBox.start.clientY = e.clientY;
        //zoomBox.ratioWH = window.theMap.resizedMapWidth/window.theMap.resizedMapHeight;
        //zoomBox.zoomLevel = 0;
        window.pageHasFocus = true;
        window.theMap.boxZoom = zoomBox;
        window.addEventListener('mousemove', private_boxZoom_mouseMove );
        window.addEventListener('mouseup', private_boxZoom_mouseUp );
    }

    var private_boxZoom_mouseUp = function( e ){
        var widthOfBox = e.clientX - this.boxZoom.start.clientX,
            heightOfBox = e.clientY - this.boxZoom.start.clientY,
            mapHalfWidthPoint =  this.resizedMapWidth / 2 + this.containerStyleLeft,
            mapHalfHeightPoint = this.resizedMapHeight / 2+ this.containerStyleTop,
            centerPointOfBox = {x: ( widthOfBox / 2 ) + this.boxZoom.start.clientX + this.containerStyleLeft,
                                y: ( heightOfBox / 2) + this.boxZoom.start.clientY + this.containerStyleTop };

        window.removeEventListener( 'mousemove', private_boxZoom_mouseMove );
        window.removeEventListener( 'mouseup', private_boxZoom_mouseUp );
        
        // Move the maps virtual left and top so that the middle of the zoom box is in the middle of the screen.
        this._left = ( mapHalfWidthPoint - centerPointOfBox.x ) + this.containerStyleLeft;
        this._top  = ( mapHalfHeightPoint - centerPointOfBox.y ) + this.containerStyleTop;
        boxZoom_doTheZoom( {width: widthOfBox, height: heightOfBox, x: mapHalfWidthPoint, y: mapHalfHeightPoint });
        this.boxZoom.style.transition ="opacity 0.15s ease-in-out";
        this.boxZoom.style.opacity = 0;
        setTimeout( function(){ this.mapContainer.removeChild( this.boxZoom ); }.bind( this ), 170);
    }.bind( window.theMap );

    var private_boxZoom_mouseMove = function( e ){
        this.boxZoom.style.width = ( e.clientX - this.boxZoom.start.clientX ) +'px';
        this.boxZoom.style.height = ( e.clientY - this.boxZoom.start.clientY ) +'px';
    }.bind( theMap )
    
    var boxZoom_doTheZoom = function( arg_zoomBox ){
        
        // X,YcoordOnMapImg is where the mouse is on the map image its self, not where the mouse is in the viewport (aka screen).
        var XcoordOnMapImg = ( arg_zoomBox.x - this.containerStyleLeft ) - this._left,
            YcoordOnMapImg = ( arg_zoomBox.y - this.containerStyleTop ) - this._top ,
            ratio = undefined,
            tempHeight = undefined,
            tempWidth = undefined,
            heightRatioOfBoxToMap = undefined,
            widthRatioOfBoxToMap = undefined;

        if(  this.sliderPosition >= 0 ){ // zoom in
            ratio = this.zoomPower[this.sliderPosition] / this.zoomPower[( this.sliderPosition  !== 0 )? ( this.sliderPosition - 20 ): this.sliderPosition];
            if ( this.sliderPosition  !== 0 ){
                this.sliderPosition -= 20;
                this.zoomSliderStyle.top = this.sliderPosition +'px';
            } else {
               this.sliderPosition = 0;
            }
        }
        
        heightRatioOfBoxToMap = arg_zoomBox.height / this._height;
        widthRatioOfBoxToMap = arg_zoomBox.width / this._width;
        this._left = this._left - ( ( XcoordOnMapImg / this._width ) * ( ratio * this._width ) ) + XcoordOnMapImg ;
        this._top  = this._top  - ( ( YcoordOnMapImg / this._height ) * ( ratio * this._height ) - YcoordOnMapImg );
        this._height = this._height * ratio;
        this._width  = this._width * ratio;
        tempWidth =  this._width * widthRatioOfBoxToMap;
        tempHeight = this._height * heightRatioOfBoxToMap;
        if( tempWidth > this.resizedMapWidth ){
            this.sliderPosition += 20;
            this.zoomSliderStyle.top = this.sliderPosition +'px';
            zoom_module.zoomStart( [ arg_zoomBox.x - this.containerStyleLeft - this._left, arg_zoomBox.y - this.containerStyleTop - this._top  ], arg_zoomBox.x, arg_zoomBox.y );
        }else if( tempHeight > this.resizedMapHeight ){
            this.sliderPosition += 20;
            this.zoomSliderStyle.top = this.sliderPosition +'px';
            zoom_module.zoomStart( [ arg_zoomBox.x - this.containerStyleLeft - this._left, arg_zoomBox.y - this.containerStyleTop - this._top  ], arg_zoomBox.x, arg_zoomBox.y );
        }else if( this.sliderPosition === 0 ){
            zoom_module.zoomStart( [ arg_zoomBox.x - this.containerStyleLeft - this._left, arg_zoomBox.y - this.containerStyleTop - this._top  ], arg_zoomBox.x, arg_zoomBox.y );
        } else {
            arg_zoomBox.height = tempHeight;
            arg_zoomBox.width = tempWidth;
            boxZoom_doTheZoom( arg_zoomBox );
        }
    }.bind( window.theMap );

    return{
        boxZoom_mouseDown: boxZoom_mouseDown,
        boxZoom_doTheZoom: boxZoom_doTheZoom,
    };
}()