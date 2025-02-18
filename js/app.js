agregarEvento();
ocultarPaginas();
document.getElementById("cerrarSesion").style.display="none";



let TOKEN;
let IDUSUARIO;
let TiempoTotal = 0;
let TiempoTotalPorDia= 0;

function agregarEvento(){
    document.querySelector("#ruteo").addEventListener("ionRouteWillChange",navegar);
    document.querySelector("#btnLogin").addEventListener("click",preLogin);
    document.querySelector("#btnRegistro").addEventListener("click",preRegistro);
    document.getElementById("btnAgregarActividad").addEventListener("click",agregarActividad);


}   
function cerrarSesion (){
    cerrarMenu()
    localStorage.removeItem("TOKEN")
    localStorage.removeItem("IDUSUARIO")
    document.querySelector("ion-router").push("/login")
    document.getElementById("cerrarSesion").style.display="none";
    document.getElementById("itemRegistro").style.display="block";
    let parrafodata = document.getElementById("datos")
        
    parrafodata.innerHTML = ``
    
}

function navegar(event){
    console.log(event);
    ocultarPaginas();
    let paginaDestino=event.detail.to;
    //SI tengo el token en el localstorage, se mantiene la sesion
    if(localStorage.getItem("TOKEN")){
        console.log(localStorage.getItem("TOKEN"));
        document.querySelector("ion-router").push("/home");
        document.getElementById("itemRegistro").style.display="none";
        document.getElementById("cerrarSesion").style.display="block";
        Session()
    }


    if(paginaDestino=="/"){
        ocultarPaginas();
        document.querySelector("#main-content").style.display="block";
    }
    else if(paginaDestino=="/login"){
        ocultarPaginas();
        document.querySelector("#login").style.display="block";
    }
    else if(paginaDestino=="/registro"){
        ocultarPaginas();
        mostrarPaises();
        document.querySelector("#registro").style.display="block";
    }
    else if(paginaDestino=="/home"){
        ocultarPaginas();
        document.querySelector("#home").style.display="block";
    }
   
    
    
    
}

function ocultarPaginas(){
    let paginas=document.querySelectorAll(".ion-page");
    for(let i=1;i<paginas.length;i++){
        paginas[i].style.display="none";
    }
}
function cerrarMenu(){
    document.querySelector("#menu").close();
}

function preLogin(){
    //obtengo los datos
    let usuario = document.getElementById("txtUsuario").value;
    let password = document.getElementById("txtPassword").value;

    
        login(usuario,password)
}

function login(usuario, password){
    // los valido, llamo a la API
    let txtMensajeError = document.getElementById("txtMensajeError");
    try{

            if(usuario.trim() == "")throw new Error("Usuario necesario para iniciar")
            if(password.trim() == "")throw new Error("Contrasenia necesario para iniciar")
    
            const nuevoUsuario = {
                usuario: usuario,
                password: password
            }
        const url = "https://movetrack.develotion.com/login.php"

        fetch(url,{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        })
        .then(res=> res.json())
        .then(data => {
            TOKEN=data.apiKey
            IDUSUARIO=data.id
            if(data.mensaje){
                return txtMensajeError.innerHTML = `${data.mensaje}`
            }else{
                localStorage.setItem("TOKEN",TOKEN)
                localStorage.setItem("IDUSUARIO",IDUSUARIO)
                document.querySelector("ion-router").push("/home");
            }
            
        })

        }catch(err){
            txtMensajeError.innerHTML = `${err.message.toUpperCase()}`
        }
}

function Session(){
    
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")

    let url = `https://movetrack.develotion.com/registros.php?idUsuario=${+IDUSUARIO}`
    fetch(url,{
        method:'GET',
        headers:{
            'Content-Type': 'application/json',
            apikey: TOKEN,
            iduser: +IDUSUARIO,
        },
        params: {
            idUsuario: +IDUSUARIO
        }
    })
    .then(res=> res.json())
    .then(data => {

        obtenerTiempoTotal(data);

        obtenerTiempoPorDia(data);

        mostrarDatosRegistro(data);

    })






}

function mostrarDatosRegistro(data){

    let parrafodata = document.getElementById("datos")
        parrafodata.innerHTML = ``
        data.registros.forEach(async (element ) => {
            let info = await obtenerActividad(element.idActividad)
            parrafodata.innerHTML += `<div style="border-top:1px solid black; border-bottom:1px solid black">id: ${element.id} <br> nombreActividad: ${info.nombre}<br> idUsuario: ${element.idUsuario}<br> tiempo: ${element.tiempo}<br> fecha:${element.fecha} <br> <img src="https://movetrack.develotion.com/imgs/${info.imagen}.png" width="50px" height:"50px" ></img><br><ion-button size="small" color="danger" onclick="eliminarRegistro(${element.id})">eliminar</ ion-button> </div>`
        
        })
}

