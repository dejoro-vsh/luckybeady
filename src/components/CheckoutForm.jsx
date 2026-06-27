import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from './Button';

export default function CheckoutForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');

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
        return_url: window.location.origin,
        payment_method_data: {
          billing_details: {
            email: phone ? `${phone.replace(/\D/g, '')}@luckybeady.com` : 'noreply@luckybeady.com',
            phone: phone || undefined,
          }
        }
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("เกิดข้อผิดพลาดที่ไม่คาดคิด (An unexpected error occurred)");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ['promptpay', 'card'],
    fields: {
      billingDetails: {
        email: 'never',
      }
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem' }}>
          เบอร์โทรศัพท์ (สำหรับติดต่อกลับกรณีจำเป็น)
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08X-XXX-XXXX"
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
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
