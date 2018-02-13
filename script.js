function onWindowLoad() {
    $comment_size = 0;
    $('body').append('<style>.wordmeter {float: left;margin-left: 20px;background: #e4e4e4;outline: 1px solid #000;padding: 0px 5px;margin-top: 6px;}</style>');

    commentTimer = setInterval(function(){
        $temp_comment_size = $('.u_cbox_comment').length;
        if($temp_comment_size > $comment_size){
            chk_wordmeter($comment_size,$temp_comment_size);
            $comment_size = $temp_comment_size;
        }

        if($temp_comment_size === 0){
            console.log('timer finish');
            clearInterval(commentTimer);
        }
    },2000);
}

function chk_wordmeter($idx,$comment_size){
    $uidArray = new Array;

    for($i=$idx;$i<$comment_size;$i++){
        $className = $('.u_cbox_comment').eq($i).attr('class');
        $uid = $className.split('_user_id_no_');
        if($uid[1] !== "null"){
            $uidArray.unshift($uid[1]);
        }
    }
 
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
                console.log($i);
                $commentResult = $resultData['result_data'][$i]['data']['comments'];
                $commentCount = $commentResult['total'];
                $commentCategory_100 = $commentResult['category_100'];
                $commentCategory_101 = $commentResult['category_101'];
                $commentCategory_102 = $commentResult['category_102'];
                $commentCategory_103 = $commentResult['category_103'];
                $commentCategory_104 = $commentResult['category_104'];
                $commentCategory_105 = $commentResult['category_105'];

                $('._user_id_no_'+$resultData['result_data'][$i]['user_id']+' .u_cbox_info').append('<div class="wordmeter">WordMeter : 작성 댓글 ['+$commentCount+']</div>');
            }
        },
    });


    console.log($uidArray);
}

window.onload = onWindowLoad;


