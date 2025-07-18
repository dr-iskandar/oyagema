import { useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, error };
}

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          }
          throw new Error('Failed to fetch user');
        }
        
        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching user ${id}:`, err);
        setError('Failed to load user. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  return { user, loading, error };
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    image?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      const data = await response.json();
      setSuccess(true);
      return data;
    } catch (error: unknown) {
       console.error('Error creating user:', error);
       setError('Failed to create user. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error, success };
}

export function useUpdateUser(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateUser = async (userData: {
    name?: string;
    email?: string;
    password?: string;
    image?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const data = await response.json();
      setSuccess(true);
      return data;
    } catch (error: unknown) {
       console.error(`Error updating user ${id}:`, error);
       setError('Failed to update user. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error, success };
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      setSuccess(true);
      return true;
    } catch (error: unknown) {
       console.error(`Error deleting user ${id}:`, error);
       setError('Failed to delete user. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error, success };
}