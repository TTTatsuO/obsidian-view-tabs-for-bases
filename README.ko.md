# View Tabs for Bases

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | **한국어** | [Deutsch](README.de.md) | [Français](README.fr.md) | [Español](README.es.md)

Obsidian [베이스(Bases)](https://help.obsidian.md/bases)의 모든 보기를 한눈에 볼 수 있게 해 주는 플러그인입니다. 베이스의 보기를 결과 수 바로 옆에 탭으로 나열하므로, 보기 메뉴를 열지 않고 한 번의 클릭으로 보기를 전환할 수 있습니다.

![Projects 베이스에서 All projects, Active, Due soon, By owner, Board 보기가 "3 results" 옆에 탭으로 표시된 모습](assets/tabs.png)

## 기능

- **도구 모음의 탭**: 각 보기마다 결과 수 옆에 탭이 생기며, 현재 보기의 탭이 강조 표시됩니다.
- **클릭 한 번으로 전환**: 탭을 클릭하면 해당 보기가 열립니다.
- **드래그로 순서 변경**: 탭을 다른 탭 위에 놓으면 이동합니다. 보기 자체의 순서가 바뀌므로 기본 보기 메뉴에도 같은 순서로 표시됩니다.
- **보기별 탭 설정**: 보기마다 탭을 표시할지 정하고, 탭의 색상(테두리)과 크기(너비)를 설정할 수 있습니다.
- **컨텍스트 메뉴**: 탭을 마우스 오른쪽 버튼으로 클릭하면 색상이나 크기를 바꾸거나 탭에서 제거할 수 있습니다.
- **공간이 부족하면 스크롤**: 탭이 다 들어가지 않으면 가로로 스크롤할 수 있으며(마우스 휠도 사용 가능), 가장자리가 흐리게 표시됩니다. 기본 도구 모음 버튼의 크기는 줄어들지 않습니다.

## 설치

- **커뮤니티 플러그인**(등록 후): **Settings → Community plugins → Browse**를 열고 "View Tabs for Bases"를 검색한 뒤 **Install**, 이어서 **Enable**을 누릅니다.
- **수동 설치**: [최신 릴리스](https://github.com/TTTatsuO/obsidian-view-tabs-for-bases/releases/latest)에서 `main.js`, `manifest.json`, `styles.css`를 내려받아 `<Vault>/.obsidian/plugins/view-tabs-for-bases/`에 넣은 다음, **Settings → Community plugins**에서 플러그인을 활성화합니다.

Obsidian 1.14.0 이상이 필요합니다. 데스크톱 전용입니다.

## 사용 방법

`.base` 파일을 열면 그 보기들이 결과 수 옆에 탭으로 표시됩니다.

탭을 바꾸려면 탭을 마우스 오른쪽 버튼으로 클릭하고 색상, 크기 또는 **탭에서 제거**를 선택합니다.

![탭의 컨텍스트 메뉴. 색상, 크기, 탭에서 제거 항목이 있음](assets/context-menu.png)

보기 메뉴에서 **Configure view**(보기 설정)를 열고, 맨 아래의 **탭 설정** 섹션(**탭에 표시**, **색상**, **크기**)에서 바꿀 수도 있습니다.

![Configure view 맨 아래의 탭 설정 섹션](assets/configure-view.png)

제거한 탭을 되돌리려면 보기 메뉴에서 해당 보기의 **Configure view**를 열고 **탭에 표시**를 다시 켭니다.

모든 베이스에서 탭을 끄려면 플러그인 설정에서 **보기 탭 표시**를 끕니다.

### 설정이 저장되는 곳

탭 설정은 `.base` 파일 안의 각 보기 내부에 하나의 키로 묶여 저장됩니다. 기본값과 다른 값만 기록됩니다.

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

따라서 베이스의 이름을 바꾸거나 복사하거나 동기화해도 설정이 함께 유지됩니다. 플러그인을 제거하면 Obsidian은 이 키를 무시하며, 직접 삭제할 수도 있습니다.

## 언어

플러그인은 Obsidian의 언어 설정을 따릅니다. 지원 언어는 English, العربية, বাংলা, Català, Čeština, Dansk, Deutsch, Ελληνικά, Español, فارسی, Suomi, Français, עברית, Magyar, Bahasa Indonesia, Italiano, 日本語, ខ្មែរ, 한국어, Nederlands, Norsk, Polski, Português, Português do Brasil, Română, Русский, Slovenčina, Svenska, ไทย, Türkçe, Українська, Tiếng Việt, 简体中文, 繁體中文입니다. 그 밖의 언어에서는 영어로 표시됩니다.

영어와 일본어를 제외한 번역은 아직 원어민의 검토를 받지 않았습니다. 어색한 표현이 있다면 issue를 열거나 [`src/i18n.ts`](src/i18n.ts)를 수정하는 pull request를 보내 주세요.

## 제한 사항

- 탭은 `.base` 파일을 별도의 탭에서 열었을 때만 표시됩니다. 노트에 삽입한 베이스(`![[file.base]]` 또는 `base` 코드 블록)는 아직 지원하지 않습니다.
- 팝아웃 창에서도 탭은 동작하지만, **Configure view**에 **탭 설정** 섹션이 나타나지 않습니다. 이때는 탭의 컨텍스트 메뉴를 사용하세요.
- 데스크톱 전용입니다.
- Obsidian에는 베이스의 도구 모음이나 보기 목록을 다루는 공개 API가 없어서, 이 플러그인은 Obsidian의 내부 구조를 사용합니다. 향후 Obsidian 업데이트로 탭이 표시되지 않을 수 있습니다. 그런 경우 플러그인은 아무 동작도 하지 않을 뿐이며, 베이스와 보기는 변경되지 않고 탭 설정도 파일에 그대로 남습니다.

## 라이선스

[MIT](LICENSE)
