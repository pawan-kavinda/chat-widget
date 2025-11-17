(function () {
  function initChatbot({
    apiUrl = "/chat/send",
    historyUrl = "http://localhost:4001/chat/history",
    company_uuid,
    type = "customer_agent",
    primaryColor = "#10b981",
    secondaryColor = "#059669",
    position = "bottom-right",
  }) {
    // --- Generate persistent sessionId ---
    function getSessionId() {
      let id = sessionStorage.getItem("chatSessionId");
      if (!id) {
        id = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        sessionStorage.setItem("chatSessionId", id);
      }
      return id;
    }

    const sessionId = getSessionId();

    // --- Inject global styles ---
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
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

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
      }

      .chatbot-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
      }

      .chatbot-button:active {
        transform: scale(0.95);
      }

      .chatbot-window {
        animation: slideUp 0.3s ease-out;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .chatbot-message {
        animation: slideUp 0.2s ease-out;
        word-wrap: break-word;
        max-width: 80%;
      }

      .chatbot-input:focus {
        outline: none;
        border-color: #10b981;
      }

      .chatbot-send-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .chatbot-send-btn:active {
        transform: translateY(0);
      }

      .chatbot-spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid #10b981;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        margin-left: 8px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .chatbot-timestamp {
        font-size: 10px;
        color: #999;
        margin-top: 4px;
      }

      .chatbot-close-btn {
        transition: all 0.2s ease;
      }

      .chatbot-close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: rotate(90deg);
      }

      .chatbot-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .chatbot-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .chatbot-scrollbar::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      .chatbot-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
    document.head.appendChild(styleSheet);

    // --- Position calculation ---
    const positions = {
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" },
    };
    const pos = positions[position] || positions["bottom-right"];

    // --- Create floating chat button ---
    const chatButton = document.createElement("div");
    chatButton.className = "chatbot-button";
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    Object.assign(chatButton.style, {
      position: "fixed",
      ...pos,
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`,
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      zIndex: "9999",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      border: "none",
    });
    document.body.appendChild(chatButton);

    // --- Create chat window ---
    const chatWindow = document.createElement("div");
    chatWindow.className = "chatbot-window";
    const windowPos = position.includes("right") ? { right: "20px" } : { left: "20px" };
    const windowBottom = position.includes("bottom") ? { bottom: "90px" } : { top: "90px" };
    
    Object.assign(chatWindow.style, {
      position: "fixed",
      ...windowPos,
      ...windowBottom,
      width: "380px",
      maxWidth: "calc(100vw - 40px)",
      height: "600px",
      maxHeight: "calc(100vh - 120px)",
      background: "#fff",
      border: "none",
      borderRadius: "16px",
      display: "none",
      flexDirection: "column",
      zIndex: "9998",
      overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    });

    // --- Header ---
    const header = document.createElement("div");
    Object.assign(header.style, {
      /* Force a green gradient for the header to avoid orange backgrounds */
      background: "linear-gradient(135deg, #059669, #10b981)",
      color: "#fff",
      padding: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    });

    const headerTitle = document.createElement("div");
    headerTitle.innerHTML = `
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">🤖</span>
        AgentAI
      </div>
      <div style="font-size: 12px; opacity: 0.9;">Intelligent assistance, instantly</div>
    `;
    header.appendChild(headerTitle);

    const closeBtn = document.createElement("button");
    closeBtn.className = "chatbot-close-btn";
    closeBtn.innerHTML = "✕";
    Object.assign(closeBtn.style, {
      background: "transparent",
      border: "none",
      color: "#fff",
      fontSize: "24px",
      cursor: "pointer",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    header.appendChild(closeBtn);
    chatWindow.appendChild(header);

    // --- Messages area ---
    const messages = document.createElement("div");
    messages.className = "chatbot-scrollbar";
    Object.assign(messages.style, {
      flex: "1",
      padding: "20px",
      overflowY: "auto",
      background: "#f8f9fa",
    });
    chatWindow.appendChild(messages);

    // --- Typing indicator ---
    const typingIndicator = document.createElement("div");
    Object.assign(typingIndicator.style, {
      display: "none",
      padding: "12px 16px",
      background: "#e9ecef",
      borderRadius: "18px",
      marginBottom: "12px",
      width: "fit-content",
    });
    typingIndicator.innerHTML = `
      <span style="display: inline-block; width: 8px; height: 8px; background: #6c757d; border-radius: 50%; margin: 0 2px; animation: pulse 1.4s infinite ease-in-out;"></span>
      <span style="display: inline-block; width: 8px; height: 8px; background: #6c757d; border-radius: 50%; margin: 0 2px; animation: pulse 1.4s infinite ease-in-out 0.2s;"></span>
      <span style="display: inline-block; width: 8px; height: 8px; background: #6c757d; border-radius: 50%; margin: 0 2px; animation: pulse 1.4s infinite ease-in-out 0.4s;"></span>
    `;

    // --- Input area ---
    const inputContainer = document.createElement("div");
    Object.assign(inputContainer.style, {
      display: "flex",
      padding: "16px",
      borderTop: "1px solid #e9ecef",
      background: "#fff",
      gap: "8px",
    });

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type your message...";
    input.className = "chatbot-input";
    Object.assign(input.style, {
      flex: "1",
      border: "2px solid #e9ecef",
      padding: "12px 16px",
      borderRadius: "24px",
      fontSize: "14px",
      transition: "border-color 0.3s ease",
    });
    inputContainer.appendChild(input);

    const sendBtn = document.createElement("button");
    sendBtn.className = "chatbot-send-btn";
    sendBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;
    Object.assign(sendBtn.style, {
      border: "none",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      flexShrink: "0",
      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
    });
    inputContainer.appendChild(sendBtn);

    chatWindow.appendChild(inputContainer);
    document.body.appendChild(chatWindow);

    // --- Helper: Add message to UI ---
    function addMessage(role, content, timestamp = new Date()) {
      const msgWrapper = document.createElement("div");
      Object.assign(msgWrapper.style, {
        display: "flex",
        justifyContent: role === "user" ? "flex-end" : "flex-start",
        marginBottom: "16px",
      });

      const msgDiv = document.createElement("div");
      msgDiv.className = "chatbot-message";
      msgDiv.textContent = content;
      Object.assign(msgDiv.style, {
        padding: "12px 16px",
        borderRadius: role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: role === "user" ? primaryColor : "#fff",
        color: role === "user" ? "#fff" : "#333",
        fontSize: "14px",
        lineHeight: "1.5",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      });

      const timeDiv = document.createElement("div");
      timeDiv.className = "chatbot-timestamp";
      timeDiv.textContent = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timeDiv.style.textAlign = role === "user" ? "right" : "left";

      const container = document.createElement("div");
      container.appendChild(msgDiv);
      container.appendChild(timeDiv);
      msgWrapper.appendChild(container);
      
      messages.appendChild(msgWrapper);
      messages.scrollTop = messages.scrollHeight;
    }

    // --- Helper: Adjust color brightness ---
    function adjustColor(color, amount) {
      const clamp = (val) => Math.min(255, Math.max(0, val));
      const num = parseInt(color.replace("#", ""), 16);
      const r = clamp((num >> 16) + amount);
      const g = clamp(((num >> 8) & 0x00ff) + amount);
      const b = clamp((num & 0x0000ff) + amount);
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    // --- Toggle chat window & load history ---
    let isOpen = false;
    let historyLoaded = false;

    async function toggleChat() {
      isOpen = !isOpen;
      chatWindow.style.display = isOpen ? "flex" : "none";
      
      if (isOpen && !historyLoaded) {
        try {
          const historyResp = await fetch(`${historyUrl}?sessionId=${sessionId}`);
          const history = await historyResp.json();

          messages.innerHTML = "";
          if (history && history.length > 0) {
            history.forEach((msg) => {
              addMessage(msg.role, msg.content, new Date(msg.timestamp || Date.now()));
            });
          } else {
            addMessage("bot", "Hello! How can I assist you today?", new Date());
          }
          historyLoaded = true;
        } catch (err) {
          console.error("Failed to load history:", err);
          addMessage("bot", "Hello! How can I assist you today?", new Date());
        }
      }
      
      if (isOpen) {
        input.focus();
      }
    }

    chatButton.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", toggleChat);

    // --- Send message ---
    async function sendMessage() {
      const userMessage = input.value.trim();
      if (!userMessage) return;

      addMessage("user", userMessage);
      input.value = "";
      sendBtn.disabled = true;
      input.disabled = true;

      messages.appendChild(typingIndicator);
      typingIndicator.style.display = "block";
      messages.scrollTop = messages.scrollHeight;

      try {
        const payload = {
          type: type,
          sessionId: sessionId,
          company_uuid: company_uuid,
          message: userMessage,
        };
        
        if (type === "customer_agent") {
          payload.top_k = 5;
        }

        const response = await fetch("http://localhost:4001/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        typingIndicator.style.display = "none";
        
        addMessage("bot", data.answer || "I'm sorry, I couldn't process that request.");
      } catch (err) {
        console.error("Chatbot API error:", err);
        typingIndicator.style.display = "none";
        addMessage("bot", "⚠️ Unable to connect to the server. Please try again later.");
      } finally {
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
      }
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  window.ChatbotWidget = { init: initChatbot };
})();