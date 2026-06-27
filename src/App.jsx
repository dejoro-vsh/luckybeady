import { useState } from 'react'
import Step1_WristMeasurement from './pages/Step1_WristMeasurement'
import './styles/global.css'

function App() {
  const [step, setStep] = useState(1)
  const [orderData, setOrderData] = useState({
    wristSize: 0,
    ownerName: '',
    stoneSize: 0,
    braceletConfig: [] // { position, item }
  })

  const updateOrderData = (newData) => {
    setOrderData(prev => ({ ...prev, ...newData }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div className="app-container">
      {step === 1 && (
        <Step1_WristMeasurement 
          onNext={nextStep} 
          onUpdateData={updateOrderData} 
        />
      )}
      {step === 2 && <div>Step 2 Placeholder</div>}
      {step === 3 && <div>Step 3 Placeholder</div>}
      {step === 4 && <div>Step 4 Placeholder</div>}
    </div>
  )
}

export default App
