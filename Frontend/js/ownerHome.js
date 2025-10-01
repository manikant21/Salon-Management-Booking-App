import { BASE_URL } from "./constant.js";
const logout_btn = document.getElementById("logout_btn");
let editMode = false;
let editingSalonId = null;

let cancel_btn = document.getElementById("cancel_btn");
const token = localStorage.getItem("token");


logout_btn.addEventListener('click', () => {
  localStorage.removeItem("token");
  localStorage.removeItem("ownerId");
  localStorage.removeItem("ownerName");
  window.location.href = "ownerLogin.html";
})

cancel_btn.addEventListener('click', () => {
  document.getElementById("salonFormContainer").classList.add("hidden");
})


document.getElementById("addSalonBtn").addEventListener("click", () => {
  console.log("clicked");
  document.getElementById("salonFormContainer").classList.remove("hidden");

  // Reset to Add mode
  editMode = false;
  editingSalonId = null;
  document.getElementById("salonForm").reset();
  document.querySelector("#salonFormContainer h2").innerText = "Add Salon";
  document.querySelector("#salonForm button[type='submit']").innerText = "Save Salon";
  // document.getElementById("image").parentElement.classList.remove("hidden"); // allow upload again
   document.getElementById("imageWrapper").classList.remove("hidden");
});


document.getElementById("salonForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (editMode) {
    // UPDATE salon (without image)
    const updatedData = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      location: document.getElementById("location").value,
      open_time: document.getElementById("open_time").value,
      close_time: document.getElementById("close_time").value,
      is_active: document.getElementById("is_active").checked
    };

    try {
      const res = await axios.put(`${BASE_URL}/salon/update/${editingSalonId}`, updatedData, {
        headers: { "Authorization": token }
      });
      console.log(res);

      if (res.status == 201) {
        alert("Salon updated successfully!");
        document.getElementById("salonForm").reset();
        document.getElementById("salonFormContainer").classList.add("hidden");
        editMode = false;
        editingSalonId = null;
        await fetchSalons();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating salon");
    }
  }

  else {
    // ADD salon (with image)
    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("location", document.getElementById("location").value);
    formData.append("open_time", document.getElementById("open_time").value);
    formData.append("close_time", document.getElementById("close_time").value);
    formData.append("is_active", document.getElementById("is_active").checked);
    formData.append("image", document.getElementById("image").files[0]); // only for new salon

    try {
      const res = await axios.post(`${BASE_URL}/salon/salonRegister`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": token
        }
      });

      if (res.status === 201) {
        alert("Salon added successfully!");
        document.getElementById("salonForm").reset();
        document.getElementById("salonFormContainer").classList.add("hidden");
        await fetchSalons();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error adding salon");
    }
  }
});

async function fetchSalons() {
  try {
    const res = await axios.get(`${BASE_URL}/salon/myallsalon`, {
      headers: {
        "Authorization": token
      }
    });

    const salons = res.data.salons;
    const salonContainer = document.getElementById("salonList");
    salonContainer.innerHTML = ""; // clear existing

    salons.forEach(salon => {
      const card = document.createElement("div");
      card.className = "bg-white shadow-lg rounded-lg p-4 w-80 cursor-pointer hover:shadow-xl transition";
      card.dataset.id = salon.id; // store id for click
      card.innerHTML = `
        <img src="${salon.image}" alt="${salon.name}" class="h-40 w-full object-cover rounded-md mb-3"/>
        <h2 class="text-xl font-bold">${salon.name}</h2>
        <p class="text-gray-600">${salon.description}</p>
        <p class="text-sm text-gray-500">📍 ${salon.location}</p>
        <p class="text-sm text-gray-500">🕒 ${salon.open_time} - ${salon.close_time}</p>
        <span class="text-sm ${salon.is_active ? 'text-green-600' : 'text-red-600'}">
          ${salon.is_active ? "Active" : "Inactive"}
        </span>
        <button data-id="${salon.id}" class="edit-btn mt-3 px-1 py-1 bg-blue-600 text-white rounded-lg">Edit Salon</button>
        <button data-id="${salon.id}" class="delete-btn mt-3 px-1 py-1 bg-red-600 text-white rounded-lg">Delete</button>
      `;
      salonContainer.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    alert("Error loading salons");
  }
}

// Delegated click for card + buttons
document.getElementById("salonList").addEventListener("click", (e) => {
  const card = e.target.closest("div[data-id]");
  if (!card) return;

  const salonId = card.dataset.id;

  if (e.target.classList.contains("edit-btn")) {
     e.stopPropagation();
    editSalon(salonId);
    return;
  }

  if (e.target.classList.contains("delete-btn")) {
     e.stopPropagation();
    deleteSalon(salonId);
    return;
  }

  // If clicked outside buttons, open page
  openSalonPage(salonId);
});


async function editSalon(salonId) {
   document.getElementById("salonFormContainer").classList.remove("hidden");
  try {
    const res = await axios.get(`${BASE_URL}/salon/edit/${salonId}`, {
      headers: { "Authorization": token }
    });
    const salon = res.data.salon;

    // Fill form with existing data
    document.getElementById("name").value = salon.name;
    document.getElementById("description").value = salon.description;
    document.getElementById("location").value = salon.location;
    document.getElementById("open_time").value = salon.open_time;
    document.getElementById("close_time").value = salon.close_time;
    document.getElementById("is_active").checked = salon.is_active;

    // Hide image input for edit
    // document.getElementById("image").parentElement.classList.add("hidden");
    document.getElementById("imageWrapper").classList.add("hidden");

    // document.getElementById("salonFormContainer").classList.remove("hidden");
    // Change title + button text
    document.querySelector("#salonFormContainer h2").innerText = "Edit Salon";
    document.querySelector("#salonForm button[type='submit']").innerText = "Update Salon";

    // Switch to edit mode
    editMode = true;
    editingSalonId = salonId;
  } catch (err) {
    console.error(err);
    alert("Error fetching salon details");
  }
}



async function deleteSalon(salonId) {
  if (!confirm("Are you sure you want to delete this service?")) return;

  try {
    await axios.delete(`${BASE_URL}/salon/delete/${salonId}`, {
      headers: { "Authorization": token }
    });
    alert("Service deleted successfully!");
  } catch (error) {

  }
}

function openSalonPage(salonId) {
  window.location.href = `salon.html?id=${salonId}`;
}

window.openSalonPage = openSalonPage;




document.addEventListener("DOMContentLoaded", fetchSalons);

