ReplyEditor = {};
ReplyEditor = {};

/**
* 댓글의 쓰기/수정/삭제, 에디터 초기화 기능을 포함한 클래스
* @Singleton
*/
Reply = {
	HIGHLIGHT_COLOR: "ffff99",
	init: function(dataId) {
		// DWR 통신표기 레이어 초기화
		daum.Event.addEvent(window, "load", function() {
			DWRErrorController.install();
			DWRConnectionController.install();
		});
		// CAFEAPP 데이터 파싱
		this.parseFormData(dataId);
		// 댓글용 에디터 초기화
		if (!ReplyEditor[dataId]) {
			ReplyEditor[dataId] = {};
			ReplyEditor[dataId].head = new Memo.Editor("replyWrite-"+dataId, {mode:"reply", onsubmit:Reply.submit, dataId:dataId});
			ReplyEditor[dataId].tail = new Memo.Editor("_cmt_reply_editor-"+dataId, {mode:"reply", dataId:dataId, hiddenForm:true});
			ReplyEditor.getCurrentEditor = function() {
				if (ReplyEditor[dataId].tail.$form.style.display == 'block') {
					return ReplyEditor[dataId].tail;
				}
				return ReplyEditor[dataId].head;
			}
		}
		this.setEditorStatus(dataId, null, ReplyEditor[dataId].head);
		this.setEditorStatus(dataId, null, ReplyEditor[dataId].tail);
	},
	parseFormData: function(dataId) {
		var $commentData = Sizzle("input", daum.$("commentData-" + dataId));
		var data = {};
		for (var i = 0, len = $commentData.length; i < len; i++) {
			data[$commentData[i].name] = $commentData[i].value;
		}
        
		if (!CAFEAPP.longtail) {
            CAFEAPP.longtail = {};  
        }
        
		CAFEAPP.longtail[dataId] = {
			POLL_URI : data.POLL_URI,
			POLL_active : data.POLL_active,
			CONTENTVAL : data.CONTENTVAL,
			DATAID : data.DATAID,
			COMMENT_FLOODED : data.COMMENT_FLOODED == "true",
			ESPAM : data.ESPAM,
			CPAGE : data.CPAGE || 1,
			PAGE_COUNT : data.PAGE_COUNT || 1,
			F_CDEPTH : data.F_CDEPTH,
			L_CDEPTH : data.L_CDEPTH,
			N_CDEPTH : data.N_CDEPTH,
			RECENT_MYFLDDATASEQ : data.RECENT_MYFLDDATASEQ,
			OPENED_SEQ : data.OPENED_SEQ,
			HAS_PERMISSION: data.HAS_PERMISSION == "true",
			PLAIN_REGDT: data.PLAIN_REGDT
		};
		CAFEAPP.PLAIN_REGDT = data.PLAIN_REGDT
		CAFEAPP.longtail.CMTTYPE 				= data.CMTTYPE;
		CAFEAPP.longtail.FOLDER_cmtTexticonyn 	= data.FOLDER_cmtTexticonyn == "true";
		CAFEAPP.longtail.IS_POLL_BOARD			= data.IS_POLL_BOARD == "true";
		CAFEAPP.longtail.IS_BBS_SEARCH_READ		= data.IS_BBS_SEARCH_READ == "true"; //@deprecated
		CAFEAPP.longtail.IS_IMSI				= data.IS_IMSI == "true";
		CAFEAPP.longtail.IS_QABOARD				= data.IS_QABOARD == "true";
		CAFEAPP.longtail.IS_NO_AUTH_SIMPLEID	= data.IS_NO_AUTH_SIMPLEID == "true";
	},
	getList: function(dataId, targetPage, cdepth, isMovedPage, isSearched) {
        var isNotCurrentPage = CAFEAPP.longtail[dataId].CPAGE != targetPage;
        var isLastPage = CAFEAPP.longtail[dataId].PAGE_COUNT == targetPage;
        
        if (isNotCurrentPage || isLastPage) {
			if (!cdepth) {
				if (CAFEAPP.longtail.IS_POLL_BOARD) {
					if (targetPage == "N") {
						cdepth = CAFEAPP.longtail[dataId].L_CDEPTH;
					} else if (targetPage == "P") {
						cdepth = CAFEAPP.longtail[dataId].F_CDEPTH;
					}
				} else {
					if (CAFEAPP.longtail[dataId].CPAGE < targetPage) {
						cdepth = CAFEAPP.longtail[dataId].L_CDEPTH;
					} else {
						cdepth = CAFEAPP.longtail[dataId].F_CDEPTH;
					}
				}
			}

			ShortComment.getList(
				CAFEAPP.FLDID,
				dataId,
				CAFEAPP.longtail[dataId].CPAGE,
				targetPage || null,
				cdepth,
				null,
				CAFEAPP.longtail.IS_IMSI,
				false,
				false,
				this.getResultList.bind(this, dataId, targetPage, isMovedPage, isSearched)
			);
		} else {
			// 같은 페이지를 호출할 경우 마지막 페이지에서 cdepth 를 가져온다.
			ShortComment.getList(
				CAFEAPP.FLDID,
				dataId,
				CAFEAPP.longtail[dataId].CPAGE,
				null,
				null,
				null,
				CAFEAPP.longtail.IS_IMSI,
				false,
				false,
				function(dataId, targetPage, result) {
					try {
						var cdepth_match = result.match(/name="F_CDEPTH"(.*)value="(.*)"/gi);
						if (!cdepth_match) return;
						var cdepth = cdepth_match[0].replace(/(.*)value="(.*)"/gi, "$2");
						CAFEAPP.longtail[dataId].CPAGE = CAFEAPP.longtail[dataId].PAGE_COUNT;
						this.getList(dataId, targetPage, cdepth);
					} catch(e) { }
				}.bind(this, dataId, targetPage)
			);
		}
		Reply.PV.sendData(dataId, { cpage: CAFEAPP.longtail[dataId].CPAGE });
	},
    moveScrollAfterRenderCommentList: function (isMovedPage, isSearched, dataId) {
        if (isMovedPage) {
            var content = daum.$("primaryContent");
            if (content) {
                var coords = daum.Element.getCoords(content);
                var windowSize = daum.Browser.getWindowSize();
                window.scrollTo(0, coords.bottom - windowSize.height);
            } else {
                window.scrollTo(0, 10000); //페이징시 페이징 버튼이 있는 화면의 맨 끝으로 스크롤 이동.
            }
        } else if (isSearched) {
            var content = daum.$("commentArea-" + dataId);
            if (content) {
                var coords = daum.Element.getCoords(content);
                window.scrollTo(0, coords.top);
            }
        }
    },

	convertTextToDOM: function (dataId, result) {
		var commentPagingDiv = daum.$("commentPagingDiv-" + dataId);
		var temp = commentPagingDiv.cloneNode(true);
		temp.innerHTML = result;
		commentPagingDiv.parentNode.replaceChild(temp, commentPagingDiv);
	},

	getResultList: function(dataId, targetPage, isMovedPage, isSearched, result) {
		if (!result || typeof result === "undefined") return;
        
        this.exitEditMode(dataId);
		this.convertTextToDOM(dataId, result);
		this.moveScrollAfterRenderCommentList(isMovedPage, isSearched, dataId);

		this.parseFormData(dataId);
		if (typeof targetPage != 'undefined') { // 현재 페이지 유지를 위해. 글작성시에는 undefined로 넘어오기 때문에 막는다.
			CAFEAPP.longtail[dataId].CPAGE = targetPage;
		}
		var cmtCnt = daum.$("cmtCnt");
		var cmtCnt_dataid = daum.$("cmtCnt-"+dataId);
		if (cmtCnt) {
			cmtCnt.innerHTML = daum.$("_cmt_count-"+dataId).value;
		} else if (cmtCnt_dataid) {
			cmtCnt_dataid.innerHTML = daum.$("_cmt_count-"+dataId).value;
		}
		var cmtCnt_g = daum.$("cmtCnt_g");
		if (cmtCnt_g) {
			cmtCnt_g.innerHTML = daum.$("_cmt_guest_count-"+dataId).value;
		}
		if (this.recentSeq) {
            var commentId = dataId + "-" + this.recentSeq;
            this.highlightComment(commentId);
			this.recentSeq = null;
		}

		// kakao emoticon redraw
        kakaoEmoticonUpdate();
	},
    search: function(el, dataid, item, query, targetPage, isMovedPage){
		var searchBox = (el && (el.className == "btn_search" || el.className == "suggest")) ? el.parentNode : null;

		var dataid = dataid;
		if (searchBox && !item){
			var item = "cmtContents";
			var selects = $$("select", searchBox);
			for(var i=0; i<selects.length; i++){
				if(selects[i].name == "item"){
					item = selects[i].value;
				};
			};

			var query = daum.String.trim(daum.$C(searchBox, "query")[0].value);
			if (query == "") {
				alert('검색어를 입력해 주세요');
				return false;
			}

			var nickname = "";
			if (item == "cmtNicknameNgram"){
				nickname = query;
//				query = "";
			}

		}else{
			var nickname = "";
			if (item == "cmtNicknameNgram"){
				nickname = query;
				query = "";
			}
		}

		var targetPage = typeof targetPage == 'undefined' ? 1 : targetPage;
		ShortComment.search({
			fldid:CAFEAPP.FLDID,
			dataid:dataid,
			item:item,
			query:query,
			nickname:nickname,
			open:false,
			imsi:CAFEAPP.longtail.IS_IMSI,
			pagenum:targetPage
			},
			this.getResultList.bind(this, dataid, targetPage, isMovedPage, true) // callback
		);
		Reply.PV.sendData(dataid, { cpage: CAFEAPP.longtail[dataid].CPAGE });

	},
    showBeforeHideList: function(){
        DoubleSelectedLinkManager.showBeforeHideList();
    },
    submit: function() {
		var editor = this;
		var commentWriteData = {
			fldid: CAFEAPP.FLDID,
			dataid: editor.dataId,
			pardataRegdttm: CAFEAPP.ui.PLAIN_REGDT,
			comment: editor.$textarea.value,
			texticon: editor.isTexticon,
			hidden: editor.isHidden,
			imageURL: editor.imageUrl,
			imageName: editor.imageName,
			imageSize: editor.imageSize,
            seq: editor.seq || null,
            parseq: editor.parseq || null,
            feedbackseq: editor.feedbackseq || null,
            
			snsServiceNames : editor.getSelectedSnsNames(),
			snsPrefix : CAFEAPP.ui.sns.snsPrefix,
			snsLink : CAFEAPP.ui.sns.snsLink,
			snsMetatype : CAFEAPP.ui.sns.snsMetatype,
			snsMetakey : CAFEAPP.ui.sns.snsMetakey,
			snsImagepath : CAFEAPP.ui.sns.snsImagePath,
			snsCaption : CAFEAPP.ui.sns.snsCaption
		};

		
		ShortComment.write(commentWriteData, function(editor, result){
            if (result && result != -1) {
                var editorTail = ReplyEditor[editor.dataId].tail;	// 작성중이던 수정/답글 에디터 원상 복귀
                var $commentArea = daum.$E("commentDiv-" + editorTail.dataId);
                daum.$E(editorTail.$form).hide();
                $commentArea.appendChild(editorTail.$form);
                editor.clear();

                var isSearchResult = (daum.$("readcmt_search_result"))?true:false;

                if(isSearchResult){
                    if(confirm("원 댓글 목록으로 이동하시겠습니까?")){
                        if (editor == editorTail) {		// 댓글에 답글 기록
                            Reply.getList(editor.dataId, CAFEAPP.longtail[editor.dataId].CPAGE);
                        } else {		// 일반 기록, 최근 등록 댓글로 이동
                            Reply.getList(editor.dataId);
                        }
                    }else{
                        Reply.exitEditMode(editor.dataId);
                    }
                }else{
                    if (editor == editorTail) {		// 댓글에 답글 기록
                        Reply.getList(editor.dataId, CAFEAPP.longtail[editor.dataId].CPAGE);
                    } else {		// 일반 기록, 최근 등록 댓글로 이동
                        Reply.getList(editor.dataId);
                    }
                }
                this.recentSeq = result;	// 하이라이팅 대상 저장
            }

			levelupNotiLayer.checkAndShowLayer();
        }.bind(Reply, editor));
	},
    
    // exitEditMode이 호출되는 경우
    // editor의 cancel를 누른 경우와 댓글을 수정한 경우이다.
	exitEditMode: function(dataId) {
        var isCancelEvent = !dataId ? true : false;      

        if (isCancelEvent){
            MentionManager.hideNominateName();
            dataId = this.dataId;	// dataId 명시 없을 경우 에디터 콜백통해 가져온 dataId 사용
        } 
        if (!ReplyEditor[dataId].tail) return;
		ReplyEditor[dataId].tail.hide();
		Reply.showBeforeHideList();
	},
	goPage: function(pageNumber, dataId) {
		Reply.getList(dataId, pageNumber, undefined, true, undefined);
	},
	goSearchPage: function(pageNumber, dataId, item, query) {
		Reply.search(null, dataId, item, query, pageNumber, true);
	},
    
    

    showReplyForm: function(dataId, seq, isHidden, parseq, nickname) {
        var editor = ReplyEditor[dataId].tail;
		
        if (!editor) {
            return;
        }

        editor.parseq = parseq == 0 ? seq : parseq;             // 'parseq == 0'은 부모를 의미, 'parseq != 0'는 자식을 의미
        
        var commentId = dataId + "-" + seq;
        var replyEl = daum.$("_cmt-" + commentId);
        var commentMentionId = "_cmt_write_mention-" + dataId;
        var commentButtonsId = "_cmt_button-" + commentId;
        
        
		replyEl.appendChild(editor.$form);
        editor.onsubmit = this.submit;
		editor.oncancel = this.exitEditMode;

		editor.changeButtonType("reply");
        this.setTexticonView(editor);
		editor.$menuHidden.hide();
        editor.isHidden = false;
		editor.show();

        editor.feedbackseq = parseq != 0 ? seq : null;          // 지명 댓글인 경우 사용(자식 댓글인 경우는 지명댓글임을 의미하므로 seq)

		this.setEditorStatus(dataId, null, editor);
        
        DoubleSelectedLinkManager.hideArgumentButLastArgumentShow(commentButtonsId, commentMentionId);
        MentionManager.showMentionNameForWrite(commentId, parseq, nickname);

		if(isHidden) {
			editor.isHidden = true;
			editor.setControlValue({'isHidden': true});
		};
        
        try{    
            editor.$textarea.focus();
            editor.$textarea.setSelectionRange(0, 0);
        } catch(e){}
    },

	showModifyForm: function(dataId, seq) {
		if (!ReplyEditor[dataId].tail) return;
		var data = {
			fldid: CAFEAPP.FLDID,
			dataid: dataId,
			seq: seq
		};
		ShortComment.read(data, true, function(dataId, seq, result){
            var commentId = dataId + "-" + seq;
            var $cmt_wrap = daum.$("_cmt_wrapper-" + commentId);
            var $cmt_image = daum.$("_cmt_attach_image-" + commentId);
            var $cmt_video = daum.$("_cmt_attach_video-" + commentId);
            var $cmt_contents = daum.$("_cmt_contents-"+commentId);
            var $cmt_buttons = daum.$("_cmt_button-"+commentId);
            var $cmt_modify_mention = $("_cmt_write_mention-"+dataId);

            var editor = ReplyEditor[dataId].tail;

            var $cmt = daum.$("_cmt-" + commentId);
            $cmt.appendChild(ReplyEditor[dataId].tail.$form);

            this.setTexticonView(editor);

            editor.show();
            DoubleSelectedLinkManager.hideArgumentButLastArgumentShow($cmt_wrap, $cmt_image, $cmt_video, $cmt_contents, $cmt_buttons, $cmt_modify_mention);
            MentionManager.showMentionNameForModify(commentId, result.mentionnickname);

            editor.onsubmit = this.modify;
            editor.oncancel = this.exitEditMode;
            editor.changeButtonType("modify");

            editor.seq = result.seq;
            editor.parseq = result.parseq;

            editor.$menuHidden.show();
            editor.isHidden = result.hidden;
            editor.changeHiddenView(result.hidden);

            editor.isTexticon = result.texticon;
            if (Memo.Layer.Setting) {
                Memo.Layer.Setting.setTexticonCheck(result.texticon);
            }
            editor.setComment(result.comment);

            var data = {};
            // 이모티콘이면 attachKey에 이모티콘URI를 저장하고
			// 이모티콘 임시경로를 imageUrl에 전달한다.
            if (result.imageURL && result.imageURL.startsWith("emoticon://")) {
				data.attachKey = result.imageURL;
				for (var i = 0; i<$cmt_image.childNodes.length; i++) {
					if ($cmt_image.childNodes[i].src) {
                        data.imageUrl = $cmt_image.childNodes[i].src;
                        break;
                    }
                }
			} else {
            	data.imageUrl = result.imageURL;
			}
            data.imageName = result.imageName;
            data.imageSize = result.imageSize;
            data.imageUrl && editor.setPreviewImage(data);

            SNSManager.hideSnsBar(editor);

        }.bind(Reply, dataId, seq));
	},
    
	modify: function() {
		if (!ReplyEditor[this.dataId].tail) {
            return;
        }
        // 이모티콘 변경없이 수정요청이 오면 attachKey를 imageUrl에 할당.
		if (this.imageUrl && this.attachKey && this.attachKey.startsWith('emoticon://')) {
			this.imageUrl = this.attachKey;
		}
		var commentModifyData = {
			fldid: CAFEAPP.FLDID,
			dataid: this.dataId,
			comment: this.$textarea.value,
			texticon: this.isTexticon,
			hidden: this.isHidden,
			imageURL: this.imageUrl,
			imageName: this.imageName,
			imageSize: this.imageSize,
			seq: this.seq || "",
			parseq: this.parseq || "",

			snsServiceNames : this.getSelectedSnsNames(),
			snsPrefix : CAFEAPP.ui.sns.snsPrefix,
			snsLink : CAFEAPP.ui.sns.snsLink,
			snsMetatype : CAFEAPP.ui.sns.snsMetatype,
			snsMetakey : CAFEAPP.ui.sns.snsMetakey,
			snsImagepath : CAFEAPP.ui.sns.snsImagePath,
			snsCaption : CAFEAPP.ui.sns.snsCaption
		};
		ShortComment.modify(commentModifyData, function(result) {
            if (!result) {
                alert("댓글 수정을 실패하였습니다.");
                return;
            }

            this.exitEditMode(result.dataid);

            var commentId = result.dataid + "-" + result.seq;
            var attachType = result.attachtype;
            var imageURL = result.imageURL;

            var commentWrapEl = daum.$("_cmt_wrapper-" + commentId);

            var hasAttach = imageURL || attachType == "MD" || attachType == "MY";
            if (hasAttach) {
                daum.Element.addClassName(commentWrapEl, "attached_wrapper");
            } else {
                daum.Element.removeClassName(commentWrapEl, "attached_wrapper");
            }

            var contentTagString = CommentMarkupFactory.makeContentHTML(commentId, result.hidden, result.mentionnickname, result.mentionuserid, result.comment);

            var attachTagString = "";
            if (imageURL) {
            	if (imageURL.startsWith('emoticon://')) {
                    attachTagString = CommentMarkupFactory.makeAttachEmoticonHTML(commentId, imageURL);
				} else {
                    attachTagString = CommentMarkupFactory.makeAttachImageHTML(result.sticker, commentId, imageURL);
                }
            }else if (attachType == "MD" || attachType == "MY"){
                attachTagString = CommentMarkupFactory.makeAttachVideoHTML(commentId, attachType, result.attachkey);
            }

            commentWrapEl.innerHTML = contentTagString + attachTagString;

			kakaoEmoticonUpdate();
            this.highlightComment(commentId);
        }.bind(Reply));
	},

    /* @submit */
    remove: function(dataId, seq) {
        if (!confirm("정말 삭제하시겠습니까?")) {
            return;
        }

        var commentRemoveData = {
            fldid: CAFEAPP.FLDID,
            dataid: dataId,
            seq: seq
        };

        ShortComment.remove(commentRemoveData, function(dataId, result){
            if (result) {
                Reply.getList(dataId, CAFEAPP.longtail[dataId].CPAGE);
            } else {
                alert("댓글 삭제를 실패하였습니다.");
            }

        }.bind(Reply, dataId));
    },


    highlightComment: function (id) {
        Memo.Util.highLightFadeOut("_cmt-" + id, this.HIGHLIGHT_COLOR);
    },
    
    
	activeCommentView: function(dataId) {
		var $commentArea = $E("commentArea-"+dataId);
		$commentArea.toggle();
	},
	activeCommentTemplate: function(dataId, isCmt1PageView) {		// 댓글영역 동적 로딩 (QnA게시판)
		var $commentAreaWrap = $E("commentAreaWrap-"+dataId);
		var $commentArea = $E("commentArea-"+dataId);
		if (!$commentArea) {
			ShortComment.getList(CAFEAPP.FLDID, dataId, 0, null, null, null, false, true , isCmt1PageView, function(result) {
				try{
					$commentAreaWrap.innerHTML = result;
					$commentAreaWrap.show();
					delete(ReplyEditor[dataId]);
					Reply.init(dataId);
				}catch(e){
				}
				// kakao emoticon redraw
                kakaoEmoticonUpdate();
				setTimeout(sendSNSUtil.applyAllows, 500);
			});
		} else {
			$commentAreaWrap.toggle();
		}
	},
	setEditorStatus: function(dataId, cmtType, editor) {
		var editor = editor || ReplyEditor[dataId].head;
		var cmtType = cmtType || CAFEAPP.longtail.CMTTYPE;

        SNSManager.updateSnsVisible(editor, dataId);

		if (CAFEAPP.longtail[dataId].COMMENT_FLOODED) {
			editor.disable(Memo.Message.COMMENT_FLOODED);
			return;
		}
		if (!CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID) {
			editor.disable(Memo.Message.NOT_LOGIN);
			daum.Event.addEvent(editor.$textarea, "click", this.openLoginWindow);
			return;
		}
		if (CAFEAPP.IS_NO_AUTH_SIMPLEID) {
			editor.disable(Memo.Message.NO_AUTH_SIMPLEID);
			daum.Event.addEvent(editor.$textarea, "click", this.openSimpleLoginWindow);
			return;
		}
		if (cmtType == "member") {
			editor.$menuPhoto && editor.$menuPhoto.show();
			editor.$menuHidden && editor.$menuHidden.show();

			if (!CAFEAPP.longtail[dataId].HAS_PERMISSION) {
				var denyPermMessageTemplate = Memo.Message.DENY_PERMISSION;
				editor.disable(denyPermMessageTemplate.replace('{0}', CAFEAPP.MEMBER_ROLENAME).replace('{1}', CAFEAPP.FLD_SHRTCMTPERMROLENAME));
				return;
			}
		} else if (cmtType == "nonemember") {
			editor.$menuPhoto && editor.$menuPhoto.hide();
			editor.$menuHidden && editor.$menuHidden.show();
		} else {
			editor.disable(Memo.Message.DENY_ACCESS);
			return;
		}

        SNSManager.updateSnsVisible(editor, dataId);

		editor.enable();

        if (cmtType == "nonemember") {
            //손님 댓글 신규 쓰기 제한.
            ReplyEditor[dataId].head.disable(Memo.Message.GUESTREPLY_READONLY);
        }

		this.setTexticonView(editor);
		editor.applyPlaceHolderStyle();
		editor.setComment(Memo.Message.DEFAULT_COMMENTS);
	},

	setTexticonView: function(editor) {
		var useTexticon = CAFEAPP.longtail.FOLDER_cmtTexticonyn;
		if (useTexticon) {
			editor.$menuSetting && editor.$menuSetting.show();
		} else {
			editor.$menuSetting && editor.$menuSetting.hide();
		}
	},
	openLoginWindow: function() {
		window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID, 'poplogin', 'width=520,height=630,resizable=no,scrollbars=no');
	},
	openSimpleLoginWindow: function() {
		if(window.confirm("간편아이디는 회원 인증 후 글작성이 가능합니다.\n회원 인증 페이지로 이동하시겠습니까?")){
			window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID + '&checksimpleid=Y', 'poplogin', 'width=520,height=630,resizable=no,scrollbars=no');
		}
	}
};




