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
3. 安装 [json-server](https://www.npmjs.com/package/json-server)：`npm install json-server`，运行 `json-server db.json`。
4. 安装 moment：`npm install moment`。
5. 安装 mobx 和 mobx-react：`npm install mobx mobx-react`。
6. 安装 axios：`npm install axios`。
7. 安装 [ws](https://github.com/websockets/ws)：`npm install ws`。
8. 安装 recharts：`npm install recharts`。
9. 安装 md5：`npm install md5`。

## 项目运行

1. 运行后端：
   - `npx json-server --watch public/db.json --port 3000`； 
   - `npx json-server --watch public/train.json --port 3001`； 
   - `npx json-server --watch tmp/model.json --port 3002`。 
2. 运行网页：`npm run dev`。
3. 运行 Web-Socket 服务：`node public/server.js`。

## gitignore

注意 tmp 文件夹被 gitignore 了，所以需要自己创建 tmp/model.json 文件
```json
[
   {
      "agentID": "2671fbacd1817a5",
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
               ]
            ],
            "actionSpace": [
               {
                  "entity": "红绿灯1",
                  "name": "信号控制",
                  "type": "连续型",
                  "action": [
                     [
                        0.1,
                        0.5
                     ],
                     "状态",
                     [
                        0,
                        1
                     ]
                  ],
                  "rule": [
                     "IF ELSE",
                     "1",
                     "2",
                     "3",
                     "4"
                  ]
               },
               {
                  "entity": "红绿灯3",
                  "name": "切换频率",
                  "type": "离散型",
                  "action": [
                     [
                        10,
                        20,
                        30
                     ],
                     [
                        10,
                        15,
                        20,
                        25,
                        30
                     ]
                  ],
                  "rule": [
                     "FOR",
                     "4",
                     "3",
                     "2",
                     "1"
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
               ]
            ],
            "actionSpace": [
               {
                  "entity": "红绿灯2",
                  "name": "信号控制",
                  "type": "连续型",
                  "action": [
                     [
                        0.1,
                        0.5
                     ],
                     "状态",
                     [
                        0,
                        1
                     ]
                  ],
                  "rule": [
                     "IF ELSE",
                     "1",
                     "2",
                     "3",
                     "4"
                  ]
               },
               {
                  "entity": "红绿灯4",
                  "name": "切换频率",
                  "type": "离散型",
                  "action": [
                     [
                        10,
                        20,
                        30
                     ],
                     [
                        10,
                        15,
                        20,
                        25,
                        30
                     ]
                  ],
                  "rule": [
                     "FOR",
                     "4",
                     "3",
                     "2",
                     "1"
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
      "updateTime": "2025-01-09T12:51:28.098Z"
   },
   {
      "agentID": "ab87440f47865d2",
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
               ]
            ],
            "actionSpace": [
               {
                  "entity": "红绿灯1",
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
                  "rule": [
                     "IF ELSE",
                     "111",
                     "222",
                     "333",
                     "444"
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
                  "entity": "红绿灯4",
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
                  "rule": [
                     "FOR",
                     "444",
                     "333",
                     "222",
                     "111"
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
      "updateTime": "2025-01-09T12:57:24.952Z"
   }
]
```

## 如果有新增的内容，先写在后面，便于合并