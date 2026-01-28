from bs4 import BeautifulSoup
import re
from itertools import islice

soup = BeautifulSoup(open('test.html'), 'html.parser')

for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
    c.extract()

def next_para(node):
    sib = node.find_next_sibling()
    while sib and sib.name not in ('p', 'div'):
        sib = sib.find_next_sibling()
    if sib and sib.name == 'div':
        para = sib.find('p')
        if para:
            return para
    return sib

try:
    from nltk.tokenize import sent_tokenize
    def first_n_sentences(text, n=2):
        return ' '.join(sent_tokenize(text)[:n]).strip()
except Exception:
    SENTENCE_RE = re.compile(r'(?<=[.!?])\s+')
    def first_n_sentences(text, n=2):
        parts = SENTENCE_RE.split(text.strip())
        return ' '.join(parts[:n]).strip()

if not output:
    paras = [p for p in soup.find_all('p') if p.get_text(strip=True)]
    for p in paras[:5]:
        print(p.get_text())