def next_para(node):
    sib = node.find_next_sibling()
    while sib and sib.name not in ('p', 'div'):
        sib = sib.find_next_sibling()
    if sib and sib.name == 'div':
        para = sib.find('p')
        if para:
            return para
    return sib