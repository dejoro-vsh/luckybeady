import React, { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import './Step4.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);



export default function Step4_CheckoutSummary({ onPrev, orderData }) {
  const { wristSize, ownerName, stoneSize, braceletConfig, totalPrice } = orderData;
  const beadCount = braceletConfig.filter(i => i !== null).length;
  const charmCount = braceletConfig.filter(i => i?.type === 'charm').length;
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const discountedPrice = Math.floor(totalPrice * 0.8);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: discountedPrice }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch API");
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setPaymentError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        console.error("Payment API Error:", err);
        setPaymentError("ไม่สามารถเชื่อมต่อระบบชำระเงินได้ (กรุณาตรวจสอบการตั้งค่า Environment Variables ใน Vercel)");
      });
  }, [discountedPrice]);

  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate BOM (Bill of Materials)
  const bomMap = new Map();
  braceletConfig.forEach(item => {
    if (!item) return;
    if (bomMap.has(item.id)) {
      bomMap.get(item.id).qty += 1;
      bomMap.get(item.id).subtotal += item.price;
    } else {
      bomMap.set(item.id, { ...item, qty: 1, subtotal: item.price });
    }
  });
  const bomList = Array.from(bomMap.values());



  const getFinalCanvasCircles = () => {
    const radius = 100; // 100px radius for the 200px circle
    // Ensure beadCountForLayout is same as Step3
    const beadCountForLayout = Math.round((wristSize + 2) / (stoneSize / 10)) || 24;
    
    return braceletConfig.map((item, i) => {
      if (!item) return null;
      
      const angle = (i / beadCountForLayout) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return (
        <div 
          key={i}
          className="final-canvas-slot"
          style={{ transform: `translate(${x}px, ${y}px)` }}
        >
          <div className="final-filled-item" style={{ backgroundColor: item.color || '#ccc' }}>
            <span className="final-item-initial">{item.name.substring(0,2)}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="page-container step4-page">
      <Header subtitle={ownerName ? `for ${ownerName}` : ''} date={today} />
      
      <div className="final-design-image">
        <div className="render-placeholder" style={{ position: 'relative' }}>
          {getFinalCanvasCircles()}
          <span style={{ zIndex: 1 }}>FINAL DESIGN</span>
          <div className="design-details" style={{ zIndex: 1 }}>ข้อมือ {wristSize} cm | {stoneSize} mm</div>
        </div>
      </div>

      <div className="card spec-summary">
        <div className="spec-row">
          <span>ข้อมือ</span><span>{wristSize} cm</span>
        </div>
        <div className="spec-row">
          <span>ความยาวกำไล</span><span>{(wristSize + 2).toFixed(1)} cm</span>
        </div>
        <div className="spec-row">
          <span>ขนาดหิน</span><span>{stoneSize} mm</span>
        </div>
        <div className="spec-row">
          <span>จำนวน</span><span>{beadCount} เม็ด {charmCount > 0 && `+ ${charmCount} Charm`}</span>
        </div>
      </div>

      <div className="card bom-card">
        <h3 className="card-title" style={{fontSize: '0.875rem'}}>รายการวัสดุ (BOM)</h3>
        {bomList.map(item => (
          <div key={item.id} className="bom-item">
            <div className="bom-item-info">
              <span className="bom-item-color" style={{backgroundColor: item.color || '#ccc'}}></span>
              <span className="bom-item-name">{item.name} <span className="bom-qty">x{item.qty}</span></span>
            </div>
            <div className="bom-item-price">฿{item.subtotal}</div>
          </div>
        ))}
        
        <div className="pricing-section">
          <div className="original-price">
            <span>ราคารวม</span>
            <span className="strike">฿{totalPrice.toLocaleString()}</span>
          </div>
          <div className="discount-banner">
            ลดทันที 20% เมื่อสั่งซื้อผ่าน LINE @LuckyBeady By YU
          </div>
          <div className="final-price">
            <span>ราคาพิเศษ</span>
            <span className="green-price">฿{discountedPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="card meanings-card">
        <h3 className="card-title">ความหมายของหิน (Stone Meanings)</h3>
        {bomList.filter(item => item.type === 'stone').map(item => (
          <div key={item.id} className="meaning-item">
            <div className="meaning-img" style={{backgroundColor: item.color}}></div>
            <div className="meaning-text">
              <h4>{item.name}</h4>
              <p>{item.meaning || 'นำพาความโชคดีและพลังงานบวก'}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-notes">
        *สีของหินธรรมชาติอาจมีความแตกต่างจากภาพจำลองเล็กน้อย ทางร้านจะจัดส่งภาพถ่ายสินค้าจริงให้ตรวจสอบก่อนจัดส่งเสมอ
        <br/><br/>
        <Button variant="outline" className="contact-btn">สอบถาม / สั่งทำได้ที่ LINE @LuckyBeady By YU</Button>
      </div>

      <div className="footer-action" style={{ display: 'block', paddingBottom: '2rem' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>ชำระเงินออนไลน์ (พร้อมเพย์ / บัตรเครดิต)</h3>
        
        {paymentError && (
          <div style={{ color: 'var(--danger-color, #ef4444)', textAlign: 'center', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', fontSize: '0.875rem' }}>
            {paymentError}
          </div>
        )}
        
        {!clientSecret && !paymentError && (
          <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            กำลังโหลดช่องทางการชำระเงิน...
          </div>
        )}

        {clientSecret && (
          <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
            <CheckoutForm amount={discountedPrice} />
          </Elements>
        )}
        <div style={{ marginTop: '2rem' }}>
          <Button onClick={onPrev} variant="secondary" style={{ width: '100%' }}>
            ย้อนกลับไปแก้ไขแบบ
          </Button>
        </div>
      </div>
    </div>
  );
}
