#!/usr/bin/env python3
"""Export every repository Markdown document into one master PDF and section PDFs.

This exporter is invoked by the repository documentation artifact workflow.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import json, re, zipfile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted, Table, TableStyle

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"dist"/"documentation-pdfs"
OUT.mkdir(parents=True,exist_ok=True)
PAGE_W,PAGE_H=A4
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name="DocTitle",parent=styles["Title"],fontName="Helvetica-Bold",fontSize=23,leading=28,alignment=1,spaceAfter=14))
styles.add(ParagraphStyle(name="DocSubtitle",parent=styles["Normal"],fontSize=10,leading=15,alignment=1,textColor=colors.HexColor("#526071")))
styles.add(ParagraphStyle(name="DocH1",parent=styles["Heading1"],fontSize=17,leading=21,spaceBefore=9,spaceAfter=7,textColor=colors.HexColor("#24364b")))
styles.add(ParagraphStyle(name="DocH2",parent=styles["Heading2"],fontSize=13,leading=17,spaceBefore=8,spaceAfter=5,textColor=colors.HexColor("#34495e")))
styles.add(ParagraphStyle(name="DocH3",parent=styles["Heading3"],fontSize=11,leading=14,spaceBefore=6,spaceAfter=4))
styles.add(ParagraphStyle(name="DocBody",parent=styles["BodyText"],fontSize=8.5,leading=12,spaceAfter=5,splitLongWords=1))
styles.add(ParagraphStyle(name="DocSmall",parent=styles["BodyText"],fontSize=7.2,leading=9,textColor=colors.HexColor("#455468")))
styles.add(ParagraphStyle(name="DocCode",parent=styles["Code"],fontName="Courier",fontSize=6.4,leading=8,leftIndent=5,rightIndent=5,borderColor=colors.HexColor("#d8dee8"),borderWidth=.4,borderPadding=5,backColor=colors.HexColor("#f4f6f9"),spaceBefore=4,spaceAfter=7))
styles.add(ParagraphStyle(name="DocBullet",parent=styles["BodyText"],fontSize=8.3,leading=11,leftIndent=13,firstLineIndent=-8,spaceAfter=2))
styles.add(ParagraphStyle(name="DocQuote",parent=styles["BodyText"],fontSize=8.2,leading=11,leftIndent=14,textColor=colors.HexColor("#465569"),spaceAfter=5))

def inline_markup(s):
    s=escape(s,{'"':'&quot;'})
    s=re.sub(r'!\[([^\]]*)\]\(([^)]+)\)',r'[Image: \1] (\2)',s)
    s=re.sub(r'\[([^\]]+)\]\((https?://[^ )]+)(?:\s+"[^"]*")?\)',r'<link href="\2" color="#245a91">\1</link>',s)
    tick=chr(96)
    s=re.sub(tick+r'([^'+tick+r']+)'+tick,r'<font name="Courier" size="7">\1</font>',s)
    s=re.sub(r'\*\*(.+?)\*\*|__(.+?)__',lambda m:'<b>'+(m.group(1) or m.group(2))+'</b>',s)
    s=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)|_([^_]+)_',lambda m:'<i>'+(m.group(1) or m.group(2))+'</i>',s)
    return s

def split_table_row(line):
    return [x.strip() for x in re.split(r'(?<!\\)\|',line.strip().strip("|"))]

def parse_markdown(text):
    lines=text.replace("\r\n","\n").replace("\r","\n").split("\n")
    story=[];para=[];code=[];in_code=False;i=0;fence=chr(96)*3
    def flush_para():
        if para:
            raw=" ".join(x.strip() for x in para).strip()
            if raw: story.append(Paragraph(inline_markup(raw),styles["DocBody"]))
            para.clear()
    def flush_code():
        if code:
            story.append(Preformatted("\n".join(code),styles["DocCode"],maxLineLength=105));code.clear()
    while i<len(lines):
        line=lines[i];s=line.strip()
        if s.startswith(fence) or s.startswith("~~~"):
            flush_para()
            if in_code: flush_code();in_code=False
            else: in_code=True
            i+=1;continue
        if in_code: code.append(line.expandtabs(4));i+=1;continue
        if not s: flush_para();i+=1;continue
        if re.match(r'^\s*([-*_]\s*){3,}$',line): flush_para();story.append(Spacer(1,5));i+=1;continue
        hm=re.match(r'^(#{1,6})\s+(.+?)\s*#*\s*$',s)
        if hm:
            flush_para();level=len(hm.group(1));sty=styles["DocH1"] if level==1 else styles["DocH2"] if level==2 else styles["DocH3"]
            story.append(Paragraph(inline_markup(hm.group(2)),sty));i+=1;continue
        if s.startswith("|") and i+1<len(lines) and re.match(r'^\s*\|?[\s:|-]+\|?\s*$',lines[i+1]):
            flush_para();headers=split_table_row(line);i+=2;rows=[[Paragraph(inline_markup(c),styles["DocSmall"]) for c in headers]]
            while i<len(lines) and lines[i].strip().startswith("|"):
                cells=split_table_row(lines[i]);cells += [""]*max(0,len(headers)-len(cells))
                rows.append([Paragraph(inline_markup(c),styles["DocSmall"]) for c in cells[:len(headers)]]);i+=1
            n=max(1,len(headers));widths=[(PAGE_W-38*mm)/n]*n
            tbl=Table(rows,colWidths=widths,repeatRows=1,hAlign="LEFT")
            tbl.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#e8edf4")),("GRID",(0,0),(-1,-1),.35,colors.HexColor("#cbd5e1")),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
            story.extend([tbl,Spacer(1,6)]);continue
        if re.match(r'^\s*[-+*]\s+',line):
            flush_para();story.append(Paragraph("• "+inline_markup(re.sub(r'^\s*[-+*]\s+','',line)),styles["DocBullet"]));i+=1;continue
        if re.match(r'^\s*\d+[.)]\s+',line):
            flush_para();story.append(Paragraph(inline_markup(re.sub(r'^\s*\d+[.)]\s+','',line)),styles["DocBullet"]));i+=1;continue
        if s.startswith(">"):
            flush_para();story.append(Paragraph(inline_markup(re.sub(r'^>\s?','',s)),styles["DocQuote"]));i+=1;continue
        if s.startswith("<") and s.endswith(">"):
            flush_para();story.append(Paragraph(inline_markup(re.sub(r'<[^>]+>',' ',s)),styles["DocSmall"]));i+=1;continue
        para.append(line);i+=1
    flush_para()
    if in_code:flush_code()
    return story

def draw_page(canvas,doc):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor("#d8dee8"));canvas.line(19*mm,15*mm,PAGE_W-19*mm,15*mm)
    canvas.setFont("Helvetica",7);canvas.setFillColor(colors.HexColor("#657386"))
    canvas.drawString(19*mm,10*mm,"Hussein Mboya Tours | Repository documentation")
    canvas.drawRightString(PAGE_W-19*mm,10*mm,f"Page {doc.page}");canvas.restoreState()

def render_pdf(path,title,subtitle,files):
    doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=19*mm,leftMargin=19*mm,topMargin=17*mm,bottomMargin=21*mm,title=title,author="Hussein Mboya Tours Documentation Export")
    story=[Spacer(1,35*mm),Paragraph(escape(title),styles["DocTitle"]),Paragraph(escape(subtitle),styles["DocSubtitle"]),Spacer(1,8*mm),Paragraph(f"{len(files)} Markdown documents | Source branch: main",styles["DocSubtitle"]),PageBreak()]
    for index,file in enumerate(files):
        content=file.read_text(encoding="utf-8",errors="replace");rel=file.relative_to(ROOT).as_posix()
        story.append(Paragraph(escape(rel),styles["DocH2"]));story.append(Paragraph("Source: "+escape(rel),styles["DocSmall"]))
        story.extend(parse_markdown(content))
        if index!=len(files)-1:story.append(PageBreak())
    doc.build(story,onFirstPage=draw_page,onLaterPages=draw_page)

all_md=sorted([p for p in ROOT.rglob("*.md") if not any(x in {".git","node_modules","dist","coverage"} for x in p.parts)],key=lambda p:p.relative_to(ROOT).as_posix().lower())
docs=ROOT/"docs"
def inside(p,name):return p.is_relative_to(docs/name)
endpoint=[p for p in all_md if inside(p,"API_ENDPOINT_GUIDE")]
domain=[p for p in all_md if inside(p,"API_DOMAIN_CONTRACTS")]
code=[p for p in all_md if inside(p,"code-explanations")]
interview=[p for p in all_md if inside(p,"interview")]
excluded=set(endpoint+domain+code+interview)
general=[p for p in all_md if p not in excluded and (p.is_relative_to(docs) or p.parent==ROOT or p.name.lower()=="readme.md")]
assigned=set(general+endpoint+domain+code+interview)
other=[p for p in all_md if p not in assigned]
if other:general.extend(other)
groups=[
("01_PROJECT_AND_OPERATIONS","Project overview, architecture, setup, deployment, operations and general guides",general),
("02_API_ENDPOINT_GUIDES","API endpoint-by-endpoint reference",endpoint),
("03_API_DOMAIN_CONTRACTS","Source-traced API domain contracts",domain),
("04_SOURCE_CODE_EXPLANATIONS","Generated source-code walkthroughs and explanations",code),
("05_INTERVIEW_AND_PRESENTATION","Project deep dives, walkthroughs and interview preparation",interview),
("06_OTHER_REPOSITORY_READMES","Additional README and repository guidance files",other)]
groups=[g for g in groups if g[2]]
section_pdfs=[];manifest={"repository":"isaacokubi/hussein-mboya-tours","branch":"main","markdown_file_count":len(all_md),"sections":[]}
for name,desc,files in groups:
    path=OUT/(name+".pdf");render_pdf(path,name.replace("_"," ").title(),desc,files);section_pdfs.append(path)
    manifest["sections"].append({"file":path.name,"documents":len(files),"source_files":[p.relative_to(ROOT).as_posix() for p in files]})
master=OUT/"00_COMPLETE_DOCUMENTATION.pdf"
render_pdf(master,"Hussein Mboya Tours — Complete Documentation","Complete repository Markdown documentation, organized by source path",all_md)
manifest["master_pdf"]=master.name;manifest["pdf_count"]=len(section_pdfs)+1
(OUT/"MANIFEST.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")
(OUT/"README.txt").write_text("HUSSEIN MBOYA TOURS — DOCUMENTATION PDF BUNDLE\n\nSource: https://github.com/isaacokubi/hussein-mboya-tours/tree/main\nMarkdown documents included: "+str(len(all_md))+"\nIncludes one complete combined PDF and section PDFs for project/operations, API endpoint guides, API domain contracts, source-code explanations, interview/presentation material, and additional repository guides.\nGenerated from Markdown files in the main branch. Code examples and source references are preserved as text.\n",encoding="utf-8")
archive=ROOT/"dist"/"hussein-mboya-tours-documentation-pdfs.zip"
with zipfile.ZipFile(archive,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
    for f in sorted(OUT.iterdir()):
        if f.is_file():z.write(f,arcname=f.name)
print(json.dumps({"source_markdown_files":len(all_md),"pdfs":[{"name":p.name,"bytes":p.stat().st_size} for p in [master]+section_pdfs],"zip":str(archive),"zip_bytes":archive.stat().st_size},indent=2))
