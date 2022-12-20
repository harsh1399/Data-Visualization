// ******* DATA LOADING *******
// We took care of that for you
async function loadData () {
  const covidData = await d3.csv('data/owid-covid.csv');
  const mapData = await d3.json('data/world.json');
  return { covidData, mapData };
}


// ******* STATE MANAGEMENT *******
// This should be all you need, but feel free to add to this if you need to 
// communicate across the visualizations
const globalApplicationState = {
  selectedLocations: [],
  covidData: null,
  mapData: null,
  worldMap: null,
  lineChart: null,
};


//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
  console.log('Here is the imported data:', loadedData.covidData);

  // Store the loaded data into the globalApplicationState
  globalApplicationState.covidData = loadedData.covidData;
  globalApplicationState.mapData = loadedData.mapData;

  // Creates the view objects with the global state passed in 
  const worldMap = new MapVis(globalApplicationState);
  const lineChart = new LineChart(globalApplicationState);

  globalApplicationState.worldMap = worldMap;
  globalApplicationState.lineChart = lineChart;

  //TODO add interactions for Clear Selected Countries button

  let clear_button = d3.select("#clear-button");
  clear_button.on("click",function(d){
    
    let selectedcountries = d3.selectAll(".selected")._groups[0];
    for(let i=0;i<globalApplicationState.selectedLocations.length;i++)
    {
      selectedcountries[i].removeAttribute("class");
      selectedcountries[i].setAttribute("class","country");
    }
    globalApplicationState.selectedLocations = [];
    const worldMap = new MapVis(globalApplicationState);
    const lineChart = new LineChart(globalApplicationState);
    globalApplicationState.worldMap = worldMap;
    globalApplicationState.lineChart = lineChart;
  });
});
