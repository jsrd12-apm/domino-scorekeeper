"""v0.0.18: fix Info tab typos + double-bullet formatting + update content for current functionality."""
from pathlib import Path
import re

p = Path('/home/g2032165/domino-scorekeeper/src/App.jsx')
code = p.read_text()

# Bump version
code = code.replace("const APP_VERSION = '0.0.17';", "const APP_VERSION = '0.0.18';")
print("APP_VERSION → 0.0.18")

# ============== TYPO + CONTENT FIXES (Spanish) ==============

# 1. share_step1: "↗︎" arrow is fine. Update to mention compartir icon properly
es_typo_fixes = [
    # Typo: "enví" → "envía"
    ("'Se abre el menú compartir nativo: enví a WhatsApp, Mensajes, Email o guarda en Fotos.'",
     "'Se abre el men\u00fa compartir nativo: env\u00eda a WhatsApp, Mensajes, Email o guarda en Fotos.'"),
    # use_paso: P. CORRIDO is now CORRIDO (label change)
    ("'Toca P. CORRIDO y elige el equipo. Toca de nuevo para apilar m\u00e1s.'",
     "'Toca CORRIDO y elige el equipo. Cada toque suma un bono que se aplica a la pr\u00f3xima jugada.'"),
    # rule_paso mentions only Paso Corrido — also mention +10
    ("'Paso Corrido: bono adicional para el equipo elegido. Puedes apilar varios en una jugada.'",
     "'Bonos: Paso Corrido (CORRIDO) y +10 son extras que sumas a la jugada antes de tocar el bot\u00f3n +. Puedes apilar varios.'"),
    # use_edit
    ("'Toca el l\u00e1piz junto a un nombre para editarlo.'",
     "'Toca cualquier nombre de equipo o jugador para editarlo. Toca el icono de l\u00e1piz junto al valor.'"),
    # use_score
    ("'Ingresa los puntos en las casillas y toca A\u00d1ADIR.'",
     "'Ingresa los puntos del equipo ganador en su casilla y toca el bot\u00f3n + (A\u00d1ADIR) para registrar la jugada.'"),
    # share_step1
    ("'Toca el icono compartir (\u2197\ufe0e) arriba a la derecha mientras juegas.'",
     "'Toca el icono compartir arriba a la derecha mientras juegas. Genera una imagen JPG instant\u00e1nea.'"),
    # history_step1: app already auto-asks via Nuevo modal
    ("'Al terminar un juego, presiona \"Nuevo\" y la app preguntar\u00e1 si quieres guardarlo.'",
     "'Al presionar \"Nuevo\" la app te pregunta: guardar y empezar nuevo, empezar sin guardar, o cancelar. Tambi\u00e9n puedes tocar \"Guardar\" en cualquier momento.'"),
    # history_step4
    ("'En el detalle puedes \"Exportar texto\" para enviar por email o \"Compartir imagen\" como JPG.'",
     "'En el detalle puedes exportar como texto para enviar por email o compartir como imagen JPG.'"),
]

for old, new in es_typo_fixes:
    if old not in code:
        print(f"  WARN: not found: {old[:60]}...")
        continue
    code = code.replace(old, new)
print(f"Spanish typos/content fixed")

# 2. Add new strings for the additional info sections we'll add
es_anchor = """    history_step4: 'En el detalle puedes exportar como texto para enviar por email o compartir como imagen JPG.',"""
es_addition = """    history_step4: 'En el detalle puedes exportar como texto para enviar por email o compartir como imagen JPG.',
    bonus_section: 'Bonos: Corrido y +10',
    bonus_step1: 'Toca CORRIDO o +10 durante una jugada en curso.',
    bonus_step2: 'Selecciona el equipo que recibe el bono. Aparece como una jugada pendiente al final de la tabla con \"?\" en los puntos.',
    bonus_step3: 'Toca el bot\u00f3n del bono otra vez para apilar m\u00e1s. Cada toque suma una unidad.',
    bonus_step4: 'Cuando termine la jugada, ingresa los puntos del ganador y toca + para confirmar. El bono se aplica a esa jugada.',
    series_section: 'Series (mejor de 3 o 5)',
    series_step1: 'Al tocar \"Nuevo\" eliges modo: un juego, mejor de 3, o mejor de 5.',
    series_step2: 'El marcador entre los equipos cuenta los sets ganados. Se actualiza autom\u00e1ticamente al guardar un juego.',
    series_step3: 'El equipo que llegue a 2 (de 3) o 3 (de 5) gana la serie.',
    update_section: 'Actualizaciones',
    update_step1: 'Toca \"Actualizar\" en el pie de p\u00e1gina para buscar versi\u00f3n nueva.',
    update_step2: 'Si est\u00e1 al d\u00eda, ver\u00e1s \u201c\u00daltima versi\u00f3n\u201d en verde por unos segundos.',
    update_step3: 'Si hay una nueva versi\u00f3n, la app la descarga y se reinicia autom\u00e1ticamente.',
    export_section: 'Exportar juegos',
    export_info_1: 'Desde \"Ver Anteriores\" toca \"Exportar juegos\".',
    export_info_2: 'Marca los juegos individuales con la casilla, o usa los filtros (fechas, equipos) y toca \"Seleccionar todos\".',
    export_info_3: 'Elige CSV (texto, ideal para hojas de c\u00e1lculo) o JPG (im\u00e1genes individuales).',
    export_info_4: 'Se abre el men\u00fa compartir del sistema para enviarlos.',"""

