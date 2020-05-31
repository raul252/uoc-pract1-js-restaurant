'use strict';
$(document).ready(function () {
    if (jQuery) {
        $("#alerta").hide();
        restaurant.init();
        //Details page
        $(document).on('click', 'button.detail', function () {
            let id = $(this).closest('tr').attr("data-attr");
            if (id > 0) {
                window.location = '/detail.html?id=' + id;
            }
            return false;
        });
         //Edit
         $(document).on('click', 'button.edit', function () {
            let id = $(this).closest('tr').attr("data-attr");
            if (id > 0) {
                window.location = '/reserva.html?id=' + id;
            }
            return false;
        });
        //Remove
        $(document).on('click', 'button.delete', function () {
            let id = $(this).closest('tr').attr("data-attr");
            if (id > 0) {
                //Process ajax delete row
                restaurant.delete($(this), id);
            }
            return false;
        });
    } else {
        //Error loading JQUERY
        alert("No s'ha carregat Jquery correctament.");
    }
});

var restaurant = function(){
    return {
        //Get ajax para obtener las rows en próximas 24h. La consulta de sql ya filtrará los datos
        init: function(){
            $("#loading").show();
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",             
                data: { 
                    method: 'getNewRows'
                },
                success: function(response) {
                    //Process response
                    let row = '';
                    $.each(response, function (clave, valor) {
                        // Generar cada fila de la tabla. El id se guarda en el atributo data-attr
                        let data = valor;
                        row += "<tr data-attr='"+data.id+"'><td>"+data.nombre+"</td>";
                        row += "<td>"+data.apellidos+"</td>";
                        row += "<td>"+data.fecha+"</td>";
                        row += "<td>"+data.comensales+"</td>";
                        row += "<td><button type='button' class='btn btn-secondary detail mr-1'>Detalle</button>";
                        row += "<button type='button' class='btn btn-info edit mr-1'>Modificar</button>";
                        row += "<button type='button' class='btn btn-danger delete mr-1'>Eliminar</button></td>";
                        row += "</tr>";
                    });
                    $('#results tbody').append(row);
                    $("#loading").hide();
                },
                error: function(response) {
                    //Mostar el error
                    restaurant.error('Error al hacer la consulta.');
                }
            });
        },
        delete: function(context, id){
            //Delete row con un post, pasando el id de la row a delete
            $("#loading").show();
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "POST",             
                data: { 
                    method: 'deleteRow',
                    id: id
                },
                success: function(response) {
                    if (response.ok) {
                        //Borro la tr de la tabla con Jquery. También podría hacer un refresh.
                        context.closest('tr').remove();
                        restaurant.success('Datos borrados correctamente.');
                    } else {
                        $("#loading").hide();
                    }
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
        },
        success: function(sucessText) {
            $("#success").show();
            $("#sucessResult").text(sucessText);
            $("#loading").hide();
        }
    }
}();