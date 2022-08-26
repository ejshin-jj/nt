(function ($) {
    $.eshopfront = {};
})(jQuery);

(function($eshopfront,$) {
    $eshopfront.cmm = {
        emptyImg : function(img){
          var width = $(img).data("width");
          var height = $(img).data("height");
          if (typeof width == 'undefined' || typeof height == 'undefined') {
            if(SERVER_TYPE =="local"){
              img.src = '/moassets/images/common/img_nodata.png';
              $(img).addClass("img-nodata");
            }else{
              img.src = IMG_PATH+'/noimg/MC/img_nodata.png';
              $(img).addClass("img-nodata");
            }
          }else{
            if(SERVER_TYPE =="local"){
              img.src = '/moassets/images/common/img_nodata.png';
              $(img).addClass("img-nodata");
            }else{
              img.src = IMG_PATH+'/noimg/MC/img_nodata.png/dims/resize/!'+width+'x'+height;
              $(img).addClass("img-nodata"); 
            }
          }
        },
        arkTrans : function(keyword, callbackFn) {
          $.ajax({
            url : "/static/search/ark/ark_trans.jsp",
            type : "post",
            dataType : "json",
            headers: {
              'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
            },
            data : {
                query : keyword
               ,convert:'fw'
               ,label: 'common'
               ,charset:'utf-8'
               ,target:''
               ,datatype : 'json'
            },
            success : function(data) {
              callbackFn(data, keyword);
            }
          });
        }, 
        goodsRelationQuery : function (keyword, callbackFn) {
          $.ajax({
            url : "/static/search/recommend/relationQuery.jsp",
            type : "post",
            dataType : "json",
            headers: {
              'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
            },
            data : {
               query : keyword,
               datatype : 'json'
            },
            success : function(data) {
              callbackFn(data);
            }
          });
        },        
        goodsCommentInfo: function(keyword, page, callbackFn) {
          var pageSize = 15; // TODO:UPDATE 기획 페이징 당 출력 개수확인
          var startcount = (page) ? ((page-1) * pageSize) : 0; // 시작카운트
          
          $.ajax({
            url : "/static/search/searchAPI.jsp",
            type : "post",
            dataType : "json",
            headers: {
              'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
            },
            data : {
               collection : "VGOODSCOMMENTINFO"
              ,query : (keyword) ? keyword : "" // 검색어
              ,sort : "DATE/DESC,COMMENT_SUM/DESC" // [05/16] IT운영팀 : 최신 등록순 & 별점높은 순으로 정렬 요청 
              ,startcount : startcount
              ,pagesize : pageSize
            },
            success : function(data) {
              callbackFn(data,page);
            }
          });
        },        
        commPopKeyword: function(callbackFn){
          $.ajax({
            url : "/static/search/popword/popword.jsp",
            type : "get",
            headers: {
              'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
            },
            data : {
              target : "popword" , 
              range : "D" ,
              collection : "_ALL_" , 
              datatype : "json" 
            },
            async: false,
            dataType : "json",
            success : function(data) {
              callbackFn(data);
            }
          });
        },        
        stockChkGoods : function(){
          $.ajax({
            url : "/display/goods/stockChkGoodsAjax",
            type : "post",
            headers: {
              'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
            },
            data : {
              goodsCds : stockChkGoods
            },
            dataType : "json",
            success : function(data) {
              //console.log(data);
              for(var i=0; i < data.resultData.length; i++){
                if(data.resultData[i].orderAbleQty <1){
                  if($(".goods"+data.resultData[i].goodsCode).hasClass("sold-out")){
                    //SKIP
                  }else{
                    $(".goods"+data.resultData[i].goodsCode).addClass("sold-out");
                    $(".goods"+data.resultData[i].goodsCode).find(".soldTxt").html("일시품절");
                    if($(".goods"+data.resultData[i].goodsCode).parent().find($(".btn-area")).length > 0) {
											$(".goods"+data.resultData[i].goodsCode).parent().find($(".btn-area")).find("button").attr("disabled",true);
										}
                  }
                }
              }
            }
          });
        },
        igenRecommendGoods: function(apiType , goodsCode , catSn , keyword , $target , mainYn , rcCode ){
          $.ajax({
            url : "/common/goods/igenRecommendGoodsAjax",
            type : "post",
            headers: {
              'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
            },
            data : {
              apiType : apiType , 
              goodsCode : goodsCode ,
              catSn : catSn , 
              keyword : keyword  , 
              mainYn : mainYn , 
              rcCode : rcCode
            },
            dataType : "html",
            async: false,
            success : function(data) {
              $("#"+$target).append(data);
              // lazy 로딩 처리
              if($(".lazy").length > 0){
                if("IntersectionObserver" in window == true){ // 브라우저 observer 지원 여부
                  lazy.observer();
                }else{ // lazyload 처리
                  document.addEventListener("scroll", lazy.lazyload);
                  window.addEventListener("resize", lazy.lazyload);
                  window.addEventListener("orientationChange", lazy.lazyload);
                };
              }
              if($("#"+$target +" > li").length <1){
                $("."+$target).remove();
              }else{
                var recomProduct = new Swiper(".recom-product-list", {
                  slidesPerView: 2.5,
                  spaceBetween: 16,
                  grabCursor: true
                });
              }
            }
          });
        },
        priceComma : function (){
            // 방향키 인경우는 제외 처리(글쓰다가 앞으로 다시 안가지는 경우때문)
            if (event.keyCode >= 37 && event.keyCode <= 40)
                return;
            var val = this.value;
            var re = /[^0-9]/gi;   // 0~9 까지만 허용
            val = val.replace(re, "");
            val = $.eshop.setComma(val);
            this.value = val;
            this.setAttribute("value", val);
        },
        onlyDotNum : function(){
            if(!(event.keyCode == 46 || ( event.keyCode > 47 && event.keyCode < 58 ))){
                return false;
            }
        },

        onlyNumber : function(event){
            event = event || window.event;
            var keyID = (event.which) ? event.which : event.keyCode;
            if ( (keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39 || keyID == 13 || keyID == 9 || keyID == 35 || keyID == 36 || keyID == 17 || keyID == 86 || keyID == 65 || keyID == 67)
                return;
            else
                return false;
        },
        removeChar : function(event){
            event = event || window.event;
            var keyID = (event.which) ? event.which : event.keyCode;
            if ( keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39 )
                return;
            else
                event.target.value = event.target.value.replace(/[^0-9]/g, "");
        },
        onlyEngNum : function(){
            // 방향키 인경우는 제외 처리(글쓰다가 앞으로 다시 안가지는 경우때문)
            if (event.keyCode >= 37 && event.keyCode <= 40)
                return;
            if(event.keyCode == 32)
                return;
            var $val = $(this).val();
            var re = /[^a-z0-9]/gi; // 대소영문자와 0~9까지의 숫자만 허용
            $(this).val($val.replace(re,''));
        },
        // Cookie값 세팅
        setCookie : function(cname, value, expire , domain) {
          var todayValue = new Date();
          todayValue.setDate(todayValue.getDate() + expire);
          document.cookie = cname + "=" + encodeURIComponent(value) + "; domain="+domain+"; expires=" + todayValue.toGMTString() + "; path=/; Secure; SameSite=None;";
        },
        // Cookie값 가져오기
        getCookie : function(name) {
          var cookieName = name + "=";
          var x = 0;
          while ( x <= document.cookie.length ) {
          var y = (x+cookieName.length);

            if (document.cookie.substring( x, y ) == cookieName) {
            if ((lastChrCookie=document.cookie.indexOf(";", y)) == -1)
               lastChrCookie = document.cookie.length;
            return decodeURIComponent(document.cookie.substring(y, lastChrCookie));
           }
           x = document.cookie.indexOf(" ", x ) + 1;
           if ( x == 0 )
            break;
           }
          return "";
        },
        //쿠키 삭제
        removeCookie : function(cookieName , domain){
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() - 1);
          document.cookie = cookieName + "= " + "; value=''; domain="+domain+"; expires=" + expireDate.toGMTString()+";path=/; Secure; SameSite=None;";
        },
        timerStart : function(){
          setInterval("timerInit()",1000);   //1초마다 타이머 
        }, 
        likeGoods : function($this , data){
          //console.log("result",data);
          if(data.resultData.saveType =="I"){
            $($this).addClass("is-like");
          }else{
            $($this).removeClass("is-like");
          }
        },
        likeBrand : function($this , data){
          //console.log("result",data);
          if(data.resultData.saveType =="I"){
            $($this).addClass("is-like");
          }else{
            $($this).removeClass("is-like");
          }
        },
        notKor : function(){
            // 방향키 인경우는 제외 처리(글쓰다가 앞으로 다시 안가지는 경우때문)
            if (event.keyCode >= 37 && event.keyCode <= 40)
                return;
            if(event.keyCode == 32)
                return;
            var $val = $(this).val();
            var re = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g; // 한글제한
            $(this).val($val.replace(re,''));
        },
        setComma : function(num){
            if(typeof(num) =="number") {
                num = num.toString();
            } else if(typeof(num) =="string") {

            } else {
                //console.error("[Function setComma] : number 혹은 string 유형을 입력하세요.");
                return num;
            }
            return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g,"$1,");
        },
		// 이메일 유효성 검사
		emailCheck : function(val){
			var regex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
			if(regex.test(val) == false) {
				return false;
			} else {
				return true;
			}
		},
    //패스워드 유효성 검사
    pwdCheck : function($pwd , $id){
      //pw 체크
       var pw = $($pwd).val();
       var pwPattern1 = /^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W)).{6,12}$/;
       var pwPattern2 = /[<|>|;|:|`|,|.|\\|?|~|!|@|#|$|%|^|&|*|(|)|_|+|-|=|}|{|[|]|"|']/;
       var pwPattern3 = /[0-9a-zA-Z]/;
       var pwPattern4 = /(\w)\1\1/;
       var pwPattern5 = /([\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"])\1\1/;
       
       if (!pwPattern1.test($($pwd).val())){
        var errMsg ="영문, 숫자, 특수문자를 포함한 6~12자리 이내로 사용 가능합니다.";
        callbackPwdCheck(false ,errMsg);
        return false;
      }
      if(!pwPattern2.test($($pwd).val())){
        var errMsg ="입력하신 특수문자는 사용하실 수 없습니다. 사용 가능 특수문자(!"+'"'+"#$%&"+"'"+"(*+,-:;<=>?@[]^_`{|}~\)";
        callbackPwdCheck(false ,errMsg);
        return false;
      }
      
      var specialCnt = 0;
      for(var i = 0; i<pw.length; i++){
         var txt = pw.substring(i,i+1);
         if(!pwPattern3.test(txt) && !pwPattern2.test(txt)){
           specialCnt ++;
         }
      }
      if(specialCnt >0){
        var errMsg ="입력하신 특수문자는 사용하실 수 없습니다. 사용 가능 특수문자(!"+'"'+"#$%&"+"'"+"(*+,-:;<=>?@[]^_`{|}~\)";
        callbackPwdCheck(false ,errMsg);
        return false;
      }
      if(pwPattern4.test($($pwd).val()) || pwPattern5.test($($pwd).val())){
        var errMsg ="3자 이상 연속되거나 동일한 문자는 사용하실 수 없습니다.";
        callbackPwdCheck(false ,errMsg);
        return false;
      }
      if($.eshopfront.pwdCheckRule(pw)){
        var errMsg ="3자 이상 연속되거나 동일한 문자는 사용하실 수 없습니다.";
        callbackPwdCheck(false ,errMsg);
        return false;
      }
      
      var idArr = [];
      var cIdx = 3;
      var idVal = $($id).val();
      for(var i=0; i+cIdx <= idVal.length; i++){
        idArr[i] = idVal.substring(i, i+cIdx);
        if($($pwd).val().search(idArr[i]) > -1 )
        {
          var errMsg ="ID와 연속 3자리 이상 중복된 비밀번호는 사용하실 수 없습니다.";
          callbackPwdCheck(false ,errMsg);
          return false;
        }
      }
      return true;
    },
    pwdCheckRule : function (str){
      var max = 3; // 글자수를 지정하지 않으면 4로 지정
      var i, j, k, x, y;
      var buff = ["0123456789","9876543210", "abcdefghijklmnopqrstuvwxyz","zyxwvutsrqponmlkjihgfedcba", "ABCDEFGHIJKLMNOPQRSTUVWXYZ","ZYXWVUTSRQPONMLKJIHGFEDCBA"];
      var src, src2, ptn="";
  
      for(i=0; i<buff.length; i++){
          src = buff[i]; // 0123456789
          src2 = buff[i] + buff[i]; // 01234567890123456789
          for(j=0; j<src.length; j++){
              x = src.substr(j, 1); // 0
              y = src2.substr(j, max); // 0123
              ptn += "["+x+"]{"+max+",}|"; // [0]{4,}|0123|[1]{4,}|1234|...
              ptn += y+"|";
          }
      }
      ptn = new RegExp(ptn.replace(/.$/, "")); // 맨마지막의 글자를 하나 없애고 정규식으로 만든다.
  
      if(ptn.test(str)) return true;
      return false;
    },
		//휴대폰번호 유효성 검사
		phoneCheck : function(val){
			var regex = /^\d{3}\d{3,4}\d{4}$/;
			if(regex.test(val) == false) {
				return false;
			} else {
				return true;
			}
		},
		//전화번호 유효성 검사
		telCheck : function(val){
			var regex = /^\d{2,3}\d{3,4}\d{4}$/;
			if(regex.test(val) == false) {
				return false;
			} else {
				return true;
			}
		},
   
		tooltip: {
			autoSet: function(){
				var _this = this;
				$('[data-tooltip]').each(function(){
					_this.init($(this), $(this).data('tooltip'));
				});
			},
			init: function($el, content){
				if(!$.trim(content)){
					return null;
				}
				var $layer = $('<div style="display:none;" class="tooltip-layer" >' + content +'</div>');
				$(document.body).append($layer);

				var timerId = null;
				var pageX, pageY;
				$el.on('mouseenter', function(event){
					timerId = setTimeout(function(){
						$layer.css('left', pageX + 10);
						$layer.css('top', pageY + 10);
						$layer.show();
					}, 300);
				});
				$el.on('mousemove', function(event){
					pageX = event.pageX || event.clientX;
					pageY = event.pageY || event.clientY;
				});
				$el.on('mouseleave', function(event){
					clearTimeout(timerId);
					$layer.hide();
				});

				$el.on('click', function(event){
					clearTimeout(timerId);
					$layer.hide();
				});

				return $layer;
			}
		},
   	 //$el 입력 값 초기화
     clearInput : function($el) {
         var $form = $('<form />');
         $el.replaceWith($form);
         $form.append($el);
         $form[0].reset();
         $form.replaceWith($el);
         $el.find(':input:not(button,:button,:radio,:checkbox)').each(function () {
             if(!$(this).hasClass('d-clone')) {
                 this.value = '';
                 this.setAttribute("value", "");
             }
         });
         $el.find(':radio, :checkbox').each(function () {
             this.checked = false;
             this.removeAttribute("ckecked");
             this.disabled = false;
             this.removeAttribute("disabled");
         });
         $el.find(".txt-red").filter(function(){return !($(this).text() === "*");}).remove();
         $el.find("span").each(function(){
             if($(this).text() !== "*" && !$(this).hasClass('d-clone') ){
                 $(this).text("");
             }
         });
     },
	   //체크 박스 공통
        initCheck : function(){
        	//동적 checkbox 생성시 bind 제거
        	$(".c-chkall,.c-chksel").unbind();
        	$(".c-chkall").on("click", function(){
        		if($(".c-chkall").is(":checked")){
        			$(".c-chksel").prop("checked",true);
        		}else{
        			$(".c-chksel").prop("checked",false);
        		}
        	});
        	$(".c-chksel").on("click", function(){
        		if($(".c-chksel:checked").length == $(".c-chksel").length){
        			$(".c-chkall").prop("checked",true);
        		}else{
        			$(".c-chkall").prop("checked",false);
        		}
        	});
        },
        setCookieDays: function(key, value, days) {
          $.cookie(key, value, {expires: days, path: '/'});
        },
        setCookieHours: function(key, value, hours) {
          var date = new Date();
          date.setTime(date.getTime() + 1000 * 60 * 60 * hours);
          $.cookie(key, value, {expires: date, path: '/'});
        },
        setCookieMinute: function(key, value, minute) {
          var date = new Date();
          date.setTime(date.getTime() + 1000 * 60 * minute);
          $.cookie(key, value, {expires: date, path: '/'});
        },
        insertCart: function(goodsList, confirmMsgYn){
          insertCart(goodsList, confirmMsgYn);
        },
        directOrder: function(goodsInfo, confirmMsgYn){
          directOrder(goodsInfo, confirmMsgYn);
        },
	      messageAlert: function(msg){
        	messageAlert(msg);
      	},
    };
	$.eshopfront = $eshopfront;
})($.eshopfront,jQuery);

