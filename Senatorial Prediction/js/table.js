/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        this.clicked = [];
        this.noPollingData = ["Oregon", "North Dakota", "Idaho", "Hawaii", "California", "Alabama"];
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);
        // console.log(this.tableData);
        // console.log(this.headerData);
        // console.log(this.pollData);
        // console.log(this.forecastData);
        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        let xCoordinate = d3.select("#marginAxis")
                            .node()
                            .getBoundingClientRect().width;
        let xCoordinate_middle = xCoordinate/2;
        let columnHeader = d3.select("#columnHeaders")
                             .node()
                             .getBoundingClientRect().height;
        let yCoordinate = d3.select("#marginAxis")
                            .node()
                            .getBoundingClientRect().height;
        
        d3.select("#marginAxis")
            .append("line")
            .attr("x1",xCoordinate_middle)
            .attr("y1",0)
            .attr("x2",xCoordinate_middle)
            .attr("y2",yCoordinate)
            .attr("stroke","black");  
        let pos = xCoordinate_middle/3;
        let value = 25;
        for(let i=0;i<3;i++){
            d3.select("#marginAxis").append("text").attr("x",xCoordinate_middle - pos*(i+1))
                .attr("y",yCoordinate/2).attr("class","biden").text("+"+value+"");
                value = value +25;
        }
        value = 25;
        for(let i=0;i<3;i++){
            d3.select("#marginAxis").append("text").attr("x",xCoordinate_middle + pos*(i+1)-25)
                .attr("y",yCoordinate/2).attr("class","trump").text("+"+value+"");
                value = value +25;
        }   
    }

    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, this.tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class);

        let textSelections = forecastSelection.filter(d=>d.type==='text')
                                                .text(d=> d.value);
                                            
        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        let filtered = grouperSelect.filter((d,i)=>i ===1 && d.isForecast!=null);
        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1 ));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        let state= d3.select("#columnHeaders").select("th:nth-child(1)");
        let victorymargin = d3.select("#columnHeaders").select("th:nth-child(2)");
        if(this.headerData[0].sorted){
            if(this.headerData[0].ascending){
                state.attr("class","sortable sorting");
                victorymargin.attr("class","sortable");
                let icon = state.select("i");
                icon.attr("class","fas fa-sort-up");
                let iconv = victorymargin.select("i");
                iconv.attr("class","fas no-display")
            }
            else{
                state.attr("class","sortable sorting");
                let icon = state.select("i");
                let iconv = victorymargin.select("i");
                iconv.attr("class","fas no-display");
                victorymargin.attr("class","sortable");
                icon.attr("class","fas fa-sort-down");
            }
        }
        if(this.headerData[1].sorted){
            if(this.headerData[1].ascending){
                victorymargin.attr("class","sortable sorting");
                state.attr("class","sortable");
                let icon = victorymargin.select("i");
                let icons = state.select("i");
                icons.attr("class","fas no-display");
                icon.attr("class","fas fa-sort-up");
            }
            else{
                victorymargin.attr("class","sortable sorting");
                let icon = victorymargin.select("i");
                state.attr("class","sortable");
                let icons = state.select("i");
                icons.attr("class","fas no-display");
                icon.attr("class","fas fa-sort-down");
            }
        }
    }
    position(d,i,pos,xCoordinate_middle){
        if(d === -75)
            return xCoordinate_middle - pos*3+15;
        else if(d === -50)
            return xCoordinate_middle - pos*2+15;
        else if(d === -25)
            return xCoordinate_middle - pos + 15;
        else if(d === 25)
            return xCoordinate_middle + pos-10;
        else if(d === 50)
            return xCoordinate_middle + pos*2-10;
        else if(d === 75)
            return xCoordinate_middle + pos*3-10;
        else if(d===0)
            return xCoordinate_middle;
    }
    addGridlines(containerSelect, ticks) {
        
        let rowsvg = d3.select("#predictionTableBody").selectAll("tr");
        let xCoordinate = d3.select("#marginAxis")
                            .node()
                            .getBoundingClientRect().width;
        let xCoordinate_middle = xCoordinate/2;
        let pos = xCoordinate_middle/3;
        containerSelect.selectAll("line")
                        .data(ticks)
                        .join("line")
                        .attr("x1",(d,i)=>this.position(d,i,pos,xCoordinate_middle))
                        .attr("y1",0)
                        .attr("x2",(d,i)=>this.position(d,i,pos,xCoordinate_middle))
                        .attr("y2",30)
                        .attr("stroke","black");
             
    }
    rectWidth(d){
        if(d.value.marginLow<0){
            if(d.value.marginHigh > 0){
                return this.scaleX(-100 + Math.abs(d.value.marginLow));
            }
            else{ 
                return this.scaleX(-100 + (Math.abs(d.value.marginLow) - Math.abs(d.value.marginHigh)));
                //return this.scaleX(d.value.marginHigh)-this.scaleX(d.value.marginLow)  ;
            }
        }
        return 0;
    }
    rectWidthtrump(d){
        if(d.value.marginHigh>0){
            if(d.value.marginLow < 0){
                //return this.scaleX(-100+ Math.abs(d.value.marginHigh));
                return this.scaleX(-100+d.value.marginHigh);
            }
            else{
                //return this.scaleX(-100 + (Math.abs(d.value.marginHigh) - Math.abs(d.value.marginLow)));
                return this.scaleX(d.value.marginHigh) - this.scaleX(d.value.marginLow);
            }
        }
        return 0;
    }
    xcoordinate(d){
        let xCoordinate = d3.select("#marginAxis")
                            .node()
                            .getBoundingClientRect().width;
        let xCoordinate_middle = xCoordinate/2;
        if(d.value.marginHigh>0)
            return xCoordinate_middle-this.rectWidth(d);
        else{
            return xCoordinate_middle-this.rectWidth(d)-this.scaleX(-100+Math.abs(d.value.marginHigh));
        }
    }
    xcoordinatetrump(d){
        let xCoordinate = d3.select("#marginAxis")
         .node()
         .getBoundingClientRect().width;
        let xCoordinate_middle = xCoordinate/2;
        if(d.value.marginLow<0)
        return xCoordinate_middle;
        else{
            return xCoordinate_middle+this.scaleX(-100+Math.abs(d.value.marginLow));
        }
    }
    addRectangles(containerSelect) {
        let xCoordinate = d3.select("#marginAxis")
                            .node()
                            .getBoundingClientRect().width;
        let xCoordinate_middle = xCoordinate/2;
        containerSelect.selectAll("rect")
                        .data(d=> [d]) 
                        .join("rect")
                        .attr("width",(d) =>this.rectWidth(d))
                        .attr("height",20)
                        .attr("x",(d)=>this.xcoordinate(d))
                        .attr("y",5)
                        .attr("class","biden margin-bar");
        containerSelect.append("rect")
                        .data(d => [d])
                        .join("rect")
                        .attr("width",(d) =>this.rectWidthtrump(d))
                        .attr("height",20)
                        .attr("x",(d)=>this.xcoordinatetrump(d))
                        .attr("y",5)
                        .attr("class","trump margin-bar");               
        containerSelect.filter(d=> !d.isForecast).selectAll('rect').remove();
    }

    addCircles(containerSelect) {
        let xCoordinate = d3.select("#marginAxis")
                             .node()
                             .getBoundingClientRect().width;
        let xCoordinate_middle = xCoordinate/2;
        containerSelect.selectAll("circle")
                        .data(d => [d])
                        .join("circle")
                        .attr("cx",(d)=>this.scaleX(d.value.margin))                           
                        .attr("cy",(d)=>d.isForecast?this.vizHeight/2: this.smallVizHeight/2)
                        .attr("r",(d)=>d.isForecast?this.vizHeight/6: this.vizHeight/9)
                        .attr("class",(d)=> d.value.margin>0?"trump margin-circle":"biden margin-circle");

    }
    comparestateasc(a,b){
            return a.state.toLowerCase().localeCompare(b.state.toLowerCase());        
    }
    comparestatedsc(a,b){
        return b.state.toLowerCase().localeCompare(a.state.toLowerCase());
    }
    comparemarginasc(a,b){
        return Math.abs(a.mean_netpartymargin) - Math.abs(b.mean_netpartymargin);  
    }
    comparemargindsc(a,b){
        return Math.abs(b.mean_netpartymargin) - Math.abs(a.mean_netpartymargin);
    }
    sorttabledata(by){
        //console.log(this.tableData);
        if(by === "state"){
            if(this.headerData[0].ascending)
                this.tableData.sort(this.comparestateasc);
            else
                this.tableData.sort(this.comparestatedsc);
        }
        else{
            if(this.headerData[1].ascending)
                this.tableData.sort(this.comparemarginasc);
            else
                this.tableData.sort(this.comparemargindsc);
        }
            
    }
    attachSortHandlers() 
    {
        let state= d3.select("#columnHeaders").select("th:nth-child(1)");
        let victorymargin = d3.select("#columnHeaders").select("th:nth-child(2)");
        const that = this;
        let sortbystate = function(a,b){
            if(that.headerData[0].ascending)
                return a.state.toLowerCase().localeCompare(b.state.toLowerCase()); 
            else
                return b.state.toLowerCase().localeCompare(a.state.toLowerCase());
        }
        let sortbymargin = function(a,b){
            if(that.headerData[1].ascending)
                return Math.abs(a.mean_netpartymargin) - Math.abs(b.mean_netpartymargin);    
            else{
                return Math.abs(b.mean_netpartymargin) - Math.abs(a.mean_netpartymargin);     
            }
        }
        state.on("click",function(){
            that.collapseAll();
            that.drawTable();
            let rows = d3.select("#predictionTableBody").selectAll("tr");
            that.headerData[0].sorted = true;
            that.headerData[1].sorted = false;
            that.headerData[1].ascending = false;
            if(that.headerData[0].ascending){
                that.headerData[0].ascending = false;
                that.updateHeaders();
            }
            else{
                that.headerData[0].ascending = true;
                that.updateHeaders();
            }
            rows.sort(sortbystate);
            that.sorttabledata("state");
                
        });
        
        victorymargin.on("click",function(){
            that.collapseAll();
            that.drawTable();
            let rows = d3.select("#predictionTableBody").selectAll("tr");
            that.headerData[1].sorted = true;
            that.headerData[0].sorted = false;
            that.headerData[0].ascending = false;
            if(that.headerData[1].ascending){
                that.headerData[1].ascending = false;
                that.updateHeaders();
            }
            else{
                that.headerData[1].ascending = true;
                that.updateHeaders();
            }
            rows.sort(sortbymargin);
            that.sorttabledata("margin");
            
        });
        
    }

    toggleRow(rowData, index) {
        if(!this.noPollingData.includes(rowData.state)){
            if(this.clicked.includes(rowData.state)){
                this.clicked.splice(this.clicked.indexOf(rowData.state),1);
                let pollingdata = this.pollData.get(rowData.state);
                this.tableData.splice(index+1,pollingdata.length);
            }
            else{
                this.clicked.push(rowData.state);    
                let pollingdata = this.pollData.get(rowData.state);
                let j= 0;
                for(let i = index+1;i<=index+pollingdata.length;i++){
                    this.tableData.splice(i,0,pollingdata[j++]);
                }  
            }
            this.drawTable();
        }
    }

    collapseAll() {
        
        this.tableData = this.tableData.filter(d => d.isForecast)
        this.clicked =[];
    }

}
