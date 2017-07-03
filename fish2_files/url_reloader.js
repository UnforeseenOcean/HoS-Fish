var UrlReloader = (function () {
	var UrlSessionRepository = (function () {
		var storage = window.sessionStorage;
		return {
			savePageInfo: function (frameUrl, grpcode) {
				storage.setItem('frameUrl', frameUrl);
				storage.setItem('grpcode', grpcode);
			},
			loadPageInfo: function () {
				return {
					frameUrl: storage.getItem('frameUrl'),
					grpcode: storage.getItem('grpcode')
				}
			},
			clear: function () {
				storage.removeItem('frameUrl');
				storage.removeItem('grpcode');
				storage.removeItem('needClear');
			},
			reserveClear: function () {
				storage.setItem('needClear', true);
			},
			hasReservedClear: function () {
				return storage.getItem('needClear');
			}
		};
	})();

	var PREFIX_URL = '/_c21_';
	var BBS_READ_URL_LIST = {};
	BBS_READ_URL_LIST[PREFIX_URL + '/bbs_read'] = true;
	BBS_READ_URL_LIST[PREFIX_URL + '/bbs_search_read'] = true;
	BBS_READ_URL_LIST[PREFIX_URL + '/recent_bbs_read'] = true;

	var BBS_LIST_URL_LIST = {};
	BBS_LIST_URL_LIST[PREFIX_URL + '/bbs_list'] = true;
	BBS_LIST_URL_LIST[PREFIX_URL + '/album_list'] = true;

	var mainFrame;
	var isFirstPage = true;

	var isCafeMainUrl = function () {
		var splitedUrl = window.location.pathname.split('/');
		return splitedUrl.length == 2;
	};

	var init = function () {
		document.addEventListener('DOMContentLoaded', function () {
			mainFrame = document.getElementById('down');
			var currentPageInfo = UrlSessionRepository.loadPageInfo();

			if (currentPageInfo.frameUrl != null && currentPageInfo.grpcode == getGrpcode() && !UrlSessionRepository.hasReservedClear() && isCafeMainUrl()) {
				delFrameCookie();
				mainFrame.src = currentPageInfo.frameUrl;
			}

			UrlSessionRepository.clear();
			mainFrame.onload = function () {
				UrlReloader.updateUrl();
			};
		}, false);
	};

	var replaceHistoryUrl = function (url) {
		window.history.replaceState({path: url}, '', url);
	};

	var getGrpcode = function () {
		var splitedPathname = window.location.pathname.split('/');
		if (splitedPathname.length < 2) {
			return '';
		}

		var grpcode = splitedPathname[1];
		return grpcode;
	};

	var isBbsReadUrl = function (currentPage) {
		return BBS_READ_URL_LIST[currentPage];
	};

	var isBbsListUrl = function (currentPage) {
		return BBS_LIST_URL_LIST[currentPage];
	};

	var getCafeApp = function () {
		var cafeApp = mainFrame.contentWindow.CAFEAPP;

		if (typeof cafeApp == 'undefined' || typeof cafeApp.GRPCODE == 'undefined') {
			return null;
		}

		return cafeApp;
	};

	var updateUrl = function () {
		if (!mainFrame) {
			return;
		}

		var cafeApp = getCafeApp();
		if (!cafeApp) {
			return;
		}

		var newurl = mainFrame.contentWindow.location.href;
		var currentPage = mainFrame.contentWindow.location.pathname;
		var search = (isFirstPage) ? window.location.search : '';
		isFirstPage = false;

		if (isBbsReadUrl(currentPage)) {
			replaceHistoryUrl('/' + cafeApp.GRPCODE + '/' + cafeApp.FLDID + '/' + cafeApp.ui.DATAID + search);
		} else if (isBbsListUrl(currentPage)) {
			replaceHistoryUrl('/' + cafeApp.GRPCODE + '/' + cafeApp.FLDID + search);
		} else {
			replaceHistoryUrl('/' + cafeApp.GRPCODE + search);
		}

		this.saveCurrentUrl(newurl, cafeApp.GRPCODE);
	};

	var saveCurrentUrl = function (frameUrl, grpcode) {
		if (typeof frameUrl == 'undefined' || typeof grpcode == 'undefined') {
			return;
		}
		if (UrlSessionRepository.hasReservedClear()) {
			UrlSessionRepository.clear();
			return;
		}
		UrlSessionRepository.savePageInfo(frameUrl, grpcode);
	};

	var clear = function () {
		UrlSessionRepository.reserveClear();
	};

	var isBrowserSupport = function () {
		return window.sessionStorage && window.history.replaceState && document.addEventListener;
	};

	var makeFrameCookie = function (url) {
		var today = new Date();
		var expires = new Date(today.getTime() + (30 * 1000));
		document.cookie = 'TCH=' + encodeURIComponent(url) + '; domain=cafe.daum.net; path=/; expires=' + expires.toGMTString();
	};

	var delFrameCookie = function () {
		document.cookie = 'TCH=; domain=cafe.daum.net; path=/; Max-Age=0';
	};

	if (!isBrowserSupport()) {
		init = updateUrl = saveCurrentUrl = clear = function () {
		};
	}

	return {
		init: init,
		updateUrl: updateUrl,
		saveCurrentUrl: saveCurrentUrl,
		clear: clear,
		makeFrameCookie: makeFrameCookie,
		delFrameCookie: delFrameCookie
	};
})();
