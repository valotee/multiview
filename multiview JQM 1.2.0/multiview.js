/**
 * jQuery Mobile Framework : "multiview" plugin
 * @author Sven Franck <sven.franck@stokkers.de>
 * @version v1.1 ~ JQM 1.2.0a (August 2012)
 * @copyright 2012 Sven Franck <sven.franck@stokkers.de>
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 */

(function ( root, doc, factory ) {
	if ( typeof define === "function" && define.amd ) {		
		// AMD. Register as an anonymous module.
		define( [ "jquery", "jqm" ], function ( $, mobile ) {
			factory( $, root, doc );
			return $.mobile.multiview;
		});
	} else {
		// Browser globals
		factory( root.jQuery, root, doc );
	}
}( this, document, function ( jQuery, window, document, undefined ) { 

(function( $, window) {
	
	$.widget("mobile.multiview", $.mobile.widget, {

		options: {

			/**
			  * self.options
		      * Configurable options
		      */

			/**
			  * self.options.lowerThresh|upperThresh
		      * threshold screen widths
			  * 0px - 320px 	= "small"	fullscreen-mode
			  * 320px - 768px	= "medium"	popover-mode, yield-mode or offset-mode
			  * 768px - 		= "large"	splitview-mode
		      */
			lowerThresh: 320,
			upperThresh: 768,

			/**
			  * self.options.switchable|switchableHideOnLoad
		      * popover buttons for menu/mid panel will be visible in splitview mode, can be used to toggle hide/show panels
		      */
			switchable: false,
			switchableHideOnLoad: false,

			/**
			  * self.options.mainTxt|mainBtnTheme|mainBtnIcon|mainBtnIconPos
		      * configure main button, in case another panel should be default background panel (label with data-me="first")
		      */
			mainTxt: 'Main',
			mainBtnTheme: 'a',
			mainBtnIcon: 'delete',
			mainBtnIconPos: 'left',
			
			/**
			  * self.options.menuTxt|menuBtnTheme|menuBtnIcon|menuBtnIconPos
		      * configure menu button, can be set here or on the panel using data-menuTxt="some_text"
		      */
			menuTxt: 'Menu',
			menuBtnTheme: 'a',
			menuBtnIcon: 'gear',
			menuBtnIconPos: 'left',
			
			/**
			  * self.options.midTxt|midBtnTheme|midBtnIcon|midBtnIconPos
		      * configure mid button, same as above
		      */
			midTxt: 'Mid',
			midBtnTheme: 'a',
			midBtnIcon: 'gear',
			midBtnIconPos: 'left',
			
			
			/**
			  * self.options.mainWidth|mainMinWidth
		      * configure width of main panel, can also be set on the panel using data-mainWidth="xy%"
		      */
			mainWidth: '25%',
			mainMinWidth: '250px',
			
			/**
			  * self.options.menuWidth|menuMinWidth
		      * configure width of menu panel, can also be set on the panel using data-menuWidth="xy%"
		      */
			menuWidth: '25%',
			menuMinWidth: '250px',
			
			/**
			  * self.options.midWidth|midMinWidth
		      * configure width of mid panel, same as above
		      */
			midWidth: '25%',
			midMinWidth: '250px',
			
			/**
			  * self.options.defBackTxt|defCloseTxt
		      * default text for popover panels to close, can also be set on the panel as data-close-txt="text"
		      */
			defBackTxt: 'back',
			defCloseTxt: 'close',
			
			/**
			  * self.options.backBtnOff
		      * configure if back buttons should be used or not
		      */
			backBtnOff: false,
			
			/**
			  * self.options.siteMap
		      * stores external pages which are loaded into the site, so fromPage can be identified
			  * on backwards transitions. Also can include entries for allowing to deeplink to external panel pages
			  * 
			  * format [ type: "external|deeplink", data: [data] ] 			  
			  * access self.options.siteMap[ pathname ]
		      */
			siteMap: {},
			
			/**
			  * self.options
		      * Fixed options
		      */

			/**
			  * self.options._iPadFixHeight
		      * iPad does not report the correct height when changing from landscape to portrait. This is a safety.
		      */  
			 _iPadFixHeight: 0,
			 /**
			  * self.options._prevBack
		      * sometimes in Firefox the trailing hashChange comes along as string causing double backwards transitions
			  * (maybe I'm causing this somewhere, but until I find out where, this blocks the 2nd string if it matches the previous one.
		      */  
			 _prevBack: '', 

			 /**
			  * self.options._prevBack
		      * sometimes in Firefox the trailing hashChange comes along as string causing double backwards transitions
			  * (maybe I'm causing this somewhere, but until I find out where, this blocks the 2nd string if it matches the previous one.
		      */  
			 _autoInitFunc : false, 
			 
			/**
			  * self.options._panelTransBlockScrollTop
		      * block scrollTop on transitions inside a popover, without this the screen will flash, wenn a scrollTop is attempted
		      */  
			 _panelTransBlockScrollTop: '',

			/**
			  * self.options._blockMultiClick
		      * prevent multiple clicks firing messing up things on Android
		      */
			// _blockMultiClick: false,

			/**
			  * self.options._stageEvent
		      * store click events, so they are available for overriding changepage options
		      */
			_stageEvent: '',

			/**
			  * self.options._trans
		      * flag for panel transition to clean up after multiview
		      */
			_trans: '',

			/**
			  * self.options._rmv
		      * flag for preventing removal of wrapper on panel transitions
		      */
			_rmv: 'jqm',
			
			/**
			  * self.options._blockPopupHavoc
		      * until popups have a role in changePage options, this is needed to prevent closing popups to slip into panel transitions
		      */
			_blockPopupHavoc: false, 

			
			/**
			  * self.options._backFix
		      * flag for last backwards panel transition
		      */
			_backFix: '',

			/**
			  * self.options._actualActiveIndex
		      * the activeIndex of a page we are going back to. If this is a nested page, we are loading the wrapper and need to reset activeIndex afterwards
		      */
			_actualActiveIndex: 0,
			
			/**
			  * self.options._showUp
		      * initial multiview load is ready
		      */
			_showUp: false,
			
			/**
			  * self.options._blackPass
		      * last backwards transition on blacklisted browsers
		      */
			_blackPass: false,
			
			/**
			  * self.options._basePath
		      * initial path reference as a fallback in case JQM tries to overwrite with
			  * wrong URL in pushstate...
		      */
			_basePath: "",
			
			/**
			  * self.options._stopIt
		      * prevent backwards panel transitions trailing hashChange to trigger the backFix transition
			  * if this fires it will convert the trailing object to a string an pass it.
		      */
			_stopIt: false
		},

/** -------------------------------------- PLUGIN SETUP -------------------------------------- **/

		
		 /**
		   * name: 	      	_create (once)		   
		   * called from: 	plugin trigger = any JQM page with data-wrapper="true" specified
		   * purpose: 		add classes to <html> and setup all event bindings
		   */
		_create: function() {
			
			var self = this,
				touchy = $.support.touch ? ' touch ' : ' notouch ',
				pushy = history.pushState ? ' pushstate ' : ' nopush ',
				blkLst = $.mobile.fixedtoolbar.prototype.options.supportBlacklist() && $.support.scrollTop ? ' blacklist ' : '',
				overthrow = $('div:jqmData(scrollmode="overthrow")').length > 0 ? ' ui-overthrow-mode ' : '',
				base = 'multiview ui-plain-mode'+ touchy + pushy + blkLst + overthrow;
				
			// preset fullscreen-mode (overwritten in Gulliver, needed to avoid falsely assigning ui-panel-hidden)
			$('html').addClass( base + ( self.framer() == "small" ?  "ui-fullscreen-mode" : "" ) );
			
			// tuck away initial path
			self.options._basePath = $.mobile.path.parseUrl( window.location.href ).pathname;
			
			self._mainEventBindings();
			
		},
		
		/**
		   * name: 	      	_init (every instance)	   
		   * called from: 	
		   * purpose: 		
		   */
		_init: function(){
			// no need for now, as multiview catches new wrapper pages on pagebeforeshow
			}, 

		 /**
		   * name: 	      	setupMultiview
		   * called from: 	main event bindings, pagebeforeshow.wrapper
		   * purpose: 		called once for every wrapper page (init or pulled-in),
		   *                sets default flags, global toolbars, enhances first pages on all panels, screen dimension and panel setup
		   * @param {event} event
		   * @param {page}object
		   */
		setupMultiview: function(page) {
			
			var self = this, header, setPage, setPageUrl;
			
			page
				//.addClass( $.mobile.activePageClass )
				 // transition counter
				.attr({ '_transDelta' : 0 })
				 // trace panels for fullscreen mode
				.data("trace", [])
				.find("div:jqmData(role='panel')").addClass('ui-mobile-viewport ui-panel').end()
				.find("div:jqmData(role='page')").attr('data-dom-cache', 'true').each(function(){	
					// add data-url to all internal pages otherwise JQM can't check if they are on board 
					// on external wrapper pages being pulled in
					$(this).attr('data-url',$(this).attr('id') );
					
					}).end()
				.find('div:jqmData(role="panel") div:jqmData(show="first")').addClass( $.mobile.activePageClass ).page().end()
				.filter(":jqmData(scrollmode='overthrow')")
					.find('div.ui-page div.ui-content')
					.addClass('overthrow');
			
			// init popover bindings
			self._popoverBindings();
			
			// global toolbars, splitscreen
			if ( page.find('div:jqmData(panel="main"), div:jqmData(panel="menu"), div:jqmData(panel="mid")').length > 0 ) {

				page.children('div:jqmData(role="header"), div:jqmData(role="footer")').each( function() {

					header = $(this).is( ".ui-header" );
					$(this).addClass( header ? 'ui-header-global' : 'ui-footer-global' )
							.attr( "data-position", page.jqmData("scrollmode") == "overthrow" ? "inline" : "fixed" );
					});

				// fire splitScreen	
				self.splitScreen("init");
				}
			self._setupPopovers( page );
			self.gulliver("Init");
			},

/** -------------------------------------- POPOVER HANDLER -------------------------------------- **/

		 /**
		   * name: 	      	_setupPopovers
		   * called from: 	setupMultiview - fires once for every wrapper page
		   * purpose: 		add triangles, handle autoshow (= show popover once, the first time the page loads)
		   * @param {page}object
		   * TODO: REFACTOR triangles so they are visible although overflow is set to hidden (try CSS before/after)
		   */
		_setupPopovers: function( page ) {
			
			var self = this,
				pops = page.find('div:jqmData(panel="popover")').add( $('html.ui-popover-mode').find('div:jqmData(panel="menu"), div:jqmData(panel="mid")') ),
				thatPop, triangle;

			for (var i = 0; i < pops.length; i++) {

				thatPop = pops.eq(i);
				tri = typeof thatPop.jqmData("triangle") == "undefined" ? 'ui-triangle-top' : 'ui-triangle-'+thatPop.jqmData("triangle");				
				
				thatPop.addClass("ui-popover "+tri )
					.filter( ".ui-triangle-top")
						.append( thatPop.find('.popover_triangle').length == 0 ? '<div class="popover_triangle" />' : '' )
						.end()
					.filter( ".ui-triangle-bottom" )
						.prepend( thatPop.find('.popover_triangle').length == 0 ? '<div class="popover_triangle" />' : '' )
						.end()
					//.filter( ":jqmData(autoshow='once')" )
					//	.delay(10).closest('html').find(".toggle_popover:jqmData(panel='"+thatPop.jqmData('id')+"'):eq(0)").click().end().end()
					//	.delay(10).jqmRemoveData("autoshow").removeAttr('data-autoshow');
				}
		},

		/**
		   * name: 	      	_popoverBindings
		   * called from: 	_create, will only be called once
		   * purpose: 		when to close a popover = call hideAllPanels()
		   *				(1) close popover button or hidePanel button
		   *				(2) scrollstart on panel (overthrow mode)
		   *				(3) scrollstart document
		   *				(4) click or tap on the wrapper page		   
		   *				[(6) click a link in a panel, which loads a page in another panel (inside panelTransitionCleaner) ]
		   *				(7) orientationchange
		   *				[(8) clicking on active popover button closes this popover - inside showPanel()]
		   *				[(9) clicking on a not-active trigger button closes all other popovers first - inside showPanel() ]
		   * IMPROVE SELECTORS...
		   */
		_popoverBindings: function() {
			
			var self = this, 
				o = self.options,
				solo = false, $nope, $midMen,

				over 	= $('html').hasClass('ui-overthrow-mode'),// = panels scrolling independently
				full 	= $('html').hasClass('ui-fullscreen-mode'),// = smartphone, fullscreen pages
				split 	= $('html').hasClass('ui-splitview-mode'),// = splitscreen
				pop 	= $('html').hasClass('ui-popover-mode'),// = menu/mid panels open as popovers
				yield 	= $('html').hasClass('ui-yield-mode');// = menu/mid panels open fullscreen
						
			// (1) 
			$(document).on('click','a.closePanel, a.hidePanel', function () {
				self.hideAllPanels("1");
				});

			// (2)
			if ( over == true ) {
				$('.ui-content.overthrow').on('scrollstart', function() {

					if ( split == true  && $(this).closest('div:jqmData(panel="main"), div:jqmData(panel="mid"), div:jqmData(panel="menu")').length > 0 ||
							pop == true && $(this).closest('div:jqmData(panel="main")').length > 0 ) {

							// prevent iOS keyboard hiding popover				
							if (!$("input").is(':focus')) {  
								self.hideAllPanels("2");
								}
						}
					});
				}
			
				
			// (3)
			$(document).on('scroll', function(){
				
				// w/o _panelTransBlockScrollTop transitions trigger a scroll, which will hide the popover
				if ( full  == false && yield == false  && o._panelTransBlockScrollTop == false )  {	
					if (!$("input").is(':focus')) {  
						self.hideAllPanels("3");
						}
					
					o._panelTransBlockScrollTop == true; 
					}

				});

			// (4) 
			$(document).on('click tap', function(event) {

				$midMen = $('div:jqmData(panel="menu"), div:jqmData(panel="mid")'),
				$nope = $('div:jqmData(role="popup"), div:jqmData(panel="popover"), .mmToggle, .toggle_popover')
							.add( $('.ui-fullscreen-mode').find( $midMen ) )
								.add( $('.ui-popover-mode').find( $midMen ) );

				// don't hide if click is on popover and popover-toggle button
				// or the menu or mid in popover mode
				// or any custom select menus firing up... this list is getting to long.				
				if ( $(event.target).closest( $nope ).length > 0 ) {
					return; 
					}

				// make sure it only fires once			
				if ( solo == false ) {
					solo = true;
					self.hideAllPanels("4");
					window.setTimeout(function() { solo = false; },500);
					}
				});

			// (7)
			$(window).on('orientationchange', function(event){
				if ( full == false ) {
					self.hideAllPanels("7");
					}
				});
			},

		/**
		   * name: 	      	hideAllPanels
		   * called from: 	all of the above
		   * purpose: 		close popovers = regular popover or a menu/mid panel in popover or fullscreen mode
		   * @param {string}to check who called
		   */
		hideAllPanels: function(from) {
			
			var self = this, main,
				o = self.options,
				wrap = $('div:jqmData(wrapper="true").ui-page-active'),
				trans = ( $('div:jqmData(yieldmode="true")').length > 0 && !$('html').hasClass('ui-splitview-mode') ) ? 'slide' : 'pop',
				full = $('html.ui-fullscreen-mode'),
				pop =  $('html.ui-popover-mode'),
				midMen = $("div:jqmData(panel='menu'), div:jqmData(panel='mid')"),
				pops = $("div:jqmData(panel='popover')").add( pop.find( midMen ) ).add( full.find( midMen ) ).filter(':visible');

			if ( pops.length == 0){
				return;
				}

			for ( var i = 0; i < pops.length; i++){
				pops.eq(i)
					.addClass('reverse out '+trans)
					.hide('fast')
					.removeClass('ui-panel-active')
						.find(".ui-page-active")
							.not("div:jqmData(show='first')")
							.removeClass('ui-page-active').end()
						.find(".ui-btn-active")
							.removeClass('ui-btn-active').end()
						.find('div:jqmData(external-page="true")')
							.remove().end().end()
						.delay(350)
						.queue(function(next){
							$(this).removeClass('reverse out pop slide')
							next();
							})

				// fullscreen handler
				if ( full.length > 0 ) {
					$('div:jqmData(panel="main")')
							.removeClass('ui-panel-hidden')
					wrap.find('.reActivate')
							.addClass('ui-page-active')
							.removeClass('reActivate');
					}
	
				// clean up after Android bleed through clicks
				$('.androidSucks').removeClass('ui-disabled androidSucks').removeAttr('disabled');
				
				// reset background height
				self.panelHeight("background", "clear" )	
				
				$('.toggle_popover').removeClass('ui-btn-active');
				}			
			},
		
		/**
		   * name: 	      	hideAllPanels
		   * called from: 	clicking a toggle_popover button, data-autoshow or panelTransitionCleaner
		   * purpose: 		show a popover or switchable panel
		   * @param {event}click event
		   * @param {object}clicked button
		   */
		showPanel: function( panel) {
			
			var self = this,
				o = self.options,	
				wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				pop = wrap.find('div:jqmData(id="'+panel+'")'),				
				full = $('html.ui-fullscreen-mode');
			
			if ( pop.is(":visible") ) {
				if ( pop.hasClass('switchable') && wrap.jqmData('switchable') ) {
					
					// hide switchable
					pop.css('display','none').addClass("switched-hide");
					self.panelWidth( true, "showPanel" );
					
					} else {
						// (8) regular panel routine
						self.hideAllPanels("8");
						}
					
				} else {

					if ( pop.hasClass('switchable') && wrap.jqmData('switchable') ) {
						
						// show switchable
						pop.css('display','block').removeClass("switched-hide");
						self.panelWidth( true, "showPanel" );
						
						} else {

							// (9) regular panel routine
							self.hideAllPanels("9");
							
							// center screen
							if ( pop.hasClass('ui-popover-center') ){
								pop.css("left", (($(window).width() - pop.outerWidth()) / 2) + $(window).scrollLeft() + "px");
								}
							
							// reposition 
							// done with Scott Jehls - https://github.com/filamentgroup/jQuery-Mobile-FixedToolbar-Legacy-Polyfill
							pop.jqmData("fixed") == "top" ? 
								pop.css( "top", $( window ).scrollTop() + "px" ) :
									pop.css( "bottom", wrap.outerHeight() - $( window ).scrollTop() - $.mobile.getScreenHeight() + "px" );
							// show
							pop.not('.ui-splitview-mode div:jqmData(panel="menu"), .ui-splitview-mode div:jqmData(panel="mid")')
								.addClass('ui-panel-active '+ ( $('div:jqmData(yieldmode="true")').length > 0 && !$('html').hasClass('ui-splitview-mode') ) ? 'slide ' : 'pop '+' in')
								.show('fast')
								.removeClass('ui-panel-hidden')								
								.find('div:jqmData(show="first")')
									.addClass('ui-page-active')									
									.delay(350)
									// check to see if this work with overthrow/blacklist
									// JQM always adds 43px padding, if any active page has a 43px header. 
									//.attr({'style':'padding-top 0px !important'})
									.queue(function(next){
										pop.removeClass('in');
										// reset										
										next();
										});

							// fullscreen handler	
							if ( full.length > 0 ) {
								
								// hide background							
								$('div:jqmData(panel="main")').addClass('ui-panel-hidden');
								
								// remeber and clear active pages							
								$('.ui-page-active')
									.not( "div:jqmData(wrapper='true'), div:jqmData(id='"+panel+"') .ui-page-active" )
									.addClass("reActivate")
									.removeClass('ui-page-active');
										
								// "fix" for Android bleeding through clicks... // http://code.google.com/p/android/issues/detail?id=6721	
								$('.ui-page')
									.not( pop.find('div:jqmData(role="page")') )
									.find(".ui-header").first()
									.find(".ui-btn, input, select, textarea")
										.addClass('ui-disabled androidSucks')
										.attr('disabled','disabled');	
										
								// and since Android never minds and also disables the page that should be enabled
								pop.find('.androidSucks').removeClass('ui-disabled androidSucks').removeAttr('disabled');
								// tweak background page height	to enable hardware-scrolling by setting height of all pages to height of active popover								
								// lock background
								self.panelHeight( "background", "set" )
								}

							
							}
					}
	
			},

/** -------------------------------------- BACK/MENU BUTTON HANDLER -------------------------------------- **/
		
		 /**
		   * name: 	      	 crumble
		   * called from: 	 pagebeforeshow on panel pages (not wrapper page!)
		   * purpose: 		 creates a backbutton, passes it to popoverBtn() function
		   * @param {event} event = pagebeforeshow
		   * @param {object} data = event data
		   * @param {object} page = being shown
		   */
		crumble: function(event, data, page) {
		
			var self = this;
			
			if ( page.jqmData("show") != "first")  {
				
				var drop = page.find('div:jqmData(role="header")') || page.closest('div:jqmData(wrapper="true").ui-page-active').children('div:jqmData(role="header")'),
					prePg = $( data.prevPage ), 
					preID = data.prevPage.attr('id'),
					preHd = prePg.find('.ui-header'),
					preTt = preHd.find('.ui-title').text() || preID;
					pnID = prePg.closest('div:jqmData(role="panel")').jqmData("id"),
					preTh = page.find( ".ui-header" ).jqmData('theme') || "a",
						
				newButton = self.buttonUp( preID, 'ui-crumbs iconposSwitcher-a ui-btn-up-'+preTh+' ui-btn ui-btn-icon-left', preTh, pnID, 'left', preTt, 'arrow-l', 'pop', 'title="back" data-rel="back"  data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span"', '' )
			
				// handover
				self.setBtns("add", drop, newButton );
				}
			}, 				
		
		/**
		   * name: 	      	popoverBtn
		   * called from: 	popover() - regular popover button (same as for yield mode) / splitview() - switchable button							
		   * purpose: 		add popover buttons for menu|mid. If both panels are used it will be a 2-button controlgroup		   
		   * @param {string}  buttonType (info who called)
		   */
		popoverBtn: function ( buttonType ) {
			
			var self = this,
				o = self.options,
				wrap = wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				main = wrap.find('div:jqmData(panel="main")'),
				menu = wrap.find('div:jqmData(panel="menu")'),
				mid = wrap.find('div:jqmData(panel="mid")'),
				mdBt = '',
				mnBt = '',
				
				glHd = wrap.find('.ui-header-global'),
				loHd = wrap.find('div:jqmData(panel="main") div:jqmData(role="page") .ui-header'),
				flex = wrap.find('div:jqmData(role="page") div:jqmData(drop-pop="true")'),
				
				// button(s) go to (1) user-specified location (2) global header (3) local headerS (4) pageS content				
				drop = flex.length ? 
					flex : glHd.length ? 
						glHd : loHd.length ? 
							loHd : wrap.find('div:jqmData(panel="main") .ui-content');
				
			// switchable classes - moved from function end to here, because on or-change, no new buttons will be created
			// function will stop early without re-assigning switchable class
			if (buttonType == "switchable") {
				menu.add( mid ).addClass('switchable');
				}
				
			if ( menu.length == 0 && mid.length == 0 ) {
				return;
				}
			
			// menu button 
			if ( menu.length > 0 && main.find( '.menuToggle' ).length == 0 ) {
				
				var mnId = wrap.find('div:jqmData(panel="menu")').jqmData('id'),
					mnIc = menu.jqmData('menu-icon') || o.menuBtnIcon,
					mnIp = menu.jqmData('menu-iconpos') || o.menuBtnIconPos,
					mnTh = menu.jqmData('menu-theme') || o.menuBtnTheme,
					mnTx = menu.jqmData('menu-text') || o.menuTxt,
					
					mnBt = self.buttonUp( '#', 'ui-btn-up-'+mnTh+' ui-btn ui-btn-icon-'+mnIp+' ui-shadow  iconposSwitcher-a toggle_popover mmToggle menuToggle', mnTh, mnId, mnIp, mnTx, mnIc, 'pop', '', ''  );
				
				}
			
			// mid button 
			if ( mid.length > 0 && main.find( '.midToggle' ).length == 0 ) {
				var mdId = wrap.find('div:jqmData(panel="mid")').jqmData('id'),
					mdIc = mid.jqmData('mid-icon') || o.midBtnIcon,
					mdIp = mid.jqmData('mid-iconpos') || o.midBtnIconPos,
					mdTh = mid.jqmData('mid-theme') || o.midBtnTheme,
					mdTx = mid.jqmData('mid-text') || o.midTxt,
											
					mdBt = self.buttonUp( '#', 'ui-btn-up-'+mdTh+' ui-btn ui-btn-icon-'+mdIp+'  iconposSwitcher-a toggle_popover mmToggle midToggle', mdTh, mdId, mdIp, mdTx, mdIc, 'pop', '', ''  );
				}
			
			if ( mnBt == "" && mdBt == "" ){
				return;
				} else if ( mnBt == "" ) {
					$buttons = mdBt;
					} else if ( mdBt == "" ) {
						$buttons = mnBt;
						} else {
							$buttons = mnBt.add( mdBt );
							}
			
			// handover
			self.setBtns( "add", drop, $buttons );
			},

		/**
		   * name: 	      	setBtns
		   * called from: 	popoverBtn and crumble
		   * purpose: 		central function to insert buttons (single, controlgroup, controlgroup with existing buttons!)   
		   * @param {string}  action = what to do, add/update, update is just re-setting corners
		   * @param {object}  $dropZone = where button(s) should be placed
		   * @param {object}  $elements = button(s)
		   */
		setBtns: function ( action, $dropZone, $elements ) {
			var self = this, 				
				$button, $first, $prevBtn, $newBtn, $lftWrp, $buttons, $ctrlGrp, $this, $clear, $filter, $firsty,
				crnrs = 'ui-corner-all ui-corner-right ui-corner-left ui-corner-right ui-corner-bottom';
										
			if ( action != "update" ) {
				$dropZone.each(function() {
					
					$this = $(this),  
					$lftWrp = $('<div />').addClass("headWrapLeft ui-btn-left"),
					$ctrlGrp = $('<div />').attr({'data-role':'controlgroup', 'data-type':'horizontal'}).addClass('btnSwitchBoard').controlgroup(), 					
					$buttons = $elements.clone();
					
					// (a) empty dropZone => create wrap and controlgroup, insert button(s)
					if ( $this.find('.ui-btn-left').length == 0 && $this.find('.btnSwitchBoard').length == 0  ) {
						
						if ( $this.is( ".ui-header" ) ) {
							$this.prepend( $lftWrp.html( $ctrlGrp.html( $buttons ) ) );
							} else {
								$this.prepend( $ctrlGrp.html( $buttons ) );
								}
														
						} else {
							
							if ( $this.find('.ui-btn-left.ui-btn').length ) {								
								// (b1) there is a button = edge case, since plugin always should add wrapper and controlgroup and place buttons inside
								$button = $this.find('.ui-btn-left.ui-btn');
								
								
								// "skin" and replace with controlgroup
								$button.removeClass( crnrs+' ui-shadow popover-btn' )
										.find('.ui-btn-inner').removeClass( crnrs ).end()
										.css({'position':'static'})
										.addClass('ui-controlgroup-btn-left ui-btn-inline iconposSwitcher-a')
								
								$this.find( $button ).remove();
								
								if ( $this.is( ".ui-header" ) ) {
									$this.prepend( $lftWrp.html( $ctrlGrp.addClass('combo').html( $button.add( $buttons ) ) ) );
									} else {
										$this.prepend( $ctrlGrp.addClass('combo').html( $button.add( $buttons ) ) );
										}
								
								} else {
									
									// (b2) there is sth, either a wrapper inside a header or a controlgroup inside a user specified element
									$first = $this.find('.ui-btn-left').children(':first');									
									
									if ( $first.jqmData("role") == "controlgroup" ) {
										
										// clean corners
										$first.addClass('btnSwitchBoard').attr({'data-type':'horizontal'}).removeClass('ui-controlgroup-vertical')
											.find( '.ui-btn, .ui-controlgroup-last, .ui-controlgroup-first, .ui-select .ui-btn')
												.removeClass('ui-controlgroup-last '+crnrs)
													.find('.ui-btn-inner').removeClass( crnrs );
										
										function clearOut( $what ) {
											$buttons.each(function () {
												if ($(this).is( $what )) {
													$buttons = $buttons.not( $what )
													}
												});
											}
																			
										// TODO: improve - filter for existing buttons									
										if ( $first.find('.midToggle').length > 0 ) {
											clearOut('.midToggle');
											}
										if ( $first.find('.menuToggle').length > 0 ) {
											clearOut('.menuToggle');
											}
										if ( $first.find('.ui-crumbs').length > 0 ) {
											 clearOut('.ui-crumbs');
											}
										$first.append( $buttons ).controlgroup("refresh") 
										} else {
											// edge case: not a controlgroup, perhaps select element or ? 										
											$first.find( '.ui-btn' ).andSelf().removeClass('ui-btn-corner-all')
														.find('.ui-btn-inner').removeClass('ui-btn-corner-all');
											$first.remove();
											$this.find('.headWrapLeft').prepend( $ctrlGrp.addClass('combo').html( $first.add( $buttons ) ) );
											}
									}
					
						}
					});
				}
			
			// add corners to first and last element
			$('.btnSwitchBoard').each( function () {
				var $firsty = $(this).find('.ui-btn').first();				
				$firsty.add( $firsty.find('.ui-btn-inner') ).removeClass('ui-corner-top ui-corner-right').addClass('ui-corner-left')
				
				$(this).children().last().addClass('ui-corner-right ui-controlgroup-last')
						.find('.ui-btn-inner').addClass('ui-corner-right');
				});
			},
		
/** -------------------------------------- SCREEN MODE HANDLER -------------------------------------- **/

		
		/**
		   * name: 	      	  popover
		   * called from: 	  splitscreen()
		   * purpose: 		  set up popover mode
		   */
		popover: function () {
			
			var self = this,
				o = self.options,
				wrap = wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				popover = wrap.find('div:jqmData(panel="popover")'),
				yield = $('div:jqmData(yieldmode="true")').length > 0,
				full = $('html.ui-fullscreen-mode').length > 0,				
				elems = wrap.children('div:jqmData(role="panel")').not(':jqmData(panel="popover")'),
				el;
							
			$('html').addClass( yield ? 'ui-multiview-active ui-yield-mode' : 'ui-multiview-active ui-popover-mode').removeClass('ui-splitview-mode');
							
			elems.removeClass('ui-panel-left ui-panel-mid ui-panel-right')
				.each(function(i){
					var el = $(this);
					
					// switch background panels to popovers (default panel to show needs data-me="first" )
					if ( typeof el.jqmData("me") == "undefined" ? el.not(':jqmData(panel="main")').length > 0 : el.not(':jqmData(me="first")').length > 0 ){

						el.addClass( yield ? 'pop_fullscreen' : 'ui-popover'								
									+ ( el.jqmData("id") == "menu" ? ' pop_menuBox' : ( el.jqmData("id") == "main" ? ' pop_mainBox' : ' pop_midBox')))							
							.append( yield ? '' : el.find('.popover_triangle').length == 0 ? '<div class="popover_triangle" />' : '' )
							.attr( yield ? '' : 'data-triangle', 'top').addClass('ui-triangle-top')
							.add( el.find('div:jqmData(role="page")') ).add( el.find('div:jqmData(role="page")').find('.ui-header, .ui-footer') )
							.css({
								'margin-left' : '0px',
								'width': ( yield ? '' : ( full ? "100%" : el.jqmData("width") || o[el.jqmData("panel") + "Width"]) ), 
								'min-width': ( yield ? '' : el.jqmData("minWidth") || o[el.jqmData("panel") + "MinWidth"])
								})
							.find( 'div:jqmData(role="page") .ui-content').addClass('overthrow'); 

					} else {
						// background panel for popover AND fullscreen
						el
							.addClass('ui-panel-active')
							.add( el.find('div:jqmData(role="page")') ).add( el.find('div:jqmData(role="page")').find('.ui-header, .ui-footer') )
							.css({
								'width':'', 
								'margin-left':'', 
								'min-width':''
								});
					}
				
				});
		 
			popover.removeClass('pop_fullscreen')
					.addClass('ui-popover');
		
			// popover button			
			self.popoverBtn("plain");
			},

		/**
		   * name: 	      	  splitView
		   * called from: 	  splitScreen() - depending on screen size and orientation
		   * purpose: 		  set up splitiview mode for 1/2/3 panels		   
		   * @param {object}  event		   
		   */
		splitView: function (e) {
			
			var self = this,
				o = self.options,
				wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				popover = wrap.find('div:jqmData(panel="popover")'), 
				over = wrap.jqmData("scrollmode") == "overthrow", 
				_switch = o.switchable || wrap.jqmData("switchable"),
				switchOnLoad = o.switchableHideOnLoad || wrap.jqmData("switchableHideOnLoad"),
				popClasses = 'ui-popover pop_menuBox pop_midBox ui-triangle-top ui-panel-visible ui-triangel-bottom ui-triangle-undefined',
				elems = wrap.children('div:jqmData(role="panel")').not(':jqmData(panel="popover")'),
				el, pos;
				
			$('html').addClass('ui-multiview-active ui-splitview-mode').removeClass('ui-popover-mode ui-fullscreen-mode');
			
			elems.each(function(i){
				var el = $(this),
					pos = el.jqmData("panel") == "menu" ? 'left' : ( el.jqmData("panel") == "main" ? 'right' : 'mid');
				
				// convert popovers to background
				if ( typeof el.jqmData("me") == "undefined" ? el.not(':jqmData(panel="main")').length > 0 : el.not(':jqmData(me="first")').length > 0 ){

					el.removeClass( popClasses )
						.addClass( 'ui-panel-active ui-panel-'+pos )
						.removeAttr('data-triangle')
						.removeClass('ui-triangle-top ui-triangle-bottom')
						.children('.popover_triangle').remove()
							.end()
						.find('div:jqmData(show="first") .closePanel').remove()
							.end()
						.css({
							'width':  ( _switch && switchOnLoad  ? '' : el.jqmData("width") || o[el.jqmData("panel") + "Width"] ),
							'min-width': ( _switch && switchOnLoad ? '' : el.jqmData("minWidth") || o[el.jqmData("panel") + "MinWidth"] ), 
							'display': ( _switch && switchOnLoad  ? 'none' : '' )
							})
						.find('div:jqmData(role="page") .ui-content')
							.removeClass( over == true ? '' : 'overthrow' );

				} else {
					// background panel stays					
					el.addClass('ui-panel-active ui-panel-'+pos )
					}				
				});
				
			popover.removeClass('pop_fullscreen').addClass('ui-popover')

			// toggle buttons		
			if ( _switch == true ){		
				
				self.popoverBtn("switchable");
				} else {
					// remove any toggle buttons left if switching from popover to splitview					
					$(".mmToggle").remove();
					// update header button controlgroup
					self.setBtns("update")
					}
			},

		/**
		   * name: 	      	  splitScreen
		   * called from: 	  setupMultiview() - for every wrapper page that is loaded initially or externally, also on orientationchange and resize
		   * purpose: 		  determine which screenmode to run
		   * ADD yield-mode, find out why this breaks on resize
		   * @param {string}  event CAREFUL: THIS IS NO REAL EVENT
		   */
		splitScreen: function( event ) {
			
			var self = this,
				o = self.options,
				wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				$window = $(window);
			
			if ( wrap.find('div:jqmData(panel="menu"), div:jqmData(panel="main"), div:jqmData(panel="mid")').length == 0 ) {
				return;
				}
				
			// event can be "init" or orientationchange event
			if ( event ) {
				
				// portrait
				if (window.orientation == 0 || window.orientation == 180 ){
					if($window.width() > o.upperThresh)  {
						self.splitView( event);
						} else {
							self.popover( event);
							} 
					}
					
					// landscape
					else if (window.orientation == 90 || window.orientation == -90 ) {
					if($window.width() > o.upperThresh) {
						self.splitView( event);
						} else {
							self.popover( event);
							}
						
						// click, resize, init events						
						} else if ( $window.width() < o.upperThresh){
							self.popover( event );
							}
							else if ($window.width() > o.upperThresh) {
								self.splitView( event );
								}
				}
					
			}, 			
	
/** -------------------------------------- PANEL/PAGE/CONTENT FORMATTING -------------------------------------- **/
		
		/**
		   * name: 	      	  gulliver
		   * called from: 	  setupMultiview() and orientationchange
		   * purpose: 		  set classes for fullscreen mode, manage fHeight		   		   
		   */
		gulliver: function( from ) {
			
			var self = this,
				o = self.options,
				wrap = $('div:jqmData(wrapper="true")'),
				thisWrap = wrap.is('ui-page-active') == true ? wrap : wrap.length > 1 ? wrap.last() : wrap.first(),
				pops = thisWrap.find('div:jqmData(panel="popover")'),				
				excpt = thisWrap.find('div:jqmData(me="first")').length ? ':jqmData(me="first")' : ':jqmData(panel="main")',				
				all = $('html').filter(':not(.ui-splitview-mode)').find( thisWrap ).find('div:jqmData(role="panel")').not( excpt ),						
				frame = self.framer(),
				max = 0, check;
			
			// popover height > available screen height? 
			for ( var i = 0; i < pops.length; i++) {
				check = parseFloat( pops.eq(i).css('height') );
				if ( check > max ) {
					max = check;
					}
				}
			
			// fullscreen mode, if width < 320px OR popovers bigger than screen height
			if ( frame == "small" || max > $(window).height() ) {
				
				all				
					.removeClass('ui-triangle-top ui-triangel-bottom ui-popover ui-popover-embedded')
					.addClass('pop_fullscreen')
					.not('.ui-panel-active')
						 .addClass('ui-panel-hidden').end()
					.find('.popover_triangle')
						.remove().end()				
				
				// make buttons icon-only on smartphone
				$(".iconposSwitcher-a, .iconposSwitcher-div .ui-btn").add( $(".iconposSwitcher-input").closest('.ui-btn') )
					.filter(':not(.noSwitch)')
						.removeClass('ui-btn-icon-left ui-btn-icon-right')
						.attr('data-iconpos','notext')
						.addClass('ui-btn-icon-notext');
				
				// not sure anymore whether needed	
				$(".iconposSwitcher-select")
					.find('.ui-icon')
					.css({'display':'none'});
					
				$(".iconposSwitcher-div label, .iconposSwitcher-select label, .hideLabel")
					.addClass("ui-hidden-accessible");

				$('html').removeClass('ui-popover-mode ui-splitview-mode')
				
				} else {
					$('html').removeClass('ui-fullscreen-mode');
					}

			// back/close buttons
			for ( var j = 0; j < all.length; j++) {
				
				pop = all.eq(j);
				
				if ( pop.find('.back_popover').length == 0 ) {
					
					var btnTxt = pop.hasClass('pop_fullscreen') ? ( pop.jqmData("close-txt") || o.defBackTxt ) : ( pop.jqmData("back-txt") || o.defCloseTxt ),
						btnIc = pop.hasClass('pop_fullscreen') ? 'arrow-l' : 'delete',
						togBtn = self.buttonUp( '#', 'ui-corner-left ui-corner-right back_popover ui-btn ui-btn-icon-left ui-btn-left ui-btn-up-a closePanel', 'a', '', 'left', btnTxt, btnIc, 'pop', 'data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span"', 'ui-corner-left ui-corner-right' );
						
					pop.find('div:jqmData(show="first") .ui-header h1').before( togBtn );
					}
				}
			}, 
		
		/**
		   * name: 	      	  panelWidth
		   * called from: 	  panelHeight, orientationchange, initial setup		   
		   * purpose: 		  adjust width of all background panels (including heade/footer/content), manage difference between 25% and 250px
		   * ADD yield-mode
		   * @param {string}  update (or recalculate)
		   * @param {string}  who called
		   */
		panelWidth: function( update, from ) {

			var self = this,
				o = self.options,
				wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				pop = $('.ui-popover');
	
			// no background panels, no widths to set
			if ( wrap.find('div:jqmData(role="panel")').not('div:jqmData(panel="popover")').length == 0) {				
				if ( o._showUp == false ) {					
					o._showUp = true;
					$(window).trigger('multiview-ready');
					}
				return;
				}
			
			// data-me="first" = panel which is visible by default
			var	uno = wrap.find('div:jqmData(me="first")').length > 0 ? wrap.find('div:jqmData(me="first")') : wrap.find('div:jqmData(panel="main")'),
				unoPg = uno.find("div:jqmData(role='page')"),
				unoEl = unoPg.find('.ui-header, .ui-footer'),
			
				duo = wrap.find('div.ui-panel').not( uno ).not( pop ).first(),
				duoPg = duo.find("div:jqmData(role='page')"),
				duoEl = duoPg.find('.ui-header, .ui-footer'),
				
				tre = wrap.find('div.ui-panel').not( uno ).not( duo ).not( pop ),
				trePg = tre.find("div:jqmData(role='page')"),
				treEl = trePg.find('.ui-header, .ui-footer'),
			
				wrapWidth = wrap.innerWidth(),
				// if panelHeight is not done (hiding toolbars in overthrow layouts, the scrollbar width 17px will not be included in wrapWidth
				// need to adjust manually or use a timeout
				// delta = window.screen.availWidth > wrapWidth ? window.screen.availWidth - wrapWidth : 0,
				unoWidth,
				duoWidth = 0, 
				treWidth = 0;
			
			
			
			if (self.framer() != 'small' && $('html').hasClass('ui-splitview-mode') ) {
							
				// width = 0 ? > no panels or switchable mode
				duoWidth = !duo || !duo.is(":visible") ? 0 : parseFloat(duo.outerWidth() );
				treWidth = !tre || !tre.is(":visible") ? 0 : parseFloat(tre.outerWidth() );

				// set
				duoPg.add( duoEl ).css({ 'width' : duoWidth });
				trePg.add( treEl ).css({ 'margin-left' : duoWidth, 'width' : treWidth });
								
				// As Android does not give the correct width on orientationchange, this needs to go here
				// and must be set again for fullscreen mode
				uno.add( unoPg ).css({'margin-left': duoWidth+treWidth, 'width':wrapWidth-duoWidth-treWidth });
				unoEl.css({'width':wrapWidth-duoWidth-treWidth, 'left':'auto'});
				} else {
					
					uno.add( unoPg ).css({'margin-left': 0, 'width':"100%" })
					unoEl.css({ 'width':'100%', 'left':'auto' })
					duoPg.add( trePg ).css({'width':''});
					
					}
					
			// ready to show!				
			if ( o._showUp == false ) {
				o._showUp = true;
				$(window).trigger('multiview-ready');
				}			
			}, 

		/**
		   * name: 	      	  panelHeight
		   * called from: 	  plugin setup, orientationchange, backgroundPageHeight, panelTrans/panelHash
		   * purpose: 		  wrapper/panel/page/content height/margin/padding for all screen modes
		   *                  (touch and improve on your own risk!). Need to make sure, this only runs once(!!!)
		   *                  for whichever call. Multiple calls will return wrong values, causing the page height
		   *                  to be distorted.
		   */
		panelHeight: function (from, mode) {	
			
			// If not using overthrow, reference element for scrolling is the WRAPPER page = the wrapper scrolls = it needs height set
			// based on child elements! Not setting height on the WRAPPER will throw off fixed toolbars, because min-height: 420px will
			// be used by JQM.
			
			// blacklisted browsers need margin to be set instead of padding to not hide content behind the 
			// local toolbars (which have pos: absolute if fixed). Using padding would also work and position the
			// content correctly, BUT in overthrow mode this causes the scrollable section to scroll OVER local
			// toolbars VS scrolling "BEHIND". 
			
			var self = this,	
				o = self.options,
				wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				panels = wrap.find('div:jqmData(role="panel")').not('div:jqmData(panel="popover")').add( $('.ui-fullscreen-mode div:jqmData(panel="popover"), .ui-fullscreen-mode div:jqmData(panel="menu"), .ui-fullscreen-mode div:jqmData(panel="mid")') ),				
				backPanels = $('div:jqmData(panel="main"), div:jqmData(panel="mid"), div:jqmData(panel="menu")'),
				pages = backPanels.length > 0 ? panels.find('div:jqmData(role="page")') : wrap.add( panels.find('div:jqmData(role="page")') ),
				contents = pages.find('div:jqmData(role="content")').not('div:jqmData(panel="popover") div:jqmData(role="content"), .ui-popover-mode div:jqmData(panel="menu")  div:jqmData(role="content"), .ui-popover-mode div:jqmData(panel="mid")  div:jqmData(role="content")');

			if ( from == "autoinit" ){
				//o._autoInitFunc = true;
				}
			// make sure initial call passes only once - otherwise first run will set wrong values, 2nd run will not do anything
			if ( o._autoInitFunc == false ){
				//return;
				}
	
			// no wrapper pages? we are done!
			if ( pages.length == 0 ) {
				return;				
				}
				
			// cleanup
			if ( from == "clear") {	
				contents.css({'height':'', 'max-height':'', 'min-height':''});
				return;
				}	
			
			// reset
			o._iPadFixHeight = 0;
			
			// screen modes					
			var full = $('html.ui-fullscreen-mode').length > 0,				
				me = $('div:jqmData(me="first")').length > 0,			
				solo = wrap.length != 0 && backPanels.length == 0,
				overthrow = wrap.jqmData("scrollmode") == "overthrow" && $('html').hasClass('ui-splitview-mode'),
				blacklist = $('html').hasClass('blacklist');				
			
			// toolbars
			var	gsH = $.mobile.getScreenHeight(),
				glbH = wrap.children('.ui-header:eq(0)').outerHeight(),
				glbF = wrap.children('.ui-footer:last').outerHeight(),
				delta = gsH - glbH - glbF,
				iO, lclH, lclF, lclPt, lclPd, cH, ref, kidTop, kidBot, kTH, kBH;
			
			// get max content height, this includes content elements of other pages in the DOM (stored as  o._iPadFixHeight)
			// and local toolbars/padding
			for ( var i = 0; i < contents.length; i++){			
				var ct = contents.eq(i);
					
				// clear previous
				ct.css('min-height', '');
				
				// add local toolbars and padding
				lclH = ct.siblings('.ui-header:eq(0)').outerHeight();
				lclF = ct.siblings('.ui-footer:eq(0)').outerHeight();
				lclPt = parseFloat( ct.css('padding-top') );
				lclPd = parseFloat( ct.css('padding-bottom') );
				// cH is the height of the longest page on screen	
				cH = parseFloat( ct.css("height") + lclH + lclF + lclPt + lclPd );

				// iPad... cheating...
				if ( blacklist == true ) {
					cH = cH +glbF + lclH + 30;
					}
				
				if ( cH > parseFloat( o._iPadFixHeight ) ){					
					// on non background panel, blacklist browsers with content smaller than screenheight, use delta
					o._iPadFixHeight = ( blacklist == true && solo == true && delta > cH ) ? delta : ( cH > o._iPadFixHeight ? cH : o._iPadFixHeight );
					};

				}
			// highest pageHeight in DOM	
			iO = parseFloat(o._iPadFixHeight);
			
			if (overthrow) {
				
				// cannot get this to work with .css({})...
				// need to set both min-height/max-height to available screen height, otherwise global footer jumps up to whichever height is set here!
				wrap.attr('style',"overflow: hidden; padding-top: 0px !important; padding-bottom: 0px !important; min-height: "+gsH+"px !important; max-height: "+gsH+"px !important;");
				panels.css({ "height": delta });
				// content sections suck... 
				for ( var i = 0; i < contents.length; i++){
				
					var ct = contents.eq(i),
						lclH = ct.siblings('.ui-header:eq(0)').outerHeight(),
						lclF = ct.siblings('.ui-footer:eq(0)').outerHeight(),
						lclPt = parseFloat( ct.css('padding-top') ),
						lclPd = parseFloat( ct.css('padding-bottom') );
						
					setH = parseFloat( delta - lclH - lclF - lclPt - lclPd );

					ct.css({ 	"max-height": setH, 
								"margin-top": blacklist == true ? glbH + lclH : 0, 
								"margin-bottom": blacklist == true ? glbF + lclF  : 0
							})
					}
	
				} else {	
					
					// if a wrapper page has a nested page with local header/footer, the padding will also be applied to
					// the wrapper page. Need to adjust for this when setting the overall page width
					var  kidPadTop = wrap.find('div:jqmData(role="page")').find('div:jqmData(role="header")'),
						 kidPadBot = wrap.find('div:jqmData(role="page")').find('div:jqmData(role="footer")'),
						 kTH = kidPadTop.length > 0 ? parseFloat( kidPadTop.outerHeight() ) : 0,
						 kTB = kidPadBot.length > 0 ? parseFloat( kidPadBot.outerHeight() ) : 0;
					
					// delta-kTH-kTB would be perfect, if content never expands below available screen 
					ref = iO > delta-kTH-kTB ? iO+glbF+glbH : delta-kTH-kTB;
					wrap.css({ "min-height" : ref  });
					panels.css({ "min-height" : ref });
					// need borders....
					pages.css({ "min-height" : ref-2})

					// need to set contents individually because of local toolbar margin
					for ( var i = 0; i < contents.length; i++){	
						
						var ct = contents.eq(i),
							lclH = ct.siblings('.ui-header:eq(0)'),
							lclF = ct.siblings('.ui-footer:eq(0)'),
							lclHH = lclH.length == 0 ? 0 : parseFloat( lclH.outerHeight() ),
							lclFH = lclF.length == 0 ? 0 : parseFloat( lclF.outerHeight() );
							
							// if highest content height is larger than screen, use it, otherwise take
							// otherwise if solo (like JQM page, take delta (screen less toolbars )
							// otherwise if splitview AND all panels are lower than the screen(!), take delta less local toolbars
							
							ct.css({"min-height": solo == true ? delta-30 : ( iO > delta-30 - lclHH - lclFH ? iO : delta-30 - lclHH - lclFH ),
									// only blacklist gets margin, otherwise content overlaps into toolbars
									//"margin-top":  blacklist == true & solo == false ? parseFloat( lclH.outerHeight() )   : "", 
									//"margin-bottom": blacklist == true && solo == false ?  parseFloat( lclF.outerHeight() ) : ""
									"margin-top":  solo == false ? parseFloat( lclH.outerHeight() )   : "", 
									"margin-bottom":  solo == false ?  parseFloat( lclF.outerHeight() ) : ""
									});	
							
							// iPhone... 
							if ( blacklist == true && full == true 
								&& ( ct.closest('div:jqmData(panel="menu"), div:jqmData(panel="mid")').length > 0 )  ){
								ct.css({ "padding-top": parseFloat( lclH.outerHeight()+30 ),
										 "padding-bottom": parseFloat( lclF.outerHeight()+30 ) 
										 });
							}
						}

					}
				
				// reset non-background panels in popover mode (not done above)
				if ( $('html').hasClass('ui-popover-mode') ) { 
					wrap.css({'min-height':gsH })
						.find('.ui-panel')
							.not( me ? 'div:jqmData(me="first")' : ':jqmData(panel="main")')
								.css({'min-height':''})
									.find('.ui-content')
										.css({ "min-height": "", "margin-top":"0px", "margin-bottom":"0px" });
					}
				
				// fullscreen handler
				if ( $('html').hasClass('ui-fullscreen-mode') ){
					/*
					// blacklist
					if ( blacklist == true ){
						
						popct = $('div:jqmData(panel="popover") div:jqmData(role="content")');

						for ( var i = 0; i < popct.length; i++){	
							var ct = popct.eq(i),
								lclH = ct.siblings('.ui-header:eq(0)'),
								lclF = ct.siblings('.ui-footer:eq(0)');
								ct.css({
										"margin-top": parseFloat( lclH.outerHeight() ), 
										"margin-bottom": parseFloat( lclF.outerHeight() )
										});	
						
							}
						}
					*/
					// backGroundPageHeight
					// if a popover is open, set all active page heights to popover height
					if ( from == "background" ){	
						mode == "set" ? self.backgroundPageHeight("set") : self.backgroundPageHeight("clear");
						// done
						return;
						}
					}
			
			// this MUST fire after the above... 
			window.setTimeout( function(){ 
				self.panelWidth( false, "panelHeight" );
				},100);

			},
		
			/**
			* name: backgroundPageHeight
			* called from: pagebeforeshow on popover panels, showPanel ("set"), hidePanel("clear")
			* purpose: In fullscreen mode (smartphone) popovers are opened as fullscreen pages, so when opening a popover
			* there will be an active background page (say 2000px length). If the popover is only 400px length
			* you can scroll down and see 1600px of the background page. To prevent this and allow hardware
			* scrolling (no overthrow), this function takes the popover active page height and sets it to
			* the background page (switch from 2000px to 400px) while the popover is visible.
			* @param {object} page
			* @param {string} mode set|clear
			*/
			backgroundPageHeight: function (mode) { 
			
				var back = $('div:jqmData(panel="popover") .ui-page-active, div:jqmData(panel="menu").pop_fullscreen .ui-page-active, div:jqmData(panel="mid").pop_fullscreen .ui-page-active');
						
				// only tweak if a popover is opened
				if ( back.length > 0 && mode == "set" ) {
					var wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
						allActive = wrap.find('div:jqmData(role="page")').not( back ).add( wrap )
						limit = back.css('min-height');
					
					// only tweak if popover is opened
					for ( var i = 0; i < allActive.length;i++){
						var act = allActive.eq(i);
						act
							// store
							.attr({'remH':act.css('height'), 'remMh': act.css('max-height') })
							// label
							.addClass("shrunk")
							// tweak
							.css({'max-height': limit, 'height':'100%', 'overflow': 'hidden' });
						}
					}
			
			
				// clear
				if ( mode == "clear")  {
					for ( var j = 0; j < $('.shrunk').length; j++){
						$('.shrunk').each( function() {
							var shr = $('.shrunk').eq(i);
								shr
									.css({'max-height': shr.attr('remMh'), 'height':shr.attr('remH'), 'overflow': 'visible' }) })
									.removeClass('shrunk');
						}
					}
			},

		
/** -------------------------------------- UTILS (some from JQM ) -------------------------------------- **/
		
		  /**
		   * name: 	      	  buttonUp
		   * called from: 	  every function that needs a button
		   * purpose: 		  save code
		   * @param {btnhrf}  [string] href
		   * @param {btnCls}  [string] classes
		   * @param {btnThm}  [string] theme
		   * @param {btnPnl}  [string] panel
		   * @param {btnPos}  [string] iconpos
		   * @param {btnTxt}  [string] text
		   * @param {btnIcn}  [string] icon
		   * @param {btnTrn}  [string] transition
		   * @param {btnExt}  [string] extras
		   * @param {btnSpCrn}[string] corner classes for ui-btn-inner
		   */
		  buttonUp: function( btnhrf, btnCls, btnThm, btnPnl, btnPos, btnTxt, btnIcn, btnTrn, btnExt, btnSpCrn ) {
			
			var panel = btnPnl == '' ? '' : 'data-panel="'+btnPnl+'"';
			
			button = $('<a href="'+btnhrf+'" '+btnExt+' class="'+btnCls+'" data-theme="'+btnThm+'" '+panel+' data-iconpos="'+btnPos+'" data-icon="'+btnIcn+'" data-role="button" data-transition="'+btnTrn+'"><span class="ui-btn-inner '+btnSpCrn+'"><span class="ui-btn-text">'+btnTxt+'</span><span class="ui-icon ui-icon-'+btnIcn+' ui-icon-shadow">&nbsp;</span></span></a>');
			
			return button;
			},
		
		
		  /**
		   * name: 	      	  activePageCleaner
		   * called from: 	  pagebeforechange hashChange blocking 
		   * purpose: 		  cleans up after panel transitions	to complement JQM cleanFrom inside createHandler - MUST fire after cleanFrom!
		   * @return {object} toPage
		   * @return {object} fromPage
		   */
		  activePageCleaner: function( $to, $from ) {

				window.setTimeout(function(){
				
				if ( $to.parents('.ui-page-active').length == 0  && $from.parents('.ui-page-active').length == 0 
					// not sure what this was for (dialogs?), the second part avoids removing the page on same page transitions
					&&  ( $to.attr('id') != $from.attr('id') && $to.length != 0 )
					) {					
					$from.closest(':jqmData(wrapper="true")')
						.removeClass( $.mobile.activePageClass );
					}			
					
				},100);
			},
			
		/**
		   * name: 	      	  framer
		   * called from: 	  gulliver and panelWidth
		   * purpose: 		  This function sets <l screen modes, which could be overwritten by plugin options.
		   *				  Important because this determines when to switch between popover and splitview and when to show 
		   *				  pages in fullscreen mode!
		   * SUPERSIZE?
		   * @return {string} screen mode small|medium|large
		   */
		framer: function () {
				
			var self = this, 
				o = self.options,
				framed;
				
				if ($.mobile.media("screen and (max-width:320px)")||($.mobile.browser.ie && $(window).width() < o.lowerThresh )) {
					framed = "small";
					} else if ($.mobile.media("screen and (min-width:768px)")||($.mobile.browser.ie && $(window).width() >= o.upperThresh )) {
						framed = "large";
						} else {
							 framed = "medium";
							}
							
			return framed;
			},
	
		/**
		   * name: 	      	  findClosestLink
		   * called from: 	  clickRouting
		   * purpose: 		  same as JQM		   
		   * @param {object}  element
		   * ALSO USES IN OVERTHROW - removing either one breaks script...
		   */
		findClosestLink: function ( ele ) {
			
			while ( ele ) {
				if ( ( typeof ele.nodeName === "string" ) && ele.nodeName.toLowerCase() == "a" ) {
					break;
					}
				ele = ele.parentNode;
				}
			return ele;
			
			},
		
		/**
		   * name: 	      	  loopHistory
		   * called from: 	  panelHash
		   * purpose: 		  loop through the history to find the page to transition to (backwards transitions only )   
		   * @param {string}  scope = internal/external
		   * @param {object}  setPageContainer = pageContainer
		   */   
		loopHistory: function (scope, setPageContainer) {
			
			var self = this,
				o = self.options,
				wrap = wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				$loopLength = $.mobile.urlHistory.stack.length-1, 
				temp, aMatch, parsedPath, dUrl, targetPath;
			
			if ( scope == "internal") {

				if ( $loopLength >= 2) {
						
					// if there are 2+ entries in the urlHistory, we need to crawl back through the history to find the previous entry 
					// on the same panel. The problem will be that this entry may have been removed from the DOM by JQM already, but
					// still have a reference in the urlHistory (TODO: improve transitionCleaner). Anyway. A reference to this page 
					// will be in the sitemap... but we might as well just check for length of the found match and if there is 
					// no element in the DOM, we just keep going. Since JQM seems to randomly add pages to the urlHistory and I'm
					// only cleaning up AFTER this function runs, we need to make sure we don't select a duplicate from the history stack.
					// update: JQM does remove external pages when leaving them, I can check the sitemap, which I'm doing below, but
					// checking if toPage = in sitemap does not really give any indication on whether this page should be loaded, 
					// shouldn't it? On the other hand, it was pulled from the urlHistory/browser history, so it should be a valid page
					// and we need to only check whether the page existed by checking the sitemap. Not sure here...
					// actually, I'm not sure this whole history looping is still necessary, because JQM clean up it's act from 1.2 onwards
					// and prevents pages from being entered into the DOM multiple times, so the whole process done here of 
					// crawling the history, removing duplicates and finding the correct page might eventually not be needed anymore.
					for (var i = $loopLength; i>1; i--) {
						
						parsedPath = $.mobile.path.parseUrl( $.mobile.urlHistory.stack[i-1].url );		
						targetPath = parsedPath.search.length != "" ? ( parsedPath.pathname + parsedPath.search ) : parsedPath.pathname;
				
						if ( setPageContainer.jqmData('id') == $.mobile.urlHistory.stack[i-1].pageContainer.jqmData('id') 
							&& targetPath != $.mobile.path.parseUrl( $.mobile.urlHistory.stack[$.mobile.urlHistory.activeIndex].pageUrl ).pathname
								) {
							
							aMatch = $('div.ui-page').filter(function(){ return $(this).jqmData('url') === targetPath });
							
							// override if in sitemap
							if ( aMatch.length == 0 && o.siteMap[targetPath].length != 0 ){
							
							}
							
							if ( aMatch.length > 0 ){
								// page still in DOM
								temp =  wrap.find( aMatch );								
								break;
								} else if ( aMatch.length == 0 && o.siteMap[targetPath].length != 0 ){
								// page removed but was in DOM
								temp = targetPath;
								break;
								}
							}
						}
					}
					
					// in case looping does not return anything, take the first page on this panel. Regarding loopLength, 
					// 0 or 1 items will not be possible on backwards transitions, as two history entries will mean the inital page plus
					// another page loaded, which is the active page you will be on.
					
					// When going back we have to make sure we clean the urlHistory of unwanted entries in case 
					// we pass in a hashChange-based urlString, so set backFix to true to trigger cleansing after the transition is done.
					if ( typeof temp == "undefined" || $loopLength < 2 ){						
						temp = wrap.find('div.ui-page').filter(function(){ return $(this).jqmData('url') === setPageContainer.find('div:jqmData(show="first")').attr('data-url') })  												
						o._backFix = true;
						}

						
				} else {						
					// On external transitions (going back from a page X to a wrapper page Y nested page) we crawl the history to find the previous
					// wrapper page URL, because the nested page we are going to should still be active, so we only need to transition to the wrapper.
					// NOTE: if we start removing externally loaded pages, the page has to be re-loaded through the siteMap reference.										
					for (var i = $loopLength; i>=1; i--) {
						parsedPath = $.mobile.path.parseUrl( $.mobile.urlHistory.stack[i-1].url );
						
						// only works with attr()
						temp = $('div.ui-page').filter(function(){  return $(this).attr('data-url') === parsedPath.pathname; })
					
						if (temp.jqmData('wrapper') == true ){							
							break;
							}
						
						// need to add a clause for dialogs, because when opening a dialog, the underlying page is removed by JQM 
						// and then navigated back to when closing. However this check here only checks elements ON the page and 
						// since the page was removed, it defaults to the first page. So check the sitemap if this page existed	
						if (typeof o.siteMap[parsedPath.pathname] != "undefined"  ){
							// override temp, because temp will be [], since the page is no longer in the DOM
							temp = o.siteMap[parsedPath.pathname].data.toPage;							
							break;
							}
						}
					}
					
					// set temp to dUrl 
					dUrl = temp;
					
					// if a wrapper page is left without reset panels, JQM will try to return to div.wrapper#active_nested_page, 
					// therefore need to re-construct object in case we are trying to call a nested page or a non-existent page					
					 if ( typeof temp !== "string" ) {
						
						if ( (temp.closest('div:jqmData(role="panel")').length > 0 || o.siteMap[temp.attr('data-url')] == true ) 
							&& setPageContainer.get(0).tagName == "BODY"){ 							
							dUrl = temp.closest('div:jqmData(wrapper="true")').attr('data-url')
							} else { 								
								dUrl = temp;					
								}						
							}
					return dUrl;
				},
		
		/**
		   * name: 	      	  clearActiveClasses
		   * called from: 	  clear button classes on panels after and buttons after transitions
		   * purpose: 		  same as JQM		   
		   * @param {string}  trigger = who called		   
		   * @param {object}  toPage
		   * @param {object}  fromPage
		   * @param {object}  link element		   
		   */   
		clearActiveClasses: function ( trigger, toPage, from, link ) {
				
			var self = this, dUrl, toClose, toFrom, toFile;
		
			// need to wait, otherwise data-url will not have been assigned to pages pulled in externally
			window.setTimeout(function() {	
				
				if ( typeof toPage == "string" ){	
					
					dUrl = $.mobile.path.parseUrl( toPage );					
					if ( $.mobile.path.parseUrl( toPage ).hash == "" ){						
						to = $('div:jqmData(url="'+dUrl.pathname+'")');
						toFile = dUrl.filename;
					} else {
						to = $('div:jqmData(url="'+dUrl.hash.replace('#','') +'")');
						toFile = '#'+dUrl.hash;
						}
					}
					
				// always empty fromPage
				if( typeof from != "undefined"){
					from.find('.ui-btn.ui-btn-active').removeClass('ui-btn-active');	
					}
				
				// if link is provided, clear closest page of all active-btn links except for link
				if ( link.length > 0 ){					
					link.addClass('ui-clicked-me')
						.closest('div:jqmData(role="page")')
							.find('.ui-btn-active').filter(':not(ui-clicked-me)').removeClass('ui-btn-active')
							.end()
						.end()
						.removeClass('ui-clicked-me');
					}
			
				},500);
		
			},
		   		  		
		/**
		   * name: 	      	  clickRouting
		   * called from: 	  click and vclick
		   * purpose: 		  to be able to run click AND programmatic panel transitions through the same function, this function stores click events on
		   *				  vclick in option _stageEvent, so by the time the click fires, the event and data can be made available. Guess the 300ms click
		   *				  delay makes this work :-). Also handles context changePage.
		   * @param {object}  event
		   * @param {object}  data
		   * @param {string}  who called		   
		   */
		clickRouter: function( e, data, source ) {
			
			var self = this, 
				o = self.options,
				link = self.findClosestLink( e.target ),
				$link = $( link ), 
				onePass;

			if ( $(e.target).closest('.ui-popup-container').length > 0 ){				
				onePass = true;
				}
			
			if ( !link && onePass == false ) {				
				return;
				}
			
			if ( e.type == "vclick" && onePass == true ){				
				o._blockPopupHavoc = true;
				onePass = false;
				}
		
			if ( e.type == "vclick" && typeof $(link).jqmData("panel") != "undefined" && $(link).hasClass('toggle_popover') == false ) {								
				// store the click event/link element 					
				o._stageEvent = $link;					
				} 

			if ( e.type == "vclick" && typeof $link.jqmData('context') != "undefined" ) {				
				// trigger panelContext					
				self.panelContext( $link );					
				}
		
				
			},
			
/** -------------------------------------- PANEL NAVIGATION -------------------------------------- **/

		/**
		   * name: 	      	  panelContext
		   * called from: 	  clickRouting
		   * purpose: 		  fires the 2nd changePage on context changepages (changePage A1 > A2 in panel A and B1 > B2 in panel B)
		   * MAKE SURE THIS WORKS, NOT POSSIBLE IN FULLSCREEN MODE
		   * @param {object}  event
		   */
		panelContext: function( object ) {
				
				var self = this,
					context = object,
					contextPage = context.jqmData('context'),
					contextPanel = $('div:jqmData(panel="'+context.jqmData('context-panel')+'")'); 				
				
				// not in fullscreen mode
				if ( !$('html').hasClass('ui-fullscreen-mode') ) {
					window.setTimeout(function() {
					
						// for iOS3, we need to make sure, pageContainer is set correctly right away, because iOS3.2 needs like
						// 5sec to swallow the first transition. Without setting this, the 2nd transition will be done by JQM
						// and break the layout
						$.mobile.pageContainer = contextPanel;
										
						$.mobile.changePage( contextPage, { pageContainer: contextPanel });
						},50);
								
					}
				
			},
	
		/**
		   * name: 	      	  panelTrans
		   * called from: 	  mainEvents on pagebeforechange
		   * purpose: 		  handles forward transitions by overwriting changepage options (no preventDefault)   
		   * @param {object}  event
		   * @param {object}  data
		   */
		panelTrans: function (e, data) {
			
			var	self = this,
				o = self.options,
				wrap = wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")'),
				$link = o._stageEvent,
				dial = data.options.role == "dialog" ? true : ( $link && $link.jqmData("rel") == "dialog" ? true :  false ),
				$targetPanelID = $( $link ).jqmData('panel'),
				$targetPanel = $link ? wrap.find('div:jqmData(id="'+$targetPanelID+'")') : ( data.options.pageContainer.get(0).tagName == "DIV" ? wrap.find( data.options.pageContainer ) : data.options.pageContainer ),
				$targetPanelActivePage = $targetPanel.find( '.ui-page-active' ).length > 0 ? $targetPanel.find( '.ui-page-active' ) : $targetPanel.find('div:jqmData(show="first")'),				
				setExt, parsedToPage;

			// if panel transition
			if ( $targetPanel.is('body') == false && dial == false ) {
				parsedToPage = $.mobile.path.parseUrl(data.toPage);
				
				// safety for wrapper
				o._rmv = "panel";
			
				data.options.fromPage = $targetPanelActivePage;
				data.options.pageContainer = $targetPanel;
				
				// We need to override JQM toPage in case we are doing a panel transition on a pulled in wrapper page
				// Here JQM thinks this is a multipage-transition and tries to append the page to the initial wrapper page
				// hard to catch.... 	
				
				if ( wrap.attr('data-url') != parsedToPage.pathname ){	
					//data.options.dataUrl = parsedToPage.domain + wrap.jqmData('url') + parsedToPage.hash;
					// data.options.dataUrl = parsedToPage;
					// data.options.dataUrl = "http://localhost/register.cfm#languages";
					// data.toPage = parsedToPage.href;					
					}
				
				if ( parsedToPage.search != ""){					
					// data.toPage = parsedToPage.hrefNoSearch;
				}
				
				// block scrollTop to keep popover panels visible when loading a new page into the DOM, without this screen will flash!				
				if ( $targetPanel.jqmData("panel") == "popover" ) {
					o._panelTransBlockScrollTop = true;
					}
				
				// clean up panel transition
				setExt = "blockdoubles";
				
				// set flag 
				o._trans = "panelTrans";
								
				} else {
					
					// = JQM territory															
					// still, if we are coming from a wrapper page, with panel transitions made, fromPage may not
					// always be set to the wrapper page, which will cause JQM to drop active class from the panel
					// page and leave the wrapper page active. 
					
					// To prevent this, check if the fromPage is on a panel and if so, change fromPage from
					// panelPage to wrapper Page to make sure JQM handles this correctly					
					if ( $( data.options.fromPage ).closest('div:jqmData(role="panel")').length > 0 ) { 
						data.options.fromPage = $( data.options.fromPage ).closest('div:jqmData(wrapper="true")');
						}
					
					// and reset panel history
					setExt = "reset";
					}
				
				// set todo to "reset" if we had nothing to do. 								
				self.panelTransitionCleaner( data, setExt, $link ? $link : "" );
				

				
		},
		
		/**
		   * name: 	      	  panelHash
		   * called from: 	  mainEvents on pagebeforechange
		   * purpose: 		  handles backwards transitions by overwriting changepage options (no preventDefault)
		   * BACKBUTTON UNWINDS HISTORY VS DOING WHAT IT SAYS
		   * @param {object}  event
		   * @param {object}  data
		   */
		panelHash: function( e, data ) {
				
				var self = this,
					o = self.options,					
					isHash = $.mobile.path.parseUrl(data.toPage),
					isToPage = isHash.search.length > 0 ? isHash.href : ( isHash.hash.length == 0 ? isHash.pathname : isHash.hash.replace("#","") ),
					temp,
					setFromPage,
					setPageContainer,
					setFromPage,
					setExt;
				
				// stall Android for 300ms
				// window.setTimeout(function () { o._blockMultiClick = false; }, 300);				

				
				// panel transition if prev viewort is a DIV, page is in the sitemap, toPage is a panel page and it's not a dialog!
				if ( data.options.pageContainer.get(0).tagName != "BODY"   					
					|| $('div.ui-page').filter(function(){ return $(this).attr('data-url') === isToPage }).closest('div:jqmData(role="panel")').length != 0 						
						|| !o.siteMap[data.toPage] == false							
							) {
					
					// PageContainer can be a panel (DIV) or normal viewport (BODY). So there are 4 types of viewport transitions:
					
					// #1 <body> to <body> 	= regular JQM backwards transition
					// #2 <div> to <div> 	= panel or cross-panel backwards transition (internal transitions/special case: last panel back transition)
					// #3 <div> to <body> 	= leaving a wrapper to another JQM or wrapper page. Done by JQM.
					// #4 <body> to <div> 	= going back to a JQM multiview page (external transitions) - this should be handled by JQM, BUT 
					//  we are still handling this transition, because otherwise this would load an external page into the body.viewport
					//  versus going back to the wrapper page with the external page loaded in a panel.
					
					// #2 - cross-panel backwards - DEFAULT					
					// the problem in using JQM's history (with pageContainer added) is that JQM history does not recognize 
					// different panels when storing entries, so going from nested pages A1 > A2 and B1 > B2 > B3, will create  
					// the following JQM urlHistory entries: "wrapper", A2, B2, B3. Clicking the back button once will go to
					// prev() = B2, which is correct. Clicking again, JQM will try to go to prev() = A2 from A's panels active 
					// page, which also is A2, when in fact it should go from B2 > B1. Here the transition and page breaks!
					
					// To work around, we have take the active page in a panel and crawl down through the history to find 
					// the previous page on this panel. If none is found, we go back to the data-show="first" page (inital
					// panel layout). This works for all panel transitions. In our example the first transition B3>B2 was 
					// handled correctly by default (pick active, get panel, find previous page on this panel). The 2nd 
					// backwards transition would now be (pick active (B2), get panel (B), find previous page on this panel (B1)
					
					// As this only works for internal pages using page IDs, the plugin only uses data-urls to do backwards
					// transitions. This is because pages loaded in externally will be stored with full URL in the urlHistory, 
					// and it's difficult to capture the pageID if only the full URL is available. 
					
					var currentEntry = $.mobile.urlHistory.stack[$.mobile.urlHistory.activeIndex].pageUrl,
						// iOS3 does not take jqmData("url")..... pffff						
						currentActive = $('div.ui-page').filter(function(){ return $(this).jqmData('url') === currentEntry }),
						getPath = $('div.ui-page').filter(function(){ return $(this).jqmData('url') === $.mobile.path.parseUrl( data.toPage ).pathname }).attr('data-url');						
					
					// safety for wrapper
					o._rmv = "panel";
					
					// special case = last backwards transition inside a wrapper page
					if ( o._backFix == true ) {
						
						var thiswrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")');
						// this was derived in pagebeforechange - be careful to only select from active wrapper! 
						setToPage = thiswrap.find('.ui-page').filter(function(){ return $(this).jqmData('url') === data.toPage });						
						// take toPage closest container as pageContainer
						setPageContainer = setToPage.closest('.ui-mobile-viewport');
						// set from Page to the page currently active on the panel
						setFromPage = setPageContainer.find('.ui-page-active');
						// this transition is allowed to modifiy transDelta
						setExt = false;
						
						// internal transition (inside wrapper)
						} else if ( currentActive.closest('.ui-mobile-viewport').get(0).tagName == "DIV" ) {
							
							setFromPage = $('div.ui-page').filter(function(){ return $(this).attr('data-url') === currentEntry })
							// a backwards transition will always change a page INSIDE a panel (click a link in A1 to change B1 to B2. Reverse = B2>B1)
							setPageContainer =	setFromPage.closest('.ui-mobile-viewport')
							// loop for the previous wrapper page in the urlHistory		
							// could change here if in sitemap, then save crawling history
							setToPage = !o.siteMap[data.toPage] == false ? data.toPage : self.loopHistory("internal", setPageContainer);
							// this transition is allowed to modifiy transDelta
							setExt = false;
							// this transition should not trigger backFix!
							o._stopIt = true;
							// external transition (wrapper to nested page) 
							}  else {	
								
								// fromPage will be current entry NOTE: iPad iOS3 and IE require jqmData here
								setFromPage = $('div.ui-page').filter(function(){ return $(this).jqmData('url') === currentEntry })
								// as we are going back to a wrapper page, pageContainer must be set to BODY (we could try to deeplink to the data.toPage )
								setPageContainer =	$('body');
								// store original toPage activeIndex, because we are going to a wrapper page and will falsely set activeIndex to this page
								// when we should set it to the page we are changing back to																
								o._actualActiveIndex = $.mobile.urlHistory.activeIndex;								
								// loop for the previous wrapper page in the urlHistory
								setToPage = self.loopHistory("external", setPageContainer);
								// pass a variable to the cleaner to NOT change transDelta because we are reverting a backwards transition from
								// JQM page to a wrapper, which was not causing transDelta to increase when we did the forward transition
								setExt = true;
								// this transition should not trigger backFix!
								o._stopIt = true;
								}
											
					
					// ALL SET
					data.toPage = setToPage;
					data.options.pageContainer = setPageContainer;
					data.options.fromPage = setFromPage;
					data.options.reverse = true;
					// set flag 
					o._trans = "panelHash";
					
				 } else {
						// JQM transition 																					
						// reset				
						setExt = "reset";
						}
			
			// clean up 
			self.panelTransitionCleaner(data, setExt, "");
		},
		
		/**
		   * name: 	      	  panelTransitionCleaner
		   * called from: 	  panelHash or panelTrans
		   * purpose: 		  cleans up after panel transitions	to avoid running duplicate code in both functions	   
		   * @param {string}  transition = panelHash or panelTrans
		   * @param {object}  data object from original event
		   * @param {link}    link object that was clicked (or "")
		   */
		panelTransitionCleaner: function(data, todo, link ) {

			var self = this,
				o = self.options,
				wrap = $('div:jqmData(wrapper="true").ui-page-active'),				
				transition = o._trans,
				full = $('html.ui-fullscreen-mode').length > 0,
				toPc = data.options.pageContainer,
				// link precedes fromPage (which is false anyway... 
				// call B2 from A2 > fromPage = B1, the page being hidden)
				frPc = link ? link : data.options.fromPage,
				tcount = data.options.role != "dialog" ? ( transition == "panelHash" ? ( todo == true ? 0 : -1) : (transition ==  "panelTrans" ? 1 : 0 ) ) : 0,
				isHash, isPage;					
			
			// TRACE pageContainers on panel transitions to show correct container on fullscreen backwards container!
			if ( o._trans == "panelTrans" || o._trans == "panelHash" ){
				if (data.options.fromHashChange == true ) {										
				//	wrap.data("trace").pop();
					} else {									
				//	wrap.data("trace").push( toPc.jqmData('id')  );
					}				
				}
			
			// always open the transition target panel, if it's not visible (thereby hiding the currently visible panel!)
			if ( toPc.get(0).tagName == "DIV"  
					&& ( toPc.hasClass('ui-popover') == true || full == true ) 
						&& ( toPc.jqmData('id') !== frPc.closest('.ui-mobile-viewport').jqmData('id') ) ){												
				// self.showPanel( toPc.jqmData('id')  );
				}	
			
			// clean active classes						
			self.clearActiveClasses( transition, data.toPage, frPc, link );
					
			// clean up stage event, because backwards transition may have come from a crumbs button click
			o._stageEvent = '';
			
			// reset pageContainer to default			
			$.mobile.pageContainer = $('body');
			
			// reset flag 
			o._trans = "";
			
			// clear up either backFix or double entries from forward transitions	
			// 150ms seems to be long enough to clean up the urlHistory	and wait for the trailing hashchange to be caught
			if ( todo != "reset" ) {				
				
				// +1/-1 aka keep count of panel transitions
				wrap.attr('_transDelta', parseFloat(wrap.attr('_transDelta')) + tcount );
			
				window.setTimeout(function() {
				
					var activePagefromUrl = $.mobile.urlHistory.stack[$.mobile.urlHistory.activeIndex].pageUrl;
					
					// loop over history. If an entry with matching data.toPage of backFix transition is found, remove it again
					for (var i = 0; i < $.mobile.urlHistory.stack.length; i++) {						
						
						if ( o._backFix == true ){
							
							// since we broke the logic on the last panel backwards transition, we need to make sure this does not push anything into the
							// urlHistory, otherwise it can mess up future transitions.									
							if ( $.mobile.urlHistory.stack[i].url == data.toPage.attr('data-url') ) {
								
								$.mobile.urlHistory.stack.splice(i,1);
								$.mobile.urlHistory.activeIndex = $.mobile.urlHistory.activeIndex-1;
								
								// and clear all forwards							
								$.mobile.urlHistory.clearForward();
								
								}
							} else if ( todo == "blockdoubles" ){								
								// either the backFix or some other process does not prevent the same page from being added to the urlHistory multiple
								// times. This check looks for doubles and filters them out. 
								
								// check if the current page is already in the history
								if ( i != 0 && i < $.mobile.urlHistory.stack.length-1 && $.mobile.urlHistory.stack[i].url == activePagefromUrl ) {
									
									$.mobile.urlHistory.stack.splice(i,1);
									$.mobile.urlHistory.activeIndex = $.mobile.urlHistory.activeIndex -1;
									
									// and clear all forwards
									$.mobile.urlHistory.clearForward();
									}
								}						
					}
					
					// decrease activeIndex unless dialog was closed, which runs 
					// through panelHash external. In this case set activeIndex to
					// stored activeIndex -1
					if ( data.options.fromHashChange == true ){							
						if ( o._actualActiveIndex != 0 ){							
							$.mobile.urlHistory.activeIndex = o._actualActiveIndex-1;
							o._actualActiveIndex = 0;
							} else {								
								$.mobile.urlHistory.activeIndex = $.mobile.urlHistory.activeIndex-1;
								}
						$.mobile.urlHistory.clearForward();
						}	

					// on forward transitions, we need to clear o._prevBack otherwise it will still
					// be set on forward>forward<back>forward
					o._prevBack = '';
					
					// this complements cleanFrom inside JQM createHandler to remove activeClasses
					// has to be in here, because custom select dialogs don't seem to trigger a changePage
					// if they would, this could go into panelTransitionCleaner, too.
					// this MUST fire after cleanFrom fires!
						
					if ( typeof data.toPage == "string" ){						
						isHash = $.mobile.path.parseUrl(data.toPage);
						isPage = isHash.hash.length == 0 ? isHash.pathname : isHash.hash.replace("#","");												
						}					
					
					self.activePageCleaner( typeof data.toPage == "object" ? data.toPage : $('div:jqmData(url="'+isPage+'")' ) , frPc );
									
					// reset
					o._backFix = false;					
					
					// reset blackPass - careful, if this is set BEFORE the trailing hashChange arrives, it will loop to infinity
					o._blackPass = false;
					
					// reset highest content height - moved from reset, because it needs to be clean when entering a new JQM page
					// otherwise the height of the previous page is carried over to the new page
					o._iPadFixHeight = 0;

				},150);
			}	
			
			if ( todo == "reset" ){
				
				window.setTimeout(function(){					
					
					// TODO: Bad patch, improve this
					// JQM createHandler does not fire a 2nd time on backwards transitions. Adding one console inside, fires it.					
					// If the 2nd call doesn't fire, the body will keep the transition classes, messing up pages and future transitions, so
					// remove by hand, although this is bad... and not very flexible
					
					// fires on backwards transitions, done by JQM, when the body is stuck with the transition classes
					if ( data.options.fromHashChange == true && $('body').hasClass('ui-mobile-viewport-transitioning') ){
						var trans = data.options.transition;						
						$('body').removeClass('ui-mobile-viewport-transitioning viewport-slide viewport-fade')						
						}
					
					
					},150)			
				}
		},
		
		/**
		   * name: 	      	  panelDeepLink
		   * called from: 	  wrapper pagebeforeshow
		   * purpose: 		  handles deeplinks to panel pages
		   * ADD EXTERNAL DEEPLINKS VIA SITEMAP
		   */
		panelDeepLink: function () {
			
			var self = this,
				wrap = $('div:jqmData(wrapper="true")'),
				deep = $('html').data("deep"),
				panel = $( deep ).closest('div:jqmData(role="panel")'),
				pnID = panel.jqmData('id'),
				from =  panel.find('div:jqmData(show="first")'),
				trig;

			// deeplink on popover
			if ( panel.jqmData("panel") == "popover" ) {
				trig = $('div:jqmData(wrapper="true")').find('.toggle_popover:jqmData(panel="'+pnID+'")');
				}
		
			if (trig && !panel.is(':visible') ) {
				trig.trigger('click'); 
				}
					
			// load deeplink page
			$.mobile.changePage( deep, {fromPage: from, transition:"slide", pageContainer: panel });
			
			// clean up deeplink and a flag
			$('html').removeData("deep").addClass(".deeplink_setup");
			},

		
/** -------------------------------------- EVENT BINDINGS -------------------------------------- **/

		/**
		   * name: 	      	  _mainEventBindings
		   * called from: 	  once from create
		   * purpose: 		  single place for all bindings (more or less...)   
		   */
		_mainEventBindings: function () {
			var self = this,
				o = self.options;
			
			/**
			  * bind to:	pageRemove
		      * purpose: 	would you know... there is a pageremove event... when pulling a 2nd wrapper page into 
			  *             the DOM, the url will change to page1/#page2 (pushstate page2). When doing a panel
			  *             transition on page2, JQM will try to remove page2 and replace it with the panel page
			  *             like so: page1/#page2_panel_page, thereby(!) removeing page2 from the DOM, which will
			  *             break the page. This binding will check for panel transitions and whether the page to
			  *             be removed in the panel transition is the parent wrapper page. If so, the pageremove is
			  *             prevented.
		      */
			$( document ).bind( "pageremove", $('div:jqmData(role="page")'), function( e ){	
				if ( o._rmv == "panel" && $(e.target).jqmData("wrapper") == true ){
					e.preventDefault();
					// multiple pageremove events are triggered. Wait before resetting o._rmv until the bubbles have passed
					window.setTimeout(function(){ o._rmv = "jqm"; },250);
					}				
				});
			
			/**
			  * bind to:	pagebeforeshow
		      * purpose: 	when deeplinking or refreshing a "non-anchor" page, opening dialogs also adds ui-page-active 
			  *             to the anchor page, showing it in the dialog overlay. This removes it. 
		      */
			$(document).on( "pagebeforeshow", function( e, data ) {
				
				var wrap = $('div:jqmData(wrapper="true")'),
					u = e.currentTarget.URL,
					re = "&ui-state=dialog",
					pgs = $('body').children('div:jqmData(role="page")');
	
				/*
				// THIS BREAKS WEBKIT... not sure why
				// if pushState is disabled and it's a deeplink 
				// the idea was to make sure no page has ui-page-active, when opening a dialog, 
				// because the first wrapper page always had active class and was visible in the overlay
				if ( wrap.length > 1 ){
					wrap.first().removeClass('ui-page-active');
					}
				*/
				// if a dialog is opened! 
				if ( u.search(re) !== -1 ) {
					
					// check if more than one page in the DOM
					if ( pgs.length > 1 ){
						pgs.first().removeClass('ui-page-active');
						}
					
					}
				});
			
			
			
			/**
			  * bind to:	pagebeforehide
		      * purpose: 	when pulling in external wrapper pages, the documentURL needs to be set on this wrapper page, otherwise
			  * 			panel transitions on pulled in wrapper pages always will be done on the initial wrapper page breaking
			  *				the site... new dependency... 
		      */
			$( document ).bind( "pagebeforehide", 'div:jqmData(role="page")', function( e, data ){				
				if ( data.nextPage.jqmData("wrapper") == true && data.nextPage.attr('data-url') != $.mobile.getDocumentUrl() ){
					self.hideAllPanels("10");
					$.mobile.setDocumentUrl();										
					$.mobile.setDocumentBase();
					}
				});
				
			/**
			  * bind to:	click, a.toggle_popover
		      * purpose: 	show panels - since this button also passes clickrouting, this needs to be reset
		      */
			$(document).on('click','a.toggle_popover', function(e) {
				$(this).addClass('ui-btn-active');				
				
				self.showPanel( $(this).jqmData("panel") );
				
				window.setTimeout(function(){
					 $(e.target).closest('.ui-btn').removeClass('ui-btn-active'); 
					 },300);
				});
			
			/**
			  * bind to:	vclick.clickRouting
		      * purpose: 	store stageEvent - need to bind to vclick, because on click it's not possible to 
			  *  			store event/data and retrieve them in pagebeforechange/panelTrans, because by 
			  *				the time click fires, panelTrans has already run...
		      */
			$(document).on("vclick.clickRouting", function( e, data ) { 				
				self.clickRouter( e, data, "vclick" );
				});
						
			/**
			  * bind to:	pagebeforechange
		      * purpose: 	panel transition handler, rewrite toPage and options on pagebeforechange w/o preventDefaulting!			  
		      */
			$(document).on( "pagebeforechange", function( e, data ) {
				
				var parse = $.mobile.path.parseUrl( data.toPage );
			
				// ====================== PHOTOSWIPE HANDLER (remove if not needed )============================
				// catch photoswipe with dialog key = #&ui-state=gallery
				if ( typeof parse.hash != "undefined" && parse.hash.replace( /.*#&ui-state=/, "" ) == "gallery" ){					
					// $('html').addClass('ui-swipe-active');					
					e.preventDefault();
					e.stopPropagation();
					// console.log("BLOCK1");
					return;
					}
				/*
				if ( $('html').hasClass('ui-swipe-active') ) {						
					$('html').removeClass('ui-swipe-active');
					$(window).trigger('pageclear');					
					e.preventDefault();
					e.stopPropagation();
					// console.log("BLOCK2");					
					return false;
					}
				*/
				// ====================== END PHOTOSWIPE HANDLER ============================
				
				if ( $('html').hasClass('selDiaPopBlock') ){
					
					// window.setTimeout(function(){
						$('html').removeClass('selDiaPopBlock');
					// },250)					
					e.preventDefault();	
					//console.log("BLOCK3");					
					return;
					}				
					
				// store external pages in sitemap
				if ( data.options.fromHashChange == false && parse.hash == "") {
					var newExt = parse.search.length == "" ? parse.pathname : ( parse.pathname + parse.search );
					
					if (!o.siteMap[newExt]){
						o.siteMap[newExt] = { type: "external", data: data };
						}
					}						
				
				// Firefox-superfast-trailing-hashchange-double-back-transition-blocker...  (temp fix)								
				if (data.options.fromHashChange == true && typeof data.toPage == 'string' && ( data.toPage == o._prevBack || o._blockPopupHavoc == true ) ) {					
					o._prevBack = '';
					o._blockPopupHavoc = false;
					//console.log("BLOCK4");					
					return;					
					}
					
				// identify last panel backwards transition, take toPage [object], convert to string, let it fly, cause chaos.
				var from = data.options.fromPage,
					wrap = $('div:jqmData(wrapper="true")').length > 1 ? $('div:jqmData(wrapper="true")').last() : $('div:jqmData(wrapper="true")');

				// blacklist only passes an object for last JQM backwards transition. 
				if ( data.options.fromHashChange == true && $('html').hasClass('blacklist') == true ) {						
					if( typeof data.toPage == "object" && wrap.attr('_transDelta') == 0 ){						
						 if ( o._blackPass == false ){
							// iPhone sometimes sends first page data.options.fromHashChange == true 
							if ( typeof data.options.fromPage == "undefined" ){
								return;
								}
						 
							// construct a string from the object (beware of infinity)
							data.toPage = $('#'+data.toPage.attr('id') ).attr('data-url');
							// change fromPage, otherwise JQM doesn't do anything...
							data.options.fromPage = data.options.fromPage.closest('div:jqmData(wrapper="true")');							
							o._blackPass = true;
							}
						}
					}		
			
				if ( data.options.fromHashChange == true 
						&& wrap.attr('_transDelta') == 1 
							&& ( data.options.role != "dialog" ) 																
								&& ( from.parent('body').length === 0  
									&& o._stopIt == false
										|| ( typeof from.jqmData('external-page') === 'undefined' && data.options.fromPage.jqmData("role") != "dialog" ) )										
						) {						
						// console.log("BACKFIX");
						// check which panel is NOT on data-show="first". It's data-show="first" page is the backfixed toPage
						var isWrap = $('div:jqmData(wrapper="true").ui-page-active'),
							isNot = $('html').hasClass('ui-fullscreen-mode') == true ? ':not(.ui-panel-hidden, :jqmData(panel="main"))' : ':not(.ui-panel-hidden)',
							isNotActive = isWrap.find('div:jqmData(role="panel")'+isNot+' div:jqmData(show="first"):not(.ui-page-active)'),
							isId = isNotActive.attr('id');								
						data.toPage = isId;
						o._backFix = true;
					} 
				
				
				// block trailing hashchange (objects) - including dialogs/custom selects
				// need to do this before backfix, which will otherwise convert object to string and pass this test
				if (typeof data.toPage !== 'string' ) {																
					if ( data.options.role != "custom-select" ) {							
							//e.stopPropagation();
							// console.log("BLOCK6");								
							return;
							} else {																			
								//e.stopImmediatePropagation();
								//e.stopPropagation();
								e.preventDefault();
								// console.log("BLOCK7");
								return;
								}
							o._backFix = false;	
					
					}
					
				
				// continue to fwd/back transition
				if ( data.options.fromHashChange == true ) {					
					// Firefox prevBack
					o._prevBack = data.toPage;					
					self.panelHash( e, data );
					} else {	
						self.panelTrans( e, data );
						}

				
				});

			/**
			  * bind to:	pagechange
		      * purpose: 	main trigger for adjusting panelHeight and removing JQM page padding, 
			  *             flag be set to false after safety event has passed, safety is needed when using requireJS
			  *             because first page events trigger way to early, so this does not fire on first page on iOS
		      */
			$(document).on('pagechange', function() {
				self.panelHeight("pagechange");		
				
				// reset stopIt
				o._stopIt = false;
				
				});
			
			/**
			  * bind to:	blur, inputs
		      * purpose: 	make sure header is at css:top 0 when closing keyboard in iOS
		      */
			$(document).on("blur","div:jqmData(wrapper='true') input", function () {
				$(".ui-header-fixed, .ui-element-fixed-top" ).css("top","0 !important");
				});			
			
			/**
			  * bind to:	pageshow
		      * purpose: 	set basePage data-url to pathname, this could also be done inside
			  *             setupMultiview on pagebeforeshow. But binding to pagebeforeshow looses all parameters
			  *             to store with parameters = set on pageshow.
		      */	
			$(document).on('pagebeforeshow', 'div:jqmData(wrapper="true")', function(e){
				
				var page = $(this);
				if ( $( e.target ).hasClass('basePage')  == true ) {
					var setPage = $.mobile.path.parseUrl( window.location.href ),
						setPageUrl = setPage.hash == "" ? setPage.pathname : setPage.hash.replace('#','');
					if ( page.jqmData('external-page') == true ){
						page.attr({ 'data-url' : setPageUrl });
						} else {
							page.attr({ 'data-url' : self.options._basePath  });
							}
					}
				});
			
			
			/**
			  * bind to:	pagebeforeshow, page
		      * purpose: 	plugin setup / panel back buttons
		      */
			$(document).on('pagebeforeshow', 'div:jqmData(role="page")', function(event, data){
				
				var page = $(this);
								
				if ( page.jqmData('wrapper') == true ) {
					
					// fire deeplink
					if ( $('html').data("deep") && page.find( $('html').data("deep")+"" ).length >= 1  ) {
						self.panelDeepLink();
						}
						
					// run setup for wrapper ONCE
					if ( page.data("counter") == 0 || typeof page.data("counter") == 'undefined') {
						
						self.setupMultiview(page);
						
						// .....hard... because it seems not possible to 
						// live('pagecreate/pageload/pageinit') to the wrapper
						// page alone. Such a binding fires with every panel
						// changepage, so it's not possible to set a flag on a wrapper 
						// to block the setup from firing more than once. Using "one"
						// instead of "live" also does not work, because then you
						// cannot catch the 2nd wrapper page loaded into the DOM.
						
						// The whole thing is necessary, because the plugin setup
						// adds active-page to the first page on every panel. If
						// we let this fire with every changePage, the firstpage 
						// will never loose active-page and thus always be visible
						// Omitting this call, the 2nd wrapper page loaded into 
						// the DOM will not get the plugin setup and be blank.
						
						// What this does: The counter for the first wrapper page
						// is set to 0 on plugin-init so it runs through here once,
						// gets changed to 1 and thus is blocked from going through
						// again. If a new wrapper is loaded it doesn't have any 
						// counter, so we are also letting "undefined" pass and then set 
						// the counter for this wrapper to 1, so on the next changePage,  
						// pageshow will fire on the wrapper page, but as counter is now 
						// 1, it will not run through here. 						
						var inc = 1;
						page.data("counter", 0+inc);
						} 
											
					// as it's a wrapper page we don't need back buttons on it, so stop here
					event.preventDefault();
					
					// regular page
					} else if ( page.jqmData("show") != "first") {

							// ? back button
							if( ( o.backBtnOff == false || page.closest('div:jqmData(wrapper="true")').jqmData("backBtnOff") != true ) 
									&& data.prevPage.jqmData("wrapper") != true ){								
								self.crumble(event, data, page );
								}
							
							// ? overthrow
							if ( page.jqmData('external-page') == true && $('html').hasClass('ui-overthrow-mode') == true
									|| page.closest('div:jqmData(panel="popover")') && ( !$('html').hasClass('ui-fullscreen-mode') || !$('html').hasClass('ui-yield-mode') )){

								page.find('.ui-content').addClass('overthrow');
								}						
						} 
				});
			
			/**
			  * bind to:	orientationchange
		      * purpose: 	fire splitviewCheck on orientationchange (and resize)
		      */
			$(window).on('orientationchange', function(event){	
				self.splitScreen(event);
				self.panelHeight("or");					
				self.gulliver("or");
				});						
			
			/**
			  * bind to:	dimensionchange
		      * purpose: 	custom event for updating panel layout after adding content changes
		      */
			$(window).on('dimensionchange', function(){	
				self.panelHeight("dim");
				self.gulliver("dimensionchange");
				});		
		    /**
			  * bind to:	dimensionclear
		      * purpose: 	custom event for cleaning up panel height on AJAX fetches
		      */
			$(window).on('dimensionclear', function(){	
				self.panelHeight("clear");
				});	

			 /**
			  * bind to:	hidePanels
		      * purpose: 	custom event for hiding panels on AJAX requests
		      */
			$(window).on('hidePanels', function(){	
				self.hideAllPanels("external");
				});		
			/**			  
		      * purpose: 	when using requireJS, on iOS JQM will init on mobileinit and because requireJS
			  * 			will not have finished loading multiview, on iOS3 the page will stay blank
			  *				As a workaround, $.mobile.autoInitializePage must be set to FALSE before loading JQM
			  *				When triggering here, all bindings above are loaded, so multiview will works normal
		      */
			if ( $.mobile.autoInitializePage == false){
				$.mobile.initializePage();
				//self.panelHeight("autoinit");
				} else {
					//self.panelHeight("autoinit safety");
				}
			}
		
	});
	
/** -------------------------------------- PLUGIN TRIGGER -------------------------------------- **/
    $(document).bind('pageinit', function(event) {
    	$('div:jqmData(wrapper="true")').multiview();
    });


	
	
}) (jQuery,this);


}));


/** -------------------------------------- OVERTHROW -------------------------------------- **/

/*! overthrow v.0.1.0. An overflow:auto polyfill for responsive design. (c) 2012: Scott Jehl, Filament Group, Inc. http://filamentgroup.github.com/overthrow/license.txt */

(function( w, undefined ){
	
	var doc = w.document,
		docElem = doc.documentElement,
		classtext = "overthrow-enabled",
	
		// Touch events are used in the polyfill, and thus are a prerequisite
		canBeFilledWithPoly = "ontouchmove" in doc,
		
		// The following attempts to determine whether the browser has native overflow support
		// so we can enable it but not polyfill
		overflowProbablyAlreadyWorks = 
			// Features-first. iOS5 overflow scrolling property check - no UA needed here. thanks Apple :)
			"WebkitOverflowScrolling" in docElem.style ||
			// Touch events aren't supported and screen width is greater than X
			// ...basically, this is a loose "desktop browser" check. 
			// It may wrongly opt-in very large tablets with no touch support.
			( !canBeFilledWithPoly && w.screen.width > 1200 ) ||
			// Hang on to your hats.
			// Whitelist some popular, overflow-supporting mobile browsers for now and the future
			// These browsers are known to get overlow support right, but give us no way of detecting it.
			(function(){
				var ua = w.navigator.userAgent,
					// Webkit crosses platforms, and the browsers on our list run at least version 534
					webkit = ua.match( /AppleWebKit\/([0-9]+)/ ),
					wkversion = webkit && webkit[1],
					wkLte534 = webkit && wkversion >= 534;
					
				return (
					/* Android 3+ with webkit gte 534
					~: Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13 */
					ua.match( /Android ([0-9]+)/ ) && RegExp.$1 >= 3 && wkLte534 ||
					/* Blackberry 7+ with webkit gte 534
					~: Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0 Mobile Safari/534.11+ */
					ua.match( / Version\/([0-9]+)/ ) && RegExp.$1 >= 0 && w.blackberry && wkLte534 ||
					/* Blackberry Playbook with webkit gte 534
					~: Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/0.0.1 Safari/534.8+ */   
					ua.indexOf( /PlayBook/ ) > -1 && RegExp.$1 >= 0 && wkLte534 ||
					/* Firefox Mobile (Fennec) 4 and up
					~: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:2.1.1) Gecko/ Firefox/4.0.2pre Fennec/4.0. */
					ua.match( /Fennec\/([0-9]+)/ ) && RegExp.$1 >= 4 ||
					/* WebOS 3 and up (TouchPad too)
					~: Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.48 Safari/534.6 TouchPad/1.0 */
					ua.match( /wOSBrowser\/([0-9]+)/ ) && RegExp.$1 >= 233 && wkLte534 ||
					/* Nokia Browser N8
					~: Mozilla/5.0 (Symbian/3; Series60/5.2 NokiaN8-00/012.002; Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.0 Mobile Safari/533.4 3gpp-gba 
					~: Note: the N9 doesn't have native overflow with one-finger touch. wtf */
					ua.match( /NokiaBrowser\/([0-9\.]+)/ ) && parseFloat(RegExp.$1) === 7.3 && webkit && wkversion >= 533
				);
			})(),
			
		// Easing can use any of Robert Penner's equations (http://www.robertpenner.com/easing_terms_of_use.html). By default, overthrow includes ease-out-cubic
		// arguments: t = current iteration, b = initial value, c = end value, d = total iterations
		// use w.overthrow.easing to provide a custom function externally, or pass an easing function as a callback to the toss method
		defaultEasing = function (t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
			
		enabled = false,
		
		// Keeper of intervals
		timeKeeper,
				
		/* toss scrolls and element with easing
		
		// elem is the element to scroll
		// options hash:
			* left is the desired horizontal scroll. Default is "+0". For relative distances, pass a string with "+" or "-" in front.
			* top is the desired vertical scroll. Default is "+0". For relative distances, pass a string with "+" or "-" in front.
			* duration is the number of milliseconds the throw will take. Default is 100.
			* easing is an optional custom easing function. Default is w.overthrow.easing. Must follow the easing function signature 
		*/
		toss = function( elem, options ){
			var i = 0,
				sLeft = elem.scrollLeft,
				sTop = elem.scrollTop,
				// Toss defaults
				o = {
					top: "+0",
					left: "+0",
					duration: 100,
					easing: w.overthrow.easing
				},
				endLeft, endTop;
			
			// Mixin based on predefined defaults
			if( options ){
				for( var j in o ){
					if( options[ j ] !== undefined ){
						o[ j ] = options[ j ];
					}
				}
			}
			
			// Convert relative values to ints
			// First the left val
			if( typeof o.left === "string" ){
				o.left = parseFloat( o.left );
				endLeft = o.left + sLeft;
			}
			else {
				endLeft = o.left;
				o.left = o.left - sLeft;
			}
			// Then the top val
			if( typeof o.top === "string" ){
				o.top = parseFloat( o.top );
				endTop = o.top + sTop;
			}
			else {
				endTop = o.top;
				o.top = o.top - sTop;
			}

			timeKeeper = setInterval(function(){
				if( i++ < o.duration ){
					elem.scrollLeft = o.easing( i, sLeft, o.left, o.duration );
					elem.scrollTop = o.easing( i, sTop, o.top, o.duration );
				}
				else{
					if( endLeft !== elem.scrollLeft ){
						elem.scrollLeft = endLeft;
					}
					if( endTop !== elem.scrollTop ){
						elem.scrollTop = endTop;
					}
					intercept();
				}
			}, 1 );
			
			// Return the values, post-mixin, with end values specified
			return { top: endTop, left: endLeft, duration: o.duration, easing: o.easing };
		},
		
		// find closest overthrow (elem or a parent)
		closest = function( target, ascend ){									
			return !ascend && target.className && target.className.indexOf( "overthrow" ) > -1 && target || closest( target.parentNode );
		},
				
		// Intercept any throw in progress
		intercept = function(){
			clearInterval( timeKeeper );
		},
			
		// Enable and potentially polyfill overflow
		enable = function(){
				
			// If it's on, 
			if( enabled ){
				return;
			}
			// It's on.
			enabled = true;
				
			// If overflowProbablyAlreadyWorks or at least the element canBeFilledWithPoly, add a class to cue CSS that assumes overflow scrolling will work (setting height on elements and such)
			if( overflowProbablyAlreadyWorks || canBeFilledWithPoly ){
				docElem.className += " " + classtext;
			}
				
			// Destroy everything later. If you want to.
			w.overthrow.forget = function(){
				// Strip the class name from docElem
				docElem.className = docElem.className.replace( classtext, "" );
				// Remove touch binding (check for method support since this part isn't qualified by touch support like the rest)
				if( doc.removeEventListener ){
					doc.removeEventListener( "touchstart", start, false );
				}
				// reset easing to default
				w.overthrow.easing = defaultEasing;
				
				// Let 'em know
				enabled = false;
			};
	
			// If overflowProbablyAlreadyWorks or it doesn't look like the browser canBeFilledWithPoly, our job is done here. Exit viewport left.
			if( overflowProbablyAlreadyWorks || !canBeFilledWithPoly ){
				return;
			}

			// Fill 'er up!
			// From here down, all logic is associated with touch scroll handling
				// elem references the overthrow element in use
			var elem,
				
				// The last several Y values are kept here
				lastTops = [],
		
				// The last several X values are kept here
				lastLefts = [],
				
				// lastDown will be true if the last scroll direction was down, false if it was up
				lastDown,
				
				// lastRight will be true if the last scroll direction was right, false if it was left
				lastRight,
				
				// For a new gesture, or change in direction, reset the values from last scroll
				resetVertTracking = function(){
					lastTops = [];
					lastDown = null;
				},
				
				resetHorTracking = function(){
					lastLefts = [];
					lastRight = null;
				},
				
				// After releasing touchend, throw the overthrow element, depending on momentum
				finishScroll = function(){
					// Come up with a distance and duration based on how 
					// Multipliers are tweaked to a comfortable balance across platforms
					var top = ( lastTops[ 0 ] - lastTops[ lastTops.length -1 ] ) * 8,
						left = ( lastLefts[ 0 ] - lastLefts[ lastLefts.length -1 ] ) * 8,
						duration = Math.max( Math.abs( left ), Math.abs( top ) ) / 8;
					
					// Make top and left relative-style strings (positive vals need "+" prefix)
					top = ( top > 0 ? "+" : "" ) + top;
					left = ( left > 0 ? "+" : "" ) + left;
					
					// Make sure there's a significant amount of throw involved, otherwise, just stay still
					if( !isNaN( duration ) && duration > 0 && ( Math.abs( left ) > 80 || Math.abs( top ) > 80 ) ){
						toss( elem, { left: left, top: top, duration: duration } );
					}
				},
			
				// On webkit, touch events hardly trickle through textareas and inputs
				// Disabling CSS pointer events makes sure they do, but it also makes the controls innaccessible
				// Toggling pointer events at the right moments seems to do the trick
				// Thanks Thomas Bachem http://stackoverflow.com/a/5798681 for the following
				inputs,
				setPointers = function( val ){
					inputs = elem.querySelectorAll( "textarea, input" );
					for( var i = 0, il = inputs.length; i < il; i++ ) {
						inputs[ i ].style.pointerEvents = val;
					}
				},
				
				// For nested overthrows, changeScrollTarget restarts a touch event cycle on a parent or child overthrow
				changeScrollTarget = function( startEvent, ascend ){
					if( doc.createEvent ){
						var newTarget = ( !ascend || ascend === undefined ) && elem.parentNode || elem.touchchild || elem,
							tEnd;
								
						if( newTarget !== elem ){
							tEnd = doc.createEvent( "HTMLEvents" );
							tEnd.initEvent( "touchend", true, true );
							elem.dispatchEvent( tEnd );
							newTarget.touchchild = elem;
							elem = newTarget;
							newTarget.dispatchEvent( startEvent );
						}
					}
				},
				
				// Touchstart handler
				// On touchstart, touchmove and touchend are freshly bound, and all three share a bunch of vars set by touchstart
				// Touchend unbinds them again, until next time
				start = function( e ){
					
					// Stop any throw in progress
					intercept();
					
					// Reset the distance and direction tracking
					resetVertTracking();
					resetHorTracking();
					
					// ========== XXX PHOTOSWIPE ============= 
					if ( $( e.target).attr('class') == "ps-toolbar-content" ){
						return;
					}
					
					elem = closest( e.target );
						
					if( !elem || elem === docElem || e.touches.length > 1 ){
						return;
					}

					setPointers( "none" );
					var touchStartE = e,
						scrollT = elem.scrollTop,
						scrollL = elem.scrollLeft,
						height = elem.offsetHeight,
						width = elem.offsetWidth,
						startY = e.touches[ 0 ].pageY,
						startX = e.touches[ 0 ].pageX,
						scrollHeight = elem.scrollHeight,
						scrollWidth = elem.scrollWidth,
					
						// Touchmove handler
						move = function( e ){
						
							var ty = scrollT + startY - e.touches[ 0 ].pageY,
								tx = scrollL + startX - e.touches[ 0 ].pageX,
								down = ty >= ( lastTops.length ? lastTops[ 0 ] : 0 ),
								right = tx >= ( lastLefts.length ? lastLefts[ 0 ] : 0 );
								
							// If there's room to scroll the current container, prevent the default window scroll
							if( ( ty > 0 && ty < scrollHeight - height ) || ( tx > 0 && tx < scrollWidth - width ) ){
								e.preventDefault();
							}
							// This bubbling is dumb. Needs a rethink.
							else {
								changeScrollTarget( touchStartE );
							}
							
							// If down and lastDown are inequal, the y scroll has changed direction. Reset tracking.
							if( lastDown && down !== lastDown ){
								resetVertTracking();
							}
							
							// If right and lastRight are inequal, the x scroll has changed direction. Reset tracking.
							if( lastRight && right !== lastRight ){
								resetHorTracking();
							}
							
							// remember the last direction in which we were headed
							lastDown = down;
							lastRight = right;
							
							// set the container's scroll
							elem.scrollTop = ty;
							elem.scrollLeft = tx;
						
							lastTops.unshift( ty );
							lastLefts.unshift( tx );
						
							if( lastTops.length > 3 ){
								lastTops.pop();
							}
							if( lastLefts.length > 3 ){
								lastLefts.pop();
							}
						},
					
						// Touchend handler
						end = function( e ){
							// Apply momentum based easing for a graceful finish
							finishScroll();
							// Bring the pointers back
							setPointers( "auto" );
							setTimeout( function(){
								setPointers( "none" );
							}, 450 );
							elem.removeEventListener( "touchmove", move, false );
							elem.removeEventListener( "touchend", end, false );
						};
					
					elem.addEventListener( "touchmove", move, false );
					elem.addEventListener( "touchend", end, false );
				};
				
			// Bind to touch, handle move and end within
			doc.addEventListener( "touchstart", start, false );
		};
		
	// Expose overthrow API
	w.overthrow = {
		set: enable,
		forget: function(){},
		easing: defaultEasing,
		toss: toss,
		intercept: intercept,
		closest: closest,
		support: overflowProbablyAlreadyWorks ? "native" : canBeFilledWithPoly && "polyfilled" || "none"
	};
	
	// Auto-init
	enable();
		
})( this );


/*! hashscroll overthrow.js extension: eased scroll to elements via hashchange, within an overthrow element. (c) 2012: Scott Jehl, Filament Group, Inc. Dual MIT/BSD license */
(function( w, undefined ){
	// set the hash-based links to scroll to a desired location
	if( w.overthrow && w.addEventListener ){
		
		function scrollToElem ( elem ){
		  overthrow.intercept();
			var throwParent = overthrow.closest( elem );
			if( throwParent ){
				overthrow.toss(
					throwParent,
					{ 
						left: elem.offsetLeft - throwParent.offsetLeft,
						top: elem.offsetTop - throwParent.offsetTop
					}
				);
			}
		}
		/*
		w.document.addEventListener( "click", function( e ){
			
			var link = e.target;
			
			if( link && link.className.indexOf( "throw" ) > -1 ){
			
				var hash = link.href.split( "#" )[ 1 ],
					elem = w.document.getElementById( hash );
					
				if( elem ){
					e.preventDefault();
					scrollToElem( elem );
					w.location.hash = hash;
				}
			}
		}, false);
		*/
	}
})( this );

