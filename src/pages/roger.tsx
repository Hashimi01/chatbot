import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WelcomeScreen } from '@/components/roger/WelcomeScreen';
import { RogerChat } from '@/components/roger/RogerChat';
import { RogerAudioManager } from '@/lib/audio/RogerAudioManager';
import styles from '@/styles/Roger.module.css';

export default function RogerPage() {
  const [started, setStarted] = useState(false);
  const audioManager = RogerAudioManager.getInstance();

  const handleStart = () => {
    // Unlock audio context
    audioManager.unlockAudio();
    setStarted(true);
  };

  return (
    <>
      <Head>
        <title>Tonton Roger - The Boomer Bot</title>
        <meta name="description" content="Un peu plus rapide qu'un fax, plus intelligent qu'une machine à écrire." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Windows 95 style fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
        {/* MS Sans Serif alternative */}
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={styles.pageContainer}>
        {!started ? (
          <WelcomeScreen onStart={handleStart} />
        ) : (
          <RogerChat />
        )}
      </div>
    </>
  );
}


