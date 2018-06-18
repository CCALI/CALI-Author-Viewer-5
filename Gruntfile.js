module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      styles: {
        options: {
          cleancss: true
        },
        files: {
          "docs/styles.css": "styles/styles.less"
        }
      },
    },
    uglify: {
      scripts: {
        files: {
          "docs/styles.js": [
            "node_modules/jquery/dist/jquery.min.js",
            "node_modules/jquery-ui-dist/jquery-ui.min.js",
            "node_modules/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js",
            "styles/js/**/*.js"
          ]
        }
      }
    },
    copy: {
      demos: {
        expand: true,
        cwd: 'styles/demos',
        src: '**',
        dest: 'docs/demos/'
      },
      prodStyles: {
        src: 'docs/styles.css',
        dest: 'lessons/web/share/jq/cav-ux.css'
      },
      prodScripts: {
        src: 'docs/styles.js',
        dest: 'lessons/web/share/jq/cav-ux.js'
      }
    },
    clean: ['docs/']
  });
  grunt.loadNpmTasks('documentjs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('document', ['clean', 'documentjs', 'less', 'uglify', 'copy:demos']);
  grunt.registerTask('build', ['less', 'copy:prodStyles', 'copy:prodScripts']);
};
