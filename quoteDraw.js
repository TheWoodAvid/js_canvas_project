/**
 * PPTile is an object that contains all our related variables and functions.
 * Since they're contained inside it, they can have simple names like 'specs'
 * so if we drop this object inside a bigger project, those simple names won't
 * clash with other vars & functions with the same names.
 *
 * FYI, variables inside objects are called "properties" and
 * functions inside objects are called "methods" ... go figure.
 *
 * So to access the stuff in specs, we use PPTile.specs; to run the init() method
 * we use PPTile.init() and so on...
 *
 * Pay close attention to the special variable 'this' -- which has a different value
 * depending which function/method contains it, and from where that function/method was called.
 */
var PPTile = PPTile || {
	
	/**
	* A good practice is to "declare" the universal properties near the top
	* of the object. Not strictly necessary at all, but it makes code easier
	* to read and understand.
	*/
	
	// inputter will be the textarea into which the user will type text
	inputter: null,
	
	// cvs and ctx will be the canvas and context (botha are terms related to HTML5 canvas drawing)
	cvs: null, ctx: null,
	
	// I've chosen to put all my size, color etc. definitions in a convenient storehouse
	// object called 'specs'. By putting this near the top of my master PPTile object, it'll 
	// be easy to find them when it comes time to change them.
	specs: {
		tile: {
			width: 720,
			height: 405,
			margin: 60,
			lineWidth: 2,
			strokeStyle: '#CCC',
			fillStyle: '#000',
			textColor: '#EEEEEE',
			grossTextTop: 0, // will be calculated later
			maxWidth: 10 // calculated
		},
		label: {
			fillStyle: '#ff6222',
			textAlign: 'left',
			font: '400 18px "Oswald"',
			lineHeight: 10
			
		},
		
		biggest: {
			fontSize: 100,
			lineHeight: 112,
			startY: 1, // calculated
			maxLines: 1 // calculated
		},
		bigger: {
			fontSize: 80,
			lineHeight: 88,
			startY: 1, // calculated
			maxLines: 1 // calculated
		},
		smaller: {
			fontSize: 56,
			lineHeight: 63,
			startY: 1, // calculated
			maxLines: 1 // calculated
		}
	},
	
	/**
	* The initialize function, conventionally called 'init', sets everything up.
	* Later, we'll call it to set all appropriate values and states (see bottom of script)
	*/
	init: function() {
		/**
		* One popular (and lazy) way to manage the value of 'this' is to set a new variable
		* like 'self' to the current value of 'this', so that all nested methods below
		* can access its properties.
		*/
		var self = this;
		
		jQuery('#tile_canvas').attr('width',this.specs.tile.width)
			.attr('height',this.specs.tile.height);
		
		this.inputter = document.getElementById('tile_input');
		
		this.cvs = document.getElementById('tile_canvas');
		// bail on init if there is no canvas ...
		if ( !this.cvs ) { return; }
		
		this.ctx = this.cvs.getContext('2d');
		
		// Now, calculate some of those 'specs' values based on other information... 
		this.specs.tile.maxWidth = this.specs.tile.width - 2 * this.specs.tile.margin;
		this.specs.tile.grossTextTop = this.specs.tile.margin;
		
		this.specs.biggest.startY = Math.ceil( this.specs.tile.grossTextTop + this.specs.biggest.fontSize * 0.83 );
		var availableHeight = this.specs.tile.height - this.specs.label.lineHeight - this.specs.tile.margin - this.specs.biggest.startY;
		this.specs.biggest.maxLines = 1 + Math.floor( availableHeight / this.specs.biggest.lineHeight );
		
		this.specs.bigger.startY = Math.ceil( this.specs.tile.grossTextTop + this.specs.bigger.fontSize * 0.83 );
			availableHeight = this.specs.tile.height - this.specs.label.lineHeight - this.specs.tile.margin - this.specs.bigger.startY;
		this.specs.bigger.maxLines = 1 + Math.floor( availableHeight / this.specs.bigger.lineHeight );
		
		this.specs.smaller.startY = Math.ceil( this.specs.tile.grossTextTop + this.specs.smaller.fontSize * 0.83 );
			availableHeight = this.specs.tile.height - this.specs.label.lineHeight - this.specs.tile.margin - this.specs.smaller.startY;
		this.specs.smaller.maxLines = 1 + Math.floor( availableHeight / this.specs.smaller.lineHeight );
		
		/**
		* Binding is another way to manage the value of 'this'.
		* We bind redrawMessage to PPTile (which is the current value of 'this')
		* because it's an event handler for different events all over the place.
		* Binding means: within redrawMessage, we can be confident the value of 'this' is always PPTile.
		* If we didn't bind redrawMessage to PPTile, its value of 'this' would change
		* depending on where it was called.
		*/
		this.redrawMessage = this.redrawMessage.bind( this );
		
		/**
		* Now add our event listener to inputter.
		* Listener will act on two different events: 'input' and 'change'.
		* Both occur when the value of inputter has changed, however 'change'
		* triggers when the element loses focus (e.g. user clicks outside the input field)
		* 
		* Notice how the listener is a function without a name; this is called an anonymous function.
		*
		* Within the anonymous function, the value of 'this' is the textarea itself,
		* so we can get the textarea value using jQuery(this).val() ... however we also
		* want to access props and methods in PPTile, so we can reference that
		* variable we defined earlier, 'self'.
		*
		*/
		jQuery(this.inputter).on('input change', function() {
			self.redrawMessage( jQuery(this).val() );
		});
		
		/**
		* Quick & dirty event listener to grab the canvas as a PNG image, then
		* add it to the document body.
		* I could have used the equivalent jQuery('#write_submit').on('click' ... but
		* I didn't. I don't remember why.
		*/
		document.getElementById('write_submit').addEventListener('click', function() {

			var dataURL = self.cvs.toDataURL( 'image/png', 1 );
			
			var cvsImage = new Image();
			cvsImage.src = dataURL;
			document.body.appendChild( cvsImage );
			
		})
		
		// init the canvas by filling it with a solid background color.
		this.ctx.fillStyle=this.specs.tile.fillStyle;
		this.ctx.fillRect( 0,0, this.specs.tile.width, this.specs.tile.height );
		
	},
	
	/**
	* Take the input from inputter (phrase), and break it up into lines that'll fit on the canvas.
	* If it turns out the phrase won't fit, complain by setting 'fits' to false.
	*
	* I've defined an object called 'output' near the top of my method, so I can easily see
	* what data gets returned from here. output.lines will contain the calculated lines,
	* output.fits will contain true/false whether or not they fit inside the canvas, and
	* output.sizeOb is simply there for later reference.
	*
	* Earlier I defined three different text sizes = biggest, bigger and smaller, this method
	* knows nothing of those, just the one it's been given in sizeOb. Elsewhere we'll 
	* read the value of output.fits, if false we'll try calling this method again with the next smaller size.
	*
	*/
	calcLines: function( phrase, sizeOb ) {
		this.ctx.font = '300 ' + sizeOb.fontSize + 'px "Oswald"';
		var output = {
			fits: true,
			sizeOb: sizeOb,
			lines: []
		}
		var pargs = phrase.split( /[\n\r]/ ),
			words = [],
			line = '',
			currWord = '';
		
		for ( var ix=0; ix < pargs.length; ix++ ) {
			words = pargs[ix].split(' ');
			// 'while' repeats forever, or until the value inside parentheses ( words.length ) becomes false.
			// In this instance, words.length is a number, and any number other than zero is considered true.
			// When we're done, words.length will become zero, so this loop will finish.
			while( words.length ) {
				currWord = words[0];
				line = words.shift();
				
				while( words.length && this.ctx.measureText( line ).width <= this.specs.tile.maxWidth ) {
					currWord = words[0];
					line += ' ' + words.shift();
				}
				var iLineWidth = this.ctx.measureText( line ).width;
				if ( iLineWidth > this.specs.tile.maxWidth ) {
					// In the special case our current word is too long to fit on the canvas,
					// we have to break up the word. So in that event we call the method this.getFittableLetters
					// to determine how many letters will fit, then break at that many letters.
					if ( line.indexOf(' ') < 0 ) {
						var fitLetterCount = this.getFittableLetters( line );
						line = line.substring( 0, fitLetterCount);
						words.unshift( currWord.substring(0,fitLetterCount) );
						words[0] = currWord.substring(fitLetterCount);
					} else {
						line = line.substring( 0, line.lastIndexOf(' ') );
						words.unshift( currWord );
					}
				}
				output.lines.push( line );
				if ( output.lines.length <= sizeOb.maxLines ) {
					output.fits = true;
				} else {
					output.fits = false;
				}
			}
		}
		return output;
		
	},
	
	/**
	* In the special case when a word is too long to fit on a single line,
	* determine how many letters will fit, and return that number (see calcLines, above)
	*
	*/
	getFittableLetters: function( word ) {
		var iword = '', output = 0;
		for ( var ix=0; ix<word.length; ix++ ) {
			iword += word.substr(ix,1);
			var iWordWidth = this.ctx.measureText( iword ).width;
			if ( iWordWidth > this.specs.tile.maxWidth ) {
				return output;
			} else {
				output++;
			}
		}
		return output;
	},
	
	/*
	* The 'main' method, which acts every time the input has changed.
	* in the 'init' method, we bound this method to PPTile, so the value of 'this' 
	* is always PPTile ... this.calcLines is the PPTile.calcLines method,
	* this.specs is PPTile.specs and so on.
	*
	* redrawMessage is mostly concerned with drawing on the canvas (e.g. everything
	* that starts with 'this.ctx...') 
	*
	*/
	redrawMessage: function( msg ) {
		// start by stripping off spaces from beginning and end.
		msg = msg.trim();

		var lob = this.calcLines( msg, this.specs.biggest );
		if ( !lob.fits ) {
			lob = this.calcLines( msg, this.specs.bigger );
		}
		if ( !lob.fits ) {
			lob = this.calcLines( msg, this.specs.smaller );
			if ( !lob.fits ) {
				if ( lob.lines instanceof Array ) {
					lob.lines = lob.lines.slice( 0, this.specs.smaller.maxLines );
				}
			}
		}
		this.ctx.fillStyle=this.specs.tile.fillStyle;
		this.ctx.fillRect( 0,0, this.specs.tile.width, this.specs.tile.height );

		if ( lob.lines.length ) {
			// calculate vertical center
			var messageHeight = this.specs.label.lineHeight + (lob.lines.length ) * lob.sizeOb.lineHeight;
			var yCenterOffset = ( this.specs.tile.height - this.specs.tile.margin*2 - messageHeight ) / 2;
			
			// draw the label LITTLE-KNOWN FACT...
			// Start by setting the type specs
			this.ctx.fillStyle = this.specs.label.fillStyle;
			this.ctx.textAlign = this.specs.label.textAlign;
			this.ctx.font = this.specs.label.font;
			
			this.ctx.fillText(
				// FYI, canvas text doesn't have a letterspacing property, so we have to fake it
				// by inserting a tiny space between each letter. UTF character set has a number of spaces:
				// 8201 is a thin space; 8202 would be a hairline space.
				'LITTLE-KNOWN FACT'.split('').join( String.fromCharCode(8201) ),		// the text
				this.specs.tile.margin,													// the horizontal start
				this.specs.tile.margin + this.specs.label.lineHeight + yCenterOffset	// the vertical start
			);
			
			// Now draw the main message...
			this.ctx.fillStyle = this.specs.tile.textColor;
			this.ctx.textAlign = 'left';
			this.ctx.font = '300 ' + lob.sizeOb.fontSize + 'px "Oswald"';

			for ( var ix=0; ix < lob.sizeOb.maxLines; ix++ ) {
				if ( 'undefined' == typeof lob.lines[ix] ) { break; }
				this.ctx.fillText(
					lob.lines[ix],
					this.specs.tile.margin,
					this.specs.tile.margin + this.specs.label.lineHeight + lob.sizeOb.lineHeight + lob.sizeOb.lineHeight * ix + yCenterOffset
				);
			}
		}
	},
	
}

/**
* We want to init[ialize] PPTile, but it cannot happen until jQuery is ready and the DOM has
* been fully defined. So we put our method call inside a jQuery 'ready' function
*/
jQuery().ready( function() {
	PPTile.init();	
});
