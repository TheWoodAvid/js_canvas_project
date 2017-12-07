module.exports = function( grunt ) {
	grunt.initConfig({
		watch: {
			sass: {
				files: "*.scss",
				tasks: ['sass']
			},
			js: {
				files: ["*.js","!Grunt*.js"],
				tasks: ['eslint']
			}
		},
		
		sass: {
			dev: {
				files: {
					"style.css": "style.scss"
				}
			}
		},
		
		eslint: {
			target: ['*.js', '!Grunt*.js']
		},
		
		browserSync: {
			default_options: {
				bsFiles: {
					src: [
						"*.css",
						"*.html",
						"*.js"
					]
				},
				options: {
					watchTask: true,
					server: {
						baseDir: "./"
					}
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.registerTask('default', ['browserSync','watch','eslint']);
};