import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { STONES, SPACERS, CHARMS } from '../data/products';
import './Step3.css';

export default function Step3_InteractiveCanvas({ onNext, onPrev, onUpdateData, orderData }) {
  const { wristSize, stoneSize, braceletConfig = [] } = orderData;
  const beadCount = Math.round((wristSize + 2) / (stoneSize / 10)) || 24;
  
  const [canvasItems, setCanvasItems] = useState(braceletConfig.length ? braceletConfig : Array(beadCount).fill(null));
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
  
  const allInventory = [...STONES, ...SPACERS, ...CHARMS];
  const filters = ['ทั้งหมด', 'น้ำเงิน', 'ชมพู', 'ดำ', 'เหลือง'];
  
  const filteredInventory = useMemo(() => {
    if (activeFilter === 'ทั้งหมด') return allInventory;
    return allInventory.filter(item => item.color === activeFilter || item.type === 'spacer' || item.type === 'charm');
  }, [activeFilter, allInventory]);

  const handleAddItem = (item) => {
    const emptyIndex = canvasItems.findIndex(i => i === null);
    if (emptyIndex !== -1) {
      const newItems = [...canvasItems];
      newItems[emptyIndex] = item;
      setCanvasItems(newItems);
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = [...canvasItems];
    newItems[index] = null;
    setCanvasItems(newItems);
  };

  const handleReset = () => {
    setCanvasItems(Array(beadCount).fill(null));
  };

  const handleUndo = () => {
    const lastFilledIndex = [...canvasItems].reverse().findIndex(i => i !== null);
    if (lastFilledIndex !== -1) {
      const trueIndex = canvasItems.length - 1 - lastFilledIndex;
      handleRemoveItem(trueIndex);
    }
  };

  const filledCount = canvasItems.filter(i => i !== null).length;
  const charmCount = canvasItems.filter(i => i?.type === 'charm').length;
  const totalPrice = canvasItems.reduce((sum, item) => sum + (item ? item.price : 0), 0);

  const handleConfirm = () => {
    onUpdateData({ braceletConfig: canvasItems, totalPrice });
    onNext();
  };

  const getCanvasCircles = () => {
    const radius = 120; // 120px radius for the circle layout
    return canvasItems.map((item, i) => {
      const angle = (i / beadCount) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return (
        <div 
          key={i}
          className={`canvas-slot ${item ? 'filled' : ''}`}
          style={{ transform: `translate(${x}px, ${y}px)` }}
          onClick={() => item && handleRemoveItem(i)}
        >
          {item ? (
            <div className="filled-item" style={{ backgroundColor: item.color || '#ccc' }}>
              <span className="item-initial">{item.name.substring(0,2)}</span>
            </div>
          ) : (
            <span className="slot-number">{i + 1}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="page-container step3-page">
      <Header />
      <ProgressBar currentStep={3} title="ออกแบบกำไล" />
      
      <div className="canvas-header">
        <div className="config-info">
          เม็ด {stoneSize}mm - ข้อมือ {wristSize} cm<br/>
          <span className="hint-text">💡 แตะที่หินเพื่อลบ</span>
        </div>
        <div className="price-info">
          <div className="total-price">฿{totalPrice.toLocaleString()}</div>
          <div className="bead-count">
            {filledCount} / {beadCount} เม็ด
            {charmCount > 0 && <span className="charm-badge"> + {charmCount} Charm</span>}
          </div>
        </div>
      </div>

      <div className="canvas-area">
        <div className="canvas-center">
          <div className="watermark">LuckyBeady</div>
          {getCanvasCircles()}
        </div>
        <div className="canvas-actions">
          <button className="canvas-action-btn" onClick={handleUndo}>ย้อนกลับ</button>
          <button className="canvas-action-btn" onClick={handleReset}>รีเซ็ตกำไล</button>
        </div>
        <div className="disclaimer">*ภาพใช้เพื่อจำลองการออกแบบเท่านั้น สีและลักษณะอาจมีความแตกต่างเล็กน้อย</div>
      </div>

      <div className="filter-bar">
        {filters.map(f => (
          <button 
            key={f} 
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="inventory-grid">
        {filteredInventory.map(item => (
          <div key={item.id} className="inventory-item" onClick={() => handleAddItem(item)}>
            <div className="item-image" style={{ backgroundColor: item.color || '#ccc' }}></div>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-price">฿{item.price}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-action dual-action">
        <Button onClick={onPrev} variant="secondary" className="flex-1">
          ย้อนกลับ
        </Button>
        <Button onClick={handleConfirm} className="flex-1" disabled={filledCount === 0}>
          ยืนยัน &rarr;
        </Button>
      </div>
    </div>
  );
}
