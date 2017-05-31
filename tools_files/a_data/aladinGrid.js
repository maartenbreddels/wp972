function addDivsAladin(divId, plotWidth, plotHeight) {
    var mainDiv = d3.select("#" + divId);

    var res = {
        mainDiv: mainDiv,
        optsDiv: createOptionsDivAladin(divId, mainDiv),
        pluginDiv: mainDiv
                .append("div")
                .attr("id", "aladin-lite-div_" + divId)
                .attr("style", "width: " + plotWidth + "px; height:" + plotHeight + "px;")
    };

    return res;
}

function createOptionsDivAladin(divId, mainDiv, visualizationADQL, subset) {
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


function createAladinGrid(viewId, divId, host, port, plotWidth, plotHeight, viewParams) {
    // add the subdivs
    var divs = addDivsAladin(divId, plotWidth, plotHeight);


    var aladin = A.aladin(
                '#aladin-lite-div_' + divId,
                 {
                     fov: 0,
                     cooFrame: "galactic",
                     target: 'galactic center'
                 });

    if(viewParams.visualizations != null && viewParams.visualizations.length > 0){
        var index = 0;

        viewParams.visualizations.forEach(function(entry) {
             var lastEntry = {
                 "id": entry.visName,
                  "url": server + "/plugin-files/aladin/" + entry.fileName,
                  "name": entry.visName,
                  "maxOrder": entry.maxOrder,
                  "frame": entry.frame,
                  "format": entry.format,
                  "order": "00-00-" + index
             };

             HpxImageSurvey.SURVEYS.unshift(lastEntry);
             index++;
        });

        aladin.setImageSurvey(viewParams.visualizations[0].visName);
    }

    var res = {
        plotId: "Plot" + viewId,
        type: "Plugin",
        plugin: "Aladin",
        parameters: viewParams,
        aladin: aladin
    }

    return res;
}