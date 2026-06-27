import { useState } from 'react'
import Step1_WristMeasurement from './pages/Step1_WristMeasurement'
import Step2_SizeSelection from './pages/Step2_SizeSelection'
import Step3_InteractiveCanvas from './pages/Step3_InteractiveCanvas'
import Step4_CheckoutSummary from './pages/Step4_CheckoutSummary'
import './styles/global.css'

function App() {
  const [step, setStep] = useState(1)
  const [orderData, setOrderData] = useState({
    wristSize: 0,
    ownerName: '',
    stoneSize: 0,
    braceletConfig: [], // array of items
    totalPrice: 0
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
      {step === 2 && (
        <Step2_SizeSelection
          onNext={nextStep}
          onPrev={prevStep}
          onUpdateData={updateOrderData}
          currentSize={orderData.stoneSize}
        />
      )}
      {step === 3 && (
        <Step3_InteractiveCanvas
          onNext={nextStep}
          onPrev={prevStep}
          onUpdateData={updateOrderData}
          orderData={orderData}
        />
      )}
      {step === 4 && (
        <Step4_CheckoutSummary
          onPrev={prevStep}
          orderData={orderData}
        />
      )}
    </div>
  )
}

export default App
