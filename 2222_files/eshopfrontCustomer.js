$(document).ready(function(){
});

(function($eshopfront,$) {
    $eshopfront.cust = {
        // 로그아웃
        logout : function() {
          var logout = confirm('로그아웃 하시겠습니까?');
          if(logout) {
            alert("로그아웃되었습니다.");

            /* 에어브릿지 로그아웃 * /
            airbridge.events.send('airbridge.user.signout');
            // user info clear
            airbridge.clearUser();
            /* 에어브릿지 로그아웃 */

            $('#logoutForm #returnUrl').val("/");
            $('#logoutForm')[0].submit();
            if (isApp()) {
              if(isIOS()){
                /*Ios 로그아웃 여부 추가 */
                sendAppBridge("logoutApp");
              }
              if(isAndroid()){
                window.shoppingntapp.logoutApp();
              }
            }
          }
        },
        _pattern01 : /^[0-9]+$/,
        _pattern02 : /^[A-Za-z0-9]+$/,
        _pattern03 : /^[a-zA-Z]+[0-9]+[a-zA-Z0-9]*$/,
        _pattern04 : /^[a-zA-Z0-9]{6,15}$/,
        regType :  /^[a-zA-Z0-9`,~,!,@,$,%,^,&,*,(,),_,\-,+,=]{8,15}$/,
        regType2 :  /[0-9]/,
        regType3 :  /[a-zA-Z]/,
        pwRegType4 :  /^[a-zA-Z0-9]$/,
        pwRegType5 :  /[`,~,!,@,$,%,^,&,*,(,),_,\-,+,=]/,
        entityMap : {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': '&quot;',
              "'": '&#39;',
              "/": '&#x2F;'
            },

        calculate_msglen: function(message){
           var nbytes = 0;
         
           for (i=0; i<message.length; i++) {
               var ch = message.charAt(i);
               if(escape(ch).length > 4) {
                   nbytes += 2;
               } else if (ch == '\n') {
                   if (message.charAt(i-1) != '\r') {
                       nbytes += 1;
                   }
               } else if (ch == '<' || ch == '>') {
                   nbytes += 4;
               } else {
                   nbytes += 1;
               }
           }
         
           return nbytes;
        },
         
        jjmInfoChoice: function(value, type, $this, callback){    
          //value: goodsCd,brndSn
          //type : brnd(브랜드), 그외...(상품)
          var url = '',
           param = {};

          if(ISLOGIN != 'Y' || ISMEMBER != 'Y'){
            execLogin(location.href.replace(location.origin, ""));
            return;
          }

          if(type == 'brnd'){
            url = '/jjm/brnd-choc';
            param = {"brndSn" : value } 
          }else{
            url = '/jjm/goods-choc';
            param = {"goodsCd" : value } 
          }
          
          $.ajax({
            url : url,
            type : "post",
            async : false,
            dataType : 'json',
            headers: {
            "X-CSRF-TOKEN": $("meta[name='X-CSRF-TOKEN']").attr("content")
            },      
            data:param,
            success : function (data) {
              if(data != null && data.resultData != null){
                if(("" == data.resultData.errorCode || null == data.resultData.errorCode) && "200" == data.resultData.status){
                  // 상품 찜 할때 광고스크립트 호출
                  if(type != 'brnd' && data.resultData.saveType =="I") {
                    jjmAirbridge($this, value);
                    if(type != 'brnd') jjmBraze($this, value);
                  }
                  
                  //콜백호출
                  if(callback != undefined && callback != "") callback( $this, data );

                } else if(data.resultData.errorCode == "400"){  //찜 등록갯수 초과                 
                  if(confirm("찜한 개수가 100개를 초과하여 찜한 목록에서 삭제 후 이용 가능합니다. 찜한 목록으로 이동하시겠습니까?")){
                    window.location.href = "/mypage/wishlist";
                  }                     
                } else {
                  //찜등록 실패
                  alert(data.resultData.message);
                  //data.resultData.errorCode=417 : 필수값을 확인해주세요
                }                   
              }else{
                alert("시스템 오류가 발생하였습니다.");
              }
            },error: function(jqXHR, textStatus, errorThrown){
              alert("시스템 오류가 발생하였습니다.");
            }
          }); 
              
        }
    };
})($.eshopfront,jQuery);

//찜 상품 광고스크립트 호출
function jjmAirbridge($this, goodsCd){
  
  var goodsnm = $($this).data("goodsnm");    //상품명
  var price = $($this).data("shoppingntamt");    //가격
  var currency = $($this).data("airbridgecurrency");    //currency정보
  
  //console.log(goodsCd+'/'+goodsnm+'/'+price+'/'+currency);
  
/*  airbridge.events.send("spnt.custom.product.addToWish", {
    action : '찜하기',
    semanticAttributes: {   
      products: [{
        productID: goodsCd,
        name: goodsnm,
        price: price,
        currency: currency                
      }]
    }
  }); */
  
}

function jjmBraze($this, goodsCd){
  var goodsnm = $($this).data("goodsnm");    //상품명
  var price = $($this).data("shoppingntamt");    //가격
  
  var brazeProp = {};
  brazeProp.product_id = goodsCd;
  brazeProp.product_name = goodsnm;
  brazeProp.price = price;
  
  brazeLogCustomEventWithProperties('added_to_wish', brazeProp);
}

// 로그아웃 후 로그인 화면으로 이동
function execLogin(returnUrl) {
  if(ISLOGIN == "Y" && ISMEMBER == "N") {
    var msg = "해당 서비스는 회원만 이용가능합니다.\n로그인하시겠습니까?"
    var check = confirm(msg);
    if(check) {
      $('#logoutForm #returnUrl').val("/login?returnUrl=" + returnUrl);
      $('#logoutForm')[0].submit();
      if (isApp()) {
        if(isIOS()){
          /*Ios 로그아웃 여부 추가 */
          sendAppBridge("logoutApp");
        }
        if(isAndroid()){
          window.shoppingntapp.logoutApp();
        }
      }
    }
  } else if(ISLOGIN == "N") {
    if(confirm("로그인 후 이용 가능합니다.\n로그인페이지로 이동하시겠습니까?")) {
      window.location.href = "/login?returnUrl=" + returnUrl;
    }
  }
}

/**
 * 에러 메시지 노출/미노출
 * @param {*} msgEl 
 * @param {*} showStatus 
 * @param {*} msg 
 */
function chngErrorMsg(msgEl, showStatus, msg) {
  if(msgEl != null) {
    msgEl.html(msg || '');
    if(showStatus == 'error') {
      msgEl.addClass("error");
      msgEl.closest("div.ipt-wrap").addClass("is-error");
      msgEl.css("display","block");
    } else if(showStatus == 'pass') {
      msgEl.removeClass("error");
      msgEl.closest("div.ipt-wrap").removeClass("is-error");
      msgEl.css("display","block");
    } else {
      msgEl.removeClass("error");
      msgEl.closest("div.ipt-wrap").removeClass("is-error");
      msgEl.css("display","none");
    }
  }
}

/**
 * 통과 아이콘 노출/미노출
 * @param {*} passEl 
 * @param {*} isPass 
 */
function chngPassIcon(passEl, isPass) {
  if(passEl != null) {
    passEl.css("display", isPass == true ? "block" : "none");
  }
}