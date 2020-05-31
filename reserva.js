'use strict';
$(document).ready(function () {
    if (jQuery) {
        $("#alerta").hide();
        let parameter = location.search.substring(1).split("=");
        //Si llega un parámetro get con la reserva
        if (typeof parameter !== 'undefined' && typeof parameter[1] !== 'undefined' && parameter[1] > 0) {
            //Modificar reserva
            let id = parameter[1];
            $("#tipoReserva").text("Modificar reserva: #"+ id);
            restaurant.load(id);
        } else {
            //Mostrar nueva reserva
            $("#tipoReserva").text("Nueva reserva");
            //Populate comboboxes
            restaurant.populate();
        }
        $(document).on('click', 'button.save', function () {
            //Es podria separar si es insert o update segons el camp hidden o directament que ho faci php per reutilitzar codi
            restaurant.process();
            return false;
        });

        $(document).on('change', '#inputMes', function () {
            //Ajustar el último dia del mes y borrar del select los días no válidos
            restaurant.ajustDays();
            return false;
        });
    } else {
        //Error loading JQUERY
        alert("No s'ha carregat Jquery correctament.");
    }
});

var restaurant = function(){
    return {
        load: function(id){
            $("#loading").show();
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
                    //Populate los comboboxes
                    restaurant.populate();
                    $("#reservaId").val(response.id);
                    $("#inputName").val(response.nombre);
                    $("#inputSurname").val(response.apellidos);
                    $("#inputPhone").val(response.telefono);
                    //Obtener la fecha y separandola para rellenar los diferentes campos del formulario
                    let actualFecha = response.fecha;
                    if (actualFecha && actualFecha.length ==16) {
                        let fecha = new Date(response.fecha.substr(0,10).split('/').reverse().join('-')+' '+response.fecha.substr(11,5));
                        if (restaurant.isDataValid(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())) {
                            //La fecha es válida;
                            let day = fecha.getDate().toString().padStart(2, 0);
                            let mes = (fecha.getMonth() + 1).toString().padStart(2, 0);
                            let any = fecha.getFullYear().toString().padStart(4, 0);
                            let hour = fecha.getHours().toString().padStart(2, 0);
                            let minute = fecha.getMinutes().toString().padStart(2, 0);
                            $("#inputDia").val(day);
                            $("#inputMes").val(mes);
                            $("#inputYear").val(any);
                            $("#inputHour").val(hour);
                            $("#inputMinute").val(minute);
                            $("#inputComensales").val(response.comensales);
                            $("#inputComentarios").val(response.comentarios);
                            $("#loading").hide();
                        }
                    }
                },
                error: function(response) {
                    //Mostar el error
                    restaurant.error('Error al hacer la consulta.');
                }
            });
        },
        populate: function() {
            //Populate Dias
            $('#inputDia').val(null).trigger('change');
            let htmlDia = '';
            for (let index = 1; index <= 31; index++) {
                htmlDia += "<option value=" + index.toString().padStart(2, 0) + ">" +  index.toString().padStart(2, 0) + "</option>";  
            }
            $('#inputDia').append(htmlDia);
            //Populate Meses
            $('#inputMes').val(null).trigger('change');
            let htmlMes = '';
            for (let index = 1; index <= 12; index++) {
                htmlMes += "<option value=" + index.toString().padStart(2, 0) + ">" +  index.toString().padStart(2, 0) + "</option>";  
            }
            $('#inputMes').append(htmlMes);
            //Populate Years
            $('#inputYear').val(null).trigger('change');
            let htmlYear = '';
            for (let index = 1999; index <= 2999; index++) {
                htmlYear += "<option value=" + index.toString().padStart(4, 0)  + ">" + index.toString().padStart(4, 0) + "</option>";  
            }
            $('#inputYear').append(htmlYear);
            //Populate Hours
            $('#inputHour').val(null).trigger('change');
            let htmlHour = '';
            for (let index = 0; index <= 24; index++) {
                htmlHour += "<option value=" + index.toString().padStart(2, 0) + ">" + index.toString().padStart(2, 0) + "</option>";  
            }
            $('#inputHour').append(htmlHour);

             //Populate Minutes
             $('#inputMinute').val(null).trigger('change');
             let htmlMinute = '';
             for (let index = 0; index <= 59; index++) {
                htmlMinute += "<option value=" + index.toString().padStart(2, 0) + ">" + index.toString().padStart(2, 0) + "</option>";  
             }
             $('#inputMinute').append(htmlMinute);

             //Update Date y presentandola en los campos
             let fecha = new Date();
             let day = fecha.getDate().toString().padStart(2, 0);
             let mes = (fecha.getMonth() + 1).toString().padStart(2, 0);
             let any = fecha.getFullYear().toString().padStart(4, 0);
             let hour = fecha.getHours().toString().padStart(2, 0);
             let minute = fecha.getMinutes().toString().padStart(2, 0);
             $("#inputDia").val(day);
             $("#inputMes").val(mes);
             $("#inputYear").val(any);
             $("#inputHour").val(hour);
             $("#inputMinute").val(minute);
        },
        ajustDays: function() {
            //Obtener el último dia del mes y borrarlo del select si el dia para el mes no es correcto
            let mes = $("#inputMes").val();
            let any = $("#inputYear").val();
            if (mes > 0 && any > 0) {
                let lastDayMes = new Date(any, mes, 0).getDate()+1;
                for (let index = lastDayMes; index <= 31; index++) {
                    $('#inputDia option[value="'+index.toString().padStart(2, 0)+'"]').remove();
                }
            }
        },
        process: function() {
            let error = false;
            $("#alerta").hide();
            $("#loading").show();
            $("#inputComensales").removeClass("error");
            $("#inputDia").removeClass("error");
            let comensales = $("#inputComensales").val();
            let dia = $("#inputDia").val();
            let mes = $("#inputMes").val();
            let any = $("#inputYear").val();
            let hour = $("#inputHour").val();
            let minute = $("#inputMinute").val();
            //Validate form without jquery-validate
            if (!restaurant.isNumber(comensales) || comensales > 10 || comensales < 1) {
                $("#inputComensales").addClass("error");
                restaurant.error('El número de comensales debe ser de 1 a 10.');
                return false;
            }
            //Validate date
            let id = $("#reservaId").val();
            if (!(id > 0)) {
                let fecha = new Date();
                let newDate = new Date(any, mes-1, dia, hour, minute);
                if (restaurant.isDataValid(any, mes, dia)) {
                    let diff = new Date(newDate - fecha);
                    let days = diff/1000/60/60/24;
                    //Ojo! Valido sólo la inserción no la edición, ya que es posible que se hayan equivocado y quieran corregir
                    if (days > 1) {
                    //Correcto
                    } else {
                        $("#inputDia").addClass("error");
                        restaurant.error('La nueva reserva ha de ser al menos 24h más que la fecha actual.');
                        error = true;
                        return false;
                    }
                }
            }
            if (!error) {
                //Si no hay errores, petición ajax con un POST, serializando el form. También se podría crear una array con los campos y se pasa como data
                $.ajax({
                    url: 'data.php',
                    dataType: 'json',
                    type: "POST",             
                    data: { 
                        method: 'processForm',
                        data: $("form").serialize()
                    },
                    success: function(response) {
                        $("#back").show();
                        if (response.ok) {
                            //Process successfully
                            restaurant.success(response.message);
                            $("#inputName").focus();
                            if (id > 0) {
                                restaurant.load(id);
                            }
                        } else {
                            restaurant.error('Error: '+response.message);
                        }
                        $("#loading").hide();
                    },
                    error: function(response) {
                        //Mostar el error
                        restaurant.error('Error al hacer la consulta.');
                    }
                });
            }
        },
        isDataValid: function(any, mes, dia) {
            //La fecha es válida en js
            let newDate= new Date(any, (mes-1), dia);
            return ((newDate.getFullYear().toString().padStart(4, 0) == any) 
            && ((newDate.getMonth()+1).toString().padStart(2, 0) == mes) 
            && (newDate.getDate().toString().padStart(2, 0) == dia));
        },
        error: function(errorText) {
            $("#alerta").show();
            $("#errorResult").text(errorText);
            $("#loading").hide();
        },
        success: function(successText) {
            $("#success").show();
            $("#sucessResult").text(successText);
            $("#loading").hide();
        },
        isNumber: function(num) {
            //Es un integer
            return !isNaN(parseFloat(num)) && isFinite(num) && (num == parseInt(num, 10));
        }
    }
}();