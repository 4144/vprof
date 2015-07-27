/**
 * Main module
 */
var d3 = require('d3');

var JSON_FILENAME = "profile.json";

// Treemap parameters
var WIDTH = 1000;
var HEIGHT = 500;
var PAD_TOP = 20;
var PAD_RIGHT = 3;
var PAD_BOTTOM = 3;
var PAD_LEFT = 3;
var TEXT_OFFSET_X = 5;
var TEXT_OFFSET_Y= 14;

/** Calculates node rendering params. */
function calculateNode(d, n) {
  // Adjusting treemap layout.
  if (!d.parent) {
    d.start_y = d.y;
    d.height = d.dy;
  }
  // TODO(nvdv)
  // In some cases total cummulative run time of children can
  // be greater than cummulative run time of parent which
  // affects rendering.
  if (!d.children) return;
  var curr_y = d.start_y + PAD_TOP;
  var usable_height = d.height - (PAD_BOTTOM + PAD_TOP);
  for (var i = 0; i < d.children.length; i++) {
    d.children[i].start_y = curr_y;
    var c = d.children[i].cum_time / d.cum_time;
    d.children[i].height = usable_height * Math.round(c * 1000) / 1000;
    curr_y += d.children[i].height;
  }
}

/** Returns full node name. */
function getNodeName(d) {
  return d.module_name + '.' + d.func_name + '@' + d.lineno.toString();
}

/** Renders whole page. */
function renderView() {
  var color = d3.scale.category10();

  var canvas = d3.select("body")
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT);

  d3.json(JSON_FILENAME, function(data) {

    var treemap = d3.layout.treemap()
        .size([WIDTH, HEIGHT])
        .mode('dice')
        .value(function(d) { return d.cum_time; })
        .padding([PAD_TOP, PAD_RIGHT, PAD_BOTTOM, PAD_LEFT])
        .nodes(data.call_stats);

    var cells = canvas.selectAll(".cell")
        .data(treemap)
        .enter()
        .append("g")
        .attr("class", "cell")
        .each(calculateNode);

    cells.append("rect")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.start_y; })
        .attr("width", function(d) { return d.dx; })
        .attr("height", function(d) { return d.height; })
        .attr("fill", function(d) { return color(getNodeName(d) + d.depth.toString()); });

    cells.append("text")
        .attr("x", function(d) { return d.x + TEXT_OFFSET_X; })
        .attr("y", function(d) { return d.start_y + TEXT_OFFSET_Y; })
        .style("font-size","13px")
        .text(function(d) { return getNodeName(d); });
    });
}

renderView();