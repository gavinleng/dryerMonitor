/*lineGaugeHT.js*/

function LineGaugeHT() {
    this._width = null;
    this._height = null;
    this._svg = null;
    this._x = null;
    this._y = null;
    this._y1 = null;
    this._xAxis = null;
    this._yAxisLeft = null;
    this._yAxisRight = null;
    this._line = null;
    this._line1 = null;

    this._rauge = null;
    this._radius = null;
    this._gaugeGroup = null;
    this._waveGroup = null;
    this._fillCircleGroup = null;
}

LineGaugeHT.prototype = {
    initBlock: function(elementId) {
        var margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };

        this._width = 355 - margin.left - margin.right;
        this._height = 146 - margin.top - margin.bottom;

        this._svg = d3.select("#m" + elementId).append("svg")
            .attr("width", this._width + margin.left + margin.right)
            .attr("height", this._height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this._x = d3.scale.linear()
            .range([0, this._width]);

        this._y = d3.scale.linear()
            .range([this._height, 0]);

        this._y1 = d3.scale.linear()
            .range([this._height, 0]);

        this._xAxis = d3.svg.axis()
            .scale(this._x)
            .orient("bottom");

        this._yAxisLeft = d3.svg.axis()
            .scale(this._y)
            .orient("left");

        this._yAxisRight = d3.svg.axis()
            .scale(this._y1)
            .orient("right");

        this._line = d3.svg.line()
            .x(function(d) {
                return this._x(+d.x);
            })
            .y(function(d) {
                return this._y(+d.y);
            });

        this._line1 = d3.svg.line()
            .x(function(d) {
                return this._x(+d.x);
            })
            .y(function(d) {
                return this._y1(+d.y);
            });

        this._svg.append("g")
            .attr("class", "x axis");

        this._svg.append("g")
            .attr("class", "y axis")
            .append("text").attr("stroke", "blue")
            .attr("x", 30)
            .attr("dy", ".48em");

        this._svg.append("g")
            .attr("class", "y1 axis")
            .append("text").attr("stroke", "red")
            .attr("x", -4)
            .attr("dy", ".48em");

        this._svg.append("path")
            .attr("class", "line")
            .attr("stroke", "blue");

        this._svg.append("path")
            .attr("class", "line1")
            .attr("stroke", "red")
            .attr("fill", "none");

        this._svg.append("path")
            .attr("class", "xyLine")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "1");

        this._gauge = d3.select("#g" + elementId);

        this._radius = Math.min(parseInt(this._gauge.style("width")), parseInt(this._gauge.style("height"))) / 2;
        var locationX = parseInt(this._gauge.style("width")) / 2 - this._radius;
        var locationY = parseInt(this._gauge.style("height")) / 2 - this._radius;
        this._gaugeGroup = this._gauge.append("g")
            .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

        this._gaugeGroup.append("path")
            .attr("class", "gaugeCircleArc")
            .attr('transform', 'translate(' + this._radius + ',' + this._radius + ')');

        this._gaugeGroup.append("text")
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle");

        this._waveGroup = this._gaugeGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + elementId);

        this._waveGroup.append("path")
            .attr("class", "clipArea");

        this._fillCircleGroup = this._gaugeGroup.append("g")
            .attr("clip-path", "url(#clipWave" + elementId + ")");

        this._fillCircleGroup.append("circle")
            .attr("class", "fillCircle");

        this._fillCircleGroup.append("text")
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle");
    },

    blockHT: function(id, data, data1, xValue) {
        //humidity/temperature lines
        var dataHT = lineHT.call(this, data, data1, xValue);

        //humidity gauge
        var gvalue = dataHT[0];
        gvalue = d3.format(".1f")(gvalue);
        loadLiquidFillGauge.call(this, gvalue);

        //temperature bar
        var tt = dataHT[1];
        tt = d3.format(".1f")(tt);
        d3.select(".t" + id).style("width", tt + "%");
        d3.select("#t" + id + "-value").text(tt + "ºC");

    }
};

