// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 30, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;
const SVG_PADDING = 10;
let datalength = 0;
let count = 0;
let random = d3.select("#random").property("checked");
setup();

function setup () {

  d3.select("#dataset").on("change",function(d)
  {
    changeData();
  });
  d3.select("#metric").on("change",function(d)
  {
    changeData();
  });
  d3.select("#random").on("change",function(d)
  {
    changeData();
  });
  changeData();
}
/**
 * Render the visualizations
 * @param data
 */
function update (data) {
  // ****** TODO ******
  if(d3.select("#random").property("checked") !== random){
    updateBars(data);
    random = d3.select("#random").property("checked");
  }
  if(count === 0){
    datalength = data.length;
    initialBarChart(data);
    initialLineChart(data);
    initialAreaChart(data);
    initialScatterPlot(data);
    count += 1;
  }
else{
  updateBarChart(data);
  updateLineChart(data);
  updateAreaChart(data);
  updateScatterPlot(data);
}
}

function updateBars(data){
  console.log("updateBars");
  console.log(data);
  let xScale = xAxisScale(data);
  let dataMetric = d3.select("#metric").property("value");
  let yScale = yAxisScale(data,dataMetric);
  let svgSelection = d3.select(".barsvg");
  updateXAxis(data,xScale,"barsvg",dataMetric)
  let bars = svgSelection.selectAll("rect").data(data);
  console.log(bars);
  if(datalength <= data.length){
    console.log("add bar");
    bars.enter()
        .append("rect")
        .attr("x",CHART_WIDTH)
        .attr("y",function(d){
          return yScale(d.deaths);
        })
        .attr("width",((CHART_WIDTH-MARGIN.left-MARGIN.right-SVG_PADDING*12)/data.length))
        .attr("height",function(d){
          return CHART_HEIGHT - MARGIN.top - MARGIN.bottom - yScale(d[dataMetric]);
        })
        .merge(bars)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("x",function(d,i){
            return xScale(d.dates);
        })
        .attr("y",function(d){
          return yScale(d.deaths);
        })
        .attr("width",xScale.bandwidth())
        .attr("height",function(d){
          return yScale(d.deaths);
        });
  }
  else{
    console.log("bar exit");
    bars.exit()
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("x",CHART_WIDTH)
        .remove();
  }
  datalength = data.length;
}
/**
 * All functions related to axes
 */
function yAxisScale(data,metric){
  let yScale = d3.scaleLinear()
                .domain([d3.min(data,function(d){
                  return d[metric];
                }),d3.max(data,function(d){
                  return d[metric];
                })])
                .range([CHART_HEIGHT - MARGIN.top-MARGIN.bottom,MARGIN.top]);
  //console.log("y scale - "+yScale.domain()+" "+yScale.range());
  return yScale;
}

function xAxisScale(data){
    let tScale =  d3.scaleBand()
                    .domain(data.map(function(d){return d.date;}))
                    .range([MARGIN.left+SVG_PADDING,CHART_WIDTH - MARGIN.right-MARGIN.left]);
      //console.log("x scale - "+tScale.domain()+" "+tScale.range());
      return tScale;
}
function xScatterScale(data){
  let xScale = d3.scaleLinear()
                .domain([d3.min(data,function(d){
                  return d["cases"];
                }),d3.max(data,function(d){
                  return d["cases"];
                })])
                .range([MARGIN.left+SVG_PADDING,CHART_WIDTH - MARGIN.right-MARGIN.left]);
  return xScale;
}

function xAxis(xScale,data,svgClass,metric){
  let parsedate = d3.timeParse("%m/%d");
  let barwidth = 0;
  if(svgClass === "barsvg"){
    barwidth = (CHART_WIDTH-MARGIN.left-MARGIN.right-SVG_PADDING*12)/data.length ;
  }
  let xaxis = d3.axisBottom()
                .scale(xScale)
                .ticks(data.length);
  let svg = d3.select("."+svgClass);
  svg.append("g")
      .attr("class","xaxis")
      .attr("transform","translate("+(-(410/data.length)+14+barwidth/2)+","+(CHART_HEIGHT - MARGIN.top - MARGIN.bottom)+")")
      .call(xaxis);
  console.log(d3.select(".linesvg").select(".xaxis").select("g"));
  //d3.select(".xaxis").selectAll("text").style("text-anchor","end").attr("transform","rotate(-65)");
}
function xScatterAxis(xScale,data)
{
  let xaxis = d3.axisBottom()
                .scale(xScale)
                .ticks(data.length);
  let svg = d3.select(".scattersvg");
  svg.append("g")
      .attr("class","xaxis")
      .attr("transform","translate(0,"+(CHART_HEIGHT - MARGIN.top - MARGIN.bottom)+")")
      .call(xaxis);
}
function yAxis(yScale,data,svgClass)
{
  let yaxis = d3.axisLeft()
                .scale(yScale)
                .ticks(data.length);
  let svg = d3.select("."+svgClass);
  svg.append("g")
      .attr("class","yaxis")
      .attr("transform","translate("+(MARGIN.left+SVG_PADDING)+",0)")
      .call(yaxis);
}

