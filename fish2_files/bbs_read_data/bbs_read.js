document.domain='daum.net';

function pop_mobile(szURL, szName, iWidth, iHeight) {
	window.open(szURL, szName, 'width=' + iWidth + ',height=' + iHeight + ',resizable=yes,scrollbars=yes');
}

function doPrint() {
	var bbs_print = (CAFEAPP.ui.BBS_PRINT)? CAFEAPP.ui.BBS_PRINT : "bbs_print";  
    var url = "/_c21_/"+bbs_print+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID;
	printWin=window.open(url, "printWin", "scrollbars=yes,toolbar=no,location=no,directories=no,width=640,height=650,resizable=yes,mebar=no,left=0,top=0");
	return;
}

function view_ccl(type)	{
	if (type == "1"){
		document.getElementById('cclArea_tooltip').style.display = "block";
	} else	{
		document.getElementById('cclArea_tooltip').style.display = "none";
	}
}

function check_reply(bbsdepth) {
    if(bbsdepth.lastIndexOf("zzzzz") == -1) {
    	alert("�� �̻� ����� �� �� �����ϴ�.");
        return;
    }
	document.location.href = "/_c21_/"+CAFEAPP.ui.BBS_REPLY_URI+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID+"&pardataname="+CAFEAPP.ui.ENCDATANAME+"&parbbsdepth="+CAFEAPP.ui.PARBBSDEPTH+((CAFEAPP.ui.ANONYN == "N" && CAFEAPP.ui.BBSNICKNAME) ?"&e_paruserid="+CAFEAPP.ui.CAFE_ENCRYPT_USERID :"")+"&pardatatype="+CAFEAPP.ui.PARDATATYPE+"&parregdt="+CAFEAPP.ui.Convert_REGDT+"&move="+CAFEAPP.ui.Convert_REFERER;
}


function controlImage(img_id) {
    var maxWidth = 750;
    var w = document.getElementById(img_id).width;
    if (w <= 0) {
    	time_id = window.setTimeout("controlImage('"+img_id+"')",10);
    } else {
        if (w > maxWidth) {
            document.getElementById(img_id).width = maxWidth;
        }
    }
}

function checkVirus(param) {
	var local = "/_c21_/pds_v3check?" + param;
	StartWin=window.open("", "StartWindow", "scrollbars=no,toolbar=no,location=no,directories=no,width=400,height=250,resizable=no,mebar=no,left=0,top=0");

	document.pdsV3CheckForm.action = local;
	document.pdsV3CheckForm.target = "StartWindow";
	document.pdsV3CheckForm.submit();
}

