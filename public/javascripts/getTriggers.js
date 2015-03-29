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
    var scriptParam = document.getElementById('getTriggers');
    var containerId = scriptParam.getAttribute('containerId');
    //compile the template to source
    var source = $('#trigger-template').html();
    var template = Handlebars.compile(source);
    //build up the source with what we get back from the api
    var placeHolder = $('#'+containerId);
    $.get("/api/triggers", function(data){
        $.each(data, function(index, element){
            var html = template(element);
            placeHolder.append(html);
        });
    });
});
