var password = 'm2mdata';
var hT = 40;
$(document).ready(function(){
	
	if (navigator.userAgent.indexOf('MSIE 8')>-1 || navigator.userAgent.indexOf('MSIE 7')>-1){
		$('#top').html('This app is designed for modern browsers.  Please upgrade to either Internet Explorer 9 or higher or use a browser with automatic updates (Chrome, Firefox, Safari)')
		return false;
	}
	
	$('#password').on('keyup',function(e){
		if (e.keyCode==13){lsub();}
	});
	$(document).on('keyup',function(e){
		if (e.keyCode==120){run();}
	});

	if (get('sql')!==undefined && get('sql')=='true' && getCookie('sql_user')){sqlToggle()};

	//sql editor
	var e = ace.edit('sqltext');
	e.getSession().setMode('ace/mode/mysql');
	e.getSession().setUseWrapMode('true');
	
	$(document).on('keypress','.var',function(e){
		if (e.keyCode==13) run();
	});
	$(document).on('click','tbody tr',function(){
		$(this).toggleClass('highlight');
	});
	
	//Loads page if passed in with URL
	if (get('id')){
		$('#selquery option').filter(function () { return $(this).html() == decodeURI(get('id')); }).attr('selected','selected');
		
		//Load query and variables
		loadQuery($('#selquery')[0]);
		
		//runs query if there are no variables
		if ($('.var').length==0){
			initRun();
		}else{
			var t = true;
			$('.var').each(function(){
				if ($(this).val().length==0){
					t = false;
				}
			});
			if (t==true) initRun();
		}
	}
	
	$(document).on('keydown',function(e){
		if (e.keyCode==191 && e.ctrlKey && e.shiftKey){
			if ($('#cclicker').length==0){
				$('body').append('<div id="cclicker" class="cclicker-bg"></div><div id="cclicker-text" class="no-text"></div>');
				$.post('php_scripts/load.php',{'type':'help','file':'null'},function(data){
					$('#cclicker-text').html($(data).find('file').text());
					$('#cclicker-text').center();
				},'xml');
			}
		}
		if (e.keyCode == 27 && $('#cclicker').length>0){
			$('#cclicker,#cclicker-text').click();
		}
	}).on('click','#cclicker-text,#cclicker',function(){
		cclicker();
	});
	
	//rebinds footable sort with fixedtableheader
	$(document).on('click','.footable-sortable',function(){
		var _cell = $('#tblData thead tr:eq(0)').find('th:eq('+$(this).index()+')');
		_cell.click();
		$(this).closest('tr').find('.footable-sortable').removeClass('footable-sorted footable-sorted-desc');
		if (_cell.hasClass('footable-sorted')){
			$(this).removeClass('footable-sorted').addClass('footable-sorted-desc');
		}else if (_cell.hasClass('footable-sorted-desc')){
			$(this).removeClass('footable-sorted-desc').addClass('footable-sorted');
		}
	});
	
	$(window).resize(function(){
		if (!$('#tblData').hasClass('phone')){
			$(document).scrollLeft(1);
				var h = $(window).height()-$('#top').height()-($(document).scrollLeft() != 0?h-40:20);
				var w = $(window).width() -20 + 'px';
			$(document).scrollLeft(0);
			$('#tblData').fixedHeaderTable({
				height: (h-hT)
				,width: w
			});
		}
	});
	
	$(document).on('contextmenu','td.footable-visible',function(e){
		var _var = $('.fixed-head th:eq('+$(this).index()+')').attr('data-var');
		if (_var!==undefined){
			$('#cm').remove();
			$('html').addClass('clicker');
			var text = getHighlight(this);
			$('body').append('<div id="cm" class="h no-text hover" data-search="'+text+'" data-var="'+_var+'"></div>');
				$('#cm').attr('data-rc',$(this).closest('tbody tr').index()+','+$(this).index())
				$('#cm').append('<div id="cm-copy" data-tag="copy">Copy</div><hr class="hrcm">');
					prepCopy(text);	
			var _y = (e.clientY+250>$(window).height()?$(window).height()-250:e.clientY)
			$('#cm').css({'left':e.clientX,'top':_y});
			$.get('xml_tree.xml',function(data){
				$(data).find('file').each(function(){
					var that = this;
					$(this).find('vars').each(function(){
						if ($(this).text() == '@'+_var){
							$('#cm').append('<div class="cm-file" data-tag="sql">'+$(that).find('filename').text()+'</div>');
						}
					});
				});
				console.log()
				$('#cm').removeClass('h');
			},'xml');
		}
		e.preventDefault();
	}).on('contextmenu','#cm',function(e){
		//e.preventDefault();
	});
	
	$(document).on('click','html.clicker *:not(#cm,#cm *,.cm,.cm *)',function(){	
		$('html').removeClass('clicker');
		$('#cm').remove();
	});
	
	
	$(document).on('click','.cm-file',function(){
		switch($(this).attr('data-tag')){
			case 'copy':
				break;
			case 'sql':
				var u = document.URL.split('?');
				if (u[1]!==undefined){
					var ary = [];
					ary.push($('#cm').attr('data-var') + '=' + $('#cm').attr('data-search'));
					ary.push('id=' + encodeURIComponent($(this).html()));
					ary.push('sql='+(get('sql')!==undefined?get('sql'):'false'));
					
					var url = u[0] + '?' + ary.join('&');
					localStorage.set
					window.location.replace(url);
					return false
				}
				break;
		}
	});
	
	$(document).on('keyup','#filter',function(e){
		fncHistory('_ftf',($(this).val().length>0?encodeURIComponent($(this).val()):'null'),/_ftf=([^&]*)/,'replace');
	});
	
	$(document).on('mousedown.sql','#hr-resize',function(e){
		$(document).on('mousemove',function(e){
			if (e.which!=1) $(document).off('mousemove');
			
			$('#top').height(e.clientY +120);
			$('#sqltext').height(e.clientY-65);
			
			ace.edit('sqltext').resize()
			topResize();
		});
	})
});

