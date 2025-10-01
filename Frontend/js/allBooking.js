import { BASE_URL } from "./constant.js";
const token = localStorage.getItem("token");

let selectedBookingId = null;
let selectedSalonId = null;
let selectedStaffId = null;

const bookingList = document.getElementById("bookingList");
const rescheduleModal = document.getElementById("rescheduleModal");
const rescheduleForm = document.getElementById("rescheduleForm");
const closeModal = document.getElementById("closeModal");

// Review Modal elements
const reviewModal = document.getElementById("reviewModal");
const reviewForm = document.getElementById("reviewForm");
const closeReviewModalBtn = document.getElementById("closeReviewModal");

// Fetch bookings
async function loadBookings() {
  try {
    const res = await axios.get(`${BASE_URL}/booking/get/allBooking`, {
      headers: { Authorization: token }
    });

    if (res.data.booking.length == 0) {
      const h1 = document.createElement("h1");
      h1.innerText = "No Booking Data Available For You!";
      bookingList.appendChild(h1);
      return;
    }

    bookingList.innerHTML = "";

    res.data.booking.forEach(b => {
      const startDatetime = new Date(`${b.booking_date}T${b.booking_time}:00`);
      const now = new Date();
      const diffHours = (startDatetime - now) / (1000 * 60 * 60);

      const card = document.createElement("div");
      card.className = "bg-white shadow p-4 rounded";

      card.innerHTML = `
        <h2 class="font-bold text-lg">${b.Salon.name}</h2>
        <p>Service: ${b.Service.service_name}</p>
        <p>Staff: ${b.Staff ? b.Staff.name : "Not Assigned"}</p>
        <p>Date: ${b.booking_date}</p>
        <p>Time: ${b.booking_time}</p>
        <p>Booking Status: ${b.booking_status}</p>
        <p>Amount: ${b.Payment?.amount}</p>
        <p>Payment Status: ${b.Payment?.status}</p>
        <div class="mt-3 flex flex-col gap-2" id="actions-${b.id}"></div>
      `;

      bookingList.appendChild(card);

      const actionsDiv = document.getElementById(`actions-${b.id}`);

      // --- Cancel & Reschedule (only when confirmed) ---
      if (b.booking_status === "confirmed") {
        actionsDiv.innerHTML = `
          <button class="cancelBtn bg-red-500 text-white px-3 py-1 rounded ${
            diffHours < 4 ? "opacity-50 cursor-not-allowed" : ""
          }" data-id="${b.id}" ${diffHours < 4 ? "disabled" : ""}>Cancel</button>
          <button class="rescheduleBtn bg-blue-500 text-white px-3 py-1 rounded ${
            diffHours < 2 ? "opacity-50 cursor-not-allowed" : ""
          }" data-id="${b.id}" ${diffHours < 2 ? "disabled" : ""}>Reschedule</button>
        `;
      }

      // --- Review Section (only when completed) ---
      else if (b.booking_status === "completed") {
        if (!b.Review) {
          // show review button
          actionsDiv.innerHTML = `
            <button class="reviewBtn bg-green-600 text-white px-3 py-1 rounded" 
              data-id="${b.id}" 
              data-salon="${b.Salon.id}" 
              data-staff="${b.Staff?.id || ""}">
              Leave Review
            </button>
          `;
        } else {
          // show existing review details
          actionsDiv.innerHTML = `
            <div class="bg-gray-100 p-2 rounded">
              <p><strong>Your Review:</strong></p>
              <p>Salon Rating: ${b.Review.salon_rating}</p>
              <p>Staff Rating: ${b.Review.staff_rating}</p>
              <p>Salon Review: ${b.Review.reviewForSalon || "-"}</p>
              <p>Staff Review: ${b.Review.reviewForStaff || "-"}</p>
            </div>
          `;
        }
      }

      // --- Cancelled ---
      else if (b.booking_status === "cancelled") {
        actionsDiv.innerHTML = `<p class="text-red-600">Booking Cancelled</p>`;
      }
    });

    addEventListeners();
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

function addEventListeners() {
  // cancel buttons
  document.querySelectorAll(".cancelBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const bookingId = btn.dataset.id;
      if (confirm("Are you sure you want to cancel this booking?")) {
        try {
          await axios.put(`${BASE_URL}/booking/cancel/${bookingId}`, {}, {
            headers: { Authorization: token }
          });
          alert("Booking cancelled!");
          loadBookings();
        } catch (err) {
          alert(err.response?.data?.message || "Error cancelling booking");
        }
      }
    });
  });

  // reschedule buttons
  document.querySelectorAll(".rescheduleBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedBookingId = btn.dataset.id;
      rescheduleModal.classList.remove("hidden");
    });
  });

  // review buttons
  document.querySelectorAll(".reviewBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedBookingId = btn.dataset.id;
      selectedSalonId = btn.dataset.salon;
      selectedStaffId = btn.dataset.staff;
      reviewModal.classList.remove("hidden");
    });
  });
}

