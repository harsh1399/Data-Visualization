class Bubblechart{
    constructor(words,table){
        this.words = words;
        this.table = table;
        console.log(words);
        this.grouped = false;
        this.groupedcategory = d3.groups(this.words,d=>d.category);
        this.groupedkeys = this.groupedcategory.keys();
        //console.log(this.groupedcategory);
        this.chartWidth = 700;
        this.chartHeight = 800;
        this.bubbleplotheight = this.chartHeight/6-10;
        this.textheight = this.bubbleplotheight-20;
        this.circleheight = this.bubbleplotheight-this.textheight;
        this.currentBrush = null;
        this.selectedElement = null; 
       
        this.svg = d3.select(".bubblechart")
                     .append("svg")
                     .attr('height',this.chartHeight)
                     .attr('width',this.chartWidth);
        this.tooltip = d3.select(".bubblechart")
                        .append("div")
                        .attr("id","tooltip")
                        .attr("opacity",0);
        this.storytelling = d3.select("#viz")
                        .append("div")
                        .attr("id","story")
                        .attr("opacity",0);
        //this.initializeTooltip();
        this.mainplot = this.svg.append('g')
                                .classed('main-plot',true)
                                .attr('transform','translate(10,20)');
        this.bubbleplot = this.mainplot.append('g')
                .classed('beeswarm-plot',true)
                .attr("transform","translate(0,60)");
        this.lineg = d3.select(".main-plot").append('g').classed('center-line',true).attr("transform","translate(0,50)");
        this.xscale= d3.scaleLinear()
                        .domain([d3.min(this.words,d=>d.sourceX),d3.max(this.words,d=>d.sourceX)])
                        .range([11,this.chartWidth-50 - 11]);
    }
    initializeTooltip(){
        this.tooltip.append("h4").text("a");
        this.tooltip.append("h5").text("b");
        this.tooltip.append("h6").text("c");
    }
    drawLegend(){
        let legend_group = this.mainplot.append('g')
                                    .classed("legend-group",true)
                                    .attr("transform","translate(0,0)");
        legend_group.append('g')
                    .append('text')
                    .text('Republican Leaning')
                    .classed('legend-text',true)
                    .attr("transform",`translate(${this.chartWidth-160},0)`);
        legend_group.append('g')
                    .append('text')
                    .text('Democratic Leaning')
                    .classed('legend-text',true)
                    .attr("transform",`translate(${0,0})`);
        let ticks_group = legend_group.append('g')
                    .classed('x-axis-ticks',true)
                    .attr("transform","translate(0,5)");
        let ticks_labels = legend_group.append('g')
                                        .classed('x-axis-labels',true)
                                        .attr("transform",'translate(0,13)')
        let ticks_length = legend_group.node().getBoundingClientRect().width;
        let ticks_height = legend_group.node().getBoundingClientRect().height-13;
        let arr = []
        let obj = {'x1':5,'y1':0,'x2':5,'y2': ticks_height,'label':50};
        arr.push(obj);
        let labels = [50,40,30,20,10,0,10,20,30,40,50];
        let diff = ticks_length/11;
        for(let i=1;i<11;i++){
            let x1 = arr[i-1]['x1'] + diff;
            let y1 = 0;
            let y2 = ticks_height;
            let x2 = x1;
            let label = labels[i]
            obj = {'x1':x1,'x2':x2,'y1':y1,'y2':y2,'label':label};
            arr.push(obj);
        }
        ticks_group.selectAll('line')
            .data(arr)
            .join('line')
            .attr('x1',d=>d.x1)
            .attr('y1',d=>d.y1)
            .attr('x2',d=>d.x2)
            .attr('y2',d=>d.y2)
            .attr("stroke","black");
        ticks_labels.selectAll('text')
            .data(arr)
            .join('text')
            .attr('x',d=> d.label == 0?d.x1-4: d.x1-7)
            .attr('y',15)
            .text(d=>d.label)
            .attr('fill','black');
    }
    centerline(){
        //console.log("centre line")
        let max_radius = 11,min_radius = 3;
        let beeswarmplot_height = Math.abs(d3.max(this.words,d=>d.sourceY) - d3.min(this.words,d=>d.sourceY)) + 2*max_radius;
        let max_width = d3.select(".main-plot").node().getBoundingClientRect().width;
        let xscale= d3.scaleLinear()
                        .domain([d3.min(this.words,d=>d.sourceX),d3.max(this.words,d=>d.sourceX)])
                        .range([0,max_width+131]);
        
        let isChecked = d3.select("#flexSwitchCheckChecked").node().checked;
        //console.log("center line-"+ isChecked);
        this.lineg.selectAll("line").remove();
        if(isChecked){
            this.lineg.append("line")
            .attr('x1',xscale(this.chartWidth/2)+4)
            .attr('y1',0)
            .attr('x2',xscale(this.chartWidth/2)+4)
            .transition()
            .duration(1000)
            .attr('y2',beeswarmplot_height*7+8)
            .attr('stroke','black');
        }
        else{
            this.lineg.append("line")
            .attr('x1',xscale(this.chartWidth/2)+4)
            .attr('y1',0)
            .attr('x2',xscale(this.chartWidth/2)+4)
            .transition()
            .duration(1000)
            .attr('y2',beeswarmplot_height+8)
            .attr('stroke','black');
        }
        
    }
    story(){
        console.log("stroy");
        let dembox =  d3.select("#story").append('div').attr('class','dem-box').attr("width","100px").attr("height","50px");
        let repbox =  d3.select("#story").append('div').attr('class','rep-box');
        d3.select("#story").transition().duration(5000).attr("opacity",1);
        d3.select(".dem-box").transition().duration(5000).attr("opacity",1);
        d3.select(".rep-box").transition().duration(5000).attr("opacity",1);
        d3.select(".dem-box").append("p").text("Democratic speeches mentioned climate change 49.11% more");
        d3.select(".rep-box").append("p").text("Republican speeches mentioned prison 52.33% more");
        dembox.style("left",0+"px").style("top",175+"px");
        repbox.style("left",500+"px").style("top",180+"px");
        let max_radius = 11,min_radius = 3;
        let max_width = this.chartWidth - 50
        let xscale= d3.scaleLinear()
        .domain([d3.min(this.words,d=>d.sourceX),d3.max(this.words,d=>d.sourceX)])
        .range([max_radius,max_width - max_radius]);
        let min_position = d3.min(this.words,d=>xscale(d.sourceX));
        let max_position = d3.max(this.words,d=>xscale(d.sourceX));
        let circle = d3.selectAll("circle").filter(d=> Math.abs(xscale(d.sourceX)) !== min_position || Math.abs(xscale(d.sourceX)) !== max_position);
        //let flush = d3.selectAll("circle").filter(()=>{console.log(this.currentTarget)});//this!==circle[0] || this!==circle[1]})
        circle.classed('bg-circle-brush',true);
        d3.selectAll("circle").filter(d=>Math.abs(xscale(d.sourceX)) === min_position).classed('bg-circle-brush',false);
        d3.selectAll("circle").filter(d=>Math.abs(xscale(d.sourceX)) === max_position).classed('bg-circle-brush',false);
    }
    createTooltip(e,d){
        //console.log(e);
        //console.log(d);
        d3.select("#tooltip").transition().duration(2000).attr("opacity",0.7);
        //d3.select("#tooltip").transition().duration(2000).style("display","none");
        d3.select("#tooltip").append("h4").text(d.phrase[0].toUpperCase()+d.phrase.substring(1));
        let position_text = d.position<0? `D+ ${Math.abs(Number(d.position).toFixed(2))}` : `R+ ${Math.abs(Number(d.position).toFixed(2))}`
        d3.select("#tooltip").append("h5").text(position_text);
        d3.select("#tooltip").append("h6").text("In "+Math.round(((d.total/50)*100))+"% of speeches");
        d3.select("#tooltip").style("left",e.pageX+20+"px").style("top",e.pageY+20+"px");
        d3.select(e.currentTarget).style("stroke","black").style("stroke-width",2);
    }
    removeTooltip(e){
        //console.log("remove tooltip");
        d3.select("#tooltip").attr("opacity", 0);
        d3.select(e.currentTarget).style("stroke", "black").style("stroke-width", 0.6);
        d3.select("#tooltip").selectAll("*").remove();
    }
    drawBubbleChart(){
        //brush.clear().event(d3.select(".brush"));
        
        let max_width = this.chartWidth - 50
        let max_radius = 11,min_radius = 3;
        //let beeswarmplot_height = Math.abs(d3.max(this.words,d=>d.sourceY) - d3.min(this.words,d=>d.sourceY)) + 2*max_radius; 
        //console.log(beeswarmplot_height);
        let xscale= d3.scaleLinear()
                        .domain([d3.min(this.words,d=>d.sourceX),d3.max(this.words,d=>d.sourceX)])
                        .range([max_radius,max_width - max_radius]);
        
        let yscale = d3.scaleLinear()
                        .domain([0,this.groupedcategory.length])
                        .range([0,this.chartHeight-this.bubbleplotheight]);
        let sizescale = d3.scaleLinear()
                        .domain([d3.min(this.words,d=>Number(d.total)),d3.max(this.words,d=>Number(d.total))])
                        .range([min_radius,max_radius]);
        let colorscale = d3.scaleOrdinal()
                         .domain(this.groupedkeys)
                         .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]);
                         //.range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]);
        /*let y_scale_circle_source = d3.scaleLinear()
                                        .domain([d3.min(this.words,d=>d.sourceY),d3.max(this.words,d=>d.sourceY)])
                                        .range([0,beeswarmplot_height-2*max_radius]);
        let y_scale_circle_corrected = d3.scaleLinear()
                                .domain([d3.min(this.words,d=>d.correctedY),d3.max(this.words,d=>d.correctedY)])
                                .range([0,beeswarmplot_height-2*max_radius]);
        
        */                        
        let isChecked = d3.select("#flexSwitchCheckChecked").node().checked;
        //console.log(isChecked);
        let groupdata = this.groupedcategory; 
        let keys = [];
        let count = 0;
        for(const key in this.groupedcategory)
        {
            keys.push({'key': this.groupedcategory[key][0],'index':count});
            count += 1;
        }
        //console.log(keys);
        let data = [this.words];
        if(isChecked)
            data =  keys;
        //console.log(data);
        const inst = this;
        let beeswarm_group = this.bubbleplot.selectAll('.beeswarm-group')
                                            .data(data)
                                            .join(function(enter){
                                                return enter.append('g')
                                                    .classed('beeswarm-group',true)
                                                    .attr('transform','translate(0,0)')
                                                    .style("margin-bottom","10px")
                                                    .call(enter=>enter.transition()
                                                                        .duration(1000)
                                                                        .attr("transform",(d,i)=>`translate(0,${i*inst.bubbleplotheight})`))   
                                            },
                                            function(update){
                                                return update
                                                    .classed('beeswarm-group',true)
                                                    .attr('transform','translate(0,0)')
                                                    .style("margin-bottom","10px")
                                                    .call(enter=>enter.transition()
                                                                        .duration(1000)
                                                                        .attr("transform",(d,i)=>`translate(0,${i*inst.bubbleplotheight})`))
                                            },
                                            function(exit){
                                                return exit.lower().call(exit=>exit.transition()
                                                                            .duration(1000)
                                                                            .attr("transform","translate(0,0)")
                                                                            .remove())
                                            });
        //console.log(beeswarm_group);
        let circle_group = beeswarm_group.selectAll('.circle-group')
                                                .data(data=>[data])
                                                .join("g")
                                                .classed('circle-group',true)
                                                .attr('transform','translate(0,60)');
        const that = this
        let circles = circle_group.selectAll('circle')
                                     .data(d=>isChecked?this.groupedcategory.find(item=>item[0] === d.key)[1] : d)
                                     .join(function(enter){
                                        return enter.append('circle')
                                                    .attr('cx',d=> {
                                                        //console.log(!isChecked ? console.log("moveX"):console.log("sourceX"));
                                                        return !isChecked ? xscale(d.moveX):xscale(d.sourceX)})
                                                    .attr('cy',d=> {
                                                        //console.log(!isChecked ? console.log("moveY"):console.log("sourceY"));
                                                        //return !isChecked ? y_scale_circle_corrected(d.correctedY):y_scale_circle_source(d.sourceY)
                                                        return !isChecked ? d.correctedY:d.sourceY
                                                    })
                                                    .attr('r',d=>sizescale(Number(d.total)))
                                                    .attr('fill',d=>colorscale(d.category))
                                                    .style("opacity",0)
                                                    .on("mouseover",(e,d)=>that.createTooltip(e,d))
                                                    .on("mouseout",(e)=>that.removeTooltip(e))
                                                    .call(enter=>{
                                                        enter.transition()
                                                            .duration(1000)
                                                            .style("opacity",1)
                                                            .transition().duration(1000)
                                                            .attr('cx',d=> isChecked? xscale(d.moveX):xscale(d.sourceX))
                                                            .attr('cy',d=> isChecked ? d.correctedY:d.sourceY)
                                                    })

                                     },
                                     function(update){
                                        return update
                                            .on("mouseover",(e,d)=>that.createTooltip(e,d))
                                            .on("mouseout",(e)=>that.removeTooltip(e))
                                            .call(update=>{
                                            update.transition()
                                                    .duration(1000)
                                                    .style("opacity",1)
                                                    .attr('cx',d=> isChecked?xscale(d.moveX):xscale(d.sourceX))
                                                    .attr('cy',d=> isChecked?d.correctedY:d.sourceY)
                                                    .attr('r',d=>sizescale(Number(d.total)))
                                                    .attr('fill',d=>colorscale(d.category))
                                        })
                                     },
                                     function(exit){
                                        return exit.attr('cx',d=>isChecked?xscale(d.moveX):xscale(d.sourceX))
                                                    .attr('cy',d=>isChecked? d.correctedY:d.sourceY)
                                                    .remove();
                                     })
        //console.log(this.groupedcategory);
        let text_group = beeswarm_group.selectAll('.text-label')
                                        .data(d=>[d])
                                        .join('g')
                                        .classed('text-label',true);
        text_group.selectAll('text')
                    .data(d=>[d])
                    .join('text')
                    .text(d=>d.key)
                    .attr("transform","translate(0,0)");
        this.centerline();
        //console.log(d3.select(".beeswarm-plot").node().getBoundingClientRect().height);
    }
    
    brush(){
        let swarmgroup_brush = d3.selectAll(".beeswarm-group")
                            .selectAll('.brush')
                            .data(d=>[d])
                            .join("g")
                            .classed('brush',true);
        let width = d3.select(".beeswarm-group").node().getBBox().width;
        let isChecked = d3.select("#flexSwitchCheckChecked").node().checked;
        const that = this;
        console.log(that.currentBrush);
        let brush = null;
        swarmgroup_brush.each(function(d){
            //console.log("for each swarmgroup brush");
            if(isChecked){
                brush = d3.brushX().extent([[0,0],[width+10,that.bubbleplotheight-10]]);
            }
            else{
                brush = d3.brushX().extent([[0,0],[width+10,that.bubbleplotheight-3]]);
            }
            brush.on("start",function(e){
                if(that.currentBrush && that.selectedElement !== d3.select(this)){
                    that.selectedElement.call(that.currentBrush.move,null);
                }
                that.currentBrush = brush;
                that.selectedElement = d3.select(this);
                //console.log("in start")
                //console.log(e)
            })
            .on("brush",function(e){
                const selection = e.selection;
                    const selectedIndices = [];
                    let selectedData = [];
                    let selectedcircles =null;
                    let parent = d3.select(d3.select(this).node().parentNode);
                    if (selection) {
                        const [left, top] = selection;
                        parent.selectAll("circle").each((d, i) => {
                            if (
                                d.sourceX >= that.xscale.invert(left) &&
                                d.sourceX <= that.xscale.invert(top)
                            ) {
                                selectedIndices.push(i);
                            }
                        });
                        d3.selectAll("circle").classed('bg-circle-brush',true);
                    //marks.classed("highlight", false);

                        if (selectedIndices.length > 0) {
                            selectedcircles = parent.selectAll("circle")
                                .filter((_, i) => {
                                    return selectedIndices.includes(i);
                                })
                                .classed('bg-circle-brush', false);
                            //console.log(selectedcircles);
                        }
                        if(!selectedcircles.empty())
                        selectedcircles.each(function(d){
                            selectedData.push(d);
                        });
                        console.log(selectedData);
                        that.table.updateTable(selectedData);
                    }
                    else{
                        console.log("no selection");
                        d3.selectAll("circle").classed('bg-circle-brush',false);
                        that.table.updateTable(that.words);    
                    }     
            })
            .on("end",function(e){
                    const selection = e.selection;
                    const selectedIndices = [];
                    let selectedcircles = null;
                    let selectedData = [];
                    let parent = d3.select(d3.select(this).node().parentNode);
                    if (selection) {
                        const [left, right] = selection;
                        parent.selectAll("circle").each((d, i) => {
                            //console.log(d);
                            if (
                                d.sourceX >= that.xscale.invert(left) &&
                                d.sourceX <= that.xscale.invert(right)
                            ) {
                                selectedIndices.push(i);
                            }
                        });
                        d3.selectAll("circle").classed('bg-circle-brush',true);
                    //marks.classed("highlight", false);

                        if (selectedIndices.length > 0) {
                            selectedcircles  =parent.selectAll("circle")
                                .filter((_, i) => {
                                    return selectedIndices.includes(i);
                                })
                                .classed('bg-circle-brush', false);
                                console.log(selectedcircles);
                        }
                        selectedcircles.each(function(d){
                            selectedData.push(d);
                        });
                        console.log(selectedData);
                        that.table.updateTable(selectedData);
                        
                    }
                    else{
                        console.log("no selection");
                        d3.selectAll("circle").classed('bg-circle-brush',false);    
                        that.table.updateTable(that.words);
                    }
            })
            d3.select(this).call(brush);
        })
       d3.select('.circle-group').raise(); 
        //swarmgroup_brush.call(brush);
    }
    tooltip(event,div){
        div.transition()
            .duration(200)
            .style("opacity",0.9);
        
        d3.select(event.currentTarget).attr('r',d=>Number(d.total)+20);
    }
    
    drawBchart() {
        this.drawLegend();   
        this.drawBubbleChart();
        this.brush();
        //this.story();
        //this.centerline();
        //this.updateData();
    }
}
