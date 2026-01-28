if not output:
    paras = [p for p in soup.find_all('p') if p.get_text(strip=True)]
    for p in paras[:5]:
        ...