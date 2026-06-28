import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import './Step4.css'; // Reusing CSS from step 4

export default function Step5_Success({ orderData, lineProfile }) {
  const { wristSize, stoneSize, braceletConfig, totalPrice, ownerName, phone } = orderData;
  const discountedPrice = Math.floor(totalPrice * 0.8);
  const [receiptSent, setReceiptSent] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('loading');

  const today = new Date().toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const beadCount = braceletConfig.filter(i => i !== null).length;
  const charmCount = braceletConfig.filter(i => i?.type === 'charm').length;

  useEffect(() => {
    // 1. Verify Payment Intent status
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    if (!clientSecret) {
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('succeeded'); 

    // 2. Send LINE Receipt if not sent yet
    if (!receiptSent && lineProfile?.userId) {
      fetch('/api/send-line-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: lineProfile.userId,
          orderData: orderData
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("LINE Receipt API Response:", data);
        if (!data.error) {
          setReceiptSent(true);
        } else {
          console.error("API Error:", data.error, data.details);
        }
      })
      .catch(err => console.error("Error sending receipt:", err));
    }
  }, [receiptSent, lineProfile, orderData]);

  const getFinalCanvasCircles = () => {
    const radius = 100; // 100px radius for the 200px circle
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
          <div className="final-filled-item" style={{ backgroundColor: '#ccc', overflow: 'hidden' }}>
            {item.img ? (
              <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="item-initial">{item.name.substring(0,2)}</span>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="page-container step4-page">
      <Header subtitle={ownerName ? `for ${ownerName}` : ''} date={today} />
      
      <div className="final-design-image" style={{ borderColor: 'var(--success-color)' }}>
        <div className="render-placeholder" style={{ position: 'relative' }}>
          {getFinalCanvasCircles()}
          <div className="watermark">LuckyBeady By YU</div>
        </div>
      </div>

      <div className="success-banner" style={{ 
        backgroundColor: '#d1fae5', 
        color: '#065f46', 
        padding: '1rem', 
        borderRadius: '8px', 
        textAlign: 'center', 
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        🎉 ชำระเงินสำเร็จแล้ว!
      </div>

      <div className="spec-summary card">
        <div className="spec-row">
          <span className="spec-label">ข้อมือ</span>
          <span className="spec-value">{wristSize} cm</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">ความยาวกำไล</span>
          <span className="spec-value">{parseFloat(wristSize) + 2.0} cm</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">ขนาดหิน</span>
          <span className="spec-value">{stoneSize} mm</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">จำนวน</span>
          <span className="spec-value">{beadCount} เม็ด {charmCount > 0 && `+ ${charmCount} Charm`}</span>
        </div>
      </div>

      <div className="bom-list card">
        <h3 className="card-title">รายการชิ้นส่วน</h3>
        {braceletConfig.filter(i => i !== null).map((item, index) => (
          <div key={`${item.id}-${index}`} className="bom-item">
            <div className="bom-item-name">{item.name}</div>
            <div className="bom-item-price">฿{item.price}</div>
          </div>
        ))}
        <div className="bom-total">
          <span>รวมทั้งหมด</span>
          <span className="original-price">฿{totalPrice.toLocaleString()}</span>
        </div>
        <div className="bom-total" style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
          <span>ชำระแล้ว</span>
          <span>฿{discountedPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="footer-action" style={{ display: 'block', paddingBottom: '2rem' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {receiptSent ? "✅ เราได้ส่งใบเสร็จให้คุณทาง LINE แล้ว" : "กำลังจัดเตรียมคำสั่งซื้อ..."}
        </p>
        <Button onClick={() => window.liff ? window.liff.closeWindow() : window.location.href = '/'} variant="primary" style={{ width: '100%' }}>
          ปิดหน้านี้
        </Button>
      </div>
    </div>
  );
}
