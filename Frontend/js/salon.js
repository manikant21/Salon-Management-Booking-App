import { BASE_URL } from "./constant.js";
const logout_btn = document.getElementById("logout_btn");

const token = localStorage.getItem("token");

const serviceForm = document.getElementById("serviceForm");

const staffListEl = document.getElementById("staffList");
const staffModal = document.getElementById("staffModal");
const specializationModal = document.getElementById("specializationModal");
let currentStaffId = null;

logout_btn.addEventListener('click', () => {
  localStorage.removeItem("token");
  localStorage.removeItem("ownerId");
  localStorage.removeItem("ownerName");
  window.location.href = "ownerLogin.html";
})





// Get salonId from query params
const urlParams = new URLSearchParams(window.location.search);
console.log(urlParams);
const salonId = urlParams.get("id");
console.log(salonId);

async function fetchSalonDetails() {
    try {
        const res = await axios.get(`${BASE_URL}/salon/${salonId}`, {
            headers: { "Authorization": token }
        });

        const salon = res.data.salon;
        document.getElementById("salonDetails").innerHTML = `
      <div class="flex gap-6">
        <img src="${salon.image}" class="w-48 h-48 object-cover rounded-lg"/>
        <div>
          <h1 class="text-2xl font-bold">${salon.name}</h1>
          <p class="text-gray-600">${salon.description}</p>
          <p>📍 ${salon.location}</p>
          <p>🕒 ${salon.open_time} - ${salon.close_time}</p>
          <p>Status: <span class="${salon.is_active ? "text-green-600" : "text-red-600"}">
            ${salon.is_active ? "Active" : "Inactive"}
          </span></p>
        </div>
      </div>
    `;
    } catch (err) {
        console.error(err);
        alert("Error loading salon details");
    }
}



serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const serviceData = {
        name: document.getElementById("service_name").value,
        salonId: salonId,
        description: document.getElementById("description").value,
        duration: Number(document.getElementById("duration").value),
        price: Number(document.getElementById("price").value),
        open_time_for_services: document.getElementById("open_time_for_services").value,
        close_time_for_services: document.getElementById("close_time_for_services").value,
        is_active: document.getElementById("is_active").checked,
    }

    try {
        if (serviceForm.dataset.editingId) {
            // 🔹 Update existing service
            const serviceId = serviceForm.dataset.editingId;
            await axios.put(`${BASE_URL}/salon/service/${serviceId}`, serviceData, {
                headers: { "Authorization": token }
            });
            delete serviceForm.dataset.editingId;
            alert("Service updated successfully!");
        } else {
            // 🔹 Create new service
            await axios.post(`${BASE_URL}/salon/addservice`, serviceData, {
                headers: { "Authorization": token }
            });
            alert("Service added successfully!");
        }

        serviceForm.reset();
        document.getElementById("serviceModal").classList.add("hidden");
        fetchServices(); // refresh list

    } catch (error) {
        alert(error.response?.data?.message || "Error saving service");
    }
    // console.log(serviceData);

})