function prepCopy(text){
	$('#cm-copy').attr('data-clipboard-text',text);
	var client = new ZeroClipboard($('#cm-copy')[0]);
	client.on( "ready", function( readyEvent ) {
		client.on( "aftercopy", function( event ) {
			$('html').removeClass('clicker');
			$('#cm').remove();
		});
	});
}

function getHighlight(that){
	var text = '';
	if (window.getSelection) {
		text = window.getSelection().toString();
	} else if (document.selection && document.selection.type != "Control") {
		text = document.selection.createRange().text;
	}
	if (text.length===0) text = $(that).text();
	return $.trim(text);
}

function isTextSelected(input) {
    if (typeof input.selectionStart == "number") {
        return input.selectionStart == 0 && input.selectionEnd == input.value.length;
    } else if (typeof document.selection != "undefined") {
        input.focus();
        return document.selection.createRange().text == input.value;
    }
}
function cclicker(){
	if ($('#cclicker-text').length>0) $('#cclicker-text').remove();
	if ($('#cm').length>0) $('#cm').remove();
	
	$('#cclicker').remove();
}



function initRun(){
	$.ajax({
		async:false
		,type:'POST'
		,url:'php_scripts/load.php'
		,dataType:'xml'
		,data:{'type':'sql','file':$('#selquery option:selected').html()}
		,success:function(data){
			ace.edit('sqltext').setValue($(data).find('file').text());
			vars();
			run();
		}
	});
}