// Handle Reschedule Submit
rescheduleForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const new_date = document.getElementById("newDate").value;
  const new_time = document.getElementById("newTime").value;

  try {
    await axios.put(`${BASE_URL}/booking/reschedule/${selectedBookingId}`, {
      new_date,
      new_time
    }, { headers: { Authorization: token } });

    alert("Booking rescheduled!");
    rescheduleModal.classList.add("hidden");
    loadBookings();
  } catch (err) {
    alert(err.response?.data?.message || "Error rescheduling booking");
  }
});

closeModal.addEventListener("click", () => {
  rescheduleModal.classList.add("hidden");
});

// Handle Review Submit
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const salonRating = document.getElementById("salonRating").value;
  const staffRating = document.getElementById("staffRating").value;
  const reviewForSalon = document.getElementById("reviewForSalon").value;
  const reviewForStaff = document.getElementById("reviewForStaff").value;

  try {
    await axios.post(`${BASE_URL}/review/add`, {
      bookingId: selectedBookingId,
      salonId: selectedSalonId,
      staffId: selectedStaffId,
      salonRating,
      staffRating,
      reviewForSalon,
      reviewForStaff
    }, { headers: { Authorization: token } });

    alert("Review submitted!");
    reviewModal.classList.add("hidden");
    loadBookings();
  } catch (err) {
    alert(err.response?.data?.message || "Error submitting review");
  }
});

closeReviewModalBtn.addEventListener("click", () => {
  reviewModal.classList.add("hidden");
});

// Initial load
loadBookings();









// import { BASE_URL } from "./constant.js";
// const token = localStorage.getItem("token");

// // let selectedBookingId = null;
// let selectedSalonId = null;
// let selectedStaffId = null;


// const bookingList = document.getElementById("bookingList");
// const rescheduleModal = document.getElementById("rescheduleModal");
// const rescheduleForm = document.getElementById("rescheduleForm");
// const closeModal = document.getElementById("closeModal");

// // Review Modal elements
// const reviewModal = document.getElementById("reviewModal");
// const reviewForm = document.getElementById("reviewForm");
// const closeReviewModalBtn = document.getElementById("closeReviewModal");

// let selectedBookingId = null;

// // Fetch bookings
// async function loadBookings() {
//   try {
//     const res = await axios.get(`${BASE_URL}/booking/get/allBooking`, {
//       headers: { Authorization: token }
//     });

//     if (res.data.booking.length == 0) {
//       const h1 = document.createElement("h1");
//       h1.innerText = "No Booking Data Available For You!";
//       bookingList.appendChild(h1);
//       return;
//     }

//     bookingList.innerHTML = "";
//     console.log(res);

//     res.data.booking.forEach(b => {
//       const startDatetime = new Date(`${b.booking_date}T${b.booking_time}:00`);
//       const now = new Date();
//       const diffHours = (startDatetime - now) / (1000 * 60 * 60);

//       const card = document.createElement("div");
//       card.className = "bg-white shadow p-4 rounded";

