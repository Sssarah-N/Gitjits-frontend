---
name: ""
overview: ""
todos:
  - id: todo-1776907823198-q1x9cqikv
    content: "Backend: Add @admin_required decorators"
    status: pending
isProject: false
---

# Admin Dashboard Implementation

## Overview

Enable admin users to manage website content (parks, states, cities) through a protected admin interface.

---

## Part 1: Backend - Protect CRUD Endpoints

Add `@admin_required` decorator to all write operations in `Software-Engineering/server/endpoints.py`.

### Endpoints to Protect


| Resource  | Endpoint                           | Method      |
| --------- | ---------------------------------- | ----------- |
| Countries | `/countries`                       | POST        |
| Countries | `/countries/<code>`                | PUT, DELETE |
| States    | `/countries/<code>/states`         | POST        |
| States    | `/countries/<code>/states/<state>` | PUT, DELETE |
| Cities    | `/cities/<id>`                     | PUT, DELETE |
| Cities    | `/countries/.../cities`            | POST        |
| Parks     | `/parks`                           | POST        |
| Parks     | `/parks/<code>`                    | DELETE      |
| Parks     | `/parks/id/<id>`                   | PUT         |


### Example Change

```python
from auth.jwt_utils import admin_required

@handle_errors
@admin_required
def post(self, current_user):
    """Create a new country (admin only)."""
    data = request.json
    # ...
```

---

## Part 2: Frontend - Auth Context

Create a React Context to manage authentication state globally.

### New File: `src/context/AuthContext.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  const isAdmin = user?.role === 'admin';

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Update `src/App.js`

Wrap app with AuthProvider.

---

## Part 3: Frontend - Admin Dashboard

### New Component: `src/Components/AdminDashboard/`

Features:

- Tabs for Parks / States / Cities
- Table view of existing items
- Add new item form
- Edit/Delete buttons per row
- Protected route (redirects non-admins)

### Route

Add to App.js:

```jsx
<Route path="admin" element={<AdminDashboard />} />
```

### Navbar Update

Show "Admin" link only when `isAdmin` is true.

---

## Part 4: API Calls with Auth Header

Create helper to attach JWT token to requests:

```jsx
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Usage
axios.post(`${BACKEND_URL}/parks`, parkData, authHeader());
```

---

## Files to Create/Modify


| File                                                | Action                                 |
| --------------------------------------------------- | -------------------------------------- |
| `Software-Engineering/server/endpoints.py`          | Add @admin_required to POST/PUT/DELETE |
| `Gitjits-frontend/src/context/AuthContext.jsx`      | Create auth context                    |
| `Gitjits-frontend/src/Components/AdminDashboard/`   | Create admin dashboard                 |
| `Gitjits-frontend/src/App.js`                       | Add AuthProvider + admin route         |
| `Gitjits-frontend/src/Components/Navbar/Navbar.jsx` | Add admin link for admins              |
| `Gitjits-frontend/src/Components/Login/Login.jsx`   | Update to use auth context             |


---

## Implementation Order

1. Backend: Add @admin_required decorators
2. Frontend: Create AuthContext
3. Frontend: Update Login to use context
4. Frontend: Create AdminDashboard (start with Parks)
5. Frontend: Update Navbar with admin link
6. Test full flow

