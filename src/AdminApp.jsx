import React, { useState, useEffect } from 'react';
import './styles/global.css';

export default function AdminApp() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuth) {
      fetchProducts();
    }
  }, [isAuth]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'luckyadmin') { // Basic hardcoded auth for demo
      setIsAuth(true);
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
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
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>ระบบจัดการหิน (Admin)</h2>
        <button 
          onClick={() => setEditingProduct({ id: '', name: '', type: 'stone', color: '', price: 0, sizes: [4,6,8], img: '', meaning: '', stock_status: 'in_stock' })}
          style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          + เพิ่มสินค้าใหม่
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>รูป</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>รหัส (ID)</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>ชื่อ</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>ประเภท</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>ราคา</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>สถานะ</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem' }}><img src={p.img} alt={p.name} width={40} height={40} style={{ borderRadius: '50%' }} /></td>
                <td style={{ padding: '1rem' }}>{p.id}</td>
                <td style={{ padding: '1rem' }}>{p.name}</td>
                <td style={{ padding: '1rem' }}>{p.type}</td>
                <td style={{ padding: '1rem' }}>฿{p.price}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', background: p.stock_status === 'in_stock' ? '#d1fae5' : '#fee2e2', color: p.stock_status === 'in_stock' ? '#065f46' : '#991b1b' }}>
                    {p.stock_status === 'in_stock' ? 'พร้อมส่ง' : 'หมดชั่วคราว'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button onClick={() => setEditingProduct(p)} style={{ marginRight: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px' }}>แก้ไข</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px' }}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{products.find(p => p.id === editingProduct.id) ? 'แก้ไขข้อมูล' : 'เพิ่มสินค้าใหม่'}</h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>รหัส (ID)</label>
                <input required value={editingProduct.id} onChange={e => setEditingProduct({...editingProduct, id: e.target.value})} disabled={!!products.find(p => p.id === editingProduct.id)} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>ชื่อหิน/สินค้า</label>
                <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>ประเภท</label>
                  <select value={editingProduct.type} onChange={e => setEditingProduct({...editingProduct, type: e.target.value})} style={{ width: '100%', padding: '0.5rem' }}>
                    <option value="stone">หิน (Stone)</option>
                    <option value="spacer">ตัวคั่น (Spacer)</option>
                    <option value="charm">จี้ (Charm)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>กลุ่มสี (เช่น pink, blue)</label>
                  <input value={editingProduct.color || ''} onChange={e => setEditingProduct({...editingProduct, color: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>ราคา (บาท)</label>
                  <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>สถานะสต๊อก</label>
                  <select value={editingProduct.stock_status} onChange={e => setEditingProduct({...editingProduct, stock_status: e.target.value})} style={{ width: '100%', padding: '0.5rem' }}>
                    <option value="in_stock">พร้อมส่ง</option>
                    <option value="out_of_stock">หมดชั่วคราว</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>URL รูปภาพ</label>
                <input value={editingProduct.img || ''} onChange={e => setEditingProduct({...editingProduct, img: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>ความหมาย (เพื่อโชว์ในใบเสร็จ)</label>
                <textarea value={editingProduct.meaning || ''} onChange={e => setEditingProduct({...editingProduct, meaning: e.target.value})} style={{ width: '100%', padding: '0.5rem', height: '80px' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '0.5rem 1rem', background: '#e2e8f0' }}>ยกเลิก</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0f172a', color: 'white' }}>บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