//       card.innerHTML = `
//         <h2 class="font-bold text-lg">${b.Salon.name}</h2>
//         <p>Service: ${b.Service.service_name}</p>
//         <p>Staff: ${b.Staff ? b.Staff.name : "Not Assigned"}</p>
//         <p>Date: ${b.booking_date}</p>
//         <p>Time: ${b.booking_time}</p>
//         <p>Booking Status: ${b.booking_status}</p>
//         <p>Amount: ${b.Payment?.amount}</p>
//         <p>Payment Status: ${b.Payment?.status}</p>
//         <div class="mt-3 flex gap-2" id="actions-${b.id}"></div>
//       `;

//       bookingList.appendChild(card);

//       const actionsDiv = document.getElementById(`actions-${b.id}`);

//       // Conditional actions based on booking status
//       if (b.booking_status === "confirmed") {
//         actionsDiv.innerHTML = `
//           <button class="cancelBtn bg-red-500 text-white px-3 py-1 rounded ${
//             diffHours < 4 ? "opacity-50 cursor-not-allowed" : ""
//           }" data-id="${b.id}" ${diffHours < 4 ? "disabled" : ""}>Cancel</button>
//           <button class="rescheduleBtn bg-blue-500 text-white px-3 py-1 rounded ${
//             diffHours < 2 ? "opacity-50 cursor-not-allowed" : ""
//           }" data-id="${b.id}" ${diffHours < 2 ? "disabled" : ""}>Reschedule</button>
//         `;
//       } else if (b.booking_status === "completed") {
//         actionsDiv.innerHTML = `
//           <button class="reviewBtn bg-green-600 text-white px-3 py-1 rounded" data-id="${b.id}">Leave Review</button>
//         `;
//       } else if (b.booking_status === "cancelled") {
//         actionsDiv.innerHTML = `<p class="text-red-600">Booking Cancelled</p>`;
//       }
//     });

//     addEventListeners();
//   } catch (err) {
//     console.error("Error loading bookings:", err);
//   }
// }

// function addEventListeners() {
//   document.querySelectorAll(".cancelBtn").forEach(btn => {
//     btn.addEventListener("click", async () => {
//       const bookingId = btn.dataset.id;
//       if (confirm("Are you sure you want to cancel this booking?")) {
//         try {
//           await axios.put(`${BASE_URL}/booking/cancel/${bookingId}`, {}, {
//             headers: { Authorization: token }
//           });
//           alert("Booking cancelled!");
//           loadBookings();
//         } catch (err) {
//           alert(err.response?.data?.message || "Error cancelling booking");
//         }
//       }
//     });
//   });

//   document.querySelectorAll(".rescheduleBtn").forEach(btn => {
//     btn.addEventListener("click", () => {
//       selectedBookingId = btn.dataset.id;
//       rescheduleModal.classList.remove("hidden");
//     });
//   });

//   document.querySelectorAll(".reviewBtn").forEach(btn => {
//     btn.addEventListener("click", () => {
//       selectedBookingId = btn.dataset.id;
//       reviewModal.classList.remove("hidden");
//     });
//   });
// }

// // Handle Reschedule
// rescheduleForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const new_date = document.getElementById("newDate").value;
//   const new_time = document.getElementById("newTime").value;

//   try {
//     await axios.put(`${BASE_URL}/booking/reschedule/${selectedBookingId}`, {
//       new_date,
//       new_time
//     }, { headers: { Authorization: token } });

//     alert("Booking rescheduled!");
//     rescheduleModal.classList.add("hidden");
//     loadBookings();
//   } catch (err) {
//     alert(err.response?.data?.message || "Error rescheduling booking");
//   }
// });

// closeModal.addEventListener("click", () => {
//   rescheduleModal.classList.add("hidden");
// });

// // Handle Review Submit
// reviewForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const reviewText = document.getElementById("reviewText").value;
//   const reviewRating = document.getElementById("reviewRating").value;

//   try {
//     await axios.post(`${BASE_URL}/review`, {
//       booking_id: selectedBookingId,
//       review: reviewText,
//       rating: reviewRating
//     }, { headers: { Authorization: token } });

//     alert("Review submitted!");
//     reviewModal.classList.add("hidden");
//     loadBookings();
//   } catch (err) {
//     alert(err.response?.data?.message || "Error submitting review");
//   }
// });

// closeReviewModalBtn.addEventListener("click", () => {
//   reviewModal.classList.add("hidden");
// });

