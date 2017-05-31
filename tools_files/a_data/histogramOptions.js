// TODO: eliminate global variables
var handler = false;

function refreshModalWithCurrentHistogram(id) {
    var divId = "Plot" + id;
    selectedPlot = plots[divId];

    $('.textNumber').attr("id", "textNumber_" + divId);

    if(plots[divId].parameters.nbins !=null)
        $('#textNumber_' + divId).val(plots[divId].parameters.nbins);
    else
        $('#textNumber_' + divId).val(plots[divId].parameters.binsize);

    $('#glyphLegendTextHistogram').text(positionText(plots[divId].parameters.legendPosition));
    $('#myModalLabelHistogram').text(plots[divId].parameters.plotName);

    $('#tableOptionHistogram').text(plots[divId].parameters.plotName);
    $('#xOptionHistogram').text(plots[divId].plot_info.series_name);

    $('#tableOptionTextHistogram').text(plots[divId].parameters.plotName);
    $('#xOptionTextHistogram').text(plots[divId].plot_info.series_name);

    $('#xLegendHistogram').text(plots[divId].plot_info.series_name);
    $('#yLegendHistogram').text(plots[divId].parameters.yLabel);

    $('.xMin').attr("id", "xMin_" + divId);
    if(plots[divId].parameters.min != null){
        $('#xMin_' + divId).val(plots[divId].parameters.min);
    }
    else{
        $('#xMin_' + divId).val("");
    }

    $('.xMax').attr("id", "xMax_" + divId);
    if(plots[divId].parameters.max != null){
        $('#xMax_' + divId).val(plots[divId].parameters.max);
    }
    else{
        $('#xMax_' + divId).val("");
    }


    if(plots[divId].parameters.normalization == "total_count") {
        $('#normalizeOption').text("Total Count");
    } else {
        $('#normalizeOption').text("Normalize");
    }

    if(plots[divId].parameters.cumulative == 0) {
        $('#cumulative').prop("checked", false);
    } else {
        $('#cumulative').prop("checked", true);
    }

    $('#xFlip').prop("checked", plots[divId].parameters.xFlip)
    $('#yFlip').prop("checked", plots[divId].parameters.yFlip)

    $('#legendShowHistogram').prop("checked", plots[divId].parameters.legendShow)
    $('#legendOpacityHistogram').prop("checked", plots[divId].parameters.legendOpacity)

    $('#lineType').text(plots[divId].parameters.lineType);
    $('#lineSize').text(plots[divId].parameters.lineSize);

    $('#myModalLabelHistogram').attr("class", divId);
    $('#xLegendHistogram').attr("class", divId);
    $('#yLegendHistogram').attr("class", divId);

    $('#myModalHistogram').modal('toggle');

    var marginSize = 30;
    var xSpace = (window.innerWidth - $("#dragSpotHistogram").width())/2;
    var ySpace = (window.innerHeight - $("#dragSpotHistogram").height())-marginSize;

    $("#myModalHistogram").draggable({
        handle: "#dragSpotHistogram",
        containment: [-(xSpace + marginSize) , - marginSize , (xSpace - marginSize), ySpace],
        start: function( event, ui ) {
            $(".colorLine").spectrum("hide");
            $(".colorFil").spectrum("hide");
        }
    });


    function textOut(divId) {
        if($('#textNumber_' + divId).val() != "") {
            if($('#binOptions').text() == "nbins" && $('#textNumber_' + divId).val() != selectedPlot.parameters.nbins) {
                selectedPlot.parameters.nbins = $('#textNumber_' + divId).val()
                selectedPlot.parameters.binsize = null
                clearHistogram(id);
                plots[divId] = getValues(server, id, selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation);
            } else if($('#binOptions').text() == "bin size" && $('#textNumber_' + divId).val() != selectedPlot.parameters.binsize) {
                selectedPlot.parameters.binsize = $('#textNumber_' + divId).val();
                selectedPlot.parameters.nbins = null
                clearHistogram(id);
                plots[divId] = getValues(server, id, selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation);
            }
        }
    }

    function xMinOut(divId){
        if($('#xMin_' + divId).val() != "") {
            selectedPlot.parameters.min = $('#xMin_' + divId).val();
        }
        else{
            selectedPlot.parameters.min = null;
        }
        clearHistogram(id);
        plots[divId] = getValues(server, id, selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation);
    }

    function xMaxOut(divId){
        if($('#xMax_' + divId).val() != "") {
            selectedPlot.parameters.max = $('#xMax_' + divId).val();
        }
        else{
            selectedPlot.parameters.max = null;
        }

        clearHistogram(id);
        plots[divId] = getValues(server, id, selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation);
    }

    $("#textNumber_" + divId).off("focusout");
    $("#textNumber_" + divId).focusout(function() {
        textOut(divId);
    });

    $("#textNumber_" + divId).off("keypress");
    $("#textNumber_" + divId).keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
    });

    $("#xMax_" + divId).off("focusout");
    $("#xMax_" + divId).focusout(function() {
        xMaxOut(divId);
    });

    $("#xMax_" + divId).off("keypress");
    $("#xMax_" + divId).keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
    });

    $("#xMin_" + divId).off("focusout");
    $("#xMin_" + divId).focusout(function() {
        xMinOut(divId);
    });

    $("#xMin_" + divId).off("keypress");
    $("#xMin_" + divId).keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
    });


    $("#xLegendHistogram").keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
    });

    $("#yLegendHistogram").keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
    });

    $("#myModalLabelHistogram").keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
        }
    });

    setLayersHistogram(plots[divId].parameters.plotName);

    /*$('#colorLine').colorpicker();
    $('#colorLine').data('colorpicker').color.setColor(plots[divId].parameters.lineColor);
    $('#colorLine').colorpicker('update', true);

    $('#colorFil').colorpicker();
    $('#colorFil').data('colorpicker').color.setColor(plots[divId].parameters.fillColor);
    $('#colorFil').colorpicker('update', true);*/


     $(".colorLine").spectrum("set", plots[divId].parameters.lineColor);
     $(".colorFil").spectrum("set", plots[divId].parameters.fillColor);

    $('#checkHistogramLayers').prop("checked", plots[divId].dataSource[0].check);

}

