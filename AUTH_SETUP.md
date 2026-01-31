# User Authentication System


### 2. **Authentication Infrastructure**

- **JWT Token Management**: Secure token generation, verification, and cookie handling
- **Password Security**: Bcrypt hashing with configurable salt rounds (12)
- **Cookie-based Sessions**: HTTPOnly cookies with secure settings for production
- **Password Validation**: Strong password requirements (8+ chars, uppercase, lowercase, numbers)
- **Email Validation**: Proper email format checking

### 3. **API Endpoints**

- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/me` - Current user information

### 4. **Route Protection**

- Middleware to protect sensitive routes (`/admin`, `/profile`, `/dashboard`)
- Automatic redirects for unauthenticated users
- Redirect authenticated users away from auth pages

### 5. **React Components & Context**

- `AuthProvider` - React context for global auth state
- `LoginForm` - User login interface with error handling
- `RegisterForm` - User registration with password confirmation
- Updated `TopNav` - Dynamic login/logout buttons and user info
- `Dashboard` - Protected user dashboard with quick actions
- `Profile` - User profile management page

### 6. **Pages**

- `/login` - Login page with form validation
- `/register` - Registration page with password requirements
- `/dashboard` - Protected dashboard for authenticated users
- `/profile` - User profile information display



### Registration Flow

1. User visits `/register`
2. Fills out email, username, password (with validation)
3. Password is hashed and user is created
4. JWT token is generated and stored in secure cookie
5. User is redirected to dashboard

### Login Flow

1. User visits `/login`
2. Provides email and password
3. Password is verified against hash
4. JWT token is generated and stored in cookie
5. User is redirected to dashboard

### Protected Routes

- Users must be authenticated to access `/dashboard`, `/profile`, `/admin`
- Unauthenticated users are redirected to login
- Authenticated users are redirected away from auth pages
