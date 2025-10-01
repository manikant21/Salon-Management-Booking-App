import { BASE_URL } from "./constant.js";
const token = localStorage.getItem("token");
const logout_btn = document.getElementById("logout_btn");

logout_btn.addEventListener('click', () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  window.location.href = "userLogin.html";
})

const urlParams = new URLSearchParams(window.location.search);
  const salonId = urlParams.get("salonId"); // passed from salon list
  console.log(salonId);



document.addEventListener("DOMContentLoaded", async () => {
  
  if (!salonId) return alert("No salon selected");

  const dateInput = document.getElementById("datePicker"); 
  const today = new Date().toISOString().split("T")[0]; 
  dateInput.min = today;

  try {
    // Fetch salon info, services, and specializations
    const [salonRes, servicesRes, specsRes] = await Promise.all([
      axios.get(`${BASE_URL}/salon/get/${salonId}`, { headers: { Authorization: token } }),
      axios.get(`${BASE_URL}/salon/get/services/${salonId}`, { headers: { Authorization: token } }),
      axios.get(`${BASE_URL}/specializations/get/${salonId}`, { headers: { Authorization: token } }),
    ]);

    renderSalonInfo(salonRes.data);
    console.log(salonRes.data);
    renderServices(servicesRes.data);
    renderSpecializations(specsRes.data);

  } catch (err) {
    console.error("Error loading salon details:", err);
  }
});

// ---------- Render Functions ----------

function renderSalonInfo(salon) {
  const header = document.querySelector(".container > div:first-child");
  header.querySelector("h1").textContent = salon.name;
  header.querySelector("p.text-gray-600").textContent = salon.address;
  header.querySelector("p.text-yellow-500").textContent = `⭐ ${salon.rating || "N/A"}`;
}

function renderServices(services) {
  const list = document.getElementById("servicesList");
  const serviceSelect = document.getElementById("serviceSelect");

  list.innerHTML = "";
  serviceSelect.innerHTML = `<option value="">Select Service</option>`;

  services.forEach(service => {
    // Service card
    const div = document.createElement("div");
    div.className = "flex justify-between items-center border-b pb-2";
    div.innerHTML = `
      <div>
        <h3 class="font-medium">${service.service_name}</h3>
        <p class="text-sm text-gray-500">Duration: ${service.duration} mins</p>
      </div>
      <span class="text-green-600 font-semibold">₹${service.price}</span>
    `;
    list.appendChild(div);

    // Dropdown option
    const opt = document.createElement("option");
    opt.value = service.id;
    opt.textContent = `${service.service_name} (₹${service.price})`;
    serviceSelect.appendChild(opt);
  });
}

function renderSpecializations(specs) {
  const list = document.getElementById("specializationsList");
  list.innerHTML = "";

  if (!specs.length) {
    list.innerHTML = `<p class="text-gray-500 italic">No specializations added yet.</p>`;
    return;
  }

  specs.forEach(spec => {
    const span = document.createElement("span");
    span.className = "px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm";
    span.textContent = spec.name;
    list.appendChild(span);
  });
}

// ---------- Booking Flow ----------

document.getElementById("serviceSelect").addEventListener("change", async (e) => {
  const serviceId = e.target.value;
  const staffSelect = document.getElementById("staffSelect");
  staffSelect.innerHTML = `<option value="">Select Staff </option>`;

  if (!serviceId) return;

  try {
    const res = await axios.get(`${BASE_URL}/staff/byService/${serviceId}`, { headers: { Authorization: token } });
    res.data.forEach(staff => {
      const opt = document.createElement("option");
      opt.value = staff.id;
      opt.textContent = staff.name;
      staffSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Error fetching staff:", err);
  }
});

document.getElementById("datePicker").addEventListener("change", async (e) => {
  const date = e.target.value;
  const serviceId = document.getElementById("serviceSelect").value;
  const staffId = document.getElementById("staffSelect").value || null;
  const slotsContainer = document.getElementById("slotsContainer");

  if (!serviceId || !date) return;

  try {
    const res = await axios.post(`${BASE_URL}/booking/appointments/availableSlots`, 
      { serviceId, staffId, date }, 
      { headers: { Authorization: token } }
    );

    slotsContainer.innerHTML = "";
    if (!res.data.length) {
      slotsContainer.innerHTML = `<p class="text-gray-500 italic">No slots available.</p>`;
      return;
    }

    const now = new Date(); 
    const selectedDate = new Date(date);

    res.data.forEach(slot => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-green-200";
      btn.textContent = slot;

      const [hours, minutes] = slot.split(":").map(Number); 
      const slotDateTime = new Date(selectedDate); slotDateTime.setHours(hours, minutes, 0, 0);

      if (slotDateTime < now) { 
        btn.disabled = true; btn.className = "px-3 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed"; 
    }
    else { 
        btn.className = "px-3 py-1 bg-gray-200 rounded hover:bg-green-200"; 
        btn.addEventListener("click", () => { 
            document .querySelectorAll("#slotsContainer button") .forEach((b) => b.classList.remove("bg-green-500", "text-white") ); 
            btn.classList.add("bg-green-500", "text-white"); 
            btn.dataset.selected = "true"; 
        }); 
    }
      slotsContainer.appendChild(btn);
    });

  } catch (err) {
    console.error("Error fetching slots:", err);
  }
});

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const serviceId = document.getElementById("serviceSelect").value;
  const staffId = document.getElementById("staffSelect").value ;
  const booking_date = document.getElementById("datePicker").value;
  const selectedSlotBtn = Array.from(document.querySelectorAll("#slotsContainer button"))
    .find(b => b.classList.contains("bg-green-500"));

  const booking_time = selectedSlotBtn.textContent;

  console.log(serviceId, staffId, booking_date, booking_time);
  
  if (!serviceId || !booking_date || !booking_time || !staffId) {
    return alert("Please select service, staff, date and slot");
  }

//   const booking_time = selectedSlotBtn.textContent; // slot is actual time like "11:30"

  try {
    const res = await axios.post(`${BASE_URL}/booking/appointments/book`, {
      salonId,
      serviceId,
      staffId,
      booking_date,
      booking_time
    }, { headers: { Authorization: token } });

    alert("Booking confirmed! Please proceed to payment.");
    e.target.reset();
    document.getElementById("slotsContainer").innerHTML = "";

    window.location.href = `bookingSummary.html?bookingId=${res.data.booking.id}`;
  } catch (err) {
    console.error("Error booking appointment:", err);
    alert("Booking failed. Try again.");
  }
});
