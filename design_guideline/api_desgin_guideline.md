# API 开发规范

## 目录结构

```
src/api/
├── api-config.js          # API 配置文件，用于管理真实和 mock API
├── api.js                 # 真实 API 实现
└── mock/                  # mock API 目录
    ├── api.js             # mock API 实现
```

- 当你要实现来自yaml文件的api方法时，应该先检查src/api/目录下是否已经有实现了对应的方法了，如果有，则直接使用，如果没有，才需要实现
- 真实 API 文件名称和 Mock API 文件名称保持一致，真实 API 文件 放在 `src/api/` 目录下，mock API 文件 放在 `src/api/mock/` 目录下
- 真实 API 文件里的方法都是来自api_specs目录下的yaml文件某个api spec, 方法名来自yaml文件里的operationId, 其他部分也应该和yaml文件里的定义保持一致
- 在 api-config.js 中注册, 以newFeatureApi为例
  - 导入真实 API 和 mock API
  - 在 api 对象中添加新的服务
  - 示例：

```javascript
import { newFeatureApi } from './new-feature'
import { newFeatureApi as mockNewFeatureApi } from './mock/new-feature'

export const api = {
  // ... 其他服务
  newFeature: IS_MOCK_ENV ? mockNewFeatureApi : newFeatureApi
}
```