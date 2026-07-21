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

export const createBook = async (title, author, year, description) => {
  return handleFetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, year, description }),
  });
};

export const getAllBooks = async () => {
  return handleFetch('/api/books');
};

export const getBook = async (bookId) => {
  return handleFetch(`/api/books/${bookId}`);
};

export const updateBook = async (bookId, title, author, year, description) => {
  return handleFetch(`/api/books/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, year, description }),
  });
};

export const deleteBook = async (bookId) => {
  return handleFetch(`/api/books/${bookId}`, {
    method: 'DELETE',
  });
};

export const getBookComments = async (bookId) => {
  return handleFetch(`/api/books/${bookId}/comments`);
};

export const getBookGroups = async (bookId) => {
  return handleFetch(`/api/books/${bookId}/groups`);
};