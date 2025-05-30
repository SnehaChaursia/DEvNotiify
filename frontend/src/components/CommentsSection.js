import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Box, Typography, TextField, Button, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CommentsSection = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useContext(AuthContext);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    console.log('Fetching comments for eventId:', eventId);
    fetchComments();
  }, [eventId]); // Refetch comments when eventId changes

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}/comments`);
      // Sort comments by creation date, newest first
      const sortedComments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(sortedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return; // Prevent submitting empty comments
    if (!isAuthenticated) {
        alert('You need to be logged in to comment.');
        return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/events/${eventId}/comments`, { text: newCommentText });
      // Add the new comment to the top of the list
      setComments([response.data, ...comments]);
      setNewCommentText(''); // Clear input field
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/events/${eventId}/comments/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment.');
    }
  };

  const handleEditComment = async () => {
    if (!editText.trim()) return;

    try {
      const response = await api.put(`/events/${eventId}/comments/${editingComment._id}`, {
        text: editText
      });
      setComments(comments.map(comment => 
        comment._id === editingComment._id ? response.data : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment.');
    }
  };

  const isCommentOwner = (comment) => {
    return user && comment.user && user._id === comment.user._id;
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h6" gutterBottom>Comments ({comments.length})</Typography>

      {!isAuthenticated && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please log in to leave a comment.
          </Typography>
      )}

      {isAuthenticated && (
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
          <TextField
            label="Add a comment"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Post Comment'}
          </Button>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </Box>
      )}

      {loading ? (
        <Typography>Loading comments...</Typography>
      ) : comments.length === 0 ? (
        <Typography>No comments yet. Be the first to leave a comment!</Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Paper key={comment._id} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {comment.user ? comment.user.name : 'Anonymous'}
                </Typography>
                {console.log('Auth user:', user)}
                {console.log('Comment user:', comment.user)}
                {isCommentOwner(comment) && (
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setEditingComment(comment);
                        setEditText(comment.text);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteComment(comment._id)}
                      color="error"
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {comment.text}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* Edit Comment Dialog */}
      <Dialog 
        open={Boolean(editingComment)} 
        onClose={() => {
          setEditingComment(null);
          setEditText('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditingComment(null);
            setEditText('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleEditComment} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentsSection; 