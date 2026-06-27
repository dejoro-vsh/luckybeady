import React from 'react';
import './Header.css';

export default function Header({ subtitle, date }) {
  return (
    <header className="brand-header">
      <div className="header-top">
        <button className="home-icon" aria-label="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
        <div className="brand-logo">
          <h2>LuckyBeady</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
          {date && <p className="date">{date}</p>}
        </div>
        <div className="spacer"></div>
      </div>
    </header>
  );
}
