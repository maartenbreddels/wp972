// TODO: eliminate global variables
var selectedPlot;

function refreshModalWithCurrentPlot(divId) {
    selectedPlot = plots[divId.id];

    $('#sizeOptionsText').text(selectedPlot.dataSource["Layer0"].attributes.size);
    $('#glyphLegendText').text(positionText(selectedPlot.Parameters.legendPosition));
    $("#aspectText").text(selectedPlot.Parameters.aspect);
    $(".colorBackground").spectrum("set", selectedPlot.Parameters.backgroundColor)

    $('#myModalLabel').text(selectedPlot.Parameters.plotNameLabel);
    $('#myModalLabel').attr("class", divId.id);

    $('#xLegend').text(selectedPlot.Parameters.xAxisLabel);
    $('#xLegend').attr("class", divId.id);
    $('#yLegend').text(selectedPlot.Parameters.yAxisLabel);
    $('#yLegend').attr("class", divId.id);

    $('#autoZoom').prop('checked', selectedPlot.Parameters.autoZoom);

    setRegions();
    setLayers(selectedPlot.Parameters.plotNameLabel, divId.id);

    $('#myModal').modal('toggle');

    var marginSize = 30;
    var xSpace = (window.innerWidth - $("#dragSpot").width())/2;
    var ySpace = (window.innerHeight - $("#dragSpot").height())-marginSize;

    $("#myModal").draggable({
        handle: "#dragSpot",
        containment: [-(xSpace + marginSize), - marginSize, (xSpace - marginSize), ySpace],
        start: function( event, ui ) {
            $(".colorPoints").spectrum("hide");
            $(".colorBackground").spectrum("hide");
        }
    });

    //   $(".colorBackground").spectrum("reflow");

    $('#tableOption').text(selectedPlot.Parameters.plotNameLabel);
    $('#xOption').text(selectedPlot.Parameters.xAxisLabel);
    $('#yOption').text(selectedPlot.Parameters.yAxisLabel);

    $('#tableOptionText').text(selectedPlot.Parameters.plotNameLabel);
    $('#xOptionText').text(selectedPlot.Parameters.xAxisLabel);
    $('#yOptionText').text(selectedPlot.Parameters.yAxisLabel);


    $('#xFlipPlot').prop("checked", selectedPlot.Parameters.xFlip);
    $('#yFlipPlot').prop("checked", selectedPlot.Parameters.yFlip);
    $('#checkLayers').prop("checked", selectedPlot.dataSource["Layer" +0].check);

    $('#legendOpacity').prop("checked", selectedPlot.Parameters.legendOpacity);

    $("#myModalLabel").keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
        return e.which != 13;
    });

    $("#xLegend").keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
        return e.which != 13;
    });

    $("#yLegend").keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
        return e.which != 13;
    });
}


