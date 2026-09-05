import re
import cv2
import pytesseract

def _norm(value):
    return re.sub(r'[^a-z0-9]','',value.lower()) if value else ''

def extract_document_text(path, expected_name=None, expected_dob=None):
    image=cv2.imread(path)
    if image is None: return {'document_detected':False,'text':'','fields':{},'data_match':False}
    gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
    gray=cv2.resize(gray,None,fx=1.5,fy=1.5)
    text=pytesseract.image_to_string(gray).strip()
    name=None
    m=re.search(r'(?:name)\s*[:\-]?\s*([A-Za-z .]{3,})',text,re.I)
    if m: name=m.group(1).strip()
    name_match = bool(expected_name and (_norm(expected_name) in _norm(text) or _norm(name) == _norm(expected_name)))
    dob_match = bool(expected_dob and _norm(expected_dob) in _norm(text)) if expected_dob else False
    # Prototype fallback: if no DOB is configured, name match is sufficient for the data signal.
    data_match = name_match and (dob_match if expected_dob else True)
    return {'document_detected':len(text)>15,'text':text[:4000],'fields':{'name':name},'name_match':name_match,'dob_match':dob_match,'data_match':data_match}
