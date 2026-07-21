export const getAllUsers = async () => {
  return handleFetch('/api/users');
};

export const getUser = async (userId) => {
  return handleFetch(`/api/users/${userId}`);
};

export const updateUsername = async (userId, username) => {
  return handleFetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
};

export const deleteUser = async (userId) => {
  return handleFetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
};

export const getUserBooks = async (userId) => {
  return handleFetch(`/api/users/${userId}/books`);
};

export const getUserComments = async (userId) => {
  return handleFetch(`/api/users/${userId}/comments`);
};

export const getUserGroups = async (userId) => {
  return handleFetch(`/api/users/${userId}/groups`);
};