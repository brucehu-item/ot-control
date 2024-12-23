**登录流程**

`用户登录` -> `认证服务` -> `会话服务` -> `上下文管理` 的完整流程如下：

- 用户提供用户名和密码
- `AuthenticationService` 处理认证流程：
  - 通过 `UserCredentialRepository` 查找用户凭证
  - 使用 `UserCredential` 的 `validatePassword` 验证密码
  - 验证成功后生成 `AuthenticationToken`
  - 触发 `UserAuthenticatedEvent` 事件

- `SessionService` 创建会话：
  - 调用 `createSession` 创建新的会话
  - 将会话信息保存到 `SessionRepository`
  - 触发 `SessionCreatedEvent` 事件

- `SecurityContext` 管理当前会话：
  - 调用 `setCurrentToken` 设置当前令牌

**获取用户信息流程**

`请求用户信息` -> `防腐层` -> `会话验证` -> `返回用户信息` 的完整流程如下：

- 通过 `AuthenticationFacade` 获取用户信息：
  - `SecurityContext` 获取当前令牌
  - `SessionService` 验证会话有效性
  - `UserCredentialRepository` 获取用户详细信息
  - 返回 `UserInfo` 对象

**关键设计亮点**

- `防腐层设计`：通过 `AuthenticationFacade` 隔离认证细节，提供简单的接口给外部使用
- `会话管理`：使用 `Session` 聚合管理用户会话的完整生命周期
- `上下文管理`：使用 `SecurityContext` 在请求范围内管理认证状态
- `事件驱动`：使用领域事件（如 `UserAuthenticatedEvent`）实现系统解耦
- `仓储模式`：通过 `UserCredentialRepository` 和 `SessionRepository` 实现数据访问的抽象

这种设计实现了认证和用户信息获取的解耦，同时保持了它们之间的有序协作。
