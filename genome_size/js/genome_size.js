// Constant
const colors = ["steelblue", "darkorange", "lightblue"];

function loadData() {
  let promise = d3.tsv('src/coding_noncoding_repeat.tsv', function(d) {
    return {
      portal_id : d.portal_id,
      coding_len : +d.coding_len,
      non_coding_len : +d.non_coding_len,
      repeat_len: +d.repeat_len
    };
  })
  return promise
};

function showData(data) {

  var keys = data.columns.slice(1);

  // Set margins
	var svg = d3.select("#chart"),
		margin = {top: 35, left: 60, bottom: 0, right: 15},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

	var y = d3.scaleBand()
		.range([margin.top, height - margin.bottom])
		.padding(0.1)
		.paddingOuter(0.2)
		.paddingInner(0.2)

	let x = d3.scaleLinear()
    .range([margin.left, width - margin.right])

	svg.append("g")
		.attr("transform", `translate(${margin.left},0)`)
		.attr("class", "y-axis")

	svg.append("g")
		.attr("transform", `translate(0,${margin.top})`)
		.attr("class", "x-axis")

	let z = d3.scaleOrdinal()
		.range(colors)
    .domain(keys);
    
  // Draw X-axis
  data.forEach(function(d) {
		d.total = d3.sum(keys, k => d[k])
		return d
  });
  x.domain([0, d3.max(data, d => d.total)]).nice();
  svg.selectAll(".x-axis")
    .call(d3.axisTop(x).ticks(10, "s"));
  
  // Draw Y-axis 
  y.domain(data.map(d => d.portal_id));
  svg.selectAll(".y-axis")
    .call(d3.axisLeft(y).tickSizeOuter(0));
  
  let group = svg.selectAll("g.layer")
    .data(d3.stack().keys(keys)(data), d => d.key);
  group.exit().remove()
  group.enter().insert("g", ".y-axis").append("g")
    .classed("layer", true)
    .attr("fill", d => z(d.key));
  
  // Draw bars
  var bars = svg.selectAll("g.layer").selectAll("rect")
		.data(d => d, e => e.data.portal_id);
  bars.exit().remove()
	bars.enter().append("rect")
	  .attr("height", y.bandwidth())
		.merge(bars)
	  .attr("y", d => y(d.data.portal_id))
		.attr("x", d => x(d[0]))
    .attr("width", d => x(d[1]) - x(d[0]))

  // Add legend
  let svg_legend = create_svg_legend();
  add_legend(svg_legend, keys, z)
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
  return svg_legend;
};

function add_legend(svg_legend, legends, color) {
  // Add dots
  let circle = svg_legend.selectAll("circle")
  .data(legends)
  circle.enter()
  .append("circle")
    .attr("cx", 50)
    .attr("cy", (d, i) => 100 + i * 25)
    .attr("r", 7)
    .style("fill", d => color(d))

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