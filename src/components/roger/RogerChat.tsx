import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Window, WindowHeader, WindowContent, Button, TextInput } from 'react95';
import { RogerAvatar } from './RogerAvatar';
import { VideoCallPopup } from './VideoCallPopup';
import { ChaosMode } from './ChaosMode';
import { RogerAudioManager } from '@/lib/audio/RogerAudioManager';
import styles from './RogerChat.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'roger';
  timestamp: Date;
  isTyping?: boolean;
}

export const RogerChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'BONJOUR !!! C\'EST ROGER ICI !!!!!',
      sender: 'roger',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioManager = RogerAudioManager.getInstance();

  // Random video call trigger (5% chance after each Roger message)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'roger' && Math.random() < 0.05) {
      const timer = setTimeout(() => {
        setShowVideoCall(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const scrollToBottom = useCallback((smooth: boolean = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Always use instant scroll for better performance during typing
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Only scroll when user sends a new message, not during Roger's typing
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Only auto-scroll if it's a new user message or a completed Roger message (not typing)
    if (lastMessage && !lastMessage.isTyping && lastMessage.sender === 'user') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
    }
  }, [messages, scrollToBottom]);

  const addTypo = (text: string): string => {
    const typos: { [key: string]: string } = {
      'GOOGLE': 'GOGLE',
      'INTERNET': "L'INTERNETTE",
      'EMAIL': 'COURRIEL',
      'COMPUTER': 'ORDINATEUR',
      'SOFTWARE': 'LOGICIEL',
      'DOWNLOAD': 'TÉLÉCHARGER',
    };

    let result = text;
    Object.entries(typos).forEach(([correct, typo]) => {
      if (Math.random() < 0.3) {
        result = result.replace(new RegExp(correct, 'gi'), typo);
      }
    });

    // Random character swaps
    if (Math.random() < 0.2 && result.length > 5) {
      const chars = result.split('');
      const i = Math.floor(Math.random() * (chars.length - 1));
      [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
      result = chars.join('');
    }

    return result;
  };

  const typewriterEffect = useCallback((text: string, onComplete: () => void) => {
    let currentIndex = 0;
    const displayText: string[] = [];
    
    audioManager.playTypingSequence(5000);

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        displayText.push(text[currentIndex]);
        currentIndex++;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'roger' && lastMessage.isTyping) {
            // Don't apply addTypo during typing - just show the text as is
            lastMessage.text = displayText.join('');
          }
          return newMessages;
        });
        
        // No auto-scroll during typing - let user control scrolling
      } else {
        clearInterval(typeInterval);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'roger' && lastMessage.isTyping) {
            lastMessage.isTyping = false;
            // Apply typos only to the final version
            lastMessage.text = addTypo(text);
          }
          return newMessages;
        });
        // No auto-scroll - let user control scrolling
        onComplete();
      }
    }, 80); // Slow typing speed
  }, [audioManager, scrollToBottom]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Scroll to bottom when user sends a message
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    });

    // Add to conversation history
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: inputValue },
    ];

    try {
      const response = await fetch('/api/roger/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: newHistory,
        }),
      });

      const data = await response.json();
      const rogerText = data.response || 'ERREUR !!! LE MODEM 56K A PLANTÉ !!!!!';

      // Simulate slow typing
      const typingDelay = 5000; // 5 seconds
      
      const rogerMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'roger',
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, rogerMessage]);

      // Play ICQ sound
      audioManager.playICQ();

      // Start typewriter effect after delay
      setTimeout(() => {
        typewriterEffect(rogerText, () => {
          setIsTyping(false);
          setConversationHistory([
            ...newHistory,
            { role: 'assistant', content: rogerText },
          ]);
        });
      }, typingDelay);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ERREUR !!! LE SERVEUR A PLANTÉ !!!! AVEZ-VOUS ESSAYÉ DE REDÉMARRER LE MODEM 56K ?????',
        sender: 'roger',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <Window className={styles.window}>
        <WindowHeader className={styles.header}>
          <span>💬 TONTON ROGER - CHAT</span>
        </WindowHeader>
        <WindowContent className={styles.content}>
          <div ref={messagesContainerRef} className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.sender === 'user' ? styles.userMessage : styles.rogerMessage
                }`}
              >
                {message.sender === 'roger' && (
                  <div className={styles.avatarWrapper}>
                    <RogerAvatar size={40} showStatus={false} />
                  </div>
                )}
                <div className={styles.messageBubble}>
                  <div className={styles.messageText}>
                    {message.isTyping ? (
                      <span className={styles.typingIndicator}>
                        {message.text || 'ROGER TAPE...'}
                        <span className={styles.cursor}>|</span>
                      </span>
                    ) : (
                      message.text
                    )}
                  </div>
                  <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && !messages.some(msg => msg.sender === 'roger' && msg.isTyping) && (
              <div className={`${styles.message} ${styles.rogerMessage}`}>
                <div className={styles.avatarWrapper}>
                  <RogerAvatar size={40} showStatus={false} />
                </div>
                <div className={styles.messageBubble}>
                  <div className={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className={styles.inputContainer}>
            <TextInput
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Tapez votre message..."
              className={styles.input}
              disabled={isTyping}
              fullWidth
            />
            <ChaosMode>
              <Button
                onClick={sendMessage}
                disabled={isTyping || !inputValue.trim()}
                className={styles.sendButton}
              >
                ENVOYER
              </Button>
            </ChaosMode>
          </div>
        </WindowContent>
      </Window>

      {showVideoCall && (
        <VideoCallPopup
          onClose={() => setShowVideoCall(false)}
          onAccept={() => {
            audioManager.playICQ();
          }}
        />
      )}
    </div>
  );
};

