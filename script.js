function onWindowLoad() {
    // 필요 스타일 정리
    $('body').append('<style>'+
    '.wordmeter {float: left;margin-left: 20px;background: #e4e4e4;outline: 1px solid #005fec;padding: 0px 5px;margin-top: 6px;}'+
    '.wordmeter_vote {float: right;background: #e4e4e4;outline: 1px solid #005fec;padding: 0px 5px;}' +
    '.wordmeter_tooltip {background: #fff;color: #333;padding: 10px;position:absolute;outline:1px solid #005fec;z-index:50000;display:none;}'+
    '.bold {font-weight:bold}'+
    '</style>');

    // 혹시 출력된 데이터가 있으면 삭제해줍니다 (뒤로가기 했을경우 대비)
    $('.wordmeter').remove();

    // 출력된 코멘트 갯수 확인
    $comment_size = 0;

    // 초기 상태 uid 추출후 api호출
    refresh_wordmeter();

    // 더보기 버튼 이벤트
    $(document).on("click",".u_cbox_btn_more",function(event){
        refresh_wordmeter();
    });

    // 댓글 재정렬 관련이벤트 (코멘트 시작 인덱스를 0으로 재조정)
    $(document).on("click",".u_cbox_sort_option_list a,.u_cbox_btn_refresh,.u_cbox_option_list a",function(event){
        $comment_size = 0;
        refresh_wordmeter();
    });

    /////////////////////
    // 코멘트는 동적이라 이벤트 리스너로 툴팁관련 마우스 오버, 아웃 이벤트 등록
    // 보류 상태
    // 툴팁용 데이터 삽입
    $('<div class="wordmeter_tooltip">툴팁 테스트 입니다.</div>').appendTo('body');

    $(document).on("mouseover",".u_cbox_nick",function(event){  
        $('.wordmeter_tooltip').css({ left: event.pageX + 15, top: event.pageY });
        // show_tooltip();
    });

    $(document).on("mouseout",".u_cbox_nick",function(event){  
        // hide_tooltip();
    });
}

function chk_wordmeter($idx,$comment_size){
    $uidArray = new Array;

    // 코멘트에서 user_id_no 뒤에 id 값을 가져옴
    for($i=$idx;$i<$comment_size;$i++){
        $className = $('.u_cbox_comment').eq($i).attr('class');
        $uid = $className.split('_user_id_no_');
        if($uid[1] !== "null"){
            // 삭제된 댓글이 아니라면 배열에 uid 추가
            $uidArray.unshift($uid[1]);
        }
    }
 
    // 워드미터 api로 가져온 데이터 보냄
    $.ajax({
        type : 'post',
        url : 'http://wordmeter.net/api/v1/users/status',
        data : JSON.stringify($uidArray),
        dataType: 'json',
        contentType: 'application/json',
        error: function(xhr, status, error){
            console.log('wordmeter error : '+xhr);
            console.log(xhr);
        },
        success : function(json){
            $resultData = json; 
            if($resultData['result_code'] != '0'){
                return false;
            }

            console.log($resultData['result_data']);

            for($i=0;$i < $resultData['result_data'].length-1;$i++){
                $userid = $resultData['result_data'][$i]['user_id'];    // user_id

                // comment 관련
                $commentResult = $resultData['result_data'][$i]['data']['comments'];
                $commentCount = $commentResult['total'];                // 댓글 전체갯수
                $commentCategory_100 = $commentResult['category_100'];  // 정치 카테고리
                $commentCategory_101 = $commentResult['category_101'];  // 경제 카테고리
                $commentCategory_102 = $commentResult['category_102'];  // 사회 카테고리
                $commentCategory_103 = $commentResult['category_103'];  // 생활문화 카테고리
                $commentCategory_104 = $commentResult['category_104'];  // 세계 카테고리
                $commentCategory_105 = $commentResult['category_105'];  // IT 카테고리

                // 워드미터 사용자 입력 데이터
                $countsResult = $resultData['result_data'][$i]['data']['counts'];
                $memosCount = $countsResult['memos'];           // 메모 갯수
                $up_vote_count = !$countsResult['up_vote']?0:$countsResult['up_vote'];      // 추천 갯수
                $down_vote_count = !$countsResult['down_vote']?0:$countsResult['down_vote'];  // 비추천 갯수

                //랭크 데이터
                $rank = $resultData['result_data'][$i]['data']['rank'];

                //연결 주소 데이터
                $link = $resultData['result_data'][$i]['data']['url'];

                // 출력 텍스트 설정
                if($rank){
                    $showRank = $rank>=10?"<span class='bold'>"+$rank+"</span>":$rank;
                    $showText = "랭킹 "+$showRank+"위, ";
                }else{
                    $showText = "";
                }

                $showCommentCount = $commentCount>=10?"<span class='bold'>"+$commentCount+"</span>":$commentCount;
                $showText += $showCommentCount+"개의 댓글";

                if($memosCount){
                    $showMemosCount = $memosCount>=10?"<span class='bold'>"+$memosCount+"</span>":$memosCount;
                    $showText += ", "+$memosCount+"개의 메모";
                }

                $showUpVote = $up_vote_count>=10?"<span class='bold'>"+$up_vote_count+"</span>":$up_vote_count;
                $showDownVote = $down_vote_count>=10?"<span class='bold'>"+$down_vote_count+"</span>":$down_vote_count;

                // 데이터 출력
                $('._user_id_no_'+$resultData['result_data'][$i]['user_id']+' > .u_cbox_comment_box .u_cbox_info').append('<div class="wordmeter"><a href="'+$link+'" target="_sub">WordMeter : '+$showText+'</a></div>');
                $('._user_id_no_'+$resultData['result_data'][$i]['user_id']+' > .u_cbox_comment_box .u_cbox_info').append('<div class="wordmeter_vote"><a href="'+$link+'" target="_sub">추천 '+$showUpVote+', 비추천 '+$showDownVote+'</a></div>');
            }
        },
    });


    console.log($uidArray);
}

// 현재상태에서 워드메터 데이터 접근
function refresh_wordmeter(){
    refreshTimer = setInterval(function(){
        if($('#cbox_module').hasClass('u_cbox')){
            // 전체 코멘트 갯수를 임시 변수에 가져옴 
            $temp_comment_size = $('.u_cbox_comment').length;
            if($temp_comment_size > $comment_size){
                // 가져온 갯수가 현재 전체 코멘트 갯수보다 많으면
                // 워드미터 데이터 가져옴
                chk_wordmeter($comment_size,$temp_comment_size);
                $comment_size = $temp_comment_size;

                console.log('refresh finish');
                clearInterval(refreshTimer);
            }
        }
    },1000);
}

function show_tooltip() {
    $tooltip = $('.wordmeter_tooltip');

    $tooltip.stop(); //이미 애니메이션 중인 경우, 중지
    $tooltip.css('opacity', 0).show(); //투명한 상태로 표시
    $tooltip.animate({opacity: 1}, 200); //0.2초 후에 투명도를 1로
}

function hide_tooltip() {
    $tooltip = $('.wordmeter_tooltip');

    $tooltip.stop(); //이미 애니메이션 중인 경우, 중지 
    $tooltip.animate (
        { opacity: 0}, 200, //0.2초 후에 투명하게 
        function() {$tooltip.hide();} //끝나면 숨김
    )
}

window.onload = onWindowLoad;


