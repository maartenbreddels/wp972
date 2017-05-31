// TODO: eliminate global variables
var gridster;

var defaultSize;
var plotWidth;
var plotHeight;

var totalWidth = 0;
var totalHeight = 0;

var zoom = 0;
var aspectRatio = 0.0;

var baseX = 50;
var baseY = 50;

var linkedViewsActive = false;

function setDefaultSizes() {
    plotWidth= 30;

    while(window.innerWidth < (plotWidth - 1) * baseX - 70 + 2*60 + 14 && plotWidth >3) {
        plotWidth --;
    }

    plotHeight = Math.max(Math.round(plotWidth/3), 4);
    defaultSize = plotWidth;
}


function initGridster() {
    setDefaultSizes();

    //Add elements
    gridster = $(".gridster > ul").gridster({
        widget_margins: [0, 0],
        widget_base_dimensions: [baseX, baseY],
        autogrow_cols: true,
        extra_rows: defaultSize,
        resize: {
            enabled: true,
            min_size: [4, 4]
        },
        draggable: {
            handle: '.optsDiv'
        }
    }).data('gridster');


    //gridster resize callbacks
    gridster.options.resize.resize = function(event, ui, $widget) {
        updateGridster($widget[0].id);
    };

    gridster.on_stop_resize = function(event, ui, $widget) {
        var elements = document.getElementsByClassName('preview-holder resize-preview-holder');
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    };

    //widget remove callback
    $("#widgetList").on('click', '.remove', function() {
        var plot = plots[$(this).parent().parent()[0].id]
        gridster.remove_widget($(this).parent().parent());
        removePlot($(this).parent().parent()[0].id);

        if(plot.type = "Histogram") {
            clearHistogram(plot.plotId.replace("Plot", ""));
        }
    });

    $("#widgetList").on('click', '.resetView', function() {
        Plotlet.resetView($(this).parent().parent()[0].id);
    });

    $("#widgetList").on('click', '.searchPoints', function() {
        var optsDiv = d3.select("#opts_" + $(this).parent().parent()[0].id);
        $("#search_" + $(this).parent().parent()[0].id).remove();

        var insideDiv = optsDiv.append("div")
                    .attr("id", "search_" + $(this).parent().parent()[0].id)
                    .attr("class", "leaflet-popup custom leaflet-zoom-animated")
                    .attr("style", "margin-left: " + (parseInt($('#opts_' + $(this).parent().parent()[0].id).css("width"))-230)+ "px; margin-top:42px; z-index: 100");


        insideDiv.append("div")
                    .attr("class", "leaflet-popup-content-wrapper")
                 .append("div")
                    .attr("class", "dropdown textButtonsleftLabel")
                    .attr("style", "padding: 4%; width: 210px;")
                 .append("input")
                    .attr("placeholder", "Center on position/object")
                    .attr("id", "coodinates_" + $(this).parent().parent()[0].id)
                    .attr("type", "text")
                    .attr("class", "form-control textNumber");

        document.getElementById("coodinates_" + $(this).parent().parent()[0].id).focus();

        insideDiv.append("div")
                    .attr("class", "leaflet-popup-tip-container")
                    .attr("style", "transform: translate(21px, -66px) rotate(180deg)")
                 .append("div")
                    .attr("class", "leaflet-popup-tip");

        $("#coodinates_" + $(this).parent().parent()[0].id).keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
            }

            return e.which != 13;
        });

        $("#coodinates_" + $(this).parent().parent()[0].id).on('blur', function() {
            if (!$(this).is(":focus")) {
                if(this.value != ""){
                    var coordinates = this.value.trim().split(/[\s,]+/);
                    if(!isNaN(coordinates[0]) && !isNaN(coordinates[1]) && coordinates.length == 2){
                        var center = {lat: coordinates[1], lng: coordinates[0]};

                        if("wrapping" in plots[this.id.split("_")[1]].Parameters) {
                            wrappedCoordinates = fromWindowToDataWrapping(plots[this.id.split("_")[1]].Parameters["wrapping"], coordinates[0], coordinates[1]);
                            center.lat = wrappedCoordinates["y"];
                            center.lng = wrappedCoordinates["x"];
                        }


                        plots[this.id.split("_")[1]].leafletMainComponent.leafletComponent.map.panTo(center);
                    }
                    else{
                        var center = getCoordinatesByName(this.value, plots[this.id.split("_")[1]]);

                        if(center && center.lat != "" && center.lng !="") {
                            plots[this.id.split("_")[1]].leafletMainComponent.leafletComponent.map.panTo(center);
                        }
                    }
                }
                $("#search_" + this.id.split("_")[1]).remove();
            }
        });
    });

   /*$("#widgetList").on('click', '.printPlot', function() {

       //find all svg elements in $container
       //$container is the jQuery object of the div that you need to convert to image. This div may contain highcharts along with other child divs, etc
      /* var svgElements= $("#Plot0").find('svg');
       svgElements.splice(1, 1);

       //replace all svgs with a temp canvas
       svgElements.each(function () {
           console.log(this);
           var canvas, xml;

           canvas = document.createElement("canvas");
           canvas.className = "screenShotTempCanvas";
           //convert SVG into a XML string
           xml = (new XMLSerializer()).serializeToString(this);

           // Removing the name space as IE throws an error
           xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');

           //draw the SVG onto a canvas
           canvg(canvas, xml);
           $(canvas).insertAfter(this);
           //hide the SVG element
           this.className = "tempHide";
           $(this).hide();
       });

        var getCanvas;
         html2canvas($("#Plot0"), {
         onrendered: function (canvas) {
                var imgageData = canvas.toDataURL("image/png");
                // Now browser starts downloading it instead of just showing it
                var newData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
                window.location = newData;
             }
         });

       //After your image is generated revert the temporary changes
       $("#Plot0").find('.screenShotTempCanvas').remove();
       $("#Plot0").find('.tempHide').show().removeClass('tempHide');

    html2canvas($('#graph_Plot0'), {
        useCORS: true
      }).then(function (canvas) {
        if (navigator.msSaveBlob) {
          console.log('this is IE');
          var URL=window.URL;
          var BlobBuilder = window.MSBlobBuilder;
          navigator.saveBlob=navigator.msSaveBlob;
          var imgBlob = canvas.msToBlob();
          if (BlobBuilder && navigator.saveBlob) {
            var showSave =  function (data, name, mimetype) {
              var builder = new BlobBuilder();
              builder.append(data);
              var blob = builder.getBlob(mimetype||"application/octet-stream");
              if (!name)
                name = "Download.bin";
              navigator.saveBlob(blob, name);
            };
            showSave(imgBlob, 'barchart.png',"image/png");
          }
        } else {
          if ($('#export-image-container').length == 0)
              $('body').append('<a id="export-image-container" download="barchart.jpg">')
          img = canvas.toDataURL("image/jpeg")
          img = img.replace('data:image/jpeg;base64,', '')
          finalImageSrc = 'data:image/jpeg;base64,' + img

          $('#export-image-container').attr('href', finalImageSrc)
          $('#export-image-container')[0].click()
          $('#export-image-container').remove()
        }
      });


   });*/


}


