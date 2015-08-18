runtests:
	python -m vprof.tests

install:
	npm run build
	npm run compress
	pip install .

devdeps_install:
	npm install
	pip install -r requirements.txt

lint:
	npm run lint
	pylint --reports=n vprof/*.py

clean:
	rm -rf vprof/frontend/main.js
	rm -rf vprof/frontend/vprof.js