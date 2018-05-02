module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      styles: {
        options: {
          cleancss: true
        },
        files: {"docs/styles.css": "styles/less/exitbuttons.less"} // should change to styles/**/*
      },
    },
    copy: {
      demos: {
        expand: true,
        cwd: 'styles/demos',
        src: '**',
        dest: 'docs/demos/'
      }
    }
  });
  grunt.loadNpmTasks('documentjs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('document', ['documentjs', 'less', 'copy:demos']);
  grunt.registerTask('build', ['less', 'copy:prodStyles']);
};
