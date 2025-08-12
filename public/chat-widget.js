// Embeddable Chat Widget Script
(function() {
  'use strict';

  // Default configuration
  const defaultConfig = {
    apiUrl: 'wss://uatchatbotv2.altius.cc/ws',
    theme: 'medical',
    position: 'bottom-right',
    primaryColor: '#2563eb',
    secondaryColor: '#0d9488'
  };

  // Widget HTML template
  const widgetHTML = `
    <div id="hospital-chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Chat Button -->
      <div id="chat-button" style="background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%); border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; transform: scale(1);">
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        <div style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; animation: bounce 2s infinite;">!</div>
      </div>

      <!-- Chat Window (initially hidden) -->
      <div id="chat-window" style="display: none; background: white; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); width: 384px; height: 500px; position: absolute; bottom: 80px; right: 0; flex-direction: column; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%); color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: rgba(255,255,255,0.2); border-radius: 50%; padding: 8px;">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 600; font-size: 16px;">Surya Hospitals</div>
              <div style="font-size: 12px; opacity: 0.9;">🟢 Online</div>
            </div>
          </div>
          <button id="close-chat" style="background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s;">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div id="messages-area" style="flex: 1; overflow-y: auto; padding: 16px; background: #f9fafb;">
          <div style="text-align: center; padding: 20px; color: #6b7280;">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 16px;">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            <div>Starting conversation...</div>
          </div>
        </div>

        <!-- Input Area -->
        <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; gap: 8px;">
            <input id="message-input" type="text" placeholder="Type your message..." style="flex: 1; border: 1px solid #d1d5db; border-radius: 24px; padding: 8px 16px; outline: none; font-size: 14px;">
            <button id="send-button" style="background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0,-8px,0); }
        70% { transform: translate3d(0,-4px,0); }
        90% { transform: translate3d(0,-2px,0); }
      }
      
      #hospital-chat-widget #chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
      
      #hospital-chat-widget #close-chat:hover {
        background-color: rgba(255,255,255,0.3) !important;
      }
      
      #hospital-chat-widget #send-button:hover {
        transform: scale(1.05);
      }
      
      #hospital-chat-widget #message-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
    </style>
  `;

  // Widget functionality
  function initializeWidget(config = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    
    // Inject widget HTML
    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = widgetHTML;
    document.body.appendChild(widgetContainer);
    
    // Get elements
    const chatButton = document.getElementById('chat-button');
    const chatWindow = document.getElementById('chat-window');
    const closeButton = document.getElementById('close-chat');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messagesArea = document.getElementById('messages-area');
    
    let isOpen = false;
    let messages = [];
    let ws = null;
    let isConnected = false;
    let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Event listeners
    chatButton.addEventListener('click', openChat);
    closeButton.addEventListener('click', closeChat);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    function connectToChainlit() {
      try {
        ws = new WebSocket('wss://uatchatbotv2.altius.cc/ws');
        
        ws.onopen = function() {
          console.log('Connected to Chainlit backend');
          isConnected = true;
          
          // Send initial connection message
          ws.send(JSON.stringify({
            type: 'connection_init',
            sessionId: sessionId
          }));
        };
        
        ws.onmessage = function(event) {
          try {
            const data = JSON.parse(event.data);
            handleChainlitMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = function(event) {
          console.log('WebSocket connection closed:', event);
          isConnected = false;
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (isOpen && !isConnected) {
              connectToChainlit();
            }
          }, 3000);
        };
        
        ws.onerror = function(error) {
          console.error('WebSocket error:', error);
          isConnected = false;
        };
        
      } catch (error) {
        console.error('Failed to connect to Chainlit:', error);
        isConnected = false;
      }
    }
    
    function handleChainlitMessage(data) {
      if (data.type === 'message' && data.content) {
        addMessage({
          content: data.content,
          isUser: false,
          actions: data.actions
        });
      } else if (data.type === 'action_response' && data.content) {
        addMessage({
          content: data.content,
          isUser: false,
          actions: data.actions
        });
      }
    }
    
    function openChat() {
      isOpen = true;
      chatButton.style.display = 'none';
      chatWindow.style.display = 'flex';
      
      // Connect to Chainlit when chat opens
      if (!isConnected) {
        connectToChainlit();
      }
    }
    
    function closeChat() {
      isOpen = false;
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
    }
    
    function sendMessage() {
      const message = messageInput.value.trim();
      if (!message || !isConnected || !ws) return;
      
      addMessage({ content: message, isUser: true });
      messageInput.value = '';
      
      // Send message to Chainlit backend
      try {
        ws.send(JSON.stringify({
          type: 'message',
          content: message,
          sessionId: sessionId
        }));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
    
    function addMessage(message) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        display: flex;
        justify-content: ${message.isUser ? 'flex-end' : 'flex-start'};
        margin-bottom: 16px;
      `;
      
      const bubble = document.createElement('div');
      bubble.style.cssText = `
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
        ${message.isUser 
          ? 'background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%); color: white;'
          : 'background: white; color: #1f2937; border: 1px solid #e5e7eb;'
        }
      `;
      
      bubble.innerHTML = message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      
      if (message.actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'margin-top: 12px;';
        
        message.actions.forEach(action => {
          const actionButton = document.createElement('button');
          actionButton.textContent = action.label;
          actionButton.style.cssText = `
            display: block;
            width: 100%;
            text-align: left;
            background: #eff6ff;
            border: 1px solid #dbeafe;
            color: #1e40af;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.2s;
          `;
          
          actionButton.addEventListener('mouseenter', () => {
            actionButton.style.backgroundColor = '#dbeafe';
          });
          
          actionButton.addEventListener('mouseleave', () => {
            actionButton.style.backgroundColor = '#eff6ff';
          });
          
          actionButton.addEventListener('click', () => {
            if (ws && isConnected) {
              // Add user message showing the action was clicked
              addMessage({ content: action.label, isUser: true });
              
              // Send action to Chainlit backend
              try {
                ws.send(JSON.stringify({
                  type: 'action_callback',
                  name: action.name,
                  payload: action.payload,
                  sessionId: sessionId
                }));
              } catch (error) {
                console.error('Error sending action:', error);
              }
            }
          });
          
          actionsDiv.appendChild(actionButton);
        });
        
        bubble.appendChild(actionsDiv);
      }
      
      messageDiv.appendChild(bubble);
      messagesArea.appendChild(messageDiv);
      messagesArea.scrollTop = messagesArea.scrollHeight;
      
      // Remove loading message if it exists
      const loading = messagesArea.querySelector('[data-loading]');
      if (loading) loading.remove();
    }
    
  }
  
  // Expose global API
  window.HospitalChatWidget = {
    init: initializeWidget
  };
  
  // Auto-initialize if no explicit init call
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (!window.HospitalChatWidget._initialized) {
          initializeWidget();
        }
      }, 1000);
    });
  } else {
    setTimeout(() => {
      if (!window.HospitalChatWidget._initialized) {
        initializeWidget();
      }
    }, 1000);
  }
})();