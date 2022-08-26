$(document).ready(function(){
});

(function($eshopfront,$) {
    $eshopfront.file = {
      fileMaxCnt: 1, // 파일 업로드 최대 개수
      fileSize: 1024 * 1024, // 파일 1MB 사이즈
      mbSize: 1, // MB 파일 사이즈
      accept: ".jpg,.jpeg,.png", // 선택 가능 파일들
      docExt: [".ppt",".pptx",".doc",".docx",".hwp",".pdf",".xls",".xlsx"], // 문서 확장자들
      /**
       * 파일 확장자 초기화
       * @param {object} param 
       */
      init(param) {
        this.fileMaxCnt = param.fileMaxCnt || 1;
        this.mbSize = param.fileSize || 1;
        this.fileSize *= param.fileSize || 1;
        this.accept = param.accept || ".jpg,.jpeg,.png";
        $("ul.file-list").html("");
        $("ul.file-list").append(this.appendEl());
      },
      /**
       * 파일 추가
       * @param {element}} target 
       */
      addFile(target) {
        var key = location.pathname + location.search;
        if(this.uploadFileExtChk(target)) {
          if(this.isDocfile(target.files[0])) {
            this.setDocument(target);
          } else {
            this.setThumbnail(target);
          }
          if($(target).closest("ul.file-list").children().length < this.fileMaxCnt) {
            $(target).closest("ul.file-list").append(this.appendEl());
          }
        }
      },
      /**
       * 파일 삭제
       * @param {element} target 
       */
      delFile(target) {
        $(target).closest('li').remove();
        if($("ul.file-list li").last().children().hasClass("attach")){
          $("ul.file-list").append(this.appendEl());
        }
      },
      /**
       * 이미지 썸네일 추가
       * @param {element} target 
       * @returns 
       */
      setThumbnail(target) {
        var files = target.files[0];
        var reader = new FileReader();
        var fileSize = this.formatBytes(files.size);
        reader.onload = function(event) {
          var imgSrc = event.target.result;
          $(target).parent().find('.attach-img').css("background-image", "url('" + imgSrc + "')");
          $(target).parent().find('.attach-txt').text(files.name);
          $(target).parent().find('.attach-volume').text(fileSize);
          $(target).parent().parent().addClass('attach');
        }
        reader.readAsDataURL(files);
      },
      /**
       * 문서 파일 추가
       * @param {*} target 
       */
      setDocument(target) {
        var file = target.files[0];
        var fileSize = this.formatBytes(file.size);
        var fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        var imgSrc = this.getDocImgPath(fileExt);
        $(target).parent().find('.attach-img').css("background-image", "url('" + imgSrc + "')");
        $(target).parent().find('.attach-txt').text(file.name);
        $(target).parent().find('.attach-volume').text(fileSize);
        $(target).parent().parent().addClass('attach');
      },
      /**
       * 문서 파일 여부 체크
       * @param {File} file 
       * @returns 
       */
      isDocfile(file) {
        var isDoc = false;
        var fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        for(var i = 0; i < this.docExt.length; i++) {
          if(fileExt == this.docExt[i]) {
            isDoc = true;
            break;
          }
        }
        return isDoc;
      },
      /**
       * 파일 확장자 체크
       * @param {element} target 
       * @returns 
       */
      uploadFileExtChk(target) {
        var msg = "지정된 확장자 외 파일은 업로드가 불가능합니다.";
        if(target.type === "file") {
          var files = target.files[0];
          if(files != null && files.length > 0) {
            var imgSize = files[i];
            if(imgSize > this.fileSize) {
              alert("이미지 용량이 너무 큽니다. " + this.mbSize + "MB 이하로 등록해주세요.");
              return false;
            }
          }
          var files = target.files;
          if(files.length > 0) {
            for(var i = 0; i < files.length; i++) {
              var fileName = files[i].name.toLowerCase();
              var fileExtIndex = fileName.lastIndexOf(".");
              var fileExt = fileName.substr(fileExtIndex);
              if(target.accept.indexOf(fileExt) < 0) {
                alert(msg);
                target.value = "";
                return false;
              }
            }
          } else {
            alert(msg);
            return false;
          }
          return true;
        }
        return false;
      },
      /**
       * 파일 업로드 실행
       * @param {string} target 
       * @param {function} success 
       * @param {function} error 
       * @param {function} complete 
       */
      uploadFile(target, success, error, complete) {
        var formData = new FormData();
        formData.append("target", target);
        $.each($("ul.file-list li").find("input[type='file']"), function(index, elTarget) {
          formData.append('files', $(elTarget)[0].files[0]);
        });
        $.ajax({
          url : "/common/util/fileUploadPoc",
          data:formData,
          async: false,
          type:'POST',
          headers: {
            'X-CSRF-TOKEN': $('meta[name="X-CSRF-TOKEN"]').attr('content')
          },
          enctype:'multipart/form-data',
          processData:false,
          contentType:false,
          dataType:'json',
          cache:false,
          success : function(data) {
            if(typeof success == 'function') {
              success(data);
            }
          },
          error: function(err) {
            if(typeof error == 'function') {
              error(err);
            }
          },
          complete: function() {
            if(typeof complete == 'function') {
              complete();
            }
          }
        });
      },
      /**
       * file size -> byte로 변환
       * @param {number} bytes 
       * @param {float} decimals
       * @returns 
       */
      formatBytes(bytes, decimals = 2){ // byte 변환
        if(bytes === 0){
          return "0 Bytes";
        }
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
      },
      /**
       * 파일 업로드 요소 추가
       * @returns 
       */
      appendEl() {
        var timestamp = new Date().getTime();
        var elment ='<li>' +
        '  <div class="file-item">' +
        '    <span class="btn-box">' +
        '      <input type="file" id="file_'+ timestamp +'" accept="' + this.accept + '" onchange="$.eshopfront.file.addFile(this)">' +
        '      <label for="file_'+ timestamp +'">' +
        '        <span class="hidden">첨부파일 추가</span>' +
        '      </label>' +
        '      <span class="attach-box">' +
        '        <span class="attach-img"></span>' +
        '        <span class="attach-info">' +
        '          <span class="attach-txt">이미지.jpg</span>' +
        '          <span class="attach-volume">0MB</span>' +
        '        </span>' +
        '        <button type="button" class="btn-close bet" onclick="$.eshopfront.file.delFile(this)">' +
        '          <span class="hidden">첨부파일 삭제</span>' +
        '        </button>' +
        '      </span>' +
        '    </span>' +
        '  </div>' +
        '</li>'
        return elment;
      },
      /**
       * 문서 파일 확장자에 따른 이미지 경로 맵핑
       * @param {String} fileExt 
       * @returns 
       */
      getDocImgPath(fileExt) {
        var imgPath = "/moassets/images/_temp/";
        if(fileExt === ".xls" || fileExt === ".xlsx") {
          imgPath += "img_file_xls.png";
        } else if(fileExt === ".ppt" || fileExt === ".pptx") {
          imgPath += "img_file_ppt.png";
        } else if(fileExt === ".doc" || fileExt === ".docx") {
          imgPath += "img_file_word.png";
        } else if(fileExt === ".hwp") {
          imgPath += "img_file_hwp.png";
        } else if(fileExt === ".pdf") {
          imgPath += "img_file_pdf.png";
        }
        return imgPath;
      }
    };
})($.eshopfront,jQuery);

