import { BASE_URL } from "./constant.js";
const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);
const order_id = params.get("order_id");
const bookingId = params.get("bookingId");

async function verify() {
  try {
    const res = await axios.post(`${BASE_URL}/payment/verify`, { order_id, bookingId }, { headers: { Authorization: token } });
    if (res.data.success) {
      document.getElementById("status").innerText = "✅ Payment Successful!";
      const res = await axios.post(
        `${BASE_URL}/payment/sendConfirmation`,
        { bookingId },
        { headers: { Authorization: token } }
      );
      alert("Payment confirmation mail sent!");
      setTimeout(()=> {
        window.location.href = "userHome.html"
      },3000)
    } else {
      document.getElementById("status").innerText = "❌ Payment Failed!";
    }
  } catch (err) {
    document.getElementById("status").innerText = "⚠️ Error verifying payment";
  }
}
verify();


document.getElementById("back").addEventListener('click', () => {
  window.location.href = "userHome.html"
})