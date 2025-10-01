import { BASE_URL } from "./constant.js";
// axios.defaults.withCredentials = true;
let form = document.getElementById("form_login");
let email = document.getElementById("email_login");
let password = document.getElementById("password_login");
let register_btn = document.getElementById("register_btn");


register_btn.addEventListener('click', () => {
    window.location.href = "./ownerRegister.html"
})



form.addEventListener('submit', async(e) => {
    e.preventDefault();
    if(email.value =="" || password.value==""){
          alert("Please fill requred fields!!");
        return;
    }
    let loginData = {
        email: email.value,
        password: password.value

    }
   
    try {
        const response = await axios.post(`${BASE_URL}/owner/loginOwner`, loginData);
        console.log(response);
         if(response.status==200) {
            alert("Successfuly logged in");
              localStorage.setItem("token", response.data.token);
              localStorage.setItem("ownerId", response.data.ownerId);
              localStorage.setItem("ownerName", response.data.name);
              form.reset();
            window.location.href = "./ownerHome.html"
        
        }
        
    } catch (error) {
        console.log(error);
         if (error.response.status == 404) {
            alert("Owner not found");
        }

         if (error.response.status == 401) {
            alert("Please enter valid credentials");
        }
        else {
            alert("Something went wrong");
            console.log("Internal server error");  
        }
            
    }

})

document.getElementById("back_btn").addEventListener('click', ()=> {
    window.location.href='../index.html';
})

