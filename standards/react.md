# React 实现标准

适用 React 路径。核对 React 版本、路由/构建框架；不把 SPA 建议强加给已有 SSR/RSC 工程。

新建客户端 SPA 按 [工具链标准](tooling.md) 使用 pnpm、Vite 和 TypeScript；SSR/RSC 使用所选框架官方构建链。存量工程保留原有工具。

- HTTP：集中 API client + feature data-access hooks，组件不复制鉴权。服务端数据可用项目已选 Query 层；缓存键包含身份/租户/语言/筛选，mutation 后明确失效。
- 路由：沿用现有 React Router 或应用框架路由；布局、资源加载、错误边界与权限有明确归属，不混建第二套路由。
- 状态：useState/useReducer 管局部；Context 传低频共享上下文，不承载所有高频服务器状态。是否增加 Zustand/Redux 等由真实需求决定。
- 不把可由 props/state 推导的值复制为另一个 state；effect 用于外部同步，正确清理与依赖，处理重复挂载及请求取消。
- hooks 以 use 开头；组件 PascalCase，props 明确；列表用稳定业务 key，不用 index 掩盖身份错误。
- 表单采用目标项目模式，保证输入受控策略一致、字段错误就近呈现、失败保留内容。
- 跨框架纯规则不依赖 hooks 或 React runtime；共享样式 token 而不是强行移植 Angular/Vue 组件。
- 验证 TypeScript、组件行为、路由/异步/错误边界及浏览器测试；Vite build 不等于类型检查。

这是实现标准候选基线，不表示本 Kit 含 React 应用模板或已跑通真实 React 项目。
