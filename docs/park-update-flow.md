# Park Information Update Flow

This document explains how park information updates flow through the system, from user interaction to database persistence.

---

## Overview

```
User Input → React State → Axios PUT Request → Flask API → MongoDB → Response → UI Update
```

---

## Step-by-Step Flow

### 1. User Enters Edit Mode

**File:** `src/Components/AdminDashboard/ParkEditor.jsx`

```jsx
// User clicks "Edit Mode" button
<button 
  className={`edit-mode-btn ${editMode ? 'active' : ''}`}
  onClick={() => setEditMode(!editMode)}
>
  {editMode ? '✓ Done Editing' : '✎ Edit Mode'}
</button>
```

**State Change:**
```jsx
const [editMode, setEditMode] = useState(false);
// After click: editMode = true
```

---

### 2. User Clicks a Field to Edit

**File:** `src/Components/AdminDashboard/ParkEditor.jsx`

When `editMode` is true, fields become clickable:

```jsx
<div 
  className="field-value"
  onClick={() => startEditing(field, displayValue)}  // e.g., startEditing('description', 'Park description...')
>
  {displayValue}
  {editMode && <span className="edit-hint">Click to edit</span>}
</div>
```

**`startEditing` function:**
```jsx
const startEditing = (field, value) => {
  if (!editMode) return;
  setEditingField(field);           // e.g., 'description'
  setTempValue(value);              // e.g., 'Park description...'
};
```

**State Change:**
```jsx
const [editingField, setEditingField] = useState(null);
const [tempValue, setTempValue] = useState('');
// After click: editingField = 'description', tempValue = 'Park description...'
```

---

### 3. User Types New Value

The field switches from display mode to edit mode:

```jsx
{isEditing ? (
  <div className="field-edit">
    <textarea
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}  // Updates tempValue on each keystroke
      autoFocus
    />
    <div className="field-actions">
      <button onClick={() => saveField(field)}>✓</button>
      <button onClick={cancelEditing}>✕</button>
    </div>
  </div>
) : (
  // Display mode...
)}
```

**State Change:**
```jsx
// User types "New description"
// tempValue = 'New description'
```

---

### 4. User Clicks Save Button

**`saveField` function:**

```jsx
const saveField = async (field) => {
  setSaving(true);
  try {
    let valueToSave = tempValue;
    
    // Parse special fields (JSON for complex objects, numbers for coordinates)
    if (['contacts', 'addresses', 'operating_hours', 'images', 'activities'].includes(field)) {
      try {
        valueToSave = JSON.parse(tempValue);
      } catch {
        if (field === 'activities') {
          valueToSave = tempValue.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
    }
    
    if (['latitude', 'longitude'].includes(field)) {
      valueToSave = parseFloat(tempValue) || null;
    }

    // Send PUT request to backend
    await axios.put(
      `${BACKEND_URL}/parks/id/${park._id}`,   // e.g., http://127.0.0.1:8000/parks/id/507f1f77bcf86cd799439011
      { [field]: valueToSave },                 // e.g., { description: 'New description' }
      authHeader()                              // { headers: { Authorization: 'Bearer <jwt_token>' } }
    );
    
    // Update local state
    setPark({ ...park, [field]: valueToSave });
    setEditingField(null);
    setTempValue('');
    showMessage('success', 'Saved!');
  } catch (error) {
    showMessage('error', error.response?.data?.Error || 'Failed to save');
  }
  setSaving(false);
};
```

---

### 5. Axios Sends HTTP PUT Request

**Request:**
```http
PUT /parks/id/507f1f77bcf86cd799439011 HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "description": "New description"
}
```

---

### 6. Flask Backend Receives Request

**File:** `Software-Engineering/server/endpoints.py`

```python
@parks_ns.route('/id/<park_id>')
class ParkById(Resource):
    
    @api.doc(security='Bearer')
    @handle_errors
    @admin_required
    def put(self, park_id, current_user):
        """Update a park by MongoDB ObjectId (admin only)."""
        data = request.json  # { "description": "New description" }
        updated = pqry.update(park_id, data)
        return {'Park': updated}
```

**Decorator Chain:**
1. `@admin_required` - Validates JWT token, checks admin role
2. `@handle_errors` - Catches exceptions, returns appropriate HTTP status codes

---

### 7. Query Layer Updates MongoDB

**File:** `Software-Engineering/parks/queries.py`

```python
def update(park_id: str, data: dict) -> dict:
    """Update park field"""
    
    dbc.connect_db()
    
    # Validate park_id
    if not park_id:
        raise ValueError("Park ID is required")
    if not ObjectId.is_valid(park_id):
        raise ValueError(f"Invalid ObjectId format: {park_id}")
    
    obj_id = ObjectId(park_id)
    
    if not data or not isinstance(data, dict):
        raise ValueError("Update data must be a non-empty dictionary")
    
    # Execute MongoDB update
    ret = db_update(PARK_COLLECTION, {"_id": obj_id}, data)
    
    if ret.matched_count == 0:
        raise KeyError(f"Park not found: {park_id}")
    
    # Clear cache and return updated document
    park_cache.clear()
    updated_park = dbc.read_one(PARK_COLLECTION, {"_id": obj_id})
    return updated_park
```