function setLayersHistogram(name) {
    $("#layersDivHistogram").empty();

    var regionsDiv = d3.select("#layersDivHistogram");

    var checkDiv = regionsDiv
            .append("div")
            .attr("class","checkbox")
            .attr("id","regionDiv_0")
            .append("h6");

    var labelDiv = checkDiv
            .append("label")
            .attr("class","labelRegions");

    labelDiv.append("input")
            .attr("id", "checkHistogramLayers")
            .attr("type","checkbox")
            .attr("checked", selectedPlot.dataSource[0].check)
            .attr("onclick", 'changeLayerHistogram(0, this.checked)');

    checkDiv.append("div")
            .attr("class","DivLayers")
            .text(name);
}


// TODO: eliminate rubber-stamp parameter (option)
function changeNBins(option) {
    $('#textNumber_' + selectedPlot.plotId).val(selectedPlot.parameters.nbins);
    $('#binOptions').text(option.text);
}


// TODO: eliminate rubber-stamp parameter (option)
function changeBinSize (option) {
    $('#textNumber_' + selectedPlot.plotId).val(selectedPlot.parameters.binsize);
    $('#binOptions').text(option.text);
}


function changeNormalize (object, option) {
    $('#normalizeOption').text(object.text);
    var id = selectedPlot.plotId.split("Plot")[1];
    selectedPlot.parameters.normalization = option;
    clearHistogram(id);
    plots[selectedPlot.plotId] = getValues(
            server, id , selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation);
}


