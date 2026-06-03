# Frontend - React + Vite + Redux + Tailwind

## Project Structure

```
frontend/
├── src/
│   ├── assets/              - Images, icons
│   ├── components/          - Reusable React components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Button.jsx
│   │   └── Card.jsx
│   ├── pages/               - Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── MainItems.jsx
│   │   ├── Transactions.jsx
│   │   ├── Notifications.jsx
│   │   └── Reports.jsx
│   ├── layouts/             - Layout components
│   │   ├── DashboardLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── redux/               - Redux store & slices
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── mainSlice.js
│   │   ├── userSlice.js
│   │   └── transactionSlice.js
│   ├── services/            - API service calls
│   │   ├── api.js           - Axios instance
│   │   ├── authApi.js
│   │   ├── mainApi.js
│   │   ├── userApi.js
│   │   ├── transactionApi.js
│   │   ├── notificationApi.js
│   │   └── reportApi.js
│   ├── utils/               - Utility functions
│   ├── App.jsx              - Main app component
│   ├── main.jsx             - Entry point
│   └── index.css            - Global styles
├── index.html
├── package.json
├── vite.config.js
└── .env

```

## Tech Stack

- **React 18+** - UI framework
- **Vite** - Build tool (fast HMR)
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Redux** - Redux integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Access at: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Features

### Authentication
- Login/Signup with JWT token
- Token stored in localStorage
- Protected routes with Redux auth state
- Automatic token refresh in API interceptor

### State Management (Redux)
- **authSlice** - User login/signup state
- **mainSlice** - Main resource items
- **userSlice** - User list management
- **transactionSlice** - Transaction data

### API Integration
- Centralized axios instance with JWT interceptor
- Service layer for each backend service
- Error handling and token validation
- Automatic Authorization header injection

### Components
- **Sidebar** - Navigation menu with logout
- **Navbar** - Header with user info
- **Card** - Reusable card component
- **Button** - Reusable button component

### Pages
- **Login** - User authentication
- **Signup** - New user registration
- **Dashboard** - Overview with statistics
- **Users** - User management table
- **MainItems** - Main resource CRUD
- **Transactions** - Transaction records
- **Notifications** - User notifications
- **Reports** - Analytics & reports

## API Services

### authApi.js
```javascript
loginUser(data)         // POST /auth/login
signupUser(data)        // POST /auth/signup
getProfile()            // GET /auth/profile
```

### mainApi.js
```javascript
createItem(data)        // POST /main
getItems()              // GET /main
getItemById(id)         // GET /main/:id
updateItem(id, data)    // PUT /main/:id
deleteItem(id)          // DELETE /main/:id
```

### userApi.js
```javascript
createUser(data)        // POST /users
getUsers()              // GET /users
getUserById(id)         // GET /users/:id
updateUser(id, data)    // PUT /users/:id
deleteUser(id)          // DELETE /users/:id
```

### transactionApi.js
```javascript
createTransaction(data)        // POST /transactions
getTransactions()              // GET /transactions
getTransactionById(id)         // GET /transactions/:id
updateTransaction(id, data)    // PUT /transactions/:id
deleteTransaction(id)          // DELETE /transactions/:id
```

### reportApi.js
```javascript
getDashboard()          // GET /reports/dashboard
getMonthly()            // GET /reports/monthly
getStatus()             // GET /reports/status
```

## Redux Store Usage

### Get Auth State
```javascript
const { user, token, loading, error } = useSelector((state) => state.auth);
```

### Get Main Items
```javascript
const { items, loading, error } = useSelector((state) => state.main);
const dispatch = useDispatch();
dispatch(fetchItems());
```

### Login
```javascript
const dispatch = useDispatch();
dispatch(login({ email, password }));
```

### Logout
```javascript
dispatch(logout());
```

## API Endpoints (via API Gateway)

All requests go through: `http://localhost:4000/api`

```
/api/auth/login              - Login
/api/auth/signup             - Signup
/api/users                   - User management
/api/main                    - Main resource
/api/transactions            - Transactions
/api/notifications           - Notifications
/api/reports                 - Reports
/api/audit-logs              - Audit logs
```

## Routing

### Protected Routes
All routes except `/` and `/signup` require authentication token

```
/                   - Login page (public)
/signup             - Signup page (public)
/dashboard          - Dashboard (protected)
/users              - Users page (protected)
/items              - Main items (protected)
/transactions       - Transactions (protected)
/notifications      - Notifications (protected)
/reports            - Reports (protected)
```

## Customization

### Change API Gateway URL
Edit `.env`:
```env
VITE_API_URL=http://your-api:4000/api
```

### Add New Service Integration
1. Create new file in `src/services/resourceApi.js`
2. Create Redux slice in `src/redux/resourceSlice.js`
3. Add to store in `src/redux/store.js`
4. Create page component in `src/pages/`
5. Add route in `src/App.jsx`

### Add New Component
1. Create component in `src/components/`
2. Import and use in pages
3. Extend Tailwind classes as needed

### Styling
- Using Tailwind CSS utility classes
- Global styles in `src/index.css`
- Component-specific styles in JSX using className

## Common Tasks

### Display Data from API
```javascript
useEffect(() => {
  dispatch(fetchItems());
}, [dispatch]);

const { items, loading } = useSelector((state) => state.main);
```

### Submit Form Data
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await dispatch(addItem(formData));
};
```

### Show Loading State
```javascript
{loading ? <p>Loading...</p> : <div>{/* content */}</div>}
```

### Access User Info
```javascript
const { user } = useSelector((state) => state.auth);
<span>{user?.full_name}</span>
```

## Troubleshooting

### CORS Issues
- API Gateway should have CORS enabled
- Check backend CORS middleware

### Token Expired
- Token valid for 1 day
- Re-login to get new token

### API 401 Unauthorized
- Check token in localStorage
- Verify on backend that user exists

### CSS Not Loading
- Check Tailwind config
- Ensure `src/index.css` imports Tailwind
- Rebuild with `npm run dev`

## Production Build

```bash
npm run build
npm run preview
```

Build output in `dist/` folder - ready for deployment.
