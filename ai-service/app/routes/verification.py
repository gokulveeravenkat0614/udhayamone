import tempfile, os
from ..services.ocr_service import extract_document_text
from ..services.face_service import compare_faces

async def verify_images(document, selfie, document2=None, expected_name=None, expected_dob=None):
    paths=[]
    try:
        for f in [document, selfie, document2]:
            if not f: continue
            suffix=os.path.splitext(f.filename or '')[1] or '.jpg'
            tmp=tempfile.NamedTemporaryFile(delete=False,suffix=suffix)
            tmp.write(await f.read()); tmp.close(); paths.append(tmp.name)
        doc_path, selfie_path = paths[0], paths[1]
        ocr=extract_document_text(doc_path, expected_name, expected_dob)
        face=compare_faces(doc_path, selfie_path)
        document_match = bool(ocr.get('document_detected'))
        data_match = bool(ocr.get('data_match'))
        face_match = bool(face.get('verified'))
        confidence = round((0.50 * float(face.get('score',0)) + 0.30 * float(data_match) + 0.20 * float(document_match)), 3)
        status='verified' if document_match and data_match and face_match else 'failed'
        return {'success':True,'documentMatch':document_match,'dataMatch':data_match,'faceMatch':face_match,'confidenceScore':confidence,'status':status,'failureReason':None if status=='verified' else 'One or more verification checks failed','details':{'ocr':ocr,'face':face}}
    finally:
        for p in paths:
            try: os.unlink(p)
            except OSError: pass
