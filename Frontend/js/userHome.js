import { BASE_URL } from "./constant.js";
const logout_btn = document.getElementById("logout_btn");
const token = localStorage.getItem("token");

logout_btn.addEventListener('click', () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  window.location.href = "userLogin.html";
})

async function fetchSalons() {
  try {
    const res = await axios.get(`${BASE_URL}/user/allavailablesalon`, {
      headers: {
        "Authorization": token
      }
    });
    console.log(res);
    const salons = res.data.salons;
    console.log(salons)

    const salonContainer = document.getElementById("salonList");
    salonContainer.innerHTML = ""; 

    salons.forEach(salon => {
      const card = document.createElement("div");
      card.className = "bg-white shadow-lg rounded-lg p-4 w-80 cursor-pointer hover:shadow-xl transition";
      card.dataset.id = salon.id;
        const salonId = card.dataset.id;
        console.log(salonId);
      card.innerHTML = `
        <img src="${salon.image}" alt="${salon.name}" class="h-40 w-full object-cover rounded-md mb-3"/>
        <h2 class="text-xl font-bold">${salon.name}</h2>
        <p class="text-gray-600">${salon.description}</p>
        <p class="text-sm text-gray-500"> ${salon.location}</p>
        <p class="text-sm text-gray-500"> ${salon.open_time} - ${salon.close_time}</p>
        <span class="text-sm ${salon.is_active ? 'text-green-600' : 'text-red-600'}">
          ${salon.is_active ? "Active" : "Inactive"}
        </span>
      `;
      salonContainer.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    alert("Error loading salons");
  }
}

document.getElementById("salonList").addEventListener("click", (e) => {
  const card = e.target.closest("div[data-id]");
  if (!card) return;

  const salonId = card.dataset.id;

  openSalonPage(salonId);
});


function openSalonPage(salonId) {
  window.location.href = `salonUser.html?salonId=${salonId}`;
  console.log(salonId);
}

window.openSalonPage = openSalonPage;


fetchSalons();


document.getElementById("search_btn").addEventListener('click', async()=> {
    const searchService = document.getElementById("search").value;
    if(searchService=="") {
        return alert("Please type service to be search");
    }
   
    try {
        const res = await axios.get(`${BASE_URL}/salon/find/services/search?name=${searchService}`, {
              headers: {
        "Authorization": token
      }
        }) 
    console.log(res);
    document.getElementById("salonList").innerHTML="";
    document.getElementById("salonList").classList.add("hidden");
     const resultsDiv = document.getElementById("searchResults");
    resultsDiv.classList.remove("hidden");
    resultsDiv.innerHTML = "";
    if(res.data.length==0) {
      resultsDiv.innerHTML = `<p class="text-red-500">No salons found offering "${searchService}".</p>`;
      return;
    }
    console.log(res.data[0].Salon);

    res.data.forEach(service => {
      const salon = service.Salon;
      resultsDiv.innerHTML += `
        <div class="border p-4 mb-2 rounded shadow">
         <img src="${salon.image}" alt="${salon.name}" class="h-40 w-full object-cover rounded-md mb-3"/>
          <h3 class="font-bold text-lg">${salon.name}</h3>
          <p>Location: ${salon.location}</p>
          <p>Service: ${service.service_name}</p>
          <p>Rating: ${service.averageRating}<p>
          <p>Price: ₹${service.price}</p>
          <button 
            class="bg-green-500 text-white px-3 py-1 rounded mt-2"
            onclick="openSalonPage(${salon.id})"
          >
            Book Now
          </button>
        </div>
      `;
    });

    document.getElementById("search").value="";



    } catch (err) {
         console.error(err);
        alert("Error searching services.");
    }
    

})


document.getElementById('booking_btn').addEventListener('click', () => {
    window.location.href='allBooking.html'
})

// function bookService ()