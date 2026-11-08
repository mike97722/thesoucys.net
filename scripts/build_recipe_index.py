#!/usr/bin/env python3
"""Regenerate recipe cards from Schema.org JSON-LD in recipe HTML pages."""
from pathlib import Path
from html import escape
import json, re, sys
ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "recipes" / "index.html"
START = "<!-- RECIPE_CARDS_START -->"
END = "<!-- RECIPE_CARDS_END -->"

def minutes(duration):
    m = re.fullmatch(r"P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?", str(duration or ""))
    return (int(m.group(1) or 0) * 60 + int(m.group(2) or 0)) if m else None

def recipe_from(path):
    source = path.read_text(encoding="utf-8")
    scripts = re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',source,re.I|re.S)
    for block in scripts:
        try: obj=json.loads(block)
        except json.JSONDecodeError: continue
        entries=obj if isinstance(obj,list) else obj.get('@graph',[obj]) if isinstance(obj,dict) else []
        for item in entries:
            if not isinstance(item,dict): continue
            kinds=item.get('@type',[]); kinds=[kinds] if isinstance(kinds,str) else kinds
            if 'Recipe' in kinds: return item
    raise ValueError(f"Missing valid Schema.org Recipe JSON-LD in {path}")

def main():
    cards=[]
    for path in sorted((ROOT/'recipes').glob('*/index.html')):
        r=recipe_from(path)
        title=str(r['name']); desc=str(r.get('description',''))
        category=r.get('recipeCategory','Recipe'); category=', '.join(category) if isinstance(category,list) else str(category)
        duration=minutes(r.get('totalTime'))
        duration_text=f' · {duration} minutes' if duration is not None else ''
        keywords=r.get('keywords',[])
        if isinstance(keywords,list): keywords=' '.join(map(str,keywords))
        ingredients=' '.join(map(str,r.get('recipeIngredient',[])))
        search=' '.join((title,desc,category,str(keywords),ingredients)).lower()
        slug=path.parent.name
        cards.append(f'<a class="card" data-search="{escape(search,quote=True)}" href="/recipes/{escape(slug,quote=True)}/"><div class="card-art recipe" aria-hidden="true">✦</div><div class="card-body"><span class="pill">{escape(category+duration_text)}</span><h3>{escape(title)}</h3><p>{escape(desc)}</p><span class="arrow">View recipe →</span></div></a>')
    page=INDEX.read_text(encoding='utf-8')
    if START not in page or END not in page: sys.exit('Missing recipe card markers in recipes/index.html')
    page=re.sub(re.escape(START)+r'.*?'+re.escape(END),START+'\n'+'\n'.join(cards)+'\n'+END,page,flags=re.S)
    INDEX.write_text(page,encoding='utf-8')
    print(f'Generated {len(cards)} recipe cards')
if __name__=='__main__': main()
