module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n'
            },
            build: {
                src: [
                    'src/fingers.prefix',
                    'src/module.js',
                    'src/Utils.js',
                    'src/Instance.js',
                    'src/Finger.js',
                    'src/Gesture.js',
                    'src/gestures/module.js',
                    'src/gestures/Drag.js',
                    'src/gestures/Rotate.js',
                    'src/gestures/Pinch.js',
                    'src/gestures/Transform.js',
                    'src/export.js',
                    'src/fingers.suffix'],
                dest: 'fingers.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['concat']);
};