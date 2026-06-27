import React, { useState } from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import './Step2.css';

const SIZES = [
  { id: 5, label: '5 mm', desc: '' },
  { id: 6, label: '6 mm', desc: '' },
  { id: 7, label: '7 mm', desc: '' },
  { id: 8, label: '8 mm', desc: '' },
  { id: 9, label: '9 mm', desc: '' },
  { id: 10, label: '10 mm', desc: '' },
  { id: 11, label: '11 mm', desc: '' },
  { id: 12, label: '12 mm', desc: '' }
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
