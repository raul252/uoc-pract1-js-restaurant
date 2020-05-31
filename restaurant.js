'use strict';
$(document).ready(function () {
    if (jQuery) {
        $("#alerta").hide();
        restaurant.init();
        //Details page
        $(document).on('click', 'button.detail', function () {
            //Obtener el id de la fila del atributo data-attr
            let id = $(this).closest('tr').attr("data-attr");
            if (id > 0) {
                //Si es > 0 redirigir
                window.location = '/detail.html?id=' + id;
            }
            return false;
        });
        //Edit
        $(document).on('click', 'button.edit', function () {
            //Obtener el id de la fila del atributo data-attr
            let id = $(this).closest('tr').attr("data-attr");
            if (id > 0) {
                //Si es > 0 redirigir
                window.location = '/reserva.html?id=' + id;
            }
            return false;
        });
        //Remove
        $(document).on('click', 'button.delete', function () {
            //Obtener el id de la fila del atributo data-attr
            let id = $(this).closest('tr').attr("data-attr");
            if (id > 0) {
                //Process ajax delete row
                restaurant.delete($(this), id);
            }
            return false;
        });
        //Listado próximas reservas primera vez
        restaurant.checkNew();
        setInterval(function() {
            //Cada minuto comprobar
            restaurant.checkNew();
        },1000 * 60);
    } else {
        //Error loading JQUERY
        alert("No s'ha carregat Jquery correctament.");
    }
});

var restaurant = function(){
    return {
        init: function(){
            //Mostrar los datos de la tabla
            $("#loading").show();
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",             
                data: { 
                    method: 'getRows'
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
                    //Apend los datos de la tabla
                    $('#results tbody').append(row);
                    $("#loading").hide();
                },
                error: function(response) {
                    //Mostar el error
                    restaurant.error('Error al hacer la consulta.');
                }
            });
        },
        checkNew: function(){
            $("#reservas").hide();
            $.ajax({
                url: 'data.php',
                dataType: 'json',
                type: "GET",             
                data: { 
                    method: 'getNews'
                },
                success: function(response) {
                    if (response.new) {
                        //Si hay reserva mostrar el link
                        $("#reservas").show();
                    }
                },
                error: function(response) {
                    //Mostar el error
                    restaurant.error('Error al hacer la consulta.');
                }
            });
        },
        delete: function(context, id){
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
                        //Si ok en la eliminación en mysql, eliminar la row
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
            //Mostrar error
            $("#alerta").show();
            $("#errorResult").text(errorText);
            $("#loading").hide();
        },
        success: function(sucessText) {
            //Mostrar ok
            $("#success").show();
            $("#sucessResult").text(sucessText);
            $("#loading").hide();
        }
    }
}();