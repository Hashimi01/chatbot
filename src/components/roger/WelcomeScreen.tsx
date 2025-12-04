import React from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import { RogerAvatar } from './RogerAvatar';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className={styles.container}>
      <Window className={styles.window}>
        <WindowHeader className={styles.header}>
          <span>👋 BIENVENUE - TONTON ROGER</span>
        </WindowHeader>
        <WindowContent className={styles.content}>
          <div className={styles.welcomeContent}>
            <div className={styles.avatarSection}>
              <RogerAvatar size={120} />
            </div>
            <div className={styles.textSection}>
              <h1 className={styles.title}>
                BONJOUR !!! C'EST ROGER !!!!!
              </h1>
              <p className={styles.subtitle}>
                "Un peu plus rapide qu'un fax, plus intelligent qu'une machine à écrire."
              </p>
              <div className={styles.description}>
                <p>
                  Je suis Roger, votre assistant technique préféré depuis 1998 !!!
                </p>
                <p>
                  J'utilise Windows 95 et je déteste "Le Cloud" (je pense que ce sont de vrais nuages).
                </p>
                <p>
                  Cliquez sur le bouton ci-dessous pour commencer à chatter avec moi !!!!!
                </p>
              </div>
              <Button
                onClick={onStart}
                className={styles.startButton}
                size="lg"
              >
                🚀 COMMENCER LA CONVERSATION
              </Button>
            </div>
          </div>
        </WindowContent>
      </Window>
    </div>
  );
};