function setLayers(name, id) {
    $("#layersDiv").empty();
    var regionsDiv = d3.select("#layersDiv");

    for(layer in selectedPlot.dataSource) {
        var checkDiv = regionsDiv
                .append("div")
                .attr("class","checkbox checkBoxLayer")
                .attr("id","layerDiv_" + layer)
                .append("h6");

        var labelDiv = checkDiv
                .append("label")
                .attr("class","labelLayer");

        labelDiv.append("input")
                .attr("id", "checkLayers")
                .attr("class", "inputAlign")
                .attr("type","checkbox")
                .attr("checked", selectedPlot.dataSource[layer].check)
                .attr("onclick", 'changeLayer("'+layer+'", this.checked)');

        checkDiv.append("input")
                .attr("type","text")
                .attr("id","DivLayers_" + layer)
                .attr("class","DivLayers DivLayersPrincipal")
                .attr("value", selectedPlot.dataSource[layer].name);

        $("#DivLayers_" + layer).keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
            }

            return e.which != 13;
        });

        $("#DivLayers_" + layer).on('blur', function() {
            if (!$(this).is(":focus")) {
                var text = this.value.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
                plots[id].dataSource[this.id.split("_")[1]].name = text;
                plots[id].leafletMainComponent.leafletComponent.legend.addTo(
                        plots[id].leafletMainComponent.leafletComponent.map);
            }
        });


        var editButton = checkDiv
                .append("div")
                .attr("class", "btn btn-xs btnLayer")
                .attr("onclick", 'editLayer("'+ layer +'")');

        var editTool = editButton
                .append("span")
                .attr("id", "editLayer_" + layer)
                .attr("class", "glyphicon glyphicon-edit glyphLayer");

        var downloadButton = checkDiv
                .append("div")
                .attr("class", "btn btn-xs btnLayer")
                .attr("onclick", 'downloadLayer("'+ layer +'")');

        var downloadTool = downloadButton
                .append("span")
                .attr("id", "downloadLayer_" + layer)
                .attr("class", "glyphicon glyphicon-download-alt");

        if(typeof selectedPlot.download == 'undefined' || !selectedPlot.download) {
            downloadButton.attr("style", "visibility:hidden");
        }

        var deleteButton = checkDiv
                .append("div")
                .attr("class", "btn btn-xs btnLayer deleteIcon")
                .attr("onclick", 'removeLayer("'+ layer +'")');

        var deteleTool = deleteButton
                .append("span")
                .attr("class", "glyphicon glyphicon-trash");


    }

    if(selectedPlot.selectedLayer == null) {
        editLayer("Layer0");
    } else {
        editLayer(selectedPlot.selectedLayer);
    }
}


function positionText(position) {
    if(position == "none") {
        return "None";
    } else if(position == "topleft") {
        return "Top Left";
    } else if(position == "bottomleft") {
        return "Bottom Left";
    } else if(position == "topright") {
        return "Top Right";
    } else if(position == "bottomright") {
        return "Bottom Right";
    }
}


function changeLayerSelection(idLayer) {
    selectedPlot.selectedLayer = idLayer;
}


function setRegions() {
    $("#regionsDiv").empty();

    for (var plot in selectedPlot.selectionRegion) {

        if(selectedPlot.selectionRegion[plot].name == undefined) {
            selectedPlot.selectionRegion[plot].name = "Region " + plot;
        }

        var regionsDiv = d3.select("#regionsDiv");

        var checkDiv = regionsDiv
                .append("div")
                .attr("class","checkbox")
                .attr("id","regionDiv_" + plot)
                .append("h6");

        var labelDiv = checkDiv
                .append("label")
                .attr("class","labelRegions");


        labelDiv.append("input")
                .attr("id", "checkRegion_" + plot)
                .attr("class", "checkRegion")
                .attr("type","checkbox")
                .attr("onclick", 'changeRegion('+plot+', this.checked)')

        $("#checkRegion_" + plot).prop("checked", selectedPlot.selectionRegion[plot].show);

        checkDiv.append("input")
                .attr("id", "regionName_" + plot)
                .attr("class", "DivRegions")
                .attr("value", selectedPlot.selectionRegion[plot].name);


        $("#regionName_" + plot).keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
            }

            return e.which != 13;
        });

        $("#regionName_" + plot).on('blur', function() {
            if (!$(this).is(":focus")) {
                var text = this.value.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
                plots[selectedPlot.plotId].selectionRegion[plot].name = text;
            }
        });

        var colorRegionDiv = checkDiv
                .append("div")
                .attr("class", "input-group colorpicker-element colorRegion");

        var colorRegionSpan = colorRegionDiv
                .append("input")
                .attr("class", "input-group-addon spanRegion")
                .attr("id", "color_" + plot)
                .attr("type", "text")


        $("#color_"+ plot).spectrum({
                color: selectedPlot.selectionRegion[plot].region[0].options.color,
                showButtons: false
        }).on("dragstop.spectrum", function(e, color) {
            changeRegionColor(color.toHexString(), this.id.split("_")[1]);
        });


        var deleteButton = checkDiv.append("div")
                .attr("class", "btn btn-xs deleteIconRegions btnLayer")
                .attr("onclick", 'removeRegion('+plot+')');

        var deteleTool = deleteButton
                .append("span")
                .attr("class", "glyphicon glyphicon-trash");

    }
}

