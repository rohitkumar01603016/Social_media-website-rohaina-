import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import auth from "../auth/auth-help";
import { getSupportAssistantReply } from "../api/api-post";
import NavBar from "./NavBar";

const MAX_SUPPORT_ATTACHMENTS = 3;
const MAX_SUPPORT_FILE_SIZE = 2 * 1024 * 1024;

const starterMessages = [
  {
    role: "assistant",
    text: "Hi, I'm your ROHAINA support assistant. Ask me about stories, unread messages, chat privacy, theme settings, or how features work.",
  },
];

const quickPrompts = [
  "How do stories disappear after 24 hours?",
  "Why do I still see unread messages in chat?",
  "How do I switch between light and dark mode?",
  "Can I lock a chat with a password?",
];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file"));
    reader.readAsDataURL(file);
  });

const SupportAssistantPage = () => {
  const jwt = auth.isAuthenticated();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(starterMessages);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const canSend = useMemo(
    () =>
      Boolean(jwt?.token) &&
      (input.trim().length > 0 || attachments.length > 0) &&
      !loading,
    [attachments.length, input, jwt?.token, loading]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearComposer = () => {
    setInput("");
    setAttachments([]);

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleAttachmentSelection = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_SUPPORT_ATTACHMENTS - attachments.length;

    if (remainingSlots <= 0) {
      toast.info(`You can attach up to ${MAX_SUPPORT_ATTACHMENTS} screenshots.`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1400,
      });
      event.target.value = "";
      return;
    }

    const allowedFiles = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    if (allowedFiles.length !== selectedFiles.length) {
      toast.info("Only image screenshots are supported here right now.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1400,
      });
    }

    const oversizedFile = allowedFiles.find(
      (file) => file.size > MAX_SUPPORT_FILE_SIZE
    );

    if (oversizedFile) {
      toast.error("Each screenshot must be under 2 MB.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1500,
      });
      event.target.value = "";
      return;
    }

    try {
      const nextAttachments = await Promise.all(
        allowedFiles.map(async (file, index) => {
          const dataUrl = await readFileAsDataUrl(file);

          return {
            id: `${file.name}-${file.size}-${Date.now()}-${index}`,
            name: file.name,
            preview: dataUrl,
            mimeType: file.type,
            data:
              typeof dataUrl === "string" && dataUrl.includes(",")
                ? dataUrl.split(",")[1]
                : "",
          };
        })
      );

      setAttachments((currentAttachments) => [
        ...currentAttachments,
        ...nextAttachments.filter((item) => item.data),
      ]);
    } catch (error) {
      toast.error(error.message || "Could not attach that screenshot.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1500,
      });
    } finally {
      event.target.value = "";
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((item) => item.id !== attachmentId)
    );
  };

  const handleSend = async (presetMessage) => {
    const question = (presetMessage || input).trim();
    const outgoingAttachments = attachments.map((item) => ({
      mimeType: item.mimeType,
      data: item.data,
      name: item.name,
    }));
    const outgoingPreviews = attachments.map((item) => ({
      id: item.id,
      name: item.name,
      preview: item.preview,
    }));

    if ((!question && outgoingAttachments.length === 0) || loading || !jwt?.token) {
      return;
    }

    clearComposer();

    setLoading(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        text: question || "Please check the attached screenshot.",
        attachments: outgoingPreviews,
      },
    ]);

    try {
      const response = await getSupportAssistantReply(
        { t: jwt.token },
        {
          message: question || "Please check the attached screenshot.",
          attachments: outgoingAttachments,
        }
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text:
            response?.reply ||
            "I could not generate a support answer right now. Please try again.",
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text:
            error.message ||
            "The support assistant is unavailable right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="feed-page support-page">
      <NavBar />

      <section className="container feed-shell support-page-shell">
        <div className="support-page-grid">
          <aside className="glass-card support-page-sidebar">
            <span className="section-chip">Gemini support</span>
            <h1 className="support-page-title">Sharper help for every ROHAINA question.</h1>
            <p className="support-page-copy">
              Open a full support workspace, drop a screenshot, and ask directly
              about stories, chat, privacy, unread alerts, or theme issues.
            </p>

            <div className="support-page-actions">
              <button
                type="button"
                className="landing-btn primary"
                onClick={() => navigate("/s")}
              >
                Back to feed
              </button>
              <button
                type="button"
                className="landing-btn secondary"
                onClick={() => {
                  setMessages(starterMessages);
                  clearComposer();
                }}
              >
                New chat
              </button>
            </div>

            <div className="support-page-tips">
              <strong>Quick prompts</strong>
              <div className="support-page-prompt-list">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="support-page-prompt"
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="support-page-note">
              <i className="fa-regular fa-image" />
              <span>
                Attach screenshots when something looks wrong. That helps support
                explain the issue faster.
              </span>
            </div>
          </aside>

          <div className="glass-card support-page-chat-card">
            <div className="support-page-chat-header">
              <div>
                <h2>Support chat</h2>
                <p className="app-muted-text mb-0">
                  Gemini-powered answers for how your app works
                </p>
              </div>
              <span className="support-page-status">
                {loading ? "Thinking..." : "Ready"}
              </span>
            </div>

            <div className="support-page-conversation">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`support-page-message ${message.role}`}
                >
                  <span className="support-page-message-role">
                    {message.role === "assistant" ? "ROHAINA Support" : "You"}
                  </span>
                  <p>{message.text}</p>

                  {Array.isArray(message.attachments) && message.attachments.length > 0 ? (
                    <div className="support-page-message-media">
                      {message.attachments.map((attachment) => (
                        <img
                          key={attachment.id}
                          src={attachment.preview}
                          alt={attachment.name}
                          className="support-page-message-thumb"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="support-page-message assistant">
                  <span className="support-page-message-role">ROHAINA Support</span>
                  <p>Thinking through that for you...</p>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            <div className="support-page-input-wrap">
              {attachments.length > 0 ? (
                <div className="support-page-attachment-list">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="support-page-attachment">
                      <img src={attachment.preview} alt={attachment.name} />
                      <button
                        type="button"
                        className="support-page-attachment-remove"
                        onClick={() => removeAttachment(attachment.id)}
                        aria-label={`Remove ${attachment.name}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <textarea
                rows={3}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                className="support-page-input"
                placeholder="Ask about stories, unread chat, support settings, privacy, or dark mode..."
              />

              <div className="support-page-input-footer">
                <div className="support-page-input-tools">
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="d-none"
                    onChange={handleAttachmentSelection}
                  />
                  <button
                    type="button"
                    className="support-page-attach-btn"
                    onClick={() => attachmentInputRef.current?.click()}
                    disabled={loading || attachments.length >= MAX_SUPPORT_ATTACHMENTS}
                  >
                    <i className="fa-solid fa-paperclip" />
                    <span>Add screenshot</span>
                  </button>
                  <span className="support-page-input-hint">
                    Press Enter to send, Shift+Enter for a new line
                  </span>
                </div>

                <button
                  type="button"
                  className="support-assistant-send"
                  onClick={() => handleSend()}
                  disabled={!canSend}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportAssistantPage;
