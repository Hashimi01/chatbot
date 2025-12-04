import React from 'react';
import styles from './RogerAvatar.module.css';

interface RogerAvatarProps {
  size?: number;
  className?: string;
}

export const RogerAvatar: React.FC<RogerAvatarProps> = ({ 
  size = 80, 
  className = '' 
}) => {
  return (
    <div 
      className={`${styles.avatarContainer} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Low-quality webcam effect */}
      <div className={styles.webcamFrame}>
        <div className={styles.webcamImage}>
          {/* Placeholder for Roger's face - low resolution effect */}
          <div className={styles.face}>
            <div className={styles.mustache}></div>
            <div className={styles.glasses}>
              <div className={styles.lens}></div>
              <div className={styles.lens}></div>
            </div>
            <div className={styles.mouth}></div>
          </div>
        </div>
        {/* Webcam noise overlay */}
        <div className={styles.noiseOverlay}></div>
        {/* Low resolution scanlines */}
        <div className={styles.scanlines}></div>
      </div>
      {/* Status indicator (always "online" but looks broken) */}
      <div className={styles.statusIndicator}>
        <span className={styles.statusDot}></span>
        <span className={styles.statusText}>EN LIGNE (PEUT-ÊTRE)</span>
      </div>
    </div>
  );
};


