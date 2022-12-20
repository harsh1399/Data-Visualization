/** Class representing the line chart view. */
const PADDING = {
  LEFT:80,
  RIGHT:50,
  BOTTOM:50,
  TOP:50
};
const LINE_CHART_WIDTH = 700;
const LINE_CHART_HEIGHT = 500;
let xScale;
let yScale; 
class LineChart {
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState;
    //filtering continents
    let continents = this.globalApplicationState.covidData.filter(function(d){
      return d.iso_code.substring(0,4) === "OWID";
    });

    //grouping of continents
    let conti_groups = d3.group(continents,(d)=>d.location);

    //min cases in continent
    let minCasesCont = d3.min(conti_groups,function(d){
      return d3.min(d[1],function(data){
        return Number(data.total_cases_per_million);
      });
    });

    //max cases in continent
    let maxCasesCont = d3.max(conti_groups,function(d){
      return d3.max(d[1],function(data){
        return Number(data.total_cases_per_million);
      });
    });
    let parsedate = d3.timeParse("%Y-%m-%d");
    
    let mindate = d3.min(conti_groups,function(d){
      return d3.min(d[1],function(data){
        return parsedate(data.date);
      });
    });
  
    let maxdate = d3.max(conti_groups,function(d){
      return d3.max(d[1],function(data){
        return parsedate(data.date);
      });
    });
     
    // setting up y-scale
    yScale = d3.scaleLinear()
               .domain([minCasesCont,maxCasesCont])
               .range([LINE_CHART_HEIGHT - PADDING.TOP, PADDING.BOTTOM]).nice();
    //setting up x-scale
    xScale = d3.scaleTime()
               .domain([mindate,maxdate])
               .range([PADDING.LEFT,LINE_CHART_WIDTH - PADDING.RIGHT]).nice();
                
    const formatter = new Intl.DateTimeFormat('en-us', { month: 'short' });   
    
    //x axis
    let xaxis = d3.axisBottom()
                  .scale(xScale)
                  .tickFormat(function(d,i){
                    return formatter.format(d)+" "+d.getFullYear();
                    console.log(d.getFullYear());
                    console.log(formatter.format(d));
                  });
    let x_axis = d3.select("#x-axis");
    x_axis.attr("transform","translate(0,"+(LINE_CHART_HEIGHT- PADDING.BOTTOM)+")")
          .call(xaxis);
    
    //y axis      
    let yaxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(7);
    let y_axis = d3.select("#y-axis");
    y_axis.attr("transform","translate("+PADDING.LEFT+",0)")
          .call(yaxis);

    let linechart = d3.select('#lines');

    //COLOR SCALE FOR LINE CHART
    let linecolor = d3.scaleOrdinal(d3.schemeTableau10).domain(conti_groups.keys());
    let f = function(data){ 
        return xScale(parsedate(data.date));
    };
    let dline = d3.line()
                  .x(function(d){return f(data);})
                  .y(function(d){return yScale(Number(d.total_cases_per_million))});
    
    //ADDING LINES              
    linechart.selectAll('path')
             .data(conti_groups)
             .join('path')
             .attr('fill','none')
             .attr('stroke',([group,values])=>linecolor(group))
             .attr('stroke-width',1)
             .attr('d',([group,values])=>d3.line()
                                         .x(function(d){return xScale(parsedate(d.date));})
                                         .y((d)=>yScale(Number(d.total_cases_per_million)))
                                         (values));

    //X-AXIS LABEL                                     
    d3.select("#line-chart")
      .append('text')
      .attr("class",'x label')
      .attr('text-anchor','end')
      .attr('x',LINE_CHART_WIDTH/2)
      .attr('y',LINE_CHART_HEIGHT)
      .text("Dates");

    // Y-AXIS LABEL 
    d3.select("#line-chart")
      .append('text')
      .attr("class",'y label')
      .attr('text-anchor','end')
      .attr('x',-LINE_CHART_WIDTH/4)
      .attr('y',PADDING.RIGHT-25)
      .attr("transform","rotate(-90)")
      .text("Cases per million");

