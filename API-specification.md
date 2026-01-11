# API Specification

## 1. 経路検索 (Route Search)

### エンドポイント (Endpoint)
`https://routes-b726nae6nq-an.a.run.app/`

### リクエストパラメータ (Request Parameters)

| パラメータ名 | 型 | 必須 | 説明 | 例 |
| :--- | :--- | :--- | :--- | :--- |
| `from` | `string` | 必須 | 出発駅の名前 | `新宿` |
| `to` | `string` | 必須 | 到着駅の名前 | `東京` |
| `departure_time` | `string` | 任意 | 出発時刻 (ISO 8601形式)。省略時は現在時刻。 | `2026-01-11T10:00:00+09:00` |

### レスポンス (Response)

成功時: `200 OK`

```json
{
  "routes": [
    {
      "id": "route_12345",
      "total_duration": 45,
      "fare": 550,
      "transfers": 1,
      "segments": [
        {
          "line": "JR山手線",
          "from_station": "新宿",
          "to_station": "神田",
          "departure_time": "10:00",
          "arrival_time": "10:15",
          "stops": [
            {
              "name": "新宿",
              "time": "10:00",
              "congestion_level": 7
            },
            {
              "name": "代々木",
              "time": "10:02",
              "congestion_level": 4
            },
            // ... 途中駅
            {
              "name": "神田",
              "time": "10:15",
              "congestion_level": null
            }
          ]
        },
        {
          "line": "JR中央線",
          "from_station": "神田",
          "to_station": "東京",
          "departure_time": "10:20",
          "arrival_time": "10:22",
          "stops": [
            {
              "name": "神田",
              "time": "10:20",
              "congestion_level": 1
            },
            {
              "name": "東京",
              "time": "10:22",
              "congestion_level": null
            }
          ]
        }
      ]
    }
  ]
}
```

### データ構造の詳細

#### Route Object
| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | `string` | 経路の一意識別子 |
| `total_duration` | `number` | 所要時間 (分) |
| `fare` | `number` | 運賃 (円) |
| `transfers` | `number` | 乗り換え回数 |
| `segments` | `Array<Segment>` | 乗車区間のリスト |

#### Segment Object
| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `line` | `string` | 路線名 |
| `from_station` | `string` | 乗車駅名 |
| `to_station` | `string` | 降車駅名 |
| `departure_time` | `string` | 発車時刻 (HH:MM) |
| `arrival_time` | `string` | 到着時刻 (HH:MM) |
| `stops` | `Array<Stop>` | 停車駅のリスト |

#### Stop Object
| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `name` | `string` | 駅名 |
| `time` | `string` | 発着時刻 (HH:MM) |
| `congestion_level` | `integer \| null` | 混雑度 (1〜7)。降車駅の場合は null または次区間なしの意味。<br>1: 座ることができる<br>2: ゆったり立てる<br>3: 吊革につかまる<br>4: ドア付近が混雑<br>5: 肩が触れ合う<br>6: 圧迫感がある<br>7: 身動きが取れない |

---

## 補足
- 時刻フォーマットはフロントエンドの表示に合わせて `HH:MM` としていますが、必要に応じて完全なISO文字列に変更可能です。
- 混雑度 (`congestion_level`) は1〜7の数値で返します。フロントエンド側でこの数値を適切な色（グラデーション等）にマッピングして表示してください。
