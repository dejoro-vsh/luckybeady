import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ currentStep, totalSteps = 4, title }) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-title">CUSTOM BEADS BRACELET</span>
        <span className="progress-step-text">STEP {currentStep} / {totalSteps} - {title}</span>
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
