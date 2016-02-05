module.exports = function(grunt) {
  // Combine all files in src/
  grunt.initConfig({
    watch:{
      scripts:{
        files: ['src/cashew.pre.js', 'src/coco-java.jison'],
        tasks: ['shell:jison_compile','uglify', 'notify_hooks'],
        options: {
          interrupt : true
        }
      },
    },

    notify_hooks:{
      options:{
        enabled: true,
        title: "Cashew",
        success: true,
        duration: 3,
      }
    },

    shell: {
      jison_compile:{
        command: 'jison src/coco-java.jison && mv coco-java.js src/coco-java.js'
      },
    },

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
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');

  // Default task(s).
  grunt.registerTask('default', ['shell:jison_compile','uglify', 'notify_hooks']);

};
