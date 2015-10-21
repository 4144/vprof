runtests:
	python -m vprof.tests
	npm run test

install:
	npm run build
	npm run compress
	pip install .

deps_install:
	npm install
	pip install -r requirements

devdeps_install:
	npm install
	pip install -r dev_requirements.txt

lint:
	npm run lint
	pylint --reports=n --rcfile=pylint.rc vprof/*.py

clean:
	rm -rf vprof/frontend/vprof.js
	rm -rf vprof/frontend/vprof_min.js