var SNSManager = {

    updateSnsVisible: function(editor, dataId){
        var isVisibleGuestCmt = false;
        if(daum.$("nonemember_cmt")){
            isVisibleGuestCmt = daum.Element.hasClassName(daum.$("nonemember_cmt"), "comment_on");
        }
        
        if(isVisibleGuestCmt && CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID){
            SNSManager.showSnsBar(editor);
        } else {
            if(!CAFEAPP.longtail[dataId].HAS_PERMISSION){
                SNSManager.hideSnsBar(editor);
            } else {
                SNSManager.showSnsBar(editor);
            }
        }
    },
    
    showSnsBar : function(editor){
        var elBars = daum.$$(".bar2", editor.$controls);
        for(var i = 0; i < elBars.length; i++){
            daum.Element.show(elBars[i]);
        }
    },

    hideSnsBar : function(editor){
        var elBars = daum.$$(".bar2", editor.$controls);
        for(var i = 0; i < elBars.length; i++){
            daum.Element.hide(elBars[i]);
        }
    }
}

// 답글 -> 답글 또는 수정 -> 수정시 이전 폼을 닫고 현재의 댓글에 폼을 보여주는 역할을 함
var DoubleSelectedLinkManager = {
    lastHideList: [],

    // 이전 hide된 elements가 있다면 복구하고, 현재의 elements는 숨긴다. 이때, @지명자가 있는 경우는 보여준다.
    hideArgumentButLastArgumentShow: function (/* arguments<element id> */) {
        this.showBeforeHideList();                           // hide되었던 list를 다시 보여준다.                

        for (var i = 0, len = arguments.length - 1; i < len; i++) {
            this.hideCurrentList(arguments[i]);
        }

        this.showNominateName(arguments[arguments.length - 1]);
    },
    hideCurrentList: function (miniMenuId) {
        if (miniMenuId) {
            this.lastHideList.push(miniMenuId);
            daum.Element.hide(miniMenuId);
        }
    },
    showNominateName: function (mentionId) {
        this.lastHideList.push(mentionId);
        daum.Element.show(mentionId);
    },
    showBeforeHideList: function () {
        for (var i = 0, len = this.lastHideList.length; i < len; i++) {
            var el = daum.$(this.lastHideList[i]);
            if(el) {
                if (this.lastHideList.length - 1 == i) {
                    daum.Element.hide(el);
                } else {
                    daum.Element.show(el);
                }
            } 
        }
            
        this.lastHideList = [];
    }
};