function changePlotPointSize(size) {
    changePlotOptions(
            selectedPlot.selectedLayer,selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.color, size,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.shape);
}


function changePlotShapeType(shape) {
    changePlotOptions(
            selectedPlot.selectedLayer,selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.color,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.size, shape);
    $('#glyphOptionText').attr("class", shape + " glyphChoose");
}


function changePlotColor(color) {
    changePlotOptions(
            selectedPlot.selectedLayer, color, selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.size,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.shape);
}


function changePlotBackgroundColor(color) {

   var alpha = parseInt(color.substring(0, 2), 16) / 255;
   var rgb = color.substring(2);
   var colorBackground = "rgba("+hexToRgb(rgb)+", " + alpha + ")";

   $("#plot_" + selectedPlot.plotId).css("background-color", colorBackground);
   plots[selectedPlot.plotId].Parameters.backgroundColor = color;
}


function changePlotYAxis(check) {
    savePlotOptions(
            selectedPlot, selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.color,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.size,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.shape, check.checked,
            selectedPlot.Parameters.xFlip, selectedPlot.Parameters.aspectRatio);
}


function changePlotXAxis(check) {
    savePlotOptions(
            selectedPlot, selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.color,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.size,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.shape,selectedPlot.Parameters.yFlip,
            check.checked, selectedPlot.Parameters.aspectRatio);
}


function changeAspect(value) {
    var aspect;
    $('#aspectText').text(value);

    if(value == "Square") {
        aspect = 1.0;
    } else if(value == "Wide") {
        aspect = 2.0;
    } else if(value == "Tall") {
        aspect = 0.5;
    } /*else if(value == "Panoramic") {
        aspect = 3.0;
    }*/

    plots[selectedPlot.plotId].Parameters.aspect = value;
    savePlotOptions(
            selectedPlot, selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.color,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.size,
            selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.shape, selectedPlot.Parameters.yFlip,
            selectedPlot.Parameters.xFlip, aspect * selectedPlot.Parameters.defaultRatio);
}


function changeRegion(region, option) {
    selectedPlot.selectionRegion[region].show = option;
    Plotlet.changeRegionDisplay(selectedPlot.selectionRegion[region]);
}


function changeLayer(layer, option) {
    selectedPlot.dataSource[layer].check = option;
    selectedPlot.leafletMainComponent.leafletComponent.legend.addTo(
                selectedPlot.leafletMainComponent.leafletComponent.map);

    Plotlet.changeLayerDisplay(
            selectedPlot.leafletMainComponent.leafletComponent.tileLayer[layer],
            selectedPlot.leafletMainComponent.leafletComponent.map, option);
}


function changeLegendOPacity(check) {
    if(check.checked) {
        $(".legend_" + selectedPlot.plotId).css("background", "white");
    } else {
        $(".legend_" + selectedPlot.plotId).css("background", "none");
    }

    plots[selectedPlot.plotId].Parameters.legendOpacity = check.checked;
}

function changeLegendPosition(position) {
    plots[selectedPlot.plotId].Parameters.legendPosition = position;
    $('#glyphLegendText').text(positionText(position));
    selectedPlot.leafletMainComponent.leafletComponent.legend.addTo(
            selectedPlot.leafletMainComponent.leafletComponent.map);
    if(plots[selectedPlot.plotId].Parameters.legendOpacity) {
        $(".legend_" + selectedPlot.plotId).css("background", "white");
    } else {
        $(".legend_" + selectedPlot.plotId).css("background", "none");
    }
}


