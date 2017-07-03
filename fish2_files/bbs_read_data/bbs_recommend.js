function handleRecommend(grpid, fldid, dataid, callback) {
	if (callback == undefined) {
		callback = function(){};
	}
	if (CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID == '') {
		alert("로그인 사용자만 추천할 수 있습니다.")
		callback("nologin");
		return;
	}
	if (CAFEAPP.RECOMMENDED) {
		alert("이미 추천 하셨습니다.");
		callback("recommended");
		return;
	}

	CAFEAPP.RECOMMENDED = true;
	BbsRead.updateRecommedCount(grpid, fldid, dataid, { callback: function (data) {
		if (data == "UPDATE") {
			var elRecommendCnt = daum.$("recommendCnt");
			elRecommendCnt.innerHTML = parseInt(elRecommendCnt.innerHTML, 10) + 1;
			CAFEAPP.RECOMMENDED = true;
			callback("ok");
		} else if (data == "DUPLICATE") {
			alert("이미 추천 하셨습니다.");
			CAFEAPP.RECOMMENDED = true;
			callback("recommended");
		} else if (data == "NOMEMBER") {
			alert("카페 회원만 추천할 수 있습니다.");
			CAFEAPP.RECOMMENDED = false;
			callback("nomember");
		} else if (data == "ERROR") {
			//error log
			new daum.Ajax({url: "http://magpie.daum.net/magpie/opencounter/Open.do?service=cafe&key=CAFE_BBS_BULLETIN_RECOMMEND_FAIL&extra=" + grpid}).request();
			CAFEAPP.RECOMMENDED = false;
			callback("error");
		}
	}, errorHandler: function () {
		new daum.Ajax({url: "http://magpie.daum.net/magpie/opencounter/Open.do?service=cafe&key=CAFE_BBS_BULLETIN_RECOMMEND_FAIL&extra=" + grpid}).request();
		CAFEAPP.RECOMMENDED = false;
		callback("error");
	}});
}