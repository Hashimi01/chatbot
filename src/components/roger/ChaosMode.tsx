import React, { useEffect, useRef, useState } from 'react';

interface ChaosModeProps {
  children: React.ReactNode;
  onChaosTrigger?: () => void;
}

export const ChaosMode: React.FC<ChaosModeProps> = ({
  children,
  onChaosTrigger
}) => {
  const [chaosActive, setChaosActive] = useState(false);
  const [showError, setShowError] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Chaos mode disabled - button will stay in place
    // 10% chance of chaos on any interaction
    // const chaosChance = Math.random();
    // if (chaosChance < 0.1) {
    //   setChaosActive(true);
    //   if (onChaosTrigger) {
    //     onChaosTrigger();
    //   }
    // }
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (chaosActive && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;

      button.style.position = 'fixed';
      button.style.left = `${newX}px`;
      button.style.top = `${newY}px`;
      button.style.zIndex = '9999';
      button.style.transition = 'all 0.1s ease-out';
    }
  };

  const handleClick = () => {
    // 10% chance to show fake error
    if (Math.random() < 0.1) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const childElement = React.Children.only(children) as React.ReactElement;

  return (
    <>
      {showError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#c0c0c0',
          border: '3px solid #000',
          padding: '20px',
          zIndex: 10000,
          fontFamily: 'MS Sans Serif, sans-serif',
          boxShadow: '4px 4px 0 #000',
        }}>
          <div style={{
            background: '#ff0000',
            color: '#fff',
            padding: '10px',
            marginBottom: '10px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            ERREUR SYSTÈME
          </div>
          <div style={{ fontSize: '12px', marginBottom: '15px' }}>
            Le fichier SYSTEM32 est introuvable.
            <br />
            Veuillez réinstaller Windows 95.
          </div>
          <button
            onClick={() => setShowError(false)}
            style={{
              background: '#c0c0c0',
              border: '2px outset #c0c0c0',
              padding: '5px 15px',
              cursor: 'pointer',
              fontFamily: 'MS Sans Serif, sans-serif',
            }}
          >
            OK
          </button>
        </div>
      )}
      {React.cloneElement(childElement, {
        ref: buttonRef,
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter(e as React.MouseEvent<HTMLButtonElement>);
          if (childElement.props.onMouseEnter) {
            childElement.props.onMouseEnter(e);
          }
        },
        onClick: (e: React.MouseEvent) => {
          handleClick();
          if (childElement.props.onClick) {
            childElement.props.onClick(e);
          }
        },
      })}
    </>
  );
};

export const useChaosMode = () => {
  const [showLoading, setShowLoading] = useState(false);

  const triggerFakeLoading = () => {
    if (Math.random() < 0.15) {
      setShowLoading(true);
      setTimeout(() => {
        setShowLoading(false);
      }, 2000);
    }
  };

  return { showLoading, triggerFakeLoading };
};