function csvExport(){
	//replaces &npsp; with spaces in Excel
	$('#tblData td').filter(function(index){
		if ($(this).text().indexOf('\xa0')>-1){
			$(this).html($(this).html().replace(/(&nbsp;)/g,' '));
		}
	});
	
	var csv = $('#tblData').table2CSV({delivery:'value'});
	var title = get('id') + ($('.var:eq(0)').val().length>0?' ('+ $('.var:eq(0)').val() +').csv':'.csv');
	download(csv,title,'text/csv');
}
function download(strData, strFileName, strMimeType) {
    var D = document,
        a = D.createElement("a");
        strMimeType= strMimeType || "application/octet-stream";


    if (navigator.msSaveBlob) { // IE10
        return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
    } /* end if(navigator.msSaveBlob) */


    if ('download' in a) { //html5 A[download]
        a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
        a.setAttribute("download", strFileName);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            a.click();
            D.body.removeChild(a);
        }, 66);
        return true;
    } /* end if('download' in a) */


    //do iframe dataURL download (old ch+FF):
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
} /* end download() */

function sqlToggle(type){
	if (type!==undefined && type=='logout'){
		$('#sql,.sqlt').addClass('h');
		fncHistory('sql','false',/sql=(true|false)/,'replace');
	}else{
		if ($('#sql').hasClass('h')){
			$('#sql,.sqlt').removeClass('h')
		}else{
			$('#sql,.sqlt').toggle();
		}
		fncHistory('sql',($('#sql').css('display')=='none'?'false':'true'),/sql=(true|false)/,'replace');
	}
	topResize();
}

function cl(n){console.log(n);}

function sqlDel(){
	var ans = confirm('Are you sure you want to delete this file?');
	if (ans==false) return false;
	var title = $('#sqltitle').html();
	$.post('php_scripts/action.php',{'action':'delete','title':title},function(data){
		//fucker
	},'xml');
}

function sqlNew(){
	var title = prompt('What is the title of the new report?');
	if (!title || title.length==0) return false;
	$.post('php_scripts/action.php',{'action':'new','title':title},function(data){
		if ($(data).find('error').length==0){
			$('#sqltitle').html(title);
			ace.edit('sqltext').setValue('');
		}
	},'xml');
}

function sqlSave(){
	var title = $('#sqltitle').html();
	var sql = ace.edit('sqltext').getValue();
	$.post('php_scripts/action.php',{'action':'save','title':title,'sql':sql},function(data){
		
	},'xml');
}

function topResize(){
	$('#top').css('height','')
	$('#content-main,.fht-table-wrapper').height($(window).height()-$('#top').height()-20);
	$('.fht-tbody').height($('#content-main').height()-$('.fht-thead').height());
}




function fncHistory(key,val,regex,type){
	//var loc = (window.history.replaceState?location.search:location.hash.substring(1));
	var loc = (window.history.replaceState?location.search:location.hash.substring(1));
	//var str = (loc.search(regex)>=0?loc.replace(regex,key+'='+val):(val=='null'?'':(loc.length==0?'?':loc+'&')+key+'='+val));
	
	var str = (loc.search(regex)>-1?(val=='null'?loc.replace(new RegExp('(&|\\?)' + regex.source),''):loc.replace(regex,key+'='+val)):(val=='null'?'':(loc.length==0?'?':loc+'&')+key+'='+val) );
	if (window.history.replaceState){
		window.history.replaceState({},'',str);
	}else{
		location.hash = str;
	}
}

