import { useEffect, useRef } from 'react'
import kultegin from '../assets/stones/kultegin-sculpture.webp'
import bilge from '../assets/stones/bilge-sculpture.webp'

const smooth=(start,end,value)=>{const p=Math.max(0,Math.min(1,(value-start)/(end-start)));return p*p*(3-2*p)}

/** Lighting is baked once into transparent WebP assets, not recalculated on scroll. */
export default function StoneSculpture({ motion, paused, nativeScroll }) {
  const root=useRef(null),rig=useRef(null),newFace=useRef(null),newBack=useRef(null),companion=useRef(null)
  useEffect(()=>{
    if(nativeScroll)return undefined
    const node=root.current,state=motion.current
    let frame=0,visible=true,disposed=false,mobile=node.clientWidth<800
    const draw=()=>{
      frame=0
      if(disposed||!visible||document.hidden)return
      const p=state.progress,x=state.x||0,y=state.y||0
      const close=smooth(.18,.40,p)*(1-smooth(.56,.72,p)),end=smooth(.64,.86,p),blend=smooth(.64,.74,p)
      const rotation=-12+p*43+smooth(.58,.80,p)*360+x*5
      rig.current.style.transform=`translate3d(${(close*(mobile?-2:-29)+end*(mobile?0:7)).toFixed(2)}vw,${(-close*4).toFixed(2)}vh,0) rotateX(${(-2+y*3).toFixed(2)}deg) rotateY(${rotation.toFixed(2)}deg) rotateZ(${(-2+Math.sin(p*6)*2).toFixed(2)}deg) scale(${(1+close*(mobile?.14:.28)).toFixed(3)})`
      newFace.current.style.opacity=String(blend)
      newBack.current.style.opacity=String(blend)
      companion.current.style.opacity=String(mobile?0:end)
      companion.current.style.transform=`translate3d(${(-end*12).toFixed(2)}%,0,0) rotateY(-18deg) rotateZ(4deg) scale(${(.7+end*.3).toFixed(3)})`
      node.dataset.camera=`${p.toFixed(3)}:${rotation.toFixed(2)}:${close.toFixed(2)}`
    }
    const schedule=()=>{if(!disposed&&!paused&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw)}
    state.invalidate=schedule
    const resize=new ResizeObserver(()=>{mobile=node.clientWidth<800;schedule()});resize.observe(node)
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0}});observer.observe(node)
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()}
    document.addEventListener('visibilitychange',visibility);schedule()
    return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);if(state.invalidate===schedule)delete state.invalidate}
  },[motion,paused,nativeScroll])
  return <div className="cinema-sculpture cinema-sculpture-compositor" ref={root} data-renderer="compositor" role="img" aria-label="Haqiqiy surat asosidagi yoritilgan badiiy bitiktosh">
    <div className="cinema-stone-rig" ref={rig} aria-hidden="true">
      <img className="cinema-stone-depth depth-one" src={kultegin} alt="" width="640" height="1120"/>
      <img className="cinema-stone-depth depth-two" src={kultegin} alt="" width="640" height="1120"/>
      <div className="cinema-stone-face cinema-stone-front"><img src={kultegin} alt="" width="640" height="1120" fetchPriority="high"/><img ref={newFace} src={bilge} alt="" width="640" height="1120"/></div>
      <div className="cinema-stone-face cinema-stone-back"><img src={kultegin} alt="" width="640" height="1120"/><img ref={newBack} src={bilge} alt="" width="640" height="1120"/></div>
    </div>
    <img className="cinema-stone-companion" ref={companion} src={kultegin} alt="" width="640" height="1120" aria-hidden="true"/>
  </div>
}