// TODO: eliminate rubber-stamp parameter (option)
function changeHistogramXAxis (option) {
    var id = selectedPlot.plotId.split("Plot")[1];
    selectedPlot.parameters.xFlip = option.checked;
    clearHistogram(id);
    plots[selectedPlot.plotId] = getValues(
            server, id , selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation, "changed");
}


// TODO: eliminate rubber-stamp parameter (option)
function changeHistogramYAxis (option) {
    var id = selectedPlot.plotId.split("Plot")[1];
    selectedPlot.parameters.yFlip = option.checked;
    clearHistogram(id);
    plots[selectedPlot.plotId] = getValues(
        server, id, selectedPlot.parameters, selectedPlot.viewName, plots[selectedPlot.plotId].lastTransformation);
}


function changeLayerHistogram(layer, option){
    var id = selectedPlot.plotId.split("Plot")[1];

    if(!option) {
         d3.selectAll("#legendSize_" + selectedPlot.plotId).remove();
         d3.selectAll(".bar_" + selectedPlot.plotId).remove();
         plots[selectedPlot.plotId].dataSource[0].check = false;
         d3.selectAll("#legendColor_" + selectedPlot.plotId).style("display", "none");
    } else {
        d3.select("#svg_Plot" + id).remove();
        plots[selectedPlot.plotId] = getValues(
                server, id , selectedPlot.parameters, selectedPlot.viewName,
                plots[selectedPlot.plotId].lastTransformation);
    }
}


function changeHistogramLineColor(color) {
    plots[selectedPlot.plotId].parameters.lineColor = color;
    if(plots[selectedPlot.plotId].parameters.lineType != "None"){
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke", color);
    }
}


function changeHistogramFillColor(color) {
    plots[selectedPlot.plotId].parameters.fillColor = color;
    d3.selectAll(".bar_" + selectedPlot.plotId).style("fill", color);
    d3.selectAll("#legendColor_" + selectedPlot.plotId).style("fill", color);
    highlightBin(plots[selectedPlot.plotId], plots[selectedPlot.plotId].parameters.linkedViewsX);
}


function changeLineSize(size) {
    $('#lineSize').text(size);
    plots[selectedPlot.plotId].parameters.lineSize = size;
    d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke-width", size);
}


function changeLineType (type) {
    console.log(type);

    $('#lineType').text(type);
    plots[selectedPlot.plotId].parameters.lineType = type;


    if(type == "Dashed") {
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke-dasharray", ("3, 3"));
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke", plots[selectedPlot.plotId].parameters.lineColor);
        d3.selectAll(".bar_" + selectedPlot.plotId).style("shape-rendering", "initial");
    } else if(type == "Solid") {
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke-dasharray", ("0, 0"));
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke", plots[selectedPlot.plotId].parameters.lineColor);
        d3.selectAll(".bar_" + selectedPlot.plotId).style("shape-rendering", "initial");
    } else if(type == "None"){
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke", "none")
        d3.selectAll(".bar_" + selectedPlot.plotId).style("shape-rendering", "crispEdges");
    }
}


function changeLegendOPacityHistogram(check) {
    if(check.checked) {
        d3.select("#legendBackground_" + selectedPlot.plotId).attr("fill", "white");
    } else {
        d3.select("#legendBackground_" + selectedPlot.plotId).attr("fill", "transparent");
    }

    plots[selectedPlot.plotId].parameters.legendOpacity = check.checked;
}


function changeLegendPositionHistogram(position) {
    plots[selectedPlot.plotId].parameters.legendPosition = position;
    $('#glyphLegendTextHistogram').text(positionText(position));

    var margin = {
        top: 17,
        right: 30,
        bottom: 30,
        left: 30
    };

    var width = selectedPlot.parameters.plotWidth - margin.left - margin.right - 48,
    height = selectedPlot.parameters.plotHeight - margin.top - margin.bottom - 20;

    setLegendPosition(position, selectedPlot.plotId, width, height);
    plots[selectedPlot.plotId].parameters.legendPosition = position;
    selectedPlot.parameters.legendPosition = position;
}


