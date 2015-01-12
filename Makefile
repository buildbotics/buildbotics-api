TARGETS=index.html api.html api.css api.js
DEST=root@buildbotics.com:/var/www/dev.buildbotics.com/

DIR := $(shell dirname $(lastword $(MAKEFILE_LIST)))

TARGETS := $(patsubst %,http/%,$(TARGETS))

NODE_MODS := $(DIR)/node_modules
STYLUS := $(NODE_MODS)/stylus/bin/stylus
JADE := $(DIR)/jade.js

all: $(TARGETS)

http/index.html: http/api.html
	ln -sf $(shell basename $<) $@

http/%.html: src/%.jade node_modules http
	$(JADE) $< >$@ || rm $@

http/%.css: src/%.styl node_modules http
	$(STYLUS) < $< >$@ || rm $@

http/%.js: src/%.js http
	install $< $@

http:
	mkdir $@

publish:
	rsync -av --exclude=*~ http/ $(DEST)

node_modules:
	npm install

tidy:
	rm -f $(shell find . -name \*~)

clean: tidy
	rm -rf http

dist-clean: clean
	rm -rf node_modules
