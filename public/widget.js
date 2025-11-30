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
      apiUrl: this.getAttribute("api_url") || "/chat/send",
      historyUrl: this.getAttribute("history_url") || "http://localhost:4001/chat/history",
      company_uuid: this.getAttribute("company_uuid"),
      type: this.getAttribute("type") || "customer_agent",
      primaryColor: this.getAttribute("primary_color") || "#10b981",
      secondaryColor: this.getAttribute("secondary_color") || "#059669",
      position: this.getAttribute("position") || "bottom-right",
    };
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .chat-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #10b981;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
        }
        .window {
          position: fixed;
          right: 20px;
          bottom: 100px;
          width: 360px;
          height: 520px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
        }
        .header {
          background: #10b981;
          color: #fff;
          padding: 16px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f8f9fa;
        }
        .input-area {
          display: flex;
          padding: 12px;
          gap: 8px;
          border-top: 1px solid #ddd;
        }
        .input-area input {
          flex: 1;
          padding: 10px;
          border-radius: 20px;
          border: 1px solid #ddd;
        }
        .input-area button {
          background: #10b981;
          border: none;
          color: #fff;
          border-radius: 20px;
          padding: 10px 16px;
          cursor: pointer;
        }
      </style>

      <div class="chat-btn">💬</div>

      <div class="window">
        <div class="header">
          Agent AI
          <span class="close-btn" style="cursor:pointer;">✕</span>
        </div>

        <div class="messages"></div>

        <div class="input-area">
          <input type="text" placeholder="Type message..." />
          <button>Send</button>
        </div>
      </div>
    `;
  }

  initChatbot() {
    const { apiUrl, company_uuid, type, primaryColor } = this.config;

    const root = this.shadowRoot;
    const btn = root.querySelector(".chat-btn");
    const win = root.querySelector(".window");
    const messages = root.querySelector(".messages");
    const input = root.querySelector("input");
    const sendBtn = root.querySelector("button");
    const closeBtn = root.querySelector(".close-btn");

    // Color customization
    btn.style.background = primaryColor;
    root.querySelector(".header").style.background = primaryColor;
    sendBtn.style.background = primaryColor;

    function addMessage(role, content) {
      const div = document.createElement("div");
      div.style.margin = "10px 0";

      div.innerHTML = `
        <div style="
          padding:10px 14px;
          background: ${role === "user" ? primaryColor : "#fff"};
          color: ${role === "user" ? "#fff" : "#000"};
          width: fit-content;
          border-radius: 16px;
        ">
          ${content}
        </div>
      `;

      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    btn.onclick = () => (win.style.display = "flex");
    closeBtn.onclick = () => (win.style.display = "none");

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addMessage("user", text);
      input.value = "";

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
      addMessage("bot", data.answer || "No response");
    }

    sendBtn.onclick = sendMessage;
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }
}

customElements.define("agent-widget", AgentWidget);
