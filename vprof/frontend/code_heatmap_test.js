var code_heatmap = require('./code_heatmap.js');

describe('Code heatmap test suite', function() {
  it('Check postProcessCode_', function() {
    var srcCode = "def foo():\nreturn 'bar'";
    var expectedResult = (
      "<div class='src-line-normal'>" +
        "<div class='src-line-number'>1</div>" +
        "<div class='src-line-code'>def foo():</div>" +
      "</div>" +
      "<div class='src-line-normal'>"+
        "<div class='src-line-number'>2</div>" +
        "<div class='src-line-code'>return 'bar'</div>" +
      "</div>");

    expect(
      code_heatmap.CodeHeatmap.postProcessCode_(srcCode)).toBe(expectedResult);
  });

  it('Check changeBackgroundColor_', function() {
    var heatmap = new code_heatmap.CodeHeatmap();
    heatmap.data_ = { 'heatmap': [0, 0, 2, 3] };
    var unusedArg = 'foo';

    expect(heatmap.changeBackgroundColor_(unusedArg, 0)).toBe('');
    expect(heatmap.changeBackgroundColor_(unusedArg, 1)).not.toBe('');
    expect(heatmap.changeBackgroundColor_(unusedArg, 2)).not.toBe('');
  });
});
