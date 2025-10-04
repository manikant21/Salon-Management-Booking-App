import { BASE_URL } from "./constant.js";

const token = localStorage.getItem("token");

const content = document.getElementById("content");
const title = document.getElementById("title");

const detailModal = document.getElementById("detailModal");
const detailContent = document.getElementById("detailContent");
const closeModal = document.getElementById("closeModal");

// --- Fetch Data ---
async function fetchData(section) {
  try {
    const res = await axios.get(`${BASE_URL}/admin/all${section}`, {
      headers: { Authorization: token}
    });
    // Support both {data:[]} or {users:[]}
    const body = res.data;
    const items = body.data || body[section] || [];
    render(section, items);
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p class="text-red-500">Error loading ${section}</p>`;
  }
}

// --- Render Functions per Section ---
function renderUsers(users) {
  content.innerHTML = "";
  users.forEach(u => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";
    card.innerHTML = `
      <h3 class="font-bold">${u.username}</h3>
      <p>Email: ${u.email}</p>
      <p>Phone: ${u.phoneNo}</p>
      <p>Status: ${u.status}</p>
    `;
    card.addEventListener("click", () => openDetail("user", u));
    content.appendChild(card);
  });
}

function renderOwners(owners) {
  content.innerHTML = "";
  owners.forEach(o => {
    const card = document.createElement("div");
    console.log(o);
    card.className = "bg-white p-4 rounded shadow";
    const salonNames = o.Salons && o.Salons.length > 0
      ? o.Salons.map(sal => sal.name).join(", ")
      : "No salon available";
    card.innerHTML = `
      <h3 class="font-bold">${o.name}</h3>
      <p>Email: ${o.email}</p>
      <p>Phone: ${o.phoneNo}</p>
      <p>Salon Name: ${salonNames}</p>
    `;
      card.addEventListener("click", () => openDetail("owner", o));
    content.appendChild(card);
  });
}

function renderSalons(salons) {
  content.innerHTML = "";
  salons.forEach(s => {
    const card = document.createElement("div");
    console.log(s);
    const services = s.Services && s.Services.length > 0
      ? s.Services.map(ser => ser.service_name).join(", ")
      : "No services available";

    card.className = "bg-white p-4 rounded shadow";
    card.innerHTML = `
      <img src="${s.image}">
      <h3 class="font-bold">${s.name}</h3>
      <p>Location: ${s.location}</p>
      <p>Owner Name: ${s.SalonOwner.name}</p>
        <p>Services: ${services}</p>
      <p>Rating: ${s.averageRating ?? "N/A"}</p>
    `;
      card.addEventListener("click", () => openDetail("salon", s));
    content.appendChild(card);
  });
}

function renderStaffs(owners) {
  content.innerHTML = "";
  owners.forEach(s => {
    console.log(s);
    const card = document.createElement("div");
      const specialization = s.Specializations && s.Specializations.length > 0
      ? s.Specializations.map(ser => ser.name).join(", ")
      : "No specialixations available";
    card.className = "bg-white p-4 rounded shadow";
    card.innerHTML = `
      <h3 class="font-bold">${s.name}</h3>
      <p>Email: ${s.email}</p>
      <p>Phone: ${s.phoneNo}</p>
      <p>Specialization: ${specialization}
      <p>Active: ${s.is_active}</p>
    `;
      card.addEventListener("click", () => openDetail("staff", s));
    content.appendChild(card);
  });
}

function renderBookings(bookings) {
  content.innerHTML = "";
  bookings.forEach(b => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";
    console.log(b);
    card.innerHTML = `
      <h3 class="font-bold">Booking #${b.id}</h3>
      <p>Date: ${b.booking_date}</p>
      <p>Time: ${b.booking_time}</p>
       <p>Booking By: ${b.Users.username}</p>
      <p>Booking for: ${b.Salons.name}</p>
      <p>Service: ${b.Services.service_name}</p>
      <p>Booked Staff: ${b.Staffs.name}</p>
      <p>Status: ${b.booking_status}</p>
       <p>Payment: ${b.payment_status}</p>
    `;
      card.addEventListener("click", () => openDetail("booking", b));
    content.appendChild(card);
  });
}

function renderReviews(reviews) {
  content.innerHTML = "";
  reviews.forEach(r => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";
    console.log(b);
    card.innerHTML = `
      <h3 class="font-bold">Booking #${r.id}</h3>
       <p>Review By: ${r.Users.username}</p>
      <p>Review for Salon: ${r.Salons.name}</p>
      <p>Review for Staff: ${r.Staffs.name}</p>
      <p>Review of Salon: ${r.reviewForSalon}</p>
      <p>Rating of Salon: ${r.salon_rating}</p>
      <p>Review of Staff: ${r.reviewForStaff}</p>
      <p>Rating of Salon: ${r.staff_rating}</p>
    `;
      card.addEventListener("click", () => openDetail("review", r));
    content.appendChild(card);
  });
}

// --- Dispatcher ---
function render(section, items) {
  title.textContent = section.charAt(0).toUpperCase() + section.slice(1);
  if (section === "users") renderUsers(items);
  else if (section === "owners") renderOwners(items);
  else if (section === "salons") renderSalons(items);
   else if (section === "staffs") renderStaffs(items);
  else if (section === "bookings") renderBookings(items);
  else if (section === "reviews") renderReviews(items);
}

// --- Events ---
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;
    fetchData(section);
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminId");
  localStorage.removeItem("userName");
  window.location.href = "adminLogin.html";
});




closeModal.addEventListener("click", () => {
  detailModal.classList.add("hidden");
});

function openDetail(type, data) {
  let html = "";

  if (type === "user") {
    html = `
      <h2 class="font-bold text-xl mb-2">${data.username}</h2>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phoneNo}</p>
      <p>Status: ${data.status}</p>
      <button class="bg-red-500 text-white px-3 py-1 mt-3 rounded" onclick="deleteItem('user', ${data.id})">Remove User</button>
    `;
  }

  if (type === "owner") {
    html = `
      <h2 class="font-bold text-xl mb-2">${data.name}</h2>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phoneNo}</p>
      <p>Salons: ${(data.Salons || []).map(s => s.name).join(", ")}</p>
      <button class="bg-red-500 text-white px-3 py-1 mt-3 rounded" onclick="deleteItem('owner', ${data.id})">Remove Owner</button>
    `;
  }

  if (type === "salon") {
    html = `
      <h2 class="font-bold text-xl mb-2">${data.name}</h2>
      <p>Location: ${data.location}</p>
      <p>Owner: ${data.SalonOwner?.name ?? "N/A"}</p>
      <p>Services: ${(data.Services || []).map(s => s.service_name).join(", ")}</p>
      <button class="bg-red-500 text-white px-3 py-1 mt-3 rounded" onclick="deleteItem('salon', ${data.id})">Remove Salon</button>
    `;
  }

  if (type === "staff") {
    html = `
      <h2 class="font-bold text-xl mb-2">${data.name}</h2>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phoneNo}</p>
      <p>Specializations: ${(data.Specializations || []).map(sp => sp.name).join(", ")}</p>
      <button class="bg-red-500 text-white px-3 py-1 mt-3 rounded" onclick="deleteItem('staff', ${data.id})">Remove Staff</button>
    `;
  }

  if (type === "booking") {
    html = `
      <h2 class="font-bold text-xl mb-2">Booking #${data.id}</h2>
      <p>Date: ${data.booking_date}</p>
      <p>Time: ${data.booking_time}</p>
      <p>Status: ${data.booking_status}</p>
      <p>Payment: ${data.payment_status}</p>
      <button class="bg-red-500 text-white px-3 py-1 mt-3 rounded" onclick="cancelBooking(${data.id})">Cancel Booking</button>
    `;
  }

  if (type === "review") {
    html = `
      <h2 class="font-bold text-xl mb-2">Review #${data.id}</h2>
       <p>Review By: ${data.Users.username}</p>
      <p>Review for Salon: ${data.Salons.name}</p>
      <p>Review for Staff: ${data.Staffs.name}</p>
      <p>Review of Salon: ${data.reviewForSalon}</p>
      <p>Rating of Salon: ${data.salon_rating}</p>
      <p>Review of Staff: ${data.reviewForStaff}</p>
      <p>Rating of Salon: ${data.staff_rating}</p>
      <button class="bg-red-500 text-white px-3 py-1 mt-3 rounded" onclick="deleteItem('review' ,${data.id})">Remove Review</button>
    `;
  }

  detailContent.innerHTML = html;
  detailModal.classList.remove("hidden");
}

window.deleteItem = async function (type, id) {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
  try {
    await axios.delete(`${BASE_URL}/admin/${type}/${id}`, {
      headers: { Authorization: token }
    });
    alert(`${type} deleted successfully`);
    detailModal.classList.add("hidden");
    fetchData(type + "s"); // reload list
  } catch (err) {
    console.error(err);
    alert("Error deleting " + type);
  }
}

window.cancelBooking = async function (id) {
  if (!confirm("Cancel this booking?")) return;
  try {
    await axios.patch(`${BASE_URL}/admin/booking/${id}/cancel`, {}, {
      headers: { Authorization: token }
    });
    alert("Booking cancelled");
    detailModal.classList.add("hidden");
    fetchData("bookings");
  } catch (err) {
    console.error(err);
    alert("Error cancelling booking");
  }
}


