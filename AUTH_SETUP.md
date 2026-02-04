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


# Authentication & Security Checklist

## ✅ Implemented Security Measures

### API Authentication

All critical API endpoints now require authentication:

#### Instance Management (CRITICAL - Docker Container Access)
- ✅ `POST /api/instances` - Create container instance
  - Requires: User authentication
  - Validates: User can only create instances for themselves
- ✅ `GET /api/instances/[id]` - Get instance details
  - Requires: User authentication
  - Validates: User owns the instance
- ✅ `DELETE /api/instances/[id]` - Delete instance
  - Requires: User authentication
  - Validates: User owns the instance
- ✅ `POST /api/instances/[id]/pause` - Pause instance
  - Requires: User authentication
  - Validates: User owns the instance
- ✅ `POST /api/instances/[id]/unpause` - Unpause instance
  - Requires: User authentication
  - Validates: User owns the instance

#### Admin Endpoints
- ✅ `POST /api/files` - Upload challenge files
  - Requires: Admin role
- ✅ `POST /api/admin/cleanup` - Cleanup expired containers
  - Requires: Admin role OR admin secret header (for cron jobs)

#### Public Endpoints (No Auth Required)
- ✅ `POST /api/check-answer` - Check challenge answers
  - Public access (part of CTF gameplay)
- ✅ `POST /api/auth/login` - User login
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/logout` - User logout
- ✅ `GET /api/auth/me` - Get current user

### Authentication Implementation

**Helper Functions** (`lib/auth.ts`):
- `verifyApiAuth(request)` - Verifies JWT token from cookies, returns user data or null
- `verifyApiAdmin(request)` - Verifies user is admin, returns boolean

**Usage Pattern**:
```typescript
import { verifyApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Verify authentication
  const user = await verifyApiAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  // Verify ownership if needed
  if (resource.userId !== user.userId) {
    return NextResponse.json(
      { error: 'Forbidden - Access denied' },
      { status: 403 }
    );
  }

  // Continue with authenticated logic...
}
```

### Server-Level Security

#### SSH Hardening
- ✅ Root login disabled
- ✅ Password authentication disabled
- ✅ SSH key-only authentication
- ✅ Limited to specific user (`AllowUsers corey`)
- ✅ MaxAuthTries set to 3
- ✅ LoginGraceTime set to 30 seconds

#### Firewall Protection
- ✅ Digital Ocean Cloud Firewall configured
  - Allows: 22 (SSH), 80 (HTTP), 443 (HTTPS)
  - Denies: All other inbound traffic
- ✅ Fail2ban installed for SSH brute force protection

#### Application Security
- ✅ HTTPS/SSL enabled via Certbot
- ✅ Nginx reverse proxy
- ✅ PM2 process manager
- ✅ All npm packages updated to latest versions
- ✅ Critical vulnerabilities patched

### Database Security
- ✅ SSL mode set to `verify-full`
- ✅ Direct database URL uses secure connection
- ✅ Prisma Accelerate for connection pooling

## �️ Terminal Security Architecture

### Multi-Layer Security Model for Docker Containers

The terminal instances use a **defense-in-depth** approach with 6 security layers:

#### Layer 1: User Authentication (JWT Cookie)
- All `/api/instances` endpoints require valid JWT authentication
- Users can only create/manage their own containers
- Anonymous users cannot spawn containers
- Prevents container spam and unauthorized access

```typescript
// User authentication verification
const user = await verifyApiAuth(request);
if (!user) return 401 Unauthorized;

