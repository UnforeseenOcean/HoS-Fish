document.domain = "daum.net";


var cafeonManager = {
    cafeonState: "public",
    cafeonServer: null,
    memberCount: 0,
    changeServerFlag: false,
    memberArray: [],
    cafeonCommand: null,
    makeSearchManager: function(config) {
        var searchUser = $(config.searchUser);
        var searchUserBtn = $(config.searchUserBtn);
        var refreshUserListViewFn = config.refreshUserListViewFn;

        function resetSearch() {
            searchUserBtn.attr("class", "btn_search");
            searchUser.val("").focus();
            refreshUserListViewFn();
        }

        searchUser.on("focus blur", function () {
            $(this).toggleClass("blank")
        });

        searchUser.on("keyup", function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code !== 13) {
                searchUserBtn.attr("class", "btn_search");
            }
            if ((code == 8 || code == 46) && $(this).val() == "") {
                resetSearch();
                return false;
            }

            if (code === 27) {
                resetSearch();
                return false;
            }
        });

        searchUserBtn.on("click", $.proxy(function (e) {
            var searchBtn = $(e.currentTarget);
            var nickname = $.trim(searchUser.val());

            if (searchBtn.hasClass("btn_search_all")) {
                resetSearch();
                return;
            }

            if (Utils.length(nickname) < 4) {
                alert("검색어는 최소 4byte 이상 입력하셔야 합니다.");
                return;
            }

            searchBtn.attr("class", "btn_search_all");
            cafeonManager.cafeonCommand.searchUser(nickname);
        }, this));
        
        if (config.extraSearchCallback) {
            // for chat_home
            cafeonManager.extraSearchCallback = config.extraSearchCallback;
        }
    },
    
    init: function (config) {
        this.grpid = config.grpid;
        this.userid = config.userid;
        this.nickname = config.nickname;
        this.rolecode = config.rolecode;
        this.avatarid = "0";
        this.profileid = config.profileid;
        this.roleIconType = config.roleIconType;
        this.cafeJoinMember = config.cafeJoinMember;
        this.userContextMenuHandler = config.userContextMenuHandler;
        
        if (this.cafeonServer != config.cafeonServer && this.isConnected()) {
            this.changeServerFlag = true;
        }
        this.cafeonServer = config.cafeonServer
        this.cafeonPort = config.cafeonPort;
        
        this.chatState = $(config.chatState);
        this.loginMemberCount = $(config.loginMemberCount);
        this.userListView = $(config.userListView);
        this.userElTemplate = $(config.userListViewTemplate).find("li");

        if (config.forcePrivate) {
            this.cafeonState = "private";
        }

        if (this.cafeonState == "private") {
            this.chatState.attr("checked", "checked");
        } else {
            this.chatState.removeAttr("checked");
        }

        this.chatState.on("click", $.proxy(this.sendUserState, this));
        
        this.userListView.on("click", "li", $.proxy(function (e) {
            var userEl = $(e.currentTarget);

            var userid = userEl.attr("id");
            if (userid === this.userid) {
                return;
            }
            
            for (var i = 0; i < this.memberArray.length; i++) {
                var user = this.memberArray[i];
                if (user.userid == userid) {
                    var nickname = userEl.attr("data-nickname");
                    var rolecode = userEl.attr("data-rolecode");
                    this.userContextMenuHandler(userEl[0], userid, nickname, rolecode);
                }
            }
            
        }, this));

        this.userListView.on("dblclick", "li", $.proxy(function (e) {
            if (!this.cafeJoinMember) {
                return;
            }
            
            var userEl = $(e.currentTarget);
            var userid = userEl.attr("id");
            if (userid == this.userid) {
                return;
            }
            var nickname = userEl.attr("data-nickname").replace(/&/gi, '.');
            this.sendP2PChatRequest(nickname, userid);
        }, this));

        this.makeSearchManager({
            searchUser: config.searchUser,
            searchUserBtn: config.searchUserBtn,
            refreshUserListViewFn: $.proxy(this.refreshUserListView, this)
        });
        
        // 페이지 이동으로 FLASH_LOADED 가 로딩안된경우.
        if (this.cafeonCommand == null && CafeonCommand.getCafeonFlash()) {
            $(document).trigger("FLASH_LOADED");
        }
        
        if (!this.isEventBinded) {
            this.isEventBinded = true;

            $(document).on("COMPLETE_LOGIN", $.proxy(function (e, myInfo) {
                this.userListView.empty();
                this.addUser(e, myInfo);
            }, this));
            $(document).on("ADD_USER", $.proxy(this.addUser, this));
            $(document).on("DEL_USER", $.proxy(this.deleteUser, this));
            $(document).on("UPDATE_USER_CNT", $.proxy(this.displayCount, this));
            $(document).on("DISCONNECTED", $.proxy(this.disconnected, this));
            $(document).on("CONNECTION_ERROR", $.proxy(function () {
                this.errorMessage("카페온 서버가 응답이 없습니다.");
            }, this));
            $(document).on("SSO_LOGOUT", $.proxy(function () {
                this.errorMessage("다른 곳에서 접속하여 로그아웃 되었습니다.");
            }, this));
            $(document).on("INVITE", $.proxy(this.invite, this));
            $(document).on("COMPLETE_SEARCH", $.proxy(function(e, data) {
                    try {
                        this.extraSearchCallback(data);
                    } catch (e) {
                        // ignore
                    }
                    
                    this.userListView.empty();
                    var userList = data.searchResult;
                    if (userList.length == 0) {
                        this.userListView.append($("<li>접속중인 회원이 없습니다.</li>"));
                        return;
                    }

                    for (var i = 0; i < userList.length; i++) {
                        userList[i].nickname = userList[i].decodeNickname;
                        this.displayMember(userList[i]);
                    }
                }, this)
            )
        }
    },
    login: function() {
        this.clearCafeon();
        this.cafeonCommand.login({
            host: this.cafeonServer,
            port: this.cafeonPort
        }, {
            grpid: this.grpid,
            userid: this.userid,
            nickname: this.nickname,
            rolecode: this.rolecode,
            avatarid: this.avatarid,
            profileid: this.profileid,
            cafeonState: this.cafeonState
        });
    },
    logoutCafeon: function () {
        this.cafeonCommand.logout();
        this.errorMessage("로그아웃되어 목록을 표시할 수 없습니다.<div align='center'>[<a href=\"#\" class=\"reconnect\">재접속</a>]</div>");
    },
    loadCafeon: function () {
        if (this.changeServerFlag) {
            this.changeServerFlag = false;
            this.logoutCafeon();
            return;
        }

        if (this.userid == "" || this.grpid == "") {
            return;
        }

        // 카페온 로딩후 프레임내 페이지 전환일경우.
        if (this.isConnected()) {
            this.refreshUserListView();
            this.loginMemberCount.html(this.memberCount);
            return;
        }

        window.setTimeout($.proxy(function () {
            if (CafeonCommand.getCafeonFlash() == undefined) {
                this.errorMessage("flash를 설치해주시거나 <br>활성화 해주세요. <div align='center'>[<a href=\"#\" class=\"checkFlash\">재접속</a>]</div>");
                return false;
            }
            if (this.memberArray.length == 0) {
                this.errorMessage("Cafeon이 로드 되지 <br>않았습니다.재접속을 <br>클릭해주세요.<div align='center'>[<a href=\"#\" class=\"reconnect\">재접속</a>]</div>");
                return false;
            }
        }, this), 5000);
    },
    isConnected: function () {
        return this.cafeonCommand && this.cafeonCommand.isConnected();
    },
    addUser: function (e, userInfo) {
        if (($.grep(this.memberArray, function (n) {
                return n.userid == userInfo.userid;
            })).length > 0) {
            return;
        }

        userInfo.grpid = this.grpid;
        userInfo.isMy = userInfo.userid == this.userid;

        if (this.memberArray.length <= 50) {
            this.memberArray.push(userInfo);
            this.displayMember(userInfo);
        }
    },
    deleteUser: function (e, userid) {
        if (userid == this.userid) {
            return;
        }
        // userid 에 '.' 이 들어갈 수 있으므로 attribute-selector 를 이용.
        this.userListView.find("li[id='" + userid + "']").remove();

        var userIndex = -1;
        for (var i = 0; i < this.memberArray.length; i++) {
            if (this.memberArray[i].userid == userid) {
                userIndex = i;
            }
        }
        if (userIndex == -1) {
            return;
        }
        this.memberArray.splice(userIndex, 1);
    },
    refreshUserListView: function () {
        this.userListView.empty();
        $.each($(this.memberArray), $.proxy(function (idx, mbr) {
            this.displayMember(mbr);
        }, this));       
    },
    displayMember: function (user) {
        var roleIconType = this.roleIconType;

        if (user.rolecode == "31") {
            roleIconType = "";
        }

        var userEl = this.userElTemplate.clone();
        userEl.attr("id", user.userid);
        userEl.attr("data-profileid", user.profileid);
        userEl.attr("data-rolecode", user.rolecode);
        userEl.attr("data-nickname", user.nickname);

        var roleCodeImg = "http://cafeimg.hanmail.net/cf_img2/bbs2/roleicon/" + roleIconType + "_level_" + user.rolecode + ".gif";
        userEl.find("img").attr("src", roleCodeImg);
        userEl.find(".imgR").attr("src", roleCodeImg);
        userEl.find(".nickname").text(user.nickname.substring(0, 9));
        
        if (user.isMy) {
            userEl.addClass("my");
        }
        this.userListView.append(userEl);

        if (user.isMy) {
            if (this.cafeonState == "private") {
                this.privateMyId();
            } else {
                this.publicMyId();    
            }
        }
        this.scrollListViewOnTop();
    },
    displayCount: function (e, memberCount) {
        this.memberCount = memberCount;
        this.loginMemberCount.html(this.memberCount);
    },
    getUserCount: function () {
        return this.cafeonCommand.getUserCount();
    },
    clearCafeon: function () {
        this.memberArray = [];
        this.memberCount = 0;
    },
    errorMessage: function (mesaage) {
        var messageEl = $("<li>" + mesaage + "</li>");
        messageEl.find(".checkFlash").on("click", $.proxy(function (e) {
            e.preventDefault();
            window.open('http://get.adobe.com/kr/flashplayer/');
            return false;
        }, this));
        messageEl.find(".reconnect").on("click", $.proxy(function (e) {
            e.preventDefault();
            this.login();
            return false;
        }, this));
        this.userListView.html(messageEl);
    },
    disconnected: function () {
        this.errorMessage("서버와 접속이 끊어졌습니다.<div align='center'>[<a href=\"#\" class=\"reconnect\">재접속</a>]</div>");
    },
    sendUserState: function () {
        if (this.cafeonState == "public") {
            this.cafeonState = "private";
            this.privateMyId();
            this.chatState.attr("checked", "checked");
            
            this.cafeonCommand.setPrivate("private");
        } else {
            this.cafeonState = "public";
            this.publicMyId();

            this.cafeonCommand.setPrivate("public");
        }
    },
    privateMyId: function () {
        this.userListView.children("li.my")
            .fadeTo("slow", 0.33)
            .children("span.status")
            .text("<유령>");
    },
    publicMyId: function () {
        this.userListView.children("li.my")
            .fadeTo("slow", 1)
            .children("span.status")
            .text("<나>");
    },
    scrollListViewOnTop: function () {
        this.userListView.scrollTop(this.userListView.prop("scrollHeight"));
    },
    
    // [CafeChat2009] 1:1 대화하기를 했을 경우 호출되는 메소드. 채팅방을 만들고 상대방을 초대.
    sendP2PChatRequest: function (targetNickname, targetUserid) {
        if (this.rolecode <= "22") {
            alert("1:1 대화는 정회원 이상만 신청할 수 있습니다.");
            return;
        }
        var windowName = "p2p_" + Math.floor((Math.random() * 20) + 9);

        // create popup
        var popup = window.open("", windowName, "toolbar=no, scrollbars=no, resizable=yes, width=395, height=495");

        if (!popup) {
            alert("1:1대화 요청을 했으나\n 팝업이 차단되어있습니다. 팝업차단을 해제해 주시기 바랍니다");
            return;
        }
        
        // create form.
        var popupForm = document.createElement('form');
        document.body.appendChild(popupForm);

        // form attribute setting.
        popupForm.name = "sendP2PChatRequestForm";
        popupForm.action = "/_c21_/chat_create?grpid=" + this.grpid;
        popupForm.method = "post";
        popupForm.target = windowName;

        // input field setting.
        this._addInputField(popupForm, "targetUserid", targetUserid);
        this._addInputField(popupForm, "targetNickname", Base64.encode(Utils.escapeSingleQuote(targetNickname)));
        this._addInputField(popupForm, "isOne2One", "true");

        // submit.
        popupForm.submit();
    },
    // [CafeChat2009] 신청자 : 상대방을 초대하는 메시지를 카페온에 전송.(chat client -> cafeon)
    sendNewP2PChatReq: function (inviteMsg) {
        this.cafeonCommand.requestNewP2PChat(inviteMsg);
    },
    // [CafeChat2009] 피신청자 : 카페온에서 초대받은 메시지에 따라 팝업 생성.(cafeon -> chat client)
    invite: function (e, param) {
        var roomParam = param.roomParam;
        var windowName = param.windowName;
        
        // create popup.
        var popup = window.open("", windowName, "toolbar=no, scrollbars=no, resizable=yes, width=395, height=495");

        if (!popup) {
            alert("1:1대화 요청이 왔으나\n 팝업이 차단되어있습니다. 팝업차단을 해제해 주시기 바랍니다");
        } else {
            // create form.
            var popupForm = document.createElement('form');
            document.body.appendChild(popupForm);

            // form attribute setting.
            popupForm.method = "post";
            popupForm.target = windowName;

            // input field setting.
            var isOne2One = false;
            var items = roomParam.split("&");
            for (var i = 0, n = items.length; i < n; i++) {
                var str = items[i];
                var idx = str.indexOf("=");
                var key = str.substring(0, idx);
                var value = str.substring(idx + 1, str.length);

                if (idx > -1) {
                    this._addInputField(popupForm, key, value);
                }

                if (key == "isOne2One" && value == "true") {
                    isOne2One = true;
                }
            }

            var servletName;
            if (isOne2One) {
                servletName = "chat_one2one_popup";
            } else {
                servletName = "chat_invite_popup";
            }
            popupForm.action = "/_c21_/" + servletName + "?grpid=" + this.grpid;

            // submit.
            popupForm.submit();
        }
    },
    _addInputField: function (_form, _name, _value) {
        var tmp = document.createElement('input');
        tmp.setAttribute("type", "hidden");
        tmp.setAttribute("name", _name);
        tmp.setAttribute("value", _value);
        _form.appendChild(tmp);
    }
    ,extraSearchCallback: function(){}
};

