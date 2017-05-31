// TODO: eliminate global variables
var selectedQueryPlot;
var clipboard = new Clipboard('#copyTextADQL');
var extraPOSTValue = '';


function changeQueryPlot(id) {
    selectedQueryPlot = id;
    var elem = document.getElementById("QuerySelectedPlot");
    elem.innerHTML = (id == -1) ? "None" : plots["Plot" + id].PlotName;
}


// TODO: eliminate rubber-stamp parameter (plot)
function updateQueryPlotSelection(plot, id) {
    var plotName = plot.PlotName;
    $("#QueryDropdownOptions").append(
            '<li> <a href="#" id=Query_Plot' + id + ' onclick="ChangeQueryPlot(' + id + ')">' +
            plotName + '</a> </li>');
}


// TODO: eliminate rubber-stamp parameter (plot)
function removeQueryPlotFromDropdown(plot) {
    var plotQueryId = "Query_" + plot;
    $("#" + plotQueryId).remove();

    if ("Plot" + selectedQueryPlot == plot) {
        changeQueryPlot(-1);
    }
}

function requestADQLQuery(plot) {
    // TODO: mixed semantics for 'plot' (is it a number or an object?)
    if (plot == -1 || plots[plot.id].selectionJSON.val[0] == "") {
        return;
    }
    
    var marginSize = 30;
    var marginSizeLeft = 9;
    var xSpace = (window.innerWidth - $("#adqlModalDrag").width()) / 2;
    var ySpace = (window.innerHeight - $("#adqlModalDrag").height()) - marginSize;

    $("#adqlModal").draggable({
        handle: "#adqlModalDrag",
        containment: [-(xSpace + marginSizeLeft), - marginSize, (xSpace - marginSizeLeft), ySpace]
    });

    var result;
    var dimensionsQuery = server + '/generate-adql' + extraPOSTValue;

    $.ajax({
            type: "POST",
            url: dimensionsQuery,
            data: {
                polys: getPolys(plot.id),
                adql: JSON.stringify(plots[plot.id].visualizationADQL)
            },
            async: false
        })
        .done(function(data) {
            result = data;
            $('#adql_header').html("ADQL - " + plots[plot.id].Parameters.plotNameLabel);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })

    $('#messageADQL').html(result)
    $('#adqlModal').modal('toggle');
}


function requestADQLgacs(plot) {



}




function getPolys(divId) {
    var save = [];

    for (var region in plots[divId].selectionRegion) {
        for(r in plots[divId].selectionRegion[region].region)
            save.push(JSON.stringify(plots[divId].selectionRegion[region].region[r].toGeoJSON()));
    }
    return '{ "polys" : [' + save + ']}';
}


// TODO: eliminate rubber-stamp parameter (select)
function createSelection(select) {

    var color = "EF" + plots[select.id].selectionRegion[plots[select.id].selectionRegion.length-1].region[0].options.color.substring(1);
    var visId = plots[select.id].dataSource["Layer" + 0].visualizationId;
    var selectionQuery = server + "/polygon-selection" + extraPOSTValue;
    var polys = getPolys(select.id);

    if(JSON.parse(polys).polys.length != 0) {
        $.ajax({
                type: "POST",
                url: selectionQuery,
                data: {
                    "action": "select",
                    "vis-id": visId,
                    "polys": polys
                },
                async: true
            })
            .done(function(data) {
                var jsonParse = JSON.parse(data);
                if(jsonParse["result"] === "OK") {
                    Plotlet.addSelectionLayer([jsonParse["selection-id"]], select.id, color);
                    selectedPlot = plots[select.id];
                    for(region in selectedPlot.selectionRegion)
                        removeRegion(region);
                }
                else{
                    alert(jsonParse["description"]);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
            })
    }
}

function queryGacsBySourceId(id, plotId) {
    var marginSize = 30;
    var marginSizeLeft = 9;
    var xSpace = (window.innerWidth - $("#adqlModalDrag").width()) / 2;
    var ySpace = (window.innerHeight - $("#adqlModalDrag").height()) - marginSize;

    $("#adqlModal").draggable({
        handle: "#adqlModalDrag",
        containment: [-(xSpace + marginSizeLeft), - marginSize, (xSpace - marginSizeLeft), ySpace]
    });

    var dimensionsQuery = server + '/generate-adql' + extraPOSTValue;

    $.ajax({
            type: "POST",
            url: dimensionsQuery,
            data: {
                sourceid: id,
                datasource: plots[plotId].Parameters.gaiaDataSource
            },
            async: false
        })
        .done(function(data) {
            result = data;
            $('#messageADQL').html(result);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })

    //var result = "SELECT * FROM public.gaia_source  WHERE source_id = '"+id+"'";

    $('#adql_header').html("ADQL - search by source-ID");


    $('#messageADQL').html(result)
    $('#adqlModal').modal('toggle');
}


function queryGacsByCoordinates(x,y, plotId) {

    var marginSize = 30;
    var marginSizeLeft = 9;
    var xSpace = (window.innerWidth - $("#adqlModalDrag").width()) / 2;
    var ySpace = (window.innerHeight - $("#adqlModalDrag").height()) - marginSize;

    var radius = 10;
    if($("#radiusText").val() != "")
        radius = $("#radiusText").val();

    radius = radius/60;

    $("#adqlModal").draggable({
        handle: "#adqlModalDrag",
        containment: [-(xSpace + marginSizeLeft), - marginSize, (xSpace - marginSizeLeft), ySpace]
    });

    $('#adql_header').html("ADQL - search by coordinates");

    var dimensionsQuery = server + '/generate-adql' + extraPOSTValue;

    $.ajax({
            type: "POST",
            url: dimensionsQuery,
            data: {
                point: JSON.stringify({x: x, y: y, radius: radius}),
                adql: JSON.stringify(plots[plotId].visualizationADQL)
            },
            async: false
        })
        .done(function(data) {
            result = data;
            $('#messageADQL').html(result);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })

    $('#adqlModal').modal('toggle');
}



function querySimbad(lat, lng, coordSys) {
    if(coordSys =="galactic"){
        coordSys = "GAL";
    }
    var radius = 10;
    if($("#radiusText").val() != "")
        radius = $("#radiusText").val()

    window.open('http://simbad.u-strasbg.fr/simbad/sim-coo?Coord=' + lat + '%20' + lng + '&Radius='+radius+'&Radius.unit=arcmin&CooFrame=' + coordSys, '_blank');
}