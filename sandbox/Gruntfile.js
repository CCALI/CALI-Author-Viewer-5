     module.exports = function(grunt) {
         grunt.initConfig({

            connect: {
                server: {
                    options: {
                        livereload: true,
                        open: true,
                        port: 9000,
                        keepalive: true
                    }
                }
            },
            less: {
                development: {
                    options: {
                    },
                    files: {"styles.css": "styles/styles.less"}
                },
                production: {
                    options: {
                        cleancss: true
                    },
                    files: {"styles.css": "styles/styles.less"}
                }
            }
        });
        grunt.loadNpmTasks('grunt-contrib-less');
        grunt.registerTask('default', ['less']);
    };