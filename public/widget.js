class AgentWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.initChatbot();
  }

  // --- Read attributes from HTML tag ---
  get config() {
    return {
      apiUrl: this.getAttribute("api_url") || "https://agent-api-huh9hqfcg4fjgwfk.eastasia-01.azurewebsites.net/chat",
      historyUrl: this.getAttribute("history_url") || "http://localhost:4001/chat/history",
      company_uuid: this.getAttribute("company_uuid"),
      type: this.getAttribute("type") || "customer_agent",
      primaryColor: this.getAttribute("primary_color") || "#6b7280",
      secondaryColor: this.getAttribute("secondary_color") || "#4b5563",
      logoUrl: this.getAttribute("logo_url") || "data:image/png;base64,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",
      companyName: this.getAttribute("company_name") || "Agent AI",
      position: this.getAttribute("position") || "bottom-right",
    };
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .chat-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 28px;
        }

        .chat-btn.hidden {
          opacity: 0;
          transform: scale(0.8);
          pointer-events: none;
        }

        .chat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(107, 114, 128, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .chat-btn.hidden:hover {
          transform: scale(0.8);
        }

        .chat-btn:active {
          transform: translateY(0);
        }

        .window {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 420px;
          max-width: calc(100vw - 48px);
          height: 600px;
          max-height: calc(100vh - 48px);
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .window.open {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
          color: #1f2937;
          padding: 20px 24px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          min-height: 76px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0;
          flex: 1;
          height: 100%;
        }

        .logo-container {
          height: 100%;
          max-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .logo-container img {
          max-width: 100%;
          max-height: 100%;
          height: auto;
          width: auto;
          object-fit: contain;
        }

        .logo-placeholder {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-placeholder svg {
          color: #6b7280;
        }

        .company-name {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #1f2937;
        }

        .status-text {
          font-size: 11px;
          font-weight: 400;
          opacity: 0.75;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 12px;
          color: #4b5563;
        }

        .status-indicator {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .close-btn {
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
          font-size: 24px;
          font-weight: 400;
          flex-shrink: 0;
          color: #6b7280;
          background: rgba(107, 114, 128, 0.08);
          border: 1px solid rgba(107, 114, 128, 0.15);
        }

        .close-btn:hover {
          background: rgba(107, 114, 128, 0.15);
          color: #4b5563;
          transform: rotate(90deg);
        }

        .close-btn:active {
          transform: rotate(90deg) scale(0.95);
        }

        .messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f9fafb;
        }

        .messages::-webkit-scrollbar {
          width: 6px;
        }

        .messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .messages::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .message-wrapper {
          margin: 12px 0;
          display: flex;
          animation: messageSlide 0.3s ease-out;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-bubble {
          padding: 12px 16px;
          max-width: 75%;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          position: relative;
        }

        .message-wrapper.user .message-bubble {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
        }

        .message-wrapper.bot .message-bubble {
          background: #ffffff;
          color: #1f2937;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .input-area {
          display: flex;
          padding: 16px 20px;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .input-wrapper {
          flex: 1;
          position: relative;
        }

        .input-area input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          font-size: 14px;
          transition: all 0.2s;
          background: #f9fafb;
          outline: none;
          color: #1f2937;
        }

        .input-area input:focus {
          border-color: #6b7280;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
        }

        .input-area input::placeholder {
          color: #9ca3af;
        }

        .input-area input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .send-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }

        .send-button:active {
          transform: translateY(0);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .chat-btn {
            bottom: 16px;
            right: 16px;
            width: 56px;
            height: 56px;
          }

          .window {
            right: 0;
            bottom: 0;
            width: 100vw;
            max-width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }

          .messages {
            padding: 16px;
          }

          .message-bubble {
            max-width: 85%;
          }

          .header {
            padding: 16px 20px;
            min-height: 64px;
          }

          .logo-container {
            max-height: 40px;
          }
        }

        @media (max-width: 360px) {
          .header {
            padding: 14px 16px;
            font-size: 14px;
            min-height: 56px;
          }

          .logo-container {
            max-height: 36px;
          }

          .input-area {
            padding: 12px 16px;
          }
        }
      </style>

      <div class="chat-btn">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>

      <div class="window">
        <div class="header">
          <div class="header-content">
            <div class="logo-container">
              <img src="" alt="Logo" class="logo-img" style="display: none;" />
              <div class="logo-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div class="company-name">Agent AI</div>
              </div>
            </div>           
          </div>
          <div class="close-btn">×</div>
        </div>

        <div class="messages"></div>

        <div class="input-area">
          <div class="input-wrapper">
            <input type="text" placeholder="Type your message..." />
          </div>
          <button class="send-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  initChatbot() {
    const { apiUrl, company_uuid, type, primaryColor, secondaryColor, logoUrl, companyName } = this.config;

    const root = this.shadowRoot;
    const btn = root.querySelector(".chat-btn");
    const win = root.querySelector(".window");
    const messages = root.querySelector(".messages");
    const input = root.querySelector("input");
    const sendBtn = root.querySelector(".send-button");
    const closeBtn = root.querySelector(".close-btn");
    const logoImg = root.querySelector(".logo-img");
    const logoPlaceholder = root.querySelector(".logo-placeholder");
    const companyNameEl = root.querySelector(".company-name");

    // Set company name
    companyNameEl.textContent = companyName;

    // Handle logo
    if (logoUrl) {
      logoImg.src = logoUrl;
      logoImg.style.display = "block";
      logoPlaceholder.style.display = "none";
      
      logoImg.onerror = () => {
        logoImg.style.display = "none";
        logoPlaceholder.style.display = "flex";
      };
    }

    // Color customization
    btn.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    sendBtn.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

    function addMessage(role, content) {
      const wrapper = document.createElement("div");
      wrapper.className = `message-wrapper ${role}`;
      
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      bubble.textContent = content;
      
      if (role === "user") {
        bubble.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
      }
      
      wrapper.appendChild(bubble);
      messages.appendChild(wrapper);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTypingIndicator() {
      const wrapper = document.createElement("div");
      wrapper.className = "message-wrapper bot typing-wrapper";
      wrapper.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      messages.appendChild(wrapper);
      messages.scrollTop = messages.scrollHeight;
      return wrapper;
    }

    function removeTypingIndicator() {
      const typingWrapper = messages.querySelector(".typing-wrapper");
      if (typingWrapper) {
        typingWrapper.remove();
      }
    }

    btn.onclick = () => {
      win.style.display = "flex";
      win.classList.add("open");
      btn.classList.add("hidden");
    };
    
    closeBtn.onclick = () => {
      win.style.display = "none";
      win.classList.remove("open");
      btn.classList.remove("hidden");
    };

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      
      addMessage("user", text);
      input.value = "";
      
      // Disable input while processing
      input.disabled = true;
      sendBtn.disabled = true;
      
      // Show typing indicator
      const typingIndicator = showTypingIndicator();

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_uuid,
            type,
            message: text,
          }),
        });

        const data = await res.json();
        removeTypingIndicator();
        addMessage("bot", data.answer || "I'm here to help! Please try asking your question again.");
        
      } catch (error) {
        removeTypingIndicator();
        addMessage("bot", "I apologize, but I'm having trouble connecting right now. Please try again in a moment.");
      } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }

    sendBtn.onclick = sendMessage;
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }
}

customElements.define("agent-widget", AgentWidget);