// Ownership validation
if (instance.userId !== user.userId) return 403 Forbidden;
```

#### Layer 2: Localhost-Only Port Binding
**Most Critical Security Feature**

```typescript
PortBindings: {
  '7681/tcp': [{ HostIp: '127.0.0.1', HostPort: 8001 }]
}
```

- Terminal ports (8000-9000) are bound to **127.0.0.1 ONLY**
- External internet CANNOT access these ports directly
- Only the Next.js server (running on same machine) can connect
- Port scanning from internet reveals nothing
- Even if attacker knows port number, they cannot reach it

**Attack Prevention:**
- ❌ External port scan attacks blocked
- ❌ Direct terminal access from internet impossible
- ❌ Port guessing attacks ineffective
- ✅ Only server-side proxy can access terminals

#### Layer 3: Nginx Reverse Proxy
```
Internet → Nginx:443 (HTTPS) → Next.js:3000 → Container:127.0.0.1:8001
```

- All traffic flows through HTTPS
- Single controlled access point
- Additional authentication layer
- SSL/TLS encryption for all connections

#### Layer 4: Resource Limits
```typescript
Memory: 512 * 1024 * 1024,  // 512MB RAM limit
CpuShares: 512,              // CPU quota
```

**Prevents:**
- Memory exhaustion attacks
- CPU hogging
- Denial of service via resource consumption
- Runaway processes from affecting other users

#### Layer 5: Per-User Container Isolation
```typescript
containerName: `ctf-${challengeSlug}-${userId}-${timestamp}`
```

- Each user gets dedicated container instance
- No shared filesystem or processes between users
- Work is isolated and persistent per user
- Container names prevent collision and unauthorized access

#### Layer 6: Database Ownership Validation
- Instance ownership stored in PostgreSQL
- Every API call validates userId matches instance owner
- Database queries enforce userId constraints
- Audit trail of who created what container

### Security Flow: Creating a Terminal

```
1. User clicks "Start Terminal" in browser
   ↓
2. Browser sends POST /api/instances with JWT cookie
   ↓
3. verifyApiAuth() checks JWT signature and validity
   ↓
4. Endpoint validates userId matches authenticated user
   ↓
5. Docker creates container bound to 127.0.0.1:8xxx
   ↓
6. Instance saved to DB with userId ownership
   ↓
7. Frontend receives instance info (only for that user)
   ↓
8. Terminal connects through Next.js proxy
   ↓
9. All subsequent access requires authentication + ownership
```

### Attack Vectors Blocked

| Attack Type | Prevention Mechanism |
|------------|---------------------|
| Unauthenticated container creation | JWT cookie verification |
| Container spam/DOS | Rate limiting + auth requirement |
| Direct port access | Localhost-only binding |
| Port scanning | 127.0.0.1 binding hides ports |
| Cross-user terminal access | Ownership validation in DB |
| Resource exhaustion | Memory/CPU limits per container |
| Privilege escalation | Non-root container execution |
| Container escape | Docker security + resource limits |

### Why This Matters

**Without localhost binding (127.0.0.1):**
- ❌ Container ports would be accessible from internet
- ❌ Port 8001 could be attacked directly
- ❌ Attackers could bypass app authentication
- ❌ Need complex authentication at container level

**With localhost binding:**
- ✅ Ports invisible to external network
- ✅ Must go through authenticated Next.js app
- ✅ Single authentication point (JWT)
- ✅ Nginx acts as security gateway

### Developer Guidelines for Terminal Features

When working with terminal instances:

1. **NEVER expose container ports to 0.0.0.0**
   - Always use `HostIp: '127.0.0.1'`
   - This is the primary security boundary

2. **ALWAYS verify authentication**
   - Use `verifyApiAuth()` on all instance endpoints
   - Never trust client-provided userId

3. **ALWAYS validate ownership**
   - Check `instance.userId === authenticatedUser.userId`
   - Don't allow cross-user operations

4. **ALWAYS set resource limits**
   - Memory limits prevent RAM exhaustion
   - CPU limits prevent performance degradation

5. **NEVER return sensitive container info**
   - Don't expose container IDs to unauthorized users
   - Filter response data based on ownership

### Testing Terminal Security

**Verify localhost binding:**
```bash
# From external machine - should FAIL
curl http://YOUR_SERVER_IP:8001

# From server - should work only with auth
curl http://127.0.0.1:8001
```

**Verify authentication:**
```bash
# Without login cookie - should return 401
curl -X POST http://your-domain/api/instances \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","challengeId":"123"}'
```

**Verify ownership:**
```bash
# Try to access another user's instance - should return 403
curl http://your-domain/api/instances/OTHER_USER_INSTANCE_ID \
  -b "auth-token=YOUR_JWT"
