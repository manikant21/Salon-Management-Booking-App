import { BASE_URL } from "./constant.js";
const token = localStorage.getItem("token");

const cashfree = Cashfree({ mode: "sandbox" });

// bookingSummary.js

// Extract bookingId from query params
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get("bookingId");

async function fetchBooking() {
    try {
        const res = await axios.get(`${BASE_URL}/booking/${bookingId}`, { headers: { Authorization: token } });
        if (!res.data.success) {
            throw new Error("Failed to fetch booking");
        }

        const booking = res.data.booking;

        // Render booking summary
        document.getElementById("bookingSummary").innerHTML = `
      <p><span class="font-semibold">Salon:</span> ${booking.salonName}</p>
      <p><span class="font-semibold">Service:</span> ${booking.serviceName}</p>
      <p><span class="font-semibold">Staff:</span> ${booking.staffName}</p>
       <p><span class="font-semibold">Customer Name:</span> ${booking.customerName}</p>
      <p><span class="font-semibold">Date:</span> ${booking.date}</p>
      <p><span class="font-semibold">Time Slot:</span> ${booking.slot}</p>
      <p><span class="font-semibold">Price:</span> ₹${booking.price}</p>
    `;

        // Show Pay button
        const payBtn = document.getElementById("payBtn");
        payBtn.classList.remove("hidden");

        payBtn.addEventListener("click", async () => {
            try {
                const res = await axios.post(`${BASE_URL}/payment/initiate`, {
                    bookingId: booking.id
                }, {
                    headers: { Authorization: token }
                });

                if (res.data.success) {
                    const { paymentSessionId } = res.data;

                    // const cashfree = new Cashfree({ mode: "sandbox" });

                    const checkoutOptions = {
                        paymentSessionId,
                        redirectTarget: "_self"
                    };
                    await cashfree.checkout(checkoutOptions);
                } else {
                    alert("Payment initiation failed");
                }
            } catch (err) {
                console.error(err);
                alert("Error initiating payment");
            }
        });

    } catch (error) {
        console.error(error);
        document.getElementById("bookingSummary").innerHTML =
            `<p class="text-red-500">Failed to load booking details.</p>`;
    }
}

if (bookingId) {
    fetchBooking();
} else {
    document.getElementById("bookingSummary").innerHTML =
        `<p class="text-red-500">Invalid booking request.</p>`;
}
