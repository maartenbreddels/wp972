// TODO: eliminate global variables
var lastTransformation = {
    translate: 1,
    scale: 1
};

function createOptionsDivHistogram(id, height, width){

    var mainDiv = d3.select("#Plot" + id);
    var optsDiv = mainDiv
            .append("div")
                .attr("id", "opts_" + id)
                .attr("class", "optsDiv")
                .attr("valign", "top center")

    //Options Button
    optsDiv.append("Button")
                .attr("type", "button")
                .attr("class", "btn btn-default btn-md pull-left optsButton")
                .attr("aria-label", "Plot Options")
                .attr("OnClick", "chooseModal(" + id + ", 'histogram')")
            .append("Span")
                .attr("Class", "glyphicon glyphicon-cog")
                .attr("aria-hidden", "true")

    optsDiv.append("a")
                .attr("href", "#")
                .attr("class", "remove")
            .append("Button")
                .attr("type", "button")
                .attr("class", "btn btn-default btn-sm pull-right removeButton")
            .append("Span")
                .attr("Class", "glyphicon glyphicon-remove")
                .attr("aria-hidden", "true");


    optsDiv.append("a")
                .attr("class", "resetViewHistogram_" + id)
                .attr("data-toggle", "tooltip")
                .attr("title", "Reset view")
            .append("Button")
                .attr("type", "button")
                .attr("class", "btn btn-default btn-sm pull-right")
            .append("Span")
                .attr("Class", "glyphicon glyphicon-move")
                .attr("aria-hidden", "true");

    var imgDiv = mainDiv.append("div");

    imgDiv.append("div")
            .attr("id", "top_Plot" + id)
            .attr("style", "width:" + (width - 4) + "px; height:25px")
            .attr("class", "top");

    imgDiv.append("div")
            .attr("id", "plot_Plot" + id)
            .attr("style", "width:" + (width - 4) + "px; height:" + (height - 2) + "px; background: white; margin-left: 2px")
}


function getValues(server, id, viewParams, viewName, lastTransformation, changed) {
    var parameters = getVisualizationParametersHistogram(viewParams);

    if(lastTransformation == null) {
        lastTransformation = {
            translate: 1,
            scale: 1
        };
    }

    var histogramQuery = server + "/histogram";

    var data = {
        "vis-id": viewName[0],
        "normalization": parameters.normalization,
        "cumulative": parameters.cumulative
    };

    var bins, plot_info;

    if(parameters.binsize != null ) {
        data.binsize = parameters.binsize;
    } else {
        data.nbins = parameters.nbins;
    }

    if(parameters.min != null){
        data.min = parameters.min;
    }
    if(parameters.max != null){
        data.max = parameters.max;
    }

    $.ajax({
        type: "GET",
        url: histogramQuery,
        data: data,
        async: true
    })
    .done(function(data) {
        createHistogram(
                data.bins, id, parameters.plotWidth, parameters.plotHeight, data.plot_info, parameters,
                lastTransformation, changed)
        plots["Plot" + id].data = data.bins;
        plots["Plot" + id].plot_info = data.plot_info;
        serverLinkedViewPointSelectionHistogram(plots["Plot" + id]);

    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
    })

    var res = {
        type: "Histogram",
        plotId: "Plot" + id,
        parameters: parameters,
        viewName : viewName,
        dataSource: [{"check": "true"}],
        lastTransformation: lastTransformation
    }

    return res;
}


