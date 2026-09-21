# Angular 实现标准

适用 Angular 路径，非迁移指令。先核对 Angular 主版本、CLI/Nx target、现有状态库和浏览器基线。

新工程按 [工具链标准](tooling.md) 使用 pnpm 和 Angular CLI 官方 application builder；存量工程及其新增应用沿用现有配置，不为统一 Vite 更换构建链。

- HTTP：复用 HttpClient、项目 interceptor 与 data-access service。将 DTO/业务映射和 token 策略与组件分离；公共/no-auth、401、refresh 并发依契约处理。
- 路由：Angular Router 按业务域 lazy route；项目/资源 ID 来自路由上下文，不散落全局变量。验证深链刷新、返回、guard 与子路由匹配。
- 状态：局部 UI 使用项目支持的 Signals；异步取消、并发与流组合采用 RxJS。既有 NGXS/NgRx 不因本规则被替换；跨组件共享的所有权、缓存失效必须明确。
- 生命周期：订阅、定时器、事件及挂载资源随组件/应用销毁释放，采用当前版本支持的生命周期工具。
- 表单：优先现有 Typed Reactive Forms 模式；控件、校验和只读展示分开，服务端错误映射到字段。
- 组织：按 feature/domain 组织 component、data-access、model；共享纯 TS 规则不依赖 Angular DI。
- 新增代码采用目标版本支持的 standalone/template 写法，不把新 API 带入未支持版本。
- 工具：CLI application builder 的生产构建与 Vite 开发服务器不是同一概念。直用 vite build 需要已验证的适配器/版本组合，不能仅因存在插件就声称兼容。
- 验证：类型和 Angular 模板检查、service/component 测试、浏览器路由与表单回归；单独 tsc 不能代替模板检查。

本 profile 没有安装 Angular，也没有验证目标应用。命令必须由项目显式配置；Nx 项目复用其 target 和包管理器。
