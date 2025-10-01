import { Cashfree, CFEnvironment } from "cashfree-pg";
import { Booking, Payment, Salon, Service, Staff, User } from "../models/index.model.js";
import { sendPaymentConfirmationEmail } from "../services/mail.service.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cashfree client
const cashfree = new Cashfree(
  CFEnvironment.SANDBOX, // or CFEnvironment.PRODUCTION
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);



// -------------------- INITIATE PAYMENT --------------------
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findByPk(bookingId, {
      include: [Salon, Service, Staff, User]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const orderId = `ORDER_${Date.now()}_${bookingId}`;
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Cashfree order request
    const request = {
      order_id: orderId,
      order_amount: booking.Service.price,
      order_currency: "INR",
      customer_details: {
        customer_id: booking.User.id.toString(),
        customer_email: booking.User.email,
        customer_phone: req.user?.phone || "9999999999"
      },
      order_meta: {
        return_url: `http://127.0.0.1:5501/Frontend/pages/paymentSuccess.html?order_id=${orderId}&bookingId=${bookingId}`
      },
      order_expiry_time: expiry
    };

    // ✅ Correct method in v5
    const response = await cashfree.PGCreateOrder(request);

    if (response?.data?.payment_session_id) {
      await Payment.create({
        booking_id: bookingId,
        user_id: req.user.id,
        amount: booking.Service.price,
        order_id: orderId,
        payment_session_id: response.data.payment_session_id,
        status: "pending"
      });

      return res.json({
        success: true,
        paymentSessionId: response.data.payment_session_id
      });
    } else {
      return res.status(400).json({ success: false, message: "Cashfree order failed" });
    }
  } catch (err) {
    console.error("Initiate Payment Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

// -------------------- VERIFY PAYMENT --------------------
export const verifyPayment = async (req, res) => {
  try {
    const { order_id, bookingId } = req.body;

    // ✅ Correct method in v5
    const response = await cashfree.PGFetchOrder(order_id);
    console.log(response);

    if (response) {
      const paymentData = response.data;
      console.log(paymentData);

      if (paymentData.order_status === "PAID") {
        await Payment.update(
          { status: "paid", paid_at: new Date() },
          { where: { order_id, booking_id: bookingId } }
        );

        await Booking.update(
          {
            payment_status: "paid",
            booking_status: "confirmed"
          },
          { where: { id: bookingId } }
        );

        return res.json({ success: true, message: "Payment successful" });
      } else {
        await Payment.update(
          { status: "failed" },
          { where: { order_id, booking_id: bookingId } }
        );
        return res.json({ success: false, message: "Payment failed" });
      }
    } else {
      return res.status(400).json({ success: false, message: "No payment record found" });
    }
  } catch (err) {
    console.error("Verify Payment Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const sendConfirmationMail = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [User, Salon, Service, Payment, Staff],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!booking.Payment || booking.Payment.status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not confirmed yet" });
    }

    if (!booking.Payment.confirmation_mail_sent) {
      await sendPaymentConfirmationEmail(booking.User.email, booking);

      // update DB so mail isn't sent again
      booking.Payment.confirmation_mail_sent = true;
      await booking.Payment.save();
    }
    // await sendPaymentConfirmationEmail(booking.User.email, booking);

    res.json({ success: true, message: "Payment confirmation email sent" });
  } catch (err) {
    console.error("Error occured in sending confirmation mail :", err);
    next();
  }
}
