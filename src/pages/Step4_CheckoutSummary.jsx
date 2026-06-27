import React, { useMemo } from 'react';
import Header from '../components/Header';
import Button from '../components/Button';
import './Step4.css';

// Mock meanings for stones
const STONE_MEANINGS = {
  's1': 'ช่วยเสริมเสน่ห์ ความรัก และความเมตตา',
  's2': 'เสริมดวงความรัก นำพามิตรภาพดีๆ',
  's3': 'นำพาความสงบ ลดความเครียด คุ้มครองในการเดินทาง',
  's4': 'ช่วยให้ใจเย็น สื่อสารอย่างมีประสิทธิภาพ',
  's5': 'เสริมความมั่นใจ ลดความวิตกกังวล',
  's6': 'ปกป้องคุ้มครองจากพลังงานลบ',
  's7': 'เสริมวิสัยทัศน์ ความเด็ดขาด และความเป็นผู้นำ',
  's8': 'กระตุ้นพลังงาน ความกล้าหาญ และความคิดสร้างสรรค์',
  's9': 'บำบัดจิตใจ ให้นอนหลับสบาย และเสริมสติปัญญา'
};

export default function Step4_CheckoutSummary({ onPrev, orderData }) {
  const { wristSize, ownerName, stoneSize, braceletConfig, totalPrice } = orderData;
  const beadCount = braceletConfig.filter(i => i !== null).length;
  const charmCount = braceletConfig.filter(i => i?.type === 'charm').length;

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

  const discountedPrice = Math.floor(totalPrice * 0.8);

  const handleCheckout = () => {
    // Desktop fallback / LINE OA Redirect
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|iPad|iPhone|iPod/i.test(userAgent)) {
      alert("Simulating LINE Flex Message sending... (Redirecting to LINE OA)");
      window.location.href = "https://line.me/R/ti/p/@LuckyBeadyByYU";
    } else {
      alert("สแกนคิวอาร์โค้ดเพื่อเพิ่มเพื่อน LINE และยืนยันการสั่งซื้อ");
    }
  };

  return (
    <div className="page-container step4-page">
      <Header subtitle={ownerName ? `for ${ownerName}` : ''} date={today} />
      
      <div className="final-design-image">
        {/* Placeholder for the 3D/2D finalized render */}
        <div className="render-placeholder">
          <span>FINAL DESIGN</span>
          <div className="design-details">ข้อมือ {wristSize} cm | {stoneSize} mm</div>
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
              <p>{STONE_MEANINGS[item.id] || 'นำพาความโชคดีและพลังงานบวก'}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-notes">
        *สีของหินธรรมชาติอาจมีความแตกต่างจากภาพจำลองเล็กน้อย ทางร้านจะจัดส่งภาพถ่ายสินค้าจริงให้ตรวจสอบก่อนจัดส่งเสมอ
        <br/><br/>
        <Button variant="outline" className="contact-btn">สอบถาม / สั่งทำได้ที่ LINE @LuckyBeady By YU</Button>
      </div>

      <div className="footer-action dual-action checkout-action">
        <Button onClick={onPrev} variant="secondary" className="flex-1">
          ย้อนกลับ
        </Button>
        <Button onClick={handleCheckout} variant="success" className="flex-2">
          สั่งซื้อผ่าน LINE 20%
        </Button>
      </div>
    </div>
  );
}
