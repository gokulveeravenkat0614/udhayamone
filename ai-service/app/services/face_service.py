def compare_faces(document_path, selfie_path):
    try:
        from deepface import DeepFace
        result=DeepFace.verify(img1_path=document_path,img2_path=selfie_path,detector_backend='opencv',enforce_detection=False)
        distance=float(result.get('distance',1.0))
        threshold=float(result.get('threshold',0.4))
        verified=bool(result.get('verified', distance <= threshold))
        score=max(0.0,min(1.0,1.0-distance))
        return {'verified':verified,'distance':distance,'threshold':threshold,'score':score}
    except Exception as exc:
        return {'verified':False,'score':0.0,'error':str(exc)}
