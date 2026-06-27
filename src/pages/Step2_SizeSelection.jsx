import React, { useState } from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import './Step2.css';

const SIZES = [
  { id: 4, label: '4 mm', desc: 'เล็กมินิมอล' },
  { id: 6, label: '6 mm', desc: 'พอดีข้อมือ' },
  { id: 8, label: '8 mm', desc: 'เด่นชัดสวยงาม' }
];

export default function Step2_SizeSelection({ onNext, onPrev, onUpdateData, currentSize }) {
  const [selectedSize, setSelectedSize] = useState(currentSize || 0);

  const handleNext = () => {
    onUpdateData({ stoneSize: selectedSize });
    onNext();
  };

  return (
    <div className="page-container step2-page">
      <Header />
      <ProgressBar currentStep={2} title="เลือกขนาดหิน" />
      
      <div className="card main-card">
        <h3 className="card-title">ขนาดหิน</h3>
        <p className="instruction">เลือกขนาดเม็ดที่ต้องการ (ขนาดเส้นผ่านศูนย์กลางของหิน)</p>
        
        <div className="size-options-container">
          {SIZES.map(size => (
            <div 
              key={size.id} 
              className={`size-card ${selectedSize === size.id ? 'active' : ''}`}
              onClick={() => setSelectedSize(size.id)}
            >
              <div className="bead-preview-container">
                <div 
                  className="bead-preview" 
                  style={{ width: `${size.id * 3}px`, height: `${size.id * 3}px` }}
                ></div>
              </div>
              <div className="size-label">{size.label}</div>
            </div>
          ))}
        </div>

        <button 
          className={`mix-size-btn ${selectedSize === 'mix' ? 'active' : ''}`}
          onClick={() => setSelectedSize('mix')}
        >
          <div className="mix-beads">
            <div className="bead-preview" style={{ width: '12px', height: '12px' }}></div>
            <div className="bead-preview" style={{ width: '24px', height: '24px' }}></div>
            <div className="bead-preview" style={{ width: '18px', height: '18px' }}></div>
          </div>
          <span>ผสมหลายขนาด</span>
        </button>
      </div>

      <div className="card illustration-card">
        <h3 className="card-title" style={{fontSize: '0.875rem', color: 'var(--text-main)', textAlign: 'center'}}>เปรียบเทียบขนาดบนข้อมือ</h3>
        <div className="illustration">
          <img src="https://via.placeholder.com/300x150/f8fafc/94a3b8?text=Arm+Size+Comparison" alt="Size comparison on wrist" />
          <p className="caption">ตัวอย่างแบบข้อมือ 15 cm</p>
        </div>
      </div>

      <div className="footer-action dual-action">
        <Button onClick={onPrev} variant="secondary" className="flex-1">
          ย้อนกลับ
        </Button>
        <Button onClick={handleNext} className="flex-1" disabled={!selectedSize}>
          ถัดไป
        </Button>
      </div>
    </div>
  );
}