// // Initial load
// loadBookings();












// import { BASE_URL } from "./constant.js";
// const token = localStorage.getItem("token");

// const bookingList = document.getElementById("bookingList");
// const rescheduleModal = document.getElementById("rescheduleModal");
// const rescheduleForm = document.getElementById("rescheduleForm");
// const closeModal = document.getElementById("closeModal");

// let selectedBookingId = null;

// // Fetch bookings
// async function loadBookings() {
//   try {
//     const res = await axios.get(`${BASE_URL}/booking/get/allBooking`, {
//       headers: { Authorization: token }
//     });

//     if(res.data.booking.length==0) {
//         const h1 =document.createElement('h1');
//         h1.innerText = "No Booking Data Available For You!";
//         bookingList.appendChild(h1)
//         return;
        
//     }

//     bookingList.innerHTML = "";
//     console.log(res);

//     res.data.booking.forEach(b => {
//       const startDatetime = new Date(`${b.booking_date}T${b.booking_time}:00`);
//       const now = new Date();
//       const diffHours = (startDatetime - now) / (1000 * 60 * 60);

//       const card = document.createElement("div");
//       card.className = "bg-white shadow p-4 rounded";

//       card.innerHTML = `
//         <h2 class="font-bold text-lg">${b.Salon.name}</h2>
//         <p>Service: ${b.Service.service_name}</p>
//         <p>Staff: ${b.Staff ? b.Staff.name : "Not Assigned"}</p>
//         <p>Date: ${b.booking_date}</p>
//         <p>Time: ${b.booking_time}</p>
//         <p>Booking Status: ${b.booking_status}</p>
//         <p>Amount: ${b.Payment?.amount}</p>
//         <p>Paymnet staus: ${b.Payment?.status}</p>
//         <div id="actions-${b.id}"  class="mt-3 flex gap-2">
//           <button class="cancelBtn bg-red-500 text-white px-3 py-1 rounded ${diffHours < 4 ? "opacity-50 cursor-not-allowed" : ""}" data-id="${b.id}" ${diffHours < 4 ? "disabled" : ""}>Cancel</button>
//           <button class="rescheduleBtn bg-blue-500 text-white px-3 py-1 rounded ${diffHours < 2 ? "opacity-50 cursor-not-allowed" : ""}" data-id="${b.id}" ${diffHours < 2 ? "disabled" : ""}>Reschedule</button>
//         </div>
//       `;

//       bookingList.appendChild(card);
//     });

//     addEventListeners();
//   } catch (err) {
//     console.error("Error loading bookings:", err);
//   }
// }

// function addEventListeners() {
//   document.querySelectorAll(".cancelBtn").forEach(btn => {
//     btn.addEventListener("click", async () => {
//       const bookingId = btn.dataset.id;
//       if (confirm("Are you sure you want to cancel this booking?")) {
//         try {
//           await axios.delete(`${BASE_URL}/booking/cancel/${bookingId}`, {
//             headers: { Authorization: token }
//           });
//           alert("Booking cancelled!");
//           loadBookings();
//         } catch (err) {
//           alert(err.response?.data?.message || "Error cancelling booking");
//         }
//       }
//     });
//   });

//   document.querySelectorAll(".rescheduleBtn").forEach(btn => {
//     btn.addEventListener("click", () => {
//       selectedBookingId = btn.dataset.id;
//       rescheduleModal.classList.remove("hidden");
//     });
//   });
// }

// // Handle Reschedule
// rescheduleForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const new_date = document.getElementById("newDate").value;
//   const new_time = document.getElementById("newTime").value;

//   try {
//     await axios.put(`${BASE_URL}/booking/reschedule/${selectedBookingId}`, {
//       new_date,
//       new_time
//     }, { headers: { Authorization: token } });

//     alert("Booking rescheduled!");
//     rescheduleModal.classList.add("hidden");
//     loadBookings();
//   } catch (err) {
//     alert(err.response?.data?.message || "Error rescheduling booking");
//   }
// });

// closeModal.addEventListener("click", () => {
//   rescheduleModal.classList.add("hidden");
// });

// // Initial load
// loadBookings();
