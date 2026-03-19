请在 C:\Users\22688\Desktop\ClawX-main 继续开发，严格遵循 continue\AGENT.MD 工作流：

  - 单任务推进
  - 先恢复上下文再行动
  - 设计/实现状态都要写入 continue\task.json
  - 每次结束都要更新 continue\progress.txt
  - 每完成一个 task 做一次本地 commit
  - 如果阻塞，按 continue\AGENT.MD 标记 blocked 并写明恢复步骤

  ---

  ## 当前阶段：修复前端 TypeScript / React 编译报错，确保 `npm run typecheck` 和 `npm run
  build:vite` 零错误通过

  **核心目标**：消灭所有 TS 类型错误和构建报错，保持现有功能不变。

  **预览服务**：
  - 前端预览：先执行 `npm run build:vite`，再 `cd dist && python -m http.server 4176`，访问        
  http://localhost:4176/
  - 设计稿：http://localhost:4174/（如需重启：`cd docs/figma-review && python -m http.server       
  4174`）

  ---

  ## 恢复检查（先做这些）

  ```powershell
  # 1. 项目状态
  git status --short --branch
  git log --oneline -n 8

  # 2. 上下文文件
  Get-Content continue\AGENT.MD
  Get-Content continue\task.json
  Get-Content -Tail 40 continue\progress.txt

  # 3. 立即跑一次 typecheck 看现有报错
  npm run typecheck 2>&1 | head -80

  ---
  上一个会话完成的改动（尚未 commit）
                                                                                                   
  本次会话在 ClawX-main 做了以下 UI 修复（未提交）：
                                                                                                     1. Sidebar.tsx                                                                                       - 移除了错误添加到左侧栏的 Agent / 文件 "工具" section（这两个按钮只属于 Chat 顶栏）           
    - 移除了 Sidebar 对 rightPanelMode / setRightPanelMode 的引用                                  
    - Channel 频道 emoji 图标 span 加了                                                            
  overflow-hidden，修复飞书/钉钉/企业微信图标与文字间距过大的问题                                    2. src/pages/Chat/index.tsx                                                                      
    - 导入 useSettingsStore，读取 rightPanelMode / setRightPanelMode                               
    - 顶栏 📄 文件 按钮：toggle rightPanelMode 在 'files' ↔ null，激活时显示橙色高亮               
    - 顶栏 🤖 Agent 按钮：toggle rightPanelMode 在 'agent' ↔ null，激活时显示橙色高亮              
    - <ContextRail /> 改为 {rightPanelMode !== null && <ContextRail />}（默认隐藏）                
  3. src/components/workbench/context-rail.tsx                                                     
    - 从 contextRailCollapsed 迁移到 rightPanelMode                                                
    - null → 不渲染；'files' → 会话文件面板；'agent' → Agent 检查器面板                            
    - 关闭按钮改为 setRightPanelMode(null)                                                         
  4. src/stores/settings.ts（上上个会话已完成）                                                    
    - 新增 rightPanelMode: 'agent' | 'files' | null，默认 null                                     
    - 新增 setRightPanelMode action                                                                
                                                                                                     第一步：先跑 npm run typecheck，修完所有报错，再 commit 以上改动，然后继续处理其余报错。                                                                                                              ---                                                                                                关键技术规范
                                                                                                   
  - 颜色：--bg: #ffffff，--bg2: #f2f2f7，--bg3: #e5e5ea，--tx: #000000，--tx2: #3c3c43，--tx3: 
  #8e8e93，--bd: #c6c6c8，--ac: #007aff                                                              - 主色调：#ff6a00（按钮高亮/激活态）
  - 字体：-apple-system, SF Pro，13px 正文                                                         
  - Sidebar 宽度：260px（展开）/ 64px（收起）
  - Electron + React 19 + TypeScript + Tailwind CSS 项目
  - 预览命令：npm run build:vite（只构建前端，无需 electron）