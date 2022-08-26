// 22.04.22 lcs
var Filter = (function() {
	/* ------------------------ FUNCTION AREA -S- -------------------------- */
	// Constructor
	var _init = function(initObj) {
		// 스크롤 이벤트 삭제
		_nextPageEvnet(true);
		// web|mob filter type
		if (initObj && initObj.type) {
			var type = initObj.type;
			if (type == "WEB" || type == "MOB") {
				_constants.type = type;
			}
			delete initObj.type;
		}
		// sort
		if (initObj) initObj.sort = _getGoodsSortValue(initObj.sort);
		// 모듈 url
		if (initObj && initObj.moduleUrl) _constants.goodsListUrl = initObj.moduleUrl;
		// SET Init Callback
		if (initObj && initObj.initCallBack ) {
			if (typeof initObj.initCallBack == "function") {
				_initCallBack = initObj.initCallBack;
			}
			delete initObj.initCallBack;
		}
		// SET Filter Callback
		if (initObj && initObj.filterCallBack) {
			if (typeof initObj.filterCallBack == "function") {
				_filterCallBack = initObj.filterCallBack;
			}
			delete initObj.filterCallBack;
		}
		// SET Result CallBack
		if (initObj && initObj.resultCallBack) {
			if (typeof initObj.resultCallBack == "function") {
				_resultCallBack = initObj.resultCallBack;
			}
			delete initObj.resultCallBack;
		}
		// 2022.05.25 lcs .. collection 추가
		if (initObj && initObj.collection) {
			var coll = initObj.collection;
			if (coll == "search" || coll == "comment") {
				initObj.collection = ((coll == "search") ? "VGOODSSEARCHINFO" : "VGOODSCOMMENTINFO");
			}
		}
		// 필터 타겟 확인
		if (_setFilterTrgt()) return false; // resultArea 없을때 init 취소
		// 장치 확인
		_setSearchDevice();
		// MOB -스티키라인 사용 여부
		if (initObj && _filterTargetObj.result.sticky != null) {
			if (_constants.type == "MOB" && initObj.sticky_use_yn && initObj.sticky_use_yn == "N") {
				_filterTargetObj.result.sticky.style.display = "none";
			} else {
				_filterTargetObj.result.sticky.style.display = "";
			}
			delete initObj.sticky_use_yn;
		}
		// 혜택 버튼 사용 여부
		if (initObj && _filterTargetObj.result.bnefUl != null) {
			if (initObj.brnf_use_yn && initObj.brnf_use_yn == "N") {
				_filterTargetObj.result.bnefUl.style.display = "none";
			} else {
				_filterTargetObj.result.bnefUl.style.display = "";
			}
			delete initObj.brnf_use_yn;
		}
		// 고객 번호. 광고 스크립트 22.07.19 lcs
		if (initObj && initObj.custNo) {
			_advtScriptData.user_id = initObj.custNo;
			delete initObj.custNo;
		}
		// 고객 이메일 주소. 광고 스크립트 22.07.19 lcs
		if (initObj && initObj.custEmail) {
			_advtScriptData.email = initObj.custEmail;
			delete initObj.custEmail;
		}
		// 접속 매체. 광고 스크립트 22.07.19 lcs
		if (initObj && initObj.mediaCode) {
			_advtScriptData.mediaCode = initObj.mediaCode;
			delete initObj.mediaCode;
		}
		// 초기 데이터 병합
		_initData = _assign(_initData, initObj);
		// 초기 검색
		_initSearch(_initData);
		// 베스트 조회
		if (_filterTargetObj.rcnt.this != null) _rcntSearch(_initData, _filterTargetObj.rcnt.drawUl);
	};
	// 초기 조회
	var _initSearch = function(param) {
		if (_initCheck) {
			_initCheck = false;
			_searchParam = _assign(_searchParam, param) // 데이터 병합
			
			$.ajax({
				 type: "POST"
				,url: _constants.filterUrl
				,dataType: 'json'
				,async : true
				,data: _searchParam
				,headers: {
					 "X-CSRF-TOKEN" : _constants.xCsrfToken
				}
				,success: function(result) {
					// 필터 데이터
					_filterData = result;
				}
				,error: function(error) {
					console.error(error);
				}
				,complete: function() {
					_initCheck = true;
					if (_filterData["RESULT"] != null && _filterData["RESULT"].length > 0) {
						// 리스트 초기화
						_filterTargetObj.result.drawUl.innerHTML = "";
						// 필터 결과 정보 LOAD/DRAW
						_setGoodsList(_filterData, param.moduleType, _filterTargetObj.result.drawUl, _goodsCdList, _searchParam);
						// 필터 구역 DRAW
						_drawFilterArea();
						// 광고 스크립트 적용 22.07.19 lcs
						_callAdvtScript(_searchParam, _filterData);
					} else {
						_goodsCdList = [];
					}
					// 총 데이터 개수 및 정렬 이벤트 적용
					_drawResultArea(true);
					// callback
					if (typeof _initCallBack == "function") _initCallBack(param);
				}
			});
		}
	};
	// 필터조회|더보기 호출
	var _filterSearch = function(param) {
		if (param || _constants.infiniteLoad) {
			if (param) { // 필터조회 paging 초기화
				param.startcount = 0;
				if (typeof loadingShow == "function") loadingShow(); // 22.08.03 lcs 로딩바 적용
			} else { // 더보기
				_searchParam.startcount += _searchParam.pagesize;
			}
			// 데이터 병합
			_searchParam = _assign(_searchParam, param);
			// 페이지 로드 동기화 처리
			_constants.infiniteLoad = false;
			// 통신
			$.ajax({
				 type: "POST"
				,url: _constants.filterUrl
				,dataType: 'json'
				,async : true
				,data: _searchParam
				,headers: {
					 "X-CSRF-TOKEN" : _constants.xCsrfToken
				}
				,success: function(result) {
					_filterData = result;
				}
				,error: function(error) {
					console.error(error);
				}
				,complete: function() {
					if (param) {
						// 리스크 출력 여부
						_drawResultArea();
						// 리스트 초기화
						if (_filterTargetObj.result.drawUl != null) _filterTargetObj.result.drawUl.innerHTML = "";
					}
					if (_filterData["RESULT"] != null && _filterData["RESULT"].length > 0 
							&& (_initData.limitCnt ? _searchParam.startcount < _initData.limitCnt : true)) {
						// 필터 결과 정보 LOAD/DRAW
						_setGoodsList(_filterData, (_searchParam.moduleType == 'best') ? '' : _searchParam.moduleType, _filterTargetObj.result.drawUl, _goodsCdList, _searchParam);
					} else {
						// 스크롤 이벤트 삭제
						_nextPageEvnet(true);
					}
					if (param && typeof _filterCallBack == "function") _filterCallBack(_filterData["RESULT"]);
				}
			});
		}
	};
	// DB 최신 상품 정보 조회
	var _setGoodsList = function(dataObj, moduleType, trgt, goodsCdList, searchObj) { // dataObj = _filterData
		var cdArrStr = "";
		var catSn = ""; // 상세 카테고리 처리를 위한 변수 22.06.22 lcs
		for (var i in dataObj["RESULT"]) {
			cdArrStr += ((i == 0 ? "" : ",") + dataObj["RESULT"][i]["GOODS_CODE"]);
		}
		if (goodsCdList) goodsCdList.push(cdArrStr); // _setGoodsList 상품 코드 추가
		if (moduleType == "cat" || moduleType == "rcnt") catSn = _searchParam.category_code;
		$.ajax({
			 url :_constants.goodsListUrl
			,type: "POST"
			,async : true
			,data: {
				 goodsCd : cdArrStr
				,moduleType : moduleType
				,catSn : catSn
			}
			,headers: { "X-CSRF-TOKEN" : _constants.xCsrfToken }
			,success: function(result) {
				if (trgt != null) {
					if (searchObj.startcount == 0) {
						trgt.innerHTML = result;
					} else {
						trgt.innerHTML += result;
					}
				}
			}
			,error: function(error) {
				console.error(error);
				dataObj["GOODS_LIST"] = []; // 필터된 상품 리스트
				dataObj["GOODS_LIST_CNT"] = 0; // 필터된 상품의 총 카운트
			}
			,complete: function() {
				if (moduleType != 'rcnt') {
					_constants.infiniteLoad = true;
					// 스크롤 이벤트 등록
					_nextPageEvnet();
					// lazyImage
					_callLazyImage();
				} else if (_filterTargetObj.rcnt.this != null) {
					 _filterTargetObj.rcnt.this.style.display = "";
					 _filterTargetObj.rcnt.list.style.display = "";
				}
				// 22.08.03 lcs 로딩바 숨기기
				if (typeof loadingHide == "function") loadingHide();
				// 후처리 실행
				if (typeof _resultCallBack == "function") _resultCallBack(cdArrStr);
				// 공통 상품리스트 콜백 함수 (재고조회, fnb)
				_drawListCallBack(cdArrStr);
			}
		});
	};
	var _rcntSearch = function(param, trgt) {
		var bestData = {};
		
		param.startcount = 0; // index 0번 부터
		param.pagesize = 8; // 8개만 출력
		param.sort = "DATE/DESC"; // 최신순
		
		if (trgt != null) {
			$.ajax({
				 type: "POST"
				,url: _constants.filterUrl
				,dataType: 'json'
				,async : true
				,data: param
				,headers: {
					"X-CSRF-TOKEN" : _constants.xCsrfToken
				}
				,success: function(result) {
					// 필터 데이터
					bestData = result;
				}
				,error: function(error) {
					console.error(error);
				}
				,complete: function() {
					if (bestData["RESULT"] != null && bestData["RESULT"].length > 0) {
						_setGoodsList(bestData, 'rcnt', trgt, null, param);
						_filterTargetObj.rcnt.title.innerHTML = (param.category_name + " 최신상품");
					}
				}
			});
		}
	};
	// 필터 영역 그리기
	var _drawFilterArea = function() {
		var filterArea = _filterTargetObj.area.this;
		var brndCatUl = _filterTargetObj.brndCat.this
		
		if (filterArea != null) {
			var catDiv = _filterTargetObj.area.catDiv;
			var catUl = _filterTargetObj.area.catUl;
			var brndUl = _filterTargetObj.area.brndUl;
			var catArr = [];
			var brndArr = [];
			var catDrawYn = false;
			
			// groupStr To Object
			if (_filterData["CATEGORY_GROUP"] != null && _filterData["CATEGORY_GROUP"] != "") {
				catArr = _setGroupObjectArr(_filterData["CATEGORY_GROUP"], "CATEGORY_GROUP");
			}
			if (_filterData["BRAND_GROUP"] != null && _filterData["BRAND_GROUP"] != "") {
				brndArr = _setGroupObjectArr(_filterData["BRAND_GROUP"], "BRAND_CODE");
			}
			// 카테고리 필터
			if (catUl != null) {
				// 검색어 존재시
				if (_searchParam.moduleType.toLowerCase() != 'cat') {
					_drawFilterUl(catArr, catUl, "checkbox", "cat", true);
					catDiv.style.display = "";
					catDrawYn = true;
				} else {
					catDiv.style.display = "none";
				}
			}
			
			// 브랜드 필터|팝업
			if (brndUl != null) {
				// 브랜드 필터
				_drawFilterUl(brndArr, brndUl, "checkbox", "brnd", true);
				// 브랜드 팝업 :: 브랜드 리스트
				_drawBrndListPopup(brndArr);
				// 브랜드 팝업 :: 브랜드 탭, 검색
				_brndPopupSrchTabEvent();
			}
			_appendFilterEvent(catDrawYn);
		}
		// 브랜드 카테고리 ul
		if (brndCatUl != null) {
			var catArr = [];
			// groupStr To Object
			if (_filterData["CATEGORY_GROUP"] != null && _filterData["CATEGORY_GROUP"] != "") {
				catArr = _setGroupObjectArr(_filterData["CATEGORY_GROUP"], "CATEGORY_GROUP");
			}
			_drawBrndCatFilterUl(catArr, brndCatUl);
			_appendBrndCatFilterEvent(brndCatUl);
		}
	};
	// 필터 Ul 그리기
	var _drawFilterUl = function(arr, trgt, type, kind, hideFlag) {
		var cnt = 0;
		var flagMent = document.createDocumentFragment();
		// 타겟 초기화
		trgt.innerHTML = "";
		for (var i in arr) {
			var data = arr[i];
			if (_constants.type == "WEB") { // web
				cnt++;
				flagMent.appendChild(_drawWebFilterLi(data, type, kind, hideFlag, cnt));
			} else { // mob
				flagMent.appendChild(_drawMobFilterLi(data, type, kind));
			}
		}
		trgt.appendChild(flagMent);
	};
	// brnd cat filter
	var _drawBrndCatFilterUl = function(arr, trgt) {
		var flagMent = document.createDocumentFragment();
		
		for (var i in arr) {
			var data = arr[i];
			data.cnt = null; // 괄호 카운트 제거
			
			if (i == 0) {
				var tempAllData = {
					 "cd" : "all" ,"nm" : "전체" ,"cnt" : null
					,"data-type" : "CATEGORY_GROUP" ,"data-val" : "ALL"
				};
				flagMent.appendChild(_drawWebFilterLi(tempAllData, "radio", "brnd_cat"));
			}
			flagMent.appendChild(_drawWebFilterLi(data, "radio", "brnd_cat"));
		}
		trgt.appendChild(flagMent);
	};
	//
	var _appendBrndCatFilterEvent = function(trgt) {
		var inputArr = trgt.querySelectorAll("input[data-type]");
		if (inputArr.length > 0) {
			for (var i in inputArr) {
				if (typeof inputArr[i] == "object") {
					if (i == 0) inputArr[i].checked = true;
					inputArr[i].onclick = function() {
						_setExqueryFn(trgt, "cat", true);
					};
				}
			}
		}
	};
	// web filter
	var _drawWebFilterLi = function(data, type, kind, hideFlag, cnt) {
		var templi = document.createElement("li");
		var tempInput = document.createElement("input");
		var tempLabel = document.createElement("label");
		var cntText = (data.cnt ? _setCommaStr(data.cnt, true, true) : "");
		
		tempInput.setAttribute("type", type);
		tempInput.setAttribute("value", kind + "_" + data.cd);
		tempInput.setAttribute("id", "filter_" + kind + "_" + data.cd);
		tempInput.setAttribute("name", "filter_"+ kind);
		tempInput.className = "ipt";
		
		tempInput.setAttribute("data-type", data["data-type"]);
		tempInput.setAttribute("data-val", data["data-val"]);
		
		tempLabel.setAttribute("for", "filter_" + kind + "_" + data.cd);
		tempLabel.innerHTML = data.nm + cntText;
		
		if (hideFlag && cnt > 5) { // 5개 초과 데이터는 숨긴다
			templi.setAttribute("data-type", "add");
			templi.style.display = "none";
		}
		templi.appendChild(tempInput);
		templi.appendChild(tempLabel);
		
		return templi;
	};
	
	// mob filter
	var _drawMobFilterLi = function(data, type, kind) {
		var templi = document.createElement("li");
		var tempP = document.createElement("p");
		var tempStrg = document.createElement("strong");
		var tempSpan = document.createElement("span");
		var tempDiv = document.createElement("div");
		var tempInput = document.createElement("input");
		var tempLabel = document.createElement("label");
		
		var cntText = (data.cnt ? _setCommaStr(data.cnt, true) : 0);
		
		tempStrg.innerHTML = data.nm;
		tempSpan.innerHTML = cntText;
		
		tempP.appendChild(tempStrg);
		tempP.appendChild(tempSpan);
		
		tempInput.setAttribute("type", type);
		tempInput.setAttribute("id", "filter_" + kind + "_" + data.cd);
		tempInput.setAttribute("name", "filter_"+ kind);
		tempInput.setAttribute("value", kind + "_" + data.cd);
		
		tempInput.setAttribute("data-type", data["data-type"]);
		tempInput.setAttribute("data-val", data["data-val"]);
		
		tempLabel.setAttribute("for", "filter_" + kind + "_" + data.cd);
		tempLabel.innerHTML = data.nm;
		
		tempDiv.appendChild(tempInput);
		tempDiv.appendChild(tempLabel);
		tempDiv.className = "radio-check-only";
		
		templi.appendChild(tempP);
		templi.appendChild(tempDiv);
		
		return templi;
	}
	// 브랜드 찾기 팝업 : 브랜드 리스트 그리기 ... 22.05.11 기획변경 검색. 정렬 삭제
	var _drawBrndListPopup = function(brndArr, query, sort) {
		var spanDiv = _filterTargetObj.brndPopup.spanDiv;
		
		_brndPopupObj.data = brndArr;
		_brndPopupObj.query = query;
		_brndPopupObj.sort = sort;
		
		if (spanDiv != null && brndArr != null) {
			var popupObj = JSON.parse(JSON.stringify(brndArr));
			var flagMent = document.createDocumentFragment();
			
			spanDiv.innerHTML = ""; // empty
			
			if (sort == "nm") {
				popupObj.sort(function(a, b) {
					var x = a.nm.toLowerCase();
					var y = b.nm.toLowerCase();
					return (x < y) ? -1 : (x > y ? 1 : 0);
				});
			}
			for (var i in popupObj) {
				var data = popupObj[i];
				var tempSpan = document.createElement("span");
				var tempInput = document.createElement("input");
				var tempLabel = document.createElement("label");
				
				if (query && data["nm"].indexOf(query) < 0) {
					continue;
				}
				tempInput.setAttribute("type", "checkbox");
				tempInput.setAttribute("name", "filter_brndPop");
				tempInput.setAttribute("id", "brndPop_" + data["cd"]);
				
				tempInput.setAttribute("data-type", data["data-type"]);
				tempInput.setAttribute("data-val", data["data-val"]);
				
				tempInput.className = "ipt";
				
				tempLabel.setAttribute("for", "brndPop_" + data["cd"]);
				tempLabel.innerHTML = data["nm"] + _setCommaStr(data["cnt"], true, true);
				
				tempSpan.appendChild(tempInput);
				tempSpan.appendChild(tempLabel);
				
				flagMent.appendChild(tempSpan);
			}
			// 검색 브랜드 없을 시
			if (flagMent.children != null && flagMent.children.length < 1) {
				var tempLi = document.createElement("li");
				tempLi.className = "no-data";
				tempLi.innerHTML = (_brndPopupObj.query + "에 대한<br>검색 결과가 없습니다.");
				
				flagMent.appendChild(tempLi);
			}
			spanDiv.insertBefore(flagMent, spanDiv.childNodes[0]);
		}
	};
	// 결과 구역 그리기
	var _drawResultArea = function(init) {
		var cntEm = _filterTargetObj.result.cnt;
		var sortUl = _filterTargetObj.result.sortUl;
		var bnefUl = _filterTargetObj.result.bnefUl;
		var dataArea = _filterTargetObj.result.dataArea;
		var noData = _filterTargetObj.result.noData;
		
		// 카운트
		if (cntEm != null) cntEm.innerHTML = _setCommaStr(_filterData["TOTALCOUNT"]);
		// 정렬 이벤트
		if (_filterData["TOTALCOUNT"] > 0 && sortUl != null) {
			var sortLiArr = sortUl.querySelectorAll("input[name='result_sort']");
			if (init) {
				for (var i in sortLiArr) {
					if (typeof sortLiArr[i] == "object") {
						sortLiArr[i].onclick = function(event) {
							_setGoodsSort(event.target.value);
						}
					}
				}
			}
		}
		if (dataArea != null && noData != null) {
			if (_filterData["TOTALCOUNT"] > 0) {
				dataArea.style.display = "";
				noData.style.display = "none";
				// 
				if (bnefUl != null) {
					var bnefLiArr = bnefUl.querySelectorAll("[name='result_bnef']");
					for (var i in bnefLiArr) {
						if (typeof bnefLiArr[i] == "object") {
							bnefLiArr[i].onclick = function(event) {
								if (_filterTargetObj.area.this != null) {
									if (_constants.type == "WEB") {
										document.getElementById("filter_" + event.target.value).checked = event.target.checked;
									} else {
										var filterTrgt = document.getElementById("filter_" + event.target.value);
										if (event.target.parentNode.classList.contains("is-active")) { 
											filterTrgt.checked = false;
										} else {
											filterTrgt.checked = true;
										}
									}
								} else if (_constants.type == "MOB") {
									event.target.setAttribute("data-checked", (event.target.dataset.checked) ? "" : "checked");
								}
								_setBnefExqueryFn(bnefUl);
							}
						}
					}
				}
			} else { // 필터 데이터 없음
				if (typeof loadingHide == "function") loadingHide(); // 22.08.03 lcs 로딩바 숨기기
				dataArea.style.display = "none";
				noData.style.display = "";
			}
		}
	};
	// 브랜드 찾기 팝업 : 탭 정렬 이벤트
	var _brndPopupSrchTabEvent = function() {
		var brndUl = _filterTargetObj.area.brndUl;
		var popBrndDiv = _filterTargetObj.brndPopup.spanDiv;
		var popupSrchBtn = _filterTargetObj.brndPopup.popupSrchBtn;
		
		if (_filterTargetObj.brndPopup.this != null) {
			popupSrchBtn.addEventListener("click", function() {
				// 팝업 브랜드 값 복사
				_brndCheckCopy(popBrndDiv, brndUl);
				// 재조회
				_setExqueryFn(brndUl, "brnd");
				// 팝업 닫기
				if (popup != undefined) {
					popup.close('.pop-wrap');
				} else {
					// TODO:UPDATE
				}
			});
			/* // 22.05.11 lcs  기획변경. 브랜드 팝업 탭, 검색 기능 삭제
			var srchBtn = _filterTargetObj.brndPopup.srchBtn;
			var srchInput = _filterTargetObj.brndPopup.srchInput;
			var sortCntTab = _filterTargetObj.brndPopup.sortCntTab;
			var sortNmTab = _filterTargetObj.brndPopup.sortNmTab;
			
			srchBtn.addEventListener("click", _brndSrchEvent);
			srchInput.addEventListener("keyup", function(event) {
				if (event.keyCode === 13) {
					_brndSrchEvent(event);
				}
			});
			sortCntTab.addEventListener("click", function() {
				_drawBrndListPopup(_brndPopupObj.data,_brndPopupObj.query, "cnt");
			});
			sortNmTab.addEventListener("click", function() {
				_drawBrndListPopup(_brndPopupObj.data,_brndPopupObj.query, "nm");
			});
			*/
		}
	};
	// 브랜드 찾기 팝업 : 검색
	/*
	var _brndSrchEvent = function(event) {
		var srchInput = _filterTargetObj.brndPopup.srchInput;
		_drawBrndListPopup(_brndPopupObj.data, srchInput.value, _brndPopupObj.sort);
	};
	*/
	// 필터 이벤트
	var _appendFilterEvent = function(catDrawYn) {
		if (catDrawYn) _catEvent(); // 카테고리
		_brndEvent(); // 브랜드
		_priceEvent(); // 가격
		_bnefEvent() // 혜택
		_keywordEvent(); // 키워드
		_etcEvent(); // 기타(tv상품,품절제외)
		_resetEvent(); // 초기화
		if (_constants.type == "MOB") {
			_searchBtnEvent(); // 결과 내 검색 버튼
			_closeEvent(); // 닫기 버튼
		}
	};
	// 카테고리 EVENT : 결과 내 검색
	var _catEvent = function() {
		var catAddBtn = _filterTargetObj.area.catAddBtn;
		var catUl = _filterTargetObj.area.catUl;
		var tempLiArr = catUl.querySelectorAll("li[data-type='add']");
		
		if (tempLiArr.length > 0) {
			if (catAddBtn != null) {
				catAddBtn.style.display = "";
				catAddBtn.addEventListener("click", function(event) {
					for (var i in tempLiArr) {
						if (typeof tempLiArr[i] == "object") {
							if (tempLiArr[i].style.display != "none") {
								tempLiArr[i].style.display = "none";
								event.target.innerHTML = "더보기"
							} else {
								tempLiArr[i].style.display = "";
								event.target.innerHTML = "닫기"
							}
						}
					}
				});
			}
		}
		_setFilterEvent(catUl, "cat");
	};
	// 브랜드 EVENT : 결과 내 검색
	var _brndEvent = function() {
		var brndAddBtn = _filterTargetObj.area.brndAddBtn;
		var brndPopup = _filterTargetObj.brndPopup.this;
		var popupBody = _filterTargetObj.brndPopup.popupBody;
		var brndUl = _filterTargetObj.area.brndUl;
		var popBrndDiv = _filterTargetObj.brndPopup.spanDiv;
		
		if (brndAddBtn != null) {
			brndAddBtn.style.display = "";
			brndAddBtn.addEventListener("click", function() {
				// 레이어 팝업 열기
				if (popup != undefined) {
					popup.open(brndPopup);
				} else {
					// TODO:UPDATE 
					alert("css script load error");
				}
				// 스크롤 초기화
				popupBody.scrollTo(0, 0);
				// 팝업 브랜드 값 복사
				_brndCheckCopy(brndUl, popBrndDiv);
			});
		}
		_setFilterEvent(brndUl, "brnd");
	};
	// 가격 EVENT : 결과 내 검색
	var _priceEvent = function() {
		var priceUl = _filterTargetObj.area.priceUl;
		var priceMin = _filterTargetObj.area.priceMin;
		var priceMax = _filterTargetObj.area.priceMax;
		var price0 = _filterTargetObj.area.price0;
		var priceSrch = _filterTargetObj.area.priceSrch;
		var inputArr = priceUl.querySelectorAll("input[data-type]");
		
		if (price0 != null) {
			price0.setAttribute("data-minval", _filterData["MINPRICE"]);
			price0.setAttribute("data-maxval", _filterData["MAXPRICE"]);
		}
		
		// 최대 최소 기본값
		priceMin.value = _setCommaStr(_filterData["MINPRICE"]);
		priceMax.value = _setCommaStr(_filterData["MAXPRICE"]);
		
		// li click event
		for (var i in inputArr) {
			var trgt = inputArr[i];
			if (typeof trgt == "object" && trgt != price0) {
				trgt.addEventListener("click", function(event) {
					var dataSet = event.target.dataset;
					priceMin.value = _setCommaStr((dataSet.minval) ? dataSet.minval : null);
					priceMax.value = _setCommaStr((dataSet.maxval) ? dataSet.maxval : null);
					if (_constants.type == "MOB") {
						priceSrch.click();
					}
				});
			}
		}
		// 가격 확인 BTN
		if (priceSrch != null) {
			priceSrch.addEventListener("click", function() {
				var exqueryStr = "BEST_PRICE" + _constants.order_media_str;
				var minVal = null;
				var maxVal = null;
				if (priceMin.value) {
					minVal = priceMin.value.replace(/,/g, "");
					_exquery.price[exqueryStr + ":gte"] = minVal;
				}
				if (priceMax.value) {
					maxVal = priceMax.value.replace(/,/g, "");
					_exquery.price[exqueryStr + ":lte"] = maxVal;
				}
				if (minVal && maxVal && Number(minVal) > Number(maxVal)) {  // 22.08.16 최소금액이 최대금액보다 클때
					_constants.priceOverChck = true;
				} else {
					_constants.priceOverChck = false;
				}
				
				if (_constants.type == "WEB") {
					_setFilterData(); // 필터 데이터 셋팅 후 조회
				} else {
					var textUl = _filterTargetObj.area.text.price
					if (textUl != null) {
						var tempLi = document.createElement("li");
						var rtnStr = "";
						if (priceMin.value) {
							rtnStr += (priceMin.value + "원");
						}
						rtnStr += " ~ ";
						if (priceMax.value) {
							rtnStr += (priceMax.value + "원");
						}
						tempLi.innerHTML = rtnStr;
						textUl.innerHTML = "";
						textUl.appendChild(tempLi);
					}
				}
			});
		}
	};
	// 혜택 EVENT : 결과 내 검색
	var _bnefEvent = function() {
		var bnefUl = _filterTargetObj.area.bnefUl;
		
		if (bnefUl != null) {
			var bnefLiArr = bnefUl.querySelectorAll("[name='filter_bnef']");
			for (var i in bnefLiArr) {
				if (typeof bnefLiArr[i] == "object") {
					bnefLiArr[i].onclick = function(event) {
						if (_filterTargetObj.area.this != null) {
							bnefBtn = document.getElementById("result_" + event.target.value);
								if (bnefBtn != null) {
									if (_constants.type == "WEB") {
									bnefBtn.checked = event.target.checked;
								} else {
									if (event.target.checked) {
										bnefBtn.parentNode.classList.add("is-active");
										bnefBtn.setAttribute("data-checked", "checked");
									} else {
										bnefBtn.parentNode.classList.remove("is-active");
										bnefBtn.setAttribute("data-checked", "");
									}
								}
							}
						}
						if (_constants.type == "WEB") {
							_setBnefExqueryFn(bnefUl);
						} else {
							_setBnefExqueryFn(bnefUl, true);
						}
					}
				}
			}
		}
	};
	// 키워드 EVENT : 결과 내 검색
	var _keywordEvent = function() {
		var keywordBtn = _filterTargetObj.area.keywordBtn;
		var keywordInput = _filterTargetObj.area.keywordInput;
		
		keywordBtn.addEventListener("click", _keywordAddEvent);
		keywordInput.addEventListener("keyup", function(event) {
			if (event.keyCode === 13) {
				_keywordAddEvent();
			}
		});
	};
	// 기타 EVENT(tv상품, 품절제외) : 결과 내 검색
	var _etcEvent = function() { 
		var etcDiv = _filterTargetObj.area.ectDiv;
		_setFilterEvent(etcDiv, "etc");
	};
	// 초기화 EVENT
	var _resetEvent = function() {
		var resetBtn =  _filterTargetObj.area.resetBtn;
		// 초기화
		resetBtn.addEventListener("click", function() {
			// 필터 초기화
			_filterReset();
			// 필터 데이터 구성 후 조회
			_setFilterData(true);
			// MOB 팝업 닫기
			if (_constants.type == "MOB") {
				popup.close('#goodsFilterArea');
			}
		});
	};
	// 닫기 EVENT - MOB
	var _closeEvent = function() {
		var closeBtn = _filterTargetObj.area.closeBtn;
		if (_constants.type == "MOB" && closeBtn != null) {
			closeBtn.addEventListener("click", function() {
				_filterReset(); // 초기화
				if (Object.keys(_mobFilterData).length > 0) {
					var textUl = _filterTargetObj.area.text;
					var filterData = _mobFilterData.exquery;
					
					// 카테고리
					if (Object.keys(filterData.cat).length > 0) {
						var catStr = filterData.cat["CATEGORY_GROUP"];
						var catArr = catStr.split("|");
						for (var i in catArr) {
							document.getElementById("filter_cat_" + catArr[i]).click();
						}
					}
					// 브랜드
					if (Object.keys(filterData.brnd).length > 0) {
						var brndStr = filterData.brnd["BRAND_CODE"];
						var brndArr = brndStr.split("|");
						for (var i in brndArr) {
							document.getElementById("filter_brnd_" + brndArr[i]).click();
						}
					}
					// 혜택
					if (Object.keys(filterData.bnef).length > 0) {
						for (var str in filterData.bnef) {
							var bnefBtnArr = [];
							str = str.replace("_PC","").replace("_APP","");
							bnefBtnArr = document.querySelectorAll("[data-type="+str+"]");
							
							for (var i in bnefBtnArr) {
								var bnefBtn = bnefBtnArr[i];
								if (typeof bnefBtn == "object") {
									if (bnefBtn.nodeName == "INPUT") {
										bnefBtn.click();
									} else {
										bnefBtn.parentNode.classList.add("is-active");
									}
								}
							}
						}
					}
					// 기타
					if (Object.keys(filterData.etc).length > 0) {
						document.getElementById("etc_soldout").click();
					}
					// 가격
					if (Object.keys(filterData.price).length > 0) {
						var minval = 0;
						var maxval = 0;
						var trgt;
						for (var str in filterData.price) {
							if (str.indexOf('gte') > -1) minval = filterData.price[str]; // 최소값
							if (str.indexOf('lte') > -1) maxval = filterData.price[str]; // 최대값
						}
						trgt = document.querySelector("input[data-minval='" + minval + "']" + ((maxval != 0) ? ("[data-maxval='" + maxval + "']") : ""));
						if (trgt != null) {
							trgt.click();
						} else {
							_filterTargetObj.area.priceMin.value = minval;
							_filterTargetObj.area.priceMax.value = maxval;
							_filterTargetObj.area.priceSrch.click();
						}
					}
					// 키워드
					if (_mobFilterData.kwdStrArr.length > 0) {
						_keywordAddEvent(_mobFilterData.kwdStrArr);
					}
				}
			});
		}
	};
	// 필터 초기화
	var _filterReset = function() {
		// 체크박스 초기화
		var tempObj = { // 카테고리|브랜드|혜택 
			 catLiArr : _filterTargetObj.area.catUl.querySelectorAll("input[data-type]")
			,brndLiArr : _filterTargetObj.area.brndUl.querySelectorAll("input[data-type]")
			,bnefLiArr : _filterTargetObj.area.bnefUl.querySelectorAll("input[data-type]")
		};
		// 리스트 혜택 버튼
		var resultBnefArr = _filterTargetObj.result.bnefUl.querySelectorAll("[data-type]");
		
		for (var i in tempObj) {
			for (var j in tempObj[i]) {
				var ele = tempObj[i][j];
				if (ele != null && typeof ele == "object") {
					ele.checked = false;
				}
			}
		}
		// MOB - textUl 비우기
		if (_constants.type == "MOB") {
			// MOB - textUl 비우기
			var textUl = _filterTargetObj.area.text;
			if (textUl != null) {
				for (var i in textUl) {
					var textEle = textUl[i];
					if (textEle != null) {
						textEle.innerHTML = "";
					}
				}
			}
			// MOB - UL POLD
			var listUl = _filterTargetObj.area.listUl;
			if (listUl != null) {
				var trgtLiArr = listUl.childNodes;
				for (var i in trgtLiArr) {
					var trgt = trgtLiArr[i];
					if (trgt.nodeName == "LI" && trgt.classList.contains("is-active")) {
						trgt.classList.remove("is-active");
						trgt.querySelector(".hide-area").style.display = "none";
					}
				}
			}
			// MOB - SCROLL TOP
			var filter = _filterTargetObj.area.this;
			if (filter != null) {
				filter.scrollTo(0, 0);
			}
		}
		// result bnef area
		if (resultBnefArr != null) {
			for (var i in resultBnefArr) {
				var trgt = resultBnefArr[i];
				if (typeof trgt == "object") {
					if (_constants.type == "WEB") {
						trgt.checked = false;
					} else {
						trgt.parentNode.classList.remove("is-active");
						trgt.setAttribute("data-checked", "");
					}
				}
			}
		}
		// 초기 가격 설정
		if (_filterTargetObj.area.this != null) {
			var price0 = _filterTargetObj.area.price0;
			var dataSet = price0.dataset;
			_filterTargetObj.area.priceMin.value = _setCommaStr(dataSet.minval);
			_filterTargetObj.area.priceMax.value = _setCommaStr(dataSet.maxval);
			price0.checked = true;
			// 기타(품절제외)
			document.getElementById("etc_soldout").checked = false;
		}
	};
	
	// MOB 결과 내 검색 버튼
	var _searchBtnEvent = function() {
		var filter = _filterTargetObj.area.this;
		var srchBtn = _filterTargetObj.area.searchBtn;
		
		if (filter != null && srchBtn != null) {
			srchBtn.addEventListener("click", function() {
				_setFilterData(); // 조회
				
				if (popup != undefined) {
					popup.close('#goodsFilterArea');
				}
			});
		}
	};
	// 키워드 추가
	var _keywordAddEvent = function(kwdArr) {
		var keywordInput = _filterTargetObj.area.keywordInput;
		
		if (!kwdArr || kwdArr instanceof Event) {
			kwdArr = [];
			kwdArr.push(keywordInput.value.trim());
		}
		if (kwdArr.length > 0) {
			for (var idx in kwdArr) {
				var inputVal = kwdArr[idx];
				var newWordYn = true;
				
				if (inputVal != "") {
					for (var i in _keywordStrArr) {
						if (_keywordStrArr[i] == inputVal) {
							newWordYn = false;
						}
					}
					if (newWordYn) {
						var trgt = _filterTargetObj.area.keywordDiv;
						var newKeywordBtn = document.createElement("button");
						
						newKeywordBtn.addEventListener("click", _keywordDelEvent);
						newKeywordBtn.setAttribute("type", "button");
						newKeywordBtn.innerHTML = inputVal;
						
						if (_constants.type == "WEB") {
							newKeywordBtn.className = "srch-flag";
							trgt.insertBefore(newKeywordBtn, trgt.childNodes[0]);
						} else {
							var newnewKeywordLi = document.createElement("li");
							newnewKeywordLi.appendChild(newKeywordBtn);
							trgt.insertBefore(newnewKeywordLi, trgt.childNodes[0]);
						}
						_keywordStrArr.push(inputVal);
					}
					keywordInput.value = "";
					
					// 필터 데이터 셋팅 후 조회
					if (_constants.type == "WEB") _setFilterData();
					else _drawKeywordTextUl();
				}
			}
		}
	};
	// 키워드 삭제
	var _keywordDelEvent = function(event) {
		if (_keywordStrArr.length > 0) {
			for (var i in _keywordStrArr) {
				if (_keywordStrArr[i] == event.target.innerHTML) {
					_keywordStrArr.splice(i, 1);
				}
			}
		}
		if (_constants.type == "WEB") {
			event.target.parentNode.removeChild(event.target);
			_setFilterData();
		} else {
			event.target.parentNode.remove();
			_drawKeywordTextUl();
		}
	};
	// MOB 키워드 텍스트 ul 그리기
	var _drawKeywordTextUl = function() {
		var trgtUl = document.getElementById("filter_keywordInput_text");
		var flagMent = document.createDocumentFragment();
		trgtUl.innerHTML = ""; // ul 초기화
		
		if (_keywordStrArr.length > 0) {
				for (var i in _keywordStrArr) {
				var tempLi = document.createElement("li");
				tempLi.innerHTML = _keywordStrArr[i];
				flagMent.appendChild(tempLi);
			}
			trgtUl.appendChild(flagMent);
		}
	};
	// 카테고리|브랜드|기타(tv상품,품절제외)
	var _setFilterEvent = function(trgt, type) {
		var inputArr = trgt.querySelectorAll("input[data-type]");
		if (inputArr.length > 0) {
			for (var i in inputArr) {
				if (typeof inputArr[i] == "object") {
					inputArr[i].onclick = function(event) {
						if (type == "bnef" && _filterTargetObj.result.bnefUl != null) {
							document.getElementById("result_" + event.target.value).checked = event.target.checked;
						}
						_setExqueryFn(trgt, type);
					};
				}
			}
		}
	};
	// BNEF 용 exquery 작성 후 검색
	var _setBnefExqueryFn = function(trgt, apply) {
		var filterBneful = _filterTargetObj.area.bnefUl;
		trgt = (filterBneful != null ) ? filterBneful : trgt;
		
		var inputArr = trgt.querySelectorAll("[data-type]");
		var filterTypeObj = {};
		if (inputArr.length > 0) {
			var textUl = document.getElementById("filter_bnef_text");
			if (textUl != null) textUl.innerHTML = "";
			for (var idx in inputArr) {
				var input = inputArr[idx];
				if (typeof input == "object") {
					var tempObj = input.dataset;
					if (tempObj && (input.checked || tempObj.checked == "checked")) {
						var typeStr = ("APP_YN|FREE_YN|NOREST_YN".indexOf(tempObj.type) < 0) ? (tempObj.type + _constants.order_media_str) : tempObj.type;
						filterTypeObj[typeStr] = tempObj.val;
						if (_constants.type == "MOB" && textUl != null) {
							var inputLabel = input.nextSibling;
							var tempLi = document.createElement("li");
							tempLi.innerHTML = inputLabel.innerHTML;
							textUl.appendChild(tempLi);
						}
					}
				}
			}
			_exquery["bnef"] = filterTypeObj;
			// 필터 데이터 셋팅 후 조회
			if (!apply) {
				_setFilterData();
			}
		}
	};
	// exquery 작성 후 검색
	var _setExqueryFn = function(trgt, type, exe) {
		var inputArr = trgt.querySelectorAll("input[data-type]");
		var filterTypeObj = {};
		
		if (inputArr.length > 0) {
			var textUl = document.getElementById(inputArr[0].getAttribute("name") + "_text");
			if (textUl != null) textUl.innerHTML = "";
			
			for (var idx in inputArr) {
				var input = inputArr[idx];
				
				if (typeof input == "object" && input.checked) {
					var tempObj = input.dataset;
					var inputLabel = input.nextSibling;
					var tempLi = document.createElement("li");
					
					if (tempObj && type != "price") {
						if (type != "bnef") {
							if (filterTypeObj[tempObj.type] == undefined) {
								filterTypeObj[tempObj.type] = tempObj.val;
							} else {
								filterTypeObj[tempObj.type] += ("|" + tempObj.val);
							}
						}
					}
					if (_constants.type == "MOB" && textUl != null) {
						var inputLabel = input.nextSibling;
						var tempLi = document.createElement("li");
						tempLi.innerHTML = inputLabel.innerHTML;
						textUl.appendChild(tempLi);
					}
				}
			}
			_exquery[type] = filterTypeObj;
			if (type == "cat" && filterTypeObj["CATEGORY_GROUP"] == "ALL") {
				_exquery[type] = {};
			}
		}
		// 조회실행여부가 true 이거나 web일 경우 필터 데이터 셋팅 후 조회
		if (exe || _constants.type == "WEB") {
			_setFilterData();
		}
	}
	// 필터 데이터 셋팅 후 조회
	var _setFilterData = function(reset) {
		var tempObj = {
			exquery : "", filterquery: "", requery : ""
		};
		
		if (reset) { // 초기화
			// 원본 조건
			tempObj.exquery = _initData.exquery;
			// 원본 가격
			tempObj.filterquery = _initData.filterquery;
			// 원본 키워드
			tempObj.filterquery = _initData.requery;
		} else {
			// 최소/최대 가격 얼럿 22.08.16 최소금액이 최대금액보다 클때
			if (_constants.priceOverChck) {
				alert('입력된 최소가격이 최대가격보다 더 큽니다');
				return;
			} else {
				// 필터, 가격
				for (var i in _exquery) {
					var type = _exquery[i];
					for (var opt in type) {
						var val = type[opt];
						var tempStr = "";
						
						if (i != "price" && opt.indexOf("DOWNLOAD_COUPON_AMT") < 0) {
							tempStr = ("<"+ opt + ":contains:" + val + ">");
							tempObj.exquery = ((tempObj.exquery == "") ? tempStr : (tempObj.exquery + " " + tempStr));
							
							if (opt.indexOf("CARD_YN") > -1) {
								tempObj.exquery += ("|<SETTLE_PROMO_YN" + _constants.order_media_str + ":contains:1>");
							}
						} else {
							tempStr = ("<"+ opt + ":" + val + ">");
							tempObj.filterquery = ((tempObj.filterquery == "") ? tempStr : (tempObj.filterquery + " " + tempStr));
						}
					}
				}
				// 키워드
				if (_keywordStrArr.length > 0) {
					for (var i in _keywordStrArr) {
						var kwd = _keywordStrArr[i];
						tempObj.requery += ((tempObj.requery != "" ? " " : "") + kwd);
					}
				}
			}
		}
		// 필터 복구용 데이터
		_mobFilterData = { exquery : JSON.parse(JSON.stringify(_exquery)), kwdStrArr : JSON.parse(JSON.stringify(_keywordStrArr)) };
		// 조회
		_filterSearch(tempObj);
	};
	// 스크롤 이벤트 : 데이터 추가 조회
	var _nextPageEvnet = function(removeYn) {
		if (!removeYn) {
			document.addEventListener('scroll', _infinitScroll);
		} else {
			document.removeEventListener('scroll', _infinitScroll);
		}
	};
	// lazy image
	var _callLazyImage = function () {
		// img lazy load
		if (lazy != undefined) {
			if ($(".lazy").length > 0){
				if("IntersectionObserver" in window == true){ // 브라우저 observer 지원 여부
					lazy.observer();
				}else{ // lazyload 처리
					document.addEventListener("scroll", lazy.lazyload);
					window.addEventListener("resize", lazy.lazyload);
					window.addEventListener("orientationChange", lazy.lazyload);
				};
			}
		}
	};
	// 스크롤 이벤트
	var _infinitScroll = function() {
		var footerHeight = (document.getElementById("footer")) ? document.getElementById("footer").offsetHeight : 400;
		if (_constants.infiniteLoad && (window.innerHeight + window.pageYOffset + footerHeight) >= document.body.offsetHeight) {
			// 페이징 처리
			_filterSearch();
		}
	};
	// 
	var _setGoodsSort = function(sort) {
		_filterSearch({sort : _getGoodsSortValue(sort)});
	};
	var _brndCheckCopy = function(baseEle, trgtEle) {
		var baseArr = baseEle.querySelectorAll("input[data-type]");
		var trgtArr = trgtEle.querySelectorAll("input[data-type]");
		
		for (var i in baseArr) {
			var baseInput = baseArr[i];
			if (typeof baseInput != "object") continue;
			for (var j in trgtArr) {
				var trgtInput = trgtArr[j];
				if (typeof trgtInput != "object") continue;
				if (baseInput.getAttribute("data-val") == trgtInput.getAttribute("data-val")) {
					trgtInput.checked = baseInput.checked;
				}
			}
		}
	};
	var _setGroupObjectArr = function(filterObj, exqueryType) {
		var tempFilterArr = filterObj.split(",");
		var rtnArr = [];
		
		for (var i in tempFilterArr) {
			var tempArr = tempFilterArr[i].split("|");
			rtnArr[i] = {};
			rtnArr[i].cd = tempArr[0];
			rtnArr[i].nm = tempArr[1];
			rtnArr[i].cnt = tempArr[2];
			rtnArr[i]["data-type"] = exqueryType;
			rtnArr[i]["data-val"] = tempArr[0];
		}
		return rtnArr;
	};
	var _setCommaStr = function(num, limit, bracket) {
		var len, point, str;
		if (num == 0) return num;
		if (!num) return null;
		if (limit && num > 9999 && bracket) {
			return " (9,999+)";
		} else if (limit && num > 9999) {
			return " 9,999+";
		}
		
		num = num + "";
		point = num.length % 3;
		len = num.length;
		str = num.substring(0, point);
		
		while (point < len) {
			if (str != "") str += ",";
			str += num.substring(point, point + 3);
			point += 3;
		}
		return bracket ? (" (" + str + ")") : ((str == "" || str == 0) ? 0 : str);
	};
	var _getGoodsSortValue = function(sort) {
		var sortVal = "SORT_POPGOODS/DESC";
		switch (sort) {
			case '1' : // 최신순
				sortVal = "DATE/DESC";
				break;
			case '2' : // 낮은가격순
				sortVal = "BEST_PRICE/ASC";
				break;
			case '3' : // 높은가격순
				sortVal = "BEST_PRICE/DESC";
				break;
			case '4' : // 상품평순
				sortVal = "SORT_COMMENT/DESC";
				break;
			case '5' : // 인기상품순
				sortVal = "SORT_POPGOODS/DESC";
				break;
			default :
				sortVal = "SORT_POPGOODS/DESC";
		}
		return sortVal;
	}
	var _isAndroid = function() {
		return /(Android)/.test(navigator.userAgent);
	};
	var _isIOS = function() {
		return /iP(hone|od|ad)/.test(navigator.userAgent);
	};
	var _isApp = function() {
		return /shoppingntapp/.test(navigator.userAgent);
	};
	var _isPcWeb = function() {
		var filter = "win16|win32|win64|mac|macintel";
		if ( navigator.platform ) {
			if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) {
				//모바일 접속
				return false;
			} else {
				//PC 접속
				return true;
			}
		}
	};
	// 장치 확인
	var _setSearchDevice = function() {
		if (_isApp()) {
			_constants.order_media_str = "_APP";
			_initData.order_media_flag = "65";
		} else {
			if (_isPcWeb()) {
				_constants.order_media_str = "_PC";
				_initData.order_media_flag = "61";
			} else {
				_initData.order_media_flag = "62";
			}
		}
	};
	// 필터 타겟 확인
	var _setFilterTrgt = function() {
		_filterTargetObj = {
			 area : {
				 this : document.getElementById("goodsFilterArea")
				,catDiv : document.getElementById("filter_cat")
				,catUl : document.getElementById("filter_catUl")
				,catAddBtn : document.getElementById("filter_catAddBtn")
				,brndUl : document.getElementById("filter_brndUl")
				,brndAddBtn : document.getElementById("filter_brndAddBtn")
				,priceUl : document.getElementById("filter_priceUl")
				,price0 : document.getElementById("filter_price_0")
				,priceMin : document.getElementById("filter_priceMin")
				,priceMax : document.getElementById("filter_priceMax")
				,priceSrch : document.getElementById("filter_priceSrchBtn")
				,bnefUl : document.getElementById("filter_bnefUl")
				,keywordInput : document.getElementById("filter_keywordInput")
				,keywordBtn : document.getElementById("filter_keywordBtn")
				,keywordDiv : document.getElementById("filter_keywordDiv")
				,ectDiv : document.getElementById("filter_etcArea")
				,resetBtn : document.getElementById("filter_resetBtn")
				,searchBtn : document.getElementById("filter_searchBtn")
				,closeBtn : document.getElementById("filter_closeBtn")
				,listUl : document.getElementById("filer_list_ul")
				,text : {
					 cat : document.getElementById("filter_cat_text")
					,brnd : document.getElementById("filter_brnd_text")
					,price : document.getElementById("filter_price_text")
					,bnef : document.getElementById("filter_bnef_text")
					,kwd : document.getElementById("filter_keywordInput_text")
				}
			}
			,brndPopup: {
				 this : document.getElementById("filter_brndPopup")
				,popupBody : document.getElementById("filter_popup_body")
				,srchInput : document.getElementById("filter_brndSrch_input")
				,srchBtn : document.getElementById("filter_brndSrch_btn")
				,sortCntTab : document.getElementById("filter_brndSort_cnt")
				,sortNmTab : document.getElementById("filter_brndSort_nm")
				,spanDiv : document.getElementById("filter_brndSpanDiv")
				,popupSrchBtn : document.getElementById("filter_popupSrch_btn")
			}
			,result : {
				 this : document.getElementById("goodsResultArea")
				,dataArea : document.getElementById("result_dataArea")
				,sticky : document.getElementById("result_filter_section")
				,cnt : document.getElementById("result_cnt")
				,sortUl : document.getElementById("result_sortUl")
				,bnefUl : document.getElementById("result_bnef")
				,drawUl : document.getElementById("result_drawUl")
				,noData : document.getElementById("result_nodata")
			}
			,rcnt : {
				 this : document.getElementById("goodsFilterRcnt")
				,title : document.getElementById("rcnt_title")
				,list : document.getElementById("rcnt_list")
				,drawUl : document.getElementById("rcnt_drawUl")
			}
			,brndCat : {
				 this : document.getElementById("goodsBrndCatUl")
			}
		};
		// result area 존재여부에 따른 return
		if (_filterTargetObj.result.dataArea == null) {
			return true;
		}
		// filter_area 존재여부에 따른 재고 포함 수정
		if (_filterTargetObj.area.this == null) {
			_initData.exquery = '';
			_exquery.etc = {};
		}
		return false;
	};
	
	// 리스트 그린 후 공통 콜백 함수 - 일시품절, fnb
	var _drawListCallBack = function(goodsList) {
		if (typeof jQuery != 'undefined' && $.eshopfront && (stockChkGoods != undefined)) {
			if (_goodsCdList.length > 0) {
				stockChkGoods = goodsList;
				$.eshopfront.cmm.stockChkGoods();
				stockChkGoods = "";
			}
			// pub_common.js fnb
			if (typeof fnb == "function") {
				fnb();
			}
		}
	};
	// 검색엔진 초기 조회 후 콜백 함수
	var _initCallBack
	// 필터 후 커스텀 콜백 함수 
	var _filterCallBack;
	// 리스트 그린 후 커스텀 콜백 함수
	var _resultCallBack;
	// 광고 스크립트 호출 22.07.19 lcs
	var _callAdvtScript = function(searchData, dataObj) {
		if (dataObj && dataObj["RESULT"] && dataObj["RESULT"].length > 0) {
			var deviceType = /iPad/.test(navigator.userAgent) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : "d";
			var site = _getAdvtDevice(); // _advtScriptData.site 서비스 타입 종류
			var custNo = _advtScriptData.user_id != "" ? _advtScriptData.user_id.trim() : _advtScriptData.user_id;
			var custEmail = _advtScriptData.email != "" ? _advtScriptData.email.trim().toLowerCase() : _advtScriptData.email;
			var query = (searchData.oriQuery && searchData.oriQuery != null && searchData.oriQuery != "") ? searchData.oriQuery.trim() : searchData.query;
			var from_hsmoa = _getFromHsmoa();
			var tempGoodsArr = [];
			
			// 상품 리스트 최대 3개
			for (var i in dataObj["RESULT"]) {
				tempGoodsArr.push(String(dataObj["RESULT"][i]["GOODS_CODE"]));
				if (tempGoodsArr.length > 2) break;
			}
			
			// 크리테오Criteo Script
			if (typeof window.criteo_q != "undefined") {
				window.criteo_q = window.criteo_q || [];
				window.criteo_q.push(
					 { event: "setAccount", account: 66997 }
					,{ event: "setEmail", email: custEmail }
					,{ event: "setSiteType", type: deviceType }
					,{ event: "viewList", item: tempGoodsArr }
				);
			}
			// 홈쇼핑모아HSMOA Script
			if (typeof window.buzzni_rt != "undefined") {
				window.buzzni_rt.sendList(_advtScriptData.account, site, custNo, custEmail, tempGoodsArr, from_hsmoa);
				// 검색 결과
				if (query != "") {
					window.buzzni_rt.sendQuery(_advtScriptData.account, site, custNo, custEmail, query, from_hsmoa);
				}
			}
		}
	};
	// 광고 스크립트 접속 장치 확인 22.07.19 lcs
	var _getAdvtDevice = function() {
		if (_isApp()) {
			if (_isIOS()) {
				_advtScriptData.site = "ios"; 
			} else {
				_advtScriptData.site = "android";
			}
		} else {
			if (_isPcWeb()) {
				_advtScriptData.site = "web";
			} else {
				_advtScriptData.site = "mweb";
			}
		}
		return _advtScriptData.site;
	};
	// 접속 매체 확인 mediaCode 22.07.19 lcs
	var _getFromHsmoa = function() {
		if (_advtScriptData.mediaCode == "MC04") {
			_advtScriptData.from_hsmoa = true;
		}
		return _advtScriptData.from_hsmoa;
	};
	// IE Object.asign...  22.08.02 lcs
	var _assign = function(trgt, appendObj) {
		var rtnObj = JSON.parse(JSON.stringify(trgt));
		for (var i in appendObj) {
			if (typeof rtnObj[i] == "undefined") {
				rtnObj[i] = "";
			}
			rtnObj[i] = appendObj[i];
		}
		return rtnObj;
	}
	
	/* ---------------------- FUNCTION AREA -E- -------------------------- */
	/* ------------------------ DATA AREA -S- -------------------------- */
	// FINAL_CONSTANTS
	var _constants = {
		 filterUrl : '/static/search/searchAPI.jsp'
		,goodsListUrl : '/goods-search/etcInfoSearchNew' // 상품 리스트 조회 URL
		,xCsrfToken : document.querySelector("meta[name='X-CSRF-TOKEN']").getAttribute("content")
		,searchInfo : 'VGOODSSEARCHINFO'
		,commentInfo : 'VGOODSCOMMENTINFO'
		,infiniteLoad : true
		,priceOverChck : false
		,order_media_str : ""
		,type : "WEB"
	};
	// initData 
	var _initData = {
		 oriQuery: '' // 
		,query : '' // 
		,moduleType : ''
		,usecate_yn: 'y' // 
		,exquery : '' // 
		,requery : '' // 
		,rt : '1' // 
		,collection : 'VGOODSSEARCHINFO'
		,filterquery: ''
		,category_code : '' // 상품 카테고리
		,brand_code : '' // 브랜드
		,entp_code : '' // 업체
		,startcount : 0 // 검색 시작 번호
		,pagesize : 20 // 페이지당 노출 상품수
		,limitCnt : null // 출력 제한 갯수
		,order_media_flag: '61' // PC WEB
	};
	// filter_HTMLElement
	var _filterTargetObj = {
		 area : {}
		,brndPopup: {}
		,result : {}
		,rcnt : {}
		,brndCat : {}
	};
	// 조회 데이터
	var _searchParam = {
		 query : ''
		,startcount: ''
		,moduleType: ''
		,limitCnt : null
		,pagesize: ''
		,sort: ''
		,exquery : ''
		,requery : ''
		,rt : ''
		,filterquery: ''
		,usecate_yn: ''
		,oriQuery: ''
		,category_code: ''
		,brand_code: ''
		,entp_code: ''
		,view_cate: ''
		,view_brand: ''
		,logyn: ''
		,order_media_flag: ''
	};
	// 검색 엔진 조회 결과
	var _filterData = {
		 TOTALCOUNT : 0 // 총 검색 데이터 cnt
		,CATEGORY_GROUP: '' // 카테고리
		,BRAND_GROUP: '' // 브랜드
		,MINPRICE: '0' // 검색결과의 상품 최소값
		,MAXPRICE: '0' // 검색결과의 상품 최대값
		,USECATE_YN: 'y' // 카테고리결과 출력유무
		,VIEW_CATE: '' // 상품검색용UI용 필드1
		,VIEW_BRNAD: '' // 상품검색용UI용 필드2
		,RESULT : [],
	};
	// initSearch 동기화 처리 변수
	var _initCheck = true;
	// 상품 코드 리스트
	var _goodsCdList = [];
	// 키워드Arr
	var _keywordStrArr = [];
	// exquery Obj 카테고리|브랜드|가격|혜택|기타(tv상품,품절제외)
	var _exquery = {
		 cat : {}
		,brnd : {}
		,price : {}
		,bnef : {}
		,etc : {}
	};
	// 브랜드 팝업 Obj
	var _brndPopupObj = {
		 data : []
		,query : ""
		,sort : ""
	};
	// MOB 필터 데이터 - 필터 클릭 후 미조회 필터 닫기 시 필터 원복용
	var _mobFilterData = {};
	// 광고 스크립트 데이터 22.07.19 lcs
	var _advtScriptData = {
		 account : "11"			// 홈쇼핑모아에서 발급한 고유 ID
		,site : ""					// iOS,Android,web,mobileWeb 
		,user_id : ""				// 고객 고유 ID
		,email : ""					// 옵션 
		,from_hsmoa : false	// 홈쇼핑모아인 경우 true
		,mediaCode : ""			// 접속매체
	};
	/* ------------------------ DATA AREA -E- -------------------------- */
	/* ----------------------- RTN_FN AREA -S- -------------------------- */
	var _getGoodsCd = function() {
		return _goodsCdList;
	};
	var _getCatsObjArr = function() {
		var rtnArr = [];
		if (_filterData && _filterData["CATEGORY_GROUP"] ) {
			rtnArr = _setGroupObjectArr(_filterData["CATEGORY_GROUP"], "CATEGORY_GROUP");
		}
		return rtnArr;
	};
	var _getBrndsObjArr = function() {
		var rtnArr = [];
		if (_filterData && _filterData["BRAND_GROUP"] ) {
			rtnArr = _setGroupObjectArr(_filterData["BRAND_GROUP"], "BRAND_CODE")
		}
		return rtnArr;
	};
	var _showResultArea = function() {
		if (_filterTargetObj.result.this != null) _filterTargetObj.result.this.style.display = "";
	};
	var _hideResultArea = function() {
		if (_filterTargetObj.result.this != null) _filterTargetObj.result.this.style.display = "none";
		if (_filterTargetObj.result.noData != null) _filterTargetObj.result.noData.style.display = "none";
	};
	var _resultAreaShowHide = function(showYn) {
		if (!showYn) {
			_filterTargetObj.result.dataArea.style.display = "none";
			_filterTargetObj.result.noData.style.display = "";
			_nextPageEvnet(true);
		}
	};
	/* ----------------------- RTN_FN AREA -E- -------------------------- */
	
	return {
		 init: _init
		,getGoodsCd : _getGoodsCd
		,getCatsObjArr : _getCatsObjArr
		,getBrndsObjArr : _getBrndsObjArr
		,filterReset : _filterReset
		,showResultArea : _showResultArea
		,hideResultArea : _hideResultArea
		,resultAreaShowHide : _resultAreaShowHide
	};
}());
