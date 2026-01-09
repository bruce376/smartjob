import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import io from 'socket.io-client';
import { getUserFromToken } from '../utils/auth';
import './Messages.css';

const Messages = () => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showUsersSection, setShowUsersSection] = useState(true);
  const [openingConversation, setOpeningConversation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const user = getUserFromToken();

  // Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to live chat server');
      socketRef.current.connected = true;
      
      // Join user's personal room
      if (user?.id) {
        socketRef.current.emit('joinUser', user.id);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from live chat server');
      socketRef.current.connected = false;
    });

    socketRef.current.on('newMessage', (messageData) => {
      console.log('📨 Received message:', messageData);
      
      // Only add message if it's for the current user OR current conversation
      if (messageData.recipientId === user?.id || 
          (selectedConversation && messageData.conversationId === selectedConversation.id)) {
        setMessages(prev => [...prev, messageData]);
      }
      
      // Update conversations list
      fetchConversations();
    });

    socketRef.current.on('messageSent', (messageData) => {
      // Handle message confirmation from server
      console.log('✅ Message confirmed by server:', messageData);
    });

    socketRef.current.on('messageError', (errorData) => {
      // Handle message errors
      console.error('❌ Message error:', errorData);
      alert('Failed to send message: ' + errorData.error);
      setSendingMessage(false);
    });

    socketRef.current.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping
      }));
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from live chat server');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      
      // Join conversation room for live updates
      if (socketRef.current) {
        socketRef.current.emit('joinConversation', selectedConversation.id);
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/messages/available-users');
      setAvailableUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const getAvailableUsersForNewConversations = () => {
    // Get user IDs from existing conversations
    const existingConversationUserIds = conversations.map(conv => conv.id).filter(id => id);
    
    // Filter out users you already have conversations with
    return availableUsers.filter(user => !existingConversationUserIds.includes(user.id));
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      console.log('❌ Cannot send empty message');
      return;
    }

    if (!selectedConversation?.id) {
      console.log('❌ No conversation selected');
      alert(t('common.pleaseSelectConversationFirst'));
      return;
    }

    if (!user?.id) {
      console.log('❌ User not authenticated');
      alert(t('common.pleaseLogInToSendMessages'));
      return;
    }

    console.log('📤 Sending message:', {
      conversationId: selectedConversation?.id,
      content: newMessage.trim(),
      senderId: user?.id,
      recipientId: selectedConversation?.id,
      socketConnected: !!socketRef.current?.connected
    });

    setSendingMessage(true);
    try {
      const messageData = {
        conversationId: selectedConversation?.id || 1,
        message: newMessage.trim(),
        senderId: user?.id,
        recipientId: selectedConversation?.id
      };

      // Send via Socket.IO for real-time delivery (saves to database automatically)
      if (socketRef.current) {
        console.log('🔌 Emitting sendMessage event:', messageData);
        socketRef.current.emit('sendMessage', messageData);
      } else {
        console.log('❌ Socket.IO not connected');
        alert(t('common.connectionLostRefresh'));
        return;
      }

      // Clear input field immediately for better UX
      setNewMessage('');
      
      // Update conversations list to reflect new message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(t('common.failedToSendMessage'));
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current && selectedConversation) {
      if (!isTyping && e.target.value.length > 0) {
        setIsTyping(true);
        socketRef.current.emit('typing', {
          conversationId: selectedConversation.id,
          userId: user?.id,
          isTyping: true
        });
      } else if (isTyping && e.target.value.length === 0) {
        setIsTyping(false);
        socketRef.current.emit('typing', {
          conversationId: selectedConversation.id,
          userId: user?.id,
          isTyping: false
        });
      }
    }
  };

  const startNewConversation = async () => {
    if (!selectedRecipient || !messageSubject.trim() || !newMessage.trim()) {
      alert(t('common.pleaseFillInAllFields'));
      return;
    }

    try {
      const messageData = {
        conversationId: selectedRecipient,
        content: `${messageSubject.trim()}: ${newMessage.trim()}`
      };

      await api.post('/messages/send', messageData);
      
      // Reset form
      setSelectedRecipient('');
      setMessageSubject('');
      setNewMessage('');
      setShowNewMessageModal(false);
      
      // Refresh conversations
      fetchConversations();
      
      alert(t('common.messageSentSuccessfully'));
    } catch (error) {
      console.error('Error sending message:', error);
      alert(t('common.failedToSendMessage'));
    }
  };

  const startConversationWithUser = async (recipientUser) => {
    setOpeningConversation(true);
    try {
      const messageData = {
        conversationId: recipientUser.id,
        content: `Hi ${recipientUser.name || 'there'}, I'd like to connect with you.`
      };

      await api.post('/messages/send', messageData);
      
      // Refresh conversations
      fetchConversations();
      
      // Select the new conversation immediately
      setTimeout(() => {
        setSelectedConversation(recipientUser);
        setOpeningConversation(false);
      }, 300);
      
      alert(`${t('common.startedConversationWith')} ${recipientUser.name || t('common.unknownUser')}!`);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(t('common.failedToStartConversation'));
      setOpeningConversation(false);
    }
  };

  const filteredUsers = getAvailableUsersForNewConversations().filter(user => 
    (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-loading">
          <div className="loading-spinner"></div>
          <p>{t('messages.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h1>{t('messages.title')}</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewMessageModal(true)}
        >
          ✉️ {t('messages.newMessage')}
        </button>
      </div>

      <div className="messages-layout">
        {/* Left Sidebar - Available Users & Conversations */}
        <div className="messages-sidebar">
          {/* Available Users Section */}
          <div className="available-users-section">
            <div className="section-header">
              <h3>👥 New People to Message</h3>
              <button 
                className="toggle-btn"
                onClick={() => setShowUsersSection(!showUsersSection)}
              >
                {showUsersSection ? '▼' : '▶'}
              </button>
            </div>
            
            {showUsersSection && (
              <>
                <div className="user-search">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search people you haven't messaged yet..."
                    className="form-control"
                  />
                </div>
                
                <div className="users-grid">
                  {filteredUsers.length === 0 ? (
                    <div className="no-users">
                      <p>{t('common.noNewPeopleToMessage')}</p>
                      <small>{t('common.everyoneAlreadyInConversations')}</small>
                    </div>
                  ) : (
                    filteredUsers.map((availableUser) => (
                      <div key={availableUser.id} className="user-card new-user">
                        <div className="user-avatar">
                          {(availableUser.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <h4>{availableUser.name || t('common.unknownUser')}</h4>
                          <p className="user-email">{availableUser.email || 'No email available'}</p>
                          <span className={`user-role ${availableUser.role ? availableUser.role.toLowerCase() : 'unknown'}`}>
                            {availableUser.role || 'User'}
                          </span>
                        </div>
                        <button
                          className="btn btn-primary message-user-btn"
                          onClick={() => startConversationWithUser(availableUser)}
                          title={`Start new conversation with ${availableUser.name || 'Unknown User'}`}
                          disabled={openingConversation}
                        >
                          {openingConversation ? (
                            <>
                              <span className="spinner-small"></span>
                              Starting...
                            </>
                          ) : (
                            '💬 Start Chat'
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Conversations List */}
          <div className="conversations-section">
            <div className="section-header">
              <h3>💬 Existing Conversations</h3>
              <span className="conversation-count">
                {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
              </span>
            </div>
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>{t('messages.noMessages')}</p>
                <small>Start a new conversation from people above!</small>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      selectedConversation?.id === conversation.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      {conversation.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">
                          {conversation.name}
                        </span>
                        <span className="conversation-time">
                          {conversation.time}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        <span className="message-preview">
                          {conversation.lastMessage.substring(0, 50)}...
                        </span>
                        {conversation.unread > 0 && (
                          <span className="unread-badge">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedConversation.name}</h3>
                    <p className="user-role">{selectedConversation.role}</p>
                  </div>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.sent ? 'sent' : 'received'
                    }`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {typingUsers[selectedConversation?.id] && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <small>Someone is typing...</small>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input">
                <div className="input-group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={t('messages.typeMessage')}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={sendingMessage}
                  />
                  <button
                    className="btn btn-primary send-btn"
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? '...' : '📤'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <div className="no-conversation-icon">💬</div>
              <h3>{t('common.selectConversation')}</h3>
              <p>{t('common.chooseExistingOrStartNew')}</p>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t('messages.newMessage')}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowNewMessageModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>To:</label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="form-control"
                  placeholder="Enter subject..."
                />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-control"
                  placeholder={t('messages.typeMessage')}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewMessageModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={startNewConversation}
                disabled={sendingMessage}
              >
                {sendingMessage ? 'Sending...' : t('messages.sendMessage')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
