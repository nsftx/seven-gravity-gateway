module.exports = function(grunt) {

    var browserifyDist = function () {
        var components = ['platform_gateway', 'product_gateway'],
            definition = {};

        components.forEach(function (component) {

            definition[component] = {
                files: [{
                    src: './' + component + '.js',
                    dest: 'dist/' + component + '.js'
                }],
                options : {
                    alias: {}
                }
            };

            definition[component].options.alias[component] =  './' + component + '.js';
        });

        return definition;
    };

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    grunt.initConfig({
        mochaTest : {
            test : {
                src: ['test/*.js']
            }
        },
        browserify: browserifyDist(),
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
                    src: '*.js',
                    dest: 'dist/'
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

    // Develop task
    grunt.registerTask('develop', [
        'jshint',
        'mochaTest',
        'browserify',
        'watch'
    ]);
};