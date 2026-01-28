try:
    from nltk.tokenize import sent_tokenize
    def first_n_sentences(text, n=2):
        return ' '.join(sent_tokenize(text)[:n]).strip()
except Exception:
    SENTENCE_RE = re.compile(r'(?<=[.!?])\s+')
    def first_n_sentences(text, n=2):
        parts = SENTENCE_RE.split(text.strip())
        return ' '.join(parts[:n]).strip()