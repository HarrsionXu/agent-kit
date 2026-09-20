# 配置与安全模型

## 接入配置

安装生成 `.agent-kit/project.json`，初始 `configured: false`，因此 doctor 和 verify 不会虚报准备就绪。先补充 `.agent-kit/project.md`，再审核配置：

```json
{
  "schemaVersion": 1,
  "configured": true,
  "scopes": [{ "path": ".", "profiles": ["common", "frontend", "angular"] }],
  "documents": [".agent-kit/project.md"],
  "checks": [
    {
      "name": "typecheck",
      "command": ["npm", "run", "typecheck"],
      "cwd": ".",
      "timeoutMs": 120000,
      "required": true,
      "risk": "local"
    }
  ]
}
```

这只是格式示例，不能假设业务项目一定有 typecheck 脚本。实际命令应来自该仓库 package.json 和工具链。`scopes` 用于按目录选择规则；多框架仓库应分别写 `apps/web-angular`、`apps/legacy-vue`，不要在同一 scope 选三种框架。目录存在性、同一路径/重叠目录的框架冲突会被检查。common/workflow 始终适用，框架/admin/microfrontend scope 同时适用 frontend。

`documents` 为必读项目事实/设计约束/决策文档路径。配置不写 token、服务器密码、个人数据。规则不会自动读环境变量或历史会话。

## 命令

```sh
node bin/agent-kit.mjs profiles
node bin/agent-kit.mjs install --target /absolute/project --profiles frontend,angular
node bin/agent-kit.mjs install --target /absolute/project --profiles frontend,angular --apply
node bin/agent-kit.mjs check --target /absolute/project
node bin/agent-kit.mjs doctor --target /absolute/project
node bin/agent-kit.mjs verify --target /absolute/project
node bin/agent-kit.mjs verify --target /absolute/project --execute
```

install 默认仅预览；verify 默认仅输出将运行的命令。安装后可脱离中央仓库执行：

```sh
node .agent-kit/tools/bin/agent-kit.mjs check --target .
node .agent-kit/tools/bin/agent-kit.mjs doctor --target .
node .agent-kit/tools/bin/agent-kit.mjs verify --target . --execute
```

- CLI 无运行时第三方依赖，Node >=22；不要求业务仓库也使用 npm。
- `common` 总会加入；框架、admin、microfrontend 自动引入 frontend。
- 显式执行先检查完整性和配置；空检查列表、未配置或缺必需命令会失败。
- command 为参数数组，直接启动程序，不通过 shell 拼接；cwd 限定在项目内。
- 每个检查需标记 `risk: local`；这只是审核声明，**不是安全沙箱**。npm script/node 脚本仍可读写文件或访问网络；执行前必须审核脚本及依赖。
- command 会继承当前进程环境，请勿在不可信项目中运行。部署、真实审批、迁移、发送邮件不属于本地检查。
- timeout 范围 100–600000 ms；同步 runner 超时终止直接子进程，不保证第三方工具产生的后台子孙进程全部退出，禁止长驻 server 命令。
- 非必需检查失败会记录，必需检查失败则 verify 非零退出。至少一个必需检查。
- 执行报告放 `.agent-kit/reports/`，包含命令、退出码、耗时、摘要；不保存 stdout、stderr 或环境变量。命令本身也不应含秘密。退出 0 只证明配置的检查通过，不证明未配置的浏览器/业务验收通过。

## 升级与冲突

在中央仓库更新版本并验证后，重复 install 预览、审核、apply。旧受管理文件被改动时先拒绝；不要用强制覆盖逃避冲突。项目差异应写到项目事实文档或局部规则中。根目录已有 `AGENTS.override.md` 会阻断安装；scope 祖先路径存在 override 也会被 doctor 拒绝，需人工整合实际生效的指令。更深的 AGENTS 仍可能改变局部行为，Agent 开始任务时必须按目录读取。全局配置、其他工具的规则发现和指令长度上限不在 doctor 检查范围；AGENTS 很长时必须检查实际加载情况。

备份位置为 `.agent-kit/backups/<时间-随机ID>/`，记录旧文件和新增文件列表。恢复时逐项比对：恢复旧文件、仅移除该次新增且确认无后续人工编辑的文件。优先通过项目 Git diff 审核；不要对整个业务仓库执行 reset。

完整性摘要用于发现漂移，不是数字签名；被攻击者同时修改文件与 lock 后无法保证真实性。可信源码和版本审核仍是前提。

## 0.1.1 中性命名

工程目录、包名和展示名统一为 Agent Kit，不依赖公司名称。已有 0.1.0 安装的命名空间标记可在锁文件摘要通过时升级为中性标记；仍然拒绝人工改动过的受管理区块。使用新目录下的命令执行升级；无需改业务工程的 `.agent-kit/` 路径，也不自动接入其他工程。
