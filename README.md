## 项目配置

使用 [Vite](https://vitejs.cn/vite3-cn/guide/) 搭建项目：
```bash
npm create vite@latest # frontend -> React-> JavaScript + SWC
cd frontend
npm install
```

## 工具安装（可以直接 `npm install`）

1. 安装路由管理：`npm install react-router-dom`。
2. 安装 [Ant Design](https://ant.design/docs/react/use-with-vite-cn)：`npm install antd --save`。
3. 安装 moment：`npm install moment`。
4. 安装 mobx 和 mobx-react：`npm install mobx mobx-react`。
5. 安装 axios：`npm install axios`。 
6. 安装 recharts：`npm install echarts`。
7. 安装 md5：`npm install md5`。

## 项目运行

1. 运行后端：`python mock/app.py # pip install flask flask_cors stable_baselines3`。
2. 运行网页：`npm run dev`。

## 项目结构

```
rl-frontend/  
├── mock/ # 模拟后端  
├── node_modules/ # 项目的各种依赖  
├── public/ # 静态资源文件，在构建时会被复制到输出目录  
├── src/ # 源代码  
│       └── assets/ # 存放项目的静态资源，如图片、字体、图标等  
│       ├── components/ # 组织项目中的 React 组件，每个组件通常包含自己的逻辑、样式和模板  
│       │         ├── AgentEditor/ # 智能体编辑界面  
│       │         ├── EvaluationOptimization/ # 评估与优化界面  
│       │         ├── ModelManage/ # 模型管理界面  
│       │         └── TrainingService/ # 训练服务界面  
│       ├── App.css # 全局样式表文件，用于定义项目中通用的样式规则   
│       ├── App.jsx # 项目的主组件文件，通常作为应用的根组件   
│       └── main.jsx # 应用的入口文件，通常用于渲染根组件（如 App.jsx）到页面上  
├── .gitignore # Git 忽略文件配置，用于指定哪些文件或目录不应该被 Git 版本控制  
├── eslint.config.js # ESLint 配置文件，用于定义 JavaScript 代码的检查规则和风格指南  
├── index.html # 应用的入口 HTML 文件，通常用于定义页面的基本结构和挂载点  
├── package.json # 项目的配置文件，包含了项目的元数据、依赖项、脚本等信息  
├── package-lock.json # 由 npm 生成的文件，用于锁定项目依赖的确切版本，确保项目在不同环境下的一致性  
├── README.md # 项目的说明文件  
└── vite.config.js # Vite 的配置文件，用于定义构建、开发服务器、插件等配置选项
```

## gitignore

注意，需要自己创建 mock/model.json 文件。
```json
[
  {
    "agentID": "407cb54f5528f7e",
    "scenarioID": "traffic",
    "agentRoleID": "traffic_light",
    "agentType": "同构多智能体",
    "agentName": "agent",
    "agentVersion": "1",
    "agentCount": "2",
    "entityAssignments": [
      {
        "智能体1": [
          "红绿灯1",
          "红绿灯3"
        ]
      },
      {
        "智能体2": [
          "红绿灯2",
          "红绿灯4"
        ]
      }
    ],
    "agentModel": [
      {
        "name": "智能体1",
        "stateVector": [
          [
            "红绿灯1",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ],
          [
            "红绿灯3",
            "Number of Waiting Vehicles",
            "等待通过的车辆数量",
            "辆"
          ],
          [
            "红绿灯2",
            "Number of Pedestrians",
            "等待通过的行人数量",
            "人"
          ],
          [
            "红绿灯4",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ],
          [
            "红绿灯4",
            "Number of Waiting Vehicles",
            "等待通过的车辆数量",
            "辆"
          ],
          [
            "红绿灯4",
            "Number of Pedestrians",
            "等待通过的行人数量",
            "人"
          ]
        ],
        "actionSpace": [
          {
            "entity": "红绿灯1",
            "name": "信号控制",
            "type": "离散型",
            "action": [
              [
                1,
                2,
                3
              ],
              [
                1,
                2,
                3
              ]
            ],
            "rules": [
              [
                "IF ELSE",
                "x'+b'",
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ]
              ],
              [
                "FOR",
                "R-R̄",
                [
                  1,
                  3
                ],
                []
              ]
            ]
          },
          {
            "entity": "红绿灯3",
            "name": "切换频率",
            "type": "连续型",
            "action": [
              [
                15,
                55
              ],
              "秒",
              [
                5,
                60
              ]
            ],
            "rules": [
              [
                "IF ELSE",
                "u×U",
                [
                  "15",
                  "30"
                ],
                [
                  "35",
                  "55"
                ]
              ],
              [
                "FOR",
                "α÷b_u",
                [
                  "25",
                  "50"
                ],
                []
              ]
            ]
          }
        ],
        "rewardFunction": [
          [
            "x'+b'",
            "团队奖励"
          ],
          [
            "R-R̄",
            "团队奖励"
          ]
        ]
      },
      {
        "name": "智能体2",
        "stateVector": [
          [
            "红绿灯2",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ],
          [
            "红绿灯4",
            "Number of Waiting Vehicles",
            "等待通过的车辆数量",
            "辆"
          ],
          [
            "红绿灯1",
            "Number of Pedestrians",
            "等待通过的行人数量",
            "人"
          ],
          [
            "红绿灯3",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ],
          [
            "红绿灯3",
            "Number of Waiting Vehicles",
            "等待通过的车辆数量",
            "辆"
          ],
          [
            "红绿灯3",
            "Number of Pedestrians",
            "等待通过的行人数量",
            "人"
          ]
        ],
        "actionSpace": [
          {
            "entity": "红绿灯2",
            "name": "信号控制",
            "type": "离散型",
            "action": [
              [
                1,
                2,
                3
              ],
              [
                1,
                2,
                3
              ]
            ],
            "rules": [
              [
                "IF ELSE",
                "x'+b'",
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ]
              ],
              [
                "FOR",
                "R-R̄",
                [
                  1,
                  3
                ],
                []
              ]
            ]
          },
          {
            "entity": "红绿灯4",
            "name": "切换频率",
            "type": "连续型",
            "action": [
              [
                15,
                55
              ],
              "秒",
              [
                5,
                60
              ]
            ],
            "rules": [
              [
                "IF ELSE",
                "u×U",
                [
                  "15",
                  "30"
                ],
                [
                  "35",
                  "55"
                ]
              ],
              [
                "FOR",
                "α÷b_u",
                [
                  "25",
                  "50"
                ],
                []
              ]
            ]
          }
        ],
        "rewardFunction": [
          [
            "x'+b'",
            "团队奖励"
          ],
          [
            "R-R̄",
            "团队奖励"
          ]
        ]
      }
    ],
    "updateTime": "2025-05-11T08:30:44.861Z"
  },
  {
    "agentID": "4c4fa8d4f591fc6",
    "scenarioID": "traffic",
    "agentRoleID": "traffic_light",
    "agentType": "异构多智能体",
    "agentName": "Agent",
    "agentVersion": "2",
    "agentCount": "2",
    "entityAssignments": [
      {
        "智能体1": [
          "红绿灯1",
          "红绿灯2",
          "红绿灯3"
        ]
      },
      {
        "智能体2": [
          "红绿灯4"
        ]
      }
    ],
    "agentModel": [
      {
        "name": "智能体1",
        "stateVector": [
          [
            "红绿灯1",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ],
          [
            "红绿灯2",
            "Number of Waiting Vehicles",
            "等待通过的车辆数量",
            "辆"
          ],
          [
            "红绿灯3",
            "Number of Pedestrians",
            "等待通过的行人数量",
            "人"
          ],
          [
            "红绿灯4",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ]
        ],
        "actionSpace": [
          {
            "entity": "红绿灯1",
            "name": "信号控制",
            "type": "离散型",
            "action": [
              [
                1,
                2
              ],
              [
                1,
                2,
                3
              ]
            ],
            "rules": [
              [
                "IF ELSE",
                "x'-u",
                [
                  1
                ],
                [
                  2
                ]
              ],
              [
                "FOR",
                "b'+U",
                [
                  1,
                  2
                ],
                []
              ]
            ]
          }
        ],
        "rewardFunction": [
          [
            "x'+b'",
            "团队奖励"
          ],
          [
            "R-R̄",
            "个人奖励-智能体1"
          ]
        ]
      },
      {
        "name": "智能体2",
        "stateVector": [
          [
            "红绿灯4",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ],
          [
            "红绿灯1",
            "Number of Waiting Vehicles",
            "等待通过的车辆数量",
            "辆"
          ],
          [
            "红绿灯2",
            "Number of Pedestrians",
            "等待通过的行人数量",
            "人"
          ],
          [
            "红绿灯3",
            "Traffic Light Status",
            "当前信号灯状态",
            "状态"
          ]
        ],
        "actionSpace": [
          {
            "entity": "红绿灯4",
            "name": "切换频率",
            "type": "连续型",
            "action": [
              [
                10,
                50
              ],
              "秒",
              [
                5,
                60
              ]
            ],
            "rules": [
              [
                "IF ELSE",
                "R×α",
                [
                  "10",
                  "30"
                ],
                [
                  "35",
                  "50"
                ]
              ],
              [
                "FOR",
                "R̄÷b_u",
                [
                  "10",
                  "40"
                ],
                []
              ]
            ]
          }
        ],
        "rewardFunction": [
          [
            "x'+b'",
            "团队奖励"
          ],
          [
            "u×U",
            "个人奖励-智能体2"
          ]
        ]
      }
    ],
    "updateTime": "2025-05-11T08:37:24.640Z"
  }
]
```