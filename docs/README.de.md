# View Tabs for Bases

[English](../README.md) | [日本語](README.ja.md) | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | **Deutsch** | [Français](README.fr.md) | [Español](README.es.md)

Alle Ansichten einer Obsidian-[Base](https://help.obsidian.md/bases) auf einen Blick. Dieses Plugin zeigt die Ansichten einer Base als Tabs direkt neben der Ergebnisanzahl, sodass du mit einem Klick zwischen Ansichten wechseln kannst, ohne das Ansichtsmenü zu öffnen.

![Eine Base „Projects“ mit den Ansichten All projects, Active, Due soon, By owner und Board als Tabs neben „8 results“](../assets/tabs.png)

## Funktionen

- **Tabs in der Werkzeugleiste**: Jede Ansicht erhält neben der Ergebnisanzahl einen Tab; die aktuelle Ansicht ist hervorgehoben.
- **Wechsel mit einem Klick**: Ein Klick auf einen Tab öffnet seine Ansicht.
- **Per Drag-and-drop sortieren**: Ziehe einen Tab auf einen anderen, um ihn zu verschieben. Dabei ändert sich die Reihenfolge der Ansichten selbst, sodass das eingebaute Ansichtsmenü dieselbe Reihenfolge zeigt.
- **Tab-Einstellungen pro Ansicht**: Lege für jede Ansicht fest, ob sie einen Tab hat, und wähle Farbe (Rahmen) und Größe (Breite) des Tabs.
- **Kontextmenü**: Klicke mit der rechten Maustaste auf einen Tab, um Farbe oder Größe zu ändern oder ihn aus den Tabs zu entfernen.
- **Scrollt bei Platzmangel**: Passen die Tabs nicht hinein, lassen sie sich seitlich scrollen (auch mit dem Mausrad) und blenden an den Rändern aus. Die eingebauten Schaltflächen der Werkzeugleiste behalten ihre Größe.

## Installation

- **Community-Plugins** (sobald gelistet): Öffne **Settings → Community plugins → Browse**, suche nach „View Tabs for Bases“, wähle **Install** und dann **Enable**.
- **Manuell**: Lade `main.js`, `manifest.json` und `styles.css` aus dem [neuesten Release](https://github.com/TTTatsuO/obsidian-view-tabs-for-bases/releases/latest) nach `<Vault>/.obsidian/plugins/view-tabs-for-bases/` herunter und aktiviere das Plugin unter **Settings → Community plugins**.

Erfordert Obsidian 1.14.0 oder neuer. Nur für Desktop.

## Verwendung

Öffne eine `.base`-Datei. Ihre Ansichten erscheinen als Tabs neben der Ergebnisanzahl.

Um einen Tab zu ändern, klicke ihn mit der rechten Maustaste an und wähle eine Farbe, eine Größe oder **Aus Tabs entfernen**.

![Das Kontextmenü eines Tabs mit Farbe, Größe und Aus Tabs entfernen](../assets/context-menu.png)

Du kannst auch über das Ansichtsmenü **Configure view** (die Ansichtseinstellungen) öffnen und den Abschnitt **Tab-Einstellungen** ganz unten verwenden: **In Tabs anzeigen**, **Farbe** und **Größe**.

![Der Abschnitt Tab-Einstellungen ganz unten in Configure view](../assets/configure-view.png)

Um einen entfernten Tab zurückzuholen, öffne über das Ansichtsmenü **Configure view** dieser Ansicht und schalte **In Tabs anzeigen** wieder ein.

Um die Tabs überall auszuschalten, deaktiviere **Ansichts-Tabs anzeigen** in den Einstellungen des Plugins.

### Wo die Einstellungen gespeichert werden

Die Tab-Einstellungen werden in der `.base`-Datei innerhalb jeder Ansicht unter einem einzigen Schlüssel gespeichert. Es werden nur Werte geschrieben, die vom Standard abweichen:

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

Die Einstellungen bleiben daher erhalten, wenn du die Base umbenennst, kopierst oder synchronisierst. Wenn du das Plugin deinstallierst, ignoriert Obsidian den Schlüssel; du kannst ihn auch von Hand löschen.

## Sprachen

Das Plugin folgt der Sprache von Obsidian. Es ist verfügbar auf English, العربية, বাংলা, Català, Čeština, Dansk, Deutsch, Ελληνικά, Español, فارسی, Suomi, Français, עברית, Magyar, Bahasa Indonesia, Italiano, 日本語, ខ្មែរ, 한국어, Nederlands, Norsk, Polski, Português, Português do Brasil, Română, Русский, Slovenčina, Svenska, ไทย, Türkçe, Українська, Tiếng Việt, 简体中文 und 繁體中文. Andere Sprachen fallen auf Englisch zurück.

Außer Englisch und Japanisch wurden die Übersetzungen noch nicht von Muttersprachlern geprüft. Wenn etwas in deiner Sprache seltsam klingt, eröffne bitte ein Issue oder einen Pull Request, der [`src/i18n.ts`](../src/i18n.ts) bearbeitet.

## Einschränkungen

- Tabs erscheinen nur, wenn eine `.base`-Datei in einem eigenen Tab geöffnet ist. In Notizen eingebettete Bases (`![[file.base]]` oder `base`-Codeblöcke) werden noch nicht unterstützt.
- In ausgelagerten Fenstern funktionieren die Tabs, aber der Abschnitt **Tab-Einstellungen** erscheint nicht in **Configure view**. Verwende dort stattdessen das Kontextmenü des Tabs.
- Nur für Desktop.
- Obsidian bietet keine öffentliche API für die Werkzeugleiste von Bases oder deren Ansichtsliste, daher nutzt das Plugin hierfür interne Mechanismen von Obsidian. Ein zukünftiges Obsidian-Update könnte dazu führen, dass die Tabs nicht mehr erscheinen. In diesem Fall tut das Plugin einfach nichts: Deine Bases und Ansichten bleiben unverändert, und die Tab-Einstellungen bleiben in der Datei erhalten.

## Lizenz

[MIT](../LICENSE)
