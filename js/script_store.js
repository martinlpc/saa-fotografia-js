//DB de usuarios fantasía
const usersDB = [
    {
        name: "Martin",
        mail: "martin@mail.com",
        pass: "1234",
        cart: [],
    },
    {
        name: "Sabrina",
        mail: "sabrina@mail.com",
        pass: "qwerty",
        cart: [],
    },
];

const productsDB = [
    {
        id: "001",
        name: "Niños jugando",
        desc: "Niños jugando en el parque al sol",
        cat: "img",
        src_img: "./res/store/kids-play-sun.jpg",
        price: "100",
    },
    {
        id: "002",
        name: "Monte Fitz Roy",
        desc: "Vista del monte Fitz Roy en alta calidad",
        cat: "img",
        src_img: "...",
        price: "200",
    },
    {
        id: "003",
        name: "E-book: Preparando tu prodcto antes de las fotos",
        desc: "Consejos y nociones de utilidad para preparar tu producto antes de publicitarlo",
        cat: "ebook",
        price: "500",
    },
    {
        id: "004",
        name: "LightRoom Preset: Vintage 11",
        desc: "Aplica estilo Vintage a tu foto en LR",
        cat: "preset",
        price: "500",
    },
];

let cart = [];

// DOM Elements
const loginEmail = document.getElementById("loginEmail"),
    loginPass = document.getElementById("loginPass"),
    remember = document.getElementById("rememberMe"),
    btnLogin = document.getElementById("btnLogin"),
    btnLogout = document.getElementById("btnLogout"),
    modalElem = document.getElementById("modalLogin"),
    modal = new bootstrap.Modal(modalElem),
    cardsContainer = document.getElementById("card-box"),
    filterCat = document.getElementById("filterCat"),
    toggles = document.querySelectorAll(".toggles"),
    btnItemToCart = document.querySelectorAll("button.btn-add-item"),
    contCart = document.getElementById("contCart");

// Flag global que indica si el usuario está logueado, inicializa en false
let isUserLogged = false;

// Valida si existe el usuario y devuelve el obj, sino, devuelve FALSE
function validateUser(database, user, pass) {
    let found = database.find((database) => database.mail == user);

    if (typeof found === "undefined") {
        // Usuario no existe
        return false;
    } else {
        // Usuario existe, comprobamos password

        if (found.pass != pass) {
            return false;
        } else {
            return found;
        }
    }
}

// Guarda el usuario recuperado de la DB en el storage indicado
function saveInStorage(userCurrent, storage) {
    const user = {
        name: userCurrent.name,
        user: userCurrent.mail,
        pass: userCurrent.pass,
        cart: userCurrent.cart,
    };
    storage.setItem("user", JSON.stringify(userCurrent));
}

// Modifico el DOM para mostrar el nombre del usuario en <span id="nombreUser"></span>
function greetUser(user) {
    nombreUser.innerHTML = `Hola <em>${user.name}</em>! `;
}

// Levanto el usuario guardado en el storage indicado
function retrieveUserFromStorage(storage) {
    let user = JSON.parse(storage.getItem("user"));
    return user;
}

// Limpiar storages
function eraseStorages() {
    localStorage.clear();
    sessionStorage.clear();
}

// Chequeo si el usuario está guardado para recordarlo en la proxima sesion
// Si es así, evitamos el proceso de login manual e ingresamos directo
function checkUserLogged(user) {
    if (user) {
        isUserLogged = true;
        saveInStorage(user, sessionStorage);
        greetUser(user);
        toggleElem(toggles, "d-none");
        cart = [...user.cart];
        countCartItems();
    } else {
        isUserLogged = false;
    }
}

