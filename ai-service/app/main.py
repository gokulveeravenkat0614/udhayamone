from fastapi import FastAPI, UploadFile, File, Form
from .routes.verification import verify_images

app = FastAPI(title='UdyamOne AI Verification Service', version='1.0.0')

@app.get('/health')
def health():
    return {'success': True, 'service': 'udyamone-ai'}

@app.post('/verify')
async def verify(
    document: UploadFile = File(...),
    selfie: UploadFile = File(...),
    document2: UploadFile | None = File(None),
    expected_name: str | None = Form(None),
    expected_dob: str | None = Form(None),
):
    return await verify_images(document, selfie, document2, expected_name, expected_dob)
