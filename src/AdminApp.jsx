import React, { useState, useEffect } from 'react';
import './styles/global.css';

const COLOR_OPTIONS = ['ทั้งหมด', 'แดง', 'ชมพู', 'ส้ม', 'เหลือง', 'เขียว', 'ฟ้า', 'น้ำเงิน', 'ม่วง', 'ขาว', 'ดำ', 'เทา', 'เงิน', 'ทอง', 'โรสโกลด์', 'อื่นๆ'];
const SIZE_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function AdminApp() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [viewingDebug, setViewingDebug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      });
  };

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuth) {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
    }
  }, [isAuth, activeTab]);

  // Auto-generate ID when name, color, or size changes
  useEffect(() => {
    if (editingProduct && !products.find(p => p.id === editingProduct.id)) {
      const namePart = (editingProduct.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const colorPart = editingProduct.color ? `-${editingProduct.color}` : '';
      const sizePart = editingProduct.size ? `-${editingProduct.size}mm` : '';
      let newId = `${namePart}${colorPart}${sizePart}`;
      if (newId.startsWith('-')) newId = newId.slice(1);
      
      setEditingProduct(prev => ({ ...prev, id: newId }));
    }
  }, [editingProduct?.name, editingProduct?.color, editingProduct?.size]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'luckyadmin') {
      setIsAuth(true);
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({ ...prev, imageBase64: reader.result, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!editingProduct.name) {
      alert('กรุณากรอกชื่อหินก่อนใช้ AI');
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/admin/generate-meaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          color: editingProduct.color,
          type: editingProduct.type
        })
      });
      const data = await res.json();
      if (data.meaning) {
        setEditingProduct(prev => ({ ...prev, meaning: data.meaning }));
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to generate: ' + err.message);
    }
    setGeneratingAI(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingProduct.id) {
      alert('รหัสสินค้า (ID) ว่างเปล่า กรุณากรอกชื่อหิน');
      return;
    }
    const isNew = !products.find(p => p.id === editingProduct.id);
    const method = isNew ? 'POST' : 'PUT';

    fetch('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        alert('บันทึกข้อมูลเรียบร้อย');
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert('Error: ' + data.error);
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('ยืนยันการลบสินค้าชิ้นนี้?')) {
      fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            fetchProducts();
          } else {
            alert('Error: ' + data.error);
          }
        });
    }
  };

  if (!isAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <form onSubmit={handleLogin} style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem' }}>Admin Login</h2>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Enter password" 
            style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
          <button type="submit" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', color: 'white' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('products')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'products' ? '3px solid #10b981' : '3px solid transparent',
            fontWeight: 'bold',
            color: activeTab === 'products' ? '#10b981' : '#64748b',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          💎 จัดการสต๊อกหิน
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'orders' ? '3px solid #10b981' : '3px solid transparent',
            fontWeight: 'bold',
            color: activeTab === 'orders' ? '#10b981' : '#64748b',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          🛒 รายการสั่งซื้อ
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>จัดการคลังสินค้า</h2>
            <button 
              onClick={() => setEditingProduct({ id: '', name: '', type: 'stone', color: 'ชมพู', price: 0, size: 8, img: '', meaning: '', stock_quantity: 10 })}
              style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + เพิ่มสินค้าใหม่
            </button>
          </div>

          {loading ? <p>Loading products...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>รูป</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>รหัส (ID)</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ชื่อ / ขนาด</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ประเภท</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ราคา</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>สต๊อก</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}><img src={p.img} alt={p.name} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} /></td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{p.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.size ? `${p.size} mm` : '-'} | {p.color}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{p.type}</td>
                    <td style={{ padding: '1rem' }}>฿{p.price}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', background: p.stock_quantity > 0 ? '#d1fae5' : '#fee2e2', color: p.stock_quantity > 0 ? '#065f46' : '#991b1b' }}>
                        {p.stock_quantity > 0 ? `${p.stock_quantity} ชิ้น` : 'หมดชั่วคราว'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => setEditingProduct(p)} style={{ marginRight: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>แก้ไข</button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h2>รายการสั่งซื้อล่าสุด</h2>
          </div>
          {loading ? <p>Loading orders...</p> : orders.length === 0 ? <p>ยังไม่มีรายการสั่งซื้อ</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>รหัสออเดอร์</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>วันที่</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ชื่อลูกค้า</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ข้อมือ</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ยอดรวม (ลด 20%)</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>รายการสินค้า</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  let bomList = [];
                  try { bomList = JSON.parse(o.bom_json); } catch(e){}
                  return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o.id}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(o.created_at).toLocaleString('th-TH')}</td>
                    <td style={{ padding: '1rem' }}>{o.owner_name}</td>
                    <td style={{ padding: '1rem' }}>{o.wrist_size} cm</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#10b981' }}>฿{o.discounted_price}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <ul style={{ paddingLeft: '1rem', margin: 0, marginBottom: '0.5rem' }}>
                        {bomList.map((item, idx) => (
                          <li key={idx}>{item.name} x{item.qty}</li>
                        ))}
                      </ul>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => setViewingOrder(o)}
                          style={{ padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          👁️ ดูแบบกำไล
                        </button>
                        <button 
                          onClick={() => setViewingDebug(o)}
                          style={{ padding: '0.25rem 0.5rem', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          🐞 เช็ค LINE
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </>
      )}

      {editingProduct && activeTab === 'products' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{products.find(p => p.id === editingProduct.id) ? 'แก้ไขข้อมูล' : 'เพิ่มสินค้าใหม่'}</h3>
            <form onSubmit={handleSave}>
              
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>รหัสสินค้า (Auto-generated): </span>
                <strong>{editingProduct.id || 'ระบบจะสร้างให้อัตโนมัติ'}</strong>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>ชื่อหิน/สินค้า</label>
                <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="เช่น Rose Quartz" />
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>ประเภท</label>
                  <select value={editingProduct.type} onChange={e => setEditingProduct({...editingProduct, type: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="stone">หิน (Stone)</option>
                    <option value="spacer">ตัวคั่น (Spacer)</option>
                    <option value="charm">จี้ (Charm)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>กลุ่มสี</label>
                  <select value={editingProduct.color || ''} onChange={e => setEditingProduct({...editingProduct, color: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>ขนาด (มิลลิเมตร)</label>
                  <select value={editingProduct.size || 8} onChange={e => setEditingProduct({...editingProduct, size: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    <option value="">ไม่มีขนาด (เช่น จี้)</option>
                    {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} mm</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>จำนวนสต๊อก (เม็ด/ชิ้น)</label>
                  <input type="number" min="0" required value={editingProduct.stock_quantity ?? 0} onChange={e => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>ราคา (บาท)</label>
                  <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>รูปภาพ (ถ่ายรูปหรือเลือกไฟล์)</label>
                {editingProduct.img && (
                  <img src={editingProduct.img} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem', display: 'block' }} />
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{ width: '100%', padding: '0.5rem' }} />
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>อัปโหลดแล้วจะบันทึกลง Vercel Blob อัตโนมัติเมื่อกดบันทึก</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ fontWeight: 'bold' }}>ความหมาย (เพื่อโชว์ในใบเสร็จ)</label>
                  <button type="button" onClick={handleGenerateAI} disabled={generatingAI} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {generatingAI ? 'กำลังแต่ง...' : '✨ ใช้ AI แต่งความหมาย'}
                  </button>
                </div>
                <textarea value={editingProduct.meaning || ''} onChange={e => setEditingProduct({...editingProduct, meaning: e.target.value})} style={{ width: '100%', padding: '0.5rem', height: '80px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="สามารถพิมพ์เอง หรือกดปุ่ม AI ด้านบน" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ยกเลิก</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>แบบกำไลออเดอร์ #{viewingOrder.id}</h3>
              <button onClick={() => setViewingOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ width: '300px', height: '300px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: '50%', border: '2px dashed #cbd5e1', margin: '2rem auto' }}>
              {(() => {
                let config = [];
                try { config = JSON.parse(viewingOrder.bracelet_config || '[]'); } catch(e){}
                
                if (config.length === 0) {
                  return <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '0 2rem' }}>ออเดอร์นี้ไม่มีข้อมูลการเรียงหิน (อาจเป็นออเดอร์เก่า)</div>;
                }

                const radius = 120;
                const beadCountForLayout = config.length;
                return config.map((item, i) => {
                  if (!item) return null;
                  const angle = (i / beadCountForLayout) * 2 * Math.PI - Math.PI / 2;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <div key={i} style={{ position: 'absolute', transform: `translate(${x}px, ${y}px)`, width: '28px', height: '28px', borderRadius: '50%', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      {item.img ? (
                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '8px', textAlign: 'center' }}>{item.name.substring(0,3)}</span>
                      )}
                    </div>
                  );
                });
              })()}
              <div style={{ position: 'absolute', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' }}>{viewingOrder.wrist_size} cm</div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
              ลูกค้าเรียงไว้ {(() => {
                try { return JSON.parse(viewingOrder.bracelet_config || '[]').filter(i=>i).length; } catch(e){return 0;}
              })()} ชิ้น
            </div>
          </div>
        </div>
      )}
      {viewingDebug && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>🐞 ข้อมูล Debug (ออเดอร์ #{viewingDebug.id})</h3>
              <button onClick={() => setViewingDebug(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4>สถานะส่งใบเสร็จหาลูกค้า (Customer Log)</h4>
              <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.85rem', color: '#334155' }}>
                {viewingDebug.customer_log ? JSON.stringify(JSON.parse(viewingDebug.customer_log), null, 2) : 'ไม่มีข้อมูล'}
              </pre>
            </div>
            
            <div>
              <h4>สถานะแจ้งเตือนแอดมิน (Admin Log)</h4>
              <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.85rem', color: '#334155' }}>
                {viewingDebug.admin_log ? JSON.stringify(JSON.parse(viewingDebug.admin_log), null, 2) : 'ไม่มีข้อมูล'}
              </pre>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
