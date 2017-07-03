/*
동영상앱개발셀 landon.kim
version: 2,1,0,1
*/


/*****************************************************/
/* 초기화 */
/*****************************************************/
/* 업데이트 정보 */
var _xman_codebase = 'http://get.daum.net/DaumActiveX/2_1_0_1/DaumActiveX.cab';
var _xman_newver = '2,1,0,1';
var _xman_updateinfo = "http://get.daum.net/DaumActiveX/2_1_0_1/updateinfo.txt";
var _xman_updateinfo_validkey ="d6C7LnVwqQ.f.IWsAYpyZ6dYsT1QYIvNcfH4tYB6rZ1uWzoKyp8T9rgdIe9HO6Eq4xYDfkvKJ3XGWmyGhCVH6A00";
/* 업데이트 정보 끝 */

var daumNewXman=null;
var curroot='';
var curpath='';
var _xman_cur_obj=null;
var _xman_dep_obj=null;
var _xman_cur_div='';
var _xman_dep_div=null;
var _timeout=0;
var callback=null;
var _xman_err_check = -1;
var _xman_just_updated = false;

//CS페이지 주소
var _csrul = 'http://cs.daum.net/daumfaq/top.jsp?SITE_ID=124';


var _err_handler=function(errstr){};

// URL이 아닌 주소를 완성하기 위한 현재페이지의 주소 파싱 //
var curhost = document.domain;
var curURL = document.URL;


