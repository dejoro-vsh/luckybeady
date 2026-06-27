import React, { useState } from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { PRESET_WRIST_SIZES } from '../data/products';
import './Step1.css';

export default function Step1_WristMeasurement({ onNext, onUpdateData }) {
  const [wristSize, setWristSize] = useState('0.0');
  const [ownerName, setOwnerName] = useState('');

  const handleNext = () => {
    onUpdateData({ wristSize: parseFloat(wristSize), ownerName });
    onNext();
  };

  return (
    <div className="page-container step1-page">
      <Header />
      <ProgressBar currentStep={1} title="วัดข้อมือ" />
      
      <div className="card main-card">
        <h3 className="card-title">วัดขนาดข้อมือ</h3>
        <p className="instruction">วัดรอบข้อมือแบบพอดี (หน่วยเซนติเมตร)</p>
        
        <div className="illustration">
          <img src="https://via.placeholder.com/300x150/f1f5f9/94a3b8?text=Measure+Wrist+Illustration" alt="How to measure wrist" />
          <p className="caption">วัดรอบข้อมือบริเวณข้อมือ - สายวัดแนบพอดี ไม่หลวมไม่แน่น</p>
        </div>

        <div className="input-group">
          <input 
            type="number" 
            className="wrist-input" 
            value={wristSize} 
            onChange={(e) => setWristSize(e.target.value)}
            step="0.1"
          />
          <span className="unit">cm</span>
        </div>

        <div className="preset-buttons">
          {PRESET_WRIST_SIZES.map(size => (
            <button 
              key={size} 
              className={`preset-btn ${parseFloat(wristSize) === size ? 'active' : ''}`}
              onClick={() => setWristSize(size.toString())}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="card optional-card">
        <label htmlFor="owner-name" className="input-label">ชื่อเจ้าของกำไล <span className="optional">(ไม่บังคับ)</span></label>
        <input 
          id="owner-name"
          type="text" 
          className="text-input" 
          placeholder="ชื่อของคุณ"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />
      </div>

      <div className="footer-action">
        <Button onClick={handleNext} fullWidth disabled={parseFloat(wristSize) <= 0}>
          ถัดไป
        </Button>
      </div>
    </div>
  );
}