// Fetch and render services
async function fetchServices() {
    try {
        const res = await axios.get(`${BASE_URL}/salon/${salonId}/services`, {
            headers: { "Authorization": token }
        });

        const services = res.data.services; // assuming backend returns { services: [...] }
        const servicesList = document.getElementById("servicesList");
        servicesList.innerHTML = ""; // clear old list

        if (services.length === 0) {
            servicesList.innerHTML = `<p class="text-gray-500">No services added yet.</p>`;
            return;
        }

        services.forEach(service => {
            const serviceCard = `
        <div class="border p-4 rounded shadow bg-white">
          <h3 class="text-lg font-semibold">${service.service_name}</h3>
          <p class="text-sm text-gray-600">${service.description || "No description"}</p>
          <p><strong>Duration:</strong> ${service.duration} min.</p>
          <p><strong>Price:</strong> ${service.price} hr.</p>
          <p><strong>Open:</strong> ${service.open_time_for_services || "N/A"}</p>
          <p><strong>Close:</strong> ${service.close_time_for_services || "N/A"}</p>
          <p><strong>Status:</strong> ${service.is_active ? "✅ Active" : "❌ Inactive"}</p>

           <div class="mt-3 flex space-x-2">
        <button class="editService bg-yellow-500 text-white px-3 py-1 rounded" data-id="${service.id}">Edit</button>
        <button class="deleteService bg-red-500 text-white px-3 py-1 rounded" data-id="${service.id}">Delete</button>
      </div>
        </div>

       
      `;
            servicesList.innerHTML += serviceCard;

            // Attach event listeners for Edit & Delete
            document.querySelectorAll(".deleteService").forEach(btn => {
                btn.addEventListener("click", () => deleteService(btn.dataset.id));
            });

            document.querySelectorAll(".editService").forEach(btn => {
                btn.addEventListener("click", () => openEditServiceModal(btn.dataset.id));
            });
        });
    } catch (err) {
        console.error("Error fetching services:", err);
    }
}

async function deleteService(serviceId) {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
        await axios.delete(`${BASE_URL}/salon/service/${serviceId}`, {
            headers: { "Authorization": token }
        });
        alert("Service deleted successfully!");
        fetchServices(); // refresh list
    } catch (err) {
        alert(err.response?.data?.message || "Error deleting service");
    }
}

function openEditServiceModal(serviceId) {
    axios.get(`${BASE_URL}/salon/service/${serviceId}`, {
        headers: { "Authorization": token }
    })
        .then(res => {
            const service = res.data.service;

            // Fill modal fields with service data
            document.getElementById("service_name").value = service.service_name;
            document.getElementById("description").value = service.description || "";
            document.getElementById("duration").value = Number(service.duration);
            document.getElementById("price").value = Number(service.duration);
            document.getElementById("open_time_for_services").value = service.open_time_for_services || "";
            document.getElementById("close_time_for_services").value = service.close_time_for_services || "";
            document.getElementById("is_active").checked = service.is_active;

            // Store serviceId in form for update
            serviceForm.dataset.editingId = service.id;

            // Show modal
            document.getElementById("serviceModal").classList.remove("hidden");
        })
        .catch(err => {
            alert("Error loading service for edit");
        });
}

document.getElementById("openServiceModal").addEventListener('click', () => {
    document.getElementById("serviceModal").classList.remove("hidden");
})

document.getElementById("closeServiceModal").addEventListener('click', () => {
    document.getElementById("serviceModal").classList.add("hidden");
})

// Open/Close Staff Modal
document.getElementById("openStaffModal").addEventListener("click", () => {
    staffModal.classList.remove("hidden");
});
document.getElementById("closeStaffModal").addEventListener("click", () => {
    staffModal.classList.add("hidden");
});

// 🔹 Add or Update Staff
document.getElementById("staffForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const staffData = {
        name: document.getElementById("staff_name").value,
        email: document.getElementById("staff_email").value,
        phoneNo: document.getElementById("staff_phone").value,
        salon_id: salonId,
        is_active: document.getElementById("staff_is_active").checked,
    };

    try {
        if (staffForm.dataset.editingId) {
            // Update
            const staffId = staffForm.dataset.editingId;
            await axios.put(`${BASE_URL}/staff/${staffId}`, staffData, {
                headers: { Authorization: token },
            });
            delete staffForm.dataset.editingId;
            alert("Staff updated successfully!");
        } else {
            // Create
            await axios.post(`${BASE_URL}/staff/add`, staffData, {
                headers: { Authorization: token },
            });
            alert("Staff added successfully!");
        }

        staffModal.classList.add("hidden");
        e.target.reset();
        loadStaff();
    } catch (err) {
        console.error("Error saving staff:", err);
        alert("Error saving staff");
    }
});

