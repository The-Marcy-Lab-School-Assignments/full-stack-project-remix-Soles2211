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

export const createGroup = async (groupName, description, maxCapacity, location, meetTime) => {
  return handleFetch('/api/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      group_name: groupName, 
      description, 
      max_capacity: maxCapacity, 
      location, 
      meet_time: meetTime 
    }),
  });
};

export const getAllGroups = async () => {
  return handleFetch('/api/groups');
};

export const getGroup = async (groupId) => {
  return handleFetch(`/api/groups/${groupId}`);
};

export const updateGroup = async (groupId, groupName, description, maxCapacity, location, meetTime) => {
  return handleFetch(`/api/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      group_name: groupName, 
      description, 
      max_capacity: maxCapacity, 
      location, 
      meet_time: meetTime 
    }),
  });
};

export const deleteGroup = async (groupId) => {
  return handleFetch(`/api/groups/${groupId}`, {
    method: 'DELETE',
  });
};

export const getGroupMembers = async (groupId) => {
  return handleFetch(`/api/groups/${groupId}/members`);
};

export const getGroupBooks = async (groupId) => {
  return handleFetch(`/api/groups/${groupId}/books`);
};