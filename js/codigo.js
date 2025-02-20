/* llamado de funciones al abrir la app */

eventos();
ocultarPaginas();
document.getElementById("cerrarSesion").style.display = "none";

/* variables globales */
let TOKEN;
let IDUSUARIO;
let TiempoTotal = 0;
let TiempoTotalPorDia = 0;

/* agregar eventos a los botones */
function eventos() {
    document.querySelector("#ruteo").addEventListener("ionRouteWillChange", navegar);
    document.querySelector("#btnLogin").addEventListener("click", preLogin);
    document.querySelector("#btnRegistro").addEventListener("click", preRegistro);
    /* andan mal */
    document.getElementById("btnAgregar").addEventListener("click", agregarActividad);
    document.getElementById("btnFiltrar").addEventListener("click", filtrarPorFecha);
}

/* navegar entre las páginas de la app */
function navegar(event) {
    console.log(event);
    ocultarPaginas();
    let paginaDestino = event.detail.to;

    if (localStorage.getItem("TOKEN")) {
        console.log(localStorage.getItem("TOKEN"));
        document.getElementById("itemRegistro").style.display = "none";
        document.getElementById("cerrarSesion").style.display = "block";
        obtenerData();
    }

    if (paginaDestino == "/") {
        ocultarPaginas();
        document.querySelector("#main-content").style.display = "block";
    }
    else if (paginaDestino == "/login") {
        ocultarPaginas();
        document.querySelector("#login").style.display = "block";
    }
    else if (paginaDestino == "/registro") {
        ocultarPaginas();
        mostrarPaises();
        document.querySelector("#registro").style.display = "block";
    }
    else if (paginaDestino == "/home") {
        ocultarPaginas();
        document.querySelector("#home").style.display = "block";
    } else if (paginaDestino == "/agregarRegistro") {
        ocultarPaginas();
        obtenerActividad();
        mostrarActividadesRegistro();
        document.querySelector("#agregarRegistro").style.display = "block";
    } else if (paginaDestino == "/registroAct") {
        ocultarPaginas();
        document.querySelector("#registroAct").style.display = "block";
    }

}

function ocultarPaginas() {
    let paginas = document.querySelectorAll(".ion-page");
    for (let i = 1; i < paginas.length; i++) {
        paginas[i].style.display = "none";
    }
}


function cerrarMenu() {
    document.querySelector("#menu").close();
}

function cerrarSesion() {
    cerrarMenu()
    localStorage.removeItem("TOKEN")
    localStorage.removeItem("IDUSUARIO")
    document.querySelector("ion-router").push("/login")
    document.getElementById("cerrarSesion").style.display = "none";
    document.getElementById("itemRegistro").style.display = "block";
    let parrafodata = document.getElementById("datos")

    parrafodata.innerHTML = ``

}

function preLogin() {
    //obtengo los datos
    let usuario = document.getElementById("txtUsuario").value;
    let password = document.getElementById("txtPassword").value;

    login(usuario, password)
}

function login(usuario, password) {

    let txtMensajeError = document.getElementById("txtMensajeError");
    try {

        if (usuario.trim() == "") throw new Error("Usuario necesario para iniciar")
        if (password.trim() == "") throw new Error("Contrasenia necesario para iniciar")

        const nuevoUsuario = {
            usuario: usuario,
            password: password
        }
        const url = "https://movetrack.develotion.com/login.php"

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        })
            .then(res => res.json())
            .then(data => {
                TOKEN = data.apiKey
                IDUSUARIO = data.id
                if (data.mensaje) {
                    return txtMensajeError.innerHTML = `${data.mensaje}`
                } else {
                    localStorage.setItem("TOKEN", TOKEN)
                    localStorage.setItem("IDUSUARIO", IDUSUARIO)
                    document.querySelector("ion-router").push("/home");
                }

            })

    } catch (err) {
        txtMensajeError.innerHTML = `${err.message.toUpperCase()}`
    }
}


