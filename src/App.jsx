import { useState, useEffect } from 'react'
import Step1_WristMeasurement from './pages/Step1_WristMeasurement'
import Step2_SizeSelection from './pages/Step2_SizeSelection'
import Step3_InteractiveCanvas from './pages/Step3_InteractiveCanvas'
import Step4_CheckoutSummary from './pages/Step4_CheckoutSummary'
import Step5_Success from './pages/Step5_Success'
import './styles/global.css'

function App() {
  const [step, setStep] = useState(1)
  const [lineProfile, setLineProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [orderData, setOrderData] = useState({
    wristSize: 0,
    ownerName: '',
    stoneSize: 0,
    braceletConfig: [], // array of items
    totalPrice: 0,
    phone: '' // added for checkout tracking
  })

  useEffect(() => {
    // Fetch dynamic products from Postgres
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error("Failed to load products", err);
        setLoadingProducts(false);
      });

    // 1. Check for Stripe redirect first
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    if (clientSecret) {
      setStep(5);
    }

    // 2. Load orderData from localStorage to prevent data loss on redirect
    const saved = localStorage.getItem('luckybeady_order');
    if (saved) {
      try {
        setOrderData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse localStorage orderData", e);
      }
    }

    // 3. Initialize LIFF
    const liffId = import.meta.env.VITE_LIFF_ID;
    if (liffId && window.liff) {
      window.liff.init({ liffId }).then(() => {
        if (window.liff.isLoggedIn()) {
          window.liff.getProfile().then(profile => {
            setLineProfile(profile);
            // Optionally auto-fill owner name if empty
            setOrderData(prev => prev.ownerName ? prev : { ...prev, ownerName: profile.displayName });
          });
        } else {
          // Force login if not logged in
          window.liff.login();
        }
      }).catch(err => console.error("LIFF Init Error:", err));
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever orderData changes
    localStorage.setItem('luckybeady_order', JSON.stringify(orderData));
  }, [orderData]);

  const updateOrderData = (newData) => {
    setOrderData(prev => ({ ...prev, ...newData }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  if (loadingProducts) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>กำลังโหลดข้อมูลสินค้า...</div>
  }

  return (
    <div className="app-container">
      {step === 1 && (
        <Step1_WristMeasurement 
          onNext={nextStep} 
          onUpdateData={updateOrderData}
          initialName={orderData.ownerName}
        />
      )}
      {step === 2 && (
        <Step2_SizeSelection
          onNext={nextStep}
          onPrev={prevStep}
          onUpdateData={updateOrderData}
          currentSize={orderData.stoneSize}
          products={products}
        />
      )}
      {step === 3 && (
        <Step3_InteractiveCanvas
          onNext={nextStep}
          onPrev={prevStep}
          onUpdateData={updateOrderData}
          orderData={orderData}
          products={products}
        />
      )}
      {step === 4 && (
        <Step4_CheckoutSummary
          onPrev={prevStep}
          orderData={orderData}
        />
      )}
      {step === 5 && (
        <Step5_Success
          orderData={orderData}
          lineProfile={lineProfile}
        />
      )}
    </div>
  )
}

export default App
