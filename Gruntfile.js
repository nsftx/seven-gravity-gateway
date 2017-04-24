module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({
        mochaTest: {
            test: {
                src: ['test/*.js']
            }
        },
        browserify: {
            index: {
                files: [{
                    src: './index.js',
                    dest: 'dist/index.js'
                }],
                options: {
                    alias: {
                        'seven-gravity-gateway': './index.js'
                    }
                }
            },
            master: {
                files: [{
                    src: './master.js',
                    dest: 'dist/master.js'
                }],
                options: {
                    alias: {
                        'seven-gravity-gateway/master': './master.js'
                    }
                }
            },
            slave: {
                files: [{
                    src: './slave.js',
                    dest: 'dist/slave.js'
                }],
                options: {
                    alias: {
                        'seven-gravity-gateway/slave': './slave.js'
                    }
                }
            },
            plugins : {
                files: [{
                    src: './plugin-storage.js',
                    dest: 'dist/plugin-storage.js'
                }],
                options: {
                    alias: {
                        'seven-gravity-gateway/plugin-storage': './plugin-storage.js'
                    }
                }
            }
        },
        jshint: {
            options: {
                eqeqeq: true,
                immed: true,
                latedef: false,
                browser: true,
                newcap: true,
                undef: true,
                globals: {
                    module: false,
                    exports: false,
                    require: false,
                    console: false,
                }
            },
            files: [
                'src/**/*.js'
            ]
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['*.js', '!*.min.js'],
                    dest: 'dist/',
                    ext: '.min.js'
                }]
            }
        },
        watch: {
            files: [
                'src/**/*.js'
            ],
            tasks: ['default']
        }
    });

    grunt.registerTask('default', [
        'jshint',
        'mochaTest',
        'browserify',
        'uglify'
    ]);

    grunt.registerTask('develop', [
        'jshint',
        'mochaTest',
        'browserify',
        'watch'
    ]);
};