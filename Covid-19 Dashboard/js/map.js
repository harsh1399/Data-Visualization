/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState;
    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]); // This moves the map to the center of the SVG
    let path = d3.geoPath()
                 .projection(projection);
    console.log(this.globalApplicationState.mapData);
    let geojson = topojson.feature(this.globalApplicationState.mapData,this.globalApplicationState.mapData.objects.countries)
   
    let svgselection = d3.select("#countries");
    for(let i = 0;i<geojson.features.length;i++){
      geojson.features[i].maxcases = -99;
      if(geojson.features[i].id !== '-99'){
        let country = this.globalApplicationState.covidData.filter(data => data.iso_code === geojson.features[i].id);
        let max_cases = Math.max.apply(Math,country.map(function(data){return Number(data.total_cases_per_million);}));    
        geojson.features[i].maxcases = max_cases;
      }
    }
    
    let maxcase = d3.max(geojson.features,function(d){return d.maxcases;});
    //Color scale for map
    var color = d3.scaleQuantize()
                  .range(["rgb(254,240,217)", "rgb(253,204,138)",
                  "rgb(252,141,89)", "rgb(227,74,51)", "rgb(179,0,0)"])
                  .domain([0,maxcase]);
    console.log(color.domain());

    //path for countries
    svgselection.selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d",path)
                .attr("name",function(d){return d.id;})
                .attr("class","country")
                .style("fill",function(d){
                  let cases = d.maxcases;
                  if(cases !== -99)
                  {
                    return color(cases);
                  }
                  else{
                    return "#ccc";
                  }
                });
    //GRATICULE            
    let graticule = d3.geoGraticule();       
    let graticuletag = d3.select("#graticules");
    graticuletag.append("path")
                .attr('d',path(graticule()))
                .attr("fill",'none')
                .attr('stroke','black')
                .style('opacity',0.2);
    graticuletag.append("path")
                .attr('d',path(graticule.outline()))
                .attr("fill",'none')
                .attr('stroke','black')
                .style('opacity',1);

    // legend for map - color gradient
    let legend = d3.select('#legend')
                .append('rect')
                .attr('width', 150)
                .attr('y', 0)
                .attr('height', 30)
                .attr('fill', 'url(#color-gradient)');
      
                
    d3.select("#legend")
      .append("text")
      .style('fill','black')
      .attr('x',0)
      .attr('y',0)
      .text("0");
    
    d3.select("#legend")
      .append("text")
      .style('fill','black')
      .attr('x',150-30)
      .attr('y',0)
      .text(Math.floor((maxcase/1000))+"k");
    d3.select("#legend")
      .attr("transform","translate(0,"+ (500- 30)+")");
    this.updateSelectedCountries();
      
  }

  updateSelectedCountries () {
    let country = d3.select("#countries");
    
    country.on('click',function(d,i){
      let iso = d.target.getAttribute("name");
      if(globalApplicationState.selectedLocations.length === 0){
        globalApplicationState.selectedLocations.push(iso);
        d.target.setAttribute("class","country selected");
      }
      else{
        let presentalready = globalApplicationState.selectedLocations.filter(data => data === iso);
        let index = globalApplicationState.selectedLocations.indexOf(presentalready[0]);
        if(presentalready.length>0){
          globalApplicationState.selectedLocations.splice(index,1);
          d.target.removeAttribute("class");
          d.target.setAttribute("class","country");
        }
        else{
          globalApplicationState.selectedLocations.push(iso);
          d.target.setAttribute("class","country selected");
        }
      }
      const linechart = new LineChart(globalApplicationState);
      linechart.updateSelectedCountries();
    });
  }
}
