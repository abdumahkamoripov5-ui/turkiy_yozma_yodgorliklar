from pathlib import Path
from xml.sax.saxutils import escape
import re
import zipfile
import sys

folder = Path(__file__).resolve().parent
source = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else folder / 'Turkiy_meros_BIRJA_TEXNIK_TOPSHIRIQ_2026-10-22.md'
target = source.with_suffix('.docx')

def runs(value):
    pieces = re.split(r'(\*\*.*?\*\*)', value)
    return ''.join('<w:r>' + ('<w:rPr><w:b/></w:rPr>' if p.startswith('**') else '')
                   + '<w:t xml:space="preserve">' + escape(p[2:-2] if p.startswith('**') else p)
                   + '</w:t></w:r>' for p in pieces if p)

def paragraph(value, style=None):
    prop = '<w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>' if style else ''
    return '<w:p>' + prop + runs(value) + '</w:p>'

def table(rows):
    result = ['<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/>'
              '<w:tblBorders>' + ''.join('<w:' + edge + ' w:val="single" w:sz="4" w:color="B8C4CE"/>'
              for edge in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'])
              + '</w:tblBorders></w:tblPr>']
    for index, row in enumerate(rows):
        result.append('<w:tr>' + ('<w:trPr><w:tblHeader/></w:trPr>' if index == 0 else ''))
        for cell in row:
            result.append('<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/>'
                          + ('<w:shd w:fill="E8EFF5"/>' if index == 0 else '')
                          + '</w:tcPr>' + paragraph('**' + cell + '**' if index == 0 else cell)
                          + '</w:tc>')
        result.append('</w:tr>')
    result.append('</w:tbl>')
    return ''.join(result)

body = []
pending = []
for line in source.read_text(encoding='utf-8').splitlines() + ['']:
    if line.startswith('|'):
        cells = [cell.strip() for cell in line.strip().strip('|').split('|')]
        if not all(re.fullmatch(r':?-+:?', cell) for cell in cells):
            pending.append(cells)
        continue
    if pending:
        body.append(table(pending))
        pending = []
    if not line.strip():
        continue
    heading = re.match(r'^(#{1,3}) (.*)', line)
    if heading:
        body.append(paragraph(heading.group(2), 'Title' if len(heading.group(1)) == 1 else
                              'Heading' + str(len(heading.group(1)) - 1)))
    else:
        body.append(paragraph('• ' + line[2:] if line.startswith('- ') else line))

ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="' + ns + '"><w:body>'
document += ''.join(body) + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
document += '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>'
styles = '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="' + ns + '">'
styles += '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>'
styles += '<w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr>'
styles += '<w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
for name, size, color in [('Title', 36, '17365D'), ('Heading1', 29, '17365D'), ('Heading2', 25, '244A70')]:
    styles += '<w:style w:type="paragraph" w:styleId="' + name + '"><w:name w:val="' + name + '"/>'
    styles += '<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="140"/></w:pPr>'
    styles += '<w:rPr><w:b/><w:color w:val="' + color + '"/><w:sz w:val="' + str(size) + '"/></w:rPr></w:style>'
styles += '</w:styles>'
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>')
    archive.writestr('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
    archive.writestr('word/document.xml', document)
    archive.writestr('word/styles.xml', styles)
    archive.writestr('word/_rels/document.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')

import xml.etree.ElementTree as ET
with zipfile.ZipFile(target) as archive:
    for name in archive.namelist():
        ET.fromstring(archive.read(name))
print(target)
print(f'Validated DOCX: {target.stat().st_size} bytes')
