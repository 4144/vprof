import collections
import copy
import vprof.profile_wrappers as profile_wrappers
import sys
import unittest

from collections import defaultdict

# For Python 2 and Python 3 compatibility.
try:
    import mock
except ImportError:
    from unittest import mock

_RUN_STATS = {
    ('testscript.py', 1, 'prod'): (1, 10, 7e-06, 7e-06, {
        ('testscript.py', 1, '<module>'): (1, 1, 1e-06, 7e-06),
        ('testscript.py', 1, 'prod'): (9, 1, 6e-06, 6e-06)
    }),
    ('testscript.py', 1, '<module>'): (1, 1, 1.49, 2.3e-05, {}),
    ('~', 0, '<range>'): (1, 1, 1e-06, 1e-06, {
        ('testscript.py', 1, '<module>'): (1, 1, 1e-06, 1e-06)
    })
}

_CALLEES = {
    ('testscript.py', 1, '<module>'): [
        ('testscript.py', 1, 'prod'),
        ('~', 0, '<range>'),
    ],
    ('testscript.py', 1, 'prod'): [
        ('testscript.py', 1, 'prod')
    ]
}

_CALL_GRAPH = {
    'moduleName': 'testscript.py',
    'funcName': '<module>',
    'totalCalls': 1,
    'primCalls': 1,
    'timePerCall': 1.49,
    'cumTime': 2.3e-05,
    'lineno': 1,
    'children': [
        {'funcName': 'prod',
         'primCalls': 1,
         'totalCalls': 10,
         'timePerCall': 7e-06,
         'cumTime': 7e-06,
         'lineno': 1,
         'moduleName': 'testscript.py',
         'children': []},
        {'funcName': '<range>',
         'primCalls': 1,
         'totalCalls': 1,
         'timePerCall': 1e-06,
         'cumTime': 1e-06,
         'lineno': 0,
         'moduleName': '~',
         'children': []}
    ]
}


class BaseProfileUnittest(unittest.TestCase):
    def setUp(self):
        self._profile = object.__new__(profile_wrappers.BaseProfile)

    def testInit(self):
        filename = mock.MagicMock()
        self._profile.__init__(filename)
        self.assertEqual(self._profile._program_name, filename)

    def testCollectStats(self):
        with self.assertRaises(NotImplementedError):
            run_stats = mock.MagicMock()
            self._profile.collect_stats(run_stats)


class RuntimeProfileUnittest(unittest.TestCase):
    def setUp(self):
        self._profile = object.__new__(profile_wrappers.RuntimeProfile)

    def testBuildCallees(self):
        self.assertDictEqual(
            dict(self._profile._build_callees(_RUN_STATS)), _CALLEES)

    def testTransformStats(self):
        stats = mock.MagicMock()
        stats.stats = _RUN_STATS
        self.assertDictEqual(
            self._profile._transform_stats(stats), _CALL_GRAPH)


class MemoryProfileUnittest(unittest.TestCase):
    def setUp(self):
        self._profile = object.__new__(profile_wrappers.MemoryProfile)

    def testTransformStats(self):
        code_obj1, code_obj2 = mock.MagicMock(), mock.MagicMock()
        code_obj1.co_filename, code_obj2.co_filename = 'foo.py', 'bar.py'
        code_obj1.co_name, code_obj2.co_name = 'baz', 'mno'
        code_stats = collections.OrderedDict()
        code_stats[code_obj1] = {10: 20}
        code_stats[code_obj2] = {30: 40}
        self.assertListEqual(
            self._profile._transform_stats(code_stats),
            [(('foo.py', 10, 'baz'), 20), (('bar.py', 30, 'mno'), 40)])


class CodeEventsTrackerUnittest(unittest.TestCase):
    def setUp(self):
        self._tracker = object.__new__(profile_wrappers.CodeEventsTracker)

    def testAddCode(self):
        code = mock.MagicMock()
        self._tracker._all_code = set()
        self._tracker.add_code(code)
        self.assertIn(code, self._tracker._all_code)


class CodeHeatmapCalculator(unittest.TestCase):
    def setUp(self):
        self._calc = object.__new__(profile_wrappers.CodeHeatmapCalculator)

    def testInit(self):
        self._calc.__init__()
        self.assertEqual(self._calc._all_code, set())
        self.assertEqual(self._calc._original_trace_function, sys.gettrace())
        self.assertEqual(self._calc.heatmap, defaultdict(int))

    def testAddCode(self):
        code = mock.MagicMock()
        self._calc._all_code = set()
        self._calc.add_code(code)
        self.assertIn(code, self._calc._all_code)

    def testCalcHeatmap(self):
        self._calc.heatmap = defaultdict(int)
        event, arg = 'line', mock.MagicMock()
        frame1, frame2 = mock.MagicMock(), mock.MagicMock()
        frame1.f_code, frame1.f_code = 'foo1', 'foo2'
        frame1.f_lineno, frame2.f_lineno = 1, 2
        self._calc._all_code = set((frame1.f_code, frame2.f_code))

        self._calc._calc_heatmap(frame1, event, arg)
        self._calc._calc_heatmap(frame2, event, arg)

        self.assertEqual(self._calc.heatmap[frame1.f_lineno], 1)
        self.assertEqual(self._calc.heatmap[frame2.f_lineno], 1)
