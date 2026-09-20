# Agent Kit

独立维护的 Agent 工程标准与轻量 Harness：把已经沉淀的经验，变成**项目可接入、版本可固定、过程可检查、结果有证据**的开发方式。

它不是业务前端框架，也不是新的聊天/Agent 调度平台。你仍在目标业务仓库中开发，而不是每次到这里发业务需求。

名称、包与公共规范不绑定任何公司。公司业务项目、客户项目和个人项目都可按需接入；产品专属约束保留在目标项目中。当前 npm 包为 private，名称仅用于本地工程，不表示已注册或发布公共包。

## 已具备

- 8 个配置集、9 份规则：公共工程、工作流程、前端、Angular、Vue、React、后端、微前端、运营后台。
- 7 个按需 Skills：任务闭环、证据审查、UI、接口契约、数据变更、CRUD、导入诊断。
- 无第三方运行时依赖的 CLI：预览接入、受保护安装、版本/摘要锁定、完整性检查、就绪诊断、本地验证报告。
- 安装与 runner 自动回归测试，以及独立的 Agent 行为评估场景。

公共规范定义边界，框架规范定义实现差异，业务仓库保留自己的事实和例外。不强行将 Angular 的 HTTP/路由/状态方式套给 Vue/React，不把现有组件库推广为所有项目唯一选择。

## 现在怎么用

需要 Node >=22。在本仓库目录运行，无需安装依赖：

```sh
npm run check
node bin/agent-kit.mjs profiles
```

给一个已有项目接入 Angular 前端规则，先预览（将路径替换成真实项目）：

```sh
node bin/agent-kit.mjs install --target /absolute/your-project --profiles frontend,angular
```

审核后才写入：

```sh
node bin/agent-kit.mjs install --target /absolute/your-project --profiles frontend,angular --apply
```

接着在目标项目完成三件事：

1. 填写 `.agent-kit/project.md`：真实技术栈、目录、组件/token 基线、接口与环境边界。
2. 编辑 `.agent-kit/project.json`：按应用声明 scopes，填入**已经审核的实际本地检查命令**，将 configured 改为 true。
3. 运行下列命令；将 AGENTS、规则、Skills、配置与 lock 一并纳入业务项目版本控制。报告和备份不必提交。

```sh
node .agent-kit/tools/bin/agent-kit.mjs doctor --target .
node .agent-kit/tools/bin/agent-kit.mjs verify --target .
node .agent-kit/tools/bin/agent-kit.mjs verify --target . --execute
```

verify 默认只预览。空命令列表不会通过，安装成功也不等于业务质量验证成功。

**今后的工作入口仍是业务仓库。** 新会话先确认 Agent 已读有效 AGENTS、项目事实和所需 Skill；需求明确时完成整个闭环，不要求每个虚拟角色轮流等你说“继续”。遇到真正的业务决策、权限边界、不可逆操作再停下。

四个角色是职责，不是固定四轮对话：小修改直接完成实现和验证，普通功能先明确验收再连续推进；高风险部分在关键决定或执行授权缺失时暂停。诊断保持只读，用户明确要求分步时照办。完整定义见 [风险分级开发流程](standards/workflow.md)。

## 选什么配置集

| 项目 | 推荐 profiles |
| --- | --- |
| 新 Angular 前端 | `frontend,angular` |
| 现有 Vue 前台 | `frontend,vue` |
| Vue 运营后台 | `frontend,vue,admin` |
| React 前端 | `frontend,react` |
| Nest/其他后端 | `backend`，按项目实际栈解释适用规则 |
| 多框架微前端 | 所需框架加 `microfrontend`，必须分别配置应用 scopes |

common 自动加入；framework/admin/microfrontend 自动引入 frontend。所有 profiles 是规则配置集，不是经过构建验证的应用脚手架。

## 工程结构

[工程结构说明](docs/structure.md) 是完整目录树和逐文件职责的唯一维护位置。README 负责项目概览和使用入口，详细说明不在两处重复维护。

规范在 `standards/`，任务方法在 `.agents/skills/`，工具实现在 `src/` 与 `bin/`，测试和行为评估分别在 `tests/` 与 `evals/`。

新增、删除、移动、重命名文件或调整职责时，必须同步更新结构说明；`npm run check` 会检查结构遗漏和过期路径，职责描述仍需审查。

## 以后主要维护哪里

- [工程结构逐文件说明](docs/structure.md)：每个目录和文件的职责，以及接入后目标工程中会出现什么。
- [通用工程规范](standards/common.md)：判断、边界、数据、证据。
- [前端规范](standards/frontend.md)：设计与交互；具体视觉 token 放业务仓库。
- [工作流程](standards/workflow.md)：按风险采用轻重不同的闭环。
- [任务模板](templates/task.md)：验收案例和交付证据。
- [配置与安全说明](docs/configuration.md)：命令、monorepo、升级和恢复。
- [架构与边界](docs/architecture.md)：为什么采用版本化副本，而非每次读取中央最新分支。
- [来源记录](docs/provenance.md)：三个参考项目提炼了什么、没有复制什么。
- [行为评估](evals/README.md)：如何确认 Agent 真正遵从，而非只通过文档检查。
- [交付与验证记录](docs/verification.md)：各轮实际运行结果与尚未验证的边界。

## 不做虚假承诺

- 在相邻目录放一个规范仓库，不会使所有项目自动继承。Codex 有项目内 AGENTS 和 `.agents/skills` 的发现范围，因此需要项目接入。[AGENTS 官方说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[Skills 官方说明](https://learn.chatgpt.com/docs/build-skills)。
- Skill 被发现不等于每次完整读取或绝对执行。需要清晰触发条件、任务证据、自动检查和行为评估共同约束；已按 Skill Creator 的简洁、明确触发原则编写。
- 未整体复制 ui-ux-pro-max，不依赖某个设计 Skill 保证 UI 一致。项目组件、token、被接受的页面与真实视觉验收才是基线。
- 本地命令不是沙箱，执行前仍要审核。工具不能自动保证 lint/test 脚本没有网络或数据库副作用。
- 首次创建没有修改参考项目。之后已按用户明确授权完成两个前端工程的本地接入，结果见 [交付与验证记录](docs/verification.md)；未自动推广到其他工程，未改全局配置、推送或发布。真实应用构建、浏览器验收、微前端 PoC 和独立模型行为评估仍在相应项目中进行。

## 版本维护

修改中央规则/Skills/工具后，同步提升 package.json 和 catalog.json 版本、运行 `npm run check`，审核变更，再由业务项目显式升级。不自动追踪 main，不覆盖项目手写文件。同版本内容改变会被已接入项目拒绝。

0.1.2 明确风险分级流程、角色职责、暂停条件和任务记录。已有项目需显式升级固定版本；若项目手写规则仍要求逐角色确认，需要维护者明确统一，安装器不会擅自删除它们。修改文件不会清除旧对话里的指令，重新启动目标目录的 Codex 运行后应核对实际加载的规则。[AGENTS 官方说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

先在一个低风险任务中接入试用并收集证据，再推广；不用一次搬运全部历史规则。首版不提供远程分发服务、自动卸载、插件市场发布或 LLM 自动评分。
