
var // TODO: Only parameters or default values should go in parameters.
    parameters = { 
        urlPrefix: 'http://forwarding-proxy.appspot.com/',//http://192.168.56.1:1000
        apnUrl: 'https://www.snoco.org/proptax/search.aspx?parcel_number=',
        searchByApnUrl: "gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.3.1&Form=True&Encode=False&CustomService=Query",
        mapUrl: "gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.4.1&Form=True&Encode=False?",    
        propertyInfoUrl: "gis.snoco.org/servlet/com.esri.esrimap.Esrimap?ServiceName=Assessor&ClientVersion=9.3.0&Form=True&Encode=False&CustomService=Query",
        propertyImgUrl : "http://www.snoco.org/docs/sas/photos/",
        optionsCheckMarkDefaults: { 
            showCities_CheckMark        : true, 
            showSatelliteView_CheckMark : true,
            show2007YearMap_CheckMark   : false,
            show2012YearMap_CheckMark   : true,
            showPropertyImage_CheckMark : false, 
            showParcelBoundary_CheckMark: true, 
            showParcelNumbers_CheckMark : false, 
            showAddresses_CheckMark     : true,
        },
        showTwoMapsAtTheSameTime: true,
        homesSoldYears: { years: [ [ '2014', 'rgba(255, 0, 0, 0.5)' ], [ '2013', 'rgba(255, 255, 0, 0.5)' ], [ '2012', 'rgba(173, 216, 230, 0.5)' ] ], },
        FULLZOOMMINX: 1244781.997,
        FULLZOOMMAXX: 1622342.497,
        FULLZOOMMINY: 284336.973,
        FULLZOOMMAXY: 477544.783,

        // To set the panning sensitivity default:
        // 1) Change panningAnimationMultiplier. (Default is 20)
        // 2) optional: Change the sliders CSS right property. (Default 0% right)
        // 3) Optional: Change window.panning_module.panningControlsliderMove, add panningAnimationMultiplier + 1 to the multiplier. (default is 21)
        panningAnimationMultiplier: 10, // default is 20.
        panningAnimationTrueFalse: true, 
        panningAnimationTime: 1000, // default is 1000.
        MAX_WIDTH: 1920, // default 1920.
        MAX_HEIGHT: 1080,// default 1080.
        MAX_IMG_PIXELS: 1920*1080, // default 1920*1080. It appears that this is the max amount of pixels for an image, anything larger generates a image too large error.
    }, 
    $ = document.getElementById.bind( document ),
    theMap = window.$( 'theMap_primary' ),
    mainAjaxHTTPRequest = new XMLHttpRequest(),
    timeToLoadArray = [], // Used to calculate panning duration.
    startSend = undefined, // Used to calculate panning duration.
    panningObj = {//TODO: Should this be a global?
        panningAnimationMultiplier: window.parameters.panningAnimationMultiplier,
        panningAnimationTime: window.parameters.panningAnimationTime,
    },
    xml = undefined,
    throttleResize = undefined,
    pageHasFocus = true, // TODO: this is a test.
    popStateCounter = 0,
    t = undefined;// This is used to make the multi family markers shorter, look in marker_module for assignment.

    var city = false; //TODO: this is a global for testing.