function lineHT(data, data1, xValue) {
    var self = this;

    self._svg.selectAll(".x.axis")
        .attr("transform", "translate(0," + self._height + ")")
        .call(self._xAxis);

    self._svg.selectAll(".y.axis")
        .call(self._yAxisLeft)
        .select("text")
        .style("text-anchor", "end")
        .text("H (%)");

    self._svg.selectAll(".y1.axis")
        .attr("transform", "translate(" + self._width + " ,0)")
        .call(self._yAxisRight)
        .select("text")
        .style("text-anchor", "end")
        .text("T (ºC)");

    self._x.domain([tbarmin, tbarmax]);
    self._y.domain([0, 100]);
    self._y1.domain([0, 100]);

    self._svg.select(".line")
        .attr("d", self._line(data));

    self._svg.select(".line1")
        .attr("d", self._line1(data1));

    var bisect = d3.bisector(function(d) {
        return d.x;
    }).right;


    var rightIdx = bisect(data, xValue);
    var rightIdx1 = bisect(data1, xValue);

    if (rightIdx < 1) {
        rightIdx = 1;
    }
    if (rightIdx1 < 1) {
        rightIdx1 = 1;
    }

    var yValue = data[rightIdx - 1].y;
    var yValue1 = data1[rightIdx1 - 1].y;

    var xCoor = self._x(xValue);

    var yRange = self._y.range();

    self._svg.select(".xyLine")
        .attr("d", "M " + xCoor + ", " + yRange[0] + " L " + xCoor + ", " + yRange[1]);

    self._svg.append('rect')
        .attr('width', self._width)
        .attr('height', self._height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('dblclick', function() {
            var xCoor = d3.mouse(this)[0];
            var xData = self._x.invert(xCoor);

            timeClick(xData);
        });

    return [yValue, yValue1];
}

function loadLiquidFillGauge(value) {
    var config = liquidFillGaugeDefaultSettings();

    var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

    var waveHeightScale;
    if (config.waveHeightScaling) {
        waveHeightScale = d3.scale.linear()
            .range([0, config.waveHeight, 0])
            .domain([0, 50, 100]);
    } else {
        waveHeightScale = d3.scale.linear()
            .range([config.waveHeight, config.waveHeight])
            .domain([0, 100]);
    }

    var textPixels = (config.textSize * this._radius / 2);
    var textFinalValue = parseFloat(value).toFixed(2);
    var textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
    var percentText = config.displayPercent ? "%" : "";
    var circleThickness = config.circleThickness * this._radius;
    var circleFillGap = config.circleFillGap * this._radius;
    var fillCircleMargin = circleThickness + circleFillGap;
    var fillCircleRadius = this._radius - fillCircleMargin;
    var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

    var waveLength = fillCircleRadius * 2 / config.waveCount;
    var waveClipCount = 1 + config.waveCount;
    var waveClipWidth = waveLength * waveClipCount;

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    var textRounder = function(value) {
        return Math.round(value);
    };
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = function(value) {
            return parseFloat(value).toFixed(1);
        };
    }
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = function(value) {
            return parseFloat(value).toFixed(2);
        };
    }

    // Data for building the clip wave area.
    var data = [];
    for (var i = 0; i <= 40 * waveClipCount; i++) {
        data.push({
            x: i / (40 * waveClipCount),
            y: (i / (40))
        });
    }

    // Scales for drawing the outer circle.
    var gaugeCircleX = d3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
    var gaugeCircleY = d3.scale.linear().range([0, this._radius]).domain([0, this._radius]);

    // Scales for controlling the size of the clipping path.
    var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
    var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);

    // Scales for controlling the position of the clipping path.
    var waveRiseScale = d3.scale.linear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
        .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
        .domain([0, 1]);
    var waveAnimateScale = d3.scale.linear()
        .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
        .domain([0, 1]);

    // Scale for controlling the position of the text within the gauge.
    var textRiseScaleY = d3.scale.linear()
        .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
        .domain([0, 1]);

    // Draw the outer circle.
    var gaugeCircleArc = d3.svg.arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(this._radius))
        .innerRadius(gaugeCircleY(this._radius - circleThickness));

    this._gaugeGroup.select(".gaugeCircleArc")
        .attr("d", gaugeCircleArc)
        .style("fill", config.circleColor);

    // Text where the wave does not overlap.
    var text1 = this._gaugeGroup.select(".liquidFillGaugeText")
        .text(textRounder(textStartValue) + percentText)
        .attr("font-size", textPixels + "px")
        .style("fill", config.textColor)
        .attr('transform', 'translate(' + this._radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

    // The clipping wave area.
    var clipArea = d3.svg.area()
        .x(function(d) {
            return waveScaleX(d.x);
        })
        .y0(function(d) {
            return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
        })
        .y1(function(d) {
            return (fillCircleRadius * 2 + waveHeight);
        });

    var wave = this._waveGroup.select(".clipArea")
        .datum(data)
        .attr("d", clipArea);

    this._fillCircleGroup.select(".fillCircle")
        .attr("cx", this._radius)
        .attr("cy", this._radius)
        .attr("r", fillCircleRadius)
        .style("fill", config.waveColor);

    // Text where the wave does overlap.
    var text2 = this._fillCircleGroup.select(".liquidFillGaugeText")
        .text(textRounder(textStartValue) + percentText)
        .attr("font-size", textPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform', 'translate(' + this._radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

    // Make the value count up.
    if (config.valueCountUp) {
        var textTween = function() {
            var i = d3.interpolate(this.textContent, textFinalValue);
            return function(t) {
                this.textContent = textRounder(i(t)) + percentText;
            }
        };
        text1.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
        text2.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;

    if (config.waveRise) {
        this._waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
            .each("start", function() {
                wave.attr('transform', 'translate(1,0)');
            }); // this transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
    } else {
        this._waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
    }

    if (config.waveAnimate) animateWave(wave, waveAnimateScale, config);
}

function animateWave(wave, waveAnimateScale, config) {
    wave.transition()
        .duration(config.waveAnimateTime)
        .ease("linear")
        .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
        .each("end", function() {
            wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
            animateWave(wave, waveAnimateScale, config);
        });
}

function liquidFillGaugeDefaultSettings() {
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.1, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.1, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#D4ABAA", // The color of the outer circle.
        waveHeight: 0.1, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 2, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 2000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#AA7DA9", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#D4ABAA", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#8056A5" // The color of the value text when the wave overlaps it.
    };
}

function timeRead(lineDB) {
    var dIndex, day, month, year, hours, minutes, seconds, linetimestamp, lineList;

    dIndex = lineDB.indexOf(":");
    day = lineDB.slice(1, dIndex);

    lineDB = lineDB.slice(dIndex + 1);

    dIndex = lineDB.indexOf(":");
    month = (+lineDB.slice(0, dIndex) - 1) + "";

    lineDB = lineDB.slice(dIndex + 1);

    dIndex = lineDB.indexOf(":");
    year = lineDB.slice(0, dIndex);

    lineDB = lineDB.slice(dIndex + 2);

    dIndex = lineDB.indexOf(":");
    hours = lineDB.slice(0, dIndex);

    lineDB = lineDB.slice(dIndex + 1);

    dIndex = lineDB.indexOf(":");
    minutes = lineDB.slice(0, dIndex);

    lineDB = lineDB.slice(dIndex + 1);

    dIndex = lineDB.indexOf("]");
    seconds = lineDB.slice(0, dIndex);

    lineDB = lineDB.slice(dIndex + 1);

    linetimestamp = (new Date(year, month, day, hours, minutes, seconds)).getTime();

    lineList = [linetimestamp, lineDB];

    return lineList;
}

function dataSort(arrayDB, sP) {
    var lineDB, i, dIndex, num19, lineList;
    var dbS = [];
    var dbBT = [];
    var dbDT = [];
    var dbGT = [];

    var nBT = 0;
    var nDT = 0;
    var nGT = 0;

    for (i in arrayDB) {
        lineDB = arrayDB[i];

        if (lineDB.indexOf("Sensor [") >= 0) {

            lineList = timeRead(lineDB);

            lineDB = lineList[1];

            dIndex = lineDB.indexOf("[");
            lineDB = lineDB.slice(dIndex + 1);

            dIndex = lineDB.indexOf("]");
            num19 = Number(lineDB.slice(0, dIndex));

            if (+num19 == 19) {
                continue;
            }

            dbS.push({
                id: Number(lineDB.slice(0, dIndex)),
                time: lineList[0],
                value: Number(lineDB.slice(dIndex + 2))
            });
        }

        if (lineDB.indexOf("Set Burner Temperature") >= 0) {
            lineList = timeRead(lineDB);

            lineDB = lineList[1];

            dIndex = lineDB.indexOf(":");

            nBT++

            dbBT.push({
                id: nBT,
                time: lineList[0],
                value: Number(lineDB.slice(dIndex + 2))
            });
        }

        if (lineDB.indexOf("Set Discharge Time") >= 0) {
            lineList = timeRead(lineDB);

            lineDB = lineList[1];

            dIndex = lineDB.indexOf(":");

            nDT++

            dbDT.push({
                id: nDT,
                time: lineList[0],
                value: Number(lineDB.slice(dIndex + 2))
            });
        }

        if (lineDB.indexOf("Set Grain Type") >= 0) {
            lineList = timeRead(lineDB);

            lineDB = lineList[1];

            dIndex = lineDB.indexOf(":");

            nGT++

            if (nGT > 1) {
                if (lineDB.slice(dIndex + 2) == dbGT[0].value) {
                    continue;
                } else {
                    console.log("This dataset contains different types of grain. Please check the dataset. Program stopped.");
                    exit();
                }
            }

            dbGT.push({
                id: nGT,
                time: lineList[0],
                value: lineDB.slice(dIndex + 2)
            });

        }

    }

    if (dbGT.length == 0) {
        dbGT.push({
            id: 1,
            time: null,
            value: null
        })
    }

    var dbTotal = groupData(dbS, dbBT, dbDT, dbGT, sP);

    return dbTotal;
}

function dbDis(db) {
    var dbDis = [db[0]];

    for (var i = 1; i < db.length; i++) {
        dbDis.push({
            x: db[i].x - 1000,
            y: db[i - 1].y
        });

        dbDis.push({
            x: db[i].x,
            y: db[i].y
        });
    }

    return dbDis;
}

function dbLink(db, tmin, tmax) {
    (tmin < db[0].x) ? db.unshift({
        x: tmin,
        y: db[0].y
    }): db;

    (tmax > db[db.length - 1].x) ? db.push({
        x: tmax,
        y: db[db.length - 1].y
    }): db;

    return db;
}

function dbSLink(db, tmin, tmax) {
    var i, j, db1;

    for (i = 0; i < 9; i++) {
        for (j = 0; j < 2; j++) {
            db1 = db[i][j];

            (tmin < db1[0].x) ? db1.unshift({
                x: tmin,
                y: db1[0].y
            }): db1;

            (tmax > db1[db1.length - 1].x) ? db1.push({
                x: tmax,
                y: db1[db1.length - 1].y
            }): db1;
        }
    }

    return db;
}

function dryerData(data) {
    batchDataTotal = [];

    sensorPlaces = data;

    myB = [];

    for (var i = 0; i < 9; i++) {

        myB[i] = new LineGaugeHT();

        myB[i].initBlock(i);
    }

    for (var i = 9; i < 11; i++) {

        myB[i] = new LineGaugeTT();

        myB[i].initBlock(i);
    }

    var file = "./data/2015-08-22T15-15-12.119Z.txt";

    fileRead(file);
}

function timeGet() {
    var nTime = +this.value;
    this.focus();

    d3.select("#nTime-value").text(new Date(nTime));
    $("#nTime").val(nTime);

    for (var i = 0; i < 9; i++) {
        myB[i].blockHT(i, tData[i][0], tData[i][1], nTime);
    }

    for (var i = 9; i < 11; i++) {
        myB[i].blockTT(i, bdtData[i - 9], nTime, tlable[i - 9]);
    }
}

function timeClick(xCoor) {
    var nTime = xCoor;
    d3.select("#nTime-value").text(new Date(nTime));
    $("#nTime").val(nTime);

    for (var i = 0; i < 9; i++) {
        myB[i].blockHT(i, tData[i][0], tData[i][1], nTime);
    }

    for (var i = 9; i < 11; i++) {
        myB[i].blockTT(i, bdtData[i - 9], nTime, tlable[i - 9]);
    }
}

function dataGet(text) {
    var txtData = text.split('\n');

    tDataT = dataSort(txtData, sensorPlaces);

    dataImplement(tDataT);
}

function fileRead(file) {
    d3.text(file, function(text) {
        dataGet(text);
    });
}

function LineGaugeTT() {
    this._width = null;
    this._height = null;
    this._svg = null;
    this._x = null;
    this._y = null;
    this._xAxis = null;
    this._yAxisLeft = null;
    this._line = null;
}

LineGaugeTT.prototype = {
    initBlock: function(elementId) {
        var margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };

        this._width = 355 - margin.left - margin.right;
        this._height = 146 - margin.top - margin.bottom;

        this._svg = d3.select("#m" + elementId).append("svg")
            .attr("width", this._width + margin.left + margin.right)
            .attr("height", this._height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this._x = d3.scale.linear()
            .range([0, this._width]);

        this._y = d3.scale.linear()
            .range([this._height, 0]);

        this._y1 = d3.scale.linear()
            .range([this._height, 0]);

        this._xAxis = d3.svg.axis()
            .scale(this._x)
            .orient("bottom");

        this._yAxisLeft = d3.svg.axis()
            .scale(this._y)
            .orient("left");

        this._line = d3.svg.line()
            .x(function(d) {
                return this._x(+d.x);
            })
            .y(function(d) {
                return this._y(+d.y);
            });

        this._svg.append("g")
            .attr("class", "x axis");

        this._svg.append("g")
            .attr("class", "y axis")
            .append("text").attr("stroke", "blue")
            .attr("x", 20)
            .attr("dy", ".48em");

        this._svg.append("path")
            .attr("class", "line")
            .attr("stroke", "blue");

        this._svg.append("path")
            .attr("class", "xyLine")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "1");
    },

    blockTT: function(id, data, xValue, tlable) {
        //temperature/time lines
        var dataTT = lineTT.call(this, data, xValue, tlable);

        tt = d3.format(".1f")(dataTT);
        d3.select("#t" + id + "-value").text(tt + tlable);
    }
};

function lineTT(data, xValue, tlable) {
    var self = this;

    self._svg.selectAll(".x.axis")
        .attr("transform", "translate(0," + self._height + ")")
        .call(self._xAxis);

    self._svg.selectAll(".y.axis")
        .call(self._yAxisLeft)
        .select("text")
        .style("text-anchor", "end")
        .text(tlable);

    self._x.domain([tbarmin, tbarmax]);
    self._y.domain([0, 100]);

    self._svg.select(".line")
        .attr("d", self._line(data));

    var bisect = d3.bisector(function(d) {
        return d.x;
    }).right;


    var rightIdx = bisect(data, xValue);

    if (rightIdx < 1) {
        rightIdx = 1;
    }

    var yValue = data[rightIdx - 1].y;

    var xCoor = self._x(xValue);

    var yRange = self._y.range();

    self._svg.select(".xyLine")
        .attr("d", "M " + xCoor + ", " + yRange[0] + " L " + xCoor + ", " + yRange[1]);

    self._svg.append('rect')
        .attr('width', self._width)
        .attr('height', self._height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('dblclick', function() {
            var xCoor = d3.mouse(this)[0];
            var xData = self._x.invert(xCoor);

            timeClick(xData);
        });

    return yValue;
}

function getTimestamp(date) {
    var dlist = date.trim();
    dlist = date.split('-');

    dlist[2] = dlist[2].toUpperCase();
    dlist[2] = dlist[2].replace('T', ':');

    dlist = [dlist[0], dlist[1]].concat(dlist[2].split(':'));

    return (new Date(dlist[0], dlist[1], dlist[2], dlist[3], dlist[4], dlist[5])).getTime();
}

function getBatchList(data) {
    var TIMEGAP = 30 * 60;

    data = data.sort(function(a, b) {
        return a.Timestamp - b.Timestamp;
    });

    var tmin = data[0].Timestamp;
    var tmax = data[data.length - 1].Timestamp;

    var batchList = [{
        "num": 1,
        "stime": tmin,
        "etime": null
    }];

    var k = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i].Timestamp - data[i - 1].Timestamp >= TIMEGAP) {
            batchList[k].etime = data[i - 1].Timestamp;
            k++;
            batchList.push({
                "num": k + 1,
                "stime": data[i].Timestamp,
                "etime": null
            });
        }
    }

    batchList[batchList.length - 1].etime = data[data.length - 1].Timestamp;

    if (batchList[batchList.length - 1].stime == batchList[batchList.length - 1].etime) batchList.pop();

    return batchList;
}

