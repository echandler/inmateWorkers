var drawSvgLine_module = function(){
    var drawLineOptionsLabel = window.$( 'drawLine_Label' ),
        drawLineOptionsCheckMark = window.$( 'drawLine_CheckMark' ),
        svgContainer =  window.$( 'svg_container' ),
        doubleClick = false,
        doubleClickTimer = undefined,
        drawingALine = false,
        drawSvgLinesArray = [],
        mouseMoveHandler = undefined;
    
    var createNewPolyline = function( e ){
        var polyline = createPolyline(), theMap = window.theMap;
        polyline.setAttribute( 'points',  (e.clientX-theMap.containerStyleLeft) +','+ (e.clientY-theMap.containerStyleTop ));
        polyline.startPoint = createStartPoint( e );
        polyline.endPoint = undefined;
        polyline.statePlaneCoords = [ window.utilities_module.convertMouseCoordsToStatePlane( e ) ];
        polyline.currentPoints = [ (e.clientX-theMap.containerStyleLeft) +','+ (e.clientY-theMap.containerStyleTop) ];
        polyline.currentPointsString = (e.clientX-theMap.containerStyleLeft) +','+ (e.clientY-theMap.containerStyleTop);
        drawSvgLinesArray.push( polyline );
        polyline.startPoint.onclick = startPointOnClick.bind( polyline ); 
        polyline.deleteDoubleClick = false;
        svgContainer.appendChild( polyline );
        svgContainer.appendChild( polyline.startPoint );
        mouseMoveHandler = function( e ){
            this.polyline.setAttribute('points', this.polyline.currentPointsString +' '+ (e.clientX-this.theMap.containerStyleLeft) +','+ (e.clientY-this.theMap.containerStyleTop) );
        }.bind( { polyline: polyline, theMap: theMap } );
        svgContainer.addEventListener('mousemove', mouseMoveHandler);
    }

    var svgContainerDrawLineClickHandler = function( e ){
        var currentPoints = undefined,
            polyline = drawSvgLinesArray[ drawSvgLinesArray.length -1],
            getSP = window.utilities_module.convertMouseCoordsToStatePlane;

        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        if( !doubleClick && !drawingALine ){
            createNewPolyline( e );
            drawingALine = true;
        } else if( doubleClick ){
            window.clearTimeout( doubleClickTimer );
            drawingALine = false;
            svgContainer.removeEventListener('mousemove', mouseMoveHandler);
            //polyline.startPoint.onmouseover = function(){ this.style.stroke = 'rgb(225,0,0)'; };
            //polyline.startPoint.onmouseout = function(){ this.style.stroke = 'blue' };
            polyline.endPoint = createEndPoint( e );
            svgContainer.appendChild( polyline.endPoint );
            polyline.endPoint.onclick = endPointOnClick.bind( polyline );
        } else if( drawingALine ){
            polyline.currentPoints.push( ( e.clientX - window.theMap.containerStyleLeft ) +','+ ( e.clientY - window.theMap.containerStyleTop ) );
            polyline.currentPointsString = polyline.currentPoints.join(' ');
            polyline.statePlaneCoords.push( getSP({ clientX: e.clientX, clientY: e.clientY }) );
            polyline.setAttribute('points', polyline.currentPointsString );
        }
        doubleClick = true;
        doubleClickTimer = window.setTimeout(function(){ this.setDoublClickToFalse() }.bind( { setDoublClickToFalse: setDoublClickToFalse }), 200 );
    }

    var setDoublClickToFalse = function(){
        doubleClick = false;
    }

    function createStartPoint( e ){
        var startPoint = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        startPoint.setAttribute('cx', ((e&&(e.clientX-window.theMap.containerStyleLeft )) || 0) );
        startPoint.setAttribute('cy', ((e&&(e.clientY-window.theMap.containerStyleTop )) || 0) );
        startPoint.setAttribute('r', '5px' );
        startPoint.style.fill = 'white';
        startPoint.style.stroke = 'white'
        startPoint.style.cursor = 'pointer';
        return startPoint;
    }

    function startPointOnClick( e ){
        e.stopPropagation();
        if( !drawingALine && this.deleteDoubleClick ){
            deleteLineFromArray( this );
        } else if( drawingALine ){
            svgContainer.removeEventListener('mousemove', mouseMoveHandler);
            drawingALine = false;
            this.endPoint = this.startPoint;
            this.currentPoints.push( this.currentPoints[0] );
            this.statePlaneCoords.push( this.statePlaneCoords[0] );
            this.setAttribute('points', this.currentPoints.join(' ') );
        }
        this.deleteDoubleClick = true;
        window.setTimeout( function(){ this.deleteDoubleClick = false; }.bind(this), 200);
    }

    function createEndPoint( e ){
        var endPoint = createStartPoint( e );
        endPoint.setAttribute( 'r', '4px' );
        return endPoint;
    }

    function endPointOnClick(e){ 
        e.stopPropagation(); 
        if( this.deleteDoubleClick ){
            deleteLineFromArray( this );
        }
        this.deleteDoubleClick = true;
        window.setTimeout( function(){ this.deleteDoubleClick = false; }.bind(this), 200);
    }

    function createPolyline( e ){
        var polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        polyline.setAttribute( 'class', 'drawSvgLine' );
        polyline.style.strokeWidth = '3px';
        if( window.theMap.optionsReference.showSatelliteView_CheckMark ){
            polyline.style.stroke = 'rgb(225,0,0)';
        } else {
            polyline.style.stroke = 'rgb(93, 141, 195)';
        }
        polyline.style.fill = 'transparent';
        return polyline;
    }

    var createPolylinesFromUrl = function( arg_linesArray ){
        var polyLine = undefined,
            spCoords = undefined;

        for( var n = 0; n < arg_linesArray.length; ++n ){
            polyline = createPolyline();
            polyline.startPoint = createStartPoint();
            polyline.endPoint = createEndPoint();
            polyline.statePlaneCoords = [];
            for( var t = 0; t < arg_linesArray[n].length; ++t ){
                spCoords = arg_linesArray[n][t].split(',');
                polyline.statePlaneCoords.push( { x: +spCoords[0], y: +spCoords[1]} );
            }
            //polyline.currentPoints = [ e.clientX +','+ e.clientY ];
            drawSvgLinesArray.push( polyline );
            polyline.startPoint.onclick = startPointOnClick.bind( polyline );
            polyline.endPoint.onclick = endPointOnClick.bind( polyline );
            svgContainer.appendChild( polyline );
            svgContainer.appendChild( polyline.startPoint );
            svgContainer.appendChild( polyline.endPoint );
        }
        drawLinesResizeLines();
    }
    var  drawLinesResizeLines = function(){
            var lines = drawSvgLinesArray,
                showSatelliteView_CheckMark = window.theMap.optionsReference.showSatelliteView_CheckMark;
            
            for( var i = 0; i < lines.length; ++i ){
                drawLineDoTheResize( lines[i] );
                if( showSatelliteView_CheckMark ){
                    lines[i].style.stroke = 'rgb(225,0,0)';
                } else {
                    lines[i].style.stroke = 'rgb(93, 141, 195)';
                }
            }
        };

    var drawLineDoTheResize = function( arg_line ){
        var xMultiplier = ( this.presentMaxX - this.presentMinX ) / this.resizedMapWidth,
            yMultiplier = ( this.presentMaxY - this.presentMinY ) / this.resizedMapHeight,
            index = 0,
            statePlanePointsArray = undefined,
            len = arg_line.statePlaneCoords.length,
            arr = undefined,
            x = undefined,
            y = undefined,
            points = [],
            presentMinX = this.presentMinX,
            presentMaxY = this.presentMaxY;

        while( index < len ){
            //arr = pointsData[index].split(',');
            x = (( arg_line.statePlaneCoords[index].x - presentMinX ) / xMultiplier ).toFixed(0);
            y = (( presentMaxY - ( arg_line.statePlaneCoords[index].y ) ) / yMultiplier).toFixed(0);
            if( index === 0){
                arg_line.startPoint.setAttribute('cx', x);
                arg_line.startPoint.setAttribute('cy', y);
            }
            if( index === (len - 1) && arg_line.endPoint ){
                arg_line.endPoint.setAttribute('cx', x);
                arg_line.endPoint.setAttribute('cy', y);
            }
            points.push( x +','+ y );
            ++index;
        }
        arg_line.currentPoints = points;
        arg_line.currentPointsString = points.join(' ');
        arg_line.setAttribute( 'points', arg_line.currentPointsString );
    }.bind( window.theMap );

    var drawLineSetup = function(){
        var lastPolyLine = undefined;

        if( drawLineOptionsCheckMark.checkedState() ){
            window.utilities_module.simpleMessageBox(
                                '<center style="border-bottom: 1px solid rgba(93, 141, 195, 0.5);">Draw a line</center>'
                                +((window.$('overlay_map'))?'<br><center>(Move overlay map out of the way)</center><br>':'')
                                +'<table><tbody><tr><td valign="top">1)</td><td>Click anywhere to start a line.</td></tr>'
                                +'<tr><td valign="top">2)</td><td>Click anywhere to make a new vertex.</td></tr>'
                                +'<tr><td valign="top">3)</td><td>Double click or click the starting point to finish the line.</td></tr>'
                                +'<tr><td valign="top">4)</td><td>Delete a line by double clicking on the start or end points when you are finished.</td></tr>'
                                +'</tbody></table></div>', 'draw_message');
            svgContainer.addEventListener('mousedown', svg_containerMouseDown );
            svgContainer.addEventListener('click', svgContainerDrawLineClickHandler );
            window.$('cities_group').displayStatus = window.$('cities_group').style.display;
            window.$('cities_group').style.display = 'none';
            document.body.style.cursor = 'crosshair';
        }else {
            if( drawingALine ){
                drawingALine = false;
                svgContainer.removeEventListener('mousemove', mouseMoveHandler);
                lastPolyLine = drawSvgLinesArray[ drawSvgLinesArray.length - 1 ];
                if( lastPolyLine.currentPoints.length === 1 ){
                    lastPolyLine.startPoint.parentNode.removeChild( lastPolyLine.startPoint );
                    lastPolyLine.parentNode.removeChild( lastPolyLine );
                } else {
                    lastPolyLine.endPoint = createEndPoint( { clientX: +lastPolyLine.currentPoints[lastPolyLine.currentPoints.length-1].split(',')[0], clientY: +lastPolyLine.currentPoints[lastPolyLine.currentPoints.length-1].split(',')[1] } );
                    lastPolyLine.setAttribute( 'points', lastPolyLine.currentPoints );
                    svgContainer.appendChild( lastPolyLine.endPoint );
                    lastPolyLine.endPoint.onclick = endPointOnClick.bind( lastPolyLine );
                }
            }
            svgContainer.removeEventListener('mousedown', svg_containerMouseDown );
            svgContainer.removeEventListener('click', svgContainerDrawLineClickHandler );
            window.$('cities_group').style.display = window.$('cities_group').displayStatus;
            document.body.style.cursor = '';
            try{
                window.$('draw_message').parentNode.removeChild( window.$('draw_message') );
            }catch(e){}
        }
    }

    function svg_containerMouseDown( e ){
            e.stopPropagation();
    }

    function deleteLineFromArray( arg_line ){
        var array = drawSvgLinesArray,
            len = array.length
            m = 0;

        arg_line.startPoint.parentNode.removeChild( arg_line.startPoint );
        if( arg_line.endPoint && arg_line.endPoint.parentNode ){
            arg_line.endPoint.parentNode.removeChild( arg_line.endPoint );            
        }
        arg_line.parentNode.removeChild( arg_line );        
        for( ; m < len; ++m ){
            if( arg_line === array[m] ){
                drawSvgLinesArray.splice( m, 1);
                break;
            }
        }
    }

    var drawLineInit = function(){
        drawLineOptionsLabel.addEventListener( 'click', drawLineSetup );
        window.theMap.addEventListener('load', drawLinesResizeLines );
    }

    return {
        drawLinesResizeLines: drawLinesResizeLines,
        drawLineInit: drawLineInit,
        createPolylinesFromUrl: createPolylinesFromUrl
    };
}()