function setLegendPosition(position, id, width, height){
    var totalWidth =
            document.getElementById("legendText_" + id).getBoundingClientRect().width +
            document.getElementById("legendColor_" + id).getBoundingClientRect().width + 16;

    if(position == "none") {
        $("#legendSize_" + id).attr("visibility", "hidden");
    } else {
        $("#legendSize_" + id).attr("visibility", "initial");
    }

    if(position == "topleft") {
        $("#legendSize_" + id).attr("transform", "translate(6,6)");
    } else if(position == "bottomleft") {
        $("#legendSize_" + id).attr("transform", "translate(6, "+(height - 20 + 4)+")");
    } else if(position == "topright") {
        $("#legendSize_" + id).attr("transform", "translate(" + (width - totalWidth) + ", 6)");
    } else if(position == "bottomright") {
        $("#legendSize_" + id).attr("transform", "translate(" + (width - totalWidth) + ", "+(height - 20 + 4)+")");
    }
}


function initHistogramOptions() {
    $("#cumulative").click(function() {
        if(!handler) {
            handler = true;
            var id = selectedPlot.plotId.split("Plot")[1]

            if (this.checked) {
                selectedPlot.parameters.cumulative = 1;
            } else {
                selectedPlot.parameters.cumulative = 0;
            }

            clearHistogram(id);
            plots[selectedPlot.plotId] = getValues(
                    server, id , selectedPlot.parameters, selectedPlot.viewName,
                    plots[selectedPlot.plotId].lastTransformation);
            handler = false;
        }
    });


    $("#myModalLabelHistogram").on('blur', function() {
        if (!$(this).is(":focus")) {
            var text = this.innerHTML.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
            plots[this.className].parameters.plotName = text;
            $("#title_" + this.className).html(this.innerHTML);
            //$("#tableOptionTextHistogram").html(text);
            $("#tableOptionHistogram").html(text);
            $(".DivLayers").html(text);
        }
    });


    $("#xLegendHistogram").on('blur', function() {
        if (!$(this).is(":focus")) {
            var text = this.innerHTML.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ");
            plots[this.className].plot_info.series_name = text;
            //$("#xOptionTextHistogram").html(text);
            $("#xOptionHistogram").html(text);
            d3.select("#xLabel_" + this.className).text(text);
            $("#legendText_"  + this.className).html(text);
        }
    });


    $("#yLegendHistogram").on('blur', function() {
        if (!$(this).is(":focus")) {
            plots[this.className].parameters.yLabel = this.innerHTML;
            d3.select("#yLabel_" + this.className).text(this.innerHTML);
        }
    });


    $("#xLegendHistogram").keypress(function(e) {
        return e.which != 13;
    });


    $("#yLegendHistogram").keypress(function(e) {
        return e.which != 13;
    });


    $("#myModalLabelHistogram").keypress(function(e) {
        return e.which != 13;
    });

    $(".colorPoints").spectrum({
            showAlpha: true,
            //clickoutFiresChange: true,
            showButtons: false
    }).on("dragstop.spectrum", function(e, color) {
        changePlotColor(setAlphaColor(color.toHex(), color.getAlpha()));
    });


    $(".colorBackground").spectrum({
            showAlpha: true,
            //clickoutFiresChange: true,
            showButtons: false
     }).on("dragstop.spectrum", function(e, color) {
        changePlotBackgroundColor(setAlphaColor(color.toHex(), color.getAlpha()));
    });


    $(".colorLine").spectrum({
            showButtons: false
    }).on("dragstop.spectrum", function(e, color) {
        changeHistogramLineColor(color.toHex());
    });

    $(".colorFil").spectrum({
            showButtons: false
    }).on("dragstop.spectrum", function(e, color) {
        changeHistogramFillColor(color);
    });

}

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }

    return true;
}