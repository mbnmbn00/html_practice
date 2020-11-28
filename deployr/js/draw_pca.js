// Set the dimensions and margins of the graph
const margin = {top: 25, right: 20, bottom: 35, left: 40};
const width = 500 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const grid = (g, x, y) => g
  .attr("stroke", "currentColor")
  .attr("stroke-opacity", 0.1)
  .call(g => g
  .selectAll(".x")
  .data(x.ticks(12))
  .join(
    enter => enter.append("line").attr("class", "x").attr("y2", height),
    update => update,
    exit => exit.remove()
  )
    .attr("x1", d => 0.5 + x(d))
    .attr("x2", d => 0.5 + x(d)))
  .call(g => g
  .selectAll(".y")
  .data(y.ticks(12))
  .join(
    enter => enter.append("line").attr("class", "y").attr("x2", width),
    update => update,
    exit => exit.remove()
  )
    .attr("y1", d => 0.5 + y(d))
    .attr("y2", d => 0.5 + y(d)));

const xAxis = (g, x) => g
  .attr("transform", `translate(${margin.left},${height + margin.top})`)
  .call(d3.axisBottom(x).ticks(6))
  .call(g => g.select(".domain").attr("display", "none"))

const yAxis = (g, y) => g
  .call(d3.axisLeft(y).ticks(6))
  .call(g => g.select(".domain").attr("display", "none"))

//Read the data
function loadData(pcData) {
  let promise = d3.tsv(infoUrl, function(d) {
    return {
      portalId : d.portal_id,
      PC1 : +pcData.find(element => element.portal_id === d.portal_id).PC1,
      PC2 : +pcData.find(element => element.portal_id === d.portal_id).PC2,
      taxPhylum : d.tax_phylum,
      taxClass : d.tax_class,
      taxOrder : d.tax_order,
      ecoTerm : d.eco_term
    };
  });
  return promise
};