function isHms(text){
    var coordinates = text.split(" ");
    if(coordinates.length == 2){
        coordinates = coordinates[0].split(":").concat(coordinates[1].split(":"));
    }

    if(coordinates.length == 6 || coordinates.length == 2){
        for(coord in coordinates){
            if(isNaN(coordinates[coord])){
                return false;
            }
        }
        return true;
    }
    else{
        return false;
    }
}

function ConvertDMSToDD(degrees, minutes, seconds, direction, coordinate) {
    var dd = parseInt(degrees) + parseInt(minutes)/60 + parseInt(seconds)/(60*60);
    if(coordinate == "lng"){
       dd = dd*15;
    }
    return dd;
}

function getCoordinatesByName(name, plot){
    if(plot.Parameters.coordSys === undefined) {
        return;
    }

    var selectionQuery= server + "/search" + extraPOSTValue;
    var center = {lat: null, lng: null};
    console.log(selectionQuery);

    $.ajax({
            type: "GET",
            url: selectionQuery,
            async: false,
    		data: {
    			"name": name
    		}
        })
        .done(function(data) {
        	var lat = data.jdedeg;
        	var lng = data.jradeg;

            if(plot.Parameters.coordSys == "galactic"){
                var lb = astrojs.coords.equatorial2galactic(lng, lat);
                lat = lb.b;
                lng = lb.l;
            }

            if("wrapping" in plot.Parameters) {
                wrappedCoordinates = fromWindowToDataWrapping(plot.Parameters["wrapping"], lng, lat);
                lat = wrappedCoordinates["y"];
                lng = wrappedCoordinates["x"];
            }

            center.lat = lat;
            center.lng = lng;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })

    return center;
}