// 답글 또는 수정 선택시 상황에 따라 @지명자를 보여주는 Manager
// _cmt_write_mention와 modify로 나눈 이유는 modify는 작성된 엘리먼트를 날리고 그 위치에 @지명자를 입력하여야 하는데 이 때 wapper를 숨길경우 그안의 요소도 숨겨지므로
var MentionManager = {
    commentId: null,
    mentionEl: null,

    showMentionEl: function (commentId) {
        var dataId = commentId.split('-')[0];
        this.mentionEl = daum.Element.show("_cmt_write_mention-" + dataId);
    },

    showMentionNameForWrite: function (commentId, parseq, nickname) {
        this.showMentionEl(commentId);
        
        if (parseq == 0) {// 지명댓글이 아닌 경우
            this.hideNominateName("write", commentId);
            return;
        }

        this.setMentionName(nickname);
    },

    showMentionNameForModify: function (commentId, nickname) {
        this.showMentionEl(commentId);
        
        if (nickname == "") {// 지명댓글이 아닌 경우
            this.hideNominateName("modify", commentId);
            return;      
        }

        this.setMentionName(nickname);
        daum.Element.show("_cmt_wrapper-" + commentId);
    },

    setMentionName: function (nickname) {
        this.mentionEl.innerHTML = "@" + nickname;
    },

    hideNominateName: function (actionType, commentId) {
        if (actionType == "modify") {
            daum.Element.show("_cmt_wrapper-" + commentId);
        }

        daum.Element.hide(this.mentionEl);
    }
};

