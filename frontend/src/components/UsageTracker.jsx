import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../api'

const recorded=new Set()
const pages=new Set(['explore','monuments','words','tools','polls','saved','sources','timeline','map',
  'scripts','stats','concordance','compare','bibliography','glossary','recommended-words',
  'frequent-words','submit','about','corpus','morphology'])

export default function UsageTracker() {
  const location=useLocation()
  const {user}=useApp()
  useEffect(()=>{
    if(user?.is_staff)return undefined
    const route=location.pathname.split('/').filter(Boolean)[0]
    const page=!route?'home':route==='login'
      ? new URLSearchParams(location.search).get('mode')==='register'?'register':'login'
      : pages.has(route)&&user?route:null
    if(!page)return undefined
    const key=`${location.key}:${page}:${user?.username||'guest'}`
    const send=()=>{
      if(recorded.has(key))return
      recorded.add(key)
      if(recorded.size>128)recorded.delete(recorded.values().next().value)
      api.post('/analytics/event/',{page,event_id:crypto.randomUUID()}).catch(()=>{
        // Analytics must never interrupt navigation, login or reading.
        recorded.delete(key)
      })
    }
    if('requestIdleCallback' in window){
      const idle=requestIdleCallback(send,{timeout:1000})
      return()=>cancelIdleCallback(idle)
    }
    const timer=setTimeout(send,100)
    return()=>clearTimeout(timer)
  },[location.key,location.pathname,location.search,user])
  return null
}
