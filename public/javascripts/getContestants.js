/*global Handlebars, document, $ */
$.ajax({
    beforeSend: function(){
      $('#loading-indicator').show();
    },
    complete: function(){
      $('#loading-indicator').hide();
    }
});

$(document).ready(function(){
    var source = $('#contestant-template').html();
    var template = Handlebars.compile(source);
    var placeHolder = $("#contestants");
    $.get("/api/contestants", function(data){
        $.each(data, function(index, element){
            var html = template(element.value);
            placeHolder.append(html);
        });
    });
});