function removeLayer(layerId) {
    if(layerId != "Layer0") {
        Plotlet.changeLayerDisplay(
                selectedPlot.leafletMainComponent.leafletComponent.tileLayer[layerId],
                selectedPlot.leafletMainComponent.leafletComponent.map, false);

        Plotlet.deleteSelection(plots[selectedPlot.plotId].dataSource[layerId].visualizationId);
        delete plots[selectedPlot.plotId].leafletMainComponent.leafletComponent.tileLayer[layerId];
        delete plots[selectedPlot.plotId].dataSource[layerId];
        selectedPlot.leafletMainComponent.leafletComponent.legend.addTo(
                    selectedPlot.leafletMainComponent.leafletComponent.map);
        $("#layerDiv_" + layerId).empty();

        if(layerId == selectedPlot.selectedLayer) {
            editLayer("Layer0");
        }
    }
}


function editLayer(layerId) {
    changeLayerSelection(layerId);
    $(".glyphLayer").attr("style", "opacity: 0.25");
    $("#editLayer_" + layerId).attr("style", "opacity: 1");

    var alpha = parseInt(selectedPlot.dataSource[layerId].attributes.color.substring(0, 2), 16) / 255;
    var rgb = selectedPlot.dataSource[layerId].attributes.color.substring(2);

    var color = "rgba("+hexToRgb(rgb)+", " + alpha + ")";

    $('#sizeOptionsText').text(selectedPlot.dataSource[layerId].attributes.size);
    $('#glyphOptionText')
            .attr("class", selectedPlot.dataSource[layerId].attributes.shape + " glyphChoose");


    $(".colorPoints").spectrum("set", color)
    $('.glyphChoose').attr("style", "background:" + color);


}


function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}


function downloadLayer(layerId) {
    Plotlet.downloadCSV(plots[selectedPlot.plotId].dataSource[layerId].visualizationId);
}


function uploadLayer(inputFIle) {
    console.log(inputFIle);
}


function removeRegion(region) {
    Plotlet.removeRegion(selectedPlot.selectionRegion, region);
    $("#regionDiv_" + region).empty();
}


function changeRegionColor(color, region) {
    Plotlet.changeColorRegion(selectedPlot.selectionRegion, region, color);
}


function savePlotOptions(plot, color, size, shape, Ycheck, Xcheck, aspectRatio) {
    selectedPlot.Parameters.yFlip = Ycheck;
    selectedPlot.Parameters.xFlip = Xcheck;
    selectedPlot.Parameters.aspectRatio = aspectRatio;

    for(ds in plot.dataSource) {
        changePlotOptions(ds, color, size, shape);
    }

    selectedPlot.leafletMainComponent.leafletComponent.legend.addTo(
            selectedPlot.leafletMainComponent.leafletComponent.map);
}


function changePlotOptions(layerId, color, size, shape) {
    selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.color = color;
    selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.size = size;
    selectedPlot.dataSource[selectedPlot.selectedLayer].attributes.shape = shape;

    $('#sizeOptionsText').text(size);

    var alpha = parseInt(color.substring(0, 2), 16) / 255;
    var rgb = color.substring(2);
    var color = "rgba("+hexToRgb(rgb)+", " + alpha + ")";

    $('.glyphChoose').attr("style", "background:" + color);


    var newTilePattern = Plotlet.createTilePattern(
            server, selectedPlot.dataSource[layerId].visualizationId, selectedPlot.Parameters.aspectRatio /** selectedPlot.Parameters.defaultRatio*/,
            (selectedPlot.Parameters.xFlip ? "1" : "0"), (selectedPlot.Parameters.yFlip ? "1" : "0"),
            selectedPlot.dataSource[layerId].attributes.color, selectedPlot.dataSource[layerId].attributes.size,
            selectedPlot.dataSource[layerId].attributes.shape);

    var leafletComponent = selectedPlot.leafletMainComponent.leafletComponent;

    Plotlet.updateTileLayer(
            selectedPlot.plotId, leafletComponent, newTilePattern, selectedPlot.viewDims, server,
            [selectedPlot.dataSource["Layer0"].visualizationId], layerId, selectedPlot.Parameters.aspectRatio * selectedPlot.Parameters.defaultRatio,
            selectedPlot.Parameters.xFlip, selectedPlot.Parameters.yFlip, selectedPlot.Parameters.width,
            selectedPlot.Parameters.height, selectedPlot.Parameters.totalWidth, selectedPlot.Parameters.xAxisHeight,
            selectedPlot.Parameters.yAxisWidth, selectedPlot.Parameters.ticksInsideMargin,
            selectedPlot.Parameters.plotNameLabel);

    selectedPlot.leafletMainComponent.leafletComponent.legend.addTo(
            selectedPlot.leafletMainComponent.leafletComponent.map);
}