function wingNewly(type, sn, delYn, gubun){
  $.ajax({
    url : "/common/updateWingNewly",
    type : "get",
    headers: {
      'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
    },
    data : {
      type : type , 
      sn  : sn
    },
    dataType : "json",
    success : function(data) {
      if(delYn =="Y"){
        $(".wing"+sn).remove();
        if(gubun =="1"){
          if($(".wingGoodsDiv").length <1){
            $(".wingGoodsList").remove();
            $(".wingGoodsNoData").show();
          }
        }else{
          if($(".wingGoodsDiv").length <1){
            $(".wingPromoList").remove();
            $(".wingPromoNoData").show();
          }
        }
      }
    }
  });
}

function timerInit(){
  $(".timerInit").each(function(){
    var $this = $(this);
    var setTime = $($this).data("second");
    if(setTime >0){
      var minute = Math.floor((setTime /60)%60) < 10 ? "0"+Math.floor((setTime /60)%60) : Math.floor((setTime /60)%60);
      var second = Math.floor(setTime %60) < 10 ? "0"+Math.floor(setTime %60) : Math.floor(setTime %60);
      var hour = Math.floor((setTime/60)/60) < 10 ? "0"+Math.floor((setTime/60)/60) : Math.floor((setTime/60)/60);
      setTime--;
      $($this).data("second",setTime); 
      $($this).html(hour+":"+minute+":"+second);  
    }else{
      $($this).removeClass("timerInit");
    }
  });  
}