function groupData(dbS, dbBT, dbDT, dbGT, sP) {
    var i, j, dT1, dT2, dTem;
    var dataS = [];

    dbS = dbS.sort(function(a, b) {
        return a.time - b.time;
    });

    var tmin = dbS[0].time;
    var tmax = dbS[dbS.length - 1].time;

    dbS = dbS.sort(function(a, b) {
        return a.id - b.id;
    });

    for (i = 0; i < 17; i++) {
        dIndex = dbS.map(function(e) {
            return e.id;
        }).indexOf(i + 2);

        dataS.push(dbS.slice(0, dIndex));
        dbS = dbS.slice(dIndex);
    }

    dataS.push(dbS);

    dbS = [];

    for (i = 0; i < 9; i++) {
        dTem = dataS[+sP[i].sensor[0] - 1];
        dTem = dTem.sort(function(a, b) {
            return a.time - b.time;
        });

        dT1 = [];
        for (j = 0; j < dTem.length; j++) {
            dT1.push({
                x: dTem[j].time,
                y: dTem[j].value
            });
        }

        dTem = dataS[+sP[i].sensor[1] - 1];
        dTem = dTem.sort(function(a, b) {
            return a.time - b.time;
        });

        dT2 = [];
        for (j = 0; j < dTem.length; j++) {
            dT2.push({
                x: dTem[j].time,
                y: dTem[j].value
            });
        }

        dbS.push([dT1, dT2]);
    }

    if (dbBT.length == 0) {
        dbBT.push({
            id: 1,
            time: tmin,
            value: 0
        });

        dbBT.push({
            id: 2,
            time: tmax,
            value: 0
        });
    }

    dbBT = dbBT.sort(function(a, b) {
        return a.time - b.time;
    });

    tmin = (tmin <= dbBT[0].time) ? tmin : dbBT[0].time;
    tmax = (tmax >= dbBT[dbBT.length - 1].time) ? tmax : dbBT[dbBT.length - 1].time;

    dT1 = [];
    for (j = 0; j < dbBT.length; j++) {
        dT1.push({
            x: dbBT[j].time,
            y: dbBT[j].value
        });
    }

    dbBT = dT1;

    if (dbDT.length == 0) {
        dbDT.push({
            id: 1,
            time: tmin,
            value: 0
        });

        dbDT.push({
            id: 2,
            time: tmax,
            value: 0
        });
    }

    dbDT = dbDT.sort(function(a, b) {
        return a.time - b.time;
    });

    tmin = (tmin <= dbDT[0].time) ? tmin : dbDT[0].time;
    tmax = (tmax >= dbDT[dbDT.length - 1].time) ? tmax : dbDT[dbDT.length - 1].time;

    dT1 = [];
    for (j = 0; j < dbDT.length; j++) {
        dT1.push({
            x: dbDT[j].time,
            y: dbDT[j].value
        });
    }

    dbDT = dT1;

    dbS = dbSLink(dbS, tmin, tmax); //
    dbBT = dbLink(dbBT, tmin, tmax);
    dbDT = dbLink(dbDT, tmin, tmax);

    dbBT = dbDis(dbBT);
    dbDT = dbDis(dbDT);

    dbS.push([tmin, tmax]);

    var dbTotal = [dbS, dbBT, dbDT, dbGT];

    return dbTotal;
}

