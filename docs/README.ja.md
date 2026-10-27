# View Tabs for Bases

[English](../README.md) | **日本語** | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Español](README.es.md)

Obsidian の [Base](https://help.obsidian.md/bases) のビューを、ひと目で見渡せるようにするプラグインです。Base のビューを結果件数のすぐ横にタブで並べるので、ビューのメニューを開かずに、ワンクリックで切り替えられます。

![Projects という Base で、All projects・Active・Due soon・By owner・Board のビューが「8 results」の横にタブで並んでいる](../assets/tabs.png)

## 機能

- **ツールバーにタブ**: ビューごとに、結果件数の横にタブが付きます。今のビューのタブは強調されます。
- **ワンクリックで切り替え**: タブを押すと、そのビューに切り替わります。
- **ドラッグで並べ替え**: タブを別のタブの上に落とすと移動します。ビュー自体の順番が変わるので、標準のビューのメニューも同じ並びになります。
- **ビューごとのタブ設定**: ビューごとに、タブに出すかどうか、タブの色(枠の色)と大きさ(横幅)を決められます。
- **右クリックメニュー**: タブを右クリックすると、色や大きさを変えたり、タブから外したりできます。
- **入りきらないときはスクロール**: タブが入りきらないときは横にスクロールでき(マウスホイールでも動きます)、端がうっすらフェードします。標準のツールバーのボタンは縮みません。

## インストール

- **コミュニティプラグイン**(掲載後): **Settings → Community plugins → Browse** を開き、「View Tabs for Bases」を検索して **Install**、続けて **Enable** を押します。
- **手動**: [最新のリリース](https://github.com/TTTatsuO/obsidian-view-tabs-for-bases/releases/latest)から `main.js`・`manifest.json`・`styles.css` をダウンロードして `<Vault>/.obsidian/plugins/view-tabs-for-bases/` に置き、**Settings → Community plugins** でプラグインを有効にします。

Obsidian 1.14.0 以降が必要です。デスクトップ版のみ対応しています。

## 使い方

`.base` ファイルを開くと、そのビューが結果件数の横にタブで並びます。

タブを変えるときは、タブを右クリックして、色・大きさ・**タブから外す** を選びます。

![タブの右クリックメニュー。色・大きさ・タブから外す が並んでいる](../assets/context-menu.png)

ビューのメニューから **Configure view**(ビューの設定画面)を開き、一番下の **タブ設定** の節(**タブに表示**・**色**・**大きさ**)で変えることもできます。

![Configure view の一番下にある タブ設定 の節](../assets/configure-view.png)

タブから外したビューを戻すときは、ビューのメニューからそのビューの **Configure view** を開き、**タブに表示** をオンに戻します。

すべての Base でタブを消したいときは、プラグインの設定で **ビューのタブを表示** をオフにします。

### 設定の保存場所

タブの設定は、`.base` ファイルの各ビューの中に、1つのキーにまとめて保存されます。書かれるのは、既定と違う値だけです。

```yaml
views:
  - type: table
    name: Overview
    viewTabsForBases:
      color: blue
      size: large
  - type: table
    name: Drafts
    viewTabsForBases:
      show: false
```

そのため、Base の名前を変えたり、複製したり、同期したりしても、設定は一緒についていきます。プラグインをアンインストールしても、Obsidian はこのキーを無視します。不要なら手で消せます。

## 対応言語

プラグインの表示は、Obsidian の言語設定に従います。対応している言語は、English、العربية、বাংলা、Català、Čeština、Dansk、Deutsch、Ελληνικά、Español、فارسی、Suomi、Français、עברית、Magyar、Bahasa Indonesia、Italiano、日本語、ខ្មែរ、한국어、Nederlands、Norsk、Polski、Português、Português do Brasil、Română、Русский、Slovenčina、Svenska、ไทย、Türkçe、Українська、Tiếng Việt、简体中文、繁體中文 です。それ以外の言語では英語で表示されます。

英語と日本語以外の訳は、まだネイティブの確認を受けていません。おかしな表現があれば、issue を立てるか、[`src/i18n.ts`](../src/i18n.ts) を直すプルリクエストを送ってください。

## 制限

- タブが出るのは、`.base` ファイルをタブで開いたときだけです。ノートに埋め込んだ Base(`![[file.base]]` や `base` コードブロック)には、まだ対応していません。
- ポップアウトしたウィンドウでもタブは動きますが、**Configure view** に **タブ設定** の節は出ません。その場合は、タブの右クリックメニューを使ってください。
- デスクトップ版のみ対応しています。
- Obsidian には、Bases のツールバーやビューの一覧を扱う公開 API がないため、このプラグインは Obsidian の内部の仕組みを使っています。将来の Obsidian のアップデートで、タブが出なくなる可能性があります。その場合、プラグインは何もしなくなるだけです。Base やビューには手を加えず、タブの設定もファイルに残ります。

## ライセンス

[MIT](../LICENSE)