//한글을 지우는 부분
function delHangle(evt){ 
  var objTarget = evt.srcElement || evt.target;
    var _value = event.srcElement.value;  
    if(/[ㄱ-ㅎㅏ-ㅡ가-핳]/g.test(_value)) { 
      objTarget.value = null;
    }
} 

//숫자를 제외한 값을 입력하지 못하게 한다.
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    // Textbox value       
    var _value = event.srcElement.value;     

    if (event.keyCode < 48 || event.keyCode > 57) { 
        if (event.keyCode != 32 && event.keyCode != 42) { //숫자와 공백 만 입력가능하도록함
            return false; 
        } 
    }
}

//숫자만 입력
function isNumber(obj) {
  $(obj).val($(obj).val().replace(/[^0-9]/g,""));
}

/**
 * 공백 여부 
 */
 function isNotEmpty(str){
	var obj = String(str);
	if(obj == null || obj == undefined || obj == 'null' || obj == 'undefined' || obj == '' || obj.trim() == '') {
		return false;
	} else {
		return true;
	}
}

/**
 * 공백 여부 
 */
function isEmpty(str){
	return !isNotEmpty(str);
}

/**
 * 한글/영문외 문자열 포함 여부 
 */
function onlyHanAndEng(str){
	var re = /[^a-zㄱ-ㅎㅏ-ㅣ가-힣]/gi;
  return re.test(str);
}

/*
 * 숫자외 문자열 포함 여부
 */	
function onlyNumber(str){
	var re = /[^0-9]/gi;
  return re.test(str);
}

/* IOS Web 여부 */
function isIOSWeb(){
	var mobileKeyWords = new Array('iPhone', 'iPod','iPad');
	var iosYn = 0;
	for (var i = 0 ; i < mobileKeyWords.length ; i++){
		//모바일 디바이스로 접속일때
		if (navigator.userAgent.match(mobileKeyWords[i]) != null){
			iosYn = 1;
		}
	}
	return iosYn;
}

/* IOS 여부 */
function isIOS(){
  return isApp() && OSCD === "02";
}
/* Android 여부 */
function isAndroid(){
  return isApp() && OSCD === "01";
}

/* App 여부 */
function isApp(){
  return DEVICECD === "03";
}

/* PC Web 여부 */
function isPcWeb(){
  return DEVICECD === "01";
}