// 🔹 Fetch staff only for this salon
// async function loadStaff() {
//   try {
//     const res = await axios.get(`${BASE_URL}/staff/${salonId}/staff`, {
//       headers: { Authorization: token },
//     });

//     staffListEl.innerHTML = "";
//     res.data.staff.forEach((staff) => {
//       const staffCard = document.createElement("div");
//       staffCard.className = "border p-4 rounded shadow bg-white";

//       staffCard.innerHTML = `
//         <h3 class="text-lg font-bold">${staff.name}</h3>
//         <p>Email: ${staff.email}</p>
//         <p>Phone: ${staff.phoneNo}</p>
//         <p>Status: ${staff.is_active ? "✅ Active" : "❌ Inactive"}</p>
//         <p><b>Specializations:</b> 
//           ${staff.Specializations && staff.Specializations.length > 0
//             ? staff.Specializations.map((s) => s.name).join(", ")
//             : "None"}
//         </p>
//         <div class="mt-2 flex space-x-2">
//           <button onclick="openEditStaff(${staff.id})" class="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
//           <button onclick="openSpecializationModal(${staff.id})" class="bg-blue-500 text-white px-3 py-1 rounded">Edit Specializations</button>
//           <button onclick="deleteStaff(${staff.id})" class="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
//         </div>
//       `;

//       staffListEl.appendChild(staffCard);
//     });
//   } catch (err) {
//     console.error("Error loading staff:", err);
//   }
// }


// 🔹 Fetch staff only for this salon
async function loadStaff() {
    try {
        const res = await axios.get(`${BASE_URL}/staff/${salonId}/staff`, {
            headers: { Authorization: token },
        });
        console.log(res);

        staffListEl.innerHTML = "";
        res.data.staff.forEach((staff) => {
            const staffCard = document.createElement("div");
            staffCard.className = "border p-4 rounded shadow bg-white";

            // Staff details
            staffCard.innerHTML = `
        <h3 class="text-lg font-bold">${staff.name}</h3>
        <p>Email: ${staff.email}</p>
        <p>Phone: ${staff.phoneNo}</p>
        <p>Status: ${staff.is_active ? "✅ Active" : "❌ Inactive"}</p>
        <p><b>Specializations:</b> 
          ${staff.Specializations && staff.Specializations.length > 0
                    ? staff.Specializations.map((s) => s.name).join(", ")
                    : `<span class="text-gray-500 italic">None</span>`}
        </p>
        <div class="mt-2 flex space-x-2"></div>
      `;

            // Container for buttons
            const buttonContainer = staffCard.querySelector("div.mt-2");

            // Edit button
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "bg-yellow-500 text-white px-3 py-1 rounded";
            editBtn.addEventListener("click", () => openEditStaff(staff.id));

            // Specialization button
            const specBtn = document.createElement("button");
            specBtn.textContent = "Edit Specializations";
            specBtn.className = "bg-blue-500 text-white px-3 py-1 rounded";
            specBtn.addEventListener("click", () => openSpecializationModal(staff.id));

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "bg-red-500 text-white px-3 py-1 rounded";
            deleteBtn.addEventListener("click", () => deleteStaff(staff.id));

            // Append buttons
            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(specBtn);
            buttonContainer.appendChild(deleteBtn);

            staffListEl.appendChild(staffCard);
        });
    } catch (err) {
        console.error("Error loading staff:", err);
    }
}


// 🔹 Delete Staff
async function deleteStaff(id) {
    if (!confirm("Are you sure you want to delete this staff?")) return;
    try {
        await axios.delete(`${BASE_URL}/staff/${id}`, {
            headers: { Authorization: token },
        });
        loadStaff();
    } catch (err) {
        console.error("Error deleting staff:", err);
    }
}

