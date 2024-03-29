/**
 * @file このファイルはカスタムメニューを扱います。
 */

/**
 * @brief スプレッドシートのオープンをトリガに、メニューバーにカスタムメニューを追加します。
 * @see addMenu::createIndex()
 * @OnlyCurrentDoc
 */
function onOpen(event) {
  let menuItems = [
    { name: "目次作成", functionName: "createIndex" },
    { name: "行サイズを調整する", functionName: "adjustRowSize" },
    {
      name: "二分法による下限第3種加算補正値探索",
      functionName: "b3BinarySearch",
    },
    {
      //name: "インポート_新規",
      name: "インポート",
      functionName: "importCSVFromSameFolderNew",
    },
    //{
    //  name: "インポート_追記",
    //  functionName: "importCSVFromSameFolderAppend"
    //}
  ];
  let sheet = SpreadsheetApp.getActiveSpreadsheet();
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
  // アクティブなスプレッドシートを取得する
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // アクティブなシートを取得する
  let sheet = spreadsheet.getActiveSheet();

  // アクティブな範囲を取得する
  let range = sheet.getActiveRange();

  // すべてのシートを取得する
  let sheets = spreadsheet.getSheets();

  // すべてのシートの名前を取得してnameListに格納する
  let nameList = sheets.map((sheet) => sheet.getName());

  // 取得したシートのgidを格納する
  let gidList = sheets.map((sheet) => sheet.getSheetId());

  // すべてのシートについて
  for (let i = 0; i < sheets.length; i++) {
    // 組み込み関数を作って格納する
    let formulaStr = `=hyperlink(\n   "#gid=${gidList[i]}",\n   "${nameList[i]}"\n )`;

    // 出力する
    sheet
      .getRange(range.getRowIndex() + i, range.getColumn())
      .setFormula(formulaStr);
  }
}

/**
 * @brief 定義したシート名と合致するシートの行サイズを変更します。
 * @see addMenu::createIndex()
 * @OnlyCurrentDoc
 */
function adjustRowSize() {
  // 調整したいシートの名前
  const adjustTargetSheets = ["input", "calc", "invCalc", "attacker"];

  const MIN = 3;
  const MAX = 10000;

  // メッセージボックスの作成と表示, 入力受付
  const message = `シート${adjustTargetSheets.join(
    ", "
  )}の行サイズを拡張または縮小します。\\n目標の行サイズを半角の自然数で入力してください。\\n${MIN}以下または${MAX}以上の場合は何もしません。`;
  const targetRowSize = Number(Browser.inputBox(message));

  // 例外処理
  if (targetRowSize <= MIN || targetRowSize >= MAX) return;

  // アクティブなスプレッドシートを取得する
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // すべてのシートを取得する
  let sheets = spreadsheet.getSheets();

  // すべてのシートの名前を取得する
  let nameList = sheets.map((sheet) => sheet.getName());

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

/**
 * @brief 二分法により、第3種加算補正値の下限を探索します。
 * @see addMenu::createIndex()
 * @OnlyCurrentDoc
 */
function b3BinarySearch() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let console = spreadsheet.getSheetByName("console");

  //function　getB3() { return Number(console.getRange('P3').getValue()); }
  function getB3_inf() {
    return Number(console.getRange("Q31").getValue());
  }
  function getB3_max() {
    return Number(console.getRange("S31").getValue());
  }
  function isUnexpectedDamage() {
    return (
      Number(console.getRange("Q41").getValue()) +
      Number(console.getRange("S41").getValue())
    );
  }

  function setB3(num) {
    Number(console.getRange("Q3").setValue(num));
  }
  //function　setB3_inf(num) { Number(console.getRange('P3').setValue(num)); }
  //function　setB3_max(num) { Number(console.getRange('P3').setValue(num)); }

  let b3_inf = getB3_inf();
  let b3_max = getB3_max();
  let mid = (b3_inf + b3_max) / 2;
  const accuracy = 1e-10;

  while (1) {
    let temp_acc = mid;
    let temp_is;

    setB3(mid);

    if ((temp_is = isUnexpectedDamage())) {
      b3_inf = mid;
      mid = (mid + b3_max) / 2;
    } else {
      b3_max = mid;
      mid = (b3_inf + mid) / 2;
    }

    Logger.log(mid + ", " + temp_is);

    if (Math.abs(temp_acc - mid) < accuracy && temp_is) break;
  }
}

function importCSVFromSameFolderNew() {
  const csvDataArray = getCSVDataArrayFromSameFolder(false);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const numColumns = csvDataArray[0][0].length;
  const numRows = csvDataArray.flat().length;

  sheet.getRange(1, 1, numRows, numColumns).setValues(csvDataArray.flat());
}

function importCSVFromSameFolderAppend() {
  const csvDataArray = getCSVDataArrayFromSameFolder(true);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const numColumns = csvDataArray[0][0].length;
  const numRows = csvDataArray.flat().length;

  sheet
    .getRange(sheet.getLastRow() + 1, 1, numRows, numColumns)
    .setValues(csvDataArray.flat());
}

function getCSVDataArrayFromSameFolder(isRemoveAllHeader: boolean) {
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const spreadsheetFile = DriveApp.getFileById(spreadsheetId);
  const spreadsheetFolder = spreadsheetFile.getParents().next();
  const files = spreadsheetFolder.getFilesByType(MimeType.CSV);

  const csvDataArray = [];

  while (files.hasNext()) {
    const csvData = files.next().getBlob().getDataAsString("Shift-JIS");
    const csv = Utilities.parseCsv(
      Utilities.newBlob(csvData, "Shift-JIS").getDataAsString("UTF-8")
    );

    if (isRemoveAllHeader || csvDataArray.length > 0) {
      csv.shift();
    }

    csvDataArray.push(csv);
  }

  return csvDataArray;
}
