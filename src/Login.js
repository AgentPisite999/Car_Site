import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const user = jwtDecode(credentialResponse.credential);
      const name = user.name;
      const email = user.email;

      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);

      await fetch('https://agentpi-backend-1.onrender.com/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      navigate('/home');
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AgentPi | Student Career</h1>
        <p style={styles.subtitle}>Please sign in with your Google account to continue</p>
        <div style={styles.loginButton}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert('Login failed')}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Segoe UI, sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px 60px',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '10px',
    fontSize: '24px',
    color: '#203a43',
  },
  subtitle: {
    marginBottom: '30px',
    color: '#444',
    fontSize: '14px',
  },
  loginButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

export default Login;
