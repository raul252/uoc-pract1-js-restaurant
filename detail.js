'use strict';
$(document).ready(function () {
    if (jQuery) {
        $("#alerta").hide();
        let parameter = location.search.substring(1).split("=");
        //Si llega un GET con el parámetro id se obtienen los datos. Se podría convertir el hmtl a php y usar la función $_GET['id']
        if (typeof parameter !== 'undefined' && typeof parameter[1] !== 'undefined' && parameter[1] > 0) {
            let id = parameter[1];
            restaurant.load(id);
        }
    } else {
        //Error loading JQUERY
        alert("No s'ha carregat Jquery correctament.");
    }
});

var restaurant = function(){
    return {
        load: function(id){
            $("#loading").show();
            //Get ajax para obtener los datos pasando en data el id de la row a buscar
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",             
                data: { 
                    method: 'getRow',
                    id: id
                },
                success: function(response) {
                    //Process response ok
                    $("#id").text(response.id);
                    $("#inputName").val(response.nombre);
                    $("#inputSurname").val(response.apellidos);
                    $("#inputPhone").val(response.telefono);
                    $("#inputDate").val(response.fecha);
                    $("#inputComensales").val(response.comensales);
                    $("#inputComentarios").val(response.comentarios);
                    $("#loading").hide();
                },
                error: function(response) {
                    //Mostar el error
                    restaurant.error('Error al hacer la consulta.');
                }
            });
        },
        error: function(errorText) {
            $("#alerta").show();
            $("#errorResult").text(errorText);
            $("#loading").hide();
        }
    }
}();