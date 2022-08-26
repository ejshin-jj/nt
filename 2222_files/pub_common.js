//jquery easing
(function(factory){if(typeof define==="function"&&define.amd){define(["jquery"],function($){return factory($)})}else if(typeof module==="object"&&typeof module.exports==="object"){exports=factory(require("jquery"))}else{factory(jQuery)}})(function($){$.easing.jswing=$.easing.swing;var pow=Math.pow,sqrt=Math.sqrt,sin=Math.sin,cos=Math.cos,PI=Math.PI,c1=1.70158,c2=c1*1.525,c3=c1+1,c4=2*PI/3,c5=2*PI/4.5;function bounceOut(x){var n1=7.5625,d1=2.75;if(x<1/d1){return n1*x*x}else if(x<2/d1){return n1*(x-=1.5/d1)*x+.75}else if(x<2.5/d1){return n1*(x-=2.25/d1)*x+.9375}else{return n1*(x-=2.625/d1)*x+.984375}}$.extend($.easing,{def:"easeOutQuad",swing:function(x){return $.easing[$.easing.def](x)},easeInQuad:function(x){return x*x},easeOutQuad:function(x){return 1-(1-x)*(1-x)},easeInOutQuad:function(x){return x<.5?2*x*x:1-pow(-2*x+2,2)/2},easeInCubic:function(x){return x*x*x},easeOutCubic:function(x){return 1-pow(1-x,3)},easeInOutCubic:function(x){return x<.5?4*x*x*x:1-pow(-2*x+2,3)/2},easeInQuart:function(x){return x*x*x*x},easeOutQuart:function(x){return 1-pow(1-x,4)},easeInOutQuart:function(x){return x<.5?8*x*x*x*x:1-pow(-2*x+2,4)/2},easeInQuint:function(x){return x*x*x*x*x},easeOutQuint:function(x){return 1-pow(1-x,5)},easeInOutQuint:function(x){return x<.5?16*x*x*x*x*x:1-pow(-2*x+2,5)/2},easeInSine:function(x){return 1-cos(x*PI/2)},easeOutSine:function(x){return sin(x*PI/2)},easeInOutSine:function(x){return-(cos(PI*x)-1)/2},easeInExpo:function(x){return x===0?0:pow(2,10*x-10)},easeOutExpo:function(x){return x===1?1:1-pow(2,-10*x)},easeInOutExpo:function(x){return x===0?0:x===1?1:x<.5?pow(2,20*x-10)/2:(2-pow(2,-20*x+10))/2},easeInCirc:function(x){return 1-sqrt(1-pow(x,2))},easeOutCirc:function(x){return sqrt(1-pow(x-1,2))},easeInOutCirc:function(x){return x<.5?(1-sqrt(1-pow(2*x,2)))/2:(sqrt(1-pow(-2*x+2,2))+1)/2},easeInElastic:function(x){return x===0?0:x===1?1:-pow(2,10*x-10)*sin((x*10-10.75)*c4)},easeOutElastic:function(x){return x===0?0:x===1?1:pow(2,-10*x)*sin((x*10-.75)*c4)+1},easeInOutElastic:function(x){return x===0?0:x===1?1:x<.5?-(pow(2,20*x-10)*sin((20*x-11.125)*c5))/2:pow(2,-20*x+10)*sin((20*x-11.125)*c5)/2+1},easeInBack:function(x){return c3*x*x*x-c1*x*x},easeOutBack:function(x){return 1+c3*pow(x-1,3)+c1*pow(x-1,2)},easeInOutBack:function(x){return x<.5?pow(2*x,2)*((c2+1)*2*x-c2)/2:(pow(2*x-2,2)*((c2+1)*(x*2-2)+c2)+2)/2},easeInBounce:function(x){return 1-bounceOut(1-x)},easeOutBounce:bounceOut,easeInOutBounce:function(x){return x<.5?(1-bounceOut(1-2*x))/2:(1+bounceOut(2*x-1))/2}})});

//로딩 html
var loadiingHtml = '';
loadiingHtml += '<div class="loading-wrap">';
loadiingHtml += '<div class="loading">';
loadiingHtml += '<svg height="48" width="48" viewBox="0 0 120 120">';
loadiingHtml += '<path d="m 41.351403,54.348877 c 0,0 -49.4783399,-12.652 -35.6966999,6.55192 C 19.436343,80.104717 93.314963,107.21615 110.03369,100.21236 126.75239,93.208587 86.311183,73.100937 86.311183,72.423147 c 0,-0.67778 4.29266,-62.5821903 4.29266,-62.5821903 0,0 -1.80744,-7.22973 -8.58529,-6.10008 -6.77786,1.12965 -40.66715,50.6080003 -40.66715,50.6080003 z" stroke-dasharray="550 550"></path>';
loadiingHtml += '</svg>';
loadiingHtml += '<p class="hidden">로딩중</p>';
loadiingHtml += '</div>';
loadiingHtml += '</div>';