var CafeonCommand = function(cafeon) {
    $(window).on("beforeunload", function () {
        cafeon.logout();
    });

    return {
        login: function (hostConfig, userConfig) {
            CafeonCommand.host = hostConfig.host;
            CafeonCommand.port = hostConfig.port;
            cafeon.login(userConfig.grpid, userConfig.userid, userConfig.nickname, userConfig.rolecode, userConfig.avatarid, userConfig.profileid, userConfig.cafeonState);
        },
        logout: function () {
            if (!this.isConnected()) {
                return;
            }
            cafeon.logout();
        },
        setPrivate: function (flag) {
            cafeon.setPrivate(flag);
        },
        searchUser: function (nickname) {
            cafeon.searchUser(nickname);
        },
        isConnected: function () {
            return cafeon.isDisconnected && !cafeon.isDisconnected();
        },
        requestNewP2PChat: function (inviteMsg) {
            cafeon.requestNewP2PChat(inviteMsg);
        },
        getUserCount: function () {
            return cafeon.getUserCount();
        }
    };
};
CafeonCommand.syncUserCount = true;
CafeonCommand.getCafeonFlash = function () {
    var cafeonObject = $("#Cafeon");
    if (cafeonObject[0] && cafeonObject[0].login) {
        return cafeonObject[0];
    }
    var cafeonEmbed = cafeonObject.find("embed");
    if (cafeonEmbed[0] && cafeonEmbed[0].login) {
        return cafeonEmbed[0];
    }
    return undefined;
};

