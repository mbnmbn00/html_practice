// Set the dimensions and margins of the graph
let margin = {top: 30, right: 30, bottom: 30, left: 30};
let width = 600 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#pca")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
function loadData() {
  let promise = d3.tsv("pca_cazy.tsv", function(d) {
    return {
      portal_id : d.portal_id,
      PC1 : +d.PC1,
      PC2 : +d.PC2,
      species_name : d.species_name,
      eco_type : d.eco_type,
      tax_order : d.tax_order
    };
  })
  return promise
};

function showData(data) {
  // Calculate min, max
  let x_min_max = d3.extent(data, d => d.PC1);
  let y_min_max = d3.extent(data, d => d.PC2);

  // Add X axis
  var x = d3.scaleLinear()
    .domain(x_min_max)
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain(y_min_max)
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Color scale: give me a specie name, I return a color
  var color_ecotype = d3.scaleOrdinal()
    .domain(["white_rot", "brown_rot"])
    .range(["#3C6EE1", "#AA2010"])
  let tax_orders_u = [...new Set(data.map(d => d.tax_order))]
  var color_tax = d3.scaleOrdinal()
    .domain(tax_orders_u)
    .range(d3.schemeCategory10)
  var shape_ecotype = d3.scaleOrdinal()
    .domain(["white_rot", "brown_rot"])
    .range(d3.symbols.map(s => d3.symbol().type(s)()))
  var shape_tax = d3.scaleOrdinal()
    .domain(tax_orders_u)
    .range(d3.symbols.map(s => d3.symbol().type(s)()))

  // Define the div for the tooltip
  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  // Add dots
  svg.append('g')
    .selectAll(".point")
    .data(data)
    .enter()
    .append("path")
      .attr("class", "point")
      .attr("transform", d => `translate(${x(d.PC1)},${y(d.PC2)})`)
      .attr("fill", d => color_ecotype(d.eco_type))
      .attr("d", d => shape_ecotype(d.eco_type))
      .on("mouseover", function(event, d) {		
        div.transition()		
          .duration(200)		
          .style("opacity", .9);		
        div	.html("<b>" + d.portal_id + "</b><br/><i>" + d.species_name + "</i>")
          .style("left", (event.pageX) + "px")		
          .style("top", (event.pageY - 28) + "px");	
      })					
      .on("mouseout", function(d) {		
        div.transition()		
          .duration(500)		
          .style("opacity", 0);	
      });
  
  // Buttons for change color
  d3.select("#color_by_tax").on("click", function() {
    svg.selectAll(".point")
      .data(data)
      .attr("fill", d => color_tax(d.tax_order))
      .attr("d", d => shape_tax(d.tax_order))
    add_legend(svg_legend, tax_orders_u, color_tax, shape_tax)
  });
  d3.select("#color_by_ecotype").on("click", function() {
    svg.selectAll(".point")
      .data(data)
      .attr("fill", d => color_ecotype(d.eco_type))
      .attr("d", d => shape_tax(d.eco_type))
    add_legend(svg_legend, ["white_rot", "brown_rot"], color_ecotype, shape_ecotype)
  });

  // Add Legend
  let svg_legend = create_svg_legend();
  add_legend(svg_legend, ["white_rot", "brown_rot"], color_ecotype, shape_ecotype)
}

function create_svg_legend() {
  // Select the svg area
  let margin = {top: 30, right: 30, bottom: 30, left: 30};
  let width = 500 - margin.left - margin.right;
  let height = 500 - margin.top - margin.bottom;
  let svg_legend = d3.select("#legend")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  return svg_legend
}

function add_legend(svg_legend, legends, color, shape) {
  // Remove previous one
  svg_legend.html("");

  // Add dots
  let path = svg_legend.selectAll("path")
  .data(legends)
  path.enter()
  .append("path")
    .attr("transform", (d, i) => "translate(50, " + (100 + i * 25) + ")")
    .attr("fill", d => color(d))
    .attr("d", d => shape(d))

  // Add one dot in the legend for each name.
  // 100 is where the first dot appears. 25 is the distance between dots
  svg_legend.selectAll("text")
  .data(legends)
  .enter()
  .append("text")
    .attr("x", 70)
    .attr("y", (d,i) => 100 + i * 25) 
    .style("fill", d => color(d))
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
};

loadData().then(showData)