function obtenerTiempoPorDia(data){
   
    data.registros.filter((element ) => {

        

       
        return element.fecha === new Date().toLocaleDateString('en-CA')

        
        
    }).forEach((element)=>{
        
            TiempoTotalPorDia += +element.tiempo;
        
    })

    document.getElementById("mostrarTiempoPorDia").innerHTML = `El tiempo total por día es: ${TiempoTotalPorDia}`;
}

function obtenerTiempoTotal(data){

    data.registros.forEach((element ) => {
        
        if(element.tiempo){

            TiempoTotal += +element.tiempo;
            
          
        }
    
    })

      document.getElementById("mostrarTiempoTotal").innerHTML = `El tiempo total es: ${TiempoTotal}`;
}

async function obtenerActividad (idActividad){
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
        const act = data.actividades.filter(actividad => actividad.id == idActividad);

        console.log(act);

        return act ? act[0] : "Actividad no encontrada";
        
    } catch (error) {
        console.error("Error obteniendo actividad:", error);
        return "Error al obtener actividad";
    }
}


function agregarActividad (){
    let idActividad = document.getElementById("idActividad").value
    let minutosTiempo = document.getElementById("minutosTiempo").value
    let fecha = document.getElementById("fecha").value
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")

        
            let url = `https://movetrack.develotion.com/registros.php`
            fetch(url,{
                method:'POST',
                headers:{
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
            .then(res=> res.json())
            .then(data => {
                Session()
                console.log(JSON.stringify(data) + "añadido correctamente");
                
            })
        
}


function eliminarRegistro (idRegistro){
    TOKEN = localStorage.getItem("TOKEN")
    IDUSUARIO = localStorage.getItem("IDUSUARIO")
    let url = `https://movetrack.develotion.com/registros.php?idRegistro=${idRegistro}`
    fetch(url,{
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            apikey: TOKEN,
            iduser: IDUSUARIO,
        },
        params: {
            idRegistro: idRegistro
        }
    })
    .then(res=> res.json())
    .then(data => {
        Session()
        console.log(JSON.stringify(data) + "Eliminado correctamente");
        
    })
}





//Milagros
function mostrarPaises() {
    const url = "https://movetrack.develotion.com/paises.php"; 
    console.log(url)
    let select= document.getElementById("selectPais");
    try {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data.paises);
            let option ="";
                    if (data.paises && data.paises.length > 0) {
                        data.paises.forEach(pais => {
                            
                            option += `<ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
                          
                            
                        });

                        select.innerHTML+=option;
                     } else {
                console.error("No se encontraron países.");
            }
        })
        .catch(function(error) {
            console.error("Error al obtener los países:", error);
        });
    } catch (error) {
        console.error("Error al mostrar los países:", error);
    }
}

function preRegistro(){
    let usuario = document.getElementById("txtUsuarioRegistro").value;
    let password = document.getElementById("txtPasswordRegistro").value;
    let pais = Number(document.getElementById('selectPais').value);

    validarDatos(usuario,password,pais);

    let nuevoRegistro = {
        usuario: usuario,
        password: password,
        idPais: pais
    }
    Registro(nuevoRegistro);
}

function Registro(registro){

    try{
       console.log(registro)
        const url = "https://movetrack.develotion.com/usuarios.php"
        
        fetch(url, {
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registro)
        })
        .then(function(response){
           
            return response.json();
        
        })
        .then(function(data){
            console.log(data)
            if(data!=null){
                login(registro.usuario,registro.password);
            }else{
               mensajeErrorR.innerHTML=`${data.error}`;
            }
            
        })


    }catch(error){
        let mensajeErrorR = document.getElementById("txtMensajeErrorRegistro");
        mensajeErrorR.innerHTML = `${error.message}`;
    }

   
}


function mostrarMensaje(mensaje) {
    let mensajeElemento = document.createElement("div");
    mensajeElemento.innerHTML = mensaje;
    document.body.appendChild(mensajeElemento);
    setTimeout(() => {
        mensajeElemento.remove();
    }, 3000);
}

function validarDatos(usuario,password,pais){
    if (!usuario.trim() || !password.trim() || pais === null) {
        throw new Error("Todos los campos son necesarios");
    }
}