// 🔹 Edit Staff
async function openEditStaff(id) {
    try {
        console.log("Staff id:", id);
        const res = await axios.get(`${BASE_URL}/staff/${id}`, {
            headers: { Authorization: token },
        });
        const staff = res.data.staff;

        document.getElementById("staff_name").value = staff.name;
        document.getElementById("staff_email").value = staff.email;
        document.getElementById("staff_phone").value = staff.phoneNo;
        document.getElementById("staff_is_active").checked = staff.is_active;

        staffForm.dataset.editingId = staff.id;
        staffModal.classList.remove("hidden");
    } catch (err) {
        console.error("Error loading staff for edit:", err);
    }
}


// Open the modal (when clicking Create Specialization button)
document.getElementById("createSpecBtn").addEventListener("click", () => {
    document.getElementById("createSpecModal").classList.remove("hidden");
});

// Close modal on cancel
document.getElementById("closeSpecModal").addEventListener("click", () => {
    document.getElementById("createSpecModal").classList.add("hidden");
});


// Create spec
document.getElementById("createSpecForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("specName").value.trim();
    if (!name) return alert("Enter specialization name");

    try {
        await axios.post(`${BASE_URL}/specializations/add`,
            { salonId, name },
            { headers: { Authorization: token } }
        );
        alert("spec added successfully!");
        document.getElementById("createSpecForm").reset();
        document.getElementById("createSpecModal").classList.add("hidden");
        if (currentStaffId) {
            openSpecializationModal(currentStaffId); // refresh checkboxes for current staff
        } else {
            console.log("Specialization created, but no staff modal open.");
        }
    } catch (err) {
        console.error("Error creating specialization:", err);
    }
});


// ================= SPECIALIZATION =================
async function openSpecializationModal(staffId) {
    currentStaffId = staffId;
    specializationModal.classList.remove("hidden");

    try {
        // Fetch all specializations + staff details
        const [allSpecsRes, staffRes] = await Promise.all([
            axios.get(`${BASE_URL}/specializations/${salonId}`, { headers: { Authorization: token } }),
            axios.get(`${BASE_URL}/staff/get/${staffId}`, { headers: { Authorization: token } }),
        ]);

        const specializationListEl = document.getElementById("specializationList");
        specializationListEl.innerHTML = "";

        console.log(staffRes);

        // Handle case: staff has no specialization
        const staffSpecs = staffRes.data.staff.Specializations
            ? staffRes.data.staff.Specializations.map((s) => s.id)
            : [];

        // console.log(allSpecsRes);
        console.log(staffSpecs);

        if (allSpecsRes.data.length==0) {
            specializationListEl.innerHTML = `
        <p class="text-gray-500 text-sm italic">
          No specialization available. Please create one for this salon first.
        </p>`;
            return;
        }

        // Render checkboxes
        allSpecsRes.data.specializations.forEach((spec) => {
            const checkbox = document.createElement("div");
            checkbox.className = "flex items-center space-x-2";
            checkbox.innerHTML = `
        <input type="checkbox" id="spec_${spec.id}" value="${spec.id}" ${staffSpecs.includes(spec.id) ? "checked" : ""
                }>
        <label for="spec_${spec.id}">${spec.name}</label>
      `;
            specializationListEl.appendChild(checkbox);
        });
    } catch (err) {
        console.error("Error loading specializations:", err);
    }
}

document.getElementById("closeSpecializationModal").addEventListener("click", () => {
    specializationModal.classList.add("hidden");
});

// Save Specializations
document.getElementById("specializationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedSpecs = Array.from(
        document.querySelectorAll("#specializationList input:checked")
    ).map((el) => parseInt(el.value));

    try {
        await axios.post(
            `${BASE_URL}/staff/assignSpecializations`,
            { staffId: currentStaffId, specializationIds: selectedSpecs },
            { headers: { Authorization: token } }
        );
        specializationModal.classList.add("hidden");
        loadStaff();
    } catch (err) {
        console.error("Error assigning specializations:", err);
    }
});


fetchSalonDetails();
fetchServices();
loadStaff();
