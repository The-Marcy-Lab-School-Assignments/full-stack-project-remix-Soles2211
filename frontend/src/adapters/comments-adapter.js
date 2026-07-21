const handleFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Fetch failed. ${response.status} ${response.statusText}`);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createComment = async (content) => {
  return handleFetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
};

export const getAllComments = async () => {
  return handleFetch('/api/comments');
};

export const getComment = async (commentId) => {
  return handleFetch(`/api/comments/${commentId}`);
};

export const updateComment = async (commentId, content) => {
  return handleFetch(`/api/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
};

export const deleteComment = async (commentId) => {
  return handleFetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
  });
};

export const getCommentsByUser = async (userId) => {
  return handleFetch(`/api/users/${userId}/comments`);
};

export const getCommentsByBook = async (bookId) => {
  return handleFetch(`/api/books/${bookId}/comments`);
};

export const linkCommentToBook = async (bookId, commentId) => {
  return handleFetch(`/api/books/${bookId}/comments/${commentId}/link`, {
    method: 'POST',
  });
};

export const unlinkCommentFromBook = async (bookId, commentId) => {
  return handleFetch(`/api/books/${bookId}/comments/${commentId}/unlink`, {
    method: 'DELETE',
  });
};

export const getBooksForComment = async (commentId) => {
  return handleFetch(`/api/comments/${commentId}/books`);
};