/**
* 전체선택/일괄삭제/스팸처리 같이 관리자가 일괄로 처리하는 부분을 담당
* @Singleton
*/
Reply.Admin = {
	selectAll: function(dataId) {
		var oCheckbox = this.getCheckbox(dataId);
		var needCheck = oCheckbox.list.length != oCheckbox.checkCount;
		for (var i=0,len=oCheckbox.list.length; i<len; i++) {
			oCheckbox.list[i].checked = needCheck;
		}
	},
	unSelectAll: function(){
		var oCheckbox = this.getCheckbox(this.dataId);
		for (var i=0,len=oCheckbox.list.length; i<len; i++) {
			oCheckbox.list[i].checked = false;
		}
	},
	remove: function(dataId) {
		var oCheckbox = this.getCheckbox(dataId);
		if (oCheckbox.checkCount == 0) {
			alert("삭제할 댓글을 선택해 주세요.");
			return;
		}
		if (!confirm("정말 삭제 하시겠습니까?")) return;
		ShortComment.removeList(CAFEAPP.FLDID, dataId, oCheckbox.seqList, Reply.getList.bind(Reply, dataId, CAFEAPP.longtail[dataId].CPAGE));
	},
	setSpam: function(dataId) {
		var oCheckbox = this.getCheckbox(dataId);
		var checkCount = oCheckbox.checkCount;
		if (checkCount <= 0) {
			alert("스팸처리 대상을 선택하세요.");
			return;
		} else if(checkCount > 10) {
			alert("댓글 스팸 신고는 한번에 10건까지 가능합니다.\n번거로우시더라도 다시 해주세요.");
			return;
		}
		if (!confirm("해당 댓글 삭제와 동시에 회원은 활동중지되며, 손님의 경우에는 해당 댓글만 삭제됩니다.")) return;
		ShortComment.removeListForSpam(CAFEAPP.FLDID, dataId, oCheckbox.seqList, Reply.getList.bind(Reply, dataId, CAFEAPP.longtail[dataId].CPAGE));
	},
	goModifyLvl: function(grpid, roleCode, dataId){
		var oCheckbox = this.getCheckbox(dataId);
		var checkCount = oCheckbox.checkCount;
		var userids = oCheckbox.useridList;

		if (checkCount <= 0){
			alert("사용자를 선택해 주세요.");
	    	return false;
		}
		for(var i=0,len=userids.length;i<len;i++){
			if(userids[i] == CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID){
				alert("본인을 등급변경할 수 없습니다. 본인이 작성한 게시물을 선택 해제 후 등급변경을 해 주세요.");
            	return false;
			}
		}
		// 익명게시판에는 게시글 작성자의 등급레이어가 없음을 이용.
		if(!daum.$("gradeLayer")){
			alert("익명 게시물을 등록한 사용자를 등급변경할 수 없습니다. 익명 게시물을 선택 해제 후 등급변경을 해 주세요.");
            return false;
		}

		this.dataId = dataId;
		WIMemberService.changeMemberLevel(grpid, roleCode, userids, {
			callback:(function(data) {
				if(data == true){
					alert("회원 등급이 변경되었습니다.");
					this.unSelectAll();
				}
			}).bind(this)});
	},
	getCheckbox: function(dataId) {
		var checkboxs = Sizzle("#commentArea-" + dataId + " input:checkbox[NAME=sequence]");
		var seqList = [];
		var useridList = [];
		var cnt = 0;
		for (var i=0,len=checkboxs.length; i<len; i++) {
			if (checkboxs[i].checked) {
				cnt++;
				var values = checkboxs[i].value.split(":::");
				seqList.push(values[0]);
				useridList.push(values[1]);
			}
		}
		return { list:checkboxs, checkCount:cnt, seqList:seqList, useridList:useridList};
	}
};


