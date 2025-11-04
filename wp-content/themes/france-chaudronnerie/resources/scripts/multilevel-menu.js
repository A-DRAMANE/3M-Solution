/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */

;(function(window) {
    jQuery.noConflict();
    (function( $ ) {
      $(function() {
	'use strict';

	function classReg( className ) {
	  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
	}

	// classList support for class management
	// altho to be fair, the api sucks because it won't accept multiple classes at once
	var hasClass, addClass, removeClass;

	if ( 'classList' in document.documentElement ) {
	  hasClass = function( elem, c ) {
	    return elem.classList.contains( c );
	  };
	  addClass = function( elem, c ) {
	    elem.classList.add( c );
	  };
	  removeClass = function( elem, c ) {
	    elem.classList.remove( c );
	  };
	}
	else {
	  hasClass = function( elem, c ) {
	    return classReg( c ).test( elem.className );
	  };
	  addClass = function( elem, c ) {
	    if ( !hasClass( elem, c ) ) {
	      elem.className = elem.className + ' ' + c;
	    }
	  };
	  removeClass = function( elem, c ) {
	    elem.className = elem.className.replace( classReg( c ), ' ' );
	  };
	}

	function toggleClass( elem, c ) {
	  var fn = hasClass( elem, c ) ? removeClass : addClass;
	  fn( elem, c );
	}

	var classie = {
	  // full names
	  hasClass: hasClass,
	  addClass: addClass,
	  removeClass: removeClass,
	  toggleClass: toggleClass,
	  // short names
	  has: hasClass,
	  add: addClass,
	  remove: removeClass,
	  toggle: toggleClass
	};

	var support = { animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		};

	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}
	function MLMenu(el, options) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );

		// the menus (<ul>´s)
		this.menus = [].slice.call(this.el.querySelectorAll('.menu__level'));

		// index of current menu
		// Each level is actually a different menu so 0 is root, 1 is sub-1, 2 sub-2, etc.
		this.current_menu = 0;

		/* Determine what current menu actually is */
		var current_menu;

		this.menus.forEach(function(menuEl, pos) {
			var items = menuEl.querySelectorAll('.menu__item');
		});
		if (current_menu) {
			this.current_menu = current_menu;
		}

		this._init();
	}

	MLMenu.prototype.options = {
		// show breadcrumbs
		breadcrumbsCtrl : true,
		// initial breadcrumb text
		initialBreadcrumb : '',
		// show back button
		backCtrl : true,
		// delay between each menu item sliding animation
		itemsDelayInterval : 60,
		// direction
		direction : 'r2l',
		// callback: item that doesn´t have a submenu gets clicked
		// onItemClick([event], [inner HTML of the clicked item])
		onItemClick : function(ev, itemName) { return false; }
	};

	MLMenu.prototype._init = function() {
		// iterate the existing menus and create an array of menus,
		// more specifically an array of objects where each one holds the info of each menu element and its menu items
		this.menusArr = [];
		this.breadCrumbs = false;
		var self = this;
		var submenus = [];

		/* Loops over root level menu items */
		this.menus.forEach(function(menuEl, pos) {
			var menu = {menuEl : menuEl, menuItems : [].slice.call(menuEl.querySelectorAll('.menu__item'))};

			self.menusArr.push(menu);

			// set current menu class
			if( pos === self.current_menu ) {
				classie.add(menuEl, 'menu__level--current');
			}

			var menu_x = menuEl.getAttribute('data-menu');
			var links = menuEl.querySelectorAll('.menu__link');
			$(links).each(function(linkEl, lPos) {
				var submenu = $(lPos).data('submenu');//linkEl.getAttribute('data-submenu');
				if (submenu) {
					var pushMe = {"menu":submenu, "name": lPos.innerHTML };
					if (submenus[pos]) {
						submenus[pos].push(pushMe);
					} else {
						submenus[pos] = []
						submenus[pos].push(pushMe);
					}
				}
			});
		});

		/* For each MENU, find their parent MENU */
		this.menus.forEach(function(menuEl, pos) {
			var menu_x = menuEl.getAttribute('data-menu');
			submenus.forEach(function(subMenuEl, menu_root) {
				subMenuEl.forEach(function(subMenuItem, subPos) {
					if (subMenuItem.menu == menu_x) {
						self.menusArr[pos].backIdx = menu_root;
						self.menusArr[pos].name = subMenuItem.name;
					}
				});
			});
		});

		// create breadcrumbs
		if( self.options.breadcrumbsCtrl ) {
			this.breadcrumbsCtrl = document.createElement('nav');
			this.breadcrumbsCtrl.className = 'menu__breadcrumbs';
			this.breadcrumbsCtrl.setAttribute('aria-label', 'You are here');
      this.breadcrumbsCtrl.setAttribute('tab-index', '1');
			//this.el.insertBefore(this.breadcrumbsCtrl, this.el.firstChild);
      //$(this.breadcrumbsCtrl).insertAfter('#ml-menu .header-menu');
      $(this.breadcrumbsCtrl).insertAfter($(this.el).find('.header-menu'));
			//$('.menu__wrap')
			// add initial breadcrumb
			this._addBreadcrumb(0);

			// Need to add breadcrumbs for all parents of current submenu
			if (self.menusArr[self.current_menu].backIdx != 0 && self.current_menu != 0) {
				this._crawlCrumbs(self.menusArr[self.current_menu].backIdx, self.menusArr);
				this.breadCrumbs = true;
			}

			// Create current submenu breadcrumb
			if (self.current_menu != 0) {
				this._addBreadcrumb(self.current_menu);
				this.breadCrumbs = true;
			}

			this.breadcrumbsCtrl.addEventListener('click', function(ev) {
				ev.preventDefault();
				self._back();
			});
		}

		// create back button
		if (this.options.backCtrl) {
			this.backCtrl = document.createElement('button');
			if (this.breadCrumbs) {
				this.backCtrl.className = 'menu__back';
			} else {
				this.backCtrl.className = 'menu__back menu__back--hidden';
			}
			this.backCtrl.setAttribute('aria-label', 'Go back');
			this.backCtrl.innerHTML = '';
			$(this.el).children('.menu__wrap').prepend(this.backCtrl, this.el.firstChild);
		}

		// event binding
		this._initEvents();
	};

	MLMenu.prototype._initEvents = function() {
		var self = this;

		for(var i = 0, len = this.menusArr.length; i < len; ++i) {
			this.menusArr[i].menuItems.forEach(function(item, pos) {
				if(jQuery(item).find('.arrow,.menu__link').length > 0) {
          jQuery(item).find('.arrow,.menu__link').click(function(ev) {
						var submenu = ev.target.getAttribute('data-submenu'),
							itemName = ev.target.dataset.name,
							subMenuEl = self.el.querySelector('ul[data-menu="' + submenu + '"]');
						// check if there's a sub menu for this item
						if( submenu && subMenuEl ) {
							ev.preventDefault();
							// open it
							self._openSubMenu(subMenuEl, pos, itemName);
						}
						else {
							// add class current
							var currentlink = self.el.querySelector('.menu__link--current');
							if( currentlink ) {
								classie.remove(self.el.querySelector('.menu__link--current'), 'menu__link--current');
							}
							classie.add(ev.target, 'menu__link--current');

							// callback
							self.options.onItemClick(ev, itemName);
						}
					});
				}
			});
		}

		// back navigation
		if( this.options.backCtrl ) {
			this.backCtrl.addEventListener('click', function() {
				self._back();
			});
		}
	};

	MLMenu.prototype._openSubMenu = function(subMenuEl, clickPosition, subMenuName) {
		if( this.isAnimating) {
			return false;
		}
		this.isAnimating = true;

		// save "parent" menu index for back navigation
		this.menusArr[this.menus.indexOf(subMenuEl)].backIdx = this.current_menu;
		// save "parent" menu´s name
		this.menusArr[this.menus.indexOf(subMenuEl)].name = subMenuName;
		// current menu slides out
		this._menuOut(clickPosition);
		// next menu (submenu) slides in
		this._menuIn(subMenuEl, clickPosition);
	};

	MLMenu.prototype._back = function() {
		if(!$(this.breadcrumbsCtrl).hasClass('empty')) {
			if( this.isAnimating ) {
				return false;
			}
			this.isAnimating = true;

			// current menu slides out
			this._menuOut();
			// next menu (previous menu) slides in
			var backMenu = this.menusArr[this.menusArr[this.current_menu].backIdx].menuEl;
			this._menuIn(backMenu);

			// remove last breadcrumb
			if( this.options.breadcrumbsCtrl ) {
				this.breadcrumbsCtrl.removeChild(this.breadcrumbsCtrl.lastElementChild);
				this.breadcrumbsCtrl.lastElementChild.classList.remove('before-last-item-breadrumb');
			}

			if($(this.breadcrumbsCtrl).children('a').length < 2) {
				$(this.breadcrumbsCtrl).children('a').addClass('alone');
				$(this.breadcrumbsCtrl).addClass('empty');
			}
      if(jQuery(this.breadcrumbsCtrl).children().length == 2) {
        jQuery(this.breadcrumbsCtrl).children().eq(1).removeClass('before-last');
      }
		}
	};

	MLMenu.prototype._menuOut = function(clickPosition) {
		// the current menu
		var self = this,
			currentMenu = this.menusArr[this.current_menu].menuEl,
			isBackNavigation = typeof clickPosition == 'undefined' ? true : false;

		// slide out current menu items - first, set the delays for the items
		this.menusArr[this.current_menu].menuItems.forEach(function(item, pos) {
			item.style.WebkitAnimationDelay = item.style.animationDelay = isBackNavigation ? parseInt(pos * self.options.itemsDelayInterval) + 'ms' : parseInt(Math.abs(clickPosition - pos) * self.options.itemsDelayInterval) + 'ms';
		});
		// animation class
		if( this.options.direction === 'r2l' ) {
			classie.add(currentMenu, !isBackNavigation ? 'animate-outToLeft' : 'animate-outToRight');
		}
		else {
			classie.add(currentMenu, isBackNavigation ? 'animate-outToLeft' : 'animate-outToRight');
		}
	};

	MLMenu.prototype._menuIn = function(nextMenuEl, clickPosition) {
		var self = this,
			// the current menu
			currentMenu = this.menusArr[this.current_menu].menuEl,
			isBackNavigation = typeof clickPosition == 'undefined' ? true : false,
			// index of the nextMenuEl
			nextMenuIdx = this.menus.indexOf(nextMenuEl),

			nextMenu = this.menusArr[nextMenuIdx],
			nextMenuEl = nextMenu.menuEl,
			nextMenuItems = nextMenu.menuItems,
			nextMenuItemsTotal = nextMenuItems.length;

		// slide in next menu items - first, set the delays for the items
		nextMenuItems.forEach(function(item, pos) {
			item.style.WebkitAnimationDelay = item.style.animationDelay = isBackNavigation ? parseInt(pos * self.options.itemsDelayInterval) + 'ms' : parseInt(Math.abs(clickPosition - pos) * self.options.itemsDelayInterval) + 'ms';

			// we need to reset the classes once the last item animates in
			// the "last item" is the farthest from the clicked item
			// let's calculate the index of the farthest item
			var farthestIdx = clickPosition <= nextMenuItemsTotal/2 || isBackNavigation ? nextMenuItemsTotal - 1 : 0;

			if( pos === farthestIdx ) {
				onEndAnimation(item, function() {
					// reset classes
					if( self.options.direction === 'r2l' ) {
						classie.remove(currentMenu, !isBackNavigation ? 'animate-outToLeft' : 'animate-outToRight');
						classie.remove(nextMenuEl, !isBackNavigation ? 'animate-inFromRight' : 'animate-inFromLeft');
					}
					else {
						classie.remove(currentMenu, isBackNavigation ? 'animate-outToLeft' : 'animate-outToRight');
						classie.remove(nextMenuEl, isBackNavigation ? 'animate-inFromRight' : 'animate-inFromLeft');
					}
					classie.remove(currentMenu, 'menu__level--current');
					classie.add(nextMenuEl, 'menu__level--current');

					//reset current
					self.current_menu = nextMenuIdx;

					// control back button and breadcrumbs navigation elements
					if( !isBackNavigation ) {
						// show back button
						if( self.options.backCtrl ) {
							classie.remove(self.backCtrl, 'menu__back--hidden');
						}

						// add breadcrumb
						if($(nextMenuEl).hasClass('before-last')) {
							self._addBreadcrumb(nextMenuIdx, false, true);
						}
						else if($(nextMenuEl).hasClass('level-last')) {
							self._addBreadcrumb(nextMenuIdx, true);
						}
						else {
							self._addBreadcrumb(nextMenuIdx);
						}
					}
					else if( self.current_menu === 0 && self.options.backCtrl ) {
						// hide back button
						classie.add(self.backCtrl, 'menu__back--hidden');
					}

					// we can navigate again..
					self.isAnimating = false;

					// focus retention
					nextMenuEl.focus();
				});
			}
		});

		// animation class
		if( this.options.direction === 'r2l' ) {
			classie.add(nextMenuEl, !isBackNavigation ? 'animate-inFromRight' : 'animate-inFromLeft');
		}
		else {
			classie.add(nextMenuEl, isBackNavigation ? 'animate-inFromRight' : 'animate-inFromLeft');
		}
	};

	MLMenu.prototype._addBreadcrumb = function(idx, isLast, isBeforeLast) {
		if( !this.options.breadcrumbsCtrl ) {
			return false;
		}
		var bc = document.createElement('a');
		bc.href = '#'; // make it focusable
		bc.innerHTML = idx ? this.menusArr[idx].name : this.options.initialBreadcrumb;
		if(!idx) {
			$(this.breadcrumbsCtrl).addClass('empty');
			bc.classList.add('alone');
		}
		else {
			$(this.breadcrumbsCtrl).children('a.alone').removeClass('alone');
			$(this.breadcrumbsCtrl).removeClass('empty');
		}

		if(typeof isLast != 'undefined' && isLast == true) {
			bc.classList.add('last-item-breadrumb');
		}
		if(typeof isBeforeLast != 'undefined' && isBeforeLast == true) {
			this.breadcrumbsCtrl.lastElementChild.classList.add('before-last-item-breadrumb');
		}
		else {
			if(this.breadcrumbsCtrl.lastElementChild) {
				this.breadcrumbsCtrl.lastElementChild.classList.remove('before-last-item-breadrumb');
			}
		}
		this.breadcrumbsCtrl.appendChild(bc);

		if(jQuery(this.breadcrumbsCtrl).children().length == 3) {
		   jQuery(this.breadcrumbsCtrl).children().eq(1).addClass('before-last');
    }

		var self = this;
		bc.addEventListener('click', function(ev) {
			ev.preventDefault();
			if(!idx) {
				self._back();
			}
			else {
				// do nothing if this breadcrumb is the last one in the list of breadcrumbs
				if( !bc.nextSibling || self.isAnimating ) {
					return false;
				}
				self.isAnimating = true;

				// current menu slides out
				self._menuOut();
				// next menu slides in
				var nextMenu = self.menusArr[idx].menuEl;
				self._menuIn(nextMenu);

				// remove breadcrumbs that are ahead
				var siblingNode;
				while (siblingNode = bc.nextSibling) {
					self.breadcrumbsCtrl.removeChild(siblingNode);
				}
				if(jQuery(this.breadcrumbsCtrl).children().length == 2) {
          jQuery(this.breadcrumbsCtrl).children().eq(1).removeClass('before-last');
        }
			}
		});
	};

	MLMenu.prototype._crawlCrumbs = function(currentMenu, menuArray) {
		if (typeof menuArray[currentMenu] != 'undefined' && menuArray[currentMenu].backIdx != 0) {
			this._crawlCrumbs(menuArray[currentMenu].backIdx, menuArray);
		}
		// create breadcrumb
		this._addBreadcrumb(currentMenu);
	}

	window.MLMenu = MLMenu;

	function initMLMenu(){
		var mlmenu, menuEl, myIntervalSubMenu;

		menuEl = document.querySelector('#ml-menu');

		mlmenu = new MLMenu(menuEl, {
			breadcrumbsCtrl : true, // show breadcrumbs
			initialBreadcrumb : '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhbHF1ZV8xIiBmb2N1c2FibGU9ImZhbHNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIg0KCSB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTUuNTk1cHgiIHZpZXdCb3g9IjI4OS42MDcgMTMwLjgxMyAxNiAxNS41OTUiDQoJIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMjg5LjYwNyAxMzAuODEzIDE2IDE1LjU5NSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBmaWxsPSIjQkJCNUE3IiBkPSJNMjk4LjgwNCwxNDUuMzY0bC0wLjc5MywwLjc5MmMtMC4zMzYsMC4zMzYtMC44NzksMC4zMzYtMS4yMTEsMGwtNi45NDItNi45MzgNCgljLTAuMzM2LTAuMzM1LTAuMzM2LTAuODc4LDAtMS4yMWw2Ljk0Mi02Ljk0MmMwLjMzNi0wLjMzNiwwLjg3OC0wLjMzNiwxLjIxMSwwbDAuNzkzLDAuNzkyYzAuMzM5LDAuMzM5LDAuMzMyLDAuODkzLTAuMDE1LDEuMjI1DQoJbC00LjMwMyw0LjA5OWgxMC4yNjNjMC40NzUsMCwwLjg1NywwLjM4MiwwLjg1NywwLjg1N3YxLjE0M2MwLDAuNDc1LTAuMzgzLDAuODU3LTAuODU3LDAuODU3aC0xMC4yNjNsNC4zMDMsNC4xDQoJQzI5OS4xMzksMTQ0LjQ3MSwyOTkuMTQ3LDE0NS4wMjQsMjk4LjgwNCwxNDUuMzY0eiIvPg0KPC9zdmc+DQo=" />', // initial breadcrumb text
			//backCtrl : true, // show back button
			// itemsDelayInterval : 60, // delay between each menu item sliding animation
		});
		function setCurrentMenu(indexPathCurrent) {
			target = pathCurrent[indexPathCurrent];
			if(typeof target == 'undefined') {
				clearInterval(myIntervalSubMenu);
				return false;
			}
			var obj = $('a[data-submenu="submenu-'+target+'"]'),
				submenu = $(obj).data('submenu'),
				itemName = $(obj).data('name'),
				subMenuEl = $('#ml-menu').find('ul[data-menu="' + submenu + '"]'),
				pos = $(obj).parent().index();

			indexPathCurrent ++;

			if(obj.length > 0) {
				mlmenu._openSubMenu(subMenuEl[0], pos, itemName);
				clearInterval(myIntervalSubMenu);
				myIntervalSubMenu = setInterval(function(){
					setCurrentMenu(indexPathCurrent);
				}, 2000);
			}
			else {
				setCurrentMenu(indexPathCurrent);//clearInterval(myIntervalSubMenu);
			}
		}
	}

	$(document).ready(function(){
		initMLMenu();
	});
});

})(jQuery);

})(window);
