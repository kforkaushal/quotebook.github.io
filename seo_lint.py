#!/usr/bin/env python3
"""Static SEO linter for the built site. Usage: python seo_lint.py <site_root> [--csv out.csv]
Stdlib only. Mirrors the checks flagged in the Screaming Frog crawl."""
import sys, re, csv, collections
from pathlib import Path
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.title=""; s.in_title=False; s.meta={}; s.h1=[]; s.h2=0
        s.cur=None; s.canon=""; s.imgs_total=0; s.imgs_nosize=0; s.imgs_noalt=0
        s.words=0; s.skip=0; s.jsonld=0; s.in_ld=False
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=="title": s.in_title=True
        elif t=="meta" and a.get("name"): s.meta[a["name"].lower()]=a.get("content","")
        elif t=="link" and a.get("rel")=="canonical": s.canon=a.get("href","")
        elif t in("h1","h2"):
            s.cur=t
            if t=="h2": s.h2+=1
            else: s.h1.append("")
        elif t=="img":
            s.imgs_total+=1
            if not (a.get("width") and a.get("height")): s.imgs_nosize+=1
            if not a.get("alt"): s.imgs_noalt+=1
        elif t in("script","style","noscript"):
            s.skip+=1; s.in_ld = (t=="script" and a.get("type")=="application/ld+json")
            if s.in_ld: s.jsonld+=1
    def handle_endtag(s,t):
        if t=="title": s.in_title=False
        elif t in("h1","h2"): s.cur=None
        elif t in("script","style","noscript"): s.skip=max(0,s.skip-1); s.in_ld=False
    def handle_data(s,d):
        if s.in_title: s.title+=d
        if s.cur=="h1" and s.h1: s.h1[-1]+=d
        if not s.skip: s.words+=len(d.split())

def main(root, out=None):
    rows=[]; titles=collections.Counter(); h1s=collections.Counter()
    for f in sorted(Path(root).rglob("*.html")):
        p=P(); p.feed(f.read_text(encoding="utf-8",errors="ignore"))
        t=p.title.strip(); d=p.meta.get("description",""); h1=(p.h1[0].strip() if p.h1 else "")
        titles[t]+=1; h1s[h1]+=1
        rows.append(dict(file=str(f.relative_to(root)),title=t,title_len=len(t),desc_len=len(d),
            h1_count=len(p.h1),h1=h1,h1_len=len(h1),h2_count=p.h2,words=p.words,canonical=p.canon,
            noindex="noindex" in p.meta.get("robots","").lower(),jsonld=p.jsonld,
            img_nosize=p.imgs_nosize,img_noalt=p.imgs_noalt))
    for r in rows:
        iss=[]
        if not r["title"]: iss.append("title missing")
        if r["title_len"]>60: iss.append("title>60")
        if 0<r["title_len"]<30: iss.append("title<30")
        if titles[r["title"]]>1: iss.append("title duplicate")
        if r["desc_len"]==0: iss.append("meta desc missing")
        if r["desc_len"]>155: iss.append("meta desc>155")
        if 0<r["desc_len"]<70: iss.append("meta desc<70")
        if r["h1_count"]!=1: iss.append(f"h1 count={r['h1_count']}")
        if r["h1_len"]>70: iss.append("h1>70")
        if h1s[r["h1"]]>1 and r["h1"]: iss.append("h1 duplicate")
        if r["h2_count"]==0: iss.append("h2 missing")
        if r["words"]<200: iss.append("words<200")
        if not r["canonical"]: iss.append("canonical missing")
        if r["img_nosize"]: iss.append("img w/h missing")
        if r["img_noalt"]: iss.append("img alt missing")
        if not r["jsonld"]: iss.append("no json-ld")
        r["issues"]="; ".join(iss)
    c=collections.Counter(i for r in rows for i in r["issues"].split("; ") if i)
    print(f"{len(rows)} pages scanned"); [print(f"{n:5d}  {k}") for k,n in c.most_common()]
    print(f"{sum(r['noindex'] for r in rows):5d}  noindex pages")
    if out:
        with open(out,"w",newline="",encoding="utf-8") as fh:
            w=csv.DictWriter(fh,fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
if __name__=="__main__":
    a=sys.argv; main(a[1], a[a.index("--csv")+1] if "--csv" in a else None)
