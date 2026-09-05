import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function CameraCapture({ mode='document', title, onCapture }) {
  const videoRef=useRef(null); const canvasRef=useRef(null); const [error,setError]=useState(''); const [ready,setReady]=useState(false); const [preview,setPreview]=useState(null);
  useEffect(()=>{ let stream;
    (async()=>{ try { stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:mode==='selfie'?'user':'environment'},audio:false}); videoRef.current.srcObject=stream; setReady(true); } catch(e){ setError('Camera access was blocked. Allow camera permission or use the upload fallback.'); }})();
    return()=>stream?.getTracks().forEach(t=>t.stop());
  },[mode]);
  const capture=()=>{ const v=videoRef.current,c=canvasRef.current; if(!v?.videoWidth)return; c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0,c.width,c.height); c.toBlob(blob=>{setPreview(URL.createObjectURL(blob));onCapture(blob);},'image/jpeg',0.9); };
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center justify-between mb-3"><div className="font-bold text-slate-800 text-sm">{title}</div>{ready&&<span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> CAMERA READY</span>}</div>
    {error ? <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0"/><span>{error}</span></div> : <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-video"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>{mode==='selfie'&&<div className="absolute inset-8 rounded-full border-2 border-white/70 pointer-events-none"/>}</div>}
    <canvas ref={canvasRef} className="hidden"/>
    {preview && <div className="mt-3 text-xs text-emerald-700 font-semibold">Photo captured successfully.</div>}
    <button disabled={!ready} onClick={capture} className="mt-3 w-full py-2.5 rounded-xl bg-brand-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-2"><Camera className="w-4 h-4"/> Capture Photo</button>
  </div>;
}
