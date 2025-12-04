import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RogerAvatar } from '@/components/roger/RogerAvatar';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>Tonton Roger - Le Bot Boomer</title>
        <meta name="description" content="Un peu plus rapide que le fax, et plus intelligent que la machine à écrire." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoText}>TONTON ROGER</span>
            <span className={styles.logoSubtext}>Le Bot Boomer</span>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.hero}>
            <div className={styles.avatarSection}>
              <RogerAvatar size={200} />
            </div>
            
            <h1 className={styles.title}>
              BONJOUR !!! C'EST ROGER ICI !!!!!
            </h1>
            
            <p className={styles.subtitle}>
              "Un peu plus rapide que le fax, et plus intelligent que la machine à écrire."
            </p>
            
            <p className={styles.description}>
              Je suis Roger, votre assistant technique préféré depuis 1998 !!!
              <br />
              J'utilise Windows 95 et je déteste "Le Cloud" (je pense que ce sont de vrais nuages).
            </p>

            <button
              onClick={() => router.push('/roger')}
              className={styles.startButton}
            >
              🚀 COMMENCER LA CONVERSATION
            </button>
          </div>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <h3 className={styles.featureTitle}>CHAT AVEC ROGER</h3>
              <p className={styles.featureText}>
                Parlez avec Roger et découvrez ses conseils techniques... ou pas !!!!!
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📞</div>
              <h3 className={styles.featureTitle}>APPELS VIDÉO</h3>
              <p className={styles.featureText}>
                Roger peut vous appeler en vidéo à tout moment (attention, il ne sait pas utiliser la caméra !)
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎨</div>
              <h3 className={styles.featureTitle}>WINDOWS 95</h3>
              <p className={styles.featureText}>
                Interface authentique Windows 95 pour une expérience nostalgique !!!!!
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerText}>
            © 2025 TONTON ROGER - Bises, Roger :-) !!!!!
          </p>
        </footer>
      </div>
    </div>
  );
}
