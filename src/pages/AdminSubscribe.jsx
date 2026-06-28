import React, { useState, useEffect } from 'react';
import '../styles/global.css';

export default function AdminSubscribe() {
  const [status, setStatus] = useState('กำลังเชื่อมต่อบัญชี LINE...');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const liffId = import.meta.env.VITE_LIFF_ID;
    if (liffId && window.liff) {
      window.liff.init({ liffId }).then(() => {
        if (window.liff.isLoggedIn()) {
          window.liff.getProfile().then(p => {
            setProfile(p);
            setStatus('พร้อมตั้งค่าการแจ้งเตือนแอดมิน');
          });
        } else {
          setStatus('กรุณาเข้าสู่ระบบ LINE');
          window.liff.login();
        }
      }).catch(err => {
        setStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ LINE');
        console.error(err);
      });
    } else {
      setStatus('กรุณาเปิดลิงก์นี้ผ่านแอปพลิเคชัน LINE เท่านั้น');
    }
  }, []);

  const handleSubscribe = async (action) => {
    if (!profile?.userId) return;
    setLoading(true);
    setStatus('กำลังดำเนินการ...');
    
    try {
      const res = await fetch('/api/admin/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId, action })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSubscribed(action === 'subscribe');
        setStatus(action === 'subscribe' ? '✅ ตั้งค่ารับการแจ้งเตือนสำเร็จแล้ว!' : '❌ ยกเลิกการแจ้งเตือนแล้ว');
      } else {
        setStatus('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (err) {
      setStatus('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>🔔 แจ้งเตือนแอดมิน</h2>
        
        {profile && (
          <div style={{ marginBottom: '2rem' }}>
            <img src={profile.pictureUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>คุณ {profile.displayName}</div>
          </div>
        )}

        <div style={{ marginBottom: '2rem', color: '#64748b', fontSize: '0.95rem' }}>
          {status}
        </div>

        {profile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => handleSubscribe('subscribe')}
              disabled={loading || isSubscribed}
              style={{
                background: isSubscribed ? '#e2e8f0' : '#10b981',
                color: isSubscribed ? '#94a3b8' : 'white',
                padding: '1rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: isSubscribed ? 'default' : 'pointer'
              }}
            >
              เปิดรับแจ้งเตือนออเดอร์
            </button>

            <button 
              onClick={() => handleSubscribe('unsubscribe')}
              disabled={loading || !isSubscribed}
              style={{
                background: !isSubscribed ? '#e2e8f0' : '#ef4444',
                color: !isSubscribed ? '#94a3b8' : 'white',
                padding: '1rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: !isSubscribed ? 'default' : 'pointer'
              }}
            >
              ยกเลิกการแจ้งเตือน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