var CommentMarkupFactory = {
    makeContentHTML: function (commentId, isHiddenComment, mentionNickname, mentionUserid, commentContent) {
        var inner = "";
        inner = '<span id="_cmt_contents-' + commentId + '" class="comment_contents">';
        if (isHiddenComment) {
            inner += '<img src="http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif" class="icon_lock2 vam" height="11" width="11" alt="비밀댓글" /> ';
        }

        var escapedMentionNickName = escape(mentionNickname);
        var showSideView = 'showSideView(this, "' + mentionUserid + '", "' + escapedMentionNickName + '"); return false;"';
        inner += '<a href="#" onclick="' + showSideView + '" class="b"><span class="append_mention_nicknames text_counter txt_point b">' + mentionNickname + '</span></a>';
        inner += " ";
        inner += commentContent.replaceAll("\n", "<br \>") + "</span>";
        return inner;
    },

    makeAttachImageHTML: function (isSticker, commentId, imageURL) {
        var imageAttachTagString = "";
        if (isSticker) {
            imageAttachTagString = '<div id="_cmt_attach_image-' + commentId + '" class="longtail_attach_image" style="display:block;">';
            imageAttachTagString += '<a href="#" onclick="return false;" class="sticker">';
            imageAttachTagString += '<img src="' + imageURL + '" alt="" /></a></div>';
        } else {
            imageAttachTagString = '<div id="_cmt_attach_image-' + commentId + '" class="longtail_attach_image" style="display:block;">';
            imageAttachTagString += '<a href="#" onclick="Memo.Util.showImage(this); return false;" class="line_sub"><span>확대</span>';
            imageAttachTagString += '<img src="' + imageURL.replace("/image/", "/C120x120/") + '" width="120" height="120" alt="" /></a></div>';
        }
        return imageAttachTagString;
    },

    makeAttachEmoticonHTML: function (commentId, attachKey) {
    	var strArray = attachKey.split('/');
    	var dataId = strArray[2];
        var resourceId = strArray[3];
        var itemSubType = strArray[4];

        var imageAttachTagString;
		imageAttachTagString = '<div id="_cmt_attach_image-' + commentId + '" class="kakao_emoticon e_cover">';
		imageAttachTagString += '<img src="//mk.kakaocdn.net/dn/emoticon/static/images/sdk/no_img.png" data-id="'+dataId+'" data-idx="'+resourceId+'" data-type="'+itemSubType+'" class="thumb_img" width="120" height="120" alt="" /></div>';
        return imageAttachTagString;
    },
    
    makeAttachVideoHTML: function (commentId, attachType, attachKey) {
        var videoAttachTagString = "";
        videoAttachTagString = "<div id=\"_cmt_attach_video-" + commentId + "\" class=\"longtail_attach_video\" style=\"display:block;\">";
        videoAttachTagString += "<a onclick=\"Memo.Util.showVideo(this, '" + attachType + "','" + attachKey + "'); return false;\" href=\"#\">";
        videoAttachTagString += this.makeVideoThumbnailHTML(attachType, attachKey);
        videoAttachTagString += "<p class=\"play_icon\">PLAY</p><span>확대</span></a></div>";
        return videoAttachTagString;
    },

    makeVideoThumbnailHTML: function(attachType, attachKey) {
    var videoThumbnailUrl;

    if (attachType == "MD") {
        videoThumbnailUrl = "http://flvs.daum.net/viewer/MovieThumb.do?postfix=.mini&vid=" + attachKey;
    } else if (attachType == "MY") {
        videoThumbnailUrl = "http://img.youtube.com/vi/" + attachKey + "/1.jpg";
    }
    if (videoThumbnailUrl) {
        return '<img alt="첨부 이미지" src="' + videoThumbnailUrl + '" />';
    }
    return '';
}
};

/**
* 댓글 비동기처리 시 pv 집계를 위한 클래스
* @Singleton
*/
Reply.PV = {
	url: "http://cafe.daum.net/_pageview/_cmtinfo.html",
	sendData: function(dataId, paramObj) {
		var $iframe = daum.$("cmtinfo");
		if (!$iframe) return;

		this.sendKoClickPV(dataId, paramObj, $iframe);
		this.sendTiara();
	},
	sendKoClickPV: function (dataId, paramObj, $iframe) {
		var params = "grpid=" + CAFEAPP.GRPID
			+ "&mgrpid=" + CAFEAPP.MGRPID
			+ "&fldid=" + CAFEAPP.FLDID
			+ "&contentval=" + CAFEAPP.longtail[dataId].CONTENTVAL
			+ "&datanum=" + dataId;

		for (var param in paramObj) {
			params += "&" + param + "=" + paramObj[param];
		}
		$iframe.src = this.url + "?" + params;
	},
	sendTiara: function(){
		_tiq.push(['__setSection', 'article#comments']);
		_tiq.push(['__setPageName', 'tiaraCall']);
		_tiq.push(['__pageView', {
			url : window.location.href
			, title : document.title
			, referer : window.location.href
		} ]);
	}
};