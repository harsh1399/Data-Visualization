class Table{
    constructor(words){
        this.words = words;
        this.table_svgwidth = 590;
        this.width = {'Phrase':160,'Frequency':160,'Percentages':190,'Total':40};
        this.translate = [0,170,340,540];
        this.sorted = false; 
        this.data = [];
        for(const word in words){
            let obj = {'phrase':words[word].phrase,
                'frequency':{'f':Number(words[word].total)/50,'category':words[word].category},
                'percentages':{'dem':Number(words[word].percent_of_d_speeches),'rep':Number(words[word].percent_of_r_speeches)},
                'total':words[word].total
            };
            this.data.push(obj);
        }
        //console.log(this.data);
        this.svg = d3.select(".table").append("svg").attr("width",590).attr("height",words.length*25+50);
        this.groupeddata = d3.groups(this.words,d=>d.category);
        
        //console.log(this.groupeddata);
        this.table_group = this.svg.append('g').classed("table-group",true);
        this.table_body = this.table_group.append('g').classed("table-body",true).attr("transform","translate(10,75)");
        this.table_head = this.table_group.append('g').classed("table-head",true).attr("transform","translate(10,0)");
        this.xscale_freq = d3.scaleLinear()
                            .domain([0,d3.max(this.data,d=>d.frequency.f)])
                            .range([0,140]);
        this.xscale_percentage_dem = d3.scaleLinear()
                                    .domain([d3.min(this.data,d=>d.percentages.dem),d3.max(this.data,d=>d.percentages.dem)])
                                    .range([0,85]);
        this.xscale_percentage_rep = d3.scaleLinear()
                                    .domain([d3.min(this.data,d=>d.percentages.rep),d3.max(this.data,d=>d.percentages.rep)])
                                    .range([0,85]);
        this.colorscale = d3.scaleOrdinal()
                                    .domain(this.groupeddata.keys())
                                    .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]);
    }
    comparefunc(a,b,key,that){
        key = key[0].toLowerCase() + key.substring(1);
        if(that.sorted){
            console.log("sorted");
            if(key === 'frequency'){
                return b[key].f - a[key].f;
            }
            else if(key === 'phrase'){
                return a[key]<b[key]?1:-1;
            }
            else if(key === 'total'){
                return Number(b[key]) - Number(a[key]);
            }
            else{
                return (b[key].dem+b[key].rep) - (a[key].dem+a[key].rep) 
            }
        }
        else{
            if(key === 'frequency' ){
                return a[key].f - b[key].f;
            }
            else if(key === 'phrase'){
                return a[key]<b[key]?-1:1;
            }
            else if(key === 'total'){
                return Number(a[key]) - Number(b[key]);
            }
            else{
                return (a[key].dem+a[key].rep) - (b[key].dem+b[key].rep) 
            }
        }
    }
    sortTable(event,index,that){
        //console.log(d);
        //console.log(i);
        //console.log(that.data);
        that.data = that.data.sort((a,b)=>that.comparefunc(a,b,index,that))
        //console.log(that.data);
        that.drawBody();
        that.sorted =!that.sorted;
    }

    drawLegend(){
        console.log("draw legend");
        let diff=  this.table_svgwidth/4;
        let tags = ['Phrase','Frequency','Percentages','Total']
        //let width ={'Phrase':130,'Frequency':160,'Percentages':190,'Total':70}
        //let translate = [0,140,310,510]
        let table_headers = this.table_head.selectAll('g')
                        .data(tags)
                        .join('g')
                        .classed('table-header',true)
                        .attr("transform",(d,i)=>i === 0?`translate(0,0)`:`translate(${this.translate[i]},0)`)
        /*for(let i=0;i<4;i++){
            this.table_head.append('g').classed('table-header',true).attr("transform",`translate(${i*diff},0)`)
        }*/
        table_headers.selectAll('rect')
                            .data(d=>[d])
                            .join("rect")
                            .attr("width",d=>this.width[d])
                            .attr("height",50)
                            .attr("fill","lightblue");
        table_headers.selectAll("text")
                            .data(d=>[d])
                            .join("text")
                            .text(d=>d)
                            .attr("transform",(d,i)=>`translate(${this.width[d]/2},17)`)
                            .style("text-anchor","middle");
        let ticks = ["0.0","0.5","1.0"]
        
        let ticks_group = this.table_head.select(".table-header:nth-child(2)").append('g').classed('ticks',true).attr("transform","translate(10,40)");
        ticks_group.selectAll("line")
                    .data(ticks)
                    .join("line")
                    .attr('x1',(d,i)=>(140/2)*i)
                    .attr('y1',0)
                    .attr('x2',(d,i)=>(140/2)*i )
                    .attr('y2',7)
                    .attr("stroke","black");
        let labels_group = this.table_head.select(".table-header:nth-child(2)").append('g').classed('labels',true).attr("transform","translate(10,35)");        
        labels_group.selectAll("text")
                    .data(ticks)
                    .join("text")
                    .attr('x',(d,i)=>(140/2)*i-8)
                    .text(d=>d)
                    .style("font-size","13px");
        //console.log(this.table_head.select(".table-header:nth-child(3)"));
        let percentage_ticks = ["100","50","0","50","100"]
        let ticks_group_percentage = this.table_head.select(".table-header:nth-child(3)").append('g').classed('ticks',true).attr("transform","translate(10,40)");
        ticks_group_percentage.selectAll("line")
                    .data(percentage_ticks)
                    .join("line")
                    .attr('x1',(d,i)=>(170/4)*i)
                    .attr('y1',0)
                    .attr('x2',(d,i)=>(170/4)*i )
                    .attr('y2',7)
                    .attr("stroke","black");
        let labels_group_percentage = this.table_head.select(".table-header:nth-child(3)").append('g').classed('labels',true).attr("transform","translate(10,35)");        
        labels_group_percentage.selectAll("text")
                    .data(percentage_ticks)
                    .join("text")
                    .attr('x',(d,i)=>d==0?(170/4)*i-4:(170/4)*i-9)
                    .text(d=>d)
                    .style("font-size","13px");
        const that = this;
        table_headers.on("click",(event,index)=>{this.sortTable(event,index,that)})
    }
    drawBody(){    
        let row_height = 25;
        let table_rows = this.table_body.selectAll(".table-row")
                        .data(this.data)
                        .join('g')
                        .classed("table-row",true)
                        .attr("transform",(d,i)=>`translate(0,${row_height*i})`);
        //table_rows.selectAll('.table-data')
        //            .data()
        //console.log(Object.entries(this.data[0]));
        let table_data = table_rows.selectAll('.table-data')
                    .data(d=> Object.entries(d))
                    .join('g')
                    .classed('table-data',true)
                    .attr("transform",(d,i)=>`translate(${this.translate[i]},0)`)
        //console.log(table_data.filter(d=>{console.log(d); return true;}));
                    //table_data.filter(d=>d[0] === "")
        d3.selectAll('.table-data')
            .filter(d=>d[0]==='phrase')
            .selectAll('text')
            .data(d=>[d])
            .join('text')
            .text(d=>d[1]);
        
        d3.selectAll('.table-data')
            .filter(d=>d[0]==='total')
            .selectAll('text')
            .data(d=>[d])
            .join('text')
            .text(d=>d[1])
            .attr("transform",d=>`translate(20,0)`)
            .style("text-anchor","middle");
        
        let freq_rect = d3.selectAll('.table-data')
        .filter(d=>d[0]==='frequency')
        .selectAll("rect")
        .data(d=>[d[1]])
        .join("rect")
        .attr('x',0)
        .attr('y',-16)
        .attr('width',d=>this.xscale_freq(d.f))
        .attr('height',23)
        .attr("fill",d=>this.colorscale(d.category))
        .attr('transform',`translate(10,0)`)
        .classed("freq-rect",true);
        //console.log(freq_rect);
        let dem_rectg = d3.selectAll('.table-data')
            .filter(d=>d[0]==='percentages')
            .selectAll(".rects")
            .data(d=>Object.entries(d[1]))
            .join("g")
            .attr("class",d=>{return `${d[0]} rects`})
            .attr('transform',d=>d[0]==='dem'?`translate(10,0)`:`translate(95,0)`);
        
        d3.selectAll(".dem")
            .selectAll("rect")
            .data(d=>[d])
            .join("rect")
            .attr('x',d=>{return 85 - this.xscale_percentage_dem(Number(d[1]))})
            .attr('y',-16)
            .attr('width',d=>this.xscale_percentage_dem(Number(d[1])))
            .attr('height',23)
            .attr('transform','translate(0,0)')
            .attr("fill","#6CACE4");
        
        d3.selectAll(".rep")
            .selectAll("rect")
            .data(d=>[d])
            .join("rect")
            .attr('x',2)
            .attr('y',-16)
            .attr('width',d=>this.xscale_percentage_rep(Number(d[1])))
            .attr('height',23)
            .attr('transform','translate(0,0)')
            .attr('fill'," #c14a09");

    }
    drawTable(words){
        let data = [];
        for(const word in words){
            let obj = {'phrase':words[word].phrase,
                'frequency':{'f':Number(words[word].total)/50,'category':words[word].category},
                'percentages':{'dem':Number(words[word].percent_of_d_speeches),'rep':Number(words[word].percent_of_r_speeches)},
                'total':words[word].total
            };
            data.push(obj);
        }
        this.data = data;
        //let groupeddata = d3.groups(words,d=>d.category);
        this.drawLegend();
        this.drawBody();
    }
    updateTable(newdata) {
        let data = [];
        for(const word in newdata){
            let obj = {'phrase':newdata[word].phrase,
                'frequency':{'f':Number(newdata[word].total)/50,'category':newdata[word].category},
                'percentages':{'dem':Number(newdata[word].percent_of_d_speeches),'rep':Number(newdata[word].percent_of_r_speeches)},
                'total':newdata[word].total
            };
            data.push(obj);
        }
        this.data = data;
        console.log(this.data[0].percentages.rep);
        console.log(this.data);
        this.drawBody();
    } 
}