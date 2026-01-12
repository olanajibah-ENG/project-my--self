import React from 'react';
import './PlantFormHeader.css';

const PlantFormHeader: React.FC = () => {
  return (
    <div className="plantform-header" aria-hidden>
      <div className="logo-container">
        <div className="logo-icon" aria-hidden>
          {/* SVG: book + leaf to indicate study + growth */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6C3 5.44772 3.44772 5 4 5H17C18.1046 5 19 5.89543 19 7V18C19 18.5523 18.5523 19 18 19H6C4.89543 19 4 18.1046 4 17V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 8H18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 3C9.6 3 10 3.5 10 4C10 4.5 9.6 5 9 5C8.4 5 8 4.5 8 4C8 3.5 8.4 3 9 3Z" fill="currentColor"/>
            <path d="M14 6.5C14.7 6.5 15.2 6.95 15.2 7.6C15.2 8.25 14.7 8.7 14 8.7C13.3 8.7 12.8 8.25 12.8 7.6C12.8 6.95 13.3 6.5 14 6.5Z" fill="currentColor"/>
          </svg>
        </div>
        <h1 className="logo-text" aria-label="PlantForm">PlantForm</h1>
      </div>
      <p className="logo-tagline">Learning grows here</p>
    </div>
  );
};

export default PlantFormHeader;
