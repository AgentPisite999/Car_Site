import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

function ScreeningForm() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submittedList, setSubmittedList] = useState([]);

  const currentUserEmail = localStorage.getItem('user_email');

  const inputStyle = {
    padding: '12px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  useEffect(() => {
    if (!currentUserEmail) return;

    fetch(`https://agentpi-backend-1.onrender.com/all-screenings/${encodeURIComponent(currentUserEmail)}`)
      .then(res => res.json())
      .then(result => {
        if (result.status === 'found') {
          setSubmittedList(result.data);
        }
      })
      .catch(err => console.error('❌ Screening fetch error:', err));
  }, [currentUserEmail]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, key === 'resume' ? value[0] : value);
    });

    formData.append('userEmail', currentUserEmail || data.email);

    try {
     const res = await fetch('https://agentpi-backend-1.onrender.com/screening', {
        method: 'POST',
        body: formData,
      });


      const result = await res.json();

      if (result.status === 'success') {
        setMessage(`✅ Screening submitted successfully! Enrollment ID: ${result.enrollmentId}`);
        reset();
        const refetch = await fetch(`https://agentpi-backend-1.onrender.com/all-screenings/${encodeURIComponent(currentUserEmail)}`);
        const updated = await refetch.json();
        if (updated.status === 'found') setSubmittedList(updated.data);
      } else if (result.status === 'duplicate') {
        setMessage("⚠️ You’ve already submitted for the same role and duration.");
      } else {
        setMessage("❌ Submission failed. Try again later.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>
        📝 Submit for Screening
      </h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '520px',
          background: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid #eee'
        }}
      >
        <input {...register("name", { required: true })} placeholder="Full Name" style={inputStyle} />
        <input type="email" {...register("email", { required: true })} placeholder="Email" style={inputStyle} />
        <input type="tel" {...register("phone", { required: true, pattern: /^[0-9]{10}$/ })} placeholder="Phone Number" style={inputStyle} />

        <select {...register("position", { required: true })} style={inputStyle}>
          <option value="">Select Position</option>
          <option>Data Analyst</option>
          <option>Data Scientist</option>
          <option>AI Engineer</option>
          <option>Android Developer</option>
          <option>Website Developer</option>
        </select>

        <select {...register("duration", { required: true })} style={inputStyle}>
          <option value="">Select Duration</option>
          <option>1 month</option>
          <option>3 month</option>
          <option>6 month</option>
        </select>

        <input type="file" {...register("resume", { required: true })} style={{ ...inputStyle, padding: '8px' }} />

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#0a74da',
            color: '#fff',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: '0.3s ease'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Screening'}
        </button>
      </form>

      {message && (
        <p style={{
          marginTop: 16,
          color: message.startsWith("✅") ? "green" : "red",
          fontWeight: '500'
        }}>{message}</p>
      )}

      {submittedList.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h4 style={{ marginBottom: '16px' }}>📂 Your Previous Submissions:</h4>
          {submittedList.map((item, index) => (
            <div key={index} style={{
              background: '#f4f9ff',
              padding: 16,
              borderRadius: 10,
              border: '1px solid #e0e0e0',
              marginBottom: 16
            }}>
              <p><strong>Enrollment ID:</strong> {item.enrollmentId}</p>
              <p><strong>Position:</strong> {item.position}</p>
              <p><strong>Duration:</strong> {item.duration}</p>
              <p><strong>Status:</strong> <span style={{ color: item.status === 'Approved' ? 'green' : '#888' }}>{item.status || 'Under HR review'}</span></p>
              <p><strong>Resume:</strong> <a href={item.resumeLink} target="_blank" rel="noreferrer">View</a></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScreeningForm;
