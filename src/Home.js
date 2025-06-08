import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ScreeningForm from './ScreeningForm';
import PaymentForm from './PaymentForm';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Home() {
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

  const name = query.get("name") || localStorage.getItem("user_name");
  const email = query.get("email") || localStorage.getItem("user_email");

  const [isMobile, setIsMobile] = useState(false);
  const [enrollmentList, setEnrollmentList] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!name || !email) {
      navigate('/');
    } else {
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);
    }
  }, [name, email, navigate]);

  useEffect(() => {
    if (!email) return;
    fetch(`https://agentpi-backend-1.onrender.com/check-enrollment/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "enrolled") {
          setEnrollmentList(data.data);
        }
      })
      .catch(err => console.error("❌ Error checking enrollment:", err));
  }, [email]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    window.location.href = '/';
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <a href="https://www.agentpi.in" target="_blank" rel="noopener noreferrer" style={styles.brand}>
          Agent<span style={{ color: '#0a74da' }}>Pi</span>
        </a>
        <div style={styles.navRight}>
          <span style={styles.profileText}>👋 {name}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.heading}>
          Hello <b style={{ color: '#111' }}>{name}</b>, Welcome to the{' '}
          <span style={{ color: '#007aff', fontWeight: 600 }}>Freshers Career Page</span> by{' '}
          <b style={{ color: '#0a74da' }}>AgentPi</b>!
        </h2>

        {enrollmentList.length > 0 && (
          <section style={styles.card} data-aos="zoom-in">
            <h3>📄 My Purchase History</h3>
            {enrollmentList.map((info, idx) => (
              <div key={idx} style={styles.historyItem}>
                <p><strong>Enrollment ID:</strong> {info.enrollmentId}</p>
                <p><strong>Position:</strong> {info.position}</p>
                <p><strong>Duration:</strong> {info.duration}</p>
                <p><strong>Payment ID:</strong> {info.paymentId}</p>
                <p><strong>Resume:</strong> <a href={info.resumeLink} target="_blank" rel="noreferrer">📄 View</a></p>
              </div>
            ))}
          </section>
        )}

        <section style={styles.card} data-aos="fade-up">
          <h3>📌 Current Openings</h3>
          <ul>
            <li>📊 Data Analyst</li>
            <li>🧠 Data Scientist</li>
            <li>🤖 AI Engineer</li>
            <li>📱 Android Developer</li>
            <li>🌐 Website Developer (React App)</li>
          </ul>
        </section>

        <section style={styles.card} data-aos="fade-right">
          <h3>⏳ Duration Options</h3>
          <ul>
            <li>1 Month</li>
            <li>3 Months</li>
            <li>6 Months</li>
          </ul>
        </section>

        <section style={styles.card} data-aos="fade-left">
          <h3>🎁 What You Will Receive</h3>
          <ul>
            <li>👨‍🏫 Guidance from Industrial Experts / Seniors</li>
            <li>📜 Official Joining Letter</li>
            <li>📄 Offer Letter</li>
            <li>🏆 Experience Letter after Completion</li>
            <li>🎓 Internship Completion Certificate</li>
          </ul>
        </section>

        <section style={styles.card} data-aos="fade-up">
          <h3>🧭 Internship Selection Process</h3>
          <ol>
            <li>1. Fill the screening form</li>
            <li>2. HR review and approval</li>
            <li>3. Pay the internship fee</li>
            <li>4. Get Offer and Joining Letter</li>
            <li>5. Orientation & Project Assignment</li>
            <li>6. Join the live project</li>
          </ol>
        </section>

        <section style={styles.card} data-aos="zoom-in">
          <h3>📝 Submit for Screening</h3>
          <ScreeningForm />
        </section>

        <section style={styles.card} data-aos="zoom-in">
          <h3>💳 Already Approved by HR?</h3>
          <PaymentForm />
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(to right top, #eef2f3, #dff1ff)',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    paddingBottom: 40,
  },
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
  },
  brand: {
    fontWeight: 700,
    fontSize: '24px',
    color: '#0a74da',
    textDecoration: 'none',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  profileText: {
    fontWeight: 500,
    fontSize: '16px',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  heading: {
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '28px',
    marginBottom: '30px',
    borderRadius: '14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  historyItem: {
    marginBottom: '16px',
    borderBottom: '1px solid #eee',
    paddingBottom: '12px',
  },
};

export default Home;
