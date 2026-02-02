// This service simulates API calls.
// In the future, replace the simulated promises with real axios/fetch calls.

export const authService = {
  login: async (email, password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Hardcoded logic for demo purposes
    // TODO: Replace with API call
    if (email.includes('admin')) {
      return {
        id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin',
        token: 'mock-jwt-token-admin',
      };
    } 
    
    if (email.includes('lecturer')) {
      return {
        id: '2',
        name: 'Lecturer User',
        email: email,
        role: 'lecturer',
        token: 'mock-jwt-token-lecturer',
      };
    }

    if (email.includes('student') || email.includes('fpt.edu.vn')) {
      return {
        id: '3',
        name: 'Student User',
        email: email,
        role: 'student',
        token: 'mock-jwt-token-student',
      };
    }

    // Default fall-through for generic valid emails in demo
    if (email && password) {
       return {
        id: '4',
        name: 'Demo User',
        email: email,
        role: 'student',
        token: 'mock-jwt-token-student',
      };
    }

    throw new Error('Invalid credentials');
  },

  register: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Simulate successful registration
    // TODO: Send data to API
    console.log('Registered user:', data);
    
    return {
      id: Math.random().toString(),
      name: data.fullName,
      email: data.email,
      role: 'student', // Default role
      token: 'mock-jwt-token-new-user',
    };
  },

  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // TODO: Call invalidation API if needed
  }
};