function preRegistro() {
    let usuario = document.getElementById("txtUsuarioRegistro").value;
    let password = document.getElementById("txtPasswordRegistro").value;
    let pais = Number(document.getElementById('selectPais').value);

    if (usuario.trim() == "") throw new Error("Usuario necesario para iniciar")

    validarDatos(usuario, password, pais)

    let nuevoRegistro = {
        usuario: usuario,
        password: password,
        idPais: pais
    }
    Registro(nuevoRegistro);
}

function Registro(registro) {

    try {
        console.log(registro)
        const url = "https://movetrack.develotion.com/usuarios.php"

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registro)
        })
            .then(function (response) {

                return response.json();

            })
            .then(function (data) {
                console.log(data)
                if (data != null) {
                    login(registro.usuario, registro.password);
                } else {
                    mensajeErrorR.innerHTML = `${data.error}`;
                }

            })


    } catch (error) {
        let mensajeErrorR = document.getElementById("txtMensajeErrorRegistro");
        mensajeErrorR.innerHTML = `${error.message}`;
    }


}

function validarDatos(usuario, password, pais) {
    if (!usuario.trim() || !password.trim() || pais === null) {
        throw new Error("Todos los campos son necesarios");
    }
}

function mostrarPaises() {
    const url = "https://movetrack.develotion.com/paises.php";
    console.log(url)
    let select = document.getElementById("selectPais");
    try {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data.paises);
                let option = "";
                if (data.paises && data.paises.length > 0) {
                    data.paises.forEach(pais => {

                        option += `<ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`


                    });

                    select.innerHTML += option;
                } else {
                    console.error("No se encontraron países.");
                }
            })
            .catch(function (error) {
                console.error("Error al obtener los países:", error);
            });
    } catch (error) {
        console.error("Error al mostrar los países:", error);
    }
}

async function  Session() {
    console.log("TOKEN:", TOKEN)
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")

    let url = `https://movetrack.develotion.com/registros.php?idUsuario=${+IDUSUARIO}`
    let data = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            apikey: TOKEN,
            iduser: +IDUSUARIO,
        },
        params: {
            idUsuario: +IDUSUARIO
        }
    })
    let info = data.json()
    
    return info


}

function mostrarActividadesRegistro(){
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")
    const url = "https://movetrack.develotion.com/actividades.php";
    let select = document.getElementById("selectActividad");
    try {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                apikey: TOKEN,
                iduser: +IDUSUARIO,
            }
        })
      
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
          
                if (data.actividades && data.actividades.length > 0) {
                    data.actividades.forEach(async act => {

                        let info = await obtenerActividad(act.id);
                        select.innerHTML += `<ion-select-option value="${info.id}">${info.nombre}</ion-select-option>`;


                    });

                    
                } else {
                    console.error("No se encontraron países.");
                }
            })
            .catch(function (error) {
                console.error("Error al obtener los países:", error);
            });
    } catch (error) {
        console.error("Error al mostrar los países:", error);
    }
}
async function obtenerData() {

    let data = await Session();

    obtenerTiempoTotal(data);

    obtenerTiempoPorDia(data);

    mostrarDatosRegistro(data);

    filtrarPorFecha(data);
}

function mostrarDatosRegistro(data) {

    let parrafodata = document.getElementById("datos")
    parrafodata.innerHTML = ``
    console.log(data)
    data.registros.forEach(async (element) => {
        
        let info = await obtenerActividad(element.idActividad)
        
        parrafodata.innerHTML += `<div style="border-top:1px solid black; border-bottom:1px solid black">id: ${element.id} <br> nombreActividad: ${info.nombre}<br> idUsuario: ${element.idUsuario}<br> tiempo: ${element.tiempo}<br> fecha:${element.fecha} <br> <img src="https://movetrack.develotion.com/imgs/${info.imagen}.png" width="50px" height:"50px" ></img><br><ion-button size="small" color="danger" onclick="eliminarRegistro(${element.id})">eliminar</ ion-button> </div>`

    })
}


function obtenerTiempoPorDia(data) {

    data.registros.filter((element) => {

        return element.fecha === new Date().toLocaleDateString('en-CA')

    }).forEach((element) => {

        TiempoTotalPorDia += +element.tiempo;

    })

    document.getElementById("mostrarTiempoPorDia").innerHTML = `El tiempo total por día es: ${TiempoTotalPorDia}`;
}

