# 交付与验证记录

日期：2026-09-20。环境：本地 macOS、Node v24.5.0。

## 范围

本记录按小节保留各轮工具、资料和显式接入的验证历史。是否接入及哪些检查通过，以对应小节为准，不能把工具检查视为业务验收。

## 已执行

- `npm run check`：资料/链接校验通过，30 项 Node 自动回归全部通过，无跳过。
- 资料检查覆盖 8 profiles、9 rules、7 Skills、版本一致性和本地 Markdown 链接。
- 回归用例包含：默认只读、保留原 AGENTS/手写配置、重复安装、规则漂移、Skills 冲突、override、符号链接、路径越界、版本冲突、升级备份、scope 隔离、显式执行、失败/超时、离线 runtime。
- 三个现有工程分别以 Vue、Vue+admin、backend 做安装预览，均生成计划，`applied: false`；未实际接入。
- Skill Creator 的 `quick_validate.py`：7 个 Skills 均返回 `Skill is valid!`；这证明格式有效，不证明模型执行质量。
- 依据本仓库 kit-review Skill 做了自查，不称为独立 QA。三个参考仓库最终 Git 状态与开始时的文件清单一致；没有把用户原有改动归为本次工作。

## 不属于本次通过范围

- Node 22/Linux 的 CI 已配置，但本地未模拟其运行，也未推送触发远程 CI。
- 没有在参考工程执行真实接口、数据库迁移、审批、发布。
- 没有宣称 Angular/Vue/React 应用构建、浏览器交互、微前端集成测试已完成。
- 行为评估场景已编写，未运行独立模型评估；不提供“规范服从率”。

## 实施发现与处理

- 安装器预检不仅检测符号链接，也检测父路径被普通文件占用，避免写入中途才发现路径冲突。
- 初始项目配置不具备质量门禁，doctor/verify 明确失败，要求补充真实项目命令。
- 已安装版本的内容发生变化必须提升版本；同版本更新被拒绝。
- Skills 独立格式校验需要 PyYAML，系统 Python 与应用 Python 均未预装；使用临时 venv 补充该校验依赖，不把 Python 引入本项目运行时。

## 0.1.1 中性命名与结构说明

- 工程目录、包名、CLI、Skill 描述和安装生成的标题/标记统一为 Agent Kit；工程维护文件检索未发现原公司名称残留。Git 内部元数据不作为批量改写对象。
- 新增 docs/structure.md，逐项说明源工程与接入后目标工程的文件职责。
- `npm run check`：资料/链接校验通过，32 项测试全部通过。新增测试验证历史命名空间标记的升级兼容与摘要保护，版本升级测试不再绑定固定的下一版本号。
- 修改过的 kit-task Skill 再次通过 Skill Creator 的 quick_validate.py 格式校验。
- 本轮未接入、修改或运行三个参考业务工程；没有提交、推送或发布。

## README 结构同步检查

- 完整结构说明移入 README，docs/structure.md 保留旧链接入口；AGENTS 要求结构或职责变化在同一次变更中同步说明。
- 新增结构比对检查并接入现有 `npm run check`，覆盖源文件和目录的遗漏、过期、类型不符，以及结构标记、文件说明缺失等错误；职责描述的语义准确性仍需审查。
- 本地 `npm run check` 通过：37 个源文件与 README 一致，39 项测试全部通过，无跳过。7 项新增测试包含模拟结构漂移报错、更新说明后重新通过、隐藏文件与生成/私有文件排除。
- 补充业务文档归属、catalog 与项目配置的分工、ticket 的适用范围；未创建业务 ticket，也未改变 catalog 格式或分发内容，版本仍为 0.1.1。
- 这次按 kit-task/kit-review 完成任务闭环与自查，未运行远程 CI、独立 Agent 行为评估或业务工程验收；未修改业务工程。

## 结构说明的最终归属