function updateXScale(data,xScale,metric){
  let parsedate = d3.timeParse("%m/%d");
  xScale.domain(data.map(function(d){return d.date;}));
    //console.log("updated x scale - "+xScale.domain()+" "+xScale.range());
}

function updateXAxis(data,xScale,svgClass,metric){
  console.log("in update x axis");
  let svgSelection = d3.select("."+svgClass);
  let barwidth = 0;
  if(svgClass === "barsvg"){
    barwidth = (CHART_WIDTH-MARGIN.left-MARGIN.right-SVG_PADDING*12)/data.length ;
  }
  let xaxis = d3.axisBottom()
                .scale(xScale)
                .ticks(data.length);
  svgSelection.select(".xaxis")
              .attr("transform","translate("+(-(410/data.length)+14+barwidth/2)+","+(CHART_HEIGHT - MARGIN.top - MARGIN.bottom)+")")
              .transition()
              .duration(ANIMATION_DURATION)
              .call(xaxis);
}

function updateYScale(data,metric,yScale){
  yScale.domain([d3.min(data,function(d){
    return d[metric];
  }),d3.max(data,function(d){
    return d[metric];
  })]);
//  console.log("updated y scale - "+yScale.domain()+" "+yScale.range());
}
function updateXScatterAxis(data,xScale){
  let svgSelection = d3.select(".scattersvg");
  let xaxis = d3.axisBottom()
                .scale(xScale)
                .ticks(data.length);
  svgSelection.select(".xaxis")
              .transition()
              .duration(ANIMATION_DURATION)
              .call(xaxis);
}
function updateYAxis(data,yScale,svgClass){
  let svgSelection = d3.select("."+svgClass);
  let yaxis = d3.axisLeft()
                .scale(yScale)
                .ticks(data.length);
  svgSelection.select(".yaxis")
              .transition()
              .duration(ANIMATION_DURATION)
              .call(yaxis);
}

/**
 * initial line chart
 */
function initialLineChart(data){
  d3.select("#Linechart-div").append("svg").attr("class","linesvg");
  let svgSelection = d3.select(".linesvg");
  let grouping = svgSelection.append("g");
  let xScale = xAxisScale(data);
  let parsedate = d3.timeParse("%m/%d");
  xAxis(xScale,data,"linesvg","date");
  let yScale = yAxisScale(data,"deaths");
  yAxis(yScale,data,"linesvg");

  let dline = d3.line()
                .x(function(d){return xScale(d.date);})
                .y(function(d){return yScale(d.deaths);});
  grouping.append("path")
          .datum(data)
          .attr("class","line-chart")
          .attr("d",dline);
}
/**
 * initial bar chart
 */

function initialBarChart(data){
  d3.select("#Barchart-div").append("svg").attr("class","barsvg bar-chart");
  let svgSelection = d3.select(".barsvg");
  let grouping = svgSelection.append("g");
  let xScale = xAxisScale(data);
  let parsedate = d3.timeParse("%m/%d");
  xAxis(xScale,data,"barsvg","date");
  let yScale = yAxisScale(data,"deaths");
  yAxis(yScale,data,"barsvg");
  grouping.selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x",function(d){
            return xScale(d.date);
          })
          .attr("y",function(d){
            return yScale(d.deaths);
          })
          .attr("width",((CHART_WIDTH-MARGIN.left-MARGIN.right-SVG_PADDING*14)/data.length))
          .attr("height",function(d){
            return CHART_HEIGHT - MARGIN.top - MARGIN.bottom - yScale(d.deaths);
          });
}
/**
 * initial area chart
 */
function initialAreaChart(data){
  d3.select("#Areachart-div").append("svg").attr("class","areasvg");
  let svgSelection = d3.select(".areasvg");
  let grouping = svgSelection.append("g");
  let xScale = xAxisScale(data);
  let parsedate = d3.timeParse("%m/%d");
  xAxis(xScale,data,"areasvg","date");
  let yScale = yAxisScale(data,"deaths");
  yAxis(yScale,data,"areasvg");

  let area = d3.area()
                .x(function(d){return xScale(d.date);})
                .y0(function(d){return yScale.range()[0];})
                .y1(function(d){return yScale(d.deaths);});
  grouping.append("path")
          .datum(data)
          .attr("class","area-chart")
          .attr("d",area);
}

