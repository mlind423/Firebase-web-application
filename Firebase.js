import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();  



async function login(){
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;

   if (!validateEmail(email) || !validatePassword(password)) {
    alert("Invalid email or password. Try again.");
    return;
  }
   
  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await update(ref(db, "users/" + user.uid), {
        lastLogin: Date.now()
      });
    await onValue(ref(db, 'users/' + user.uid), (snapshot) => {
        const userData = snapshot.val();
        localStorage.setItem("userData", JSON.stringify(userData))
    });
        hideLogin();
        loadInfo();
  } catch(error){
    const errorMessage = error.message;
    alert(errorMessage);
  }

}

async function CreateAccount(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;
    const animal = document.getElementById("animal").value;

    if (!validateEmail(email) || !validatePassword(password)) {
        alert("Invalid email or password. Try again.");
        return;
    }
    
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await set(ref(db, "users/" + user.uid), {
            email: email,
            username: username,
            favoriteAnimal: animal,
            lastLogin: Date.now()
        });

        hideLogin();
        loadInfo();
    } catch(error){
        const errorMessage = error.message;
        alert(errorMessage);
    }

}

function logout(){
    signOut(auth).then(() => {
        document.getElementById("signIn").hidden = false;
        document.getElementById("accountInfo").hidden = true;
    }).catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
    });
}

function validateEmail(email){
    var expression = /^[^@]+@\w+(\.\w+)+\w$/
    if(expression.test(email) == true){
      return true
    }else{
      return false
    }
  }

  function validatePassword(password){
    if (password < 8){ //require a password at least 8 characters long.
      return false
    }else{
      return true
    }
  }

  function hideLogin(){
    document.getElementById("signIn").hidden = true;
    document.getElementById("accountInfo").hidden = false;
  }
  function loadInfo(){
    const user = JSON.parse(localStorage.getItem("userData"));
    const time = user.lastLogin;
    const date = new Date(time);
    document.getElementById("emailUser").value = user.email;
    document.getElementById("usernameUser").value = user.username;
    document.getElementById("animalUser").value = user.favoriteAnimal;
    document.getElementById("lastLogin").textContent = "Last login date: " + date
  }

  async function updateDatabase(){
    const email = document.getElementById("emailUser").value;
    const username = document.getElementById("usernameUser").value;
    const animal = document.getElementById("animalUser").value;
    try{
        const user = await auth.currentUser
        await update(ref(db, "users/" + user.uid), {
            email: email,
            username: username,
            favoriteAnimal: animal
          });
    }catch(error){
        const errorMessage = error.message;
        alert(errorMessage);
    }
  }

  document.getElementById("update").addEventListener('click', () => {
    updateDatabase();
  })

  document.getElementById("logOut").addEventListener('click', () => {
    logout();
  });

  document.getElementById('login').addEventListener("click", () => {
    login();
  });

  document.getElementById("createAccount").addEventListener("click", () => {
    CreateAccount();
  });

  document.getElementById("create").addEventListener("click", () => {
    if (document.getElementById("createQuestions").hidden == true){
        document.getElementById("createQuestions").hidden = false;
        document.getElementById("createAccount").hidden = false;
        document.getElementById("create").checked = false;
        document.getElementById("createLabel").textContent = "Already have an account?";
    }else{
        document.getElementById("createQuestions").hidden = true;
        document.getElementById("create").checked = false;
        document.getElementById("createAccount").hidden = true;
        document.getElementById("createLabel").textContent = "Create an account?";
    }
        
  });