function createHistogram(data, id, width, height, plot_info, viewParams, lastTransformation, changed) {
    // setup plot name
    d3.select("#plotLablSVG_Plot" + id).remove();
    var topDiv = d3.select("#top_Plot" + id);

    var plotLabelSVG = topDiv.append("svg")
        .attr("id", "plotLablSVG_Plot" + id)
        .attr("width", width)
        .attr("height", "40")

    var plotLabel = plotLabelSVG.append("text")
        .attr("id", "title_Plot" + id)
        .attr("x", width / 2)
        .attr("y", "30")
        .attr("text-anchor", "middle")
        .text(viewParams.plotName);

    var margin = {
        top: 17,
        right: 30,
        bottom: 30,
        left: 30
    }

    width = width - margin.left - margin.right - 48,
    height = height - margin.top - margin.bottom - 20;
    xDomain = [data[0].start, data[data.length - 1].end];


    var xRange = [0, width];
    // setup x axis
    if(viewParams.xFlip){
        xDomain.reverse();
        if(Math.trunc(data[0].start) == 0) {
            data.reverse();
       }
    }

    var linearXScale = d3.scale.linear().range(xRange).domain(xDomain);
    var x = d3.scale.ordinal().rangeBands(xRange);

    if(viewParams.yFlip) {
        var y = d3.scale.linear().range([0, height]);
    } else {
        var y = d3.scale.linear().range([height, 0]);
    }

    var xAxis = d3.svg.axis()
            .scale(linearXScale)
            .orient("bottom").tickSize(0).ticks(Math.max(width/50, 2)).outerTickSize(0);

    var xAxis2 = d3.svg.axis()
            .scale(linearXScale)
            .orient("top").ticks(Math.max(width/50, 2)).outerTickSize(0);

    var xAxisTop = d3.svg.axis()
            .scale(linearXScale)
            .orient("top").tickSize(0).ticks(Math.max(width/50, 2)).outerTickSize(0);

    var xAxisTop2 = d3.svg.axis()
            .scale(linearXScale)
            .orient("bottom").ticks(Math.max(width/50, 2)).outerTickSize(0);

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left").tickSize(0).ticks(Math.max(height/50, 2)).outerTickSize(0);

    var yAxis2 = d3.svg.axis()
            .scale(y)
            .orient("right").ticks(Math.max(height/50, 2)).outerTickSize(0);

    var yAxisRight = d3.svg.axis()
            .scale(y)
            .orient("right").tickSize(0).ticks(Math.max(height/50, 2)).outerTickSize(0);

    var yAxisRight2 = d3.svg.axis()
            .scale(y)
            .orient("left").ticks(Math.max(height/50, 2)).outerTickSize(0);

    var tip = d3.tip()
            .attr('class', 'd3-tip d3-tip_' + id)
            .offset([-10, 0])
            .html(function(d) {
                return "<div id='tooltipId'> Number:" +
                    d.value + "<br/>" + plot_info.series_name +
                    /*":</strong> <span style='color:red'>" +
                     parseFloat(((d.start + d.end) / 2)) + "</span>";*/
                     ": [" +
                      parseFloat(d.start.toFixed(7)) + "," +  parseFloat(d.end.toFixed(7)) + "[ </div>";
            });

    var maxZoom = data.length/2;
    if(maxZoom/2 < 1) {
        maxZoom = 1;
    }

    var zoom = d3.behavior.zoom()
            .scaleExtent([1, maxZoom])
            .x(linearXScale)
            .y(y)
            .on("zoom", zoomed);


    var svg = d3.select("#plot_Plot" + id)
            .attr("class", "chart")
            .call(zoom)
            .append("svg")
            .attr("id", "svg_Plot" + id)
            .attr("width", width + margin.left + margin.right + 48)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (margin.left + 48) + "," + (margin.top) + ")");

    var defs = svg.append("defs");

    // Append a clipPath element to the defs element, and a Shape
    // to define the cliping area
    defs.append("clipPath")
            .attr('id','my-clip-path_' + id)
            .append('rect')
            .attr('width',width) //Set the width of the clipping area
            .attr('height',height); // set the height of the clipping area

    //clip path for x axis
    defs.append("clipPath")
            .attr('id','x-clip-path_' + id)
            .append('rect')
            .attr('width',width + 20) //Set the width of the clipping area
            .attr('height',height + margin.bottom + margin.top)
            .attr("transform", "translate(-10, -" + margin.top + ")"); // set the height of the clipping area

    //add a group that will be clipped (this will contain the bars)
    var barsGroup = svg.append('g');

    //Set the clipping path to the group (g element) that you want to clip
    barsGroup.attr('clip-path','url(#my-clip-path_' + id + ')');

    var xAxisGroup = svg
            .append("g")
            .attr('class','x-axis')

    xAxisGroup.append('g')
            .attr("class", "x axis xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    xAxisGroup.append('g')
            .attr("class", "x2 axis xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis2).selectAll("text").remove();

    xAxisGroup.append('g')
            .attr("class", "xTop axis xAxis")
            .call(xAxisTop).selectAll("text").remove();

    xAxisGroup.append('g')
            .attr("class", "x2Top axis xAxis")
            .call(xAxisTop2).selectAll("text").remove();

    //The xAxis is scalled on zoom, so we need to clip it to
    xAxisGroup.attr('clip-path','url(#x-clip-path_' + id+')');

    x.domain(data.map(function(d) {
        return ((d.start + d.end) / 2);
    }));

    var yMax = d3.max(data, function(d) {
        return d.value;
    });

    yMax += yMax * 0.05
    y.domain([0, yMax]);
    var bars;

    if(viewParams.yFlip) {
        bars = barsGroup
                .selectAll(".bar_Plot" +  id)
                .data(data)
                .enter().append("rect")
                .attr("id", function(d,i){
                    return "bar_" + i;
                })
                .attr("class", "bar_Plot" + id)
                .attr("x", function(d) {
                    return x(((d.start + d.end) / 2));
                })
                .attr("width", x.rangeBand())
                .attr("height", function(d) {
                    return y(d.value);
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .style("stroke", viewParams.lineColor)
                .style("fill", viewParams.fillColor)
                .style("stroke-width", viewParams.lineSize)
                .style("vector-effect", "non-scaling-stroke");
    } else {
        bars = barsGroup
                .selectAll(".bar_Plot" +  id)
                .data(data)
                .enter().append("rect")
                .attr("id", function(d,i){
                    return "bar_" + i;
                })
                .attr("class", "bar_Plot" + id)
                .attr("x", function(d, i) {
                    return x(((d.start + d.end) / 2));
                })
                .attr("width", x.rangeBand())
                .attr("y", function(d) {
                    return y(d.value);
                })
                .attr("height", function(d) {
                    return height - y(d.value) + 2;
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .style("stroke-width", viewParams.lineSize)
                .style("stroke", viewParams.lineColor)
                .style("fill", viewParams.fillColor)
                .style("vector-effect", "non-scaling-stroke");
    }

    if(viewParams.lineType == "Dashed") {
        d3.selectAll(".bar_Plot" +  id).style("stroke-dasharray", ("3, 3"))
    } else if(viewParams.lineType == "Solid") {
        d3.selectAll(".bar_Plot" +  id).style("stroke-dasharray", ("0, 0"))
    } else if(viewParams.lineType == "None") {
        d3.selectAll(".bar_" + selectedPlot.plotId).style("stroke", "none").style("shape-rendering", "crispEdges")
    }

    var xLabel = svg.append("text")
            .attr("id", "xLabel_Plot" + id)
            .attr("x", width / 2)
            .attr("y", "25")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(0," + height + ")")
            .attr("style", "font: 11px sans-serif")
            .text(plot_info.series_name);

    svg.append("g")
            .attr("class", "y axis xAxis")
            .call(yAxis);

    var yLabel = svg.append("text")
            .attr("id", "yLabel_Plot" + id)
            .attr("y", "-62")
            .attr("x", -(height / 2))
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("style", "font: 11px sans-serif")
            .text(viewParams.yLabel);

    svg.append("g")
            .attr("class", "y axis xAxis")
            .call(yAxis2).selectAll("text").remove();

    svg.append("g")
            .attr("class", "y axis xAxis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxisRight).selectAll("text").remove();

    svg.append("g")
            .attr("class", "y axis xAxis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxisRight2).selectAll("text").remove();

    svg.call(tip);

    var legendRectSize = 8;
    var legendRectWidth = 32;
    var legendSpacing = 4;
    var color = d3.scale.category20b();

    var legend = svg
            .selectAll('.legend')
            .data([plot_info.series_name])
            .enter()
            .append('g')
            .style("background-color", 'red')
            .attr('id', 'legendSize_Plot' + id)
            .attr('class', 'info legend leaflet-control legend_Plot' + id)

    var backgrounRect = legend
            .append("rect")
            .attr("id", "legendBackground_Plot" + id)
            .attr('fill', "white")
            .attr('rx', "5")
            .attr("transform", "translate(-5, -5)");

    legend.append('rect')
            .attr("id", "legendColor_Plot" + id)
            .attr("class", "legendHist")
            .attr('width', legendRectWidth)
            .attr('height', legendRectSize)
            .style('fill', viewParams.fillColor)

    var textRect = legend
            .append('text')
            .attr("id", "legendText_Plot" + id)
            .attr("class", "legendText")
            .attr('x', legendRectWidth + legendSpacing)
            .attr('y', legendRectSize)
            .text(function(d) { return d; });

    var totalWidth =
            document.getElementById("legendText_Plot" + id).getBoundingClientRect().width +
            document.getElementById("legendColor_Plot" + id).getBoundingClientRect().width;

    backgrounRect
            .attr('width', (totalWidth + legendSpacing*4)+ "px")
            .attr('height', "20px")

    setLegendPosition(viewParams.legendPosition, "Plot" + id, width, height);

    if(changed != undefined){
        lastTransformation.translate = -(width * lastTransformation.scale - width + lastTransformation.translate);
    }

    zoom.translate([lastTransformation.translate , 0]);
    zoom.scale(lastTransformation.scale);
    doZoom(lastTransformation.translate, lastTransformation.scale);



    function zoomed() {
        doZoom(d3.event.translate[0], d3.event.scale);
    }


    function doZoom(translate, scale) {

        var transform = "translate(" + translate  +",0)scale(" +  scale + ",1)";
        bars.attr("transform", transform);
        svg.select(".x.axis").call(xAxis);
        svg.select(".x2").call(xAxis2).selectAll("text").remove();
        svg.select(".xTop .axis").call(xAxisTop);
        svg.select(".x2Top").call(xAxisTop2).selectAll("text").remove();
        lastTransformation.translate = translate;
        lastTransformation.scale = scale;
    }

    d3.select(".resetViewHistogram_" + id).on("click", resetViewHistogram);

    function resetViewHistogram(id) {
        zoom.translate([0, 0]);
        zoom.scale(1);
        doZoom(0, 1);
    }
}


function clearHistogram(id) {
    d3.select("#svg_Plot" + id).remove();
    // TODO: what is "paras"?
    var paras = document.getElementsByClassName('d3-tip_' + id);

    while(paras[0]) {
        paras[0].parentNode.removeChild(paras[0]);
    }
}


// TODO: eliminate rubber-stamp parameter (visualParameters)
function getVisualizationParametersHistogram(visualParameters) {

    var res = {
        binsize: visualParameters.binsize,
        cumulative: visualParameters.cumulative,
        fillColor: visualParameters.fillColor,
        geometry: visualParameters.geometry,
        lineColor: visualParameters.lineColor,
        lineSize: visualParameters.lineSize,
        lineType: visualParameters.lineType,
        max: visualParameters.max,
        min: visualParameters.min,
        nbins: visualParameters.nbins,
        normalization: visualParameters.normalization,
        plotHeight: visualParameters.plotHeight,
        plotName: visualParameters.plotName,
        plotWidth: visualParameters.plotWidth,
        xFlip: visualParameters.xFlip,
        xLabel: visualParameters.xLabel,
        yFlip: visualParameters.yFlip,
        yLabel: visualParameters.yLabel,
        legendShow: true,
        legendOpacity: true,
        min: visualParameters.min,
        max: visualParameters.max,
        legendPosition: (visualParameters.legendPosition == undefined) ? "topleft" : visualParameters.legendPosition,
        linkedViewsX: visualParameters.linkedViewsX
    };

    return res;
}


// TODO: eliminate rubber-stamp parameter (plot)
function serverLinkedViewPointSelectionHistogram(plot) {
    var query = server + "/point-selection";

    $.ajax({
            type: "GET",
            url: query,
            data: {
                "action": "consult",
                "dataset": plot.plot_info.dataset,
                "vis-id": plot.viewName[0]
            },
            async: false
        })
        .done(function(data) {
            highlightBin(plot, JSON.parse(data).x);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })
}

function highlightBin(plot, x){
    var id  = findBin(plot.data, x);
    var allBars = d3.selectAll(".bar_" + plot.plotId).style("fill", plot.parameters.fillColor);
    if(id != null){
        var bar = allBars.filter("#bar_" + id);
        var fillColor = bar.style("fill").replace(/[^\d,]/g, '').split(',');
        var complementColor = $c.complement(fillColor[0], fillColor[1], fillColor[2]);
        bar.style("fill", "rgb(" + complementColor.R + "," + complementColor.G + "," + complementColor.B + ")");
        plot.parameters.linkedViewsX = x;
    }
}

function findBin(data, value){
    for (d in data){
        if(data[d].start <= value && data[d].end >= value){
            return d;
        }
    }
    return null;
}