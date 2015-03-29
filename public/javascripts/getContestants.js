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
    //get the destination element from the script tag
    var scriptParam = document.getElementById('getContestants');
    var containerId = scriptParam.getAttribute('containerId');
    //compile the template to source
    var source = $('#contestant-template').html();
    var template = Handlebars.compile(source);
    var placeHolder = $('#'+containerId);
    $.get("/api/contestants", function(data){
        $.each(data, function(index, element){
            var html = template(element.value);
            placeHolder.append(html);
        });
    });
});
