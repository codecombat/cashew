module.exports = function(grunt) {

  // Combine all files in src/
  grunt.initConfig({
    uglify: {
      all_src : {
        options : {
          sourceMap : false,
          sourceMapName : 'sourceMap.map'
        },
        files : {
          'cashew.js' : ['src/coco-java.js','src/cashew.pre.js','src/underscore.modified.js']
        }      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};