# officejs - document management application
# See LICENSE file for copyright and license details.

include config.mk

PRODDIR = deploy
SRCDIR = src

LINTOPTS = --maxlen 79 --indent 2 --maxerr 3

all: external_lib prod

clean: 
	@echo cleaning
	rm -rf ${PRODDIR}

cleanall: clean
	@echo cleaning
	rm -rf ${SRCDIR}/lib

prod: external_lib \
  $(patsubst ${SRCDIR}/gadget/%.html, ${PRODDIR}/gadget/%.html, $(wildcard ${SRCDIR}/gadget/*.html)) \
  $(patsubst ${SRCDIR}/js/%.js, ${PRODDIR}/js/%.js, $(wildcard ${SRCDIR}/js/*.js)) \
  $(patsubst ${SRCDIR}/css/%.css, ${PRODDIR}/css/%.css, $(wildcard ${SRCDIR}/css/*.css)) \
  $(patsubst ${SRCDIR}/img/%, ${PRODDIR}/img/%, $(wildcard ${SRCDIR}/img/*)) \
  $(patsubst ${SRCDIR}/lib/%, ${PRODDIR}/lib/%, $(wildcard ${SRCDIR}/lib/*)) \
  $(patsubst ${SRCDIR}/shared/%.js, ${PRODDIR}/shared/%.js, $(wildcard ${SRCDIR}/shared/*.js))

${PRODDIR}/gadget/%.html: ${SRCDIR}/gadget/%.html
	@mkdir -p $(@D)
#	${JSLINT} ${LINTOPTS} $<
# 	${MINIFY} $< $@
	cp $< $@

${PRODDIR}/js/%.js: ${SRCDIR}/js/%.js
	@mkdir -p $(@D)
	${JSLINT} ${LINTOPTS} $<
# 	cat $< | ${UGLIFYJS} -nc -c -o $@
	cp $< $@

${PRODDIR}/css/%.css: ${SRCDIR}/css/%.css
	@mkdir -p $(@D)
	cp $< $@

${PRODDIR}/img/%: ${SRCDIR}/img/%
	@mkdir -p $(@D)
	cp $< $@

#############################################
# External JS libs
#############################################
external_lib: ${SRCDIR}/lib/jquery.js \
  ${SRCDIR}/lib/modernizr.js \
  ${SRCDIR}/lib/jschannel.js \
  ${SRCDIR}/lib/renderjs.js \
  ${SRCDIR}/lib/jquery.mobile.js \
  ${SRCDIR}/lib/jquery.mobile.css \
  ${SRCDIR}/lib/jio.js \
  ${SRCDIR}/lib/md5.amd.js \
  ${SRCDIR}/lib/normalize.css \
  ${SRCDIR}/lib/complex_queries.js \
  ${SRCDIR}/lib/localstorage.js \
  ${SRCDIR}/lib/erp5storage.js \
  ${SRCDIR}/lib/font-awesome.css \
  ${SRCDIR}/lib/fontawesome-webfont.eot \
  ${SRCDIR}/lib/fontawesome-webfont.ttf \
  ${SRCDIR}/lib/fontawesome-webfont.ff \
  ${SRCDIR}/lib/fontawesome-webfont.woff

${PRODDIR}/lib/%.js: ${SRCDIR}/lib/%.js
	@mkdir -p $(@D)
# 	cat $< | ${UGLIFYJS} -nc -c -o $@
	cp -R $< $@

${PRODDIR}/lib/%: ${SRCDIR}/lib/%
	@mkdir -p $(@D)
# 	cat $< | ${UGLIFYJS} -nc -c -o $@
	cp -R $< $@

${SRCDIR}/lib/jquery.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://code.jquery.com/jquery-1.10.2.js

${SRCDIR}/lib/jquery.mobile%:
	@mkdir -p $(@D)
	curl -s -o $@ http://code.jquery.com/mobile/1.4.0-alpha.2/jquery.mobile-1.4.0-alpha.2$(suffix $@)

${SRCDIR}/lib/modernizr.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://modernizr.com/downloads/modernizr-2.6.2.js

${SRCDIR}/lib/normalize.css:
	@mkdir -p $(@D)
	curl -s -o $@ https://raw.github.com/necolas/normalize.css/master/normalize.css

${SRCDIR}/lib/jschannel.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://mozilla.github.io/jschannel/src/jschannel.js

${SRCDIR}/lib/renderjs.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://git.erp5.org/gitweb/renderjs.git/blob_plain/2a83acbd158313917ead907fd24da7dffe484c5f:/renderjs.js

${SRCDIR}/lib/jio.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://git.erp5.org/gitweb/jio.git/blob_plain/refs/heads/master:/jio.js

${SRCDIR}/lib/md5.amd.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://git.erp5.org/gitweb/jio.git/blob_plain/HEAD:/src/md5.amd.js

${SRCDIR}/lib/localstorage.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://git.erp5.org/gitweb/jio.git/blob_plain/refs/heads/master:/src/jio.storage/localstorage.js

${SRCDIR}/lib/erp5storage.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://git.erp5.org/gitweb/jio.git/blob_plain/refs/heads/master:/src/jio.storage/erp5storage.js

${SRCDIR}/lib/complex_queries.js:
	@mkdir -p $(@D)
	curl -s -o $@ http://git.erp5.org/gitweb/jio.git/blob_plain/refs/heads/master:/complex_queries.js

${SRCDIR}/lib/font-awesome.css:
	@mkdir -p $(@D)
	curl -s -o $@ https://raw.github.com/FortAwesome/Font-Awesome/v3.2.0/css/font-awesome.css

${SRCDIR}/lib/fontawesome-webfont%:
	@mkdir -p $(@D)
	curl -s -o $@ https://raw.github.com/FortAwesome/Font-Awesome/v3.2.0/font/fontawesome-webfont$(suffix $@)
