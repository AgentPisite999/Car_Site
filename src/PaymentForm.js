import React, { useState } from 'react';

function PaymentForm() {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  const loginEmail = localStorage.getItem('user_email');

  const getAmount = (position, duration) => {
    const pricing = {
      'Data Analyst': { '1 month': 500, '3 month': 1200, '6 month': 2000 },
      'Data Scientist': { '1 month': 700, '3 month': 1500, '6 month': 2500 },
      'AI Engineer': { '1 month': 800, '3 month': 1600, '6 month': 2700 },
      'Android Developer': { '1 month': 600, '3 month': 1300, '6 month': 2200 },
    };
    return pricing[position]?.[duration] || 0;
  };

  const fetchStudent = async () => {
    setLoading(true);
    setError('');
    setStudent(null);
    setAlreadyPaid(false);

    try {
      const res = await fetch(`https://agentpi-backend-1.onrender.com/get-student/${enrollmentId}`);
      const data = await res.json();

      if (data.status !== 'approved') {
        setError(data.status === 'not_approved'
          ? '⛔ Not yet approved by HR.'
          : '❌ Invalid Enrollment ID.');
        return;
      }

      const studentData = data.data;

      const enrollRes = await fetch(`https://agentpi-backend-1.onrender.com/check-enrollment/${encodeURIComponent(loginEmail)}`);
      const enrollData = await enrollRes.json();

      if (enrollData.status === 'enrolled') {
        const alreadyExists = enrollData.data.find(entry => entry.enrollmentId === enrollmentId);
        if (alreadyExists) {
          setAlreadyPaid(true);
          setStudent(studentData);
          return;
        }
      }

      setStudent(studentData);
    } catch (err) {
      console.error('❌ Error:', err);
      setError('⚠️ Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async () => {
    const amount = getAmount(student.position, student.duration);

    try {
      const orderRes = await fetch('https://agentpi-backend-1.onrender.com/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderRes.json();
      if (!orderData.id) return alert('❌ Payment initiation failed');

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'AgentPi',
        description: 'Internship Fee',
        order_id: orderData.id,
        handler: async function (response) {
          setVerifying(true);
          try {
            const res = await fetch('https://agentpi-backend-1.onrender.com/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...student,
                enrollmentId,
                order_id: orderData.id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userEmail: loginEmail,
              }),
            });

            const result = await res.json();
            if (result.status === 'success') {
              localStorage.setItem('user_name', student.name);
              localStorage.setItem('user_email', loginEmail);
              setSuccess(true);
              setTimeout(() => {
                window.location.href = '/home';
              }, 1500);
            } else {
              alert('❌ Payment verification failed.');
            }
          } catch (e) {
            console.error(e);
            alert('❌ Server error during verification.');
          } finally {
            setVerifying(false);
          }
        },
        prefill: {
          name: student.name,
          email: student.email,
          contact: student.phone,
        },
        theme: { color: '#0a74da' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Error initiating payment.");
    }
  };

  const inputStyle = {
    padding: '12px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '12px',
  };

  return (
    <div style={{
      maxWidth: 550,
      margin: '0 auto',
      padding: 30,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
    }}>
      <h3 style={{ marginBottom: 20 }}>💳 Pay Internship Fee</h3>

      <input
        value={enrollmentId}
        onChange={(e) => setEnrollmentId(e.target.value)}
        placeholder="Enter Enrollment ID"
        style={inputStyle}
      />

      <button
        onClick={fetchStudent}
        disabled={loading || !enrollmentId}
        style={{
          padding: '12px',
          width: '100%',
          background: '#0a74da',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: 16
        }}
      >
        {loading ? 'Fetching...' : 'Fetch Details'}
      </button>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {alreadyPaid && student && (
        <div style={{ background: '#eaffea', padding: 16, borderRadius: 8, marginTop: 12 }}>
          <p>✅ Payment already completed for:</p>
          <p><strong>{student.position}</strong> ({student.duration})</p>
          <p><strong>Enrollment ID:</strong> {enrollmentId}</p>
        </div>
      )}

      {!alreadyPaid && student && (
        <div style={{
          marginTop: 20,
          background: '#f5f9ff',
          padding: 20,
          borderRadius: 8,
          border: '1px solid #dceeff'
        }}>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Phone:</strong> {student.phone}</p>
          <p><strong>Position:</strong> {student.position}</p>
          <p><strong>Duration:</strong> {student.duration}</p>
          <p><strong>Resume:</strong> <a href={student.resumeLink} target="_blank" rel="noopener noreferrer">View</a></p>
          <p style={{ fontWeight: 'bold', color: '#0a74da' }}>
            💰 Total: ₹{getAmount(student.position, student.duration)}
          </p>

          <button
            onClick={startPayment}
            style={{
              marginTop: 12,
              padding: '12px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            Pay Now
          </button>
        </div>
      )}

      {verifying && <p style={{ marginTop: 20, color: '#0a74da' }}>🔄 Verifying payment...</p>}
      {success && <p style={{ marginTop: 20, color: 'green' }}>✅ Payment Successful!</p>}
    </div>
  );
}

export default PaymentForm;
