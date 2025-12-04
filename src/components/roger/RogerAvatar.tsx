import React from 'react';
import styles from './RogerAvatar.module.css';

interface RogerAvatarProps {
  size?: number;
  className?: string;
  showStatus?: boolean;
}

export const RogerAvatar: React.FC<RogerAvatarProps> = ({ 
  size = 80, 
  className = '',
  showStatus = true
}) => {
  return (
    <div 
      className={`${styles.avatarContainer} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Low-quality webcam effect */}
      <div className={styles.webcamFrame}>
        <div className={styles.webcamImage}>
          {/* Roger's profile picture */}
          <img 
            src="/photo.png" 
            alt="Roger" 
            className={styles.profileImage}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {/* Webcam noise overlay */}
        <div className={styles.noiseOverlay}></div>
        {/* Low resolution scanlines */}
        <div className={styles.scanlines}></div>
      </div>
      {/* Status indicator (always "online" but looks broken) */}
      {showStatus && (
        <div className={styles.statusIndicator}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>EN LIGNE (PEUT-ÊTRE)</span>
        </div>
      )}
    </div>
  );
};