// Agrega (filtra) los items del store por categoria seleccionada
// Si se quiere listar TODOS los elementos del store, se envía el parámetro cat: all (value del select)
function renderProducts(arrayData, cat) {
    // Limpiamos el contenedor de las cards de los productos
    cardsContainer.innerHTML = "";
    // Definimos un array temporal con el filtrado, o no, de las categorías
    let arrayTemp = [];
    // Chequeo si se pidió una cat específica o todas
    if (cat != "all") {
        // Armo un array con los elementos de la cat indicada
        arrayTemp = arrayData.filter((el) => el.cat == cat);
    } else {
        // Se selecciono ver todas las cat, se copia el array entero de items
        arrayTemp = Array.from(arrayData);
    }

    arrayTemp.forEach((elem) => {
        // Estructura
        const myNode = document.createElement("article");
        myNode.classList.add("card", "col-12", "col-md-6", "col-lg-3");
        // Imagen
        const myNodeImg = document.createElement("img");
        myNodeImg.classList.add("img-fluid", "card-img-top");
        myNodeImg.setAttribute("src", elem.src_img);
        // Body
        const myNodeCardBody = document.createElement("div");
        myNodeCardBody.classList.add("card-body");
        // Titulo
        const myNodeTitle = document.createElement("p");
        myNodeTitle.classList.add("card-title");
        myNodeTitle.textContent = elem.name;
        // Texto descriptivo
        const myNodeDesc = document.createElement("p");
        myNodeDesc.classList.add("card-text");
        myNodeDesc.textContent = elem.desc;
        // Precio
        const myNodePrice = document.createElement("p");
        myNodePrice.classList.add("card-text");
        myNodePrice.textContent = `$${elem.price}`;
        // Boton de añadir al carro
        const myNodeButton = document.createElement("button");
        myNodeButton.classList.add("btn", "btn-add-item");
        myNodeButton.textContent = "Agregar al carrito";
        myNodeButton.setAttribute("item-id", elem.id);
        myNodeButton.addEventListener("click", addItemCart);
        // Generamos html e insertamos
        myNodeCardBody.appendChild(myNodeTitle);
        myNodeCardBody.appendChild(myNodeDesc);
        myNodeCardBody.appendChild(myNodePrice);
        myNodeCardBody.appendChild(myNodeButton);
        myNode.appendChild(myNodeImg);
        myNode.appendChild(myNodeCardBody);
        cardsContainer.appendChild(myNode);
    });
}

// Función que muestra o oculta elementos del DOM usando el param toggleClass
function toggleElem(DomElems, toggleClass) {
    DomElems.forEach((elem) => {
        elem.classList.toggle(toggleClass);
    });
}

function countCartItems() {
    contCart.innerHTML = cart.length;
}

//
//           EVENTOS
//

// Evento captura el item en el filtro de categorias
filterCat.addEventListener("change", (e) => {
    renderProducts(productsDB, e.target.value);
});

// Cargamos el store con los productos del array al abrir la pag
// y chequeamos si hay un user en local que decidio ser recordado
window.onload = () => {
    checkUserLogged(retrieveUserFromStorage(localStorage));
    renderProducts(productsDB, "all");
};

btnLogin.addEventListener("click", (e) => {
    // Evitamos que el modal se cierre por
    // la acción del click
    e.preventDefault();
    // Chequeo de campos vacíos
    if (!loginEmail.value || !loginPass.value) {
        alert("Complete ambos campos.");
    } else {
        // Validamos si el usuario existe o no
        // validateUser() devuelve false o el obj del user
        let userData = validateUser(usersDB, loginEmail.value, loginPass.value);
        if (!userData) {
            alert("Usuario o contraseña erróneos");
        } else {
            // Chequeamos si eligio recordar su sesion en el navegador del equipo
            if (remember.checked) {
                // Si: guardar en local y session
                saveInStorage(userData, localStorage);
            }
            saveInStorage(userData, sessionStorage);
            greetUser(retrieveUserFromStorage(sessionStorage));
            userData.cart.forEach((elem) => {
                cart.push(elem);
                contCart.innerHTML = parseInt(contCart.innerHTML) + 1;
            });

            // Ahora se cierra el modal
            modal.hide();
            toggleElem(toggles, "d-none");
            isUserLogged = true;
        }
    }
});

btnLogout.addEventListener("click", () => {
    eraseStorages();
    contCart.innerHTML = "0";
    toggleElem(toggles, "d-none");
});

// Se dispara cuando se clickea en algun "añadir al carrito"
function addItemCart(event) {
    // Chequeamos si hay un usuario logueado
    if (isUserLogged) {
        // Obtenemos el id del producto en el attr 'item-id' de su button
        const itemID = event.target.getAttribute("item-id");
        // Chequeamos si ese elemento ya está agregado al carrito
        // "some" devuelve true si encuenta ese id en el carrito
        let itemAlreadyInCart = cart.some((elem) => elem.id == itemID);
        if (itemAlreadyInCart) {
            Toastify({
                text: "Este producto ya está en el carrito",
                duration: 2000,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: false, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to left, #00b09b, #96c93d)",
                },
            }).showToast();
        } else {
            cart.push(productsDB.find((elem) => elem.id == itemID));
            Toastify({
                text: "Producto agregado al carrito",
                duration: 2000,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: false, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();

            // ++contCart
            contCart.innerHTML = parseInt(contCart.innerHTML) + 1;
            let user = retrieveUserFromStorage(sessionStorage);
            user.cart = [...cart];
            saveInStorage(user, sessionStorage);
            if (remember.checked) {
                saveInStorage(user, localStorage);
            }
        }
    } else {
        Toastify({
            text: "Inicia sesión para poder comprar",
            duration: 5000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to left, #00b09b, #96c93d)",
            },
        }).showToast();
    }
}
