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
            "node_modules/bootstrap/js/*.js",
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
      fonts: {
        expand: true,
        cwd: 'node_modules/bootstrap/fonts',
        src: '**',
        dest: 'docs/fonts/'
      },
      prodStyles: {
        src: 'docs/styles.css',
        dest: 'lessons/web/share/jq/cav-ux.css'
      },
      prodScripts: {
        src: 'docs/styles.js',
        dest: 'lessons/web/share/jq/cav-ux.js'
      },
      prodFonts: {
        expand: true,
        cwd: 'docs/fonts',
        src: '**',
        dest: 'lessons/web/share/jq/fonts/'
      }
    },
    clean: ['docs/']
  });
  grunt.loadNpmTasks('documentjs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('document', ['clean', 'documentjs', 'less', 'uglify', 'copy:demos', 'copy:fonts']);
  grunt.registerTask('build', ['document', 'copy:prodStyles', 'copy:prodScripts', 'copy:prodFonts']);
};
