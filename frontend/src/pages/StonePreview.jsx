import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { useApp } from '../context/AppContext'
import CaveJourney from '../components/CaveJourney'
import CaveAudio from '../components/CaveAudio'
import InscriptionReveal from '../components/InscriptionReveal'
import kultegin from '../assets/stones/kultegin.jpg'
import bilge from '../assets/stones/bilge-khagan.jpg'
import detail from '../assets/stones/kultegin-detail.jpg'
import './stone-preview.css'

const clamp=value=>Math.max(0,Math.min(1,value))
const smooth=(start,end,value)=>{const p=clamp((value-start)/(end-start));return p*p*(3-2*p)}
const sources=[
  ['Kultegin','Betta27','https://commons.wikimedia.org/wiki/File:Kultegin_monument_Mongolia.JPG'],
  ['Kultegin · detal','Betta27 / Hunnjazal','https://commons.wikimedia.org/wiki/File:Kultegin_monument_Mongolia_section.jpg'],
  ['Bilga xoqon','Betta27','https://commons.wikimedia.org/wiki/File:Bilge_Khagan_monument_Mongolia.JPG'],
]

export default function StonePreview() {
  const c=useCopy()
  const {user}=useApp()
  const root=useRef(null),stage=useRef(null),bar=useRef(null)
  const motion=useRef({progress:0,x:0,y:0})
  const [active,setActive]=useState(0)
  const [nativeScroll]=useState(()=>CSS.supports('animation-timeline: view()'))
  const [lite,setLite]=useState(()=>navigator.hardwareConcurrency<=4||Boolean(navigator.connection?.saveData))
  const lightweight=useRef(lite)
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
  const scenes=[
    {number:'01',tag:c('SUKUTDAGI OVOZ','ГОЛОС В ТИШИНЕ','A VOICE IN SILENCE'),title:c('Tosh jim.\nTarix gapiradi.','Камень молчит.\nИстория говорит.','Silent stone.\nLiving history.'),text:c('Qadimiy g‘or sukunatiga kiring. Bitiktoshlar orasidan o‘tib, toshga bitilgan xotiraga yaqinlashing.','Одно движение через тысячелетие. Приблизьтесь к памяти, высеченной в камне.','Enter the silence of an ancient cave. Walk among the steles toward memory carved in stone.'),caption:c('Kultegin bitiktoshi','Стела Кюль-тегина','Kül Tigin stele')},
    {number:'02',tag:c('IZLARNI OCHING','ОТКРОЙТЕ СЛЕДЫ','UNCOVER THE TRACES'),title:c('Har bir iz —\nbir hikoya.','Каждый след —\nсвоя история.','Every mark,\na story.'),text:c('Kirish ortda qoladi. Qoya yo‘lagi bo‘ylab g‘orning ichkari zaliga qadam tashlang.','Вход остаётся позади. Пройдите по каменному коридору во внутренний зал пещеры.','Leave the entrance behind. Follow the rocky passage deeper into the cave chamber.'),caption:c('Kultegin · bitik yuzasi','Кюль-тегин · поверхность надписи','Kül Tigin · inscription surface')},
    {number:'03',tag:c('O‘TMISHDAN KELAJAKKA','ИЗ ПРОШЛОГО В БУДУЩЕЕ','FROM PAST TO FUTURE'),title:c('Merosga\nyangi nigoh.','Новый взгляд\nна наследие.','Heritage,\nseen anew.'),text:c('Bilga xoqon va Kultegin. Asrlarni bog‘lagan bitiklar endi sizning kashfiyotingizni kutadi.','Бильге-каган и Кюль-тегин. Надписи, соединяющие века, ждут вашего открытия.','Bilge Qaghan and Kül Tigin. Inscriptions that connect centuries await your discovery.'),caption:c('Bilga xoqon yodgorligi','Памятник Бильге-кагану','Bilge Qaghan monument')},
  ]
  useEffect(()=>{
    document.documentElement.classList.add('stone-cinema-open')
    const preference=matchMedia('(prefers-reduced-motion: reduce)')
    const change=()=>setReduced(preference.matches)
    preference.addEventListener('change',change)
    return()=>{document.documentElement.classList.remove('stone-cinema-open');preference.removeEventListener('change',change)}
  },[])
  useEffect(()=>{
    if(reduced)return undefined
    let frame=0,previousProgress=-1,previousScene=-1,dirty=true,previousFrame=0,samples=0,slowFrames=0,degradeTimer=0,pendingLite=false
    const geometry={start:0,range:1},nav=document.querySelector('.navbar-blur')
    const scene=stage.current
    const title=scene.querySelector('.cinema-monument-title'),aurora=scene.querySelector('.cinema-aurora'),orbits=scene.querySelector('.cinema-orbital-field')
    const fragments=[...scene.querySelectorAll('.cinema-fragments i')]
    const scan=scene.querySelector('.cinema-scan-line')
    const update=(time=performance.now())=>{
      frame=0
      if(!root.current||!stage.current)return
      if(dirty){
        const header=nav?.offsetHeight||0
        root.current.style.setProperty('--stone-nav',`${header}px`)
        geometry.start=root.current.getBoundingClientRect().top+scrollY-header
        geometry.range=Math.max(1,root.current.offsetHeight-stage.current.offsetHeight);dirty=false
      }
      const target=clamp((scrollY-geometry.start)/geometry.range)
      if(Math.abs(target-previousProgress)<.00001)return
      if(previousFrame&&time-previousFrame<180&&!lightweight.current){
        samples++
        if(time-previousFrame>30)slowFrames++
        if(samples>=18){
          if(slowFrames>=4)pendingLite=true
          samples=0;slowFrames=0
        }
      }
      previousFrame=time
      // Change secondary detail only after scrolling rests, never mid-gesture.
      if(pendingLite&&!lightweight.current){
        clearTimeout(degradeTimer)
        degradeTimer=setTimeout(()=>{lightweight.current=true;setLite(true)},200)
      }
      previousProgress=target
      motion.current.progress=target
      const p=target,close=smooth(.18,.40,p)*(1-smooth(.56,.72,p))
      if(!nativeScroll){
        // Fallback only: modern browsers animate these on the scroll timeline.
        title.style.transform=`translate3d(0,${(-p*160).toFixed(2)}px,0) scale(${(1+p*.25).toFixed(3)})`
        title.style.opacity=String(p>=.70?.10:1-close*.85)
        aurora.style.transform=`translate3d(0,${(-p*70).toFixed(2)}px,0)`
        orbits.style.transform=`translate3d(0,${(-close*60).toFixed(2)}px,0)`
        scan.style.transform=`translate3d(0,${((p-.3)*200).toFixed(2)}px,0)`
        fragments.forEach((node,i)=>{node.style.transform=`translate3d(${(close*(i-3)*42).toFixed(2)}px,${(-close*60).toFixed(2)}px,0) rotate(${(i*36+p*140).toFixed(2)}deg)`})
        bar.current.style.transform=`scaleX(${p})`
        motion.current.invalidate?.()
      }
      const index=p<.30?0:p<.70?1:2
      if(index!==previousScene){previousScene=index;setActive(index)}
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)}
    const measure=()=>{dirty=true;schedule()}
    const pointer=event=>{if(event.pointerType!=='touch'){motion.current.x=(event.clientX/innerWidth-.5)*2;motion.current.y=(event.clientY/innerHeight-.5)*2;motion.current.invalidate?.()}}
    const reset=()=>{motion.current.x=0;motion.current.y=0;motion.current.invalidate?.()}
    const observer=new ResizeObserver(measure);observer.observe(root.current);observer.observe(stage.current)
    if(nav)observer.observe(nav)
    if(!nativeScroll){scene.addEventListener('pointermove',pointer);scene.addEventListener('pointerleave',reset)}
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);schedule()
    return()=>{cancelAnimationFrame(frame);clearTimeout(degradeTimer);observer.disconnect();scene.removeEventListener('pointermove',pointer);scene.removeEventListener('pointerleave',reset);removeEventListener('scroll',schedule);removeEventListener('resize',measure)}
  },[reduced,nativeScroll])
  const goTo=index=>{
    if(reduced){document.getElementById(`stone-scene-${index}`)?.scrollIntoView({behavior:'instant',block:'center'});return}
    const header=document.querySelector('.navbar-blur')?.offsetHeight||0,top=root.current.getBoundingClientRect().top+scrollY-header
    scrollTo({top:top+(root.current.offsetHeight-stage.current.offsetHeight)*[0,.43,.86][index],behavior:'smooth'})
  }
  const finishJourney=()=>scrollTo({top:document.documentElement.scrollHeight,behavior:reduced?'instant':'smooth'})
  const revealInscription=()=>document.getElementById('inscription-view')?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})
  return <div className={`stone-preview${reduced?' stone-preview-reduced':''}${nativeScroll&&!reduced?' stone-native-scroll':''}${lite?' stone-performance-lite':''}`}>
    <section className="stone-scroll" ref={root} aria-label={c('Bitiktosh bilan sayohat','Путешествие к стеле','A journey to the stone')}>
      <div className="stone-stage" ref={stage} data-scene={active}>
        <div className="cinema-aurora" aria-hidden="true"/><div className="cinema-beam cinema-beam-one" aria-hidden="true"/><div className="cinema-beam cinema-beam-two" aria-hidden="true"/>
        <div className="cinema-dust" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{'--dust-x':`${(i*37+11)%100}%`,'--dust-y':`${(i*23+17)%100}%`,'--dust-time':`${7+i%6}s`,'--dust-delay':`${-i*.7}s`}}/>)}</div>
        <div className="stone-exhibit-heading"><Link to="/">↖ {c('Turkiy Meros','Тюркское наследие','Turkiy Meros')}</Link><span><i/>{c('RAQAMLI EKSPEDITSIYA','ЦИФРОВАЯ ЭКСПЕДИЦИЯ','A DIGITAL EXPEDITION')}</span><div className="cave-controls"><button type="button" className="stone-footer-shortcut" onClick={finishJourney}>{c('Eng pastga','В самый низ','To the bottom')} <span aria-hidden="true">↓</span></button></div></div>
        <div className="cinema-monument-title" aria-hidden="true"><span>{c('TOSH','КАМЕНЬ','STONE')}</span><span>{c('XOTIRASI','ПАМЯТЬ','MEMORY')}</span></div>
        <div className="cinema-orbital-field" aria-hidden="true"><div className="cinema-orbit orbit-a"/><div className="cinema-orbit orbit-b"/><div className="cinema-orbit orbit-c"/><span>VIII</span></div>
        {!reduced&&<CaveJourney motion={motion} nativeScroll={nativeScroll}/>}
        <div className="cinema-pedestal" aria-hidden="true"><i/><span/></div>
        <div className="cinema-fragments" aria-hidden="true">{Array.from({length:7},(_,i)=><i key={i} style={{'--fragment-i':i}}/>)}</div>
        <div className="cinema-coordinate" aria-hidden="true">47°12′ N<br/>102°50′ E <span>ORKHON / MONGOLIA</span></div>
        <div className="cinema-label"><span className="cinema-label-cross">+</span><div><small>{c('ASRLAR OSHA','СКВОЗЬ ВЕКА','ACROSS CENTURIES')}</small><strong>{scenes[active].caption}</strong><span>{c('Haqiqiy surat · badiiy 3D talqin','Подлинное фото · художественная 3D-интерпретация','Original photograph · artistic 3D interpretation')}</span></div></div>
        <div className="cinema-stories stone-story">{scenes.map((scene,index)=><article id={`stone-scene-${index}`} key={scene.number} className={`stone-story-panel${active===index?' is-active':''}`} aria-hidden={!reduced&&active!==index} inert={!reduced&&active!==index?'':undefined}>
          <span className="stone-chapter"><b>{scene.number}</b><i/>{scene.tag}</span>
          {index===0?<h1>{scene.title}</h1>:<h2>{scene.title}</h2>}
          <p>{scene.text}</p>
          {index===2?<button type="button" className="stone-discover-link" onClick={revealInscription}>{c('Bitikni yaqindan ko‘ring','Рассмотреть надпись','See the inscription up close')}<span>↓</span></button>:<button className="stone-discover-link" onClick={()=>goTo(index+1)}>{c('Sayohatni davom ettiring','Продолжить путешествие','Continue the journey')}<span>↘</span></button>}
          {reduced&&<img className="stone-static-image" src={[kultegin,detail,bilge][index]} alt={scene.caption} width="900" height="1200"/>}
        </article>)}</div>
        <div className="cinema-detail-window" aria-hidden="true"><img src={detail} alt="" width="581" height="525"/><div className="cinema-scan-line"/><span>01 / {c('BITIKNING IZI','СЛЕД НАДПИСИ','THE INSCRIPTION')}</span><i/></div>
        <div className="stone-stage-footer"><span className="stone-scroll-cue"><i/>{c('SCROLL BILAN KASHF ETING','ОТКРЫВАЙТЕ ПРОКРУТКОЙ','SCROLL TO UNCOVER')}</span><nav aria-label={c('Sayohat bosqichlari','Этапы путешествия','Journey chapters')}>{scenes.map((scene,index)=><button key={scene.number} aria-current={active===index?'step':undefined} onClick={()=>goTo(index)}><span>{scene.number}</span><i/><small>{[c('Uchrashuv','Встреча','Encounter'),c('Izlar','Следы','Traces'),c('Meros','Наследие','Heritage')][index]}</small></button>)}</nav><span className="stone-scene-counter">{scenes[active].number}<i>/ 03</i></span></div>
        <div className="stone-scroll-progress" aria-hidden="true"><span ref={bar}/></div>
      </div>
    </section>
    <CaveAudio />
    <InscriptionReveal />
    <section className="stone-afterword container"><span className="meros-eyebrow">{c('TOSHDAN MATNGA','ОТ КАМНЯ К ТЕКСТУ','FROM STONE TO TEXT')}</span><h2>{c('Endi tarixni\no‘zingiz o‘qing.','Теперь прочитайте\nисторию сами.','Now read\nthe history yourself.')}</h2><p>{c('G‘or va undagi bitiktoshlar — Teshik-Tosh hamda asl muzey suratlari asosida AI yordamida yaratilgan badiiy sahna. Bitiklarning asl matni va tarjimalarini korpusda o‘rganing.','Пещера и стелы — художественная AI-сцена по мотивам фотографий Тешик-Таш и музейных оригиналов. Подлинные тексты и переводы доступны в корпусе.','The cave and steles are an AI-created artistic scene inspired by Teshik-Tash and original museum photographs. Explore authentic inscriptions and translations in the corpus.')}</p><Link className="stone-discover-link" to={user?'/monuments':'/login?mode=register'}>{user?c('Korpusni ochish','Открыть корпус','Open the corpus'):c('Bepul hisob ochish','Создать бесплатный аккаунт','Create a free account')}<span>↗</span></Link><details className="stone-photo-sources"><summary>{c('Fotosuratlar va manbalar','Фотографии и источники','Photographs and sources')}</summary>{sources.map(([name,author,url])=><p key={url}><a href={url} target="_blank" rel="noreferrer">{name} ↗</a> · {author} · Public domain / Wikimedia Commons</p>)}<p className="cave-reference-credit">{c('G‘or uchun vizual manba: ','Визуальный ориентир для пещеры: ','Cave visual reference: ')}<a href="https://uzbekistan.travel/en/o/surkhandarya-cradle-ancient-civilizations/" target="_blank" rel="noreferrer">Teshik-Tosh · Uzbekistan Travel ↗</a></p></details></section>
  </div>
}