var Utils = {
    length: function(str) {
        var nbytes = 0;
        for (var i=0; i < str.length; i++) {
            var ch = str.charAt(i);
            if (escape(ch).length > 4) {
                nbytes += 2;
            } else if (ch != "\r") {
                nbytes++;
            }
        }
        return nbytes;
    },
    escapeSingleQuote: function (str) {
        str = str.replace(/\\/g, "\\\\");
        str = str.replace(/'/g, "\\\'");
        return str;
    }
};

/**
 *
 * Base64 encode / decode
 * http://www.webtoolkit.info/
 *
 **/
var Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        return Base64._utf8_decode(output);
    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};

function isUserCountCheck() {
    return CafeonCommand.syncUserCount;
}

function getLoginHost() {
    return CafeonCommand.host;
}

function getHostPort() {
    return CafeonCommand.port;
}

function removeUser(userid) {
    $(document).trigger("DEL_USER", userid);
}

function kickUser(userid) {
    $(document).trigger("DEL_USER", userid);
}

function addUser(userInfo) {
    $(document).trigger("ADD_USER", userInfo);
}

function completeLogin(userInfo) {
    $(document).trigger("COMPLETE_LOGIN", userInfo);
}

function updateUserCount(count) {
    $(document).trigger("UPDATE_USER_CNT", count);
}

function completeSearch(userList) {
    $(document).trigger("COMPLETE_SEARCH", {searchResult: userList});
}

function disconnected() {
    $(document).trigger("DISCONNECTED");
}

function connectError() {
    $(document).trigger("CONNECTION_ERROR");
}

function kickMyself() {
    $(document).trigger("SSO_LOGOUT");
}

function invite(roomParam, windowName) {
    $(document).trigger("INVITE", {roomParam: roomParam, windowName: windowName});
}

function completeP2PChatRequest(roomParam, windowName) {
}

function completeSetPrivate(userInfo) {
}

function completeLogout() {
}

function addSearchUser(userInfo) {
}

function initSearch() {
}