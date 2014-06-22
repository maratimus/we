/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-copy
 */
module.exports = function(grunt) {
	var devfiles = [
		'fonts/**',
		'imgs/**',
		'langs/**'
	];

	grunt.config.set('copy', {
		dev: {
			files: [{
				expand: true,
				cwd: './assets',
				src: 	devfiles
								.concat(require('../pipeline').jsFilesToInjectOriginal)
								.concat(require('../pipeline').cssFilesToInjectOriginal)
								// TODO change this url to assets/fonts folder
								.concat('bower_components/font-awesome/fonts/**')
								.concat('bower_components/select2/*.png')
								.concat('bower_components/select2/*.gif'),
				dest: '.tmp/public'
			}]
		},
		prod: {
			files: [{
				expand: true,
				cwd: './assets',
				src: 	devfiles
								.concat(['js/libs/*.js', 'js/libs/**/*.js'])
								.concat(require('../pipeline').cssFilesToInjectOriginal)
								// TODO change this url to assets/fonts folder
								.concat('bower_components/font-awesome/fonts/**')
								.concat('bower_components/select2/*.png')
								.concat('bower_components/select2/*.gif'),
				dest: '.tmp/public'
			}]
		},
		build: {
			files: [{
				expand: true,
				cwd: '.tmp/public',
				src: ['**/*'],
				dest: 'www'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
};