function run(){
	//replaces any variables
	var t = rVars();
	if (t==false) return false;
	
	$('#sqltitle').html($('#selquery option:selected').html());
	setCookie('sqltitle',$('#selquery option:selected').html());
	$('#content-main').html('<img src="load.gif" alt="Loading...">');
	$('#init-hide').hide();
	var type = $('html').attr('data-type');
	$.post('php_scripts/sql.php',{'type':type,'sql':ace.edit('sqltext').getValue()},function(data){
		
		$('#content-main').html('');
		
		var h = $(window).height()-$('#top').height()-20;
		var w = $(window).width() - 20 + 'px';
		
		$('#content-main').html(data);
		//$('#content-main').html('in here')
		
		$(document).scrollLeft(1);
			h = ($(document).scrollLeft() != 0?h-20:h);
		$(document).scrollLeft(0);
		
		if ($('#tblData').length>0){
			$('#export,#init-hide').show();
		}else{
			$('#export,#init-hide').hide();
		}
		
		fncHistory('id',encodeURI($('#selquery option:selected').html()),/id=([^&]*)/,'replace');
		if (window.history.pushState){
			window.history.pushState({},'',location.search);
		}
		if ($('#tblData tbody tr').length>0){
			$('#tblData').footable();
			$('#filtered-number').html($('#tblData tbody tr:not(.footable-row-detail)').length + ' of ' + $('#tblData tbody tr:not(.footable-row-detail)').length);
		}
		
		$('#tblData td[data-find="true"]').closest('tr').addClass('highlight');
		if (!$('#tblData').hasClass('phone')){
			if ($('#tblData').height()>h){
				$('#tblData').fixedHeaderTable({
					height: (h - hT)
					,width: w
				});
			}
		}
		
		//temporary filers results
		if (get('_ftf')){
			$('#filter').val(decodeURIComponent(get('_ftf')));
			$('#tblData').trigger('footable_filter',{filter:$('#filter').val()});
		}
		
		if (window.history.replaceState){
			window.history.replaceState({},'',location.search);
		}
	},'html');
}
function vars(){
	var _type = $('html').attr('data-type');
	switch(_type){
		case 'mssql':
			var rVar = /\) SET @[A-z0-9]*(?=\s*=\s*)/g;
			var rAll = /\) SET @[A-z0-9]*\s*=\s*("|')(.*?)\1/g;
			var rCB  = /@[A-z]*\s+[A-z]*\([0-9]+\) SET/g;
			
			var str = ace.edit('sqltext').getValue();
			
			var aCB  = str.match(rCB);
			break;
		case 'mysql':
			var rVar = /@[A-z0-9]*(?=\s*=\s*)/g;
			var rAll = /@[A-z0-9]*\s*=\s*("|')(.*?)\1/g;
			
			var str = (ace.edit('sqltext').getValue().indexOf(';')>-1?ace.edit('sqltext').getValue().split(';')[0]:ace.edit('sqltext').getValue());
			break;
	}
	
	
	var aVar = str.match(rVar);
	var aAll = str.match(rAll);
	
	var _get = ['id','sql','_ftf'];
	
	$('#vars').html('');
	
	if (aVar!==null){
		$.each(aVar,function(dex,val){
			
			_var = $.trim(val.split('@')[1]);
			_get.push(_var);
			if (get(_var)!==undefined){
				_arg = get(_var);
			}else{
				_arg = $.trim(aAll[dex].split('=')[1]);
				_arg = _arg.substring(1,_arg.length-1)
			}
			switch(_type){
				case 'mssql':
					switch(aCB[dex].replace(/\s+/g,' ').split(' ')[1]){
						case 'varchar(1)':
							$('#vars').append('<span class="vcon">'+_var+': <input id="v_'+_var+'" class="var" type="checkbox" '+(_arg=='1'?'checked="checked"':'')+'></span>');
							break;
						default:
							$('#vars').append('<span class="vcon">'+_var+': <input id="v_'+_var+'" class="var" type="text" value="'+_arg+'"></span>');
							break;
					}
					break;
				case 'mysql':
					$('#vars').append('<div class="vcon"><span>'+_var+': </span><input id="v_'+_var+'" class="var" type="text" value="'+_arg+'"></div>');
					break;
			}
		});
	}
	
	var ary = (window.history.replaceState?location.search:location.hash.substring(1)).match(/=*[^(&|?)]*/gi);
	var url = (window.history.replaceState?location.search:location.hash.substring(1));//document.URL;
	$.each(ary,function(dex,val){
		if (val.length>0){
			if ($.inArray(val.split('=')[0],_get)==-1){
				url = url.replace(val,'').replace('?&','?').replace('&&','&');
			}
		}
	});
	url = (url.slice(-1)=='&'?url.substring(0,url.length-1):url);
	if (url.length>0){
		if (window.history.replaceState){
			window.history.replaceState({},'',url);	
		}else{
			location.hash = url;
		}
	}
}
function rVars(){
	var rVar = /@[A-z0-9]*(?=\s*=\s*)/g;
	var rAll = /@[A-z0-9]*\s*=\s*("|')(.*?)\1/g;
	var str = ace.edit('sqltext').getValue();
	var aVar = str.match(rVar);
	var aAll = str.match(rAll);
	var nStr = '';
	var len = false;
	if (aAll!==null){
		var val = '';
		$('.var').each(function(dex){
			switch($(this).attr('type')){
				case 'checkbox':
					val = ($(this).is(':checked')?'1':'0');
					break;
				case 'text':
					val = $(this).val();
					break;
			}
			if (val.length>0){
				len = true;
				_arg = $.trim(aAll[dex].split('=')[1]);
				nStr = aAll[dex].replace(_arg,"'"+val+"'");
				str = str.replace(aAll[dex],aAll[dex].replace(_arg,"'"+val+"'"));
				
			}
			var reg = new RegExp($(this).attr('id').substring(2) +'=[^&]*');
			fncHistory($(this).attr('id').substring(2),($.trim(val).length==0?'null':$.trim(val)),reg,'replace');
		});
		ace.edit('sqltext').setValue(str);
	}else{
		len = true;
	}
	return len;
	
}
function fncClear(){
	delCookie('tsql');
	ace.edit('sqltext').setValue('');
	$('.var').remove();
}
function login(){
	if ($('#ll').val()=='Login'){
		if ($('#click').length==0){
			$('body').append('<div id="click"></div>');
			$('#login').show();
			$('#click').on('click',function(){
				$('#click').remove();
				$('#login').hide();
			});
			$('#password').focus();
		}
	}else{
		delCookie('sql_user');
		$('#ll').val('Login');
		sqlToggle('logout');
		$('#sqltoggle').removeAttr('onclick');
		$('#sqltoggle').css('visibility','hidden');
	}
}
function lsub(){
	if ($('#password').val()==password){
		setCookie('sql_user','true',7*24*60*60*1000);
		location.reload();
	}else{
		delCookie('sql_user');
	}
	$('#click').click();
}

function userQuery(that){
	$('#filter').val('');
	//ToDo: possibly change to 'push'
	fncHistory('_ftf','null',/_ftf=([^&]*)/,'replace');
	loadQuery(that);
}

function loadQuery(that){
	var title = $('option:selected',that).html();
	$.post('php_scripts/load.php',{'type':'sql','file':title},function(data){
		
		
		if ($(data).find('sql').length>0) alert($(data).find('sql').text());
		ace.edit('sqltext').setValue($(data).find('file').text());
		var res = $(data).find('file').text().match(/\/\*.*\*\//g);
		$('#comments').html((res?res.join('<br>'):''));
		vars();
		$('#sqltitle').html(title);
		document.title = 'Reports: ' + title;
	},'xml');
}

/*Standard Essential Functions*/			
function get(n){if(n=(new RegExp('[?&]'+encodeURIComponent(n)+'=([^&]*)')).exec((window.history.replaceState?location.search:location.hash.substring(1))))return decodeURIComponent(n[1]);}
function rGet(n){if(n=(new RegExp('[?&]'+encodeURIComponent(n)+'=([^&]*)')).exec(location.search)){return location.search;}}
function setCookie(c,v,d){var exdate=new Date();exdate.setDate(exdate.getDate() + d);if(v !== null){v=v.toString().replace(/\+/g,'%2B')};var cv=escape(v) + ((d==null) ? "" : "; expires="+exdate.toUTCString());document.cookie=c + "=" + cv;}
function getCookie(c){var cv = document.cookie;var cs = cv.indexOf(" " + c + "=");if (cs == -1){cs = cv.indexOf(c + "=");}if (cs == -1){cv = null;}else{cs = cv.indexOf("=", cs) + 1;var ce = cv.indexOf(";", cs);if (ce == -1){ce = cv.length;}cv = unescape(cv.substring(cs,ce));}if(cv !== null){cv=cv.toString().replace(/\%2B/g,'+')};return cv;}
function delCookie(n){document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';}
$.fn.center = function () {this.css("position","absolute");this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");return this;}