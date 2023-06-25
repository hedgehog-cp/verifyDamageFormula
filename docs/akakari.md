# 赤仮

## 概説

- [のらたこ氏が開発している](https://github.com/noratako5/logbook)
- 戦闘データの収集に用いる

## 導入方法

Java で書かれているから、Java を動かすための環境をインストールする必要がある。
詳細は、以下のいずれかに任せる。

- [艦これ検証 Wiki](https://kancolle.fandom.com/ja/wiki/データ収集ツール導入手順)
- 艦これツール wiki
  - [航海日誌拡張版](https://wikiwiki.jp/kancolletool/航海日誌拡張版)
  - [ツール提携](https://wikiwiki.jp/kancolletool/interop)
- [艦これのダメージ検証 TIPS](https://twitter.com/CC_jabberwock/status/1460957949413986304)

## 起動方法

多くの場合、赤仮をこれ単体で利用することは少ない。74 式電波観測儀などと併用することだろう。Sniffer とも併用する場合もある。艦これを始めるときにこれらのツール N 個を全て起動するために N 回起動するコマンドを与えることは避けたい。そこで、ここでは Windows 環境であることを仮定して BAT ファイルを利用した、複数ツールを一挙に起動する方法を例示する。

**74 式電波観測儀を起動して、赤仮を起動する**

```bat
cd C:\PATH\TO\ElectronicObserver\
start ElectronicObserver.exe

cd C:\PATH\TO\logbook
start "" "logbook.exe" -jar

exit
```

**Suniffer を起動して、74 式電波観測儀を起動して、赤仮を起動する**

```bat
pushd C:\PATH\TO\KancolleSniffer\
START "" "KancolleSniffer.exe"
popd

pushd C:\PATH\TO\ElectronicObserver\
START "" "ElectronicObserver.exe"
popd

pushd C:\PATH\TO\logbook\
START "" "logbook4G.exe" -jar
popd
```

BAT ファイルを利用するには、以下の手順に従う。

1. メモ帳などのテキストエディタを開く
2. 上記ソースコード例にならって、コードを記述する
   - BAT ファイルの詳しい文法などについては google 先生などに尋ねよ
3. 拡張子を`.bat`として保存する
4. ダブルクリックなどで実行する

ここでいくつかの注意点がある

- これらのソースコードは、ロケールが日本ならば、ANSI(Shift-JIS) でエンコードされている必要がある。
- 74 式が EN などの派生の場合、フォルダ名が例とは異なるだろうから、適切に置換されたい。
- 以上のコードはあくまでも例であるため、あなたの環境では期待する動作を示さない場合がある。

## 既知のバグ

少なくとも以下のバグが確認されている。

- 雷撃戦のデータにおいて、残耐久を正しく追跡しない。
- 艦隊特殊攻撃のデータにおいて、砲撃順序を正しく出力しない。

# 後継

赤仮の開発者は 1 年以上その姿を現していない。したがって、[前述バグ](#既知のバグ)が修正される見込みがない。

ある人物が保守を行っているらしいが、ある事情に基づき、ここでは詳細を述べない。少なくとも続けて保守が続いていることだけを明言する。