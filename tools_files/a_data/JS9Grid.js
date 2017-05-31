
function addDivsJS9(divId, plotWidth, plotHeight) {
    var mainDiv = d3.select("#" + divId);
    var id = "divJS9_" + divId;

    var res = {
        mainDiv: mainDiv,
        optsDiv: createOptionsDivJS9(divId, mainDiv),
        menuBar: mainDiv
                .append("div")
                .attr("class", "JS9Menubar")
                .attr("id", id+"Menubar")
                .attr("data-width", plotWidth + "px"),
        pluginDiv: mainDiv
                .append("div")
                .attr("id", id)
                .attr("class", "JS9")
                .attr("data-width", plotWidth + "px")
                .attr("data-height", (plotHeight - 30) + "px"),
    };

    return res;
}


function createOptionsDivJS9(divId, mainDiv, visualizationADQL, subset) {
    var optsDiv = mainDiv
            .append("div")
            .attr("id", "opts_" + divId)
            .attr("class", "optsDiv")
            .attr("valign", "top center")

    optsDiv.append("a")
            .attr("href", "#")
            .attr("class", "remove")
            .attr("data-toggle", "tooltip")
            .attr("title", "Close")
            .append("Button")
            .attr("type", "button")
            .attr("class", "btn btn-default btn-sm pull-right")
            .append("Span").attr("Class", "glyphicon glyphicon-remove").attr("aria-hidden", "true");

    return optsDiv;
}


function createJS9Grid(viewId, divId, host, port, plotWidth, plotHeight, viewParams) {
    // add the subdivs
    var divs = addDivsJS9(divId, plotWidth, plotHeight);
    JS9.AddDivs("divJS9_" + divId);

    viewParams.visualizations.forEach(function(entry) {
        var js9Query = server + "/plugin-files/JS9/" + entry.fileName + ".fits";
        JS9.Load(js9Query, { display: "divJS9_" + divId });
    });

    var res = {
        plotId: "Plot" + viewId,
        type: "Plugin",
        plugin: "JS9"
    }

    return res;
}
