// TODO: eliminate global variables
var visualizationsInfo = {};
var plots = {};
var lastPlot = 0;

function includeFromUrl(element, root, includeUrl) {
    $.ajax({
        url: root + "/" + includeUrl,
        async: false,
        success: function(result) {
            $(element).append(result);
        }
    });
}

function init(root) {
    // Load modal windows
    includeFromUrl('#main', root, "plotlet/html/scatterplot_configuration.html");
    includeFromUrl('#main', root, "plotlet/html/histogram_configuration.html");
    includeFromUrl('#main', root, "plotlet/html/create_plot.html");
    includeFromUrl('#main', root, "plotlet/html/adql_output.html");

    initPlotOptions();
    initHistogramOptions();

    var visualizationsListQuery = server + "/visualizations-list";
    //Initially request all visualizations available and their parameters
    $.ajax({
            type: "GET",
            url: visualizationsListQuery,
            async: false
        })
        .done(function(data) {
            visualizationsInfo = JSON.parse(data);

            //Initial
            initGridster();
            addVisualizationOptionsToUI();
            createAllVisualisationsAtOnce();

        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Visualizations list fetching failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })
}


function addVisualizationOptionsToUI() {
    $('[data-submenu]').submenupicker();
    $(".plotSelected").text(getPlotName(0) + " (2D)");

    var marginSizeLeft = -58;
    var marginSizeTop = 30;
    var xSpace = (window.innerWidth - $("#dragNewPlot").width())/2;
    var ySpace = (window.innerHeight - $("#dragNewPlot").height())-marginSizeTop;

    $("#plotCreationModal").draggable({
        handle: "#dragNewPlot",
        containment: [-(xSpace + marginSizeLeft) , - marginSizeTop , (xSpace - marginSizeLeft), ySpace]
    });

    $("input[name=size][value=Panoramic]").closest(".btn").addClass('active');

    for (var view in visualizationsInfo["visualizations"]) {
        viewInfo = visualizationsInfo["visualizations"][view];
        var viewName = viewInfo["plot-name"];

        if(viewInfo["vis-type"] == "1DHistogram") {
            $("#1Dmenu").append(
                    '<li><a href="#" onclick="changePlot(\'1D\',' + view + ',\'' +
                    viewInfo["geometry"]+ '\')">' + viewName + '</a> </li>');
        } else if(viewInfo["vis-type"] == "2DScatterPlot") {
            $("#2Dmenu").append(
                    '<li><a href="#" onclick="changePlot(\'2D\',' + view + ',\'' +
                    viewInfo["geometry"]+ '\')">' + viewName + '</a> </li>');
        } else if(viewInfo["vis-type"] == "JS9" || viewInfo["vis-type"] == "Aladin"){
            $("#plugIn").append(
                    '<li><a href="#" onclick="changePlot(\'plugin\',' + view + ',\'' +
                    viewInfo["geometry"]+ '\')">' + viewName + ' </a> </li>');
        }
    }

    //$("#1Dmenu").append('<li class = "disabled"><a href="#" onclick=""> User File </a> </li>');
    //$("#2Dmenu").append('<li class = "disabled"><a href="#" onclick=""> User File </a> </li>');
}


function createAllVisualisationsAtOnce() {
    changePlotSize("Panoramic");
    addPlot(0, "Wide")
}


function addPlot(type, aspect) {
    createPlot(type, lastPlot, aspect);
    lastPlot ++;
}


// TODO: differentiate from lower-case createPlot
// TODO: apply Java-style camelCase for function names
function CreatePlot() {
    var type = $(".plotSelected").attr("id");
    var aspect = document.getElementsByClassName('active')[0].firstElementChild.value;
    changePlotSize(aspect);

    if(aspect == "Normal" || aspect == "Large" || aspect == "X-Large") {
        aspect = "Square";
    }
    else if(aspect == "Panoramic"){
        aspect = "Wide";
    }

    addPlot(type, aspect);
}


// TODO: differentiate from upper-case CreatePlot
function createPlot(type, id, aspect) {
    var visualization = visualizationsInfo["visualizations"][type];
    var visId = visualization["vis-id"];
    var visualizationADQL = visualization["ADQL"];

    if (visualization["vis-type"] == "2DScatterPlot") {
        createNewPlot(
                id, visId, visualization, visualizationADQL, visualization["subset"],
                visualization["download"], aspect);
    } else if (visualization["vis-type"] == "1DHistogram") {
        createNew1DHistogram(id, visId, visualization);
    } else if (visualization["vis-type"] == "Aladin" || visualization["vis-type"] == "JS9" ) {
        createNewPlugin(id, visualization);
    }
}


// TODO: eliminate rubber-stamp parameter (viewParams)
function createNewPlot(id, viewName, viewParams, visualizationADQL, subset, download, aspect) {
    createWidget(id, viewParams, "Plot");
    // TODO: should viewParams be altered? Isn't it parameters copied from configurations?
    // TODO: Maybe abstraction should be improved
    viewParams["aspect"] = aspect;
    var newPlot = Plotlet.createScatterplot(
            id, "Plot" + id, viewName, server, null, viewParams, visualizationADQL, subset, download);

    setRemoveButton("Plot" + id);

    if (newPlot == undefined) {
        gridster.remove_widget($("#Plot" + id));
        return;
    }

    plots["Plot" + id] = newPlot;
    updateQueryPlotSelection(newPlot, id);

    // TODO: where does this "linkedViewsActive" come from? How to make it clearer?
    if (linkedViewsActive) {
        Plotlet.createPointSelection(newPlot);
    }
}


// TODO: eliminate rubber-stamp parameter (viewParams)
function createNew1DHistogram(id, viewName, viewParams) {
    createWidget(id, viewParams, "Histogram");
    createOptionsDivHistogram(id, viewParams.plotHeight, viewParams.plotWidth);
    plots["Plot" + id] = getValues(server, id, viewParams, viewName, null);
}


// TODO: eliminate rubber-stamp parameter (viewParams)
function createNewPlugin(id, viewParams) {
    createWidget(id, viewParams, "Plugin");

    if(viewParams["plot-name"].indexOf("Aladin") > -1) {
        plots["Plot" + id] = createAladinGrid(
                id, "Plot" + id, server, null, viewParams.plotWidth, viewParams.plotHeight, viewParams);
    } else if (viewParams["plot-name"] == "JS9") {
        plots["Plot" + id] = createJS9Grid(
                id, "Plot" + id, server, null, viewParams.plotWidth, viewParams.plotHeight, viewParams);
    }
}

// TODO: type is actually an index, not a type; pick a better name across the code
function getPlotName(type) {
    return visualizationsInfo["visualizations"][type]["plot-name"];
}


function chooseModal(divId, type) {
    if(type == "plot") {
        refreshModalWithCurrentPlot(divId)
    } else if(type == "histogram") {
        refreshModalWithCurrentHistogram(divId)
    }
}


function togglePlotModal() {
    $('#plotCreationModal').modal('toggle');
}


function togglePlotOptions() {
    $('#plotCreationOptions').toggle("show");
}


$(document).on({
    ajaxStart: function() {
        $('#img_wrapper').show();
        $('#loading_wrapper').show();
    },
    ajaxSuccess: function() {
        $('#img_wrapper').hide();
        $('#loading_wrapper').hide();
    }
});