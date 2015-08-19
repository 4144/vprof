"""Visual profiler for Python."""
import argparse
import functools
import json
import profile
import stats_server
import subprocess
import sys

_MODULE_DESC = 'Python visual profiler.'
_HOST = 'localhost'
_PORT = 8000

_PROFILE_MAP = {
    'c': profile.CProfile
}

def main():
    parser = argparse.ArgumentParser(description=_MODULE_DESC)
    parser.add_argument('profilers', metavar='opts',
                        help='Profilers configuration')
    parser.add_argument('source', metavar='src', nargs=1,
                        help='Python program to profile.')
    args = parser.parse_args()

    sys.argv[:] = args.source
    program_name = args.source[0]

    if len(args.profilers) > len(set(args.profilers)):
        print('Profiler configuration is ambiguous. Remove duplicates.')
        sys.exit(1)

    for prof_option in args.profilers:
        if prof_option not in _PROFILE_MAP:
            print('Unrecognized option: %s' % prof_option)
            sys.exit(2)

    print('Collecting profile stats...')

    prof_option = args.profilers[0]
    profiler = _PROFILE_MAP[prof_option]
    program_info = profile.CProfile(args.source[0]).run()

    partial_handler = functools.partial(
        stats_server.StatsHandler, profile_json=json.dumps(program_info))
    subprocess.call(['open', 'http://%s:%s' % (_HOST, _PORT)])
    stats_server.start(_HOST, _PORT, partial_handler)


if __name__ == "__main__":
    main()
