import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './JobMessageModal.css';

const JobMessageModal = ({ job, isOpen, onClose, user, onMessageSent }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [isComeInRequest, setIsComeInRequest] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');

  if (!isOpen || !job) return null;

  const getDefaultSubject = () => {
    if (subject) return subject;
    return `Inquiry about ${job.title} position`;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const messageData = {
        recipient: job.employer._id,
        content: message.trim(),
        subject: getDefaultSubject(),
        jobRelated: job._id,
        messageType: isComeInRequest ? 'come_in' : 'job_inquiry',
        comeInRequest: isComeInRequest,
        interviewDate: isComeInRequest && interviewDate ? new Date(interviewDate) : undefined,
        interviewLocation: isComeInRequest ? interviewLocation.trim() : undefined
      };

      await api.post('/messages/send', messageData);
      
      // Reset form
      setMessage('');
      setSubject('');
      setIsComeInRequest(false);
      setInterviewDate('');
      setInterviewLocation('');
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent();
      }
      
      alert(isComeInRequest ? 'Come in request sent successfully!' : 'Message sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setMessage('');
      setSubject('');
      setIsComeInRequest(false);
      setInterviewDate('');
      setInterviewLocation('');
      onClose();
    }
  };

  return (
    <div className="job-message-modal-overlay">
      <div className="job-message-modal">
        <div className="job-message-modal-header">
          <h3>Message about {job.title}</h3>
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={sending}
          >
            ×
          </button>
        </div>
        
        <div className="job-message-modal-body">
          {/* Job Info */}
          <div className="job-info">
            <div className="job-card-mini">
              <h4>{job.title}</h4>
              <p className="company-name">🏢 {job.employer?.name || 'Company'}</p>
              <p className="job-location">📍 {job.location || 'Location not specified'}</p>
              {job.salary && <p className="job-salary">💰 {job.salary}</p>}
              {job.type && <span className="job-type">{job.type}</span>}
            </div>
          </div>

          {/* Recipient Info */}
          <div className="recipient-info">
            <label>Message to:</label>
            <div className="recipient-details">
              <strong>{job.employer?.name || 'Employer'}</strong>
              <span className="recipient-role">Employer</span>
            </div>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={getDefaultSubject()}
              className="form-control"
              disabled={sending}
            />
          </div>

          {/* Message Type Selection */}
          <div className="form-group">
            <label>Message Type:</label>
            <div className="message-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${!isComeInRequest ? 'active' : ''}`}
                onClick={() => setIsComeInRequest(false)}
              >
                💬 General Inquiry
              </button>
              <button
                type="button"
                className={`toggle-btn ${isComeInRequest ? 'active' : ''}`}
                onClick={() => setIsComeInRequest(true)}
              >
                🤝 Request to Come In
              </button>
            </div>
          </div>

          {/* Interview Details for Come In Requests */}
          {isComeInRequest && (
            <>
              <div className="form-group">
                <label>Preferred Interview Date:</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="form-control"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="form-group">
                <label>Preferred Interview Location:</label>
                <input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  className="form-control"
                  placeholder="e.g., Office location, Video call, Phone interview"
                />
              </div>
            </>
          )}

          {/* Message */}
          <div className="form-group">
            <label>
              {isComeInRequest ? 'Additional Message (Optional):' : 'Message:'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isComeInRequest 
                  ? "I'm very interested in this position and would like to discuss next steps..."
                  : "Introduce yourself and express your interest in this position. You can ask questions about the role, company culture, or application process."
              }
              className="form-control message-textarea"
              rows={isComeInRequest ? 4 : 6}
              disabled={sending}
            />
            <div className="character-count">
              {message.length}/1000 characters
            </div>
          </div>

          {/* Tips */}
          <div className="messaging-tips">
            <h5>💡 {isComeInRequest ? 'Tips for interview requests:' : 'Tips for effective messaging:'}</h5>
            <ul>
              {isComeInRequest ? (
                <>
                  <li>Be specific about your availability for interviews</li>
                  <li>Mention preferred interview format (in-person, video, phone)</li>
                  <li>Highlight relevant experience briefly</li>
                  <li>Confirm your interest in the position</li>
                  <li>Keep it professional and concise</li>
                </>
              ) : (
                <>
                  <li>Be professional and concise</li>
                  <li>Mention specific aspects of job that interest you</li>
                  <li>Highlight relevant experience briefly</li>
                  <li>Ask thoughtful questions about role</li>
                  <li>Proofread before sending</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="job-message-modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
          >
            {sending ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              '📤 Send Message'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobMessageModal;