/**
 * initial scatter plot
 */
 function initialScatterPlot(data){
   d3.select("#Scatterplot-div").append("svg").attr("class","scattersvg scatter-plot");
   let svgSelection = d3.select(".scattersvg");
   let grouping = svgSelection.append("g");
   let xScale = xScatterScale(data);
   console.log(xScale.domain()+" "+ xScale.range());
   //let parsedate = d3.timeParse("%m/%d");
   xScatterAxis(xScale,data);
   let yScale = yAxisScale(data,"deaths");
   yAxis(yScale,data,"scattersvg");
   grouping.selectAll("circle")
           .data(data)
           .enter()
           .append("circle")
           .attr("cx",function(d){
             //console.log(d.cases);
             return xScale(d.cases);
           })
           .attr("cy",function(d){

             return yScale(d.deaths);
           })
           .attr("r",5);
 }

/**
 * Update the bar chart
 */
function updateBarChart (data) {
  console.log(data);
  let svgSelection = d3.select(".barsvg");
  let dataMetric = d3.select("#metric").property("value");
  let xScale = xAxisScale(data);
  //updateXScale(data,xScale,"date");
  let parsedate = d3.timeParse("%m/%d");
  updateXAxis(data,xScale,"barsvg","date");
  let yScale = yAxisScale(data,dataMetric);
  //updateYScale(data,dataMetric,yScale);
  updateYAxis(data,yScale,"barsvg");
  svgSelection.selectAll("rect")
          .data(data)
          .transition()
          .duration(ANIMATION_DURATION)
          .attr("x",function(d){
            return xScale(d.date);
          })
          .attr("y",function(d){
            return yScale(d[dataMetric]);
          })
          .attr("width",((CHART_WIDTH-MARGIN.left-MARGIN.right-SVG_PADDING*12)/data.length))
          .attr("height",function(d){
            return CHART_HEIGHT - MARGIN.top - MARGIN.bottom - yScale(d[dataMetric]);
          });
}

/**
 * Update the line chart
 */
function updateLineChart (data) {
    let xScale = xAxisScale(data);
    let dataMetric = d3.select("#metric").property("value");
    let parsedate = d3.timeParse("%m/%d");

    updateXScale(data,xScale,"date");
    updateXAxis(data,xScale,"linesvg","date");
    let yScale = yAxisScale(data,dataMetric);
    updateYScale(data,dataMetric,yScale);
    updateYAxis(data,yScale,"linesvg");
    let dline = d3.line()
              .x(function(d){return xScale(d.date);})
              .y(function(d){return yScale(d[dataMetric]);});

    d3.select(".line-chart")
      .datum(data)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr("d",dline);
}

/**
 * Update the area chart
 */
function updateAreaChart (data) {
  let xScale = xAxisScale(data);
  let dataMetric = d3.select("#metric").property("value");
  let parsedate = d3.timeParse("%m/%d");
  updateXScale(data,xScale,"date");
  updateXAxis(data,xScale,"areasvg","date");
  let yScale = yAxisScale(data,dataMetric);
  updateYScale(data,dataMetric,yScale);
  updateYAxis(data,yScale,"areasvg");
  let area = d3.area()
            .x(function(d){return xScale(d.date);})
            .y0(function(d){return yScale.range()[0];})
            .y1(function(d){return yScale(d[dataMetric]);});

  d3.select(".area-chart")
    .datum(data)
    .transition()
    .duration(ANIMATION_DURATION)
    .attr("d",area);
}

/**
 * update the scatter plot.
 */

function updateScatterPlot (data) {
  console.log("updating scatter plot");
  let svgSelection = d3.select(".scattersvg");
  let xScale = xScatterScale(data);
  console.log(xScale.domain()+" "+xScale.range());
  //updateXScale(data,xScale,"cases");
  console.log(xScale.domain()+" "+xScale.range());
  updateXScatterAxis(data,xScale);
  let yScale = yAxisScale(data,"deaths");
  //updateYScale(data,"deaths",yScale);
  updateYAxis(data,yScale,"scattersvg");
  svgSelection.selectAll("circle")
          .data(data)
          .transition()
          .duration(ANIMATION_DURATION)
          .attr("cx",function(d){
            return xScale(d.cases);
          })
          .attr("cy",function(d){
            return yScale(d.deaths);
          })
          .attr("r",5);
}


/**
 * Update the data according to document settings
 */
function changeData () {
  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');

  d3.csv(`data/${dataFile}.csv`)
    .then(dataOutput => {

      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/

      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
      }));
      if (document.getElementById('random').checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset (data) {
  return data.filter((d) => Math.random() > 0.5);
}
