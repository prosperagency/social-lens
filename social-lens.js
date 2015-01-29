$ (document).ready (function () {
	// VARIABLES
	socialLens = { hashtags: [], questions: [] };
	documentHeight = $ (document).height ();

	control = $ ('<div>', {
		id: 'socialLens-control'
	});

	results = $ ('<div>', {
		id: 'socialLens-results'
	});

	socialLensHide = $ ('<a>', {
		id: 'socialLens-hide',
		text: 'Toggle Social Lens'
	});

	socialLensRefresh = $ ('<a>', {
		id: 'socialLens-refresh',
		text: '[ REFRESH ]'
	});

	$ (control).prepend (socialLensHide).append (' ').append (socialLensRefresh);

	$ (control).append (results);

	$ ('body').prepend (control);

	// FUNCTIONS
	var toggleLens = function () {
		$ ('.socialLens-toggle').each (function (index, value) {
			var id = $ (this).attr ('id');
			
			if ($ (this).prop ('checked')) {
				$ ('.socialLens-toggle-' + id).parents ('.stream-item').slideDown ();
			} else {
				$ ('.socialLens-toggle-' + id).parents ('.stream-item').slideUp ();
			}
		});
	};
	
	var clearResults = function () {
		// REMOVE PROMOTED TWEETS
		$ ('.promoted-tweet').remove (); // HIDE GOING FORWARD

		$ (results).empty ();
	};

	var setFormatting = function () {
		// FORMATTING
		$ ('#socialLens-results p').css ('padding-bottom', '8px');
		$ ('#socialLens-results h3').css ('border-bottom', 'solid 2px black');
		$ ('#socialLens-results').css ('font-family', 'Tahoma');
		$ ('#socialLens-control').css ('border', 'solid 2px black');
		$ ('#socialLens-control:hover').css ('cursor', 'pointer');
	};

	var getQuestions = function () {
		$ ("p.tweet-text:contains(?)").each (function (index, value) {
			// Determine whether question mark is part of a url
			var questionIndex = $ (this).text ().indexOf ('?');
			var httpIndex = $ (this).text ().indexOf ('http');

			if (httpIndex != -1 && httpIndex < questionIndex) return true;

			if (!$ (this).hasClass ('socialLens-question')) {
				$ (this).addClass ("socialLens-question");
			}

			var screenName = $ (this).parents ('div.tweet').data ('screen-name');
			var tweetID = $ (this).parents ('div.tweet').data ('tweet-id');
			var href = '/' + screenName + '/status/' + tweetID;
			href = "<a target='_blank' href='" + href + "'>@" + screenName + ': ';

			href = href + $ (this).text () + '</a>';

			socialLens.questions.push (href);
		});
	};

	var setQuestions = function () {
		var h3 = $ ('<h3>', {
			text: 'Questions'
		});

		for (question in socialLens.questions) {
			var p = $ ('<p>', {
				html: socialLens.questions[question]
			});

			$ (results).prepend (p);
		}

		$ (results).prepend (h3);
	}

	var getHashtags = function () {
		$ ('a.twitter-hashtag').each (function (index, value) {
			var hashtag = $ (this).text ();
			hashtag = hashtag.replace ('#', '');
			hashtag = hashtag.toLowerCase ();

			if (!$ (this).hasClass ('socialLens-hashtag')) {
				$ (this).addClass ('socialLens-hashtag').addClass ('socialLens-toggle-' + hashtag);
			}

			socialLens.hashtags.push (hashtag);
		});

		socialLens.hashtags.reverse ();
	};

	var setHashtags = function () {
		// set socialLens.hashtags
		h3 = $ ('<h3>', {
			text: ' Hashtags' // Trends
		});

		var checkbox = $ ('<input>', {
			type: 'checkbox',
			id: 'socialLens-filter',
			class: 'socialLens-filter'
		});

		$ (h3).prepend (checkbox);

		for (hashtag in socialLens.hashtags) {
			var p = $ ('<p>', {
				text: ' - #' + socialLens.hashtags[hashtag]
			});

			var id = socialLens.hashtags[hashtag].replace ('#', '');

			var checkbox = $ ('<input>', {
				type: 'checkbox',
				id: id,
				class: 'socialLens-toggle',
				checked: 'checked'
			});

			$ (p).prepend (checkbox);

			$ (results).prepend (p);
		}

		// iterate through hashtags and remove duplicates
		var duplicates = '';

		$ ('.socialLens-toggle').each (function (index, value) {
			var parent = $ (this).parent ();

			if (duplicates.indexOf ($ (parent).text ()) == -1) {
				duplicates += ' ' + $ (parent).text ();
			} else {
				$ (parent).remove ();
			}
		});
		
		var instructions = $ ('<p>');
		
		var mute = $ ('<a>', {
			class: 'socialLens-mute',
			text: '[ MUTE ALL HASHTAGS ]'
		});
		
		var unmute = $ ('<a>', {
			class: 'socialLens-unmute',
			text: '[ SHOW ALL HASHTAGS ]'
		});
		
		$ (instructions).append (mute).prepend (' - ').prepend (unmute);
		
		$ (results).prepend (instructions);

		$ (results).prepend (h3);
	};

	// EVENTS
	$ ('#socialLens-hide').click (function (e) {
		$ (results).slideToggle ();
	});

	// get and set hashtags and questions
	$ ('#socialLens-refresh').click (function (e) {
		if ($ ('.socialLens-filter:eq(0)').prop ('checked')) {
			$ ('.socialLens-filter').click ();
		}

		clearResults ();

		socialLens = { hashtags: [], questions: [] };
		
		getQuestions ();
		setQuestions ();

		getHashtags ();
		setHashtags ();
	});

	// Arbitrarily wait for Twitter to load data once document ready
	setTimeout (function () { $ ('#socialLens-refresh').click (); }, 1200);

	// Mute unchecked hashtags
	$ (document).on ('change', '.socialLens-toggle', function (e) {
		$ (window).scrollTop (0);

		toggleLens ();
	});

	// Restrict Twitter feed to checked hashtags
	$ (document).on ('change', '.socialLens-filter', function (e) {
		$ (window).scrollTop (0);

		if ($ (this).prop ('checked')) {
			$ ('.stream-item').slideUp ();
		} else {
			$ ('.stream-item').slideDown ();
		}
		
		toggleLens ();
	});
	
	// Check all Social Lens toggles. Subsequently unmute all hashtags.
	$ (document).on ('click', '.socialLens-unmute', function (e) {
		$ (window).scrollTop (0);
		
		$ ('.socialLens-toggle').prop ('checked', true);
		
		toggleLens ();
	});

	// Uncheck all Social Lens toggles. Subsequently mute all hashtags.
	$ (document).on ('click', '.socialLens-mute', function (e) {
		$ (window).scrollTop (0);
		
		$ ('.socialLens-toggle').prop ('checked', false);
		
		toggleLens ();
	});

	// Automatically refresh Social Lens with feed updates
	$ (document).on ('click', '.js-new-items-bar-container', function (e) {
		setTimeout (function () { $ ('#socialLens-refresh').click (); }, 1200);
	});
	
	$ (window).scroll (function (e) {
		if ($ (document).height () != documentHeight) {
			documentHeight = $ (document).height ();

			setTimeout (function () { $ ('#socialLens-refresh').click (); }, 1200);
		}
	});
});