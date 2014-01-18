var modRewrite = require('connect-modrewrite'),
    path = require('path'),
    _ = require('lodash');


module.exports = function (grunt) {

    /**
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     */
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-changelog');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-connect');


    /**
     * Load in our build configuration file.
     */
    var userConfig = require('./build.config.js');


    /**
     * Process the build option.
     */
    userConfig.usePhantomJs = grunt.option('use-phantomjs') === true;

    var development = grunt.option('development') === true,
        staging = grunt.option('staging') === true,
        production = grunt.option('production') === true,
        sumBuildOptions = development + staging + production;

    // if none set, set default to prod
    if (sumBuildOptions === 0) {
        if (grunt.cli.tasks && grunt.cli.tasks.length > 0) {
            grunt.log.writeln("No build option selected, setting default to ***development***");
            development = true;
        }
        else {
            grunt.log.writeln("No build option selected and no task given, setting default to ***production***");
            production = true;
        }
        sumBuildOptions = 1;
    }

    if (sumBuildOptions !== 1) {
        grunt.log.error("More than one build option set! cannot have multiple build options.");
        throw "More than one build option set! cannot have multiple build options.";
    }

    if (development) {
        grunt.log.ok("Development build selected");
        userConfig.build_configs.current = userConfig.build_configs.development;
        userConfig.build_configs.current.key = 'development';
    }
    if (staging) {
        grunt.log.ok("Staging build selected");
        userConfig.build_configs.current = userConfig.build_configs.staging;
        userConfig.build_configs.current.key = 'staging';
        userConfig.usePhantomJs = true;
    }
    if (production) {
        grunt.log.ok("Production build selected");
        userConfig.build_configs.current = userConfig.build_configs.production;
        userConfig.build_configs.current.key = 'production';
        userConfig.usePhantomJs = true;
    }

    grunt.log.writeln("Test runner should use " + (userConfig.usePhantomJs ? "PhantomJS" : "Chrome"));

    /**
     * This is the configuration object Grunt uses to give each plugin its
     * instructions.
     */
    var taskConfig = {
        /**
         * We read in our `package.json` file so we can access the package name and
         * version. It's already there, so we don't repeat ourselves here.
         */
        pkg: grunt.file.readJSON("package.json"),

        sassDest: '<%= build_dir %>/assets/styles/<%= pkg.name %>-<%= pkg.version %>.css',

        /**
         * The banner is the comment that is placed at the top of our compiled
         * source files. It is first processed as a Grunt template, where the `<%=`
         * pairs are evaluated based on this very configuration object.
         */
        meta: {
            banner: '/**\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
                ' */\n'
        },

        /**
         * Creates a changelog on a new version.
         */
        changelog: {
            options: {
                after: "2013-09-05T10:18:39.4492679+10:00",
                before: "now",
                dest: 'CHANGELOG.md',
                template: 'changelog.tpl'
            }
        },

        /**
         * Increments the version number, etc.
         */
        bump: {
            options: {
                files: [
                    "package.json",
                    "bower.json"
                ],
                commit: false,
                commitMessage: 'chore(release): v%VERSION%',
                commitFiles: [
                    "package.json",
                    "client/bower.json"
                ],
                createTag: false,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'origin'
            }
        },

        /**
         * The directories to delete when `grunt clean` is executed.
         */
        clean: {
            processedSass: {
                // sometimes clean is run when processedSass is not defined
                // In this case, it is necessary to not provide an empty string because grunt complains
                // so provide an always negative match instead
                src: ['<%= app_files.processedSass || "!?" %>'],
                filter: 'isFile'
            },
            others: {
                src: [
                    '<%= build_dir %>',
                    '<%= compile_dir %>'
                ]
            }
        },

        /**
         * The `copy` task just copies files from A to B. We use it here to copy
         * our project assets (images, fonts, etc.) and javascripts into
         * `build_dir`, and then to copy the assets to `compile_dir`.
         */
        copy: {
            build_app_assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= build_dir %>/assets/',
                        cwd: 'src/assets',
                        expand: true,
                        nonull: true
                    }
                ]
            },
            build_vendor_assets: {
                files: (function () {
                    var result = [];

                    var template = {
                        //src: [ '<%= vendor_files.assets %>' ],
                        dest: '<%= build_dir %>/assets/',
                        cwd: '.',
                        expand: true,
                        flatten: true,
                        nonull: true
                    };

                    userConfig.vendor_files.assets.forEach(function (value, index, source) {
                        var kind = grunt.util.kindOf(value);
                        var templateCopy = _.clone(template);
                        if (kind === "string") {
                            templateCopy.src = value;
                            result.push(templateCopy);
                        }
                        else {
                            // here we assume it is a special specification func
                            var transformedTemplate = value.call(null, templateCopy);

                            if (!transformedTemplate || !transformedTemplate.src) {
                                throw "Copy:build_vendor_assets:transformTemplate: expected object with src set, got " + transformedTemplate + " instead";
                            }

                            result.push(transformedTemplate);
                        }
                    });

                    grunt.log.debug("Vendor assets compilation result:\n" + JSON.stringify(result, undefined, 2));

                    return result;
                })()
            },
            build_appjs: {
                options: {
                    processContent: function (content, srcPath) {
                        // if srcPath contain .tpl.js
                        // for now since the angular templates use tpl as well,
                        // we'll cheat and just use a direct file reference
                        var bc = grunt.config('build_configs');
                        if (srcPath === bc.configFile) {

                            // then process as template!
                            return grunt.template.process(content, {data: bc});
                        }

                        return content;
                    }
                },
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true,
                        nonull: true
                    }
                ]
            },
            build_vendorjs: {
                files: [
                    {
                        src: [ '<%= vendor_files.js %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true,
                        nonull: true
                    }
                ]
            },
            compile_assets: {
                files: [
                    {
                        src: [ '**' ],
                        dest: '<%= compile_dir %>/assets',
                        cwd: '<%= build_dir %>/assets',
                        expand: true,
                        nonull: true
                    }
                ]
            }
        },

        /**
         * `grunt concat` concatenates multiple source files into a single file.
         */
        concat: {
            /**
             * The `build_css` target concatenates compiled CSS and vendor CSS
             * together.
             */
            build_css: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                nonull: true,
                src: [
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/assets/styles/*.css'
                ],
                dest: '<%= sassDest %>'
            },
            /**
             * The `compile_js` target is the concatenation of our application source
             * code and all specified vendor source code into a single file.
             */
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                nonull: true,
                src: [
                    '<%= vendor_files.js %>',
                    'module.prefix',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    'module.suffix'
                ],
                dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        /**
         * `ng-min` annotates the sources before minifying. That is, it allows us
         * to code without the array syntax.
         */
        ngmin: {
            compile: {
                files: [
                    {
                        src: [ '<%= app_files.js %>' ],
                        cwd: '<%= build_dir %>',
                        dest: '<%= build_dir %>',
                        expand: true
                    }
                ]
            }
        },

        /**
         * Minify the sources!
         */
        uglify: {
            compile: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
                }
            }
        },

        sass: {
            build: ['sassTemplate', 'sassReal:build', 'clean:processedSass'],
            compile: ['sassTemplate', 'sassReal:compile', 'clean:processedSass']
        },

        /**
         * this is the actual sass compiler task.
         * This task is run after the sass file template has been processed.
         */
        sassReal: {
            options: {

            },
            build: {
                options: {
                    outputStyle: 'expanded',
                    sourceComments: 'map',
                    sourceMap: true
                },
                src: '<%= app_files.processedSass %>',
                dest: '<%= sassDest %>'
            },
            compile: {
                options: {
                    outputStyle: 'compressed',
                    sourceComments: 'none'
                },
                src: '<%= app_files.processedSass %>',
                dest: '<%= sassDest %>'
            }
        },

        /**
         * `jshint` defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in `options`. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside `src/`.
         */
        jshint: {
            src: [
                '<%= app_files.js %>'
            ],
            test: [
                '<%= app_files.jsunit %>'
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,

                /* HACK: At some point this should be turned off!" */
                force: true
            },
            globals: {}
        },

        /**
         * HTML2JS is a Grunt plugin that takes all of your template files and
         * places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become
         * part of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            /**
             * These are the templates from `src/app`.
             */
            app: {
                options: {
                    base: 'src/app'
                },
                src: [ '<%= app_files.atpl %>' ],
                dest: '<%= build_dir %>/templates-app.js'
            },

            /**
             * These are the templates from `src/common`.
             */
            common: {
                options: {
                    base: 'src/common'
                },
                src: [ '<%= app_files.ctpl %>' ],
                dest: '<%= build_dir %>/templates-common.js'
            }
        },

        /**
         * The Karma configurations.
         */
        karma: {
            options: {
                configFile: '<%= build_dir %>/karma-unit.js'
            },
            unit: {
                port: 9019,
                background: true
            },
            continuous: {
                singleRun: true
            }
        },

        /**
         * The `index` task compiles the `index.html` file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        index: {

            /**
             * During development, we don't want to have wait for compilation,
             * concatenation, minification, etc. So to avoid these steps, we simply
             * add all script files directly to the `<head>` of `index.html`. The
             * `src` property contains the list of included files.
             */
            build: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= build_dir %>/src/**/*.js',
                    '<%= html2js.common.dest %>',
                    '<%= html2js.app.dest %>',
                    '<%= vendor_files.css %>',
                    /*'<%= recess.build.dest %>',*/
                    '<%= build_dir %>/assets/styles/*'
                ]
            },

            /**
             * When it is time to have a completely compiled application, we can
             * alter the above to include only a single JavaScript and a single CSS
             * file. Now we're back!
             */
            compile: {
                dir: '<%= compile_dir %>',
                src: [
                    '<%= concat.compile_js.dest %>',
                    '<%= vendor_files.css %>',
                    /*'<%= recess.compile.dest %>',*/
                    '<%= build_dir %>/assets/styles/*.css'
                ]
            }
        },

        /**
         * This task compiles the karma template so that changes to its file array
         * don't have to be managed manually.
         */
        karmaconfig: {
            unit: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.common.dest %>',
                    '<%= test_files.js %>'
                ]
            }
        },

        /** Set up a simple webserver to allow for http access
         *  This was added in by Anthony Truskinger
         */
        connect: {
            server: {
                options: {
                    hostname: '*',
                    port: 8080,
                    base: '<%= build_dir %>',
                    debug: true,
                    livereload: true,
                    /*keepalive: true,*/
                    middleware: function (connect, options) {
                        return [
                            modRewrite([
                                // this rule should match anything under assets and basically not rewrite it
                                '^/assets(.*) /assets$1 [L]',

                                // this rule matches anything without an extension
                                // if matched, the root (index.html) is sent back instead.
                                // from there, angular deals with the route information
                                '!(\\..+)$ / [L]'
                            ]),
                            // this specifies that the build_dir, ('build') is a static directory where content
                            // will be served from.
                            connect.static(options.base)
                        ];
                    }
                }
            }
        },

        /**
         * And for rapid development, we have a watch set up that checks to see if
         * any of the files listed below change, and then to execute the listed
         * tasks when they do. This just saves us from having to type "grunt" into
         * the command-line every time we want to see what we're working on; we can
         * instead just leave "grunt watch" running in a background terminal. Set it
         * and forget it, as Ron Popeil used to tell us.
         *
         * But we don't need the same thing to happen for all the files.
         */
        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true
            },

            /**
             * When the Gruntfile changes, we just want to lint it. In fact, when
             * your Gruntfile changes, it will automatically be reloaded!
             */
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: [ 'jshint:gruntfile' ],
                options: {
                    livereload: false
                }
            },

            /**
             * When our JavaScript source files change, we want to run lint them and
             * run our unit tests.
             */
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                // karma:unit:run is disabled because it breaks watch by stopping it
                // see https://github.com/karma-runner/grunt-karma/issues/30
                tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_appjs' ]
            },

            /**
             * When assets are changed, copy them. Note that this will *not* copy new
             * files, so this is probably not very useful.
             */
            assets: {
                files: [
                    'src/assets/**/*'
                ],
                tasks: [ 'copy:build_app_assets' ]
            },

            /**
             * When index.html changes, we need to compile it.
             */
            html: {
                files: [ '<%= app_files.html %>' ],
                tasks: [ 'index:build' ]
            },

            /**
             * When our templates change, we only rewrite the template cache.
             */
            tpls: {
                files: [
                    '<%= app_files.atpl %>',
                    '<%= app_files.ctpl %>'
                ],
                tasks: [ 'html2js' ]
            },

            /**
             * When the CSS files change, we need to compile and minify them.
             */
            //      less: {
            //        files: [ 'src/**/*.less' ],
            //        tasks: [ 'recess:build' ]
            //      },
            sass: {
                files: [ 'src/**/*.scss' ],
                tasks: ['sass:build', 'concat:build_css']
            },

            /**
             * When a JavaScript unit test file changes, we only want to lint it and
             * run the unit tests. We don't want to do any live reloading.
             */
            jsunit: {
                files: [
                    '<%= app_files.jsunit %>'
                ],
                tasks: [ 'jshint:test', 'karma:unit:run' ],
                options: {
                    livereload: false
                }
            }
        }


    };


    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', [ 'build', 'karma:unit', 'connect', 'delta' ]);

    /**
     * The default task is to build and compile.
     */
    grunt.registerTask('default', [ 'build', 'compile' ]);

    /**
     * The `build` task gets your app ready to run for development and testing.
     */
    grunt.registerTask('build', [
        'clean', 'html2js', 'jshint', 'sass:build',
        'concat:build_css', 'copy:build_app_assets', 'copy:build_vendor_assets',
        'copy:build_appjs', 'copy:build_vendorjs', 'index:build', 'karmaconfig',
        'karma:continuous'
    ]);

    /**
     * The `compile` task gets your app ready for deployment by concatenating and
     * minifying your code.
     */
    grunt.registerTask('compile', [
        'sass:compile', 'concat:build_css', 'copy:compile_assets', 'ngmin', 'concat:compile_js', 'uglify',
        'index:compile'
    ]);

    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS(files) {
        return files.filter(function (file) {
            return file.match(/\.js$/);
        });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS(files) {
        return files.filter(function (file) {
            return file.match(/\.css$/);
        });
    }

    /**
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task assembles
     * the list into variables for the template to use and then runs the
     * compilation.
     */
    grunt.registerMultiTask('index', 'Process index.html template', function () {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');
        var jsFiles = filterForJS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });
        var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
            return file.replace(dirRE, '');
        });
        var mainCss = (grunt.config('sassDest')).replace(dirRE, '');

        grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
            process: function (contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        build_configs: grunt.config('build_configs'),
                        scripts: jsFiles,
                        styles: cssFiles,
                        mainStyle: mainCss,
                        version: grunt.config('pkg.version')
                    }
                });
            }
        });
    });

    /**
     * This task handles the template processing for the main sass file.
     * It injects itself as a task that occurs before the sass task.
     */
    grunt.renameTask('sass', 'sassReal');
    grunt.registerTask('sassTemplate', 'Transforming sass file', function () {
        var mainScss = grunt.config('app_files.sass');
        var processedScss = path.join(path.dirname(mainScss), path.basename(mainScss, ".tpl.scss")) + ".processed.scss";
        grunt.config.set('app_files.processedSass', processedScss);

        grunt.log.write("Temp file: " + processedScss);

        grunt.file.copy(mainScss, processedScss, {
            process: function (contents, path) {
                return grunt.template.process(contents, grunt.config());
            }
        });
    });

    grunt.registerMultiTask('sass', function () {
        grunt.task.run(this.data);
    });


    /**
     * In order to avoid having to specify manually the files needed for karma to
     * run, we use grunt to manage the list for us. The `karma/*` files are
     * compiled as grunt templates for use by Karma. Yay!
     */
    grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
        var jsFiles = filterForJS(this.filesSrc);
        var usePhantomJs = grunt.config('usePhantomJs');

        grunt.file.copy('karma/karma-unit.tpl.js', grunt.config('build_dir') + '/karma-unit.js', {
            process: function (contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        usePhantomJs: usePhantomJs,
                        scripts: jsFiles
                    }
                });
            }
        });
    });

};