assert es_anchor in code, "ES history_step4 anchor not found"
code = code.replace(es_anchor, es_addition)
print("Spanish bonus/series/update/export sections added")

# ============== ENGLISH typo + content fixes ==============
en_typo_fixes = [
    ("'Tap P. CORRIDO and pick a team. Tap again to stack more.'",
     "'Tap CORRIDO and pick a team. Each tap stacks one bonus, applied to the next round.'"),
    ("'Paso Corrido: extra bonus for the chosen team. You can stack several in one round.'",
     "'Bonuses: Paso Corrido (CORRIDO) and +10 are extras you stack before hitting + (ADD). Multiple stacks per round are allowed.'"),
    ("'Tap the pencil next to a name to edit it.'",
     "'Tap any team or player name to edit it. Tap the pencil icon next to a value.'"),
    ("'Enter points in the boxes and tap ADD.'",
     "'Enter the winning team\\'s points and tap + (ADD) to record the round.'"),
    ("'Tap the share icon at the top right while you play.'",
     "'Tap the share icon at the top right while you play. Generates a JPG image of the current scoreboard.'"),
    ("'When a game ends, tap \"New\" and the app will ask if you want to save it.'",
     "'When you tap \"New\" the app asks: save and start new, start without saving, or cancel. You can also tap \"Save\" anytime.'"),
    ("'In the detail view, \"Export text\" sends the summary by email; \"Share image\" sends it as JPG.'",
     "'In the detail view you can export as text for email or share as a JPG image.'"),
]

for old, new in en_typo_fixes:
    if old not in code:
        print(f"  WARN EN: not found: {old[:60]}...")
        continue
    code = code.replace(old, new)
print("English content fixed")

en_anchor = """    history_step4: 'In the detail view you can export as text for email or share as a JPG image.',"""
en_addition = """    history_step4: 'In the detail view you can export as text for email or share as a JPG image.',
    bonus_section: 'Bonuses: Corrido and +10',
    bonus_step1: 'Tap CORRIDO or +10 during a round in progress.',
    bonus_step2: 'Pick the team receiving the bonus. It appears as a pending round at the bottom of the table with \"?\" placeholders.',
    bonus_step3: 'Tap the bonus button again to stack more. Each tap adds one unit.',
    bonus_step4: 'When the round ends, enter the winner\\'s points and tap + to commit. The bonus applies to that round.',
    series_section: 'Series (best of 3 or 5)',
    series_step1: 'Tapping \"New\" lets you pick a mode: single game, best of 3, or best of 5.',
    series_step2: 'The middle scoreboard counts sets won. Auto-updates when a game is saved.',
    series_step3: 'First team to 2 (of 3) or 3 (of 5) wins the series.',
    update_section: 'Updates',
    update_step1: 'Tap \"Update\" in the footer to check for a new version.',
    update_step2: 'If up to date, you\\'ll see \u201cUp to date\u201d in green briefly.',
    update_step3: 'If a new version exists, the app downloads and reloads automatically.',
    export_section: 'Exporting games',
    export_info_1: 'From \"View Previous\" tap \"Export games\".',
    export_info_2: 'Check individual games, or use filters (dates, teams) and tap \"Select all\".',
    export_info_3: 'Pick CSV (text, ideal for spreadsheets) or JPG (individual images).',
    export_info_4: 'The system share menu opens to send them.',"""

