/** Class representing a Tree. */
class Tree {
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  node_objs = [];
  constructor(json) {
    this.json = json;
    for(const node of this.json)
    {
      let new_node = new Node(node.name,node.parent);
      for(const current of this.node_objs)
      {
        if(new_node.parentName === current.name){
          new_node.parentNode = current;
          break;
        }
      }
      this.node_objs.push(new_node);
    }
    console.log(this.node_objs);
  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree () {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
    for(const node of this.node_objs)
    {
      if(node.name != "Animal")
      {
        node.parentNode.children.push(node);
      }
    }
    this.assignLevel(this.node_objs[0],0);
    this.assignPosition(this.node_objs[0]);
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel (node, level) {
    //console.log(node);
    node.level = level;
    for(const child of node.children)
    {
      this.assignLevel(child,level+1);
    }
  }

  /**
   * Recursive function that assign positions to each node
   */
  globalposition = 0;
  assignPosition (node) {
      node.position = this.globalposition;
      for(const child of node.children)
      {
        this.assignPosition(child);
      }
      if(node.children.length === 0){
        this.globalposition = this.globalposition + 1;
      }

  }

  /**
   * Function that renders the tree
   */
  renderTree () {
    var bodySelection = d3.select('body');
    var svg = bodySelection.append("svg").attr("width",1200).attr("height",1200);
    for(const node of this.node_objs){
        for(const child of node.children){
            svg.append("line").attr("x1",""+(240*node.level+120)+"")
                              .attr("y1",""+(150*node.position+75)+"")
                              .attr("x2",""+(240*child.level+120)+"")
                              .attr("y2",""+(150*child.position+75)+"");
        }
      var grouping = svg.append("g").attr("class","nodesGroup")
                                    .attr("transform","translate("+240*node.level+","+150*node.position+")")
                                    .classed("nodeGroup",true);
      var circle = grouping.append("circle").attr("cx",120).attr("cy",75).attr("r",60);
      grouping.append("text").attr("class","label").attr("x",120).attr("y",75).text(""+node.name+"").classed("label",true);
    }
  }

}
