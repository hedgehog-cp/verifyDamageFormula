# verifyDamageFormula

艦隊これくしょん -艦これ- のダメージ式を検証するプロジェクトです.

## documents

PDF 形式の定義文書や覚書とそのソースがあります.
PDF ファイルを LaTeX から編集するには, //あとで書く

## logbook/filter

ダメージ検証用スプレ改に入力する赤仮データを, 赤仮から上手に出力するために使うフィルタがあります.

## src

ダメージ検証用スプレ改で利用する Google Apps script(GAS) のスクリプトがあります.
このスクリプトは[ダメージ検証用スプレ改最新版](https://drive.google.com/drive/folders/1J_tBagjdXl81d0onHqKf--H5hf0TGHnw?usp=sharing)で利用します.

実態は GAS ではなくて, TypeScript で書いています.
TypeScript なので, 予め Node.js とか npm とか入れておく必要があると思います.

うまいこと clasp を install して, `clasp push` すると, 紐づけしたスプレッドシートのスクリプトに直接アップロードされます.
以下を参考にしてください.

- [google-clasp](https://github.com/google/clasp)
- [clasp-guides](https://developers.google.com/apps-script/guides/clasp?hl=ja)
- [GAS を TypeScript で使う方法](https://www.oit.ac.jp/rd/labs/kobayashi-lab/~yagshi/articles/gasts/)

`Error retrieving access token: Error: invalid_grant`というエラーが出た場合、`clasp login`を試してください。