function dataImplement(tDataT) {
    tData = tDataT[0];

    bdtData = [tDataT[1], tDataT[2]];
    tlable = ["ºC", "min"];

    gtData = tDataT[3];

    tbarmin = +tData[tData.length - 1][0];
    tbarmax = +tData[tData.length - 1][1];

    var myHtml = '<input type="range"  min="' + tbarmin + '" max="' + tbarmax + '" value="' + tbarmin + '" step="1000" style="cursor:w-resize" id="nTime" />';

    d3.select(".tBar").html(myHtml);

    d3.selectAll(".progress").style("background", "rgba(219, 223, 223, 1)");

    for (var i = 0; i < 9; i++) {
        myB[i].blockHT(i, tData[i][0], tData[i][1], tbarmin);

        d3.select(".ht" + i + " p").text("H" + sensorPlaces[i].sensor[0] + "/T" + sensorPlaces[i].sensor[1]);
    }

    for (var i = 9; i < 11; i++) {
        myB[i].blockTT(i, bdtData[i - 9], tbarmin, tlable[i - 9]);
    }

    d3.select("#nTime-value").text(new Date(tbarmin));

    var bTime = new Date(tbarmin).toString();
    bTime = bTime.slice(0, bTime.indexOf("GMT") - 1);

    var eTime = new Date(tbarmax).toString();
    eTime = eTime.slice(0, eTime.indexOf("GMT") - 1);

    d3.select("#gtype").text("Grain Type: " + gtData[0].value + ". \u00A0 \u00A0 Data from " + bTime + " to " + eTime);

    d3.select("#nTime").on("change", timeGet);
}