assert en_anchor in code, "EN history_step4 anchor not found"
code = code.replace(en_anchor, en_addition)
print("English bonus/series/update/export sections added")

# ============== FIX DOUBLE-BULLET ISSUE ==============
# Change all <ul> in AboutView to use list-style: none + custom bullet via • text
# OR drop the manual bullet and rely on browser default
# Cleaner: keep manual • but add listStyleType: none
old_ul_scoring = """      <Section title={t.how_scoring}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4 }}>
          <li>• {t.rule_teams}</li>
          <li>• {t.rule_target}</li>
          <li>• {t.rule_winner}</li>
          <li>• {t.rule_paso}</li>
          <li>• {t.rule_edit}</li>
        </ul>
      </Section>

      <Section title={t.how_to_use}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4 }}>
          <li>• {t.use_edit}</li>
          <li>• {t.use_score}</li>
          <li>• {t.use_paso}</li>
        </ul>
      </Section>"""

new_ul_scoring = """      <Section title={t.how_scoring}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, listStyle: 'none', paddingLeft: 0 }}>
          <li>\u2022 {t.rule_teams}</li>
          <li>\u2022 {t.rule_target}</li>
          <li>\u2022 {t.rule_winner}</li>
          <li>\u2022 {t.rule_paso}</li>
          <li>\u2022 {t.rule_edit}</li>
        </ul>
      </Section>

      <Section title={t.how_to_use}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, listStyle: 'none', paddingLeft: 0 }}>
          <li>\u2022 {t.use_edit}</li>
          <li>\u2022 {t.use_score}</li>
          <li>\u2022 {t.use_paso}</li>
        </ul>
      </Section>"""

assert old_ul_scoring in code, "ul scoring/use blocks not found"
code = code.replace(old_ul_scoring, new_ul_scoring)
print("Double-bullet fixed: listStyle:none added")

# ============== ADD NEW SECTIONS TO ABOUTVIEW ==============
# Insert bonus/series/update/export sections after how_to_use
old_after_use = """      <Section title={t.how_to_use}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, listStyle: 'none', paddingLeft: 0 }}>
          <li>\u2022 {t.use_edit}</li>
          <li>\u2022 {t.use_score}</li>
          <li>\u2022 {t.use_paso}</li>
        </ul>
      </Section>

      <Section title={t.share_section}>"""

new_after_use = """      <Section title={t.how_to_use}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, listStyle: 'none', paddingLeft: 0 }}>
          <li>\u2022 {t.use_edit}</li>
          <li>\u2022 {t.use_score}</li>
          <li>\u2022 {t.use_paso}</li>
        </ul>
      </Section>

      <Section title={t.bonus_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.bonus_step1}</li>
          <li>{t.bonus_step2}</li>
          <li>{t.bonus_step3}</li>
          <li>{t.bonus_step4}</li>
        </ol>
      </Section>

      <Section title={t.series_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.series_step1}</li>
          <li>{t.series_step2}</li>
          <li>{t.series_step3}</li>
        </ol>
      </Section>

      <Section title={t.share_section}>"""

assert old_after_use in code, "post-use anchor not found"
code = code.replace(old_after_use, new_after_use)

# Insert export + update sections after history_section, before the Sugerencias button
old_after_history = """      <Section title={t.history_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.history_step1}</li>
          <li>{t.history_step2}</li>
          <li>{t.history_step3}</li>
          <li>{t.history_step4}</li>
        </ol>
      </Section>

      {/* Sugerencias button */}"""

new_after_history = """      <Section title={t.history_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.history_step1}</li>
          <li>{t.history_step2}</li>
          <li>{t.history_step3}</li>
          <li>{t.history_step4}</li>
        </ol>
      </Section>

      <Section title={t.export_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.export_info_1}</li>
          <li>{t.export_info_2}</li>
          <li>{t.export_info_3}</li>
          <li>{t.export_info_4}</li>
        </ol>
      </Section>

      <Section title={t.update_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.update_step1}</li>
          <li>{t.update_step2}</li>
          <li>{t.update_step3}</li>
        </ol>
      </Section>

      {/* Sugerencias button */}"""

assert old_after_history in code, "post-history anchor not found"
code = code.replace(old_after_history, new_after_history)
print("New sections (Bonus, Series, Export, Update) added to AboutView")

p.write_text(code)
print(f"\nFinal: {len(code)} bytes ({len(code.splitlines())} lines)")
