import { User } from "../types/fields";

const API_URL = "http://localhost:3000";

// Detect environment
const isDev = import.meta.env.MODE === "development";

// LocalStorage helpers
const getUsersFromStorage = (): User[] => {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : [];
};

const saveUsersToStorage = (users: User[]) => {
  localStorage.setItem("users", JSON.stringify(users));
};

// Generate unique ID
const generateId = () =>
  `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const UserAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    if (isDev) {
      const res = await fetch(`${API_URL}/users`);
      return res.json();
    }
    return getUsersFromStorage();
  },

  // Get single user
  getById: async (id: string): Promise<User | null> => {
    if (isDev) {
      const res = await fetch(`${API_URL}/users/${id}`);
      if (!res.ok) return null;
      return res.json();
    }

    const users = getUsersFromStorage();
    return users.find((u) => u.id === id) || null;
  },

  // Create user
  create: async (userData: Omit<User, "id">): Promise<User> => {
    const newUser: User = {
      id: generateId(),
      ...userData,
    };

    if (isDev) {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      return res.json();
    }

    const users = getUsersFromStorage();
    users.push(newUser);
    saveUsersToStorage(users);
    return newUser;
  },

  // Update user
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    if (isDev) {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return res.json();
    }

    let users = getUsersFromStorage();
    users = users.map((u) =>
      u.id === id ? { ...u, ...userData } : u
    );
    saveUsersToStorage(users);

    return users.find((u) => u.id === id)!;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    if (isDev) {
      await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });
      return;
    }

    let users = getUsersFromStorage();
    users = users.filter((u) => u.id !== id);
    saveUsersToStorage(users);
  },
};