if( curhost == '' )
// 로컬주소로 판별시 //
{
	if( res = curURL.match(/^(.+:\/\/\/?)(.+[\\\/])/) )
	{
		curroot = res[1];
		curpath = res[1] + res[2];
	}		
}
else
// 웹주소로 판별시 //
{
	if( res = curURL.match(/^(.+:\/\/[^\/]+)(\/[^\?^#]+\/)/) )
	{
		curroot = res[1];
		curpath = res[1] + res[2];
	}
}


if(document.getElementById('daumNewXmanObject')==null)
// Xman을 페이지에 로드 //
{
	document.writeln('<div id="daumNewXmanObject" width="0" height="0" style="position:absolute;"></div>');
}

/*****************************************************/
/* 함수 정의 */
/*****************************************************/
//////////////// daumNewActiveXman ////////////////
function daumNewActiveXman(obj,div)
{
	if(typeof(obj) == 'object' && obj.length > 0)
	{
		_xman_cur_obj = obj[0];
		_xman_dep_obj = obj;
		_xman_cur_div = div[0];
		_xman_dep_div = div;
	}
	else
	{
		_xman_cur_obj = obj;
		_xman_cur_div = div;
	}

	// 보안성 검사 & codebase 수정 //
	if( _daumXmanCheckSecurity(_xman_cur_obj) == false )
	{
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
		return false;
	}

	
	daumNewXman = document.getElementById('daumNewXman');
	if(daumNewXman==null)
	// Xman을 페이지에 로드 //
	{
		var daumNewXmanobj = new Object();
		daumNewXmanobj.classid = 'CLSID:AA7713F3-9590-4596-B30A-D894A4D87962';
		daumNewXmanobj.id = 'daumNewXman';
		daumNewXmanobj.name = 'daumNewXman';
		daumNewXmanobj.width = '0';
		daumNewXmanobj.height = '0';
		daumNewXmanobj.codebase = _xman_codebase+'?ver='+_xman_newver+'#version=1,1,0,0'; //주의! 버전 수정하지말것, IE통한 업데이트는 일어나지 않도록.
		daumNewXmanobj.param = [];

		daumActiveX(daumNewXmanobj,'daumNewXmanObject');

		_wait(30000);
		
		return;
	}
	
	_daumNewActiveXman2();
}

function _wait(msec)
{
	var __intv = 500;
	if( msec > 0 )
	{
		_timeout = msec;
	}

	_timeout -= __intv;
	
	try
	{

		daumNewXman = document.getElementById('daumNewXman');

		if( typeof(daumNewXman.Version) == 'string' )
		{
			_daumNewActiveXman2();
		}
		else
		{
			if( _timeout == 0 )
			{	
				_daumNewActiveXman2();
				return;
			}
			else
			{
				setTimeout('_wait(0)',__intv);
			}
		}

	}
	catch (e)
	{
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
	}
}

function _daumNewActiveXman2()
{
	// 설치나 업데이트 필요여부 확인 //
	if( typeof(daumNewXman.Version) != 'string')
	{
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
		return false;
	}
	else
	if( daumNewXman.isEnabled() == false )
	{

		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
		return false;
	}

	/* 자체 업데이트 처리 */
	if( daumNewXman.needUpdate('{AA7713F3-9590-4596-B30A-D894A4D87962}',_xman_newver) )
	{
		err = daumNewXman.updateSelf(_xman_updateinfo,_xman_updateinfo_validkey);
		if( err == false )
		{
			daumActiveX(_xman_cur_obj,_xman_cur_div);
			_load_dep_obj();
			return false;
		}
		else
		{
			_xman_just_updated = true;
		}
	}
	/* 자체 업데이트 처리끝 */

	try
	{	
		_xman_err_check = daumNewXman.setAuxiliary('' ,
			'http://cafe.daum.net/_special/xman/bgm_install.html' ,
			'd6C7LnVwqQ.xQglNA-kz_cR9p9xeopQcNS4SB8Sh--.HysyVwZe89mNRf3f44qyu2woW_fQCgQw0' 
			, '1' , '1' );
		_xman_err_check = daumNewXman.setAuxiliary('' ,
			'http://cafe.daum.net/_special/xman/bgm_install.html' ,
			'd6C7LnVwqQ.xQglNA-kz_cR9p9xeopQcNS4SB8Sh--.HysyVwZe89mNRf3f44qyu2woW_fQCgQw0' 
			, '2' , '2' );
		daumNewXman.setOption('http://cafecj.daum-img.net/xman/7/xman_option_cafe.txt');	
		_xman_err_check = daumNewXman.setAuxiliary(_xman_cur_obj.xmandesc,
			'http://www.daum.net/' ,
			'd6C7LnVwqQ_D1L.xTSIFqepjJolTy_hP' 
			, '3' , '3' );
		
	}
	catch (e)
	{
		/* 2,0,0,5 버젼에서는 에러 발생 */
	}
	
	if( daumNewXman.needInstall(_UUID(_xman_cur_obj.classid)) == true )
	{
		_daumXmanShowInstall(false,false);
		return true;
	}
	else
	if( _xman_cur_obj.codebase && daumNewXman.needUpdate(_UUID(_xman_cur_obj.classid),_VER(_xman_cur_obj.codebase)) )
	{
		_daumXmanShowInstall(true,false);
		return true;
	}
	else
	{
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
		return true;
	}
}

/*****************************************************/
/* 내부적으로 사용하는 함수들 */
/*****************************************************/

////////////// Util ///////////////

function _UUID(classid)
{
	return '{'+classid.substr(6)+'}';
}

function _VER(codebase)
{
	var res = codebase.match(/#version=(.+)$/i);
	return res[1];
}

function _daumXmanCheckSecurity(obj)
{
	var codebase = obj.codebase;
	if( !codebase ) return false;

	var res;
	
	// URL검사 //
	var urlOK = false;
	if( res = codebase.match(/^(.+):\/\//) )
	// URL의 프로토콜형식을 따르면 //
	{
		if( res[1] == 'http' || res[1] == 'https' )
		// 지원하는 프로토콜이면 //
		{
			urlOK = true;
		}
		else
		{
			urlOK = false;
		}		
	}
	else
	// 절대 또는 상대경로라면 //
	{
		// 절대경로 // curroot 를 붙여준다.
		if( codebase.substr(0,1) == '/' )
		{
			codebase = curroot + codebase;
			urlOK = true;
		}
		// 상대경로 // curpath 를 붙여준다.
		else
		{
			codebase = curpath + codebase;
			urlOK = true;
		}
	}
	obj.codebase = codebase;

	// URL검사 결과처리 //
	if( urlOK == false )
	{
		return false;
	}


	// 도메인검사 //
	var domainOK = false;
	if( res = obj.codebase.match(/.+:\/\/([^\/]+)\//))
	{
		var _d = res[1];
		if( 
			_d.match(/^(daum|hanmail|daum-img)\.net$/i)
			||
			_d.match(/\.(daum|hanmail|daum-img)\.net$/i)
			||
			_d.match(/^(daum|hanmail|daum-img)\.net:\d+$/i)
			||
			_d.match(/\.(daum|hanmail|daum-img)\.net:\d+$/i)
		)
		{
			domainOK = true;
		}
		else
		{
			domainOK = false;
		}
	}

	// 도메인검사 결과처리 //
	if( domainOK == false )
	{
		return false;
	}

	return true;
}

function _load_dep_obj()
{
	if( _xman_dep_obj!=null && _xman_dep_obj.length > 1 )
	{
		for(var i=1; i<_xman_dep_obj.length; i++)
		{
			daumActiveX(_xman_dep_obj[i],_xman_dep_div[i]);
		}
	}
}
// _xman_cur_obj;
// _xman_cur_div;
function _daumXmanShowInstall(isUpdate,force)
{
	var msg;
	if( isUpdate && _xman_cur_obj.xmanupdate ) // 업데이트일 경우 메세지 변경
	{
		msg = ' <font color="#80602A"><b>버전 ' + _VER(_xman_cur_obj.codebase) + '으로 업데이트</b></font><br>';
		msg += _xman_cur_obj.xmanupdate;
	}
	else
	{
		msg = _xman_cur_obj.xmandesc;
	}

	/* 설치안함 지정시 */
	if( force == false )
	{
		// 업데이트가 필요없고, _xman_just_updated도 false 일때
//		if( (!daumNewXman.needUpdate('{AA7713F3-9590-4596-B30A-D894A4D87962}', "1,2,0,0"))	) // 1, 1, 0, 0 에서는 지원안됨.
//		{
			// 저장된 값대로 분기
			var saved = daumNewXman.getSaved(_xman_cur_obj.xmantitle);
			if( saved == 1 ) //바로 설치
			{
				_daumXmanInstall(isUpdate);
				return;
			}
			else if(saved == 0 )
			{
				if( _xman_cur_obj.xmanhidden == true )
				{
				}
				else
				{
					_daumXmanInstallFailed(isUpdate);
					return;
				}				
			}
//		}
//		else
//		{
//		}
	}

	if( daumNewXman.confirm(_xman_cur_obj.xmantitle,msg,_csrul,isUpdate,false) )
	{
		_daumXmanInstall(isUpdate);
	}
	else
	{	
		_daumXmanInstallFailed(isUpdate);
	}
}

function _daumXmanShowFail(isUpdate)
{
	var msg;
	if( isUpdate && _xman_cur_obj.xmanupdate ) // 업데이트일 경우 메세지 변경
	{
		msg = ' <font color="#80602A"><b>버전 ' + _VER(_xman_cur_obj.codebase) + '으로 업데이트</b></font><br>';
		msg += _xman_cur_obj.xmanupdate;
	}
	else
	{
		msg = _xman_cur_obj.xmandesc;
	}

	if( daumNewXman.confirm(_xman_cur_obj.xmantitle,msg,_csrul,isUpdate,true) )
	{
		_daumXmanInstall(isUpdate);
	}
	else
	{
		// 설치 실패시 거부하면 Xman이 설치를 시도하지 않음.
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
	}
}

// 설치
function _daumXmanInstall(isUpdate)
{
	//location = _xman_cur_obj.codebase;
	err = daumNewXman.install(_UUID(_xman_cur_obj.classid),_VER(_xman_cur_obj.codebase),_xman_cur_obj.codebase,_xman_cur_obj.xmantitle,_xman_cur_obj.xmanvalidkey);
  if ( err == -99 )
	{
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
		if(_xman_cur_obj.callback != null) {
			_xman_cur_obj.callback.call(this);
		}
	}
	else if( err == 0 )
	{
		daumActiveX(_xman_cur_obj,_xman_cur_div);
		_load_dep_obj();
		if(_xman_cur_obj.callback != null) {
			_xman_cur_obj.callback.call(this);
		}
	}
	else
	{
		_daumXmanShowFail(isUpdate);
	}
}


function _daumXmanInstallFailed(isUpdate)
{
	if( _xman_cur_obj.xmanhidden == true ) return;

	var isUpdateStr;	
	if( isUpdate == true )
		isUpdateStr = 'true';
	else
		isUpdateStr = 'false';

	var html = '';

	if( _xman_cur_obj.xmanmsgtype == 1 )
	{

		html += '<div style="position:relative; width:'+_xman_cur_obj.width+'; height:'+_xman_cur_obj.height+'; background-color:#EEEEEE;">';
		html += '<div style="color:#515151; top:50%; left:50%; height:0px; width:0px; position:absolute; z-index:10; background-color:#444444;">';
		
		html += '<div style="border:solid 1px #dddddd; background-color:#FFFFFF; width:160px; text-align:center; position:absolute; left:-80px; top:-10px;">';
		html += '<a href="#" title="폰샷사진편집기설치" style="text-decoration:none;font-family:돋움,dotum;font-weight:bold;color:#ff6633;font-size:8pt;letter-spacing:-1px;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'"  onclick="_daumXmanShowInstall('+isUpdateStr+',true);">';
		html += '<img src="http://image.hanmail.net/hanmail/s_img/xman/i_xmandown.gif" width="9" height="12" border="0" alt="" style="vertical-align:middle;margin-bottom:3px;">';
		html += _xman_cur_obj.xmantitle;
		html += '설치 <img src="http://image.hanmail.net/hanmail/s_img/xman/b_xmango.gif" width="17" height="12" border="0" alt="" style="vertical-align:middle;margin-bottom:3px;"></a></div>';

		html += '</div>';
		html += '</div>';

	}
	else
	{
		if(_xman_cur_obj.width == 0) {
			_xman_cur_obj.width = document.getElementById(_xman_cur_div).style.width;	
		}
		
		if(_xman_cur_obj.height == 0) {
			_xman_cur_obj.height = document.getElementById(_xman_cur_div).style.height;
		}
		
		html += '<div style="position:relative; width:'+_xman_cur_obj.width+'; height:'+_xman_cur_obj.height+'; background-color:#EEEEEE;">';
		html += '<div style="color:#515151; top:50%; left:50%; height:0px; width:0px; position:absolute; z-index:10; background-color:#444444;">';
		html += '<div style="color:#515151; top:-35; left:-150; width:300px; height:50px; position:absolute; z-index:10;color:#515151; font-size:12px;';
		html += 'font-family:"굴림",gulim,sans-serif;">';
		html += '<dl style="background-color:#EEEEEE; padding:10px;">';
		html += '	<dt style="float:left; padding-right:10px;"><img src="http://i1.daumcdn.net/cafeimg/cto/images/x_icon01.gif" width="50" height="49" alt="img"><br /></dt>';
		html += '	<dd style="text-align:left; padding:7px; line-height:170%;">';
		html += '		<b style="font-size:13px; color:#355C77; font-weight:bold;">'+_xman_cur_obj.xmantitle+'</b>를<br /> 설치하시려면 <a style="color:#3979A5; font-weight:bold; cursor:pointer; text-decoration:underline;" onclick="_daumXmanShowInstall('+isUpdateStr+',true);">여기를 클릭</a>해주세요.';
		html += '	</dd>';
		html += '</dl>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
	}

	if( _xman_cur_obj.xmanmsgdiv )
	{
		document.getElementById(_xman_cur_obj.xmanmsgdiv).innerHTML = html;
	}
	else
	{
		document.getElementById(_xman_cur_div).innerHTML = html;
	}
}
