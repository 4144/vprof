runtests:
	python -m vprof.tests

install:
	npm run build
	pip install .

devdeps_install:
	npm install
	pip install -r requirements.txt

lint:
	npm run lint
	pylint --reports=n vprof/__main__.py

clean:
	rm -rf vprof/frontend/vprof.js