module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    concat: {
      dist: {
        src: ['client/scripts/**/*.js'],
        dest: 'client/dist/app.dist.js',
      },
    },
    uglify: {
      my_target: {
        files: {
          'client/dist/app.min.js': ['client/dist/app.dist.js']
        },
        options: {
          mangle: false
        }
      }
    },
    watch: {
      scripts: {
        files: ['client/scripts/**/*.js'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false
        },
      },
    },
  });

  grunt.registerTask('default', ['concat', 'uglify']);

};