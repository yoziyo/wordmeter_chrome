function onWindowLoad() {
    $comment_size = 0;

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

    console.log($uidArray);
}

window.onload = onWindowLoad;


