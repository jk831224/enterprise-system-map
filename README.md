# 企業系統生態地圖

企業系統導入顧問用的解法地圖。從客戶口中的症狀出發，推導到流程步驟、所需能力、可承接的系統類別，再看主檔歸屬與系統間資料流。

線上瀏覽：<https://jk831224.github.io/enterprise-system-map/>

## 五個視圖

| 視圖 | 回答的問題 |
|---|---|
| 能力重疊 | 哪些系統類別具備相同能力？可切換「只計算資料物件」，看出主檔歸屬要談定的地方 |
| 能力 × 系統 | 每個系統類別具備哪些能力？以矩陣逐格查核 |
| 症狀推導 | 客戶說的症狀，可能的根因在哪個流程步驟，需要什麼能力，可由哪些系統承接？ |
| 主檔與資料流 | 每種資料以哪個系統為主檔？資料怎麼流動、多久同步一次？哪些資料物件沒有主檔或主檔有爭議？ |
| 流程泳道 | 一個端到端流程中，每個步驟由哪個系統承接？系統換手的斷點在哪？涉及哪些臺灣法遵項目？ |

所有視圖共用兩個篩選：企業規模（微型、小型、中型、大型）與產業（製造、貿易、零售、服務）。不適用的系統類別會淡化，不會隱藏。篩選與選取狀態會寫進網址，分享連結可以重現同一畫面。

## 資料

所有內容都在 `data/` 資料夾，修改 JSON 即可更新地圖，不需要動頁面程式。

| 檔案 | 內容 | 主要欄位 |
|---|---|---|
| `categories.json` | 33 個系統類別與適用條件 | `id`、`name`、`full_name`、`domain`、`size_min`（1 微型到 4 大型）、`industries`、`trigger`（導入時機）、`complexity`（1 到 3） |
| `capabilities.json` | 66 項能力 | `capability`、`type`（資料物件／領域功能／通用機制）、`definition` |
| `memberships.json` | 能力歸屬：哪個類別具備哪項能力 | `category`、`capability`、`confidence` |
| `processes.json` | 六個端到端流程的步驟 | `process`、`step_id`、`step_name`、`capabilities`（逗號分隔）、`typical_system` |
| `symptoms.json` | 症狀、根因與根因所在的流程步驟 | `symptom_id`、`symptom`、`cause_id`、`cause`、`steps`（逗號分隔） |
| `master_roles.json` | 每種資料物件在各系統中的角色 | `object`、`category`、`role`（主檔候選／鏡像／引用）、`priority`、`contested`、`note` |
| `flows.json` | 系統間資料流 | `source`、`target`、`object`、`timing`（即時／批次／日結） |
| `compliance.json` | 臺灣法遵項目 | `law_id`、`name`、`description`、`steps`、`categories` |

六個流程的代號：O2C 接單到收款、P2P 請購到付款、R2R 記帳到出報表、PTP 計畫到生產、H2R 招募到離職、I2R 客訴到結案。

每筆資料都附 `basis`（判斷依據）與 `confidence`（高、中、低）。

## 資料的性質

- 所有類別歸屬、流程分工、症狀、主檔歸屬與法遵資料，都是依業界通則草擬，未經個案驗證。
- 能力歸屬以各類專業單品的典型功能為準，不是廠商官方定義。
- 法遵項目只標示影響範圍，未逐條查證條文與適用門檻。

## 本機預覽

頁面以 `fetch` 讀取資料檔，直接用瀏覽器開啟 `index.html` 會被擋下，需要透過本機伺服器：

```bash
python3 -m http.server 8000
```

再開啟 <http://localhost:8000>。

## 結構

```
index.html        頁面與五個視圖的繪圖程式
src/runtime.js    讀取資料、計算、管理篩選狀態與重畫
src/theme.css     配色、間距、字型變數，含深色模式
data/*.json       地圖資料
```

圖表使用 [d3](https://d3js.org/) v7，從 jsDelivr 載入。