---

### 8. Database Layer Executes Update

**File:** `Software-Engineering/data/db_connect.py`

```python
def update(collection, filt, update_dict):
    """
    Update documents matching filter with $set operation.
    """
    client = connect_db()
    db = client[DB_NAME]
    return db[collection].update_one(filt, {'$set': update_dict})
```

**MongoDB Operation:**
```javascript
db.parks.updateOne(
  { "_id": ObjectId("507f1f77bcf86cd799439011") },
  { "$set": { "description": "New description" } }
)
```

---

### 9. Response Returns to Frontend

**HTTP Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "Park": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Yellowstone",
    "description": "New description",
    ...
  }
}
```

---

### 10. Frontend Updates UI

Back in `saveField`:

```jsx
// Update local state with new value
setPark({ ...park, [field]: valueToSave });

// Clear editing state
setEditingField(null);
setTempValue('');

// Show success message
showMessage('success', 'Saved!');
```

**Result:**
- The field now displays "New description"
- A green "Saved!" toast appears briefly
- The field returns to display mode

---

## Authentication Flow

### JWT Token Generation (Login)

**File:** `Software-Engineering/security/security.py`

```python
def generate_token(username: str, role: str) -> str:
    payload = {
        'username': username,
        'role': role,  # 'admin' for admin users
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
```

### Token Validation (Each Request)

**File:** `Software-Engineering/security/security.py`

```python
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = get_token_from_header()  # Extract from "Bearer <token>"
            payload = decode_token(token)     # Validate & decode JWT
        except ValueError as err:
            return ({'Error': str(err)}, 401)
        
        if payload.get('role') != 'admin':
            return ({'Error': 'Admin access required'}, 403)
        
        kwargs['current_user'] = {
            'username': payload['username'],
            'role': payload['role']
        }
        
        return f(*args, **kwargs)
    return decorated
```

---

## Error Handling

### Frontend Error Display

```jsx
catch (error) {
  showMessage('error', error.response?.data?.Error || 'Failed to save');
}
```

### Backend Error Responses

| Error Type | HTTP Status | Example |
|------------|-------------|---------|
| Missing/Invalid Token | 401 | `{"Error": "Authorization header is missing"}` |
| Not Admin | 403 | `{"Error": "Admin access required"}` |
| Invalid Data | 400 | `{"Error": "Update data must be a non-empty dictionary"}` |
| Park Not Found | 404 | `{"Error": "Park not found: 507f1f77bcf86cd799439011"}` |
| Server Error | 503 | `{"Error": "Database connection failed"}` |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User clicks "Edit Mode"                                         │
│     └─> setEditMode(true)                                           │
│                                                                     │
│  2. User clicks field                                               │
│     └─> startEditing(field, value)                                  │
│         └─> setEditingField(field)                                  │
│         └─> setTempValue(value)                                     │
│                                                                     │
│  3. User types new value                                            │
│     └─> setTempValue(newValue)                                      │
│                                                                     │
│  4. User clicks save                                                │
│     └─> saveField(field)                                            │
│         └─> axios.put('/parks/id/{id}', {field: value}, authHeader) │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTP PUT
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Flask)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  5. @admin_required decorator                                       │
│     └─> Validates JWT token                                         │
│     └─> Checks role == 'admin'                                      │
│                                                                     │
│  6. ParkById.put(park_id, current_user)                             │
│     └─> data = request.json                                         │
│     └─> pqry.update(park_id, data)                                  │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  7. db.parks.updateOne(                                             │
│       { "_id": ObjectId("...") },                                   │
│       { "$set": { "description": "New value" } }                    │
│     )                                                               │
│                                                                     │
│  8. Returns updated document                                        │
│                                                                     │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RESPONSE PATH                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  9. Backend returns { "Park": updatedParkObject }                   │
│                                                                     │
│  10. Frontend receives response                                     │
│      └─> setPark({ ...park, [field]: valueToSave })                 │
│      └─> setEditingField(null)                                      │
│      └─> showMessage('success', 'Saved!')                           │
│                                                                     │
│  11. UI re-renders with new value                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Files Summary

| Layer | File | Purpose |
|-------|------|---------|
| Frontend | `ParkEditor.jsx` | UI component, state management, API calls |
| Frontend | `AuthContext.jsx` | JWT token storage, auth headers |
| Backend | `endpoints.py` | API routes, request handling |
| Backend | `security.py` | JWT validation, admin decorator |
| Backend | `parks/queries.py` | Database operations for parks |
| Database | `db_connect.py` | MongoDB connection and operations |
