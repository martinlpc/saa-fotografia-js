//DB de usuarios fantasía
const users = [
    {
        name: "Martin",
        mail: "martin@mail.com",
        pass: "passwordsuperseguro",
    },
    {
        name: "Sabri",
        mail: "sabrina@mail.com",
        pass: "conejito",
    },
    {
        name: "Alaska",
        mail: "alaska@mail.com",
        pass: "laperritadesabriymartin",
    },
];

// DOM Elements
const loginMail = document.getElementById("loginEmail"),
    loginPass = document.getElementById("loginPass"),
    remember = document.getElementById("rememberMe"),
    btnLogin = document.getElementById("btnLogin");
