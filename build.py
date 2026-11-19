"""Generate static portfolio pages from the project catalogue."""
import json
import math
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT
PROJECTS = json.loads((ROOT / "projects.json").read_text())
STYLE = (ROOT / "style.css").read_text()


def page(title, body, home=""):
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} | Valentin</title><meta name="description" content="Valentin’s independent software engineering and data science portfolio."><style>{STYLE}</style></head>
<body><a class="skip" href="#main">Skip to content</a><header><div class="bar"><a class="brand" href="{home or '#top'}"><i aria-hidden="true">V</i>Valentin<span>.</span></a>
<nav aria-label="Main"><a href="{home}#work">Projects</a><a href="{home}#about">About</a></nav></div></header>
<main id="main">{body}</main><footer><div>Valentin<span>.</span></div><a href="{home or '#top'}">Back to home</a></footer></body></html>'''


def shift_preview():
    data = json.loads((ROOT / "work/warehousedesk/shifts.js").read_text().removeprefix("const shiftReports = ").strip().removesuffix(";"))
    r = data["2026-11-09-early"]
    picks = sum(w["picks"] for w in r["workers"])
    errors = sum(w["errors"] for w in r["workers"])
    activities = ["Receiving", "Picking", "Dispatch"]
    counts = [sum(e["units"] for e in r["events"] if e["task"]==kind) for kind in activities]
    bars = "".join(f'<div class="activity"><div>{label}<b>{count:,}</b></div><progress aria-label="{label} volume" max="{max(counts)}" value="{count}"></progress></div>' for label,count in zip(activities,counts))
    return f'<div class="preview"><div class="previewhead">WarehouseDesk <small>Shift preview</small></div><h2>Early shift</h2><p>9 November · Simulated distribution centre</p><div class="pair"><div><strong>{len(r["workers"])}</strong>Colleagues</div><div><strong>{100*(1-errors/picks):.1f}%</strong>Pick accuracy</div></div>{bars}<a href="work/warehousedesk/dashboard.html">Explore the shift report</a></div>'


def tags(project):
    return '<ul class="tags">' + ''.join(f'<li>{escape(s)}</li>' for s in project["stack"]) + '</ul>'


def build():
    cards = []
    for p in PROJECTS:
        slug = p["slug"]
        directory = OUT / "work" / slug
        directory.mkdir(parents=True, exist_ok=True)
        actions = []
        for key, label in [("demo", "Open interactive demo"), ("source", "Download source")]:
            if name := p.get(key):
                if not (directory / name).is_file():
                    raise FileNotFoundError(directory / name)
                actions.append(f'<a class="button" href="{escape(name)}">{label}</a>')
        name, field, summary, result, measure = (escape(p[k]) for k in ("name","field","summary","result","measure"))
        category = escape(p["category"])
        demo_name = escape(p["demo"])
        cards.append(f'<article class="project" data-category="{category}"><div><p class="meta">{field}</p><h3>{name}</h3><p>{summary}</p>{tags(p)}</div><div class="result"><strong>{result}</strong><p>{measure}</p><div class="cardlinks"><a class="button" href="work/{slug}/{demo_name}" aria-label="Open {name} live demo">Live demo</a><a href="work/{slug}/index.html">Case study</a></div></div></article>')
        sections = ''.join(f'<section class="chapter"><h2>{escape(h)}</h2><p>{escape(t)}</p></section>' for h,t in p["sections"])
        detail = f'<div class="detail"><a href="../../index.html#work">All projects</a><p class="meta">{field} / Case study</p><h1>{name}</h1><p class="lead">{summary}</p>{tags(p)}<div class="actions">{"".join(actions)}</div>{sections}</div>'
        (directory / "index.html").write_text(page(name,detail,"../../index.html"),encoding="utf-8")
    hero = f'<section class="hero" id="top"><div><p class="meta">Valentin / Retail logistics portfolio</p><h1>Hi, I’m Valentin<span>.</span></h1><p class="lead">I’m a data analyst at DHL M&amp;S and a software engineering graduate. I build tools that help retail logistics teams understand a shift, anticipate demand and plan store deliveries. These independent projects use fictional data you can explore yourself.</p><a class="button" href="#work">Explore my projects</a></div>{shift_preview()}</section>'
    about = '<section class="about" id="about"><div><p class="meta">Background</p><h2>About me</h2></div><div><p>My work in logistics shapes the questions I bring to software and data science. In my independent projects, I take a problem from the first dataset through to a working tool that someone else can run and inspect.</p><dl><dt>Experience</dt><dd>Data Analyst · DHL M&amp;S<br><small>Since January 2020</small></dd><dt>Education</dt><dd>BSc (Hons) Computer Science (Software Engineering)<br><small>University of Hertfordshire · 2025</small></dd></dl></div></section>'
    (OUT / "index.html").write_text(page("Software engineering and data science",hero+'<section id="work"><h2>Explore my projects</h2><div id="categories" aria-label="Filter projects"><button aria-pressed="true">All projects</button><button aria-pressed="false">Software engineering</button><button aria-pressed="false">Data science</button></div>'+''.join(cards)+'</section>'+about+'<script src="portfolio.js"></script>'),encoding="utf-8")


if __name__ == "__main__":
    build()