function initPlotOptions() {

    $(".colorPoints").spectrum({
            showAlpha: true,
            showButtons: false
    }).on("dragstop.spectrum", function(e, color) {
        changePlotColor(setAlphaColor(color.toHex(), color.getAlpha()));
    });


    $(".colorBackground").spectrum({
            showAlpha: true,
            showButtons: false
     }).on("dragstop.spectrum", function(e, color) {
        changePlotBackgroundColor(setAlphaColor(color.toHex(), color.getAlpha()));
    });


    $("#myModalLabel").on('blur', function() {
        if (!$(this).is(":focus")) {
           var text = this.innerHTML.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
           plots[this.className].Parameters.plotNameLabel = text;
           $("#title_" + this.className).html(text);
           $("#tableOption").html(text);
        }
    });

    $("#xLegend").on('blur', function() {
        if (!$(this).is(":focus")) {
            var text = this.innerHTML.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
            plots[this.className].Parameters.xAxisLabel = text;
            $("#xOption").html(text);
            d3.select("#xLabel_" + this.className).text(text);
        }
    });

    $("#yLegend").on('blur', function() {
        if (!$(this).is(":focus")) {
            var text = this.innerHTML.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
            plots[this.className].Parameters.yAxisLabel = text;
            //$("#yOptionText").html(text);
            $("#yOption").html(text);
            d3.select("#yLabel_" + this.className).text(text);
        }
    });

    $('#myModalLabel').on('paste',function(e) {
        cleanCopiedText(e, this);
    });

    $('#xLegend').on('paste',function(e) {
        cleanCopiedText(e, this);
    });

    $('#yLegend').on('paste',function(e) {
        cleanCopiedText(e, this);
    });
}


function setAlphaColor(color, a){
    var hexA = "" + Math.floor(a * 255).toString(16);
    if(hexA.length == 1){
        hexA = "0" + hexA;
    }
    return hexA + color;
}


function cleanCopiedText(e, element) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/html') || prompt('Paste something..');
    var $result = $('<div></div>').append($(text));
    $(element).html($result.html());

    $.each($(element).find("*"), function(idx, val) {
        var $item = $(val);

        if ($item.length > 0) {
            var saveStyle = {
                'font-weight': $item.css('font-weight'),
                'font-style': $item.css('font-style')
            };

            $item.removeAttr('style').removeClass().css(saveStyle);

            $item.replaceWith(function() {
                return $(this).html();
            });
        }
    });

    $(this).children('style').remove();
    $(this).children('meta').remove();
    $(this).children('link').remove();
}

function validateNumberField(event){
    var theEvent = event || window.event;
    var key = String.fromCharCode(theEvent.keyCode || theEvent.which);
    var regex = /[0-9]|[\-\+\.]/;

    if( !regex.test(key) ) {
        theEvent.returnValue = false;

        if(theEvent.preventDefault) {
            theEvent.preventDefault();
        }
    }
}