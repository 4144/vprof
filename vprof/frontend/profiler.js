/**
 * @file Profiler output rendering.
 */

'use strict';
var d3 = require('d3');

/**
 * Represents Python profiler output.
 * @constructor
 * @param {Object} parent - Parent element for profiler output.
 * @param {Object} data - Data for rendering.
 */
function Profiler(parent, data) {
  this.data_ = data;
  this.parent_ = parent;
}

/** Renders profiler output */
Profiler.prototype.render = function() {
  var content = this.parent_.append('div')
    .attr('class', 'profiler-content');

  var tooltip = this.parent_.append('div')
    .attr('class', 'content-tooltip content-tooltip-invisible');

  this.renderLegend_(content);

  var self = this;
  var records = content.selectAll('.profiler-record-normal')
    .data(this.data_.callStats)
    .enter()
    .append('div')
    .attr('class', 'profiler-record-normal')
    .on('mouseover', function(d) { self.showTooltip_(this, tooltip, d); })
    .on('mouseout', function() { self.hideTooltip_(this, tooltip); });

  records.append('text')
    .html(Profiler.formatProfilerRecord_);
};

/**
 * Shows tooltip.
 * @param {Object} element - Element representing profiler record.
 * @param {Object} tooltip - Element representing tooltip.
 * @param {Object} node - Object with profiler record info.
 */
Profiler.prototype.showTooltip_ = function(element, tooltip, node) {
  d3.select(element).attr('class', 'profiler-record-highlight');
  tooltip.attr('class', 'content-tooltip content-tooltip-visible')
    .html('<p><b>Line number:</b> ' + node[1] +'</p>' +
          '<p><b>Filename:</b> ' + node[0] +'</p>' +
          '<p><b>Cumulative time:</b> ' + node[3] +'s</p>' +
          '<p><b>Number of calls:</b> ' + node[5] +'</p>' +
          '<p><b>Cumulative calls:</b> ' + node[6] +'</p>' +
          '<p><b>Time per call:</b> ' + node[7] +'s</p>')
    .style('left', d3.event.pageX)
    .style('top', d3.event.pageY);
};

/**
 * Hides tooltip.
 * @param {Object} element - Element representing profiler record.
 * @param {Object} tooltip - Element representing tooltip.
 */
Profiler.prototype.hideTooltip_ = function(element, tooltip) {
  d3.select(element).attr('class', 'profiler-record-normal');
  tooltip.attr('class', 'content-tooltip content-tooltip-invisible');
};

/** Formats profiler record. */
Profiler.formatProfilerRecord_ = function(data) {
  return '<p>' + data[4] + '% '+ data[2] + '</p>';
};

/** Renders profiler tab legend. */
Profiler.prototype.renderLegend_ = function(parent) {
  parent.append('div')
    .attr('class', 'profiler-header')
    .append('text')
    .html('<p><b>Object name:</b> ' + this.data_.objectName + '</p>' +
          '<p><b>Total time:</b> ' + this.data_.totalTime + 's</p>' +
          '<p><b>Primitive calls:</b> ' + this.data_.primitiveCalls + '</p>' +
          '<p><b>Total calls:</b> ' + this.data_.totalCalls + '</p>');
};

/**
 * Renders profiler output and attaches it to parent.
 * @param {Object} parent - Parent element for profiler output.
 * @param {Object} data - Data for profiler output.
 */
function renderProfilerOutput(data, parent) {
  var profilerOutput = new Profiler(parent, data);
  profilerOutput.render();
}

module.exports = {
  'Profiler': Profiler,
  'renderProfilerOutput': renderProfilerOutput,
};
