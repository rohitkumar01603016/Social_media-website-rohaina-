import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const nav = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userInfo1")) {
      nav("/s");
    }
  }, [nav]);

  return (
    <div className="landing-shell">
      <div className="landing-grid">
        <div className="landing-copy-card">
          <div className="brand-inline">
            <span className="brand-mark">R</span>
            <span className="brand-copy">
              <span className="brand-name">ROHAINA</span>
              <span className="brand-tag">social studio</span>
            </span>
          </div>

          <span className="section-chip mt-4">Private social network</span>
          <h1 className="landing-heading">
            Share stories, posts, and conversations in one polished home.
          </h1>
          <p className="landing-description">
            ROHAINA brings your feed, chat, profile, and social discovery into a
            warmer Instagram-style experience that feels cleaner, more focused,
            and more premium.
          </p>

          <div className="landing-actions">
            <Link className="landing-btn primary" to="/register">
              Create account
            </Link>
            <Link className="landing-btn secondary" to="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="landing-preview">
          <div className="preview-top">
            <strong>ROHAINA</strong>
            <span className="app-muted-text text-white-50">
              Stories. Feed. Chat.
            </span>
          </div>

          <div className="preview-story-row">
            <div className="preview-story">
              <span>Story</span>
              <strong>Morning drops</strong>
            </div>
            <div className="preview-story">
              <span>DMs</span>
              <strong>Live conversations</strong>
            </div>
          </div>

          <div className="preview-post-card">
            <div className="preview-post-image" />
            <div className="preview-post-copy">
              <strong>Design your social space with a calmer, richer UI.</strong>
              <p>
                Cleaner cards, a stronger brand system, story-inspired moments,
                and better visual rhythm across the whole app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
