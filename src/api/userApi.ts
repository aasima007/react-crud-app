import { User } from '../types/fields';

// API base URL - can be configured for different environments
const API_URL = 'http://localhost:3000';

// Generate unique ID
const generateId = () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const UserAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  // Get single user by ID
  getById: async (id: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  },

  // Create new user
  create: async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      const newUser: User = {
        id: generateId(),
        ...userData,
      };

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  },

  // Update existing user
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  },
};