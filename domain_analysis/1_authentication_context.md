# 身份认证上下文设计

## 聚合

### 用户认证聚合（UserAuthentication）

#### 聚合根：UserCredential
```typescript
class UserCredential {
  // 标识符
  userId
  username
  
  // 属性
  password
  role
  
  // 方法
  validatePassword(inputPassword)  // 验证密码是否正确
  changePassword(newPassword)     // 修改密码
}
```

### 用户会话聚合（UserSession）

#### 聚合根：Session
```typescript
class Session {
  // 标识符
  sessionId
  
  // 属性
  userId
  token
  expiresAt
  lastAccessedAt
  
  // 方法
  isValid()             // 检查会话是否有效
  refresh()            // 刷新会话
  terminate()          // 终止会话
  updateLastAccessed() // 更新最后访问时间
}
```

## 值对象

### UserRole
```typescript
enum UserRole {
  WORKER
  SUPERVISOR
  MANAGER
  CUSTOMER
  SYSTEM_ADMIN
}
```

### AuthenticationToken
```typescript
class AuthenticationToken {
  token
  expiresAt
  
  isExpired()         // 检查令牌是否过期
  getRemainingTime()  // 获取剩余有效时间
}
```

## 领域服务

### AuthenticationService（认证服务）
```typescript
interface AuthenticationService {
  // 核心职责：处理用户认证和会话管理的核心逻辑
  // 这些逻辑不适合放在实体中，因为它涉及多个聚合（UserCredential和Session）的协作
  
  // 用户认证，返回认证令牌
  // 输入：用户名和密码
  // 输出：认证令牌
  // 业务意义：验证用户身份并生成认证令牌
  authenticate(username: string, password: string): Promise<AuthenticationToken>
  
  // 验证令牌有效性
  // 输入：认证令牌
  // 输出：令牌是否有效
  // 业务意义：验证令牌的有效性
  validateToken(token: string): Promise<boolean>
  
  // 用户登出
  // 输入：用户ID
  // 输出：无
  // 业务意义：用户登出，清理相关会话
  logout(userId: string): Promise<void>
  
  // 刷新令牌
  // 输入：当前令牌
  // 输出：新的认证令牌
  // 业务意义：在令牌即将过期时更新令牌
  refreshToken(token: string): Promise<AuthenticationToken>
  
  // 依赖关系：
  // - 需要访问 UserCredential 聚合
  // - 需要访问 Session 聚合
  // - 需要访问 UserCredentialRepository
  // - 需要访问 SessionRepository
}
```

### SessionService（会话服务）
```typescript
interface SessionService {
  // 核心职责：管理用户会话的生命周期
  // 这些逻辑不适合放在实体中，因为它需要处理会话的创建、验证和清理等复杂操作
  
  // 创建会话
  // 输入：用户ID和认证令牌
  // 输出：会话信息
  // 业务意义：为认证用户创建新的会话
  createSession(userId: string, token: string): Promise<Session>
  
  // 获取会话
  // 输入：认证令牌
  // 输出：会话信息
  // 业务意义：根据令牌获取对应的会话信息
  getSession(token: string): Promise<Session>
  
  // 验证会话
  // 输入：认证令牌
  // 输出：会话是否有效
  // 业务意义：验证会话的有效性
  validateSession(token: string): Promise<boolean>
  
  // 刷新会话
  // 输入：认证令牌
  // 输出：更新后的会话信息
  // 业务意义：延长会话的有效期
  refreshSession(token: string): Promise<Session>
  
  // 终止会话
  // 输入：认证令牌
  // 输出：无
  // 业务意义：主动终止用户会话
  terminateSession(token: string): Promise<void>
  
  // 清理过期会话
  // 输入：无
  // 输出：清理的会话数量
  // 业务意义：定期清理系统中的过期会话
  cleanExpiredSessions(): Promise<number>
  
  // 依赖关系：
  // - 需要访问 Session 聚合
  // - 需要访问 SessionRepository
}
```

## 仓储

### UserCredentialRepository
```typescript
interface UserCredentialRepository {
  findByUsername(username)
  findById(userId)
  save(credential)
  updatePassword(userId, newPassword)
}
```

### SessionRepository
```typescript
interface SessionRepository {
  save(session)
  findByToken(token)
  findByUserId(userId)
  delete(sessionId)
  deleteExpired()
}
```

## 领域事件

### UserAuthenticatedEvent
```typescript
class UserAuthenticatedEvent {
  userId
  timestamp
  role
}
```

### UserLoggedOutEvent
```typescript
class UserLoggedOutEvent {
  userId
  timestamp
}
```

### SessionCreatedEvent
```typescript
class SessionCreatedEvent {
  sessionId
  userId
  timestamp
}
```

### SessionTerminatedEvent
```typescript
class SessionTerminatedEvent {
  sessionId
  userId
  timestamp
  reason  // 可能的值：LOGOUT（登出）、EXPIRED（过期）、FORCED（强制终止）
}
```

## 防腐层（ACL）

### AuthenticationFacade
```typescript
interface AuthenticationFacade {
  // 获取当前用户信息
  getCurrentUser()
  
  // 检查是否已认证
  isAuthenticated()
  
  // 检查是否有特定权限
  hasPermission(permission)
}

interface UserInfo {
  userId
  username
  role
  permissions
}
```

## 上下文管理器

### SecurityContext
```typescript
class SecurityContext {
  // 管理当前请求的认证上下文
  setCurrentToken(token)    // 设置当前上下文的令牌
  getCurrentToken()         // 获取当前上下文的令牌
  clearCurrentToken()       // 清除当前上下文的令牌
}
```