module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      styles: {
        options: {
          cleancss: true
        },
        files: {"docs/styles.css": "styles/less/**/*"}
      },
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
      }
    },
    clean: ['docs/']
  });
  grunt.loadNpmTasks('documentjs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('document', ['clean', 'documentjs', 'less', 'copy:demos']);
  grunt.registerTask('build', ['less', 'copy:prodStyles']);
};
