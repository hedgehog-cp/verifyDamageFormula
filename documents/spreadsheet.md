# Google spreadsheet

Google spreadsheet は次の点で優れる.

- データの共有
- 計算式の透明性
- 計算式の書き換えが容易で, 高速な実装が可能

しかし, 計算速度が非常に遅く, ビッグデータの処理, 複雑な計算, 高次元配列の計算には不向きだ.
これらの計算を目的に Google spreadsheet を選択してはいけない.
Google spreadsheet を選択してよい条件は, 計算が単純で, 計算するデータ数が多くなく, 二次元までの配列計算で, プログラミングに明るくない人たちともデータや計算結果を共有したいときだ.

# 組み込み関数(関数; built int functions)

この文書は関数のリファレンスを提供しない.

関数のリファレンスは公式が詳細に提供している.
`[メニューバー] -> [ヘルプ] -> [関数リスト]`または次のリンクからアクセスできる.

> [Google スプレッドシートの関数リスト](https://support.google.com/docs/table/25273)

# URL

Google spreadsheet の spreadsheet の URL には少なくとも次の情報を含む.

- spreadsheet id
- sheet id

```
https://docs.google.com/spreadsheets/d/(spreadsheet id)/edit#gid=(sheet id)
```

新規作成した spreadsheet の`シート1`の sheet id は必ず 0 となるようだ.

`spreadsheet id`は`importrange()`で使える.

```
=importrange(spreadsheet id, シート!セル範囲)
```

`sheet id`は`hyperlink()`で使える.
次のようにして目次を作成できる.

```
=hyperlink("#gid=" & sheet id, "シート名")
```

目次を手動で作ることは面倒だ.
面倒なことは計算機に任せるべきだ.
なんと幸いなことに Google Apps Script(GAS) で目次を作れる.
GAS は`[メニューバー] -> [拡張機能] -> [Apps Script]`より編集できる.

次のコードを与えると`メニューバー`に`スクリプト`の項が生成される.
`目次生成`は`[メニューバー] -> [スクリプト] -> [目次生成]`から行える.

なお, このコードは`vscode`にて`TypeScript`で記述し, `clasp push`したものだ.

```js
/**
 * @brief スプレッドシートのオープンをトリガに、メニューバーにカスタムメニューを追加します。
 * @see addMenu::createIndex()
 * @OnlyCurrentDoc
 */
function onOpen(event) {
  var menuItems = [{ name: "目次作成", functionName: "createIndex" }];
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.addMenu("スクリプト", menuItems);
}

/**
 * @brief アクティブなシートの、選択したセル以下にHYPERLNK関数で目次を作成します。
 * @module 目次作成(選択したセル以下に、縦に出力する)
 * @return =hyperlink("#gid=***", "シート名")
 * @see addMenu::onOpen()
 * @OnlyCurrentDoc
 */
function createIndex() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  var range = sheet.getActiveRange();
  var sheets = spreadsheet.getSheets();
  var nameList = sheets.map(function (sheet) {
    return sheet.getName();
  });
  var gidList = sheets.map(function (sheet) {
    return sheet.getSheetId();
  });
  for (var i = 0; i < sheets.length; i++) {
    var formulaStr = '=hyperlink(\n   "#gid='
      .concat(gidList[i], '",\n   "')
      .concat(nameList[i], '"\n )');
    sheet
      .getRange(range.getRowIndex() + i, range.getColumn())
      .setFormula(formulaStr);
  }
}
```

# 文字列

セルに入力できる文字列の文字数は現在 $[0, 50000]$ 文字である.
セルはこれより大きい文字列の入力を受け付けない.
文字列は REGEX 系関数や QUERY 関数などで扱える正規表現で操作できる.

セルの幅を文字列の長さに調整すべきではない.
どうしても Google spreadsheet を文書として扱いたい場合は, `[メニューバー] -> [表示形式] -> [ラッピング]`より希望する表示形式に設定するか, `[メニューバー] -> [表示] -> [グリッド線]`よりグリッド線を非表示にする.

次の値はロケールによっては文字列ではなく数値と解釈される場合がある.

```
123,456,789
```

文字列化するには次のように, 先頭に`'`を付すか, `"`でくくった値を式として入力する.

```
'123,456,789
="123,456,789"
```

# 数値

セルで表現できる最大値および最小値は以下である.

```js
=1.79769313486231E+308   // 最大値
=-1.79769313486231E+308  // 最小値
```

この値は IEEE754 binary64 で規定されるいわゆる倍精度浮動小数点数の最大値および最小値ではない.
セルは数値を**十進 15 桁程度の精度に丸め込む**ため, 絶対値は $2^{1024}$ より小さくなる.
なお, `=2^1024` をセルに入力すると以下のエラーが返る.

```
数値が 1.79769E+308 より大きいため、適切に表示されません。
```

数値を正規表現で操作することは出来ない.
しかし, 数値を文字列に変換することはできる.
次の式はいずれも`true`をセルに返す.

```
=regexMatch("1", "\d")
=regexMatch("" & 2, "\d")
=regexMatch(to_text(3), "\d")
```

# 日付と時刻

日付と時刻の本質は数値だ.
基準となる時刻からいくら経過したかを数値で表現し, 表示を人間用に整えているに過ぎない.

たとえば, `Twitter` のツイートの投稿日時やリストの作成日時は次のようにして計算できる.

```
=text(
    lambda(serial,
        (serial / (2^22) + 1288834974657) / (60 * 60 * 24 * 1000) + value("1970/1/1 00:00:00") + value("09:00:00")
    )(index(split(A2,"/"),1,5)),
    "YYYY/MM/DD hh:dd:ss"
 )
```

# コメント

多くのプログラミング言語では以下のようにしてソースコードに人間用の文字列を記述できる.

```js
// 改行までコメント
/* この区間がコメント */
/*
    複
    数
    行
    コ
    メ
    ン
    ト
*/
```

ふつう, この人間用の文字列は動作に影響を及ぼさない.
Google spreadsheet では, 引数に文字列を与えても計算結果が変わらないように工夫することで数式内にコメントを付することができる.

```
=42 +n("/* N関数は引数に文字列を与えると0を返す */")
=and(0 < 1, isText("/* ISTEXT関数は引数に文字列を与えるとtrueを返す */"))
=if(0 < 1, a, 第1引数が真であれば第3引数は評価されないため, わざわざ文字列にしなくてもよい)
=if(true, "", 空文字列を返しつつコメント)
=iferror(x, 第1引数が非エラーであれば第2引数は評価されないため, わざわざ文字列にしなくてもよい)
=iferror(, 空文字列を返しつつコメント)

```

# 条件分岐

条件分岐には`if()`を使う.
ただし, `if()`が提供するのは解釈と分岐であり, 比較ではない.
次の式は`true`をセルに返す.

```js
=(0 < 1)
```

`true`は数値計算において`1`のように振る舞う.
そのため, 次の式は`10`をセルに返す.

```js
=true * 10
```

`false`は数値計算において`0`のように振る舞う.
そのため, 次の式は`0`をセルに返す.

```js
=false * 10
```

以上をまとめると次の要件は以下のように書ける.

- x が正のとき, `2`をセルに返す
- そうでないとき, `1`をセルに返す

```js
=2 ^ (x > 0)
```

`if()`は解釈を提供する.
`if()`が第 1 引数を真と解釈すれば第 2 引数を評価し, 偽と解釈すれば第 3 引数を評価するかデフォルトの`false`をセルに返す.
`if()`は実数のうち`0`を偽と解釈し, これ以外を真と解釈する.
すなわち, 次の式は`42`をセルに返す.

```js
=if(len("生命、宇宙、そして万物についての究極の疑問の答え"), 42)
```

標準の比較演算子`<`, `>`, `=`などは数値を十進 15 桁程度に丸めてから比較演算を行う.
次の式は`false`をセルに返す.

```
=(1+1e-16)  > 1
```

分岐する条件は明確に記述すべきでない場合もある.
次の要件は以下のように書ける.

- `x` が `220` 以上のとき, `sqrt(x - 220) + 220` をセルに返す
- そうでないとき, `x`をセルに返す

```js
=iferror(
    sqrt(x - 220) + 220,
    x
)
```

または

```js
=min(x, 220) + sqrt(max(x - 220, 0))
```

# 包含検索

## 一次元配列 A に要素 a が含まれているかを, 完全一致検索で検証する.

```js
=isNumber(match(a, A, 0))
```
