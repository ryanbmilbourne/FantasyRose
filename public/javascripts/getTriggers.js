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
    var source = $('#trigger-template').html();
    var template = Handlebars.compile(source);
    var placeHolder = $("#triggers");
    $.get("/api/triggers", function(data){
        $.each(data, function(index, element){
            var html = template(element);
            placeHolder.append(html);
        });
    });
});
