$('.submit button').click(function(){
    token_test();
});
function token_test(){
    localStorage.setItem("token","1234");
}