     // MOUSE HOVER EVENT 
     d3.select("#line-chart").on("mousemove",(event)=>{
      if(d3.pointer(event)[0]>PADDING.LEFT && d3.pointer(event)[0]<LINE_CHART_WIDTH-PADDING.RIGHT){
        d3.select("#overlay")
          .select('line')
          .attr('stroke','black')
          .attr('x1',d3.pointer(event)[0])
          .attr('x2',d3.pointer(event)[0])
          .attr('y1',LINE_CHART_HEIGHT-PADDING.TOP)
          .attr('y2',PADDING.BOTTOM);
        
        let dateHovered = xScale.invert(d3.pointer(event)[0]);
        let datestr = dateHovered.getFullYear()+"-"+('0'+(dateHovered.getMonth()+1)).slice(-2) + "-" + ('0'+(dateHovered.getDate())).slice(-2);
        let arr = [];
        for(let value of conti_groups.values())
        {
          arr.push(value.filter((row)=>row.date === datestr));
        }
        let compare = function(a,b){
          if(Number(a[0].total_cases_per_million)>Number(b[0].total_cases_per_million))
            return -1;
          else if(Number(a[0].total_cases_per_million)<Number(b[0].total_cases_per_million))
            return 1;
          return 0;
        };
        let overlaytext = function(d){
          let str = d[0].location+", ";
          if(d[0].total_cases_per_million>1000)
            str = str + Math.floor(d[0].total_cases_per_million/1000) + "k"
          else
            str = str + d[0].total_cases_per_million;
          return str;
        };
        arr.sort(compare);
        d3.select("#overlay")
          .selectAll("text")
          .data(arr)
          .join('text')
          .text((d)=>overlaytext(d))
          .attr('x',d3.pointer(event)[0]>(LINE_CHART_WIDTH - d3.select("#overlay").node().getBoundingClientRect().width) ? d3.pointer(event)[0]-d3.select("#overlay").node().getBoundingClientRect().width : d3.pointer(event)[0]+10)
          .attr('y',(d,i)=>20*i + PADDING.TOP)
          .attr('alignment-baseline','hanging')
          .attr('fill',(d)=>linecolor(d[0].location));
      }
    });
                    
  }

  updateSelectedCountries () {
    let country_filter = [];
    for(const country of globalApplicationState.selectedLocations){
      globalApplicationState.covidData.filter(function(d){
        if(d.iso_code === country){
          country_filter.push(d);
        }
        return d.iso_code === country;
      }); 
    }
    //let country_groups={};
    let country_groups = d3.group(country_filter,(d)=>d.location);

    let minCasesCont = d3.min(country_groups,function(d){
      return d3.min(d[1],function(data){
        return Number(data.total_cases_per_million);
      });
    });
    let maxCasesCont = d3.max(country_groups,function(d){
      return d3.max(d[1],function(data){
        return Number(data.total_cases_per_million);
      });
    });
    
    let parsedate = d3.timeParse("%Y-%m-%d");
    
    let mindate = d3.min(country_groups,function(d){
      return d3.min(d[1],function(data){
        return parsedate(data.date);
      });
    });
    //console.log(mindate);
    let maxdate = d3.max(country_groups,function(d){
      return d3.max(d[1],function(data){
        return parsedate(data.date);
      });
    });
    xScale.domain([mindate,maxdate]).nice();
    yScale.domain([minCasesCont,maxCasesCont]).nice();
    const formatter = new Intl.DateTimeFormat('en-us', { month: 'short' });
    let xaxis = d3.axisBottom()
                  .scale(xScale)
                  .tickFormat(function(d,i){
                    return formatter.format(d)+" "+d.getFullYear();
                    console.log(d.getFullYear());
                    console.log(formatter.format(d));
                  });
    let x_axis = d3.select("#x-axis");
    x_axis.transition()
          .duration(1000)
          .call(xaxis);
    
    let yaxis = d3.axisLeft()
                  .scale(yScale);
    let y_axis = d3.select("#y-axis");
    y_axis.transition()
          .duration(1000)
          .call(yaxis);

    let linechart = d3.select('#lines');
    let linecolor = d3.scaleOrdinal(d3.schemeTableau10).domain(country_groups.keys());
    let f = function(data){ 
        return xScale(parsedate(data.date));
    };
    let dline = d3.line()
                  .x(function(d){return f(data);})
                  .y(function(d){return yScale(Number(d.total_cases_per_million))});    
    linechart.selectAll('path')
             .data(country_groups)
             .join('path')
             .attr('fill','none')
             .attr('stroke',([group,values])=>linecolor(group))
             .attr('stroke-width',1)
             .attr('d',([group,values])=>d3.line()
                                         .x(function(d){return xScale(parsedate(d.date));})
                                         .y((d)=>yScale(Number(d.total_cases_per_million)))
                                         (values));

    d3.select("#line-chart").on("mousemove",(event)=>{
      if(d3.pointer(event)[0]>PADDING.LEFT && d3.pointer(event)[0]<LINE_CHART_WIDTH-PADDING.RIGHT){
        d3.select("#overlay")
          .select('line')
          .attr('stroke','black')
          .attr('x1',d3.pointer(event)[0])
          .attr('x2',d3.pointer(event)[0])
          .attr('y1',LINE_CHART_HEIGHT-PADDING.TOP)
          .attr('y2',PADDING.BOTTOM);
        
        let dateHovered = xScale.invert(d3.pointer(event)[0]);
        let datestr = dateHovered.getFullYear()+"-"+('0'+(dateHovered.getMonth()+1)).slice(-2) + "-" + ('0'+(dateHovered.getDate())).slice(-2);
        let arr = [];
        for(let value of country_groups.values())
        {
          arr.push(value.filter((row)=>row.date === datestr));
        }
        let compare = function(a,b){
          if(Number(a[0].total_cases_per_million)>Number(b[0].total_cases_per_million))
            return -1;
          else if(Number(a[0].total_cases_per_million)<Number(b[0].total_cases_per_million))
            return 1;
          return 0;
        };
        let overlaytext = function(d){
          let str = d[0].location+", ";
          if(d[0].total_cases_per_million>1000)
            str = str + Math.floor(d[0].total_cases_per_million/1000) + "k"
          else
            str = str + d[0].total_cases_per_million;
          return str;
        };
        
        arr.sort(compare);
        d3.select("#overlay")
          .selectAll("text")
          .data(arr)
          .join('text')
          .text((d)=>overlaytext(d))
          .attr('x',d3.pointer(event)[0]>(LINE_CHART_WIDTH - d3.select("#overlay").node().getBoundingClientRect().width) ? d3.pointer(event)[0]-d3.select("#overlay").node().getBoundingClientRect().width : d3.pointer(event)[0]+10)
          .attr('y',(d,i)=>20*i + PADDING.TOP)
          .attr('alignment-baseline','hanging')
          .attr('fill',(d)=>linecolor(d[0].location));
      }
    });
  }
}