function updateGridster(id) {
    if (plots[id].type == "Plot") {
        updatePlot(id);
    } else if (plots[id].type == "Histogram") {
        updateHistogram(id);
    } else if (plots[id].type == "Plugin") {
        updatePlugin(id);
    }
}


function updatePlot(id) {
    var viewParams =  plots[id].Parameters;

    var resizedHeight = (parseInt($('#' + id).css("height"))) -
            viewParams.xAxisHeight + 2 -
            viewParams.margin -
            (parseInt($('#opts_' + id).css("height")) +
            parseInt($('#top_' + id).css("height"))) -
            (parseInt($('#xAxisT_' + id).css("height")));

    var resizedWidth = (parseInt($('#' + id).css("width"))) -
            viewParams.yAxisWidth -
            viewParams.margin -
            (parseInt($('#yAxisR_' + id).css("width")));


    //resize graph
    $('#plot_' + id).css("height", resizedHeight + "px");
    $('#plot_' + id).css("width", resizedWidth + "px");
    plots[id].leafletMainComponent.leafletComponent.map.invalidateSize();

    //resize axis
    plots[id].Parameters.height = resizedHeight;
    plots[id].Parameters.width = resizedWidth;
    Plotlet.updateAxis(
            id, plots[id].leafletMainComponent.leafletComponent, viewParams.width, viewParams.height,
            viewParams.totalWidth, viewParams.xAxisHeight, viewParams.yAxisWidth, viewParams.ticksInsideMargin,
            viewParams.plotNameLabel, viewParams.xAxisLabel, viewParams.yAxisLabel);

    //resize title
    $('#top_' + id).css("width", (parseInt($('#' + id).css("width")) - viewParams.margin*2) + "px");
    $('#xAxis_' + id).css("width", (parseInt($('#' + id).css("width")) - viewParams.margin*2) + "px");
    $('#xAxisT_' + id).css("width", (parseInt($('#' + id).css("width")) - viewParams.margin*2) + "px");
    $('#search_' + id).css("margin-left", (parseInt($('#' + id).css("width")) - 230) + "px");


    plots[id].Parameters.totalWidth = (parseInt($('#' + id).css("width")) - viewParams.margin*2 + 2);

    if(plots[id].Parameters.autoZoom) {
        var newZoom;

        if(plots[id].Parameters.width > plots[id].Parameters.height) {
             newZoom = Math.round(Math.log2(plots[id].Parameters.width/256));
        } else {
             newZoom = Math.round(Math.log2(plots[id].Parameters.height/256));
        }

        if(plots[id].Parameters.initialZoom != newZoom) {
            plots[id].leafletMainComponent.leafletComponent.map.setZoom(newZoom);
            plots[id].Parameters.initialZoom = newZoom;
        }
    }
}


function updateHistogram(id) {
    var resizedHeight = parseInt($('#' + id).css("height"))
    var resizedWidth = parseInt($('#' + id).css("width"))

    $('#plot_' + id).css("height", (parseInt($('#' + id).css("height"))-55-2) + "px");
    $('#plot_' + id).css("width", (parseInt($('#' + id).css("width"))-4) + "px");
    $('#top_' + id).css("width", (parseInt($('#' + id).css("width"))-4) + "px");

    plots[id].parameters.plotHeight = resizedHeight - 30 - 25;
    plots[id].parameters.plotWidth = resizedWidth - 17;

    clearHistogram(id.split("Plot")[1]);

    createHistogram(plots[id].data, id.split("Plot")[1], resizedWidth - 17, resizedHeight - 30 - 25,
            plots[id].plot_info, plots[id].parameters, plots[id].lastTransformation);
    serverLinkedViewPointSelectionHistogram(plots[id]);
}