function obtenerTiempoTotal(data) {

    data.registros.forEach((element) => {

        if (element.tiempo) {

            TiempoTotal += +element.tiempo;

        }

    })

    document.getElementById("mostrarTiempoTotal").innerHTML = `El tiempo total es: ${TiempoTotal}`;
}

async function obtenerActividad(idActividad) {
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")
    let url = "https://movetrack.develotion.com/actividades.php"
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                apikey: TOKEN,
                iduser: +IDUSUARIO,
            }
        });

        const data = await res.json();
        console.log(idActividad)

        const act = data.actividades.filter(actividad => actividad.id == idActividad);

        console.log(act);

        return act ? act[0] : "Actividad no encontrada";

    } catch (error) {
        console.error("Error obteniendo actividad:", error);
        return "Error al obtener actividad";
    }
}


function agregarActividad() {

    try {
        let idActividad = document.getElementById("selectActividad").value
        let minutosTiempo = document.getElementById("minutosTiempo").value
        let fecha = document.getElementById("fecha").value
        let mensaje = document.getElementById("txtMensajeErrorActividad");

        validarCamposAgregarActividad(idActividad, minutosTiempo, fecha);

        TOKEN = localStorage.getItem("TOKEN")
        IDUSUARIO = localStorage.getItem("IDUSUARIO")


        let url = `https://movetrack.develotion.com/registros.php`
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: TOKEN,
                iduser: IDUSUARIO,
            },
            body: JSON.stringify({
                "idActividad": idActividad,
                "idUsuario": IDUSUARIO,
                "tiempo": minutosTiempo,
                "fecha": fecha
            })
        })
            .then(res => res.json())
            .then(data => {
                obtenerData();
                mensaje.innerHTML = "Añadido correctamente";

            })

    } catch (error) {
        let mensajeError = document.getElementById("txtMensajeErrorActividad");
        mensajeError.innerHTML = `${error.message}`;
    }
}

function validarCamposAgregarActividad(idActividad, minutosTiempo, fecha) {

    if (!idActividad || !minutosTiempo || !fecha) {
        throw new Error("Todos los campos deben estar completos.");

    }

    if (isNaN(minutosTiempo) || minutosTiempo <= 0) {
        throw new Error("El tiempo debe ser un número positivo.");

    }

    return true;
}


function eliminarRegistro(idRegistro) {
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")
    let url = `https://movetrack.develotion.com/registros.php?idRegistro=${idRegistro}`
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            apikey: TOKEN,
            iduser: IDUSUARIO,
        },
        params: {
            idRegistro: idRegistro
        }
    })
        .then(res => res.json())
        .then(data => {

            console.log(JSON.stringify(data) + "Eliminado correctamente");
            obtenerData();

        })
}


function filtrarPorFecha(data) {

    let fecha1 = document.querySelector("#fecha1").value;
    let fecha2 = document.querySelector("#fecha2").value;

    let parrafodata = document.getElementById("datos")

    parrafodata.innerHTML = ``
    data.registros.forEach(async (element) => {
        if (element.fecha >= fecha1 && element.fecha <= fecha2) {
            let info = await obtenerActividad(element.idActividad)
            parrafodata.innerHTML += `<div style="border-top:1px solid black; border-bottom:1px solid black">id: ${element.id} <br> nombreActividad: ${info.nombre}<br> idUsuario: ${element.idUsuario}<br> tiempo: ${element.tiempo}<br> fecha:${element.fecha} <br> <img src="https://movetrack.develotion.com/imgs/${info.imagen}.png" width="50px" height:"50px" ></img><br><ion-button size="small" color="danger" onclick="eliminarRegistro(${element.id})">eliminar</ ion-button> </div>`

        }
    })

}

function mostrarMensaje(mensaje) {
    let mensajeElemento = document.createElement("div");
    mensajeElemento.innerHTML = mensaje;
    document.body.appendChild(mensajeElemento);
    setTimeout(() => {
        mensajeElemento.remove();
    }, 3000);
}