- 按最新确认，逐文件说明统一维护在 docs/structure.md，README 只保留概览和链接；历史小节记录此前调整，不代表当前维护入口。
- 同步迁移 AGENTS 规则、结构检查的读取路径、错误提示和测试 fixture。新增测试确认 README 中的旧树不能替代 docs/structure.md。
- 本地 `npm run check` 通过：37 个源文件与结构说明一致，40 项测试全部通过，无跳过；文档链接检查通过。
- 本轮按 kit-task/kit-review 自查迁移完整性；不涉及业务工程、分发内容或远程发布。

## 0.1.2 风险分级流程明确化

- 保留产品、架构、实现、验证四种职责，取消默认逐角色停顿；明确按任务风险裁剪流程、用户分步要求、关键决策与外部授权边界，以及“继续”的恢复语义。
- 工作区入口 `/Users/xuhongzhuang/Documents/GitHub/AGENTS.md` 同步写入默认流程并保留原工程路由；Kit 自身入口增加 workflow 必读。业务工程、全局 Codex 配置和 Skills 正文未修改，未自动向相邻项目分发。
- README 和架构说明引用 workflow，结构说明同步职责与评估数量。分发规范发生变化，package.json/catalog.json 同步升至 0.1.2；版本仅在本地更新，未发布。
- 新增 3 个行为评估定义：小修改连续交付、用户明确要求分步时暂停、未确定安全边界需要确认。连同既有诊断只读和迁移授权场景，共 11 个定义；未运行独立模型行为评估。
- 按 kit-task/kit-review 完成闭环与自查。本地 `npm run check` 通过：40 项工具/结构测试全部通过，无跳过；8 profiles、9 rules、7 Skills、11 个评估定义、本地文档链接和 37 个源文件结构校验通过。
- 对工作区入口、Kit 规范/文档及参考工程根 AGENTS 做旧强制停顿措辞检索，未发现所检索的强制语句；这不是所有历史对话、全局配置或嵌套规则的完整审计。
- 未做业务构建、浏览器验收或远程 CI。新规范不自动覆盖已安装的固定版本或旧对话指令；目标项目需显式升级并核对实际有效规则。

## 0.1.2 两个前端工程的本地接入

- 本轮经用户明确授权接入 Supply Chain Front 与 Apps；未接入 Operation/Backend，未发布、推送、提交或修改全局配置。
- 两个目标分别使用 common/frontend/vue 与 common/frontend/angular/microfrontend，均固定 0.1.2，安装 4 个 Kit Skills。保留既有规则和 Skills，统一项目入口中的历史流程措辞，未改变框架、包管理器或业务实现。
- Front 填写 3 个目录 scopes、3 个必需检查；Apps 填写 40 个 scopes、2 个必需检查，微前端范围与 36 个实际 Federation 应用逐项一致。项目事实、验收结论和局限保留在各自 .agent-kit/project.md 与 onboarding.md；公共规则未增加业务专属配置。
- 两边完整性、doctor、只读 verify 预览通过；配置状态为 configured，不把该状态称为业务通过。再次安装预览均为 applied=false、files=[]，手写配置未被重置。
- Front 显式 verify 返回 passed=false、退出码 1：diff-hygiene 通过，采购静态检查有 4 处既有间距违规；core 测试 85 项通过，4 个测试文件因无扩展名 TypeScript 导入而加载失败，无跳过。未删测试、放宽检查或改业务文件。
- Apps 显式 verify 返回 passed=true、退出码 0：diff-hygiene 和 EPC Shell 2 个套件的 26 项测试通过，无跳过。禁用 Nx daemon、本地/远程任务缓存；并非全部应用、模板构建或 Federation 集成通过。
- Front 接入前 25 个用户改动/新增文件逐一 SHA-256 比对未变；Apps 原 Nx 自动管理区块逐字保留。原 AGENTS 已由安装器备份。
- 本地 npm run check 通过：40 项工具/结构测试、资料及链接检查通过。安装副本可在本项目离线运行，不依赖中央工程路径。
- 按 kit-task/kit-review 完成接入闭环与自查，未做独立 Agent 行为评估、全量业务构建、浏览器验收、真实接口或远程 CI。Front 基线缺口保留为后续独立任务，不因本轮接入扩大修改范围。
