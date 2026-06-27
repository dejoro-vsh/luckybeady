import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from './Button';

export default function CheckoutForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("ชำระเงินสำเร็จแล้ว! (Payment succeeded)");
          break;
        case "processing":
          setMessage("กำลังประมวลผลการชำระเงิน (Your payment is processing)");
          break;
        case "requires_payment_method":
          setMessage("การชำระเงินไม่สำเร็จ กรุณาลองอีกครั้ง (Payment failed)");
          break;
        default:
          setMessage("เกิดข้อผิดพลาดบางอย่าง (Something went wrong)");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.origin,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("เกิดข้อผิดพลาดที่ไม่คาดคิด (An unexpected error occurred)");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <Button 
        disabled={isLoading || !stripe || !elements} 
        id="submit" 
        variant="success" 
        className="flex-1" 
        style={{ width: '100%', marginTop: '1.5rem' }}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner">กำลังดำเนินการ...</div> : `ชำระเงิน ฿${amount.toLocaleString()}`}
        </span>
      </Button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message" style={{ color: 'red', marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{message}</div>}
    </form>
  );
}
