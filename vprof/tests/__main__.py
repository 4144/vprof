"""Main test module."""
import unittest

from vprof.tests import profile_wrappers_test


if __name__ == '__main__':
    loader, runner = unittest.TestLoader(), unittest.TextTestRunner()
    runner.run(loader.loadTestsFromModule(profile_wrappers_test))
