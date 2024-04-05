$(document).on('submit', '#message', function(e){
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "",
        data: {
            message: $('#msg').val(),
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
        }
    });
    $( ".parent" ).load(window.location.href + " .parent" );
})

$(document).ready(function(){
    setInterval(function(){
        $( ".message" ).load(window.location.href + " .message" );
    }, 1000)
})