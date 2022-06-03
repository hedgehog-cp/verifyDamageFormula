/**
 * @file このファイルはカスタムメニューを扱います。
 */

/** @OnlyCurrentDoc */

/**
 * @brief スプレッドシートのオープンをトリガに、メニューバーにカスタムメニューを追加します。
 * @see addMenu::createIndex()
 */
function onOpen(event) {
  let menuItems = [{
      name: '目次作成',
      functionName: 'createIndex'
    },
    {
      name: '行サイズを調整する',
      functionName: 'adjustRowSize'
    }
  ];
  let sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.addMenu('スクリプト', menuItems);
}

/**
 * @brief アクティブなシートの、選択したセル以下にHYPERLNK関数で目次を作成します。
 * @module 目次作成(選択したセル以下に、縦に出力する)
 * @return =hyperlink("#gid=***", "シート名")
 * @see addMenu::onOpen()
 */
function createIndex() {

  // アクティブなスプレッドシートを取得する
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // アクティブなシートを取得する
  let sheet = spreadsheet.getActiveSheet();

  // アクティブな範囲を取得する
  let range = sheet.getActiveRange();

  // すべてのシートを取得する
  let sheets = spreadsheet.getSheets();

  // すべてのシートの名前を取得してnameListに格納する
  let nameList = sheets.map(sheet => sheet.getName());

  // 取得したシートのgidを格納する
  let gidList = sheets.map(sheet => sheet.getSheetId());

  // すべてのシートについて
  for (let i = 0; i < sheets.length; i++) {

    // 組み込み関数を作って格納する
    let formulaStr = `=hyperlink(\n   "#gid=${gidList[i]}",\n   "${nameList[i]}"\n )`;

    // 出力する
    sheet.getRange(range.getRowIndex() + i, range.getColumn()).setFormula(formulaStr);
  }
}

/**
 * @brief 定義したシート名と合致するシートの行サイズを変更します。
 * @see addMenu::createIndex()
 */
function adjustRowSize() {

  // 調整したいシートの名前
  const adjustTargetSheets = ['input', 'calc', 'invCalc', 'report'];

  const MIN = 3;
  const MAX = 10000;

  // メッセージボックスの作成と表示, 入力受付
  const message = `シート${adjustTargetSheets.join(', ')}の行サイズを拡張または縮小します。\\n目標の行サイズを半角の自然数で入力してください。\\n${MIN}以下または${MAX}以上の場合は何もしません。`;
  const targetRowSize = Number(Browser.inputBox(message));

  // 例外処理
  if (targetRowSize <= MIN || targetRowSize >= MAX) return;

  // アクティブなスプレッドシートを取得する
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // すべてのシートを取得する
  let sheets = spreadsheet.getSheets();

  // すべてのシートの名前を取得する
  let nameList = sheets.map(sheet => sheet.getName());

  // シートを1つずつ走査して「調整したいシートの名前」のみの行サイズを変更する
  for (let i = 0; i < nameList.length; i++) {

    // 走査中のシートが「調整したいシートの名前」であるか
    if (adjustTargetSheets.includes(nameList[i])) {

      // 調整したいシートの行サイズ
      const currentRowSize = sheets[i].getMaxRows();

      // 行サイズの差分
      const diffRowSize = targetRowSize - currentRowSize;

      // 差分に応じて処理
      if (diffRowSize > 0) {
        // 最終行の後に、足りない行を追加する
        sheets[i].insertRowsAfter(currentRowSize, diffRowSize);
      } else if (diffRowSize < 0) {
        // 目標の行より下の行を削除する
        sheets[i].deleteRows(targetRowSize + 1, -diffRowSize);
      }

      // diffRowSize == 0の場合は何もしなくてよい

    }
  }
}