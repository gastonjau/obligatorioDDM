agregarEvento();
ocultarPaginas();

let TOKEN;

function agregarEvento(){
    document.querySelector("#ruteo").addEventListener("ionRouteWillChange",navegar);
    document.querySelector("#btnLogin").addEventListener("click",login);
    
}
function navegar(event){
    console.log(event);
    ocultarPaginas();
    let paginaDestino=event.detail.to;
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
function login(){
    //obtengo los datos, los valido, llamo a la API
    let txtMensajeError = document.getElementById("txtMensajeError");
    try{

        let usuario = document.getElementById("txtUsuario").value;
        let password = document.getElementById("txtPassword").value;


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
            console.log("TOKEN:"+ TOKEN)
            console.log(data)
            if(data.mensaje){
                return txtMensajeError.innerHTML = `${data.mensaje}`
            }else{
                let token = document.getElementById("datos")
                token.innerHTML = `Nombre:${usuario} <br/> TOKEN: ${TOKEN}`
                document.querySelector("ion-router").push("/home");
            }
            
        })

        }catch(err){
            txtMensajeError.innerHTML = `${err.message.toUpperCase()}`
        }
}