function scriptReplace(str){
  if (str == undefined || str == null){
    return "";
  }
  str = str.replace(/\</g,"&lt;");
  str = str.replace(/\>/g,"&gt;");
  str = str.replace(/\"/g,"&quot;");
  return str;
}

/**
 * 쿠폰 다운로드 
 * param : 상품코드 array
 */
function dnldPromtCpn(promoNoList, callback){
  if (ISLOGIN != 'Y') {
    execLogin(location.href.replace(location.origin, ""));
    return false;
  }
  //TODO: param 상품코드로 조회하여 관련 쿠폰 모두 다운로드 처리 ajax 추가 필요
  var promoNoLists = [];
  if(promoNoList.indexOf(",") > 0){
    var nos = promoNoList.split(",");
    for(var i = 0; i < nos.length; i++){
      var promoNos = {};
      promoNos["promoNo"] = nos[i];
      promoNoLists[i] = promoNos;
    }
  }else{
    var promoNos = {};
    promoNos["promoNo"] = promoNoList;
    promoNoLists[0] = promoNos;
  }
  params = {
    "promoNoList" : promoNoLists,
  }
  
  $.ajax({ 
    url : '/coupon/couponDown',
    type: 'POST',
    data : JSON.stringify(params),
    dataType: 'json',
    contentType : "application/json;charset=UTF-8",
    async : false,
    headers: {
      "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
    },
    success: function(result){
      if(result.status == 200){
        if(result.successCnt > 0){
          alert("쿠폰 발급이 완료되었습니다.");
          if(typeof callback == "function"){
            callback(true);
          }
        }else if(result.dupCnt > 0){
          //alert("<spring:message code='promotion.coupon.alert.ALF_7003'/>");
          alert("이미 발급된 쿠폰입니다.");
        }else{
          alert(result.message);
        }
      }
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.error(jqXHR, textStatus, errorThrown);
      alert("시스템 에러가 발생했습니다.\n잠시 후 다시 시도 해 주세요.");
    }
  });
  
  //TODO: msg정의 필요 
  /*var returnMsg = "쿠폰 다운로드가 완료되었습니다"; 
  alert(returnMsg);*/
}

/**
 * 앱에 브릿지를 보낼때 사용
 */
function sendAppBridge(bridgeName) {
  if (window.webkit != undefined && window.webkit.messageHandlers != undefined && window.webkit.messageHandlers.shoppingntapp != undefined && window.webkit.messageHandlers.shoppingntapp.postMessage != undefined) {
    window.webkit.messageHandlers.shoppingntapp.postMessage(bridgeName);
  }
}

// 날짜형 데이터의 구분자를 
function transDateSepr(dateStr, sepr) {
  sepr = sepr || '-'
  return dateStr.replace(/[-./]/g, sepr);
}

// 세션스토리지에서 값 조회
function getSSValue(key) {
  return sessionStorage.getItem(key);
}

// 세션스토리지에 값 저장
function setSSValue(key, value) {
  sessionStorage.setItem(key, value);
}

// 세션스토리지에 값 삭제
function removeSSValue(key) {
  sessionStorage.removeItem(key);
}

// 로컬스토리지에서 값 조회
function getLSValue(key) {
  return localStorage.getItem(key);
}

// 로컬스토리지에 값 저장
function setLSValue(key, value) {
  localStorage.setItem(key, value);
}

// 로컬스토리지에 값 삭제
function removeLSValue(key) {
  localStorage.removeItem(key);
}

// as-is : js-common.vm 옮겨옴
function playVideo(_url, playerIdx, goodsCode, goodsName, live, price, endDate , _onairAreaElId){
    var movieUrl = _url;
    var headerHeight = jQuery("#header").height();     //공통GNB 높이
    var gnbWrapHeight = 0;                                  //홈 탭, 네비게이션바 높이
    var subboxHeight = 0;                                   //하위메뉴 높이

    var defaultTopPosition = 0;                             //영상 재생시 최초 노출 Y좌표
    var limitTopPosition = 0;                               //스크롤 다운 시 이동 가능한 Y좌표 상한선
    var onairAreaPosition = -1;                             //온에어 클립 배너 엘리먼트 Y좌표 오프셋
    var scrollPosition = 0;                                 //현재 스크롤 Y좌표

    //playerIdx = 0인경우에는 상품상세, 그외 메인에서는 1이 리턴됨(as-is호환성 유지)
    if (playerIdx == "1") {
        //메인인 경우에는 공통GNB,홈탭바,하위메뉴(노출시 한정)의 height를 모두 합한다.
        gnbWrapHeight = jQuery('.tv-date-wrap').height();
        //subboxHeight = jQuery(".lnb_subbox").height();
        limitTopPosition = headerHeight + gnbWrapHeight;
    } else {
        //var headerHeight = jQuery("#header").height();     //공통GNB 높이
        //메인이 아닌 경우에는 스크롤 다운 시 영상 노멀뷰 레이아웃은 화면 맨 위까지 올라갈 수 있다.
        limitTopPosition = 0;
    }
    //영상 재생 시작 시 기본 위치
    defaultTopPosition = (headerHeight + gnbWrapHeight + subboxHeight);

    // 온에어 클립 등에서 영상 재생 시, 해당 클립 배너의 offsetTop좌표를 전달하여 앱에서 해당 위치에 영상을 기본적으로 위치시킬 수 있도록 한다.
    if (_onairAreaElId) {
        onairAreaPosition =  jQuery("#" + _onairAreaElId)[0].offsetTop;
    }
    scrollPosition = window.scrollY;


    if(!confirm('실시간 방송을 시청하시려면, 3G/4G 환경에서는 사용자 요금에 따라 요금이 부가될 수 있습니다. 시청하시겠습니까?')){
        if(endDate) {
            endDate = new Date(endDate);
            var curDate = new Date();
            var leftTime = (endDate - curDate) / 1000;
            jQuery('#time').attr('leftTime', leftTime);
        } else {
            endDate = new Date();
        }
        return false;
    }

    if(endDate) {
        endDate = new Date(endDate);
        var curDate = new Date();
        var leftTime = (endDate - curDate) / 1000;
        jQuery('#time').attr('leftTime', leftTime);
    } else {
        endDate = new Date();
    }

    if(_url != ""){

        var lbsParam = {
            said				:"LBSTEST",
            asset_id			:"10010",
            zone				:"HOT",
            path				:_url,
            request_bit_rate	:"S",
            stream_count		:"2",
            ad_path				:"none",
            protocol			:"HTTP",
            otu_encoding		:"0",
            otu_expirementime	:"120",
            client_ip			:"LBSTEST",
            said				:"0.0.0.0",
            level				:"0"
        }
        if(live == "true"){
            lbsParam.svc = "LIVE";
        }else{
            lbsParam.svc = "VOD";
        }

        try{
            if(live == "true"){
                movieUrl = LIVE_PATH+_url;
            }else{
                movieUrl = VOD_PATH+_url;
            }
            if (isApp()) {
                live = live || "false";
                var playParams = {
                    "src" : movieUrl,
                    "live" : live,
                    "linkUrl" : ( goodsCode != "" ? "/display/goods/"+goodsCode : "" ),
                    "price" : price,
                    "playerX" : playerIdx,
                    "defaultTopPosition" : defaultTopPosition,
                    "limitTopPosition" : limitTopPosition,
                    "videoBannerPosition" : onairAreaPosition,
                    "scrollPosition" : scrollPosition,
                    "title" : goodsName,
                    "endDate" : endDate
                };
                window.location = "netplay://playVideo?q=" + JSON.stringify(playParams);
            }else {
                window.location = movieUrl;
            }
        }catch(e){
            alert('동영상이 존재하지 않습니다.');
        }

    }else{
        alert('동영상이 존재하지 않습니다.');
    }
}

function setupVideo(type, playerIdx, menuArr){

    //console.log(JSON.stringify(menuArr));
    var r = 1;
    var heightP = 0;

    if(typeof endDate == "undefined") {
        endDate = "0";
    }

    // 임시
    if (isIOS() && !isApp()) return;

    if (!isIOS()) {
        r = window.devicePixelRatio;
    }

    if(type == "view"){
        if(isIOS()) {
            heightP = 81;
        } else {
            heightP = 80;
        }
    }

    var setupParams = {
        "default" : {
            "pmode" : {
                "x" :  "p",
                "y" :  "p",
                "w" :  "p",
                "h" :  "p"
            },
            "position" : {
                "x" :  "0",
                "y" :  "0",
                "w" :  "1.0",
                "h" :  "0"
            },
            "limit" : {
                "l" :  "0",
                "r" :  "1.0",
                "t" :  "0",
                "b" :  "1.0"
            },
            "mmode" : "true",
            "dmode" : "zoom",
            "menu" : {
                "top" : "true",
                "middle" : "false",
                "bottom" : "true",
                "custom" : "false"
            }
        },
        "zoom" : {
            "pmode" : {
                "x" :  "r",
                "y" :  "r",
                "w" :  "r",
                "h" :  "r"
            },
            "position" : {
                "x" :  "0.05",
                "y" :  "0.12",
                "w" :  "0.4",
                "h" :  "0"
            },
            "rarea" : {
                "l" :  "0",
                "r" :  "1.0",
                "t" :  "0",
                "b" :  "0.5"
            },
            "mmode" : "true",
            "dmode" : "zoom",
            "dtype" : "down",
            "menu" : {
                "top" : "true",
                "middle" : "true",
                "bottom" : "true",
                "custom" : "true"
            }
        },
        "full" : {
            "status" : "true",
            "mmode" : "true",
            "menu" : {
                "top" : "false",
                "middle" : "true",
                "bottom" : "true",
                "custom" : "true"
            }
        },
        "scroll" : {
            "attach" : "true",
            "limit" : {
                "l" :  "0",
                "r" :  "1.0",
                "t" :  "0",
                "b" :  "1.0"
            },
            "position" : {
                "x" :  "0",
                "y" :  String(Math.floor((heightP) * r))
            }
        }
    };
    var pramObj;
    if(menuArr){
        pramObj = {
            videoParam :setupParams,
            mainmenuParam : menuArr
        }
    }else{
        pramObj = {
            videoParam :setupParams
        }
    }

    if(isIOS()){
        window.location = "netplay://setupVideo?q=" + JSON.stringify(setupParams) + "&main=" + JSON.stringify(menuArr);
    }else{
        window.location = "netplay://setupVideo?q=" + JSON.stringify(pramObj);
    }
}

/* 장바구니 등록 
- goodsList: 상품목록
- singleOrderYn: 단독상품 여부(기본값: N)
- entpPageYn: 묶음배송상품 더보기 버튼 클릭 시, 장바구니 저장후 업체 이동(기본값: 0)
*/
function insertCart(goodsList, confirmMsgYn){
  /** 상품정보 (장바구니 담을떄 요청 데이터)
  goodsList = [
   {
    "goodsCd" : "30000415", //상품코드
    "goodsNm" : "상품명", //상품명
    "sitemCd" : "001", //단품코드
    "sitemDtl" : "옵션명", //단품 상세
    "goodsQty" : "1", //상품수량
    "setYn":"N", //*세트여부
    "directOrderYn" : "N", //바로구매 여부 (상품상세, 마이페이지 재구매 에서 바로구매 경우 "Y")
    "snglnsOrdYn": "N", //* 단독주문여부
    "frmlsGoodsScn": "N", //* 무형상품 구분 
    "shoppingntAmt": "50000", //* 쇼핑엔티 가격
    "tvExpYn": "N", //* TV 쇼핑 여부 
    "brdcstSaleGoodsYn": "N", //* 방송중 구매 상품 여부 
    "gftPromtList" : [{ //사은품 list       
      "goodsCd" : "30000141", //상품(사은품)코드
      "goodsNm" : "사은품명", //상품(사은품)명
      "sitemCd" : "001", //단품코드
      "goodsQty" : "1", //상품(사은품)수량       
      "promtLinkSn" : "MI0000000008", //프로모션 일련번호 -- 사용안함
      "gftTunm" : "001" //사은품 순번 -- 사용안함
    }]    
   }
 ];
  */

//* TODO - 상품 상세 개발 이후 확인 필요 (2022.04.22 Younghun.Kim)
//* 상품 상세에서 장바구니 등록 시, 사은품 정보를 같이 전달.
//* #if("1" == "$!{$goods.promoGift.size()}" && "1" == "$listTool.get($goods.promoGift, 0).size()")
//*      lid = "$!{goods.promoGift.get(0).tpromogift.get(0).allGoodsdt.get(0).goodsdtCode}";
//*#end
//*#foreach($promogift in $goods.promoGift)
//*   #if($esc.html($!{promogift.tpromom.doType}) == '10' && $esc.html($!{promogift.tpromom.couponYn}) == '0')
//*       #foreach($tpromogift in ${promogift.tpromogift})
//*           giftCnt++;
//*       #end
//*   #end
//*#end
 
  //console.log("##### insertCart params - goodsList" , JSON.stringify(goodsList));
  
  if(goodsList.length < 1){
   alert("상품이 없습니다.");
   return;
  }
  if(goodsList.length > 0 ){
    for(let i = 0; i < goodsList.length ; i++){
      if(goodsList[i].goodsQty < 1 ){
        alert("상품의 수량은 1개이상 가능합니다.");
        return false;
      }
    }
  }
   
  //* 단독 상품은 바로 구매만 가능
  for(let i = 0; i < goodsList.length; i++){
   if(goodsList[i].snglnsOrdYn == "Y"){
       alert("단독 주문 상품은 장바구니에 담을 수 없습니다.")
       return false;
   }
  }
  
  var insertResult = false;
  if(headerType == "01" || headerType == "03" || headerType == "04" ){// 헤더에 장바구니 있는 경우만 count 
    if(ISLOGIN != 'N' && ( $("#ssCartCount").html().trim() == '99+' || (parseInt($("#ssCartCount").html().trim()) + goodsList.length) > 100)){
      
        if(!cartOverCnt(goodsList)){
          return false;
        } else {
          goodsList[0].lastGoodsCartFlag = "Y";
        }
      
    }
  }
  
  //* AS-IS 장바구니 저장시 호출되는 리타겟팅 스크립트(확인후 추가 필요 : 2022.04.22 Younhhun.Kim)
  if("Y" == advtProcessOn){
    /*HSMOA Target Script Start*/
    let product_list  = [];
    for(let i = 0 ; i < goodsList.length ; i++){
      product_list.push(goodsList[i].goodsCd);
    }

    window.buzzni_rt.sendBasket(account, site, user_id, email, product_list, from_hsmoa); //홈쇼핑모아 리타겟팅 스크립트 메인에서 호출 시 
    /*HSMOA Target Script End*/

    //* 20220729 aceCounter 광고스크립트 제거 - 계약 만료 
    /*try{
      for(i = 0 ; i < goodsList.length ; i++){ 
        AM_PRODUCT(goodsList[i].goodsQty);
      }
    }catch(e){}*/
  }

  $.ajax({
   url : '/cart/insertCartAjax',
   type: 'POST',
   data : JSON.stringify(goodsList),
   dataType: 'json',
   contentType : "application/json;charset=UTF-8",
   async : false,
   headers: {
     "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
   },
   success: function(result){
     //console.log("result",result);
     if( result.resultCode === "0000"){
       
       //* 상품 카운트
       if(result.resultData > 0){
         
         if(result.resultData > 99){
           $("#ssCartCount").html("99+");
         } else {
           $("#ssCartCount").html(result.resultData);
         }
         
         $("#ssCartCount").css('display','')
       } else {
         $("#ssCartCount").css('display','none')
       }
       
       insertResult = true;       

       if("Y" == advtProcessOn){
         //* 에어브릿지 장바구니 담기(외부 연동 주석 처리 (로컬 실행용))
         var goods1 = "";
         for(let i = 0 ; i < goodsList.length ; i++){ 
           
           goods1 = "";
           
           if(goodsList[i].tvExpYn == 'Y'){
             goods1 = "TV쇼핑";
           } else {
             goods1 = "일반"
           }
           
           if(goodsList[i].brdcstSaleGoodsYn == 'Y'){
             goods1 = goods1 + "_온에어";
           } else {
             goods1 = goods1 + "_OSMU";
           }
           
           airbridge.events.send("airbridge.ecommerce.product.addedToCart", {
             action : '장바구니담기',
             semanticAttributes: {
               cartID : '', //공백으로 담도록 고훈과장님이랑 협의 완료 
               products: [{
                 productID: goodsList[i].goodsCd,
                 name: goodsList[i].goodsNm,
                 price: Number(goodsList[i].shoppingntAmt),
                 quantity: goodsList[i].goodsQty,
                 currency: goods1
               }]
             }
           });
         }
         //* 에어브릿지 장바구니 담기    
       }
       
       // 브레이즈 장바구니 담기
       for(let i = 0 ; i < goodsList.length ; i++){ 
         var brazeProp = {};
         brazeProp.product_id = goodsList[i].goodsCd;
         brazeProp.product_name = goodsList[i].goodsNm;
         brazeProp.price = Number(goodsList[i].shoppingntAmt);
         brazeProp.quantity = goodsList[i].goodsQty;
         
         brazeLogCustomEventWithProperties('added_to_cart', brazeProp);
       }
       // 브레이즈 장바구니 담기
       
       if(confirmMsgYn === 'Y'){
         if( confirm("장바구니에 상품이 담겼습니다."+"\n"+"장바구니로 이동하시겠습니까?")) {
           location.href = "/cart";
         } else {
           var perPageUrl = location.href.replace(location.origin, "");
           if(perPageUrl.indexOf("/display/deal/") > -1 || perPageUrl.indexOf("/display/goods/") > -1) {
             popup.close("#pop-prd-option"); // 상품상세 옵션 선택창
           }
         }
       }
     } else if(result.resultCode === "UNAUTHORIZED"){
       
       
       if(ISLOGIN == "Y" && ISMEMBER == "N") {
         var msg = "해당 서비스는 회원만 이용가능합니다.\n로그인하시겠습니까?"
         var check = confirm(msg);
         if(check) {
           $('#logoutForm #returnUrl').val("/login?returnUrl=/cart");
           $('#logoutForm')[0].submit();
         } else {
           var perPageUrl = location.href.replace(location.origin, "");
           if(perPageUrl.indexOf("/display/deal/") > -1 || perPageUrl.indexOf("/display/goods/") > -1) {
             popup.close("#pop-prd-option"); // 상품상세 옵션 선택창
           }
         }
       } else if(ISLOGIN == "N") {
         if(confirm("로그인 후 이용 가능합니다.\n로그인페이지로 이동하시겠습니까?")) {
           window.location.href = "/login?returnUrl=/cart";
         } else {
           var perPageUrl = location.href.replace(location.origin, "");
           if(perPageUrl.indexOf("/display/deal/") > -1 || perPageUrl.indexOf("/display/goods/") > -1) {
             popup.close("#pop-prd-option"); // 상품상세 옵션 선택창
           }
         }
       }
       
     
     } else if(result.resultCode !== "0000" && result.resultMsg !== ''){
         alert(result.resultMsg); //* 메세지 처리 필요
     }
   },
   error: function(jqXHR, textStatus, errorThrown){
     console.error(jqXHR, textStatus, errorThrown);
     alert("시스템 에러가 발생했습니다."+"\n"+"잠시 후 다시 시도 해 주세요.");
   }
  });
  
  return insertResult;
}

/** 바로 구매하기 */
function directOrder(goodsList, confirmMsgYn){
  /** 상품정보 (장바구니 담을떄 요청 데이터)
  goodsList = [
   {
    "goodsCd" : "30000415", //상품코드
    "goodsNm" : "상품명", //상품명
    "sitemCd" : "001", //단품코드
    "sitemDtl" : "옵션명", //단품 상세
    "goodsQty" : "1", //상품수량
    "setYn":"N", //*세트여부
    "directOrderYn" : "N", //바로구매 여부 (상품상세, 마이페이지 재구매 에서 바로구매 경우 "Y")
    "snglnsOrdYn": "N", //* 단독주문여부
    "frmlsGoodsScn": "N", //* 무형상품 구분     
    "shoppingntAmt": "50000", //* 쇼핑엔티 가격
    "tvExpYn": "N", //* TV 쇼핑 여부 
    "brdcstSaleGoodsYn": "N", //* 방송중 구매 상품 여부 
    "gftPromtList" : [{ //사은품 list       
      "goodsCd" : "30000141", //상품(사은품)코드
      "goodsNm" : "사은품명", //상품(사은품)명
      "sitemCd" : "001", //단품코드
      "goodsQty" : "1", //상품(사은품)수량       
      "promtLinkSn" : "MI0000000008", //프로모션 일련번호 -- 사용안함
      "gftTunm" : "001" //사은품 순번 -- 사용안함
    }]    
   }
 ];
 
  */
//* TODO - 상품 상세 개발 이후 확인 필요 (2022.04.22 Younghun.Kim)
//* 상품 상세에서 장바구니 등록 시, 사은품 정보를 같이 전달.
//* #if("1" == "$!{$goods.promoGift.size()}" && "1" == "$listTool.get($goods.promoGift, 0).size()")
//*      lid = "$!{goods.promoGift.get(0).tpromogift.get(0).allGoodsdt.get(0).goodsdtCode}";
//*#end
//*#foreach($promogift in $goods.promoGift)
//*   #if($esc.html($!{promogift.tpromom.doType}) == '10' && $esc.html($!{promogift.tpromom.couponYn}) == '0')
//*       #foreach($tpromogift in ${promogift.tpromogift})
//*           giftCnt++;
//*       #end
//*   #end
//*#end
 

//console.log("##### insertCart params - goodsList" , goodsList);

if(goodsList.length < 1){
 alert("상품이 없습니다.");
 return;
}
if(goodsList.length > 0 ){
  for(let i = 0; i < goodsList.length ; i++){
    if(goodsList[i].goodsQty < 1 ){
      alert("상품의 수량은 1개이상 가능합니다.");
      return false;
    }
  }
}

	//* AS-IS 장바구니 저장시 호출되는 리타겟팅 스크립트(확인후 추가 필요 : 2022.04.22 Younhhun.Kim)
if("Y" == advtProcessOn){
  /*HSMOA Target Script Start*/
  let product_list  = [];
  for(let i = 0 ; i < goodsList.length ; i++){
    product_list.push(goodsList[i].goodsCd);
  }

  window.buzzni_rt.sendBasket(account, site, user_id, email, product_list, from_hsmoa); //홈쇼핑모아 리타겟팅 스크립트 메인에서 호출 시 
  /*HSMOA Target Script End*/

  //* 20220729 aceCounter 광고스크립트 제거 - 계약 만료 
  /*try{
    for(i = 0 ; i < goodsList.length ; i++){ 
      AM_PRODUCT(goodsList[i].goodsQty);
    }
  }catch(e){}*/
}

var insertResult = false;
$.ajax({
 url : '/cart/insertCartAjax',
 type: 'POST',
 data : JSON.stringify(goodsList),
 dataType: 'json',
 contentType : "application/json;charset=UTF-8",
 async : false,
 headers: {
   "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
 },
 success: function(result){
   //console.log("result",result);
   if( result.resultCode === "0000"){
     insertResult = true;       
     //* TODO - 묶음배송상품 더보기 버튼 클릭 시, 장바구니 저장후 업체 이동

     if("Y" == advtProcessOn){
       //* 에어브릿지 장바구니 담기(외부 연동 주석 처리 (로컬 실행용))
       var goods1 = "";
       for(let i = 0 ; i < goodsList.length ; i++){ 
         
         goods1 = "";
         
         if(goodsList[i].tvExpYn == 'Y'){
           goods1 = "TV쇼핑";
         } else {
           goods1 = "일반"
         }
         
         if(goodsList[i].brdcstSaleGoodsYn == 'Y'){
           goods1 = goods1 + "_온에어";
         } else {
           goods1 = goods1 + "_OSMU";
         }
         
         airbridge.events.send("airbridge.ecommerce.product.addedToCart", {
           action : '장바구니담기',
           semanticAttributes: {
             cartID : '', //공백으로 담도록 고훈과장님이랑 협의 완료 
             products: [{
               productID: goodsList[i].goodsCd,
               name: goodsList[i].goodsNm,
               price: Number(goodsList[i].shoppingntAmt),
               quantity: goodsList[i].goodsQty,
               currency: goods1
             }]
           }
         });
       }
       //* 에어브릿지 장바구니 담기  
     }
     
     //앱으로 이동
     if(redirectAppOrder()) {
       return false;
     }
     //* 주문서로 이동    
     location.href = "/order/sheet";
   } else if(result.resultCode === "UNAUTHORIZED"){
     
     if( confirm("로그인 후 이용 가능합니다.\n로그인페이지로 이동하시겠습니까?")) {
       location.href = "/login?returnUrl=/order/sheet";
//       location.href = "/login?returnUrl=" + location.pathname;
//       location.href = "/login?returnUrl=" + location.pathname + "&forwardUrl=" + location.pathname;
     } else {
       var perPageUrl = location.href.replace(location.origin, "");
       if(perPageUrl.indexOf("/display/deal/") > -1 || perPageUrl.indexOf("/display/goods/") > -1) {
         popup.close("#pop-prd-option"); // 상품상세 옵션 선택창
       }
     }
     
   } else if(result.resultCode !== "0000" && result.resultMsg !== ''){
       alert(result.resultMsg); //* 메세지 처리 필요
   }
 },
   error: function(jqXHR, textStatus, errorThrown){
     console.error(jqXHR, textStatus, errorThrown);
     alert("시스템 에러가 발생했습니다.\n잠시 후 다시 시도 해 주세요.");
   }
  });

  return insertResult;
}

// 
function getCookieKwdArr(domain) {
  var prevKwd = $.eshopfront.cmm.getCookie("ntRcntSrchKwd", domain);
  var kwdArr = (prevKwd) ? prevKwd.split("@|@") : [];
  if (kwdArr.length < 1) {
    kwdArr = [];
  }
  return kwdArr;
}
// 
function addCookieKwdArr(kwd, domain) {
  var kwdArr = getCookieKwdArr(domain);
  if (kwdArr.length > 19) {
    kwdArr = kwdArr.splice(0, 19);
  }
  kwdArr.unshift(kwd);
  var rtnStr = "";
  for (var i in kwdArr) {
    rtnStr += ((rtnStr == "" ? "" : "@|@") + kwdArr[i]);
  }
  return rtnStr;
}


//인기검색어 클릭시 자동완성 여부에 따라 값 저장
function  commPopSubKeyWord(val ,domain){

  if(typeof domain == "undefined"){
    domain = "";
  }
  
  if ($('#switch').is(':checked')) {
     
    var arrFlag = "Y";
    var arr = getCookieKwdArr(domain);
    
    for(i in arr){
      if(arr[i] == val){
        arrFlag = "N";
      }
    }
    
    if(arrFlag =="Y"){
      setCookieKwd(val ,domain);
    }
  }
  location.href ="/display/goods/search/page/result?keywordSearch="+val+"";
}

// 
function setCookieKwd(kwd, domain) {
  $.eshopfront.cmm.setCookie("ntRcntSrchKwd", addCookieKwdArr(kwd, domain), 7, domain);
}

/**
 * 앱 다운로드 바로가기
 */
function goAppDown() {
  if(isIOSWeb() === 1) {
    window.location.href = "https://itunes.apple.com/kr/app/syoping-ent/id1004806037?mt=8";
  } else {
    window.location.href = "http://play.google.com/store/apps/details?id=com.shoppingntmall.mcapp";
  }
}

/**
 * 날짜 데이터를 문자열로 변환
 * @param {*} inpDate 날짜형 데이터
 * @returns 'YYYY.MM.DD' 문자열 날짜
 */
function getDate2Str(inpDate, sep) {
  sep = sep || '';
	var isDate = new Date(inpDate);
  if(isDate.toString() != 'Invalid Date') {
    var yyyy = isDate.getFullYear();
    var mm = isDate.getMonth() + 1;
    var dd = isDate.getDate();
    return yyyy + sep + (mm < 10 ? '0' + mm : mm) + sep + (dd < 10 ? '0' + dd : dd);
  } else {
    return "";
  }
}

// 메세지 개행 처리
function messageAlert(msg){
	var returnMsg = "";
	
	if( msg.indexOf("\\n") > -1){
		var len = msg.split("\\n");
		for(var i = 0 ; i < msg.split("\\n").length; i++){
			returnMsg += (i > 0 ? "\n":"") + len[i]; 
		}
	} else {
		returnMsg = msg;
	}
	
	if( returnMsg != ""){
		return alert(returnMsg);
	} else {
		return true;
	}
}

/**
 * 현재 URL을 세션스토리지에 저장
 */
function setCurrUrl() {
  setSSValue("currUrl", window.location.href);
}

/**
 * 외부 페이지를 현재 페이지로 변환 처리
 */
function replceStateCurrUrl() {
  history.replaceState({}, '', getSSValue("currUrl"));
}

/**
 * 장바구니 상품이 100개 이상 일 경우 체크
 * @param {goodsList} 같은 상품이 존재하는지 여부 체크 하기 위해 insert되는 상품 목록 필요
 */
function cartOverCnt(goodsList){
  
  var resultFlag = false;
  $.ajax({
    url : '/cart/cnt',
    type: 'POST',
    data : JSON.stringify(goodsList),
    dataType: 'json',
    contentType : "application/json;charset=UTF-8",
    async : false,
    headers: {
      "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
    },
    success: function(result){
      if( result.resultCode === "0000"){
        //* 상품 카운트
        if(result.resultData > 99){
          
          if(confirm("장바구니에 상품이 100개 담겨있어, 100개 초과 시 오래된 상품은 삭제됩니다."+"\n"+"선택한 상품을 장바구니에 담으시겠습니까?")){
            resultFlag = true;
            return resultFlag;
           } 
        } 
        
                
      } else if(result.resultCode === "UNAUTHORIZED"){
        if( confirm("로그인 후 이용 가능합니다."+"\n"+"로그인페이지로 이동하시겠습니까?")) {
          location.href = "/login?returnUrl=/cart";
          return resultFlag;
        }
      } else if(result.resultCode !== "0000" && result.resultMsg !== ''){
          alert(result.resultMsg); //* 메세지 처리 필요
          return resultFlag;
      }
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.error(jqXHR, textStatus, errorThrown);
      alert("시스템 에러가 발생했습니다."+"\n"+"잠시 후 다시 시도 해 주세요.");
      return resultFlag;
    }
  });
  
  return resultFlag;
}


/**
 * 장바구니 상품이 100개 이상 일 경우 체크
 * @param {goodsList} 같은 상품이 존재하는지 여부 체크 하기 위해 insert되는 상품 목록 필요
 */
function selectCartCount(){
    //console.log(" selectCartCount called");
  $.ajax({
    url : '/common/setReloadCartCnt',
    type: 'GET',
    headers: {
      "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
    },
    success: function(result){
      //console.log("selectCartCount called result :"+ JSON.stringify(result));
			var data = result.resultData;
		  //console.log(" data : "+ data);
		  if( data != null && data >0){
		  	if(data > 99){
		    	$("#ssCartCount").html("99+");
		    } else {
		    	$("#ssCartCount").html(data);
				}
			}
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.error(jqXHR, textStatus, errorThrown);
      //alert("시스템 에러가 발생했습니다."+"\n"+"잠시 후 다시 시도 해 주세요.");  
    }
  });
}

/**
 * 바로구매/주문하기 => 앱 이동 공통 함수
 * 모바일 웹에서 접속했을 때, 앱실행해서 리턴할 페이지 이동
 * @param: returnUrl ex) /display/goods/10004979?mediaCode=MC14
 */
 function redirectAppOrder(returnUrl) {
   
   var success = false;
   
   var redirectUrl = "";
   if(isEmpty(returnUrl)) {
     redirectUrl = location.pathname + location.search;
   } else {
     redirectUrl = returnUrl;
   }
   
   //TODO: 1) 미디어코드체크                             => 세션값 전역변수로 선언
   //      2) IOS/Android 이동 URL 및 파라미터           => 앱 담당자 확인필요
   //      3) 상품상세로 가는 유지파라미터               => 상품담당자 확인필요
   //      4) redirectApp 호출하는곳 위치확인            => 장바구니/상품/회원 담당자 확인필요
   
   // 앱이동 예외 매체코드 => 확인완료
   var excludeMediaCode = ['AL04','AL24','MC03','MC04','MC04S','MC08','MC15','MC21','MC24','MC26','MC28','MC29','MC33','MC33A','MC33E','MC38','SH04'];
   if( !isApp() && excludeMediaCode.indexOf(SS_MEDIACODE) < 0 ) {
     
     var fullUrl = "";
     
     // 쿼리스트링 체크
     if(redirectUrl.indexOf('?') > 0) {
       redirectUrl += "&";
     } else {
       redirectUrl += "?";
     }
     
     // TODO: 앱이동URL: IOS / Android URL 확인 필요
     // https://shoppingntmall.page.link/?link=https://pm.shoppingntmall.com/dlink/display/goods/10382003?dlink%3Dshopnt&apn=com.shoppingntmall.mcapp&isi=1004806037&ibi=com.shoppingntmall.mcapp-ios&efr=1
     var deepUrl = 'https://shoppingntmall.page.link/?link=' + siteDomain + redirectUrl;
     if(isAndroid()){
       deepUrl = 'https://shoppingntmall.page.link/?link=' + siteDomain + '/dlink' + redirectUrl;
     }
     
     var addParam = "";
     if(isNotEmpty(SS_MEDIACODE)) {
       addParam += "mediaCode=" + SS_MEDIACODE + "&";
     }
     if(isNotEmpty(UTM_SOURCE)) {
       addParam += "utm_medium=" + UTM_MEDIUM + "&utm_source=" + UTM_SOURCE + "&utm_content=" + UTM_CONTENT + "&utm_campaign=" + UTM_CAMPAIGN + "&dlink=shopnt";
     } else if (isNotEmpty(UTM_MEDIUM)) {
       addParam += "utm_medium=" + UTM_MEDIUM + "&dlink=shopnt";
     } else {
       addParam += "dlink=shopnt";
     }
     
     var deferredUrl = '&apn=com.shoppingntmall.mcapp&isi=1004806037&ibi=com.shoppingntmall.mcapp-ios&efr=1';
     
     if(confirm("앱에서 주문하실 경우 \n많은 혜택이 있습니다.\n앱으로 이동하시겠습니까?")) {
       //alert("앱이동 미구현\nIOS/Android 이동 => 앱 담당자 확인필요함\n상품상세 리다이렉트 => 상품담당자 확인필요함");
       fullUrl = deepUrl + encodeURIComponent(addParam) + deferredUrl;
       //console.log(fullUrl);
       window.location.href = fullUrl;
       success = true;
     }
   }
   
   return success;
 }
 
 
//앱에서 자동로그인 처리
function appCallAutoLogin(return_url){
  var $form = $('#autoLogin');
  if(isNotEmpty(return_url)) {
    $form.find("input[name=returnUrl]").val(return_url);
  }
  $form.submit();
}
 
//이전페이지/앞으로 가기 
function comTargetPage(type){
  if(type=="forward"){
    location.href = prevPage;
  }else if(type=="prev"){
    history.back();
  }
}
 
// 날짜 더하기
function addDays(days, sepr) {
  var today = new Date();
  today.setDate(today.getDate() + days);
  return getDate2Str(today, sepr);
}
 
// 월 더하기
function addMonths(months, sepr) {
  var today = new Date();
  today.setMonth(today.getMonth() + months);
  return getDate2Str(today, sepr);
}
 
// 날짜 더하기
function addYears(years, sepr) {
  var today = new Date();
  today.setFullYear(today.getFullYear() + years);
  return getDate2Str(today, sepr);
}

/**
 * 쿠폰프로모션 설정된 상품 쿠폰 다운로드
 * @param {*} url 쿠폰다운로드url
 * @returns
 */
function downloadCoupon(url) {
  if(url.indexOf('?couponNo=') < 0 ) {
    alert('잘못된 쿠폰 다운로드 링크입니다.');
    return false;
  }

  var path = window.location.pathname;
  if(path.indexOf('/provide-coupon-multi') > -1 || path.indexOf('/new-app-coupon') > -1 || path.indexOf('/new-user-coupon') > -1 || path.indexOf('/app-push-coupon') > -1 ) {
    path = '/';
  }
  
  var params = urlToObj(url);
  
  $.ajax({
    url : url,
    type: 'POST',
    data : JSON.stringify(params),
    dataType: 'json',
    contentType : "application/json;charset=UTF-8",
    async : false,
    headers: {
      "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
    },
    success: function(result) {
      if(result && result.code) {
        var code = result.code;
        var message = result.message;
        var returnUrl = path;
        
        if("401" == code) {
          if (confirm('로그인 후 이용 가능합니다.\n로그인페이지로 이동하시겠습니까?')) {
            if (returnUrl) {
              window.location.href = '/login?returnUrl=' + returnUrl;
            } else {
              window.location.href = '/login';
            }
          }
        } else if("402" == code) {
          alert(message);
          
          if(isIOSWeb()) {
            if (confirm("App store에서 실행하시겠습니까?") == true) {
              window.location.href = "https://itunes.apple.com/kr/app/syoping-ent/id1004806037?mt=8";
            }
          } else {
            if (confirm("구글 플레이 스토어에서 실행하시겠습니까?") == true) {
              window.location.href = "https://play.google.com/store/apps/details?id=com.shoppingntmall.mcapp";
            }
          }
        } else {
          alert(message);
        }
      } else {
        alert("시스템 에러가 발생했습니다.\n잠시 후 다시 시도 해 주세요.");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown);
      alert("시스템 에러가 발생했습니다.\n잠시 후 다시 시도 해 주세요.");
    }
  });
}

//Query String to Object
var urlToObj = function(query) {
  if (typeof query != "string") query = location.href;
  var obj = {}, url = "", param = "",
      qs = query.indexOf("?"),
      eq = query.indexOf("="),
      am = query.indexOf("&");
  var min = (eq == -1)? am : ((am == -1)? eq : Math.min(eq,am));

  if (qs == -1) {
      if (eq == -1 && am == -1) url = query;
      else param = query;
  } else if (min == -1 || qs < min) {
      url = query.substring(0,qs);
      param = query.substr(qs + 1);
  } else {
      param = query;
  }
  obj["url"] = url;
  var a = param.split("&"), b;
  for (var i=0,n=a.length; i<n; i++) if (a[i] !== "") {
      b = a[i].split("=");
      if (b[0] !== "") obj[b[0]] = b[1] || "";
  }
  return obj;
}

// 날짜 유형이 맞는지 체크
function chkDateType(dateStr) {
  var orgDate = dateStr.replace(/^(19[0-9][0-9]|20\d{2})(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/, "$1-$2-$3");
  var date = new Date(orgDate);
  if(date == "Invalid Date") {
    return false;
  }
  var yyyymmdd = date.toISOString().substring(0, 10);
  if(yyyymmdd == orgDate) {
    return true;
  }
  return false;
}

// 크리테오 스크립트
function criteoProductList(productList, userEmail) {
  window.criteo_q = window.criteo_q || [];
  
	var deviceType = /iPad/.test(navigator.userAgent) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : "d";
    window.criteo_q.push(
    { event: "setAccount", account: 66997},
    { event: "setEmail", email: userEmail.trim().toLowerCase()},
    { event: "setSiteType", type: deviceType},
    { event: "viewList", item: productList}
  );
}

function isIe() {
  var agent = navigator.userAgent.toLowerCase();
  var isIE = agent.indexOf('trident') != -1 || agent.indexOf("msie") != -1;
  console.log('isIE', isIE);
  return isIE;
}

function brazeInit(){
  if(brazeActive) {
    braze.initialize(brazeSdkKey, {
        baseUrl: brazeEndPoint,
        manageServiceWorkerExternally: true,
        enableLogging: brazeLogEnable
    });
  }
}

function brazeLogCustomEventWithProperties(eventName, properties){
  brazeInit();
  
  if(brazeActive) {
    if(properties != null) {
      braze.logCustomEvent(eventName, properties);
//      if(!isApp()){
//        braze.logCustomEvent(eventName, properties);
//      } else if(isAndroid()){
//        window.shoppingntapp.appBrazeCustomEvent(eventName);
//      } else if(isIOS()){
//        window.webkit.messageHandlers.shoppingntapp.postMessage('appBrazeCustomEvent?eventName=' + eventName);
//      }
    } else {
      braze.logCustomEvent(eventName);
//      if(!isApp()){
//        braze.logCustomEvent(eventName);
//      } else if(isAndroid()){
//        window.shoppingntapp.appBrazeCustomEvent(eventName);
//      } else if(isIOS()){
//        window.webkit.messageHandlers.shoppingntapp.postMessage('appBrazeCustomEvent?eventName=' + eventName);
//      }
    }
  }     
}

function brazeLogCustomEventWithNoProperties(eventName){
  brazeLogCustomEventWithProperties(eventName, null);         
}