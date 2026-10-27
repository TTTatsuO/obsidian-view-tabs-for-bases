# View Tabs for Bases

[English](../README.md) | [日本語](README.ja.md) | **简体中文** | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Español](README.es.md)

一眼看清 Obsidian [数据库(Bases)](https://help.obsidian.md/bases)的所有视图。本插件把数据库的视图以标签的形式排列在结果数量旁边，无需打开视图菜单，点击一下即可切换视图。

![名为 Projects 的数据库中，All projects、Active、Due soon、By owner 和 Board 视图以标签形式显示在“8 results”旁边](../assets/tabs.png)

## 功能

- **工具栏中的标签**：每个视图在结果数量旁边都有一个标签，当前视图的标签会高亮显示。
- **一键切换**：点击标签即可打开对应的视图。
- **拖动排序**：把一个标签拖到另一个标签上即可移动它。这会改变视图本身的顺序，因此内置的视图菜单也会显示相同的顺序。
- **按视图设置标签**：可以为每个视图选择是否显示标签，并设置标签的颜色（边框）和大小（宽度）。
- **右键菜单**：右键点击标签可以更改颜色或大小，或将其从标签中移除。
- **放不下时可滚动**：标签放不下时可以横向滚动（也支持鼠标滚轮），两端会淡出显示。内置的工具栏按钮不会被压缩。

## 安装

- **社区插件**（上架后）：打开 **Settings → Community plugins → Browse**，搜索 “View Tabs for Bases”，点击 **Install**，然后点击 **Enable**。
- **手动安装**：从[最新版本](https://github.com/TTTatsuO/obsidian-view-tabs-for-bases/releases/latest)下载 `main.js`、`manifest.json` 和 `styles.css`，放入 `<Vault>/.obsidian/plugins/view-tabs-for-bases/`，然后在 **Settings → Community plugins** 中启用插件。

需要 Obsidian 1.14.0 或更高版本。仅支持桌面端。

## 使用方法

打开一个 `.base` 文件，它的视图会以标签形式显示在结果数量旁边。

要更改标签，请右键点击它，然后选择颜色、大小或 **从标签中移除**。

![标签的右键菜单，包含颜色、大小和从标签中移除](../assets/context-menu.png)

也可以从视图菜单中打开 **Configure view**（视图设置），在底部的 **标签设置** 部分（**在标签中显示**、**颜色**、**大小**）进行更改。

![Configure view 底部的标签设置部分](../assets/configure-view.png)

要恢复已移除的标签，请从视图菜单中打开该视图的 **Configure view**，重新打开 **在标签中显示**。

要在所有数据库中关闭标签，请在插件设置中关闭 **显示视图标签**。

### 设置的保存位置

标签设置保存在 `.base` 文件中各个视图的内部，统一放在一个键下。只会写入与默认值不同的值：

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

因此，重命名、复制或同步数据库时，设置会随之保留。卸载插件后，Obsidian 会忽略这个键，你也可以手动删除它。

## 语言

插件跟随 Obsidian 的语言设置。支持的语言有：English、العربية、বাংলা、Català、Čeština、Dansk、Deutsch、Ελληνικά、Español、فارسی、Suomi、Français、עברית、Magyar、Bahasa Indonesia、Italiano、日本語、ខ្មែរ、한국어、Nederlands、Norsk、Polski、Português、Português do Brasil、Română、Русский、Slovenčina、Svenska、ไทย、Türkçe、Українська、Tiếng Việt、简体中文 和 繁體中文。其他语言会显示为英语。

除英语和日语外，其他翻译尚未经过母语人士审阅。如果你的语言中有表达不自然的地方，欢迎提交 issue，或提交修改 [`src/i18n.ts`](../src/i18n.ts) 的 pull request。

## 限制

- 只有在单独的标签页中打开 `.base` 文件时才会显示标签。嵌入在笔记中的数据库（`![[file.base]]` 或 `base` 代码块）暂不支持。
- 在弹出窗口中标签可以正常使用，但 **Configure view** 中不会出现 **标签设置** 部分。此时请使用标签的右键菜单。
- 仅支持桌面端。
- Obsidian 没有提供用于数据库工具栏或视图列表的公开 API，因此本插件使用了 Obsidian 的内部机制。将来的 Obsidian 更新可能会导致标签无法显示。如果发生这种情况，插件只会停止工作：你的数据库和视图不会被改动，标签设置也会保留在文件中。

## 许可证

[MIT](../LICENSE)
