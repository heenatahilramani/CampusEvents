
import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      icon: "✦",
      color: "#F0E9FF",
      title: "Discover Events",
      description:
        "Explore exciting college events, workshops, competitions and technical fests.",
    },
    {
      icon: "♡",
      color: "#FCEAF0",
      title: "Easy Registration",
      description:
        "Register for events with a simple form and keep track of your registrations.",
    },
    {
      icon: "✧",
      color: "#E6F2FF",
      title: "Your Campus Life",
      description:
        "Find opportunities to learn new skills, meet people and create memories.",
    },
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />

        <div className="hero-content">
          <span className="home-eyebrow">
            ✦ YOUR CAMPUS, YOUR COMMUNITY
          </span>

          <h1>
            Make every campus
            <br />
            moment <span>count.</span>
          </h1>

          <p className="home-description">
            Discover what's happening around you. From inspiring
            workshops to unforgettable college fests, your next
            favourite experience starts here.
          </p>

          <div className="home-actions">
            <Link to="/events" className="home-primary-btn">
              Explore Events <span aria-hidden="true">→</span>
            </Link>

            <Link to="/my-registrations" className="home-secondary-btn">
              My Registrations
            </Link>
          </div>

          <div className="home-note">
            <span className="note-dot" />
            Discover. Participate. Create memories.
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="art-circle art-circle-back" />
          <div className="art-card art-card-main">
            <div className="art-card-top">
              <span className="art-sparkle">✦</span>
              <span className="art-mini-label">CAMPUS LIFE</span>
            </div>
            <div className="art-illustration">
              <div className="art-sun" />
              <div className="art-mountain art-mountain-one" />
              <div className="art-mountain art-mountain-two" />
              <div className="art-book">
                <span />
                <span />
              </div>
            </div>
            <div className="art-card-footer">
              <div>
                <strong>Something wonderful</strong>
                <p>is waiting for you.</p>
              </div>
              <span className="art-heart">♡</span>
            </div>
          </div>

          <div className="floating-tag floating-tag-top">
            <span>✿</span> New experiences
          </div>
          <div className="floating-tag floating-tag-bottom">
            <span>♡</span> Your next memory
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="section-heading">
          <span className="home-eyebrow">A LITTLE BIT OF EVERYTHING</span>
          <h2>Your campus has more to offer.</h2>
          <p>Everything you need to make the most of your college days.</p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div
                className="feature-icon"
                style={{ backgroundColor: feature.color }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="home-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Ready to find your next favourite event?</h2>
          <p>Step out, try something new and make it a day to remember.</p>
        </div>
        <Link to="/events" className="home-primary-btn">
          Find an Event <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="home-footer">
        <span className="footer-brand">CampusEvents<span>✦</span></span>
        <p>Made for campus moments worth remembering.</p>
      </footer>
    </main>
  );
}

export default Home;
