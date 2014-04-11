var drawSvgLine_module = function(){
    var drawLineOptionsLabel = window.$('drawLine_Label'),
        drawLineOptionsCheckMark = window.$('drawLine_CheckMark'),
        doubleClick = false,
        doubleClickTimer = undefined,
        drawingALine = false,
        drawSvgLinesArray = [];
    
    var createNewPolyline = function( e ){
        var polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline'),
            startPoint = document.createElementNS("http://www.w3.org/2000/svg", 'circle');

        startPoint.setAttribute('cx', e.clientX );
        startPoint.setAttribute('cy', e.clientY);
        startPoint.setAttribute('r', '5px' );
        startPoint.style.fill = 'white';
        startPoint.style.stroke = 'white'
        startPoint.style.cursor = 'pointer';
        polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        polyline.setAttribute( 'points',  e.clientX +','+ e.clientY );
       // polyline.addEventListener( 'mousedown',  );
        polyline.setAttribute( 'class', 'drawSvgLine' );
        polyline.style.strokeWidth = '3px';
        if( window.theMap.optionsReference.showSatelliteView_CheckMark ){
            polyline.style.stroke = 'rgb(225,0,0)';
        } else {
            polyline.style.stroke = 'rgb(93, 141, 195)';
        }
        polyline.style.fill = 'transparent';
        polyline.startPoint = startPoint;
        polyline.endPoint = undefined;
        polyline.statePlaneCoords = [ window.utilities_module.convertMouseCoordsToStatePlane( e ) ];
        polyline.currentPoints = [ e.clientX +','+ e.clientY ];
        drawSvgLinesArray.push( polyline );
        startPoint.onclick =  function( e ){ if( !drawingALine ){ deleteLineFromArray( this ); } }.bind( polyline );
        window.$('svg_container').appendChild( polyline );
        window.$('svg_container').appendChild( startPoint );
    }

    var drawLineClickHandler = function( e ){
        var currentPoints = undefined,
            polyline = drawSvgLinesArray[ drawSvgLinesArray.length -1],
            getSP = window.utilities_module.convertMouseCoordsToStatePlane,
            endPoint =  document.createElementNS("http://www.w3.org/2000/svg", 'circle');

        if( !doubleClick && !drawingALine ){
            createNewPolyline( e );
            drawingALine = true;
        } else if( doubleClick ){
            window.clearTimeout( doubleClickTimer );
            drawingALine = false;
            //polyline.startPoint.onmouseover = function(){ this.style.stroke = 'rgb(225,0,0)'; };
            //polyline.startPoint.onmouseout = function(){ this.style.stroke = 'blue' };
            endPoint.setAttribute('cx', e.clientX );
            endPoint.setAttribute('cy', e.clientY);
            endPoint.setAttribute('r', '4px' );
            endPoint.style.fill = 'white';
            endPoint.style.stroke = 'white'
            endPoint.style.cursor = 'pointer';
            polyline.endPoint = endPoint;
            window.$('svg_container').appendChild( endPoint );
            polyline.endPoint.onclick = function( e ){ e.stopPropagation(); deleteLineFromArray( this ) }.bind( polyline );
            //polyline.endPoint.onmouseover = function(){ this.style.stroke = 'rgb(225,0,0)'; };
            //polyline.endPoint.onmouseout = function(){ this.style.stroke = 'blue' };
            //TODO: end the line
        } else if( drawingALine ){

            //TODO: This seems inefficient, maybe cache the points somewhere.
            polyline.currentPoints.push( e.clientX +','+ e.clientY );
            polyline.statePlaneCoords.push( getSP({ clientX: e.clientX, clientY: e.clientY }) );
            polyline.setAttribute('points', polyline.currentPoints.join(' ') );
        }
        doubleClick = true;
        doubleClickTimer = window.setTimeout(function(){ this.setDoublClickToFalse() }.bind( { setDoublClickToFalse: setDoublClickToFalse }), 200 );
    }

    var setDoublClickToFalse = function(){
        doubleClick = false;
    }

    var createPolyLinesFromUrl = function( arg_linesArray ){
        var polyLine = undefined, startPoint = undefined, endPoint = undefined,
            spCoords = undefined;

        for( var n = 0; n < arg_linesArray.length; ++n ){
            startPoint = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            startPoint.setAttribute('cx', 0 );
            startPoint.setAttribute('cy', 0 );
            startPoint.setAttribute('r', '5px' );
            startPoint.style.fill = 'white';
            startPoint.style.stroke = 'white'
            startPoint.style.cursor = 'pointer';
            endPoint = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            endPoint.setAttribute('cx', 0 );
            endPoint.setAttribute('cy', 0 );
            endPoint.setAttribute('r', '5px' );
            endPoint.style.fill = 'white';
            endPoint.style.stroke = 'white'
            endPoint.style.cursor = 'pointer';
            polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
            //polyline.setAttribute( 'points',  e.clientX +','+ e.clientY );
           // polyline.addEventListener( 'mousedown',  );
            polyline.setAttribute( 'class', 'drawSvgLine' );
            polyline.style.strokeWidth = '3px';
            polyline.style.stroke = 'rgb(93, 141, 195)';
            polyline.style.fill = 'transparent';
            polyline.startPoint = startPoint;
            polyline.endPoint = endPoint;
            polyline.statePlaneCoords = [];
            for( var t = 0; t < arg_linesArray[n].length; ++t ){
                spCoords = arg_linesArray[n][t].split(',');
                polyline.statePlaneCoords.push( { x: +spCoords[0], y: +spCoords[1]} );
            }
            //polyline.currentPoints = [ e.clientX +','+ e.clientY ];
            drawSvgLinesArray.push( polyline );
            startPoint.onclick =  function( e ){ deleteLineFromArray( this ) }.bind( polyline );
            endPoint.onclick =  function( e ){ deleteLineFromArray( this ) }.bind( polyline );
            window.$('svg_container').appendChild( polyline );
            window.$('svg_container').appendChild( startPoint );
            window.$('svg_container').appendChild( endPoint );
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
            if( index === (len - 1) ){
                arg_line.endPoint.setAttribute('cx', x);
                arg_line.endPoint.setAttribute('cy', y);
            }
            points.push( x +','+ y );
            ++index;
        }
        arg_line.setAttribute( 'points', points.join(' ') );
    }.bind( window.theMap );

    var drawLineSetup = function(){
        if( drawLineOptionsCheckMark.checkedState() ){
            alert('  Click anywhere to start a line,\ndouble click when finished to\nend the line.');
            window.$('svg_container').addEventListener('mousedown', svg_containerMouseDown );
            window.$('svg_container').addEventListener('click', drawLineClickHandler );
            window.$('cities_group').displayStatus = window.$('cities_group').style.display;
            window.$('cities_group').style.display = 'none';
            document.body.style.cursor = 'crosshair';
        }else {
            window.$('svg_container').removeEventListener('mousedown', svg_containerMouseDown );
            window.$('svg_container').removeEventListener('click', drawLineClickHandler );
            window.$('cities_group').style.display = window.$('cities_group').displayStatus;
            document.body.style.cursor = '';
        }
    }

    function svg_containerMouseDown( e ){
            e.stopPropagation();
    }

    function deleteLineFromArray( arg_line ){
        var array = drawSvgLinesArray,
            len = drawSvgLinesArray.len;

        if( confirm('Do you want to delete this line?') ){
            arg_line.startPoint.parentNode.removeChild( arg_line.startPoint );
            arg_line.endPoint.parentNode.removeChild( arg_line.endPoint );            
            arg_line.parentNode.removeChild( arg_line );                
            for( var m = 0; m < len; ++m ){
                if( arg_line === array[m] ){
                    drawSvgLinesArray[m].splice( m, 1);
                    break;
                }
            }
        }   
    }
    var waitForCheckAnimation = function( e ){
        setTimeout(function(e){ drawLineSetup(e)},500, e);
    }
    var drawLineInit = function(){
        drawLineOptionsLabel.addEventListener( 'click', waitForCheckAnimation );
        window.theMap.addEventListener('load', drawLinesResizeLines );
    }

    return {
        drawLinesResizeLines: drawLinesResizeLines,
        drawLineInit: drawLineInit,
        createPolyLinesFromUrl: createPolyLinesFromUrl
    };
}()