function updatePlugin(id) {
    if(plots[id].plugin == "Aladin") {
        updateAladin(id);
    } else{
        updateJS9(id);
    }
}

function updateAladin(id) {
    var resizedHeight = parseInt($('#' + id).css("height"))- 30;
    var resizedWidth = parseInt($('#' + id).css("width"));

    $("#aladin-lite-div_" + id).css("height", resizedHeight + "px");
    $("#aladin-lite-div_" + id).css("width", resizedWidth + "px");

    plots[id].aladin.view.fixLayoutDimensions();
}


function updateJS9(id) {
    var resizedHeight = parseInt($('#' + id).css("height")) - 60;
    var resizedWidth = parseInt($('#' + id).css("width"));

    $("#divJS9_" + id).css("height", (resizedHeight + 6) + "px");
    $("#divJS9_" + id).css("width", (resizedWidth + 6) + "px");


    //JS9.ResizeDisplay(resizedWidth, resizedHeight, {display: "divJS9_" + id});

}


// TODO: eliminate rubber-stapm parameters (viewParams)
// TODO: justify viewParams being altered within this function
function createWidget(id, viewParams, type) {
    if(type == "Plot") {
        viewParams["plotWidth"] = (plotWidth - 1) * baseX - 70;
        viewParams["plotHeight"] = (plotHeight - 1) * baseY - 90 ;

        //calculate aspect ratio
        if(aspectRatio != 0.0) {
            viewParams["aspectRatio"]  = viewParams["defaultRatio"] * aspectRatio;
        }

//        //calculate zoom
//        if(viewParams["aspectRatio"] == 1.0) {
//            var zx = Math.log2(viewParams["plotWidth"] / 256);
//            var zy = Math.log2(viewParams["plotHeight"] / 256);
//            var minZ = Math.min(zx, zy);
//
//            if(minZ < 0) {
//                minZ = 0
//            }
//
//            viewParams["initialZoom"] = Math.round(minZ);
//        } else if(viewParams["aspectRatio"] > 1) {
//            var zx = Math.log2(viewParams["plotWidth"] / 256);
//            var zy = Math.log2((viewParams["plotHeight"] * viewParams["aspectRatio"])/ (256 ));
//            var minZ = Math.min(zx, zy);
//
//            if(minZ < 0) {
//                minZ = 0
//            }
//
//            viewParams["initialZoom"] = Math.round(minZ);
//        } else if (viewParams["aspectRatio"] < 1 & viewParams["aspectRatio"]  > 0) {
//            var zx = Math.log2((viewParams["plotWidth"] * viewParams["aspectRatio"]) / 256);
//            var zy = Math.log2(viewParams["plotHeight"] / 256);
//            var minZ = Math.min(zx, zy);
//
//            if(minZ < 0) {
//                minZ = 0
//            }
//
//            viewParams["initialZoom"] = Math.round(minZ);
//        }
    } else if(type == "Histogram") {
        viewParams["plotWidth"] = plotWidth * baseX;
        viewParams["plotHeight"] = plotHeight * baseY - 55;
    } else if(type == "Plugin") {
        viewParams["plotWidth"] = plotWidth * baseX;
        viewParams["plotHeight"] = plotHeight * baseY - 30;
    }

    gridster.add_widget('<li id="Plot' + lastPlot + '"></li>', plotWidth, plotHeight);
}


function changePlot(type, newPlot, sizeTemplate) {
    $("#plotCreationOptions").hide();

    for(var j = 1; j < $("input[name=size]").length + 1; j++) {
        $("#check" + j).closest(".btn").removeClass('active');
    }

    $("input[name=size][value=" + sizeTemplate + "]").closest(".btn").addClass('active');
    changePlotSize(sizeTemplate)
    $(".plotSelected").attr("id", newPlot);
    $(".plotSelected").text(getPlotName(newPlot) + " (" + type + ")");
}