$(function(){
	//100vh 이슈
	var vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
	// 테이블 캡션 함수 호출
	setTableCaption();
	// 하단 스티키 버튼 패딩간격 
	if($(".sticky-bottom-area").length > 0){
		btnSticky()
	};

	// auto-sticky관련 키워드 리스트가 없으면 아래 선 넣기
	if(!$('.search-keywrod-list').length){
		$('.type-search-util').css('cssText','border-bottom:8px solid #f5f5f5');
	}

	// 그래프 비율값 계산(추후 개발 협의시 소스 변동될 수 있음)
	var styleEle = document.createElement('style');
	styleEle.id = "keyset";
	document.head.appendChild(styleEle);
	for(var i=0; i<$(".graph-area").length; i++){
		var axisVal =  Math.floor(parseInt( $(".graph-area .marker > em:eq("+i+")").text().replaceAll(",", "") )/100000*100);
		axisVal = axisVal>100?100:axisVal;
		$(".data-wrap .graph .bar:eq("+i+")").css({"animation":"graphBar"+i+" 1500ms 0s 1 forwards"});
		styleEle.innerHTML += "@keyframes" + " graphBar"+i+"{to {width:" + axisVal + "%}}";
	};

	// youtue 동영상 감싸기 07-01
	$('iframe[src^="https://www.youtube.com/"]').wrap('<div class="youtubeWrap"></div>');

	// 포커스 세팅
	$.fn.focusTextToEnd = function(){
        this.focus();
        var $thisVal = this.val();
        this.val('').val($thisVal);
        return this;
    }

	// input delete button
	$('.ipt-wrap').each(function () {
		var deleteTxt = '해당 필드 입력값 삭제';
		$(this).append('<button type="button" class="btn-delete"><span class="hidden">' + deleteTxt + '</span></button>');
		$('input.delete').on('change keyup paste', function(){
			$(this).parent('.ipt-wrap').find('.btn-delete').show();
			if ($(this).is(':visible')) {
				$(this).parent('.ipt-wrap').find('.btn-delete').show();
				$(this).parent('.ipt-wrap').addClass('on');
			};

			if( $(this).parent('.ipt-wrap').find(".ipt.delete + .unit").length > 0 ){
				$(this).parent('.ipt-wrap').find('.ipt.delete').css('padding-right', ($(this).parent('.ipt-wrap').find(".ipt.delete + .unit").width()+50)+'px');
				$(this).parent('.ipt-wrap').find('.ipt.delete + .unit').css('right', '42px');
			};
			
			if( $(this).parent('.ipt-wrap').find(".ipt.delete + .unit").length > 0 && $(this).parent('.ipt-wrap').find(".ipt.delete").val() == "" ){
				$(this).parent('.ipt-wrap').find('.ipt.delete').css('padding-right', '');
				$(this).parent('.ipt-wrap').find('.ipt.delete + .unit').css('right', '');
				$(this).parent('.ipt-wrap').find('.btn-delete').hide();
			};

			if( $(this).parent('.ipt-wrap').find(".ipt.delete").val().length == 0 ){
				$(this).siblings('.btn-delete').hide();
			};
		});
		$('.btn-delete').click(function () {
			$(this).parent('.ipt-wrap').find('input.delete').val('').trigger('change').focus();
			if( $(this).parent('.ipt-wrap').find('.ipt.delete + .unit').length > 0 ){
				$(this).parent('.ipt-wrap').find('.ipt.delete').css('padding-right', '');
				$(this).parent('.ipt-wrap').find('.ipt.delete + .unit').css('right', '');
			};
			$(this).hide();

		});
		$('input.delete').bind({
			'mousedown': function (e) {
				e.preventDefault();
				$(this).closest('.ipt-wrap').find('input.delete').focus();
				$(this).parent('.ipt-wrap').removeClass('on');
			},
			'focusout': function () {
				$(this).parent('.ipt-wrap').removeClass('on');
			}
		});
		
		$('input.delete').each(function () {
			if ($(this).hasClass('pw') == true) {
				$(this).parent().find('.btn-delete').css('right', '35px'); 
			} else if ($(this).hasClass('autocompt') == true) {
				$(this).parent().find('.btn-delete').css('right', '52px');
			} else if ($(this).hasClass('pw') == false) {
				$(this).parent().find('.btn-delete').css('right', '16px');
			};
		});
	});

	// input password security key button
	$('.iptWrap .pwKeyBtn').click(function () {
		if ($(this).hasClass('off') == true) {
			$(this).removeClass('off');
			$(this).addClass('on');
			$(this).prev('input').prop('type', 'text');
		} else if ($(this).hasClass('off') == false) {
			$(this).removeClass('on');
			$(this).addClass('off');
			$(this).prev('input').prop('type', 'password');
		}
	});

	// textarea edit focus
	$('.textareaEdit > textarea').each(function () {
		$(this).bind('focus', function () {
			$(this).parent('.textareaEdit').css('border-color', '#1b2026');
		});
		$(this).bind('focusout', function () {
			$(this).parent('.textareaEdit').css('border-color', '#dbdee3');
		});
	});

	// 전화번호 자동 하이픈 넣기
	$(document).on("keyup", ".phoneNumber", function() {
		$(this).val( $(this).val().replace(/[^0-9]/g, "").replace(/(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,"$1-$2-$3").replace("--", "-") );
	});

	// 상세페이지 수령 마이너스
	$(document).on('click', '.btn-quantity-minus', function(){
		var $input = $(this).parent().find('input');
		var count = parseInt($input.val()) - 1;
		count = count < 1 ? 1 : count;
		$input.val(count);
		$input.change();
		return false;
	});
	// 상세페이지 수령 플러스
	$(document).on('click', '.btn-quantity-plus', function(){
		var $input = $(this).parent().find('input');
		var count = parseInt($input.val()) + 1;
		count = count > 99 ? 99 : count;
		$input.val(count);
		$input.change();
		return false;
	});

	// 텝메뉴
	var tabBtn = $('.tab > button');
	var tabCont = $('.tab-cont-wrap > .tab-cont-item');
	//tabCont.hide().eq(0).show(); //첫번째 탭 콘텐츠 보이기

	tabBtn.on('click', function(){
		var target = $(this);
		var index = target.index();
		target.siblings('button').removeClass('is-active');
		target.addClass('is-active');
		target.parent().siblings('.tab-cont-wrap').find('.tab-cont-item').css('display','none');
		target.parent().siblings('.tab-cont-wrap').find('.tab-cont-item').eq(index).css('display', 'block');
	});
		
	// 페이지 상단 이동
	$('.btn-top-go').on('click', function(){
		$('html, body').animate({ scrollTop :0 }, 100, 'easeInOutCirc');
	});

	// 푸터 정보보기 숨기기
	$('.btn-trn').on('click', function(){
		$('.trn-info-wrap').toggleClass('is-active');
	});

	//키워드 active
	$(document).on('click', '.search-keywrod-list > li', function(){
		toggleActive($(this));
	});
	
	// 아코디언 click
	$(".acco-wrap:not(.over) .acco-item .acco-btn").unbind("click").bind("click", function(e){
		e.preventDefault();
		acco.accoClick(this);
	});

	// 상품 정렬(필터)
	$(".sort-area > .btn-sort").append('<span class="hidden">펼치기</span>');
	$(".sort-area > .btn-sort").unbind("click").bind("click", function(){
		if( $(this).closest(".sort-area").hasClass("on") == true ){
			$(this).closest(".sort-area").removeClass("on");
			$(this).closest(".sort-area").find(".sort-list").stop().slideUp(300);
		}else{
			$(".sort-area > .btn-sort").removeClass("on");
			$(this).closest(".sort-area").addClass("on");
			$(".sort-list").stop().slideUp(300);
			$(this).closest(".sort-area").find(".sort-list").stop().slideDown({
				duration: 300
			});
		};
		$(".sort-area > .btn-sort > .hidden").text("펼치기");
		$(".sort-area.on > .btn-sort > .hidden").text("접기");
	});
	$(".sort-list .ipt[type=radio]").bind("click", function(e){
		console.log($(this).closest("li").find("label"));
		$(this).closest(".sort-area").removeClass("on");
		$(this).closest(".sort-area").find(".sort-list").stop().slideUp({
			duration: 300,
			complete: function(){
				$(this).closest(".sort-area").find(".btn-sort").html( $(this).find("li > .ipt[type=radio]:checked + label").text() );
			}
		});
	});

	// 별점등록
	var starNum = 0;
	$(".ipt-star .star .ipt").on('change click', function(){
		if( $(this).closest(".star-assess-box.half").length > 0 ){
			starNum = $(this).closest(".star").find(".ipt:nth-of-type(2):checked").length == 1 ? 0 : 0.5
		};
		console.log( starNum );
		$(this).closest(".star-assess-box").find(".rating-val .val").text(($(this).closest(".star").index()+1) - starNum);
	});

	// 상품상세 - [탭]상품설명 상품정보 더보기 버튼 기능
	if( $(".detail-inner .cms").height() < 1500 ){
		$(".detail-inner .btn-area").removeClass("on");
	}else{
		$(".detail-inner .btn-area").addClass("on");
	};
	
	$(".detail-inner .btn-more").on("click", function(){
		if($(this).closest(".detail-inner.on").length > 0){
			$(this).closest(".detail-inner").removeClass("on");
			$(this).text("상품정보 더보기");
		}else{
			$(this).closest(".detail-inner").addClass("on");
			$(this).text("상품정보 접기");
		};
	});
	
	// 탭 카테고리 펼침
	$(".ctg-tab-wrap.expand .btn-ctg").on("click", function(){
		if( $(this).closest(".ctg-tab-wrap.expand.total").length == 0 ){
			$('html').addClass('pop-open head-idx');
			$('#wrap').append('<div class="dim"></div>');
			$(this).closest(".ctg-tab-wrap.expand").addClass("total");
			$(this).find(".hidden").removeClass("hidden").text("접기");
			$(this).find("> span").removeClass("hidden");
		}else{
			$('#wrap .dim').remove();
			$('html').removeClass('pop-open head-idx');
			$(this).closest(".ctg-tab-wrap.expand").removeClass("total");
			$(this).find("> span").addClass("hidden");
			$(this).find(".hidden").addClass("hidden").text("펼치기");
		};
	});

	// 공통 탭
	$(".tab-wrap .tab-list").each(function(idx, item){
		if( $(item).find("> li > a").length > 0 ){ // a tag
			var hiddenTxt = $(item).find("> li.on > a").text() + " 탭 내용 시작";
		}else if( $(item).find("li .ipt[type=radio]").length > 0 ){ // radio
			var hiddenTxt = $(item).find("li .ipt[type=radio]:checked + label").text() + " 탭 내용 시작";
		};
		$(item).after( '<span class="hidden">'+ hiddenTxt +'</span>' );
		$(item).find("> li.on > a").attr('title', "선택됨");
		
		// a tag
		$(item).find("> li > a").on("click", function(e){
			//e.preventDefault();
			$(this).closest("ul.tab-list").find("> li").removeClass("on");
			$(this).closest("li").addClass("on");
			$(this).closest(".tab-wrap").find("> .tab-con-wrap > .tab-con").removeClass("on");
			$(this).closest(".tab-wrap").find("> .tab-con-wrap > .tab-con:eq("+$(this).closest("li").index()+")").addClass("on");
			// 접근성 관련 속성
			hiddenTxt = $(item).find("> li.on > a").text() + " 탭 내용 시작";
			$(this).closest("ul.tab-list").find("> li > a").removeAttr('title');
			$(this).attr('title', "선택됨");
			$(item).closest(".tab-wrap").find("span.hidden").text(hiddenTxt);
		});
		
		// radio tag
		$(item).find("li .ipt[type=radio]").on("click change", function(e){
			$(this).closest("ul.tab-list").find("> li").removeClass("on");
			$(this).closest("li").addClass("on");
			$(this).closest(".tab-wrap").find("> .tab-con-wrap > .tab-con").removeClass("on");
			$(this).closest(".tab-wrap").find("> .tab-con-wrap > .tab-con:eq("+$(this).closest("li").index()+")").addClass("on");
			// 접근성 관련 속성
			hiddenTxt = $(item).find("li .ipt[type=radio]:checked + label").text() + " 탭 내용 시작";
			$(item).closest(".tab-wrap").find("span.hidden").text(hiddenTxt);
		});
	});

	var prdSelData = ""; // 선택된 상품 데이터 값
	$(".custom-slt .prd-sel").on('click', function(e){
		e.preventDefault();
		if($(this).closest(".custom-slt").hasClass("on") == true){
			$(this).closest(".custom-slt").find(".prd-sellist-group").stop().slideUp({
				duration: 300,
				complete: function(){
					$(this).closest(".custom-slt").removeClass("on");
				}
			});
		}else{
			$(this).closest(".custom-slt").find(".prd-sellist-group").stop().slideDown({
				duration: 300
			});
			$(this).closest(".custom-slt").addClass("on");
		};
		$(this).closest(".custom-slt").css({"z-index":zIndex++});
	});

	$(".prd-sel-list .sel-list").on('click', function(e){
		e.preventDefault();
		if($(this).closest("li").hasClass("select") == false){
			$(this).closest(".prd-sel-list").find(".sel-list").removeAttr('title');
			$(this).attr("title", "선택됨");
			$(this).closest(".prd-sel-list").find("> li").removeClass("select");
			$(this).closest("li").addClass("select");
		};

		$(this).closest(".prd-sellist-group").stop().slideUp({
			duration: 300,
			complete: function(){
				$(this).closest(".custom-slt").removeClass("on");
			}
		});

		// data 추가
		prdSelData = $(this).closest(".custom-slt").find(".select .sel-list .tit").html();
		console.log("prdSelData:", prdSelData);
		$(this).closest(".custom-slt").find(".prd-sel").html(prdSelData);
	});
	
	// 상품정열타입 변경
	$('.btn-type-sort').on('click', function(){
		$(this).toggleClass('is-active');
		if ($(this).hasClass('is-active')){
			$(this).find('.hidden').text('목록 - 갤러리타입');
			$('.best-list').addClass('type-list');
		} else {
			$(this).find('.hidden').text('목록 - 리스트타입');
			$('.best-list').removeClass('type-list');
		}
		$(this).find('.hidden').text();
	});

	//필터이벤트 06-03
	var tabFilter = $('.tab-filter > li');
	tabFilter.on('click', function(){
		tabFilter.removeClass('is-active');
		$(this).addClass('is-active');
	});
	var resFilter = $('.res-filter-area > ul > li');
	resFilter.on('click', function(){
		resFilter.removeClass('is-active');
		$(this).addClass('is-active');
	});

	$('.tv-date-wrap .tv-date-swiper .swiper-wrapper.date-list .btn-date').on("click", function(e){
		var target = $(this).parent();
		target.closest(".date-list").find(".date-item").removeClass('is-active')
		target.addClass('is-active');
		tvFocus.alignCt(target);
	});

	// 
	$('.form-select select[disabled]').each(function(){
		$(this).parent().addClass('is-disabled');
	});

	fnb();//푸터 여백조절
	
});

// TV편성 메인 상품 더보기
$(document).on("click", ".program-item .program-info .btn-related-toggle", function() {
	if( $(this).closest(".related-prod-wrap.is-active").length == 0 ){
		$(this).closest(".related-prod-wrap").addClass("is-active");
		$(this).closest(".related-prod-wrap").find(".btn-related-toggle .state").contents()[0].textContent = "닫기";
		// mainSwipe.instMainSwipe.update();
	}else{
		$(this).closest(".related-prod-wrap").removeClass("is-active");
		$(this).closest(".related-prod-wrap").find(".btn-related-toggle .state").contents()[0].textContent = "더보기";
		// mainSwipe.instMainSwipe.update();
	};
});

// 방송편성 : 방송영역 포커싱
$(document).on("click", ".channel-time > li", function() {
	tvFocus.scrollFocus(this);
	$(this).addClass('active').siblings().removeClass('active');
});

// 스티키 패딩 조정
function btnSticky(){
	for( var i=0; i<$(".sticky-bottom-area").length; i++ ){
		$(".sticky-bottom-area").eq(i).parent().css({"padding-bottom": Math.ceil($(".sticky-bottom-area").eq(i).outerHeight(true)) + "px"});
	};
};

// 공통 팝업
var popup = {
	zIndex : 1000000,
	btnFocus : [],
	open : function(el){
		$('html').addClass('pop-open');
		$("#wrap").attr("aria-hidden", true);
		$(el).before('<div class="dim" style="z-index:'+ this.zIndex++ + '"></div>');
		$(el).css({
			"z-index":this.zIndex++,
			"outline":"none",
			'display':'flex'
		});
		// $(el).show();

		if( $(el).hasClass("bottom-sheet") == true ){ // bottomsheet popup(상세 레이어팝업)
			setTimeout(function(){
				$(el).addClass("open");
			}, 300);
		}else{
			$(el).addClass("open");
		};

		// 팝업 포커스 기능
		if( this.btnFocus !== undefined ){
			this.btnFocus.push($(':focus'));
		};
		
		$(el).each(function(idx, item){
			$(item).attr("tabindex", 0);

			if($(item).find(".focus-idx").length == 0){
				$(item).prepend('<div class="focus-idx first" tabindex="0"></div>');
				$(item).append('<div class="focus-idx last" tabindex="0"></div>');
			};
			
			$(item).find('.focus-idx').bind('focusin', function(e){
				var focusTag = "";
				focusTag += el + ' .popup-inner div:visible[tabindex="0"],'
				focusTag += el + ' .popup-inner li:visible[tabindex="0"],'
				focusTag += el + ' .popup-inner button:visible:not([tabindex="-1"]),'
				focusTag += el + ' .popup-inner a:visible:not([tabindex="-1"]),'
				focusTag += el + ' .popup-inner input:visible:not([tabindex="-1"]),'
				focusTag += el + ' .popup-inner select:visible:not([tabindex="-1"]),'
				focusTag += el + ' .popup-inner textarea:visible:not([tabindex="-1"])'
				
				if($(e.target).hasClass('first')){
					$(focusTag).last().focus();
				}else{
					$(focusTag).first().focus();
				};
			});
			
			setTimeout(function(){
				$(item).focus();
			}, 100);

		});
		if($(".sticky-bottom-area").length > 0){
			btnSticky()
		};

		$(".dim").off("click").on("click", function(e){
			popup.close( $(this).next(".popup.open") );
		});	
	},
	close : function(el){
		if( $(el).hasClass("bottom-sheet") == true ){ // bottomsheet popup(상세 레이어팝업)
			$(el).removeClass("open");
			setTimeout(function(){
				$(el).css({"display":"none"});
				$(el).prev(".dim").remove();

				if( $('body .popup').prev(".dim").length == 0 ){
					$("#wrap").removeAttr("aria-hidden");
					$('html').removeClass('pop-open');
					if($('html').hasClass('page-tv')){
						$('html').removeClass('page-tv');
					};
				};
			}, 300);
		}else{
			$(el).removeClass("open");
			$(el).css({"display":"none"});
			$(el).prev(".dim").remove();

			if( $('body .popup').prev(".dim").length == 0 ){
				$("#wrap").removeAttr("aria-hidden");
				$('html').removeClass('pop-open');
			};
		};
		this.btnFocus[this.btnFocus.length - 1].focus();
		this.btnFocus.pop();
	}
};

// 방송편성 : 생방송영역 포커싱
var tvFocus = {
	scrollFocus : function(val){
		var headHei = $("#header.is-scroll").outerHeight() || 51;
		var onairPos = 0;
		if( $('.program-item.is-onair').length > 0 ){ onairPos = Math.ceil( $('.program-item.is-onair').offset().top ) }
		var pos = onairPos - ( headHei + $(".tv-date-wrap").outerHeight() );
		var channelIdx = $(".channel-time > li").index(val);
		if( $(".tv-program-schedule .program-item").eq(channelIdx).length == 0 ){
			channelIdx = -1;
		};
		
		if( "onair" == val ){
			$("html").animate({
				scrollTop: pos
			});			
		}else if( channelIdx > -1 ){
			$("html").animate({
				scrollTop: channelIdx == 0 ? 0 : $(".tv-program-schedule .program-item").eq(channelIdx).offset().top - ( headHei + $(".tv-date-wrap").outerHeight() )
			});
		};
	},
	alignCt : function(target){
		var snbwrap = $('.tv-date-swiper .swiper-wrapper');
		var targetPos = target.position();
		var box = $('.tv-date-swiper');
		var boxHarf = box.width()/2;
		var pos = 0;
		var listWidth = 0;
		var margin = 6;
		
		snbwrap.find('.date-item.swiper-slide').each(function(){
			listWidth += $(this).outerWidth();
		});
		
		var selectTargetPos = targetPos.left + target.outerWidth()/2;
		if (selectTargetPos <= boxHarf) { // left
			pos = 0 - margin;
		}else if ((listWidth - selectTargetPos) <= boxHarf) { //right
			pos = listWidth-box.width() + target.outerWidth()/2 - margin;
		}else {
			pos = selectTargetPos - boxHarf;
		}
		
		setTimeout(function(){snbwrap.css({
			"transform": "translate3d("+ (pos*-1) +"px, 0, 0)",
			"transition-duration": "300ms"
		})}, 200);
	},
	observerOpt : {root:null, rootMargin:'0px', threshold:1},
	viewObserver : function(target){ // 뷰포트 observer 생성
		var target = document.querySelectorAll(target);
		
		var targetObserver = new IntersectionObserver(function(entries, options){ // observer 초기화
			entries.forEach(function(entry){
				if (entry.isIntersecting == true){
					console.log(entry)
					$(".channel-time-area").css({ "top": 118 - 76*$(entry.target).closest(".program-item").index() });
				};
			});
		}, this.observerOpt);

		target.forEach(function(item){
			targetObserver.observe(item);
		});
	}
};

document.addEventListener("DOMContentLoaded", function(e){
	// view observe : 관찰할 대상(요소) 등록
	tvFocus.viewObserver(".program-item .inner");
	
	if( $(".auto-sticky").length > 0 ){
		sticky.autoFix();
	};
});

// 공통 스티키 헤더
var sticky = {
	headerHei : 0,
	autoFix : function(){
		var header = document.querySelector('#header');
		var target = document.querySelector('.auto-sticky');
		
		sticky.headerHei = header.offsetHeight;

		var handler = (entries) => {
			if ( entries[0].intersectionRatio <= 1 ) {
				entries[0].target.classList.add("autoFix");
				entries[0].target.style.top = (Math.floor(sticky.headerHei))+"px";
			}else{
				entries[0].target.classList.remove("autoFix");
				entries[0].target.style.top = "";
			};
		};
		
		var option = {
			root:null,
			rootMargin:"-"+(sticky.headerHei+2)+"px"+" 0px 0px 0px",
			threshold:1
		};	

		var observer = new window.IntersectionObserver(handler, option)
		observer.observe(target);
	}
};

// 공통 lazyload
var lazy = {
	lazyloadImg : null, // 이미지 선택자
	lazyDefaultImg : null, // nodata img
	observer : function(){ // observer
		lazy.lazyloadImg = document.querySelectorAll(".lazy");
		var imageObserver = new IntersectionObserver(function(entries){
			entries.forEach(function(entry){
				if (entry.isIntersecting){
					var image = entry.target;
					lazy.lazyDefaultImg = image.src;
					image.src = image.dataset.src;
					image.addEventListener("error", lazy.error);
					image.classList.remove("lazy");
					imageObserver.unobserve(image); // 모니터링 해제
				};
			});
		});
		lazy.lazyloadImg.forEach(function(image){
			imageObserver.observe(image);
		});
	},
	lazyload : function(){ // lazyload
		var lazyloadThrottleTimeout;
		lazy.lazyloadImg = document.querySelectorAll(".lazy");

		if(lazyloadThrottleTimeout) {
			clearTimeout(lazyloadThrottleTimeout);
		};
	
		lazyloadThrottleTimeout = setTimeout(function(){
			var scrollTop = window.pageYOffset;
			lazy.lazyloadImg.forEach(function(img){
				if($(img).offset().top < (window.innerHeight + scrollTop)){
					if( $(img).hasClass("lazy") == true ){
						lazy.lazyDefaultImg = img.src;
						img.src = img.dataset.src;
						
						img.addEventListener("error", lazy.error);
						
						img.classList.remove('lazy');
					};
				};
			});
		}, 20);

	},
	error : function(){ // error
		this.setAttribute('src', lazy.lazyDefaultImg);
	}
};

document.addEventListener("DOMContentLoaded", function(){
	if($(".lazy").length > 0){
		if("IntersectionObserver" in window == true){ // 브라우저 observer 지원 여부
			lazy.observer();
		}else{ // lazyload 처리
			document.addEventListener("scroll", lazy.lazyload);
			window.addEventListener("resize", lazy.lazyload);
			window.addEventListener("orientationChange", lazy.lazyload);
		};
	};
});

// 공통 아코디언
var acco = {
	accoClick : function(target){ // click
		if( $(target).closest(".acco-wrap.single").length > 0){ // 한개씩
			if( $(target).closest(".acco-item.is-active").length > 0 ){
				$(target).closest(".acco-item").removeClass("is-active");
				$(target).find("> .hidden").text("펼치기");
				$(target).closest(".acco-item").find(".acco-body").stop().slideUp(230);
			}else{
				$(target).closest(".acco-wrap").find(".acco-item").removeClass("is-active");
				$(target).closest(".acco-item").addClass("is-active");
				$(target).find("> .hidden").text("접기");
				$(target).closest(".acco-wrap").find(".acco-item .acco-body").stop().slideUp(230);
				$(target).closest(".acco-item").find(".acco-body").stop().slideDown({
					duration: 230
				});
			};
		}else{
			if( $(target).closest(".acco-item.is-active").length > 0 ){
				$(target).closest(".acco-item").removeClass("is-active");
				$(target).find("> .hidden").text("펼치기");
				$(target).closest(".acco-item").find(".acco-body").stop().slideUp(230);
			}else{
				$(target).closest(".acco-item").addClass("is-active");
				$(target).find("> .hidden").text("접기");
				$(target).closest(".acco-item").find(".acco-body").stop().slideDown({
					duration: 230
				});
			};
		};
	}
};

// 토글 active
function toggleActive(elm) {
	console.log(elm)
	elm.toggleClass('is-active');
}

// 토스트알림
function toastAlert(txt){
	var $toast = $('.ui_toast_alert');
	$toast.addClass('is-active').children('strong').text(txt);
	setTimeout(function(){
		$toast.removeClass('is-active');
	}, 3000);
}

// 테이블 캡션 생성
function setTableCaption(selector) {
	selector = selector ? selector + ' .tbl table' : '.tbl table';
	$(selector).each(function (index) {
		var table, tableClass, captionText, captionComplex, theadHeader, tbodyHeader, bodyToHeadIdxs, hasThead,
			captionSubFix;
		table = $(this);
		tableClass = $(this).closest('.tbl').attr("class");
		captionTextOrigin = $(this).find("caption").text();
		captionComplex = "";
		captionSubFix = "";
		theadHeader = [];
		tbodyHeader = [];
		bodyToHeadIdxs = [];
		hasThead = false;

		if (tableClass.match("tbl-form") && tableClass.match("form-view") !== null) {
			captionSubFix = "을(를) 입력하는 표입니다.";
		} else {
			captionSubFix = "을(를) 나타낸 표입니다.";
		}

		// thead th값 추출
		if ($(this).find("thead th").length > 0) {
			$(this).find("thead th").each(function (index) {
				theadHeader.push($(this).text());
			});
		}
		// tbody th값 추출
		if ($(this).find("tbody th").length > 0) {
			$(this).find("tbody th").each(function (index) {
				// tbody th가 thead th의 서브 헤더인 경우(thead th와 tbody th가 둘 다 존재하는 경우)
				if (theadHeader.length > 0) {
					if (tbodyHeader[$(this).index()] === undefined) {
						tbodyHeader[$(this).index()] = theadHeader[$(this).index()] + " 컬럼의 하위로";
					}
					tbodyHeader[$(this).index()] += " " + $(this).text();
				} else {
					tbodyHeader.push($(this).text());
				}
			});

			tbodyHeader = tbodyHeader.filter(function (n) {
				return n !== undefined;
			});
		}

		if (theadHeader.length > 0 && tbodyHeader.length > 0) {
			captionComplex += theadHeader.join(", ") + " " + tbodyHeader.join(", ");
		} else if (theadHeader.length > 0) {
			captionComplex += theadHeader.join(", ");
		} else if (tbodyHeader.length > 0) {
			captionComplex += tbodyHeader.join(", ");
		}

		//console.log(captionTextOrigin + " 목록이며 " + captionComplex +  " 을(를) 나타낸 표입니다.");
		$(this).find("caption").text(captionTextOrigin + " 테이블로 " + captionComplex + captionSubFix);
	});
}

//maxlength 체크
function maxLengthCheck(object){
	if (object.value.length > object.maxLength){
		object.value = object.value.slice(0, object.maxLength);
	}   
};

// 공통 z-index
var zIndex = 99;

$.fn.scrollCenter = function(elem, speed) {
	var active = $(this).find(elem);
	var activeWidth = active.width() / 2;
	var pos = active.position().left + activeWidth;
	var elpos = $(this).scrollLeft();
	var elW = $(this).width();
	pos = pos + elpos - elW / 2;
	$(this).animate({
	  scrollLeft: pos
	}, speed == undefined ? 1000 : speed);
	return this;
};

function loadingShow() {
	$('body').append(loadiingHtml);
}
function loadingHide() {
	$('.loading-wrap').remove();
}

function fnb() {
	// 메인 하단 라인 제거
	if (!$('#footer').length || !$('#footer .notice-area').length) {
		$('#main').addClass('border-none');
	}

	// 하단 스티키 버튼이 있을 때 footer 여백주기 
	if ($('#main > .btn-area.sticky').length || $('#main > .btn-area.fixed').length) {
		$('#footer').css('padding-bottom','62px');
	}

	if ($('.popup.open > .popup-content > .btn-area.sticky').length) {
	    //alert('aa');
		$('.popup-content').css('padding-bottom','82px');
	}

	//플로팅버튼 08-19
	var floatOrderHeight = $('.float-order:visible').outerHeight();
	var floatBtnHeight = $('.btn-area.sticky:visible').outerHeight();
	var floatTabHeight = $('.tab-bar.cf:visible').outerHeight();
	$('#wrap').addClass('is-btn-f');
	if($(".tab-bar.cf").length) {
		$('#footer').css('padding-bottom', floatTabHeight);
		$('.btn-f-area [class*=btn-]').css('bottom' , floatTabHeight);
	}
	if($(".btn-area.sticky").length) {
		$('#footer').css('padding-bottom', floatBtnHeight);
		$('.btn-f-area [class*=btn-]').css('bottom' , floatBtnHeight);
	}
	if($(".float-order").length) {
		$('#footer').css('padding-bottom', floatOrderHeight);
		$('.btn-f-area [class*=btn-]').css('bottom' , floatOrderHeight);
	}

	// 페이지 이동버튼
	var $window = $(window),
    fHeight = $('#footer').outerHeight(),
    fBtn = $('.btn-f-area');
	// fTop = $('#footer').offset().top;
	$window.on('scroll', function() {
    	var sT = $window.scrollTop();
	   	var val = $(document).height() - $window.height() - fHeight - 18;
		var sT2 = sT + $window.height() - 30;
		if (sT >= 100) {
			fBtn.addClass('is-active');
		} else {
			fBtn.removeClass('is-active');
		};

		if (sT2 > $('#footer').offset().top) {
			fBtn.addClass('is-footer');
			fBtn.css('top', '-30px');
		} else {
			fBtn.removeClass('is-footer');
			fBtn.removeAttr('style', 'top');
		}

		if( $("#header").outerHeight() !== sticky.headerHei && $(".auto-sticky").length > 0 ){
			sticky.autoFix();
		};
	});
}