function albumViewer(title, url) {
    if (CAFEAPP.ui.DRAGPERMYN=="N") {
		alert('���ܺ��縦 ���� ����\n���콺 �巡�� ������ �����Ǿ� �ֽ��ϴ�' );
		return;
    }
    window.open("/_c21_/album_viewer?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID+"&mgrpid="+CAFEAPP.MGRPID+"&url=" + escape(url) + "&title=" + title, "viewer", "resizable=yes,scrollbars=yes");
}

function fileFilterViewer(url, filekey, realname, v3param) {
	var sw = screen.availWidth;
	var sh = screen.availHeight;

	if (sw > 1280) {
		sw = 1280;
	}

	if (sh > 1024) {
		sh = 1024;
	}

	window.open("", "filefilter_viewer", "width=" + sw + ", height=" + sh + ", resizable=yes, scrollbars=no");

	document.filefilterForm.grpid.value = CAFEAPP.GRPID;
	document.filefilterForm.kind.value = "main";
	document.filefilterForm.url.value = url;
	document.filefilterForm.filekey.value = filekey;
	document.filefilterForm.realname.value = realname;
	document.filefilterForm.v3param.value = v3param;

	document.filefilterForm.action = "/_c21_/filefilter_viewer_hdn";
	document.filefilterForm.target = "filefilter_viewer";
	document.filefilterForm.submit();
}

function open_movie(grpid, moviekey, scrapable) {
	var url = "/_c21_/movie_play_popup?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID+"&is_cafe_button=true&scrapable="+scrapable;
	window.open(url, "MOVIE_VIEWER", "width=858,height=680,resizable=no,scrollbars=no");
}

function deleteArticleSomething(kind) {
    if ( confirm( "������ �����Ͻðڽ��ϱ�?" ) ) {
        document.location.href="/_c21_/article_something_delete_hdn?kind=" + kind + "&grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&dataid="+CAFEAPP.ui.DATAID;
    }
}

function popupSlide() {
	var dest = "/_c21_/album_slide_list?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&page="+CAFEAPP.ui.PAGE_page+"&prev_page="+CAFEAPP.ui.PREV_PAGE+"&firstbbsdepth="+CAFEAPP.ui.FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.LASTBBSDEPTH+"&albumtype=article&slide_type";
	var width = "819";
	var height = "644";

	slide = window.open(dest, "slide", "scrollbars=no,toolbar=no,location=no,directories=no,width="+width+",height="+height+",resizable=yes,mebar=no");
	slide.focus();
}


/* _scrap_info ���� �߰��� script */
function showList(curObj, targetObj){
	var listUL = document.getElementById(targetObj);
    if(curObj.className != 'List_open'){
        curObj.className = 'List_open';
		listUL.style.display = 'block';
    } else {
        curObj.className = 'List_close';
		listUL.style.display = 'none';
	}
}

function getExtImg(ext) {
	switch(ext) {
		case "doc": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_word_s.gif";
		case "xls": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_xls_s.gif";
		case "ppt": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_ppt_s.gif";
		case "pdf": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_pdf_s.gif";
		case "txt": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_txt_s.gif";
		case "hwp": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_hwp_s.gif";
		case "jpg": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_jpg_s.gif";
		case "gif": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_gif_s.gif";
		case "png": case "bmp": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_png_s.gif";
		case "zip": case "alz": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_zip_s.gif";
		case "mp3": case "wav": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_mp3_s.gif";
		case "avi": case "mpeg": case "wmv": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_movie_s.gif";
		case "swf": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_swf_s.gif";
		case "html": return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_html_s.gif";
		default: return "http://i1.daumcdn.net/cafeimg/cf_img2/bbs2/p_etc_s.gif";
	}
}

function setFileTypeImg(filename, idx) {
	var firstpos = filename.lastIndexOf('.')
	var ext = '';

	if (firstpos != -1) {
		ext = filename.substring(firstpos + 1);
		ext = ext.toLowerCase();
	}

	var imgUrl = getExtImg(ext);

	document.getElementById('fileExt' + idx).style.backgroundImage = 'url(' + imgUrl + ')';
}
/* bbs/_reply.html ������ ����ִ� script �� static �κ�*/
function commentViewBtn(tarObj) {
	var commentArea = document.getElementById('commentArea');
	setVisibleComment(commentArea.style.display != "block")
}

function setVisibleComment(bool){
	var commentArea = document.getElementById('commentArea');
	if (bool){
		commentArea.style.display = "block";		
	} else {
		commentArea.style.display = "none";
	}
}

/* _reply.js ���� �̵� - ���� ��� */
function activeCommentView(strType, obj)
{
	setVisibleComment(true);
	document.getElementById('cmttype').value=strType;

    if (strType=="member") {
        if($('member_cmt').className ==  "comment_on txt_point"){
            $('commentArea').style.display = "none";
            $('member_cmt').className = "comment_on txt_point more"
        }
        else{
	    	$('member_cmt').className = "comment_on txt_point"
	    	$('nonemember_cmt').className = "comment_off"
	        $('memberTailTable').style.display = ''; // table
	        $('nomemberTailTable').style.display = "none";        
	        $('commentArea').style.display = "block";
        }
    } else if (strType=="nonemember") {
        if($('nonemember_cmt').className ==  "comment_on txt_point"){
            $('commentArea').style.display = "none";
            $('nonemember_cmt').className = "comment_on txt_point more"    
        }
        else{
	    	$('member_cmt').className = "comment_off"
	    	$('nonemember_cmt').className = "comment_on txt_point"    
	        $('nomemberTailTable').style.display = '';	// table
	        $('memberTailTable').style.display = "none";
	        $('commentArea').style.display = "block";
        }
    }
	CPAGE='';
	goPage(0);
	return false;
}

function poplogin(p){
	var param = CAFEAPP.ui.BBS_WRITE_URI+"?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID+"&fldid="+CAFEAPP.FLDID+"&page="+CAFEAPP.ui.PAGER_page+"&prev_page="+CAFEAPP.ui.PREV_PAGE+"&firstbbsdepth="+CAFEAPP.ui.P_FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.P_LASTBBSDEPTH;
	if (p) { param = p; }
	var encodeParam = encodeBase64(param); //encoding.js
	window.open("/_c21_/poplogin?grpid="+CAFEAPP.GRPID+"&param="+encodeParam,"poplogin", 'width=520,height=630,resizable=no,scrollbars=no');
}

// �б������� ��ũ ������ 
function redefineLink(container) {
	var oDoc = daum.$(container);
	if (!oDoc) { oDoc = daum.$("user_contents"); }
	var aLinks = oDoc.getElementsByTagName("a");
	
	var isFeatured = function() {
		var href = location.href;
		return href.indexOf('bbs_search_read') > 0 && (href.indexOf('livestory') >= 0 || href.indexOf('funstory') >= 0)
	};
	var isNotCafeUrl = function(url) {
		return !/(^#)|(^\/)|(^javascript)|(^http:\/\/[^?]*daum.net)/gi.test(url);
	};
	
	var redefineLinkHandler = function(elLink) {
		var sLinkUrl = elLink.getAttribute("href");
		if (isFeatured() && isNotCafeUrl(sLinkUrl)) {
			elLink.className = 'none';
		}
		
		if (!sLinkUrl) return;
		if (elLink.id=="article_poll_view") return;
		if (sLinkUrl.indexOf('#') > -1 || sLinkUrl.toLowerCase().indexOf('javascript') > -1) return;
		if (elLink.getAttribute("onclick")) return;
		if (elLink.className=="tx-link") return;	//�űԿ����Ϳ� URL ����� ����â�� ���� ��� �߰� _self
		if (elLink.className=="sng-link") return;
		
		elLink.setAttribute("target", "_blank");
	};
	
	for(var i=0; i<aLinks.length; i++) {
		redefineLinkHandler(aLinks[i], false);
	}
}

// �±����� ���͸� �޼ҵ�
function removeRestrictTag(xmp) {
	var templateXmp = daum.$(xmp);
	if (!templateXmp) { templateXmp = daum.$("template_xmp"); }
	if (!templateXmp) return; 
	var after = templateXmp.innerHTML;
	var regStr1 = new RegExp("behavior[ ]*:[ ]*url\(.*\)", "gi");
	var regStr2 = new RegExp("<[ ]*meta(>|[ ]+[^>]*>)", "gi");

	var regStr31 = new RegExp("background[ ]*=[ ]*#[^ ]*", "gi");
	var regStr32 = new RegExp("background[ ]*=[ ]*\'#[^\']*\'", "gi");
	var regStr33 = new RegExp("background[ ]*=[ ]*\"#[^\"]*\"", "gi");

	var regStr4 = new RegExp("textarea[ ]*(.*)template_jst", "gi");

	var regStr5 = new RegExp("<iframe[^<>]*src=[\"']?[^<>]+cafe.daum.net(?!(/_c21_/poll))[^<>]*>[^<]*(<\/iframe>)?", "gi");

	var replaceStr = "[�ȳ�]�±��������ε�ϵ����ʽ��ϴ�.";
	var replaceStrMeta = "<!--[�ȳ�]�±��������ε�ϵ����ʽ��ϴ�-->";

	var after1 = after.replace(regStr1,replaceStr);
    var after2 = after1.replace(regStr2,replaceStrMeta);
    var after31 = after2.replace(regStr31,replaceStr);
    var after32 = after31.replace(regStr32,replaceStr);
    var after33 = after32.replace(regStr33,replaceStr);
    var after4 = after33.replace(regStr4, "br");
	var after5 = after4.replace(regStr5,replaceStr);
    var after6 = refiltering(after5);
    if(window.isSearchRead){
    	after = refiltering(after6);
    } else {
    	after = after6;
    }
    return after;
}

//��ũ�� �Խñۿ����� ��ũ��Ʈ ���͸� ����
function refilteringInfoScript(xmp){
	var templateXmp = daum.$(xmp);
	if (!templateXmp) { templateXmp = daum.$("template_xmp"); }
	if (!templateXmp) return; 
	var after = templateXmp.innerHTML;
	var after1 = refiltering(after);
    after = after1;
    
    if(daum.Browser.ie && after.indexOf('viewMosaic') > -1){
    	after = after.replace(/(.*)(viewMosaic\(.*?\);)(.*)/, "$1 setTimeout(function(){$2}, 1000); $3");    	
    }
    return after;
}

//������, ����̳� ����,��ǰ ���� ÷�ν� ��ũ��Ʈ ���͸� ����
function refiltering(after){
	//������
	if(after.indexOf('txc-moreless') > -1){
 		var moreStr = morelessAdd(after);
 		after = moreStr;
    }
    //����÷��
	if(after.indexOf('http://editor.daum.net/view/info/') > -1 || after.indexOf('http://cia.daum.net/view/') > -1){
		//����÷�� ��ũ��Ʈ Ǯ���ֱ�
	    var regStr1 = new RegExp("<xscript.*http://editor.daum.net/view/info/\\d+.\\d+/(\\D+).js.*</xscript>", "gi");
	    while((arr=regStr1.exec(after)) !=null){
	    	var regStr2 = new RegExp("(<xscript.*http://editor.daum.net/view/info/\\d+.\\d+/"+RegExp.$1+".js.*</xscript>)", "gi");
	    	var replaceStr = refilteringScript(after, regStr2);
	    	if(replaceStr != '' && replaceStr != 'undefined'){
		    	after = replaceStr;
		    }	    	
		}		
	    
	    //���� ���� ÷��
	    if(after.indexOf('xxjavascript:txBuyBgm') > -1 || after.indexOf('xxjavascript:txDownSong') > -1 
			    || after.indexOf('xxjavascript:txListenSong') > -1){				    	
	    	var scriptStr = refilteringMusicScript(after);
	    	after = scriptStr;
	    }
	    
	    //��ǰ ���� ÷��
	    if(after.indexOf('xxjavascript:txShowBigImage') > -1 || after.indexOf('xxjavascript:txAddWishList') > -1){
	   		var productStr = refilteringProductScript(after);
	   		after = productStr;
	    }	
	    
	    //�������� �ٷκ������ ���ο� regular exp ���͸� Ǯ���ֱ�
	    if(after.indexOf('http://cia.daum.net/view/music') > -1){					   		    
	    	var regStr = new RegExp("(<xscript.*http://cia.daum.net/view/music/\\D+/\\d+.js.*</xscript>)", "gi");
	    	while((arr=regStr.exec(after)) !=null){
	    		var musicReplaceStr = refilteringScript(after, regStr);
	    		after = musicReplaceStr;
	    	}
	    }	    	    	 
	}

    return after;
}

function morelessAdd(after) {
	var regStr1 = new RegExp("(<div[^>]*class=\"?txc-moreless\"?[^>]*>)","gi"); //moreless
	var regStr2 = new RegExp("</p></div>", "gi");
	
	var replaceStr1 = "<div class=\"txc-moretext\"><a href=\"javascript:;\" onclick=\"toggleMoreLess(this);\">������</a></div>";
	var replaceStr2 = "<div class=\"txc-lesstext\"><a href=\"javascript:;\" onclick=\"toggleMoreLess(this);\">����</a></div>";
	var replaceStr3 = "<div class=\"txc-morecontents\">";
	
	var arr = regStr1.exec(after);	
	var reStr = RegExp.$1;
	var replaceStr = reStr + replaceStr1 + replaceStr2 + replaceStr3;
	var after1 = after.replace(regStr1, replaceStr);
	var after2 = after1.replace(regStr2, "</p></div></div>");
		
	return after2;
}

function refilteringMusicScript(after) {
	var regStr1 = new RegExp("x*javascript:txBuyBgm", "gi");
	var regStr2 = new RegExp("x*javascript:txDownSong", "gi");
	var regStr3 = new RegExp("x*javascript:txListenSong", "gi");

	var after1 = after.replace(regStr1, "javascript:txBuyBgm");
	var after2 = after1.replace(regStr2, "javascript:txDownSong");
	var after3 = after2.replace(regStr3, "javascript:txListenSong");	
	
	return after3;

}

function refilteringProductScript(after) {
	var regStr1 = new RegExp("x*javascript:txShowBigImage", "gi");
	var regStr2 = new RegExp("x*javascript:txAddWishList", "gi");
	
	var after1 = after.replace(regStr1, "javascript:txShowBigImage");
	var after2 = after1.replace(regStr2, "javascript:txAddWishList");	
	
	return after2;
}

function refilteringScript(str, regStr){
	var regStr2 = new RegExp("xscript", "gi");
	var regStr3 = new RegExp("xxjavascript", "gi");
	
	var after3;	
	var arr = regStr.exec(str);
	var reStr1 = RegExp.$1;
	var after1 = reStr1.replace(regStr2, "script");
	var after2 = after1.replace(regStr3, "javascript");
	after3 = str.replace(reStr1, after2);		
	return after3;
}




function del() {
	var bbsForm = document.getElementById("bbsForm");
	var confirm_msg = "������ �����Ͻðڽ��ϱ�?";
	if(CAFEAPP.ui.IS_HOME_NOTI){
		confirm_msg = "������ �����Ͻðڽ��ϱ�?\n�� ���� 'Ȩ/��ü�Խ��� ������'�� �����Ͻø� �����۵� �Բ� �����˴ϴ�.";
	}else if(CAFEAPP.ui.IS_NOTICE) {
		confirm_msg = "������ �����Ͻðڽ��ϱ�?\n�� ���� '�Խ��� ������'�� �����Ͻø� �����۵� �����˴ϴ�.";
	}
	
    if (isDelAuthorized && confirm(confirm_msg)) {
    	bbsForm.fldid.value=CAFEAPP.FLDID;
        bbsForm.dataid.value=CAFEAPP.ui.DATAID;
        bbsForm.move.value=CAFEAPP.ui.ENCREFERER;
		bbsForm["viewcount" + CAFEAPP.ui.DATAID].value=CAFEAPP.ui.VIEWCOUNT;
		bbsForm["regdt" + CAFEAPP.ui.DATAID].value=CAFEAPP.ui.PLAIN_REGDT;
		bbsForm.grpid.value=CAFEAPP.GRPID;
		bbsForm.mgrpid.value=CAFEAPP.MGRPID;
        bbsForm.action = "/_c21_/bbs_delete_action";
        bbsForm.submit();
    }
}

function spam() {
    if (isSpamAuthorized && confirm("����ó���� �Ͻðڽ��ϱ�?\n�ش� �� ������ ���ÿ� ȸ���� Ȱ������ �˴ϴ�.")) {
    	var bbsForm = document.getElementById("bbsForm");

        bbsForm.fldid.value=CAFEAPP.FLDID;
        bbsForm.dataid.value=CAFEAPP.ui.DATAID;
        bbsForm.move.value=CAFEAPP.ui.ENCREFERER;
        bbsForm["espam" + CAFEAPP.ui.DATAID].value=CAFEAPP.ui.ESPAM;
        bbsForm.grpid.value=CAFEAPP.GRPID;
		bbsForm.mgrpid.value=CAFEAPP.MGRPID;
        bbsForm.action = CAFEAPP.ui.BBS_DELETE_SPAM;
        bbsForm.submit();
	}
}





/* �Ʒ��δ� from bbs_search_read.js */
function goBbsSearchFirst(jobcode,query){
    document.bbsForm.fldid.value=CAFEAPP.FLDID;
    document.bbsForm.query.value = query;
    document.bbsForm.query2.value = query;
    document.bbsForm.jobcode.value = jobcode;
    document.bbsForm.topid.value = CAFEAPP.ui.TOPID;
    document.bbsForm.listval.value = CAFEAPP.ui.LISTVAL;
    document.bbsForm.listdate.value = CAFEAPP.ui.LISTDATE;
    document.bbsForm.grpid.value=CAFEAPP.GRPID;
    document.bbsForm.mgrpid.value=CAFEAPP.MGRPID;
    document.bbsForm.headsort.value=CAFEAPP.ui.HEADSORT_VALUE;
    
    if(CAFEAPP.ui.ISALBUM){
        document.bbsForm.action="/_c21_/album_search?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID;
    } else {
        document.bbsForm.action="/_c21_/bbs_search?grpid="+CAFEAPP.GRPID+"&mgrpid="+CAFEAPP.MGRPID;
    }
    document.bbsForm.submit();
}

/*
 * wrap ���� ���� img ��ҵ鿡 ���� URL ������� id attribute �� �߰��Ѵ�.
 * �̹��� �˻����� ���Ե� ��� �ش� ��ġ�� �ڵ� ��ũ�ѵǵ��� �ϱ� ����
 * ���ε��ʿ� �ö� �̹������� ������� �ϸ�, id�� ���ε��� hash key���� 'A_' prefix�� ���ΰ����� �Ѵ�.
 */
function setImageId(wrap, force) {
	
	var PREFIX = 'A_';			// id prefix
	var UFURL = 'uf.daum.net';	// upload farm domain
	
	if (typeof wrap != 'string') { wrap = 'user_contents'; }
	if (typeof force != 'boolean') { force = false; }
	
	if (location.hash == '') { return; }
	var hash=location.hash.substr(1);
	if (hash == '') { return; }
	var t=document.getElementById(hash);
	
	// �ش� id�� �����ϰ�, ������ �����ϴ°� �ƴϸ� ����, id �Ҵ� ���Ѵ�.
	if (t && !force) { return; }
	
	var oDoc = document.getElementById(wrap);
	if (!oDoc) { return; }
	
	var aImgs = oDoc.getElementsByTagName('img');
	
	var setImageIdHandler=function(img){
		var src=img.src;
		// ���ε��� �̹����� ���
		if (src.indexOf(UFURL) > 0) {
			try {
				// 'A'�� ���� ���ǵ� prefix ��.
				var key=PREFIX+src.substr(src.lastIndexOf('/')+1);
				if (img.setAttribute) {
					img.setAttribute('id', key);
				} else {
					img.id = key;
				}
			} catch (err) {
				if (window.consloe && window.console.log) { console.log(err); }
			}
		}
	}
	for (var i=0; i<aImgs.length; i++) {
		setImageIdHandler(aImgs[i]);
	}
}

function getCommentCount() {
    var comments = document.bbsForm.sequence;
    if(comments == null){
        return 0;
    }
    var checkcnt = 0;
    if(comments.length!=null){
        for(i=0;i<document.bbsForm.sequence.length;i++){
            if(document.bbsForm.sequence[i].checked) ++checkcnt;
        }
    }else if(comments.checked){
            checkcnt = 1;
    }else{
        checkcnt = 0;
    }
    return checkcnt;
}

//��ü����/����
function toggleAll() {
    toggleCheckboxes(document.bbsForm.sequence);
}

function toggleCheckboxes(combos) {
    if(!combos) {
        return;
    }

    if(combos.length > 0){
        for(i = 0; i < combos.length; i++)
            combos[i].checked= !combos[i].checked;
    }
    else
        combos.checked=!combos.checked;
}


function reloadEmbedTags() {
    if(daum.Browser.chrome) {
        var embedTags = daum.$$("embed");
        for(var i=0; i<embedTags.length; i++) {
            embedTags[i].style.display = embedTags[i].style.display;
        }
    }
}
