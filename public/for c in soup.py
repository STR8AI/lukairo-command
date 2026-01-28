for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
    c.extract()