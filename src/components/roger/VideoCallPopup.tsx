import React, { useState, useEffect, useRef } from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styles from './VideoCallPopup.module.css';

interface VideoCallPopupProps {
  onClose: () => void;
  onAccept?: () => void;
}

export const VideoCallPopup: React.FC<VideoCallPopupProps> = ({ 
  onClose, 
  onAccept 
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show video after a short delay
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setShowVideo(true);
    setAudioEnabled(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
    if (onAccept) {
      onAccept();
    }
  };

  const handleReject = () => {
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <Window className={styles.window}>
        <WindowHeader className={styles.header}>
          <span>📞 APPEL VIDÉO - ROGER</span>
        </WindowHeader>
        <WindowContent className={styles.content}>
          {!showVideo ? (
            <div className={styles.callScreen}>
              <div className={styles.callerInfo}>
                <div className={styles.callerName}>ROGER APPELLE...</div>
                <div className={styles.callerStatus}>
                  <span className={styles.ringing}>🔔</span>
                  <span>Sonnerie...</span>
                </div>
              </div>
              <div className={styles.buttons}>
                <Button 
                  onClick={handleAccept}
                  className={styles.acceptButton}
                >
                  ✓ ACCEPTER
                </Button>
                <Button 
                  onClick={handleReject}
                  className={styles.rejectButton}
                >
                  ✗ REFUSER
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.videoContainer}>
              <video
                ref={videoRef}
                className={styles.video}
                autoPlay
                loop
                muted={!audioEnabled}
                playsInline
              >
                {/* Placeholder video - in production, use actual video file */}
                <source src="/videos/roger-video-call.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo.
              </video>
              <div className={styles.videoOverlay}>
                <div className={styles.videoText}>
                  ALLÔ ???? VOUS ME VOYEZ ????
                  <br />
                  L'ÉCRAN EST NOIR CHEZ MOI !!!
                  <br />
                  ON A COUPÉ L'ÉLECTRICITÉ ???
                </div>
              </div>
              <Button 
                onClick={onClose}
                className={styles.closeButton}
              >
                FERMER
              </Button>
            </div>
          )}
        </WindowContent>
      </Window>
    </div>
  );
};