```

## �🔒 Security Best Practices

### When Adding New API Endpoints

**Always ask these questions:**

1. **Does this endpoint access or modify user data?**
   - YES → Add `verifyApiAuth()` check
   - Verify user owns the resource

2. **Does this endpoint perform admin operations?**
   - YES → Add `verifyApiAdmin()` check

3. **Does this endpoint create system resources (containers, files)?**
   - YES → Require authentication + ownership validation

4. **Is this endpoint truly public (like challenge questions)?**
   - Only allow if it's part of intended gameplay
   - Consider rate limiting even for public endpoints

### Code Review Checklist

Before deploying changes, verify:

- [ ] All new API routes have appropriate authentication
- [ ] User ownership is verified for resource access
- [ ] Admin-only operations check for admin role
- [ ] Error messages don't leak sensitive information
- [ ] Input validation is performed on all user data
- [ ] SQL injection is prevented (use Prisma parameterized queries)
- [ ] File uploads are validated and size-limited
- [ ] Rate limiting is considered for resource-intensive operations

## 🚨 Security Incident Response

### If You Suspect a Breach:

1. **Immediately rotate all secrets:**
   ```bash
   # On server
   nano .env
   # Change JWT_SECRET, AWS keys, database passwords
   
   # Restart application
   pm2 restart rustyByte
   ```

2. **Check for unauthorized containers:**
   ```bash
   docker ps -a
   # Look for unexpected containers
   
   # View container logs
   docker logs <container-id>
   ```

3. **Review system logs:**
   ```bash
   # Check auth logs for suspicious SSH attempts
   sudo tail -100 /var/log/auth.log
   
   # Check nginx access logs
   sudo tail -100 /var/log/nginx/access.log
   
   # Check fail2ban status
   sudo fail2ban-client status sshd
   ```

4. **Review database for unauthorized changes:**
   ```bash
   # Check for new admin users
   npm run db:studio
   # Or query directly
   ```

5. **Update dependencies:**
   ```bash
   npm audit
   npm update
   ```

## 📋 Regular Maintenance Tasks

### Weekly
- [ ] Review nginx access logs for suspicious patterns
- [ ] Check PM2 logs for errors: `pm2 logs rustyByte --lines 100`
- [ ] Verify SSL certificate status: `sudo certbot certificates`

### Monthly
- [ ] Update npm packages: `npm outdated` then `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Review user accounts for suspicious activity
- [ ] Clean up old Docker containers: `docker system prune -a`

### Quarterly
- [ ] Rotate JWT_SECRET and other secrets
- [ ] Review and update firewall rules
- [ ] Check for OS security updates: `sudo apt update && sudo apt upgrade`
- [ ] Review fail2ban rules and banned IPs

## 🔐 Environment Variables Checklist

Required secrets in `.env`:

- [ ] `JWT_SECRET` - Long, random string (never commit!)
- [ ] `DATABASE_URL` - Prisma connection string
- [ ] `DIRECT_DATABASE_URL` - Direct PostgreSQL connection
- [ ] `AWS_ACCESS_KEY_ID` - AWS S3 credentials
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS S3 secret
- [ ] `AWS_REGION` - AWS region
- [ ] `S3_BUCKET_NAME` - S3 bucket name
- [ ] `ADMIN_SECRET` - For automated cleanup jobs (optional)

**NEVER commit `.env` file to git!**

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Docker Security](https://docs.docker.com/engine/security/)

## 🎯 Future Security Enhancements

Consider implementing:

- [ ] Rate limiting on API endpoints (e.g., using `express-rate-limit`)
- [ ] CORS configuration for production
- [ ] CSP (Content Security Policy) headers
- [ ] Request logging and monitoring
- [ ] 2FA for admin accounts
- [ ] Automated security scanning in CI/CD
- [ ] Container resource limits (CPU/memory)
- [ ] Network isolation for Docker containers
- [ ] Intrusion detection system (IDS)
- [ ] Regular automated backups

---

**Last Updated:** January 31, 2026
**Maintained By:** Security Team
