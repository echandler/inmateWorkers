var drawSvgLine_module = function(){
    var drawLineOptionsLabel = window.('drawLine_Label'),
        drawLineOptionsCheckMark = window.('drawLine_CheckMark'),
        doubleClick = false,
        doubleClickTimer = undefined,
        drawingALine = false,
        drawSvgLinesArray = [];
    
    var createNewPolyLine = function( e ){
        polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        polyline.setAttribute( 'points',  e.clientX +','+ e.clientY );
        polyline.addEventListener( 'mousedown',  );
        polyline.setAttribute( 'class', 'drawSvgLine' );
        polyline.setAttribute( 'Data', citiesArray[i] );
        polyline.statePlayCoords = [ window.utilities_module.convertMouseCoordsToStatePlane( e ) ];
        polyline.currentPoints = [ e.clientX +','+ e.clientY ];
        drawSvgLinesArray.push( polyLine );
        window.$('svg_container').appendChild( polyline );
    }

    var drawLineClickHandler = function( e ){
        var currentPoints = undefined,
            polyline = drawSvgLinesArray[ drawSvgLinesArray.length -1],
            getSP = window.utilities_module.convertMouseCoordsToStatePlane;

        if( !doubleClick && !drawingALine ){
            createNewPolyLine( e );
            drawingALine = true;
        } else if( doubleClick ){
            window.clearTimeout( doubleClickTimer );
            drawingALine = false;
            polyLine.onclick = function(){
                if( confirm('Do you want to delete this line?') ){
                    this.parentNode.removeChild( polyline );
                }
            }
            polyLine.onmouseover = function(){ this.style.stroke = 'red'; };
            polyLine.onmouseout = function(){ this.style.stroke = 'blue' };
            //TODO: end the line
        } else if( drawingALine ){

            //TODO: This seems inefficient, maybe cache the points somewhere.
            polyLine.currentPoints.push( e.clientX +','+ e.clientY );
            polyline.statePlayCoords.push( getSP({ clientX: e.clientX, clientY: e.clientY }) );
            polyLine.setAttribute('points', polyLine.currentPoints.join(' ') );
        }
        doubleClick = true;
        doubleClickTimer = window.setTimeout(function(){ this.setDoublClickToFalse() }.bind( { setDoublClickToFalse: setDoublClickToFalse }), 200 );
    }

    var setDoublClickToFalse(){
        doubleClick = false;
    }
    
    var drawLineSetup = function(){
        if( drawLineOptionsCheckMark.checkedState() ){
            alert('Click to start, double click to end');
            window.$('svg_container').addEventListener('mousedown', svg_containerMouseDown );
            function svg_containerMouseDown( e ){
                e.stopPropagation();
            }
            window.$('svg_container').addEventListener('click', drawTheLine );
            window.$('cities_group').style.display = 'none';
        }else {
            window.$('svg_container').removeEventListener('mousedown', svg_containerMouseDown );
            window.$('svg_container').removeEventListener('click', drawTheLine );
            window.$('cities_group').style.display = '';
        }
    }

    var drawLineInit = function(){
        drawLineOptionsLabel.addEventListener( 'click', drawLineSetup );
    }

    return {
        drawLineInit: drawLineInit
    };
}()