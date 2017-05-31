/*
    2-D plot visualization client for ObjectServer

    Author Helder Savietto (helder.savietto@forkresearch.co)
    Author Tiago Fernandes (tmf@ca3-uninova.org)
    Date: 29/fev/2016
*/
(function(window, document, undefined) {
    var oldPlotlet = window.Plotlet,
        Plotlet = {};

    Plotlet.version = "0.0.1";

    // define Leaflet for Node module pattern loaders, including Browserify
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = L;
    }
    // define Leaflet as an AMD module
    else if (typeof define === "function" && define.amd) {
        define(L);
    }

    Plotlet.noConflict = function() {
        window.Plotlet = oldPlotlet;
        return this;
    };

    Plotlet.axiSize = {
        xAxisHeight: 40,
        yAxisWidth: 60
    };

    Plotlet.axesOffset = {
        left : { x: 0, y: 0 },
        right : { x: 0, y: 0 },
        top : { x: 0, y: 0 },
        bottom : { x: 0, y: 6 }
    };

    Plotlet.crosshairUrl = 'js/plotlet/images/Crosshair1.png';
    
    window.Plotlet = Plotlet;

    astrojs.importPackages( ['dates', 'coords']);


    function addAttribute(element, attributeName, attributeValue) {
        currentValue = element.attr(attributeName);

        if (currentValue == null) {
            currentValue = "";
        } else {
            currentValue += ";";
        }

        currentValue += attributeValue;
        element.attr(attributeName, currentValue);
    }


    function getValueOrDefault(dictionary, key, defaultValue) {
        if (key in dictionary && dictionary[key] !== undefined) {
            return dictionary[key];
        } else {
            return defaultValue;
        }
    }


    function requestVisualizationDimensionsFromServer(server, visualizationId, aspectRatio) {
        var result = [];
        var dimensionsQuery = server + "/visualization-plot-info";

        for (var id in visualizationId) {
            $.ajax({
                url: dimensionsQuery,
                data: {
                    "vis-id": visualizationId[id],
                    "ratio": aspectRatio
                },
                async: false
            })
            .done(function(data) {
                result.push({
                    success: true,
                    minX: data.min.x,
                    minY: data.min.y,
                    maxX: data.max.x,
                    maxY: data.max.y,
                    xName: data.names.x,
                    yName: data.names.y,
                    plotName: data.names.plot,
                    dataset: data.names.dataset
                });
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                result.push({
                    success: false
                });
                alert("Unable to retrieve visualization info")
            })
        }

        return result;
    }


    // TODO: eliminate rubber-stamp parameter (visualParameters)
    function getVisualizationParameters(visualParameters, visualizationDimensions) {
        var aspectRatio = getValueOrDefault(visualParameters, "aspectRatio", visualizationDimensions.aspectRatio);
        var plotNameLabel = getValueOrDefault(visualParameters, "plotName", visualizationDimensions.plotName);
        var xAxisLabel = getValueOrDefault(visualParameters, "xLabel", visualizationDimensions.xName);
        var yAxisLabel = getValueOrDefault(visualParameters, "yLabel", visualizationDimensions.yName);
        var xFlip = getValueOrDefault(visualParameters, "xFlip", false);
        var yFlip = getValueOrDefault(visualParameters, "yFlip", false);
        var width = getValueOrDefault(visualParameters, "plotWidth", 512);
        var height = getValueOrDefault(visualParameters, "plotHeight", 512);
        var yAxisWidth = Plotlet.axiSize.yAxisWidth;
        var xAxisHeight = Plotlet.axiSize.xAxisHeight;
        var initialZoom = getValueOrDefault(visualParameters, "initialZoom", 1);
        var minimumZoom = getValueOrDefault(visualParameters, "minimumZoom", 1);
        var maximumZoom = getValueOrDefault(visualParameters, "maximumZoom", 20);
        var initialX = getValueOrDefault(visualParameters, "initialX", (visualizationDimensions.minX + visualizationDimensions.maxX) / 2.0);
        var initialY = getValueOrDefault(visualParameters, "initialY", (visualizationDimensions.minY + visualizationDimensions.maxY) / 2.0);
        var continuous = getValueOrDefault(visualParameters, "continuous", false);
        var aspect = getValueOrDefault(visualParameters, "aspect", "Wide");
        var totalWidth = yAxisWidth * 2 + width ;
        var totalHeight = xAxisHeight * 2 + height;
        var margin = 2;
        var ticksInsideMargin = 4;
        var legendOpacity = getValueOrDefault(visualParameters, "legendOpacity", true);
        var legendPosition = getValueOrDefault(visualParameters, "legendPosition", "bottomright");
        var defaultRatio = getValueOrDefault(visualParameters, "defaultRatio", visualizationDimensions.defaultRatio);
        var coordSys = visualParameters["coordSys"];
        var glyph = getValueOrDefault(visualParameters, "glyph", "CIRCLE");
        var size = getValueOrDefault(visualParameters, "size", "3");
        var colour = getValueOrDefault(visualParameters, "colour", "603c3cc1");
        var backgroundColor = getValueOrDefault(visualParameters, "backgroundColor", "ffffffff");
        var wrapping = visualParameters["wrapping"];
        var gaiaDataSource = getValueOrDefault(visualParameters, "gaiaDataSource", "gaiadr1.gaia_source");

        var res = {
            aspectRatio: aspectRatio,
            aspect: aspect,
            plotNameLabel: plotNameLabel,
            xAxisLabel: xAxisLabel,
            yAxisLabel: yAxisLabel,
            xFlip: xFlip,
            yFlip: yFlip,
            width: width - margin,
            height: height - 12,
            yAxisWidth: yAxisWidth,
            xAxisHeight: xAxisHeight,
            initialZoom: initialZoom,
            minimumZoom: minimumZoom,
            maximumZoom: maximumZoom,
            initialX: initialX,
            initialY: initialY,
            continuous: continuous,
            totalWidth: totalWidth - margin,
            totalHeight: totalHeight - 12,
            margin: margin,
            ticksInsideMargin : ticksInsideMargin,
            legendOpacity: legendOpacity,
            legendPosition: legendPosition,
            defaultRatio: defaultRatio,
            coordSys: coordSys,
            glyph: glyph,
            size: size,
            colour: colour,
            backgroundColor: backgroundColor,
            wrapping: wrapping,
            gaiaDataSource: gaiaDataSource
        };
        return res;
    }


    function addDivs(divId, visualizationADQL, subset) {
        var mainDiv = d3.select("#" + divId);
       /* var graphDiv;
        var res = {
            mainDiv: mainDiv,
            optsDiv: createOptionsDiv(divId, mainDiv, visualizationADQL, subset),
            graphDiv: graphDiv = mainDiv.append("div").attr("id", "graph_" + divId).attr("class", "graph"),
            topDiv: graphDiv.append("div").attr("id", "top_" + divId).attr("class", "top"),
            plotDiv: graphDiv.append("div").attr("id", "plot_" + divId).attr("class", "plot"),
            xAxisDivT: graphDiv.append("div").attr("id", "xAxisT_" + divId).attr("class", "axisDiv xAxis"),
            yAxisDiv: graphDiv.append("div").attr("id", "yAxis_" + divId).attr("class", "axisDiv yAxis yAxisLeft"),
            yAxisDivR: graphDiv.append("div").attr("id", "yAxisR_" + divId).attr("class", "axisDiv yAxis yAxisRight"),
            xAxisDiv: graphDiv.append("div").attr("id", "xAxis_" + divId).attr("class", "axisDiv xAxis")
        };*/

        var res = {
            mainDiv: mainDiv,
            optsDiv: createOptionsDiv(divId, mainDiv, visualizationADQL, subset),
            topDiv: mainDiv.append("div").attr("id", "top_" + divId).attr("class", "top"),
            plotDiv: mainDiv.append("div").attr("id", "plot_" + divId).attr("class", "plot"),
            xAxisDivT: mainDiv.append("div").attr("id", "xAxisT_" + divId).attr("class", "axisDiv xAxis"),
            yAxisDiv: mainDiv.append("div").attr("id", "yAxis_" + divId).attr("class", "axisDiv yAxis yAxisLeft"),
            yAxisDivR: mainDiv.append("div").attr("id", "yAxisR_" + divId).attr("class", "axisDiv yAxis yAxisRight"),
            xAxisDiv: mainDiv.append("div").attr("id", "xAxis_" + divId).attr("class", "axisDiv xAxis")
        };

        return res;
    }


    function createOptionsDiv(divId, mainDiv, visualizationADQL, subset) {
        var optsDiv = mainDiv
                .append("div")
                .attr("id", "opts_" + divId)
                .attr("class", "optsDiv")
                .attr("valign", "top center")

        //Options Button
        optsDiv.append("Button")
                .attr("type", "button")
                .attr("class", "btn btn-default btn-md pull-left optsButton")
                .attr("aria-label", "Plot Options")
                .attr("OnClick", "chooseModal(" + divId + ", 'plot')")
                .append("Span")
                .attr("Class", "glyphicon glyphicon-cog")
                .attr("aria-hidden", "true");

        //Options Button
        var regions = optsDiv
                .append("div")
                .attr("class", "dropdown pull-left regionsButton");

        var regionsButton = regions.append("Button")
                .attr("class", "btn btn-default optsButton dropdown-toggle")
                .attr("type", "button")
                .attr("data-toggle", "dropdown")
                .text("Regions");

        regionsButton.append("span")
                .attr("class", "caret");

        var dropMenu = regions.append("ul").attr("class", "dropdown-menu");

        dropMenu.append("li")
                .append("a")
                .attr("id", "drawPolygon_" + divId)
                .attr("class", "menu_draw")
                .attr("href", "javascript:void(0)")
                .text("Polygon");

        dropMenu.append("li")
                .append("a")
                .attr("id", "drawRectangle_" + divId)
                .attr("class", "menu_draw")
                .attr("href", "javascript:void(0)")
                .text("Rectangle");

        /*dropMenu.append("li")
                .append("a")
                .attr("id", "drawCircle_" + divId)
                .attr("class", "menu_draw")
                .attr("href", "javascript:void(0)")
                .text("Circle");

        dropMenu.append("li")
                .append("a")
                .attr("id", "drawPoint_" + divId)
                .attr("class", "menu_draw")
                .attr("href", "javascript:void(0)")
                .text("Point");*/

        var editMenu = dropMenu
                .append("li")
                .append("a")
                .attr("id", "edit_" + divId)
                .attr("class", "menu_draw editMenuArea")
                .attr("href", "javascript:void(0)")

        editMenu.append("Span")
                .attr("id", "checkMark_" + divId)
                .attr("Class", "glyphicon glyphicon-ok checkMark")

        $("#checkMark_" + divId)
                .after($("<text>Edit Region</text>")
                .attr("class", "menu_draw editMenu"));

        dropMenu.append("li")
                .append("a")
                .attr("id", "save_" + divId)
                .attr("class", "menu_draw")
                .attr("href", "javascript:void(0)")
                .text("Save Regions");

        var liDrop = dropMenu.append("li");

        liDrop.append("a").append("label")
                .attr("for", "load_" + divId)
                .attr("class", "custom-file-upload")
                .text("Load Regions");

        liDrop.append("input")
                .attr("id", "load_" + divId)
                .attr("name", "files[]")
                .attr("type", "file");

        if (visualizationADQL != undefined) {
            //ADQL Button
            var adqlButton = dropMenu
                    .append("li")
                    .attr("class", "menu_draw")
                    .attr("OnClick", "requestADQLQuery(" + divId + ")")
                    .append("a").attr("href", "javascript:void(0)").text("ADQL");
        }

        if(subset) {
            dropMenu.append("li")
                    .append("a")
                    .attr("id", "createSelection_" + divId)
                    .attr("class", "menu_draw")
                    .attr("href", "javascript:void(0)")
                    .attr("OnClick", "createSelection(" + divId + ")")
                    .text("Convert to subset")
        }

        return optsDiv;
    }


    function createPlotProjection(viewDims, xFlip, yFlip) {
        var deltaX = viewDims.maxX - viewDims.minX;
        var deltaY = viewDims.maxY - viewDims.minY;

        var transform = new L.Transformation(
            (1 / deltaX) * (xFlip ? -1 : 1),
            xFlip ? (viewDims.maxX / deltaX) : -(viewDims.minX / deltaX), (1 / deltaY) * (yFlip ? 1 : -1),
            yFlip ? -(viewDims.minY / deltaY) : (viewDims.maxY / deltaY));

        var scatterCrs = L.extend({}, L.CRS, {
            projection: L.Projection.LonLat,
            transformation: transform,

            scale: function(zoom) {
                return 256 * Math.pow(2, zoom);
            }
        });

        return scatterCrs;
    }

    // TODO: eliminate rubber-stamp parameter (viewParams)
    function createLeafletComponent(divId, tilePattern, viewParams, scatterCrs, datasource) {
        var map = L.map("plot_" + divId, {
            zoomControl: true
        });

        $(".leaflet-control-container").each(function(index) {
            var newPosition = $("<div></div>")
                    .attr("class", "leaflet-center leaflet-top leaflet-left").appendTo($(this))
            $(this).children().first().children().appendTo(newPosition);

        });

        var tileLayer = addTileLayer(
                tilePattern, map, 0, viewParams.continuous, viewParams.minimumZoom, viewParams.maximumZoom);

        L.crosshairs({
            style: {
                opacity: 0.4,
                fillOpacity: 0,
                weight: 2,
                color: '#333',
                radius: 20
            }
        }).addTo(map);

        var legend = L.control({
            position: (viewParams.legendPosition == "none") ? "bottomright" : viewParams.legendPosition
        });

        legend.onAdd = function (map) {
            var div = null;

            if(viewParams.legendPosition == "none") {
                $(".legend_" + divId).remove();
                div = L.DomUtil.create('div', 'legend legend_' + divId)
            } else{
                $(".legend_" + divId).remove();
                this.options.position = viewParams.legendPosition;
                var grades = [], labels = [];
                var i =0;
                div = L.DomUtil.create('div', 'info legend legend_' + divId);

                for(layer in datasource) {
                    if(datasource[layer].check){
                        grades.push(datasource[layer].name)
                        var rgb = datasource[layer].attributes.color.substring(2);
                        var alpha = parseInt(datasource[layer].attributes.color.substring(0, 2), 16) / 255;
                        var color = "rgba("+hexToRgb(rgb)+", " + alpha + ")";

                        div.innerHTML += '<i class="' +
                                            datasource[layer].attributes.shape +
                                            '" style="background:' + color + '"></i> ' +
                                            '<text>' + grades[i] + '</text>' + '<br>';
                        i++;
                    }
                }
            }
            return div;
        };

        legend.addTo(map);

        if(viewParams.legendOpacity) {
            $(".legend_" + divId).css("background", "white");
        } else {
            $(".legend_" + divId).css("background", "none");
        }


        map.options.crs = scatterCrs[0];
        map.setView([viewParams.initialY, viewParams.initialX], viewParams.initialZoom, true);

        return {
            map: map,
            tileLayer: tileLayer,
            legend: legend
        };
    }


    function addTileLayer(tilePattern, map, nLayers, continuous, minimumZoom, maximumZoom) {
        var tileLayer;
        var tileLayers = [];

        for(tp in tilePattern) {
            var indexTotal = (+nLayers + +tp);
            tileLayer = L.tileLayer(tilePattern[tp], {
                continuousWorld: !continuous,
                noWrap: !continuous,
                maxZoom: maximumZoom,
                minZoom: minimumZoom,
                zIndex: indexTotal
            });

            var layer = tileLayer.addTo(map);
            tileLayers["Layer" + indexTotal] = tileLayer;
        }

        return tileLayers;
    }


    Plotlet.changeLayerDisplay = function(tile, map, option) {
        if(option) {
            map.addLayer(tile);
        } else{
            map.removeLayer(tile);
        }
    }


    Plotlet.resetView = function(divId) {
        var viewParams = plots[divId].Parameters;
        plots[divId].leafletMainComponent.leafletComponent.map.setView(
                [viewParams.initialY, viewParams.initialX], viewParams.initialZoom, true);
    }


    Plotlet.updateTileLayer = function(
            divId, leafletComponent, newTilePattern, viewDims, server, visualizationId, layerId, aspectRatio,
            xFlip, yFlip, width, height, totalWidth, xAxisHeight, yAxisWidth, ticksInsideMargin, plotNameLabel,
            xAxisLabel, yAxisLabel) {

        var viewDims = requestVisualizationDimensionsFromServer(server, visualizationId, aspectRatio);
        var center = leafletComponent.map.getCenter();
        leafletComponent.map.options.crs = createPlotProjection(viewDims[0], xFlip, yFlip);
        Plotlet.updateAxis(
                divId, leafletComponent, width, height, totalWidth, xAxisHeight, yAxisWidth, ticksInsideMargin,
                plotNameLabel, xAxisLabel, yAxisLabel);
        leafletComponent.tileLayer[layerId].setUrl(newTilePattern);

        for (var region in plots[divId].selectionRegion) {
            for(groupRegion in plots[divId].selectionRegion[region].region){
            plots[divId].selectionRegion[region].removeLayer(plots[divId].selectionRegion[region].region[groupRegion]);
            plots[divId].selectionRegion[region].addLayer(plots[divId].selectionRegion[region].region[groupRegion]);
            }
        }


        leafletComponent.map.panTo(center);
        serverLinkedViewPointSelection(plots[divId]);
    }


    Plotlet.createTilePattern = function(server, visualizationId, aspectRatio, xFlip, yFlip, color, size, shape) {
        var pattern =
                server + "/scatterplot-tile?vis-id=" + escape(visualizationId) + "&x={x}&y={y}&z={z}&ratio=" +
                aspectRatio + "&xflip=" + xFlip + "&yflip=" + yFlip + "&color=" + color + "&pointSize=" + size +
                "&pointShape=" + shape + "";
        return pattern;
    }


    // TODO: check why this variable declaration is here
    // TODO: eliminate global variables
    var editingObject = false;


    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';

        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }


    function setGeometryComponent(map, selectionJSON, divId) {
        var featureGroup = L.featureGroup().addTo(map);
        var polygonDrawer;
        var label;

        $('#drawPolygon_' + divId).click(function() {
             disableAllRegions();
             polygonDrawer = new L.Draw.Polygon(map, {shapeOptions: { color: getRandomColor(), weight: 4, opacity: 0.5}});
             polygonDrawer.enable();

             if(label == null) {
                 label = new L.Label();
                 var x = plots[divId].leafletMainComponent.leafletComponent.map;
                 label.setContent("Click in one point to start to draw a polygon");
                 label.setLatLng(x.getCenter());
                 x.showLabel(label);
             }

             plots[divId].leafletMainComponent.leafletComponent.tileLayer["Layer0"].setOpacity(0.3);
        });

        $('#drawRectangle_' + divId).click(function() {
            if(label == null) {
                label = new L.Label();
                label.setContent("Click and drag to draw a rectangle");
                var x = plots[divId].leafletMainComponent.leafletComponent.map;
                label.setLatLng(x.getCenter());
                x.showLabel(label);
            }

            disableAllRegions();
            polygonDrawer = new L.Draw.Rectangle(map, {shapeOptions: { color: getRandomColor(), weight: 4, opacity: 0.5}});
            polygonDrawer.enable();
            plots[divId].leafletMainComponent.leafletComponent.tileLayer["Layer0"].setOpacity(0.3);
        });


        $('#drawCircle_' + divId).click(function() {
             disableAllRegions();
             polygonDrawer = new L.Draw.Circle(map, {shapeOptions: { color: getRandomColor(), weight: 4, opacity: 0.5}});
             polygonDrawer.enable();

             if(label == null) {
                 label = new L.Label();
                 var x = plots[divId].leafletMainComponent.leafletComponent.map;
                 label.setContent("Click in one point to start to draw a polygon");
                 label.setLatLng(x.getCenter());
                 x.showLabel(label);
             }

             plots[divId].leafletMainComponent.leafletComponent.tileLayer["Layer0"].setOpacity(0.3);
        });


        $('#drawPoint_' + divId).click(function() {
            if(label == null) {
                label = new L.Label();
                label.setContent("Click and drag to draw a point");
                var x = plots[divId].leafletMainComponent.leafletComponent.map;
                label.setLatLng(x.getCenter());
                x.showLabel(label);
            }

            disableAllRegions();
            //polygonDrawer = new L.Draw.Rectangle(map, {shapeOptions: { color: getRandomColor(), weight: 4, opacity: 0.5}});

                    var crosshair = L.divIcon({
                                        iconSize: new L.Point(50, 50),
                                        html: 'foo bar'
                    });


            polygonDrawer = new L.Draw.Marker(map, {icon: crosshair});
            polygonDrawer.enable();
            plots[divId].leafletMainComponent.leafletComponent.tileLayer["Layer0"].setOpacity(0.3);
        });


        $('#edit_' + divId).click(function() {
            var regions = plots[divId].selectionRegion;

            if(!$('#edit_' + divId).hasClass("isClicked") && regions.length!=0) {
                for (var index in regions) {
                    var p = regions[index];
                    var polygonEdit = new L.EditToolbar.Edit(map, {featureGroup: p});
                    polygonEdit.enable();
                    p.polygonEdit = polygonEdit;
                }

                $('#edit_' + divId).addClass("isClicked");
                $('#checkMark_' + divId).addClass("isClicked");
             } else if($('#edit_' + divId).hasClass("isClicked") && regions.length!=0) {
                for (var index in regions) {
                    var p = regions[index];
                    p.polygonEdit.disable();
                }

                $('#edit_' + divId).removeClass("isClicked");
                $('#checkMark_' + divId).removeClass("isClicked");
             }
        });

        $('#save_' + divId).click(function() {
            disableAllRegions();
            var regionJson = [];

            for (var region in plots[divId].selectionRegion) {
                if(plots[divId].selectionRegion[region].show){
                    for(groupRegion in plots[divId].selectionRegion[region].region){
                        var geometry = plots[divId].selectionRegion[region].region[groupRegion].toGeoJSON().geometry;
                        var coordinatesJson = [];
                        var geometryCoordinates = geometry.coordinates[0];

                        if(geometry.type == "Point") {
                            var name = plots[divId].selectionRegion[region].region[groupRegion].toGeoJSON().properties.name;
                            coordinatesJson.push({
                                "lat": geometry.coordinates[0],
                                "lon": geometry.coordinates[1],
                                "name": name
                            });
                        }
                        else {
                            for(var point in geometryCoordinates) {
                                var coordinate = geometryCoordinates[point][0] +"," + geometryCoordinates[point][1];
                                coordinatesJson.push({
                                    "lat": geometryCoordinates[point][0],
                                    "lon": geometryCoordinates[point][1]
                                });
                            }

                        }

                        regionJson.push({
                            "color": plots[divId].selectionRegion[region].region[0].options.color,
                            "coordinates": coordinatesJson
                        });
                    }
                }
             }
             ServerRegionsFile("download", plots[divId].Parameters.coordSys, regionJson);
        });

        $('#load_' + divId).change(function() {
            disableAllRegions();
            var file = this.files[0];
            var geoJsonFile = {"type": "FeatureCollection", "features": [] };
            var textArray = [];
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");

                reader.onload = function (evt) {
                    var fileLine = evt.target.result.split('\n');
                    var coordSys = getCoordinateSystem(fileLine);

                    if(plots[divId].Parameters.coordSys != coordSys){
                        alert("The loaded file it is in a different coordinates system, which can cause convention artifacts in regions");
                    }

                    if(coordSys!=null){
                        for (var line  in fileLine) {
                            var commentCheck = fileLine[line].charAt( 0 ) == '#';
                            if(!commentCheck && fileLine[line] != "") {
                                var coordinatesArray = [];
                                var coordinates = fileLine[line].substring(
                                        fileLine[line].lastIndexOf("(") + 1,
                                        fileLine[line].lastIndexOf(")")).split(", ");

                                var form = fileLine[line].split("(")[0];

                               if(plots[divId].Parameters.coordSys != coordSys){
                                  var coordsIndex = 0;
                                  for(coordsIndex = 0; coordsIndex< coordinates.length; coordsIndex += 2){
                                     if(coordSys == "ICRS"){
                                          var coordinateICRS = astrojs.coords.equatorial2galactic(coordinates[coordsIndex], coordinates[coordsIndex + 1]);
                                          coordinates[coordsIndex] = coordinateICRS.l;
                                          coordinates[coordsIndex+1] = coordinateICRS.b;
                                     }
                                     else if(coordSys == "galactic"){
                                           var coordinateICRS = astrojs.coords.galactic2equatorial(coordinates[coordsIndex], coordinates[coordsIndex + 1]);
                                           coordinates[coordsIndex] = coordinateICRS.ra;
                                           coordinates[coordsIndex+1] = coordinateICRS.dec;
                                     }
                                  }
                               }

                               if((form == "point" || form=="text") && "wrapping" in plots[divId].Parameters) {
                                     var wrappingCoordinates = fromWindowToDataWrapping(plots[divId].Parameters["wrapping"], coordinates[0], coordinates[1]);
                                     coordinates[0] = wrappingCoordinates["x"];
                                     coordinates[1] = wrappingCoordinates["y"];
                                 }

                                var color =  fileLine[line].substr(fileLine[line].indexOf("=") + 1);

                                if(color == fileLine[line]) {
                                    color = "#00ff00";
                                }

                               if(form=="text") {
                                   var name = coordinates[2].replace(/['"]+/g, '');

                                   var geojson = JSON.parse(
                                           '{"type":"Feature","properties":{"name":"' + name+ '"},"geometry":{"type":"Point","coordinates":' +
                                            JSON.stringify([coordinates[0], coordinates[1]]) + '}}');
                                   geoJsonFile.features.push(geojson);
                               }
                               else{
                                   for(var c = 0; c < coordinates.length; c += 2) {
                                       coordinatesArray.push([parseFloat(coordinates[c]), parseFloat(coordinates[c+1])]);
                                   }
                                   var geojson = JSON.parse(
                                           '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":' +
                                            JSON.stringify([coordinatesArray]) + '}}');
                                   geoJsonFile.features.push(geojson);
                               }
                            }
                        }

                        if(geoJsonFile.features.length>0){
                            var feature = L.geoJson(geoJsonFile, {
                                            style: {"color": color},
                                            pointToLayer: function(feature, latlng) {
                                                     var myIcon = L.divIcon({
                                                            iconSize: new L.Point(50, 50),
                                                            className: "divicon",
                                                            html: '<text class="divicon_' +
                                                                    plots[divId].selectionRegion.length +
                                                                    '" style="color:'+ color+ '">'+
                                                                    feature.properties.name + '</text>'
                                                    });

                                                    return new L.marker(latlng, {icon: myIcon, "color": color});
                                            }
                            }).addTo(map);
                            selectionJSON.val.push(geoJsonFile);
                            addRegions(divId, feature, feature.getLayers(), null);
                        }
                    }
                }

                reader.onerror = function (evt) {
                    document.getElementById("load_" + divId).innerHTML = "error reading file";
                }
            }
            
            $('#load_' + divId).val("");
        });

        function getCoordinateSystem(fileLine){
            var fileIndex = 0;

            while(fileLine.length > fileIndex){
                if(fileLine[fileIndex].charAt( 0 ) == '#') {
                    fileLine.splice(fileIndex, 1);
                }
                else if(fileLine[fileIndex].indexOf("ICRS") > -1){
                    fileLine.splice(fileIndex, 1);
                    return "ICRS";
                }
                else if(fileLine[fileIndex].indexOf("galactic") > -1){
                    fileLine.splice(fileIndex, 1);
                    return "galactic"
                }
                else if(fileLine[fileIndex].indexOf("ecliptic") > -1){
                    fileLine.splice(fileIndex, 1);
                    return "ecliptic"
                }
                else{
                    fileIndex ++;
                }
            }

            return null;
        }

        function convertToDegrees(coordinates){
            var separation = isHms(coordinates[0] + "" + coordinates[1]);

            if(separation != null){
                var coordsIndex;

                for(coordsIndex = 0; coordsIndex< coordinates.length; coordsIndex += 2){
                    var hmsLng = coordinates[coordsIndex].split(separation);
                    var hmsLat = coordinates[coordsIndex+1].split(separation);

                    coordinates[coordsIndex+1] = convertDMSToDD(hmsLat[0], hmsLat[1], hmsLat[2], "lat");
                    coordinates[coordsIndex] = convertDMSToDD(hmsLng[0], hmsLng[1], hmsLng[2], "lng");
                }
            }

        }


        function isHms(text){
            var coordinates = text.split(" ");
            var separation = null;

            if(coordinates.length == 2){
                coordinates = coordinates[0].split(":").concat(coordinates[1].split(":"));
                separation = ":";
            }

            if(coordinates.length == 6){
                for(coord in coordinates){
                    if(isNaN(coordinates[coord])){
                        return null;
                    }
                }

                if(separation==null){
                    separation = " ";
                }

                return separation;
            }
            else{
                return null;
            }
        }

        function convertDMSToDD(degrees, minutes, seconds, coordinate) {
            var dd = parseInt(degrees) + parseInt(minutes)/60 + parseInt(seconds)/(60*60);
            if(coordinate == "lng"){
               dd = dd*15;
            }
            return dd;
        }

        map.doubleClickZoom.disable();

        map.on('click', clickedOnMap);
        map.on('mousedown', preClickOnMap);

        map.on('draw:created', showPolygonArea);
        map.on('draw:edited', showPolygonAreaEdited);
        map.on('draw:deleted', objectDeleted);

        map.on('draw:drawstart', editingObject);
        map.on('draw:drawstop', endedEditingObject);

        map.on('draw:editstart', editingObject);
        map.on('draw:editstop', endedEditingObject);

        map.on('draw:deletestart', editingObject);
        map.on('draw:deletestop', endedEditingObject);

        editingObject = false;


        function disableAllRegions() {
            if($('#edit_' + divId).hasClass("isClicked")) {
                var regions = plots[divId].selectionRegion;

                for (var index in regions) {
                    var p = regions[index];
                    p.polygonEdit.disable();
                }

                $('#edit_' + divId).removeClass("isClicked");
                $('#checkMark_' + divId).removeClass("isClicked");
             }

             if(polygonDrawer != null) {
                polygonDrawer.disable();
            }
        }


        function showPolygonAreaEdited(e) {
            e.layers.eachLayer(function(layer) {
                showPolygonArea({
                    layer: layer
                });
            });
        }


        function showPolygonArea(e) {
            var featureGroupNew = L.featureGroup().addTo(map);
            addRegions(divId, featureGroupNew, [e.layer], polygonDrawer);
            featureGroupNew.addLayer(e.layer);
            selectionJSON.val.push(JSON.stringify(e.layer.toGeoJSON()));
            endedEditingObject(e);
        }


        function objectDeleted(e) {
            selectionJSON.val = "";
            endedEditingObject(e);
        }


        function editingObject(e) {
            editingObject = true;
        }


        function endedEditingObject(e) {
            editingObject = false;
        }


        function clickedOnMap(e) {
            if (editingObject) {
                $(".leaflet-div-icon" ).first().css("background", "#DC2121");
                return;
            }

            var plotId = map._container.id.substring(5);
            ServerPointSelection(plots[plotId], e.latlng);
        }


        function preClickOnMap(e) {
            plots[divId].leafletMainComponent.leafletComponent.tileLayer["Layer0"].setOpacity(1);

            if(label != null) {
                plots[divId].leafletMainComponent.leafletComponent.map.removeLayer(label);
                label = null;
            }
        }
    }


    function addRegions(divId, featureGroup, region, polygonDrawer) {
        featureGroup.show = true;
        featureGroup.region = region;
        featureGroup.polygonDrawer = polygonDrawer;
        plots[divId].selectionRegion.push(featureGroup);
    }


    Plotlet.changeRegionDisplay = function(featureGroup) {
        for(region in featureGroup.region){
            if(featureGroup.show) {
                featureGroup.addLayer(featureGroup.region[region]);
            } else {
                featureGroup.removeLayer(featureGroup.region[region]);
            }
        }
    }


    Plotlet.removeRegion = function(featureGroup, index) {
        for(region in featureGroup[index].region){
            featureGroup[index].removeLayer(featureGroup[index].region[region]);
        }
        delete featureGroup[index];
    }


    Plotlet.changeColorRegion = function(featureGroup, index, color) {
        featureGroup[index].setStyle({color: color});
        $(".divicon_" + index).css("color", color);
        featureGroup[index].region[0].options.color = color;
    }


    function createPointSelection(plotId, leafletMainComponent) {
        var crosshair = L.icon({
            iconUrl: Plotlet.crosshairUrl,
            iconSize: [32, 32], // size of the icon
            iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
            popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
        });

        var marker = new L.marker([0, 0], {
            id: plotId,
            icon: crosshair
        });

        leafletMainComponent.selectionMarker = marker;
    }


    Plotlet.clearPointSelection = function(plotAttributes) {
        var marker = plotAttributes.leafletMainComponent.selectionMarker;

        if (marker != undefined) {
            plotAttributes.leafletMainComponent.leafletComponent.map.removeLayer(marker);
        }
    }

    // TODO: eliminate rubber-stamp parameter (visualParameters)
    Plotlet.createScatterplot = function(
            viewId, divId, visualizationId, host, port, visualParameters, visualizationADQL, subset, download) {
        // find the server
        var server = (port == null) ? host : host + ":" + port;
        var aspectRatio = getValueOrDefault(visualParameters, "aspectRatio", 1.0);

        //add session selections
        var selections = SelectionsOnSession(visualizationId[0]);
        visualizationId = visualizationId.concat(selections);

        //Visualisation Parameters from the server.
        var viewDims = requestVisualizationDimensionsFromServer(server, visualizationId, aspectRatio);

        if (!viewDims[0].success) {
            return undefined;
        }

        var plotId = "Plot" + viewId;
        // check for visual parameters
        visualParameters = visualParameters || {};

        // obtain the parameters of the first layer
        var viewParams = getVisualizationParameters(visualParameters, viewDims[0]);

        // add the subdivs
        var divs = addDivs(divId, visualizationADQL, subset);

        // set the styles
        addAttribute(divs.topDiv, "style", "width:" + (viewParams.totalWidth -2) + "px");
        addAttribute(divs.xAxisDiv, "style", "width:" + (viewParams.totalWidth -2) + "px");
        addAttribute(divs.plotDiv, "style", "height:" + viewParams.height + "px");
        addAttribute(divs.plotDiv, "style", "width:" + viewParams.width + "px");
        addAttribute(divs.plotDiv, "style", "left:" + viewParams.yAxisWidth + "px");
        addAttribute(divs.plotDiv, "style", "top:" + viewParams.xAxisHeight + "px");

        // create projection for each layer of the plot
        var visId = [];
        var datasource = [];
        var scatterCrs = [];
        var tilePattern = [];

        var plotColorMainLayer =  viewParams.colour;
        var plotColorSubsets =  "60bf3f3f";
        var plotBackgroundColorSubsets =  viewParams.backgroundColor;

        var plotSize = viewParams.size;
        var plotShape = viewParams.glyph;

        for(dim in viewDims) {
            scatterCrs.push(createPlotProjection(viewDims[dim], viewParams.xFlip, viewParams.yFlip));
            var pattern = Plotlet.createTilePattern(
                    server, visualizationId[dim], aspectRatio, (viewParams.xFlip ? "1" : "0"),
                    (viewParams.yFlip ? "1" : "0"), (dim ==0) ? plotColorMainLayer : plotColorSubsets,
                    plotSize, plotShape);
            tilePattern.push(pattern);

            var alpha = parseInt(plotBackgroundColorSubsets.substring(0, 2), 16) / 255;
            var rgb = plotBackgroundColorSubsets.substring(2);
            var colorBackground = "rgba("+hexToRgb(rgb)+", " + alpha + ")";
            $("#plot_" + plotId).css("background-color", colorBackground);

            datasource["Layer" + dim] = {
                "check": "true",
                "id": "Layer" + dim,
                "name": (dim ==0) ? viewParams.plotNameLabel: "Subset " + dim,
                "attributes": {
                    color: (dim ==0) ? plotColorMainLayer : plotColorSubsets,
                    size: plotSize,
                    shape: plotShape,
                    backgroundColor: plotBackgroundColorSubsets
                },
                "visualizationId": visualizationId[dim]
            };

            datasource.length ++;
        }

        // create leaflet component for plot
        var leafletComponent = createLeafletComponent(divId, tilePattern, viewParams, scatterCrs, datasource);

        var leafletMainComponent = {
            leafletComponent: leafletComponent
        };

        createPointSelection(plotId, leafletMainComponent)

        var selectionJSON = {
            val: []
        };

        setGeometryComponent(leafletComponent.map, selectionJSON, divId);


        update = function() {
           Plotlet.updateAxis(
                divId, leafletComponent, viewParams.width, viewParams.height, viewParams.totalWidth,
                viewParams.xAxisHeight, viewParams.yAxisWidth, viewParams.ticksInsideMargin, viewParams.plotNameLabel,
                viewParams.xAxisLabel, viewParams.yAxisLabel);
        }

        // update the whole thing for first time
        Plotlet.updateAxis(
                divId, leafletComponent, viewParams.width, viewParams.height, viewParams.totalWidth,
                viewParams.xAxisHeight, viewParams.yAxisWidth, viewParams.ticksInsideMargin, viewParams.plotNameLabel,
                viewParams.xAxisLabel, viewParams.yAxisLabel);

        // setup map callbacks
        leafletComponent.map.on("move", update);

        var res = {
            visualizationId: visualizationId[0],
            plotId: "Plot" + viewId,
            type: "Plot",
            viewDims : viewDims,
            datasetId: viewDims[0].dataset,
            Parameters: viewParams,
            selectionJSON: selectionJSON,
            leafletMainComponent: leafletMainComponent,
            aspectRatio: aspectRatio,
            attributes: {
                color: plotColorMainLayer,
                size: plotSize,
                shape: plotShape
            },
            selectionMarker: undefined,
            selectionRegion: [],
            visualizationADQL: visualizationADQL,
            dataSource: datasource,
            download: download
        }

        serverLinkedViewPointSelection(res);
        return res;
    }


    Plotlet.addSelectionLayer = function(visualizationId, id, color) {
        //Visualisation Parameters from the server.
        var viewDims = requestVisualizationDimensionsFromServer(
                server, visualizationId, plots[id].Parameters.aspectRatio);

        if (!viewDims[0].success) {
            return undefined;
        }

        var visId = [];
        var datasource = [];
        var tilePattern = [];

        var plotAttributes = [
            {
                color: "603c3cc1",
                size: 3,
                shape: "CIRCLE"
            },
            {
                color: color,
                size: 3,
                shape: "CIRCLE"
            }
        ];

        var scatterCrs = createPlotProjection(viewDims[0], plots[id].Parameters.xFlip, plots[id].Parameters.yFlip);

        var tilePattern = Plotlet.createTilePattern(
                server, visualizationId[0], plots[id].Parameters.aspectRatio, (plots[id].Parameters.xFlip ? "1" : "0"),
                (plots[id].Parameters.yFlip ? "1" : "0"), color, plotAttributes[1].size,
                plotAttributes[1].shape);

        var nextId = plots[id].dataSource.length;
        plots[id].dataSource.length ++;

        plots[id].dataSource["Layer" + nextId] = {
            "check": "true",
            "id": "Layer" + nextId,
            "name": "Subset " + nextId,
            "attributes": plotAttributes[1],
            "visualizationId": visualizationId[0]
        };

        var tileLayer = addTileLayer(
                [tilePattern], plots[id].leafletMainComponent.leafletComponent.map, nextId,
                plots[id].Parameters.continuous, plots[id].Parameters.minimumZoom,
                plots[id].Parameters.maximumZoom);

        plots[id].leafletMainComponent.leafletComponent.tileLayer["Layer" + nextId] = tileLayer["Layer" + nextId];
        plots[id].leafletMainComponent.leafletComponent.legend.addTo(
                plots[id].leafletMainComponent.leafletComponent.map);
    }


    Plotlet.updateAxis = function (
            divId, leafletComponent, width, height, totalWidth, xAxisHeight, yAxisWidth, ticksInsideMargin,
            plotNameLabel, xAxisLabel, yAxisLabel) {
        // update attributes
        d3.select(
                "#xAxisT_" + divId).attr("style", "bottom:" + (height + Plotlet.axesOffset.top.y) + "px;"+
                "width:" + (totalWidth -2) + "px;" + " height:" + (xAxisHeight + 2) + "px");
        d3.select("#yAxis_" + divId).attr("style", "bottom:" + (height + Plotlet.axesOffset.left.y) + "px");
        d3.select("#yAxisR_" + divId).attr("style", "bottom:" + (height + Plotlet.axesOffset.right.y) + "px");
        d3.select(
                "#xAxis_" + divId).attr("style", "bottom:" + (height + Plotlet.axesOffset.bottom.y) + "px;"+
                "width:" + (totalWidth -2) + "px;" + " height:" + (xAxisHeight + 2) + "px");

        // setup plot name
        d3.select("#plotLablSVG_" + divId).remove();
        var topDiv = d3.select("#top_" + divId);

        var plotLabelSVG = topDiv
                .append("svg")
                .attr("id", "plotLablSVG_" + divId)
                .attr('version', 1.1)
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr("width", Math.max(width, 190))
                .attr("height", xAxisHeight)

        var plotLabel = plotLabelSVG
                .append("text")
                .attr("id", "title_" + divId)
                .attr("x", Math.max(width / 2, 100))
                .attr("y", xAxisHeight - 5)
                .attr("text-anchor", "middle")
                .text(plotNameLabel);

        // create axes
        var bottomLeftPoint = L.point(0, height);
        var topRightPoint = L.point(width, 0);
        var bottomLeft = leafletComponent.map.containerPointToLatLng(bottomLeftPoint);
        var topRight = leafletComponent.map.containerPointToLatLng(topRightPoint);

        // setup x axis
        xRange = [0, width];
        xDomain = [bottomLeft.lng, topRight.lng];

        var xScale = d3.scale
                .linear()
                .range(xRange)
                .domain(xDomain);

        var xAxis = d3.svg
                .axis()
                .scale(xScale)
                .orient("bottom")
                .tickSize(0)
                .ticks(Math.max(width/50, 2));


        var count = 0;

        for(nTicks in xAxis.scale().ticks()){
            count +=xAxis.scale().ticks()[nTicks].toString().length;
        }

        var xAxis2 = d3.svg
                .axis()
                .scale(xScale)
                .orient("top")
                .ticks(Math.max(width/50, 2));

        d3.select("#xAxisSVG_" + divId).remove();

        var xAxisDiv = d3.select("#xAxis_" + divId);

        var xAxisSVG = xAxisDiv
                .append("svg")
                .attr("id", "xAxisSVG_" + divId)
                .attr("class", "xSvgAxis")
                .attr("width", width + 20)
                .attr("height", xAxisHeight)
                .attr("style", "bottom: " + ticksInsideMargin + "px; text-align: center;");

        xAxisSVG.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0, " + ticksInsideMargin + ")")
                .call(xAxis);

        xAxisSVG.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + ticksInsideMargin + ")")
                .call(xAxis2)
                .selectAll("text").remove();

        var xLabel = xAxisSVG.append("text")
                .attr("id", "xLabel_" + divId)
                .attr("x", width / 2)
                .attr("y", xAxisHeight - 5)
                .attr("text-anchor", "middle")
                .text(xAxisLabel);

         //same x in the top
        var xAxisT = d3.svg
                .axis()
                .scale(xScale)
                .orient("top")
                .tickSize(0)
                .ticks(Math.max(width / 50, 2));

        var xAxisT2 = d3.svg
                .axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(Math.max(width / 50, 2));

        d3.select("#xAxisSVGT_" + divId).remove();

        var xAxisDivT = d3.select("#xAxisT_" + divId);

        var xAxisSVGT = xAxisDivT
                .append("svg")
                .attr("id", "xAxisSVGT_" + divId)
                .attr("class", "xSvgAxisTop")
                .attr("width", width)
                .attr("height", xAxisHeight)
                .attr("style", "top:" + (ticksInsideMargin + 2) + "px");

        xAxisSVGT.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (xAxisHeight - ticksInsideMargin) +")")
                .call(xAxisT).selectAll("text").remove();

        xAxisSVGT.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (xAxisHeight - ticksInsideMargin) +")")
                .call(xAxisT2).selectAll("text").remove();

        // setup y axis
        yRange = [0, height];
        yDomain = [topRight.lat, bottomLeft.lat];

        var yScale = d3.scale.linear().range(yRange).domain(yDomain);

        var yAxis = d3.svg
                .axis()
                .scale(yScale)
                .orient("left")
                .tickSize(0)
                .ticks(Math.max(height/50, 2));
                
        var yAxis2 = d3.svg
                .axis()
                .scale(yScale)
                .orient("right")
                .ticks(Math.max(height/50, 2));

        d3.select("#yAxisSVG_" + divId).remove();

        var yAxisDiv = d3.select("#yAxis_" + divId);

        var yAxisSVG = yAxisDiv
                .append("svg")
                .attr("id", "yAxisSVG_" + divId)
                .attr("class", "ySvgAxis")
                .attr("width", yAxisWidth)
                .attr("height", height)
                .attr("style", "left:" + ticksInsideMargin + "px;");

        yAxisSVG.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (yAxisWidth - ticksInsideMargin) +", 0)")
                .call(yAxis);

        yAxisSVG.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (yAxisWidth - ticksInsideMargin) +", 0)")
                .call(yAxis2).selectAll("text").remove();

        var yLabel = yAxisSVG.append("text")
                .attr("id", "yLabel_" + divId)
                .attr("y", (yAxisWidth - 40))
                .attr("x", -(height / 2))
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text(yAxisLabel);


        //same y in the right
        var yAxisR = d3.svg
                .axis()
                .scale(yScale)
                .orient("right")
                .tickSize(0)
                .ticks(Math.max(height/50, 2));
                
        var yAxisR2 = d3.svg
                .axis()
                .scale(yScale)
                .orient("left")
                .ticks(Math.max(height/50, 2));

        d3.select("#yAxisSVGR_" + divId).remove();

        var yAxisDivR = d3.select("#yAxisR_" + divId);

        var yAxisSVGR = yAxisDivR.append("svg")
                .attr("id", "yAxisSVGR_" + divId)
                .attr("class", "ySvgAxis")
                .attr("width", yAxisWidth)
                .attr("height", height)
                .attr("style", "right: " + (ticksInsideMargin - 2) + "px");

        yAxisSVGR.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + ticksInsideMargin + ", 0)")
                .call(yAxisR).selectAll("text").remove();

        yAxisSVGR.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + ticksInsideMargin + ", 0)")
                .call(yAxisR2).selectAll("text").remove();
    }


    // TODO: apply Java-style camelCase for function names
    function SelectionsOnSession(visId) {
        var selectionQuery= server + "/polygon-selection" + extraPOSTValue;
        var result = [];

        $.ajax({
                type: "GET",
                url: selectionQuery,
                data: {
                    "action": "list",
                    "vis-id": visId,
                },
                async: false
            })
            .done(function(data) {
                var jsonParse = JSON.parse(data);
                result = jsonParse["selections"];
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
            })

        return result;
    }

    // TODO: apply Java-style camelCase for function names
    function ServerPointSelection(plot, position) {
        //Get range by map size
        var map = plot.leafletMainComponent.leafletComponent.map;
        var bottomLeftPoint = map.containerPointToLatLng(L.point(0, 0));
        var point5Pixels = map.containerPointToLatLng(L.point(5, 5));
        var xDistance = Math.abs(point5Pixels.lng - bottomLeftPoint.lng);
        var yDistance = Math.abs(point5Pixels.lat - bottomLeftPoint.lat);
        var zoomLevel = plot.leafletMainComponent.leafletComponent.map.getZoom();
        var dimensionsQuery = server + "/nearest-data-point";

        $.ajax({
                type: "GET",
                url: dimensionsQuery,
                data: {
                    "vis-id": plot.visualizationId,
                    "x": position.lng,
                    "y": position.lat,
                    "x-distance": xDistance,
                    "y-distance": yDistance,
                    "zoom-level": zoomLevel
                },
                async: false
            })
            .done(function(data) {
                if (data["row-id"] != -1)
                    LinkedViewSelectPointOnServer(plot, data);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
            })
    }


    // TODO: apply Java-style camelCase for function names
    function LinkedViewSelectPointOnServer(plot, dataObject) {
        var query = server + "/point-selection";

        $.ajax({
                type: "GET",
                url: query,
                data: {
                    "action": "select",
                    "dataset": plot.datasetId,
                    "row-id": dataObject["row-id"]
                },
                async: false
            })
            .done(function() {
                UpdateAllPlots();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
            })
    }


    // TODO: apply Java-style camelCase for function names
    function UpdateAllPlots() {
        for (var plot in plots) {
            var p = plots[plot];

            if(p.type != "Histogram") {
                serverLinkedViewPointSelection(p);
            }
            else if(p.type == "Histogram"){
                serverLinkedViewPointSelectionHistogram(p);
            }
        }
    }


    function updateMarkerOnPlot(plot, dataObject) {
        plot.leafletMainComponent.leafletComponent.map.removeLayer(plot.leafletMainComponent.selectionMarker);

        if("y" in dataObject && "x" in dataObject) {
            var customOptions = {
                'maxWidth': '500',
                'className' : 'custom'
            }

            var simbadCoordinates = dataObject;

            if("wrapping" in plot.Parameters) {
                simbadX = simbadCoordinates["x"];
                simbadY = simbadCoordinates["y"];
                simbadCoordinates = fromDataToWindowWrapping(plot.Parameters["wrapping"], simbadX, simbadY);
            }

            var popupHtml = "<div style='height: 30px; line-height: 30px; width: 306px; margin-bottom: 2%;'>" +
                                "<text style='display:inline-block'> Source-ID: " + dataObject["row-id"] + "</text>" +
                                "<Button style='display:inline-block' type='button' class='btn btn-default btn-sm pull-right' OnClick='queryGacsBySourceId(\""+dataObject["row-id"] +"\", \""+ plot.plotId +"\")'>Search in GACS </Button>" +
                            "</div>" +
                            "<div style='width: 306px; margin-top: 15px;'>" +
                                "<div style='display:inline-block; width: 306px;'>" +
                                    "<text id='coordinatesText'>" + dataObject["x"] + ", " + dataObject["y"] + "</text>" +
                                "</div>";

            if(plot.visualizationADQL != undefined){

                popupHtml += "<div  style='align-items: center; display: flex; width: 306px; line-height: 30px;'>" +
                                     "<div style='display: inline-block; margin-right: 10px;'>" +
                                         "<text> Query around </text>" +
                                         "<input id='radiusText' type='text' placeholder='10' style='line-height: 21px;'>" +
                                         "<text> arc min </text>" +
                                     "</div>" +
                                     "<div style='display: inline-block; width: 155px;'>"+
                                          "<Button style='display:inline-block;' type='button' class='btn btn-default btn-sm pull-right'" +
                                              "OnClick='queryGacsByCoordinates(\""+dataObject["x"] +
                                               "\", \"" + dataObject["y"] +
                                               "\", \"" + plot.plotId +"\" )'>GACS</Button>" +
                                         "<Button style='display:inline-block; margin-right: 3px;' type='button' class='btn btn-default btn-sm pull-right'" +
                                             "OnClick='querySimbad(\""+simbadCoordinates["x"] + "\", \"" + simbadCoordinates["y"] +"\", \"" + plot.Parameters.coordSys +"\" )'>Simbad </Button>" +
                                     "</div>"+
                                  "</div>" +
                              "</div>";
            }
            else{
                popupHtml += "</div>";
            }

            plot.leafletMainComponent.leafletComponent.map.addLayer(plot.leafletMainComponent.selectionMarker);
            plot.leafletMainComponent.selectionMarker.setLatLng([dataObject["y"], dataObject["x"]]).update();
            plot.leafletMainComponent.selectionMarker.bindPopup(popupHtml, customOptions);
        }
    }


    // TODO: eliminate rubber-stamp parameter (plot)
    function serverLinkedViewPointSelection(plot) {
        var query = server + "/point-selection";

        $.ajax({
                type: "GET",
                url: query,
                data: {
                    "action": "consult",
                    "dataset": plot.datasetId,
                    "vis-id": plot.visualizationId
                },
                async: false
            })
            .done(function(data) {
                updateMarkerOnPlot(plot, JSON.parse(data));
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
            })
    }


    // TODO: apply Java-style camelCase for function names
    function ServerRegionsFile(action, type, regions) {
        var selectionQuery= server + "/generate-regions" + extraPOSTValue;

        $.fileDownload(selectionQuery, {
            httpMethod: "POST",
            data: {
                  action: action,
                  type : type,
                  regions:  JSON.stringify(regions)
            }
        });
    }


    Plotlet.downloadCSV = function(visId) {
        var selectionQuery= server + "/subset-csv-download?vis-id=" +  visId + extraPOSTValue;
        $.fileDownload(selectionQuery, {});
    }


    Plotlet.uploadCSV = function(file) {
        var selectionQuery= server + "/subset-csv-upload" + extraPOSTValue;
            $.ajax({
                type: "POST",
                data: file,
                url: selectionQuery,
                cache: false,
                contentType: "multipart/form-data stream",
                processData: false,
                async: false
            })
            .done(function(data) {
                console.log(data)
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
            })
    }


    Plotlet.deleteSelection = function(visId) {
        var deleteQuery = server + "/polygon-selection" + extraPOSTValue;
        $.ajax({
            type: "GET",
            data: {
                "vis-id": visId,
                "action": "delete"
            },
            url: deleteQuery,
            async: false
        })
            .done(function(data) {
                console.log(data)
        })
            .fail(function(jqXHR, textStatus, errorThrown) {
                alert("Failed. TextStatus: " + textStatus + ". Error Thrown: " + errorThrown);
        })
    }

}(window, document));