function changePlotSize(size) {
    if(size == "Normal") {
        changePlotWidth("Normal")
        changePlotHeight("Normal")
        changeZoom(2);
        changeAspectRatio(1.0);
    } else if(size == "Large") {
        changePlotWidth("Large")
        changePlotHeight("Large")
        changeZoom(1);
        changeAspectRatio(1.0);
    } else if(size == "X-Large") {
        changePlotWidth("X-Large")
        changePlotHeight("X-Large")
        changeZoom(0);
        changeAspectRatio(1.0)
    } else if(size == "Panoramic") {
        changePlotWidth("XX-Large")
        changePlotHeight("Large")
        changeZoom(0);
        changeAspectRatio(2.0)
    } else if(size == "Tall") {
        changePlotWidth("Normal")
        changePlotHeight("Large")
        changeZoom(1);
        changeAspectRatio(0.5)
    } else if(size == "Wide") {
        changePlotWidth("Large")
        changePlotHeight("Normal")
        changeZoom(1);
        changeAspectRatio(2.0)
    }
}


function changePlotWidth(value) {
    plotWidth = getSizeValue(value);
}


function changePlotHeight(value) {
    plotHeight = getSizeValue(value);
}


function changeZoom(value) {
    zoom = value;
}


function changeAspectRatio(value) {
    aspectRatio = value;
}


function getSizeValue(sizeName) {
    // TODO: document "magic numbers"
    var normal = 8;
    var large = 15;
    var xLarge = 24;
    var xxLarge = defaultSize;

    var def_small = Math.round((normal*defaultSize)/xxLarge);
    var def_medium = Math.round((large*defaultSize)/xxLarge);
    var def_large = Math.round((xLarge*defaultSize)/xxLarge);
    var def_xxlarge = defaultSize;

    if (sizeName == "Normal") {
        return def_small;
    } else if (sizeName == "Large") {
        return def_medium;
    } else if (sizeName == "XX-Large") {
        return xxLarge;
    } else {
        return def_large;
    }
}


function setRemoveButton(divId) {
    var optsDiv = d3.select("#opts_" + divId);

    optsDiv.append("a")
                .attr("href", "#")
                .attr("class", "remove")
                .attr("data-toggle", "tooltip")
                .attr("title", "Close")
            .append("Button")
                .attr("type", "button")
                .attr("class", "btn btn-default btn-sm pull-right removeButton")
            .append("Span")
                .attr("Class", "glyphicon glyphicon-remove")
                .attr("aria-hidden", "true");

    optsDiv.append("a")
            .attr("class", "resetView")
            .attr("data-toggle", "tooltip")
            .attr("title", "Reset view")
        .append("Button")
            .attr("type", "button")
            .attr("class", "btn btn-default btn-sm pull-right")
        .append("Span")
            .attr("Class", "glyphicon glyphicon-move")
            .attr("aria-hidden", "true");


    optsDiv.append("a")
             .attr("class", "searchPoints")
             .attr("data-toggle", "tooltip")
             .attr("title", "Search")
         .append("Button")
             .attr("type", "button")
             .attr("class", "btn btn-default btn-sm pull-right")
         .append("Span")
            .attr("Class", "glyphicon glyphicon-search")
            .attr("aria-hidden", "true");

//     optsDiv.append("a")
//              .attr("class", "printPlot")
//              .attr("data-toggle", "tooltip")
//              .attr("title", "Print")
//          .append("Button")
//              .attr("type", "button")
//              .attr("class", "btn btn-default btn-sm pull-right")
//          .append("Span")
//             .attr("Class", "glyphicon glyphicon-download-alt")
//             .attr("aria-hidden", "true");
}


function removePlot(id) {
    delete plots[id];
    removeQueryPlotFromDropdown(id);
}


//Linked Views
function toggleLinkedViewsPointSelection() {
    if (linkedViewsActive) {
        activateLinkedViewPointSelection();
    } else {
        deactivateLinkedViewPointSelection();
    }
}


function activateLinkedViewPointSelection() {
    if (linkedViewsActive) {
        return;
    }

    linkedViewsActive = true;

    for (var plot in plots) {
        var p = plots[plot];
        Plotlet.createPointSelection(p);
    }
}


function deactivateLinkedViewPointSelection() {
    if (!linkedViewsActive) {
        return;
    }

    linkedViewsActive = false;

    for (var plot in plots) {
        var p = plots[plot];
        Plotlet.clearPointSelection(p);
    }
}