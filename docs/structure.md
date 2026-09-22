# 工程结构：每个目录和文件的职责

本文是逐目录、逐文件说明的唯一正文；[README](../README.md#工程结构) 只保留概览和入口。结构或职责变化时必须在同一次变更中更新，并运行 `npm run check`；不依赖后台监听或下一次对话补记。

## 先区分两个工程

**Agent Kit 是公共规范和工具的维护工程；业务工程是这些规范的使用方。**

公司项目、个人项目、客户项目都可以接入。公共仓库不保存某个产品的真实业务配置、凭据、员工数据或固定部署地址。它现在采用 Node CLI，不是业务前端应用，所以没有为了工具包本身引入 Angular/Vue/React 或 Vite 构建。

目录名和本地包名为 `agent-kit`，展示名为 **Agent Kit**。当前包保持 `private: true`；不表示已经在公共包注册表发布或占用该名称。

## 一、源工程逐文件地图

以下列出工程维护文件。目录后的说明是这一层的职责，文件后的说明是具体用途。

<!-- repository-structure:start -->
```text
agent-kit/
├── README.md                         项目首页：使用、接入、结构说明入口与边界
├── AGENTS.md                         修改 Agent Kit 自身时，Agent 要遵守的仓库规则
├── package.json                      本地包名称、版本、Node 要求和 npm 命令
├── catalog.json                      配置集清单：选择某个 profile 要带上哪些规则和 Skills
├── .gitignore                        本仓库不提交的内容：依赖、环境文件、测试产物等
│
├── standards/                        “应该遵守什么”：可复用的规范正文
│   ├── common.md                     所有项目的公共原则、任务边界、数据正确性、交付证据
│   ├── workflow.md                   角色职责、风险分级、连续执行与暂停条件、任务记录和证据交付
│   ├── tooling.md                    新工程工具链默认选型、版本锁定、CI、构建验收与存量兼容边界
│   ├── frontend.md                   前端设计、Tailwind、状态分层、类型模型、硬编码限制及维护审查
│   ├── frontend-design.md            UI/UX 基线、页面模式、设计确认、浏览器原型及外部 Skill 按需使用
│   ├── angular.md                    Angular 的 HTTP、路由、状态、表单、生命周期及验证
│   ├── vue.md                        Vue 的客户端、Router、Pinia、composable、组件及验证
│   ├── react.md                      React 的数据 hooks、路由、状态、effect、表单及验证
│   ├── backend.md                    后端模块、DTO、权限、数据、迁移与测试边界
│   ├── admin.md                      管理后台的列表、CRUD、复杂工作台、导入和附件操作
│   └── microfrontend.md              Shell/子应用、路由、状态与依赖共享、发布兼容边界
│
├── .agents/                          项目内的 Agent 扩展资源
│   └── skills/                       “这类任务怎么做”：按任务选择的工作方法
│       ├── kit-task/
│       │   └── SKILL.md              定义目标与验收，组织实现、检查、修正、交付的闭环
│       ├── kit-review/
│       │   └── SKILL.md              对照验收审查实现与证据，说明缺陷及未验证部分
│       ├── kit-ui-review/
│       │   └── SKILL.md              对照设计基线审查前端代码质量、实际视觉与交互证据
│       ├── kit-ui-design/
│       │   └── SKILL.md              将用户任务转为布局、交互与原型，按范围处理设计确认
│       ├── kit-api-contract/
│       │   └── SKILL.md              核对请求/响应、鉴权、ID 精度、状态映射和接口缺口
│       ├── kit-data-change/
│       │   └── SKILL.md              分析字段、schema、迁移、兼容性与数据风险
│       ├── kit-crud/
│       │   └── SKILL.md              选择 CRUD/工作台形态，处理表单、列表、保存和取消
│       └── kit-import-diagnose/
│           └── SKILL.md              跟踪导入解析、字段映射、预览、校验、入库各环节
│
├── bin/                              使用者运行的命令入口
│   └── agent-kit.mjs                 解析命令和参数、调用核心逻辑、输出结果和退出码
├── src/                              工具本身的实现
│   └── kit.mjs                       安装、摘要锁定、路径保护、备份、诊断和检查执行
├── scripts/                          维护本工程时使用的辅助脚本
│   ├── validate.mjs                  校验清单、版本、Skill 元数据、文档链接、评估定义及结构说明
│   └── structure.mjs                 比对 structure.md 结构树与源目录，报告缺项、过期路径和类型错误
│
├── templates/                        接入或记录任务时使用的可填写模板
│   ├── project.md                    项目事实模板：工程类别、工具链决策、目录、组件、接口和验收命令
│   ├── design-baseline.md            业务工程填写的设计基线模板：权威定义、页面模式、样板及确认依据
│   ├── ui-design.md                  页面设计记录模板：任务、原型、状态、证据及确认范围
│   └── task.md                       任务模板：目标、非目标、验收样例、风险和交付证据
│
├── tests/                            “工具代码是否正确”的自动测试
│   ├── kit.test.mjs                  隔离工程验证分发、第三方 Skill/项目基线保留、冲突、升级与执行
│   └── structure.test.mjs            验证结构漂移检测、隐藏文件、排除项与错误文档的处理
├── evals/                            “Agent 是否做对”的行为评估资料
│   ├── README.md                     评估方法、证据要求、重复执行与评分方式
│   └── scenarios.json                23 个评估场景：输入、准备条件、预期和禁止行为
│
├── docs/                             背景、设计、操作与验证记录
│   ├── architecture.md               为什么这样分层、分发策略、职责和不支持的能力
│   ├── configuration.md              project.json 格式、CLI 使用、安全、升级与恢复
│   ├── provenance.md                 规则来源、抽象方式、哪些原项目约定没有推广
│   ├── verification.md               实际做过的验证及尚未验证的范围
│   └── structure.md                  完整工程结构说明：目录地图、文件职责及维护入口
│
├── .github/                          GitHub 平台相关的自动化配置
│   └── workflows/
│       └── ci.yml                    提交/PR 的检查任务：Linux、Node 22/24 运行 npm run check
└── .git/                             Git 创建的本地版本库元数据，不是 Kit 的运行代码
```
<!-- repository-structure:end -->

检查器核对本树与实际源文件/目录，发现漏记、过期路径或文件/目录类型不符会失败。忽略 Git 元数据、依赖、`.agent-kit/`、coverage、系统文件和私有 `.env*`（保留 `.env.example`）；其他新增维护文件必须登记。文件说明须非空，说明是否准确仍需结合实现审查。

`.git/` 内的 HEAD、config、对象、索引与 hooks 等由 Git 或本地 Git 工具管理，不应当当作工程规范手工维护。当前未自动设置远程仓库或推送。点号目录只是隐藏目录约定，不表示它们不会被版本控制。

## 二、几个最容易混淆的概念

### standards 与 Skills

- `standards/frontend.md` 规定：长文本可查看全文、弹层不能越出视口、失败保留表单。
- `standards/frontend-design.md` 规定：设计依据、流程与确认边界、原型隔离及外部参考的使用方式。
- `kit-ui-design/SKILL.md` 描述：按用户任务制作布局、交互与原型，记录证据与设计决定。
- `kit-ui-review/SKILL.md` 描述：先读组件和样板，再检查长文本/小视口/失败状态，最后留下页面证据。

前者是规则，后者是做事方法。两者都不会因为文件存在，就自动变成运行过的测试。

每个 Skill 目前只有一个 `SKILL.md`：顶部的 name/description 描述身份与触发条件，正文描述工作方法。description 内容和正文采用中文，字段名与 Skill ID 保持原有英文标识。没有建立无用途的脚本或 references 空目录；以后确有必要时再扩展。

### catalog 与项目配置

`catalog.json` 里的条目是可复用的配置集（profiles），不是具体业务项目；它是中央仓库的“配方表”。例如 `angular` 配置集对应 Angular 规则；安装器还会自动加入 common 和 frontend。

业务工程中的 `.agent-kit/project.json` 是“这个项目怎么应用配方”：哪个目录是 Angular、哪个是 Vue、需要读哪些项目文档、可以执行哪些检查。修改公司项目配置，不会改变个人项目。

当前 catalog 已包含格式版本 `schemaVersion` 和发布版本 `version`。项目实际命令、目录、业务文档位置归项目配置，不放进 catalog。后续可按真实需求增加 profile 说明、显式依赖关系或按需模板清单，但必须同时实现安装解析、校验与测试；只添加未被工具读取的字段没有作用。当前依赖关系在安装器中实现，模板统一安装，尚未由这些扩展字段控制。

`common` 配置集包含 common/workflow/tooling 三份规范，frontend 包含 frontend/frontend-design 两份规范，所以当前 **8 个配置集对应 11 份规范**。tooling 规定新工程默认选型及存量边界，不会让安装器自动更换业务工程工具链。

### bin、src、scripts

- `bin/agent-kit.mjs`：命令行前台，只处理输入与输出。
- `src/kit.mjs`：真正执行工作的核心实现。
- `scripts/validate.mjs`：检查 Kit 自身资料是否完整，是维护工具，不是业务验证入口。

`.mjs` 是 JavaScript ES Module 文件，当前由 Node 直接执行，不需要先编译或打包。

### tests 与 evals

- `tests/` 验证确定性的程序行为，例如冲突时有没有拒绝覆盖、检查命令超时有没有失败。
- `evals/` 评估 Agent 的工作行为，例如它有没有识别大整数精度风险、有没有谎称浏览器验证通过。

`npm run check` 会运行工具测试，并检查评估场景的定义格式；**不会调用模型执行这 23 个场景**。场景涵盖流程边界、前端质量、工具链及数据契约；设计场景补充新设计确认、小修改连续完成、外部建议冲突、候选基线与只读审查。

### 根目录 AGENTS 与安装生成的 AGENTS 区块

本仓库的 `AGENTS.md` 约束修改 Kit 源码的工作。安装器不会原样把它覆盖到业务工程，而是在目标的 `AGENTS.md` 中追加受管理区块，指向目标工程内的规则与项目事实，保留其原有文字。

## 三、接入之后，业务工程中会出现什么

以下是目标项目接入后的结构，不是需要复制业务代码到 Agent Kit。onboarding.md 是本次人工接入时补充的可选记录，其余由安装器或验证命令生成：

```text
your-project/
├── AGENTS.md                         原文保留；新增 Kit 的规则读取入口
├── .agents/skills/kit-*/SKILL.md      根据所选配置集安装的 Skills
└── .agent-kit/
    ├── .gitignore                    默认忽略本地 reports、backups
    ├── lock.json                     固定 Kit 版本、配置集、内容摘要和受管理文件清单
    ├── project.json                  项目自己的配置：scopes、documents、checks
    ├── project.md                    项目自己的事实，由 project 模板初始化
    ├── onboarding.md                 可选的项目自有接入验收记录，非安装器自动生成
    ├── rules/*.md                    选中规范的固定版本副本
    ├── tools/
    │   ├── bin/agent-kit.mjs         本地命令入口，不依赖中央仓库路径
    │   └── src/kit.mjs               本地检查/诊断/验证实现
    ├── templates/
    │   ├── project.md               固定版本的项目事实模板
    │   ├── design-baseline.md       固定版本的设计基线模板，填写后保存在项目自有文档
    │   ├── ui-design.md             固定版本的页面设计与验收记录模板
    │   └── task.md                  固定版本的任务模板
    ├── backups/<批次>/               apply 有变更时保存原文件和恢复清单
    └── reports/<运行记录>.json       显式执行 verify 后的检查报告
```

`project.json` 的主要字段：

| 字段 | 用途 |
| --- | --- |
| schemaVersion | 配置文件格式版本，与 Kit 发布版本不是同一个概念 |
| configured | 是否已由项目维护者完成配置，初始为 false |
| scopes | 不同目录适用的规则配置集，支持一个仓库内多种框架 |
| documents | 需要读取的项目事实、设计约束等文档 |
| checks | 审核过的本地检查命令、工作目录、超时、是否必需与风险声明 |

`project.md` 和 `project.json` 由项目维护，升级不覆盖。可选的 onboarding.md 记录接入范围、基线缺口和验收结论，可随项目提交；reports 默认忽略，不能把只存在于本机的报告文件当作团队已共享证据。rules、tools、templates 和已安装 Skills 是受管理副本，不应直接改它们来表达某个项目的差异；否则完整性检查会报告漂移。项目差异放项目事实或适当的局部规则，公共改进在中央仓库修改并发布新版本。

## 四、你以后最常修改什么

| 你想做的事 | 维护位置 |
| --- | --- |
| 约束所有项目都遵守的原则 | standards/common.md |
| 调整任务流程和需要人工确认的边界 | standards/workflow.md |
| 确定新工程工具链及存量兼容原则 | standards/tooling.md |
| 统一跨框架的 UI 与交互原则 | standards/frontend.md |
| 确定设计基线、原型与确认流程 | standards/frontend-design.md、kit-ui-design；验收用 kit-ui-review |
| 调整某个框架的编码方式 | standards/angular.md、vue.md、react.md |
| 改进某类任务的操作方法 | 对应 Skill 的 SKILL.md |
| 新增或调整配置集的规则/Skill 组合 | catalog.json |
| 记录某个项目的设计 tokens、组件、环境与例外 | 该项目的 .agent-kit/project.md，不是中央规范 |
| 配置某个项目运行哪些验证 | 该项目的 .agent-kit/project.json |
| 改接入工具或验证执行能力 | src/kit.mjs、bin/agent-kit.mjs，并补 tests |
| 增加判断 Agent 是否可靠的场景 | evals/scenarios.json，并按评估方法实际运行 |

公共分发内容修改后同步提升 package.json/catalog.json 的版本，运行 `npm run check`，再显式升级目标项目。首次接入不要同时复制全部框架规范；选择实际需要的配置集即可。

## 五、核心命令的分工

| 命令 | 做什么 | 不代表什么 |
| --- | --- | --- |
| profiles | 列出可选配置集 | 不会安装任何文件 |
| install | 生成接入/升级计划，--apply 才写入 | 不会自动完成项目配置 |
| check | 检查安装内容与锁定摘要一致 | 不证明业务代码正确 |
| doctor | 在完整性检查上验证项目配置是否就绪 | 不证明检查命令已经运行 |
| verify | 列出检查计划，--execute 才运行并生成报告 | 不证明未配置的测试或浏览器验收通过 |

详细操作见 [配置与安全说明](configuration.md)。

## 六、业务文档与 ticket 的归属

Kit 保存通用规范、操作方法和空白模板；具体业务需求、决策和任务证据留在业务/产品自己的文档体系中。不要把公共 Kit 变成所有公司和个人项目的业务资料库。

| 资料 | 归属 |
| --- | --- |
| PRD、流程、业务规则、验收标准 | 业务工程或产品指定的唯一权威文档库 |
| 项目 API 契约、架构决定、设计基线 | 对应业务工程，或链接到统一维护的契约/设计文档 |
| 具体任务记录（ticket）和验收证据 | 业务工程的任务目录，或已有任务系统 |
| 通用 PRD/任务模板、规则、Skills | Kit；目前已有 project/task 模板，尚无专门 PRD 模板 |

例如前端单工程可约定 `docs/requirements/` 保存需求、`docs/tasks/` 保存任务记录；这是建议路径，不是安装器已创建的目录。跨前后端的 PRD 应选定一个权威位置，各工程引用同一版本，不各自复制后独立维护。项目配置的 documents 放常用事实和文档索引，单次任务再读取相关 PRD，不要求每次加载所有历史需求。

**ticket 是一项有边界、可验收、可跟踪的工作记录，不等于必须引入某个管理平台。** PRD 说明要解决什么业务问题；一份 PRD 可以拆成多个 ticket。可用 [任务模板](../templates/task.md) 记录具体目标、范围、验收、风险、结果；多轮任务按需补上编号、状态、PRD 链接和责任人。该模板目前不是自动派单/状态流转系统。

小文案或单处样式修改可在对话中闭环；跨多轮、多人/Agent 协作、接口改造、迁移等任务适合持久化 ticket。若已有任务系统，就以其为主、在仓库中关联代码和证据，不再建一套重复台账。
