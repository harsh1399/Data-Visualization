let words = d3.json('./data/words.json');

Promise.all([words]).then( data =>
    {
        let words = data[0];
       
        let selected = false;
        let table_chart = new Table(words);
        let bubble_chart = new Bubblechart(words,table_chart);
        bubble_chart.drawBchart();
        d3.select("#flexSwitchCheckChecked").on("click",function(){
            bubble_chart.drawBubbleChart();
            bubble_chart.brush();
            // //bubble_chart.currentBrush = null;
            // d3.selectAll(".brush").each((d,i,f)=>{
            //     console.log(f[0]);
            //     f[0].__brush.extent=[[0,0],[0,0]];
            //     f[0].call(f[0].__brush);
            // })
        });
        table_chart.drawTable(words);
        d3.select("button").on("click",function(){
            if(!selected){
                console.log("seleted");
                bubble_chart.story();
                selected=true;
            }
            else{
                d3.select("#story").selectAll("*").remove();
                selected = false;
                d3.selectAll("circle").classed("bg-circle-brush",false);
            }
        });
        // d3.select("#viz").on("click",function(){
        //     d3.select("#story").selectAll("*").remove();
        //     selected = false;
        //     d3.selectAll("circle").classed("bg-circle-brush",false);
        // });
    
    });