function showData(data, pv12) {
  // Stop spinner
  spinner.stop()

  // append the svg object to the body of the page
  const svg = d3.select("#pca")
    .append("svg")
      .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
    
  // Calculate min, max
  const x_min_max = d3.extent(data, d => d.PC1);
  const y_min_max = d3.extent(data, d => d.PC2);

  // Add X axis
  let x = d3.scaleLinear()
    .domain([x_min_max[0] - 5, x_min_max[1] + 5])
    .range([0, width])
    .nice();
  // Add Y axis
  var y = d3.scaleLinear()
    .domain([y_min_max[0] - 5, y_min_max[1] + 5])
    .range([height, 0])
    .nice();

  // Color scale: give me a specie name, I return a color
  colorBy = "ecoTerm"
  customScale = get_color_shape(data, colorBy, 1);
  color = customScale[0];
  shape = customScale[1];

  // Define the div for the tooltip
  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  // Add dots
  const gDot = svg.append("g").attr("id", "gDot")
  gDot.selectAll(".point")
    .data(data)
    .enter()
    .append("path")
      .attr("class", "point")
      .attr("transform", d => `translate(${x(d.PC1) + margin.left},${y(d.PC2) + margin.top})`)
      .attr("fill", d => color(d.ecoTerm))
      .attr("d", d => shape(d.ecoTerm))
      .attr("stroke-width", 500)
      .on("mouseover", function(event, d) {		
        div.transition()		
          .duration(200)
          .style("opacity", .9);		
        div	.html("<b>" + d.portalId + "</b><br/><i>" + d.taxOrder + "</i>")
          .style("left", (event.pageX) + "px")		
          .style("top", (event.pageY - 28) + "px");	
      })					
      .on("mouseout", function(d) {		
        div.transition()
          .duration(500)		
          .style("opacity", 0);	
      });

  // Select for change color
  d3.select("#colorBy").on("change", function() {
    selectedProperty = d3.select("#colorBy").node().value; 
    customScale = get_color_shape(data, selectedProperty, 1);
    color = customScale[0];
    shape = customScale[1];
    svg.selectAll(".point")
      .data(data)
      .attr("fill", d => color(d[selectedProperty]))
      .attr("d", d => shape(d[selectedProperty]))
    addLegend(svg_legend, data, selectedProperty, color, shape)
  });

  // Button for run PCA
  d3.select("#runPCA").on("click", function() {
    runPCA(data, shape);
  });

  // Add Legend
  let svg_legend = create_svg_legend();
  addLegend(svg_legend, data, colorBy, color, shape)

  // Zoom function
  const gx = svg.append("g")
    .attr("id", "gx")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  const gy = svg.append("g")
    .attr("id", "gy")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  const gGrid = svg.append("g")
    .attr("id", "gGrid")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", zoomed);
  d3.select("#pca").call(zoom).call(zoom.transform, d3.zoomIdentity);
  function zoomed({transform}) {
    const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    selectedProperty = d3.select("#colorBy").node().value; 
    customScale = get_color_shape(data, selectedProperty, transform.k);
    shape = customScale[1];
    gDot.attr("transform", transform)
    gDot.selectAll(".point")
      .data(data)
      .attr("d", d => shape(d[selectedProperty], transform.k * 2))
    gx.call(xAxis, zx);
    gy.call(yAxis, zy);
    gGrid.call(grid, zx, zy);
  }
  // Add axes labels
  gx.append("text")
    .attr("id", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", margin.bottom - 4)
    .attr("fill", "currentColor")
    .attr("text-anchor", "middle")
    .text("PC1 (" + pv12[0] + "%)");
  gy.append("text")
    .attr("id", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 12)
    .attr("x", -width / 2)
    .attr("fill", "currentColor")
    .style("text-anchor", "middle")
    .text("PC2 (" + pv12[1] + "%)"); 
};

function create_svg_legend() {
  // Select the svg area
  let width = 500;
  let height = 500;
  let svg_legend = d3.select("#legend")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
  return svg_legend
}

function addLegend(svg_legend, data, colorBy, color, shape) {
  // Get names
  let legends = [...new Set(data.map(d => d[colorBy]))]
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

function updatePoints(data, shape, newData, PC1Explained, PC2Explained) {
  let svg = d3.select("#pca")

  // Calculate min, max
  let x_min_max = d3.extent(newData, d => d.PC1);
  let y_min_max = d3.extent(newData, d => d.PC2);

  // Add X axis
  let x = d3.scaleLinear()
    .domain([x_min_max[0] - 5, x_min_max[1] + 5])
    .range([0, width])
    .nice();

  // Add Y axis
  let y = d3.scaleLinear()
    .domain([y_min_max[0] - 5, y_min_max[1] + 5])
    .range([height, 0])
    .nice();

  const gDot = d3.select("#gDot")
  const gx = d3.select("#gx")
  const gy = d3.select("#gy")
  const gGrid = d3.select("#gGrid")

  gDot.selectAll(".point")
    .data(newData)
    .transition()
    .duration(1000)
    .attr("transform", d => `translate(${x(d.PC1) + margin.left},${y(d.PC2) + margin.top})`);
  
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", zoomed);
  d3.select("#pca").call(zoom).call(zoom.transform, d3.zoomIdentity);
  function zoomed({transform}) {
    selectedProperty = d3.select("#colorBy").node().value; 
    customScale = get_color_shape(data, selectedProperty, transform.k);
    shape = customScale[1];
    const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    gx.call(xAxis, zx);
    gy.call(yAxis, zy);
    gGrid.call(grid, zx, zy);
    gDot.attr("transform", transform);
    gDot.selectAll(".point")
      .data(data)
      .attr("d", d => shape(d[selectedProperty], transform.k * 2));
  }
  
  d3.select("#x-axis-label")
    .text("PC1 (" + PC1Explained + "%)");

  d3.select("#y-axis-label")
    .text("PC2 (" + PC2Explained + "%)");
}

function get_color_shape(data, group, scale) {
  groupU = [...new Set(data.map(d => d[group]))]
  let color = d3.scaleOrdinal()
    .domain(groupU)
    .range(d3.schemeCategory10)
  let shape = d3.scaleOrdinal()
    .domain(groupU)
    .range(d3.symbols.map(s => d3.symbol().size(150 / scale ** 2).type(s)()))
  return [color, shape]
}
