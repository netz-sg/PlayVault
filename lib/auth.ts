import type { User } from "./types"
import { getUser, saveAuthToken, clearAuthToken, getAuthToken, saveUser } from "./client-storage"

// Simple function to generate an auth token
// In a real application, you would use JWT or another secure method
const generateAuthToken = (username: string): string => {
  return `${username}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Login function
export const login = async (username: string, password: string): Promise<boolean> => {
  const user = await getUser(username)

  if (user && user.username === username && user.password === password) {
    const token = generateAuthToken(username)
    saveAuthToken(token)
    return true
  }

  return false
}

// Logout function
export const logout = (): void => {
  clearAuthToken()
}

// Function to check if the current user is an admin
export const isAdmin = async (): Promise<boolean> => {
  const token = getAuthToken()
  if (!token) return false
  
  // Extract username from token
  const username = token.split('_')[0]
  if (!username) return false
  
  const user = await getUser(username)
  return !!user && user.isAdmin
}

// Function to create a new admin user
export const createAdminUser = async (username: string, password: string): Promise<User> => {
  const user: User = {
    username,
    password,
    isAdmin: true,
  }

  await saveUser(user)
  return user
}

// Export the isAuthenticated function used in auth-provider.tsx
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// The remaining functions remain unchanged
