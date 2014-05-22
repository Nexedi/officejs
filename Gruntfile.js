/*global require */
module.exports = function (grunt) {
  "use strict";


  var LIVERELOAD_PORT,
    lrSnippet,
    livereloadMiddleware,
    global_config = {
      src: "src",
      lib: "lib",
      tmp: "tmp",
      dest: "dev"
    };

  // This is the default port that livereload listens on;
  // change it if you configure livereload to use another port.
  LIVERELOAD_PORT = 35729;
  // lrSnippet is just a function.
  // It's a piece of Connect middleware that injects
  // a script into the static served html.
  lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
  // All the middleware necessary to serve static files.
  livereloadMiddleware = function (connect, options) {
    return [
      // Inject a livereloading script into static files.
      lrSnippet,
      // Serve static files.
      connect.static(options.base),
      // Make empty directories browsable.
      connect.directory(options.base)
    ];
  };

  grunt.loadNpmTasks("grunt-jslint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-contrib-watch');
//   grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-zip');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    global_config: global_config,

    jslint: {
      config: {
        src: ['package.json', 'Gruntfile.js'],
        directives: {
          maxlen: 120,
          indent: 2,
          maxerr: 3,
          predef: [
            'module'
          ]
        }
      },
      gadget: {
        src: ["<%= global_config.src %>/**/*.js"],
        directives: {
          maxlen: 79,
          indent: 2,
          maxerr: 3,
          unparam: true,
          predef: [
            'window',
            'document'
          ]
        }
      }
    },

    less: {
      production: {
        options: {
          paths: ["<%= global_config.src %>/"],
          cleancss: true,
          syncImports: true,
          strictMath: true,
          strictUnits: true,
          syncImport: true
        },
        files: {
          "<%= global_config.dest %>/editor_ace/aceeditor.css":
            "<%= global_config.src %>/editor_ace/aceeditor.less",
          "<%= global_config.dest %>/erp5/erp5.css":
            "<%= global_config.src %>/erp5/erp5.less",
          "<%= global_config.dest %>/twin_erp5/superindex.css":
            "<%= global_config.src %>/twin_erp5/superindex.less"
        }
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      jio: {
        src: [
          'node_modules/jio/src/sha1.amd.js',
          'node_modules/jio/src/sha2.amd.js',
          'node_modules/jio/jio.js',
          'node_modules/jio/complex_queries.js',
          'node_modules/jio/src/jio.storage/localstorage.js',
          'node_modules/jio/src/jio.storage/erp5storage.js'
        ],
        relative_dest: "lib/jio.js",
        dest: "<%= global_config.dest %>/<%= concat.jio.relative_dest %>"
      }
    },

    uglify: {
      gadget: {
        // XXX Dev options
        options: {
          report: false,
          mangle: false,
          compress: false,
          beautify: true,
          preserveComments: "all"
        },
        files: [{
          expand: true,
          cwd: "<%= global_config.src %>/",
          src: '**/*.js',
          dest: "<%= global_config.dest %>/"
        }]
      }
    },

    copy: {
      gadget: {
        expand: true,
        cwd: "<%= global_config.src %>/",
        src: "**/*.html",
        dest: "<%= global_config.dest %>/",
        nonull: true,
        options: {
          process: function (content) {
            return grunt.template.process(content);
          }
        }
      },
      rsvp: {
        src: "node_modules/rsvp/dist/rsvp-2.0.4.min.js",
        relative_dest: "lib/rsvp.min.js",
        dest: "<%= global_config.dest %>/<%= copy.rsvp.relative_dest %>"
      },
      uritemplate: {
        src: "node_modules/uritemplate/bin/uritemplate-min.js",
        relative_dest: "lib/uritemplate.min.js",
        dest: "<%= global_config.dest %>/<%= copy.uritemplate.relative_dest %>"
      },
      renderjs: {
        src: "node_modules/renderjs/dist/renderjs-latest.js",
        relative_dest: "lib/renderjs.min.js",
        dest: "<%= global_config.dest %>/<%= copy.renderjs.relative_dest %>"
      },
      uri: {
        src: "<%= global_config.lib %>/URI.js",
        relative_dest: "lib/URI.js",
        dest: "<%= global_config.dest %>/<%= copy.uri.relative_dest %>"
      }
    },

    watch: {
      src: {
        files: [
          '<%= global_config.src %>/**',
          '<%= jslint.config.src %>'
        ],
        tasks: ['default'],
        options: {
          livereload: LIVERELOAD_PORT
        }
      }
    },

    curl: {
      dygraph: {
        src: "http://dygraphs.com/dygraph-combined.js",
        relative_dest: 'lib/dygraph.js',
        dest: '<%= global_config.dest %>/<%= curl.dygraph.relative_dest %>'
      },
      dygraphdata: {
        src: "http://dygraphs.com/gallery/data.js",
        relative_dest: 'lib/dygraphdata.js',
        dest: '<%= global_config.dest %>/<%= curl.dygraphdata.relative_dest %>'
      },
      aloha: {
        src: 'http://aloha-editor.org/builds/stable/alohaeditor-0.25.7.zip',
        relative_url: "lib/ace-builds-3bfda31096cf3f42b77aac64eb788584ea796822/src-min/ace.js",
        directory: "alohaeditor-0.25.7/aloha",
        css_relative_dest: "lib/<%= curl.aloha.directory %>/css/aloha.css",
        require_relative_dest: "lib/<%= curl.aloha.directory %>/lib/require.js",
        jquery_relative_dest: "lib/<%= curl.aloha.directory %>/lib/vendor/jquery-1.7.2.js",
        js_relative_dest: "lib/<%= curl.aloha.directory %>/lib/aloha.js",
        dest: '<%= global_config.tmp %>/alohaeditor.zip'
      },
      ace: {
        src: 'https://github.com/ajaxorg/ace-builds/archive/3bfda31096cf3f42b77aac64eb788584ea796822.zip',
        relative_url: "lib/ace-builds-3bfda31096cf3f42b77aac64eb788584ea796822/src-min/ace.js",
        dest: '<%= global_config.tmp %>/ace.zip'
      },
      jqueryte: {
        src: 'http://jqueryte.com/jqte/<%= curl.jqueryte.directory %>.zip',
        version: "1.4.0",
        directory: "jQuery-TE_v.<%= curl.jqueryte.version %>",
        css_relative_url: "lib/<%= curl.jqueryte.directory %>/jquery-te-<%= curl.jqueryte.version %>.css",
        js_relative_url: "lib/<%= curl.jqueryte.directory %>/jquery-te-<%= curl.jqueryte.version %>.min.js",
        dest: '<%= global_config.tmp %>/jQuery-TE.zip'
      },
      jquery: {
        src: 'http://code.jquery.com/jquery-2.0.3.js',
        relative_dest: 'lib/jquery.js',
        dest: '<%= global_config.dest %>/<%= curl.jquery.relative_dest %>'
      },

      jquerymobilejs: {
        src_base: 'http://code.jquery.com/mobile/1.4.0-alpha.2/jquery.mobile-1.4.0-alpha.2',
        src: '<%= curl.jquerymobilejs.src_base %>.js',
        relative_dest: 'lib/jquerymobile.js',
        dest: '<%= global_config.dest %>/<%= curl.jquerymobilejs.relative_dest %>'
      },
      jquerymobilecss: {
        src: '<%= curl.jquerymobilejs.src_base %>.css',
        relative_dest: 'lib/jquerymobile.css',
        dest: '<%= global_config.dest %>/<%= curl.jquerymobilecss.relative_dest %>'
      },
      jqueryuijs: {
        src: 'https://code.jquery.com/ui/1.10.4/jquery-ui.js',
        relative_dest: 'lib/jquery-ui.js',
        dest: '<%= global_config.dest %>/<%= curl.jqueryuijs.relative_dest %>'
      },
      jqueryuicss: {
        src: 'https://code.jquery.com/ui/1.11.0-beta.1/themes/base/jquery-ui.css',
        relative_dest: 'lib/jquery-ui.css',
        dest: '<%= global_config.dest %>/<%= curl.jqueryuicss.relative_dest %>'
      },
      beautifyhtml: {
        src: 'https://raw.githubusercontent.com/einars/js-beautify/master/js/lib/beautify-html.js',
        relative_dest: 'lib/beautify-html.js',
        dest: '<%= global_config.dest %>/<%= curl.beautifyhtml.relative_dest %>'
      },
      animatecss: {
        src: 'https://raw.github.com/daneden/animate.css/master/animate.css',
        relative_dest: 'lib/animate.css',
        dest: '<%= global_config.dest %>/<%= curl.animatecss.relative_dest %>'
      }
//     qunit: {
//       all: ['test/index.html']
    },

    unzip: {
      aloha: {
        src: '<%= curl.aloha.dest %>',
        dest: '<%= global_config.dest %>/lib/'
      },
      ace: {
        src: '<%= curl.ace.dest %>',
        dest: '<%= global_config.dest %>/lib/'
      },
      jqueryte: {
        src: '<%= curl.jqueryte.dest %>',
        dest: '<%= global_config.dest %>/lib/'
      }
    },

    connect: {
      client: {
        options: {
          hostname: '127.0.0.1',
          port: 9000,
          base: '.',
          directory: '.',
          middleware: livereloadMiddleware
        }
      }
    },

    open: {
      all: {
        // Gets the port from the connect configuration
        path: 'http://<%= connect.client.options.hostname%>:' +
            '<%=connect.client.options.port%>/<%= global_config.dest %>/'
      }
    }
  });

  grunt.registerTask('default', ['all']);
  grunt.registerTask('all', ['lint', 'build']);
  grunt.registerTask('lint', ['jslint']);
  grunt.registerTask('dep', ['curl', 'unzip']);
//   grunt.registerTask('test', ['qunit']);
  grunt.registerTask('server', ['connect:client', 'open', 'watch']);
  grunt.registerTask('build', ['concat', 'uglify', 'copy', 'less']);

};