function reqBatchData(data, num, startTime, endTime) {
    data = data.sort(function(a, b) {
        return a.Timestamp - b.Timestamp;
    });

    batchDataTotal.push({
        "num": num,
        "startTime": startTime,
        "endTime": endTime,
        "data": data
    });

    tDataT = batchDataSort(data, sensorPlaces);

    dataImplement(tDataT);
}

function batchDataSort(data, sP) {
    var lineDB, i, dIndex, num19, slineDB;
    var dbS = [];
    var dbBT = [];
    var dbDT = [];
    var dbGT = [];

    var nBT = 0;
    var nDT = 0;
    var nGT = 0;

    for (i = 0; i < data.length; i++) {
        lineDB = data[i];

        if (lineDB.Item.indexOf("Sensor [") >= 0) {

            dIndex = lineDB.Item.indexOf("[");
            slineDB = lineDB.Item.slice(dIndex + 1);

            dIndex = slineDB.indexOf("]");
            num19 = Number(slineDB.slice(0, dIndex));

            if (+num19 == 19) {
                continue;
            }

            dbS.push({
                id: Number(slineDB.slice(0, dIndex)),
                time: lineDB.Timestamp * 1000,
                value: Number(lineDB.Value)
            });
        }

        if (lineDB.Item.indexOf("Set Burner Temperature") >= 0) {

            nBT++

            dbBT.push({
                id: nBT,
                time: lineDB.Timestamp * 1000,
                value: Number(lineDB.Value)
            });
        }

        if (lineDB.Item.indexOf("Set Discharge Time") >= 0) {

            nDT++

            dbDT.push({
                id: nDT,
                time: lineDB.Timestamp * 1000,
                value: Number(lineDB.Value)
            });
        }

        if (lineDB.Item.indexOf("Set Grain Type") >= 0) {

            nGT++

            if (nGT > 1) {
                if (lineDB.Value == dbGT[0].value) {
                    continue;
                } else {
                    console.log("This dataset contains different types of grain. Please check the dataset. Program stopped.");
                    exit();
                }
            }

            dbGT.push({
                id: nGT,
                time: lineDB.Timestamp * 1000,
                value: lineDB.Value
            });

        }

    }

    if (dbGT.length == 0) {
        dbGT.push({
            id: 1,
            time: null,
            value: null
        })
    }

    var dbTotal = groupData(dbS, dbBT, dbDT, dbGT, sP);

    return dbTotal;
}

function savedData(num, startTime, endTime) {
    var flag = false;

    for (var i = 0; i < batchDataTotal.length; i++) {
        if ((num == batchDataTotal[i].num) && (startTime == batchDataTotal[i].startTime) && (endTime == batchDataTotal[i].endTime)) {
            flag = true;

            break;
        }
    }

    return flag;
}

function savedDataSort(num, startTime, endTime) {
    var data;

    for (var i = 0; i < batchDataTotal.length; i++) {
        if ((num == batchDataTotal[i].num) && (startTime == batchDataTotal[i].startTime) && (endTime == batchDataTotal[i].endTime)) {
            data = batchDataTotal[i].data;

            break;
        }
    }

    tDataT = batchDataSort(data, sensorPlaces);

    dataImplement(tDataT);
}
