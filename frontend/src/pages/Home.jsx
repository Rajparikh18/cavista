import "./Home.css"

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to MedConnect</h1>
      <p className="home-description">
        Join our medical communities to connect with patients and healthcare professionals. Share experiences, ask
        questions, and get support in a safe and moderated environment.
      </p>
      <div className="feature-grid">
        <div className="feature-item">
          <h3>Connect with Others</h3>
          <p>Join communities specific to your health interests or conditions.</p>
        </div>
        <div className="feature-item">
          <h3>Expert Advice</h3>
          <p>Get insights from verified healthcare professionals.</p>
        </div>
        <div className="feature-item">
          <h3>Privacy First</h3>
          <p>Your personal information is always protected.</p>
        </div>
        <div className="feature-item">
          <h3>24/7 Support</h3>
          <p>Access resources and support anytime, anywhere.</p>
        </div>
      </div>
    </div>
  )
}

export default Home

