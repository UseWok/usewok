import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, ArrowRight, Link2, BarChart2, ClipboardCheck, TrendingUp, Mic, Zap, Loader, AlertCircle, ChevronDown, TrendingUp as TrendIcon } from 'lucide-react';
import { setActiveDomain } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import ScanResultsOnboarding from '@/components/home/ScanResultsOnboarding';
import { getWokFeatures, getWokPlanId } from '@/lib/wok-plans';

// ── Tokens fidèles image ──────────────────────────────────────────────────────
const F = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const BG        = '#F2EFE9';   // fond crème (exact image)
const CARD_BG   = '#4A4540';   // carte score — brun-gris chaud
const WHITE     = '#FFFFFF';
const INK       = '#1C1917';   // titres noir chaud
const INK2      = '#57534E';   // texte secondaire
const INK3      = '#A8A29E';   // texte tertiaire
const BORDER    = '#E7E3DB';   // bordure crème
const CORAL     = '#F25C38';   // orange/corail
const MAX_DOMAINS = 10;

const getDomainLabel = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];
const getFirstName   = (n)   => (n || '').split(' ')[0] || 'vous';

// Avatar couleurs déterministes
const AVT_COLORS = ['#78716C','#F25C38','#3B82F6','#10B981','#8B5CF6','#F59E0B','#0EA5E9'];
const getAvatarColor = (s) => { let h=0; for(let i=0;i<(s||'').length;i++) h=s.charCodeAt(i)+((h<<5)-h); return AVT_COLORS[Math.abs(h)%AVT_COLORS.length]; };
const getInitials = (n) => { const p=(n||'').split(/[\s\-\.]+/); return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():(n||'??').slice(0,2).toUpperCase(); };

// ── ScoreRing list (fond crème) ───────────────────────────────────────────────
function ScoreRingLight({ score, size=42 }) {
  const R = size/2-4, circ=2*Math.PI*R;
  const c = score>=65?'#10B981':score>=30?CORAL:'#EF4444';
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#E7E3DB" strokeWidth={3}/>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={c} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round"
          style={{transition:'stroke-dashoffset 1s ease'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:10,fontWeight:800,color:INK,letterSpacing:'-0.02em'}}>{Math.round(score)}</span>
      </div>
    </div>
  );
}

// ── Scan loader ───────────────────────────────────────────────────────────────
function ScanLoader({ url }) {
  const [step,setStep]=useState(0);
  const steps=['Récupération du site…','Simulation IA en cours…','Calcul du LRS…','Génération du rapport…'];
  const domain=getDomainLabel(url);
  useEffect(()=>{const iv=setInterval(()=>setStep(s=>Math.min(s+1,steps.length-1)),8000);return()=>clearInterval(iv);},[]);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{position:'fixed',inset:0,zIndex:9999,background:CARD_BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,fontFamily:F}}>
      <div style={{width:'100%',maxWidth:340,textAlign:'center'}}>
        <div style={{width:44,height:44,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.1)`,borderTopColor:CORAL,animation:'spin .9s linear infinite',margin:'0 auto 20px'}}/>
        <div style={{fontSize:19,fontWeight:800,color:WHITE,marginBottom:6,letterSpacing:'-0.03em'}}>Analyse de <span style={{color:CORAL}}>{domain}</span></div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:24}}>8 moteurs IA · ~60 secondes</div>
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'14px 16px',textAlign:'left'}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',opacity:i<=step?1:0.2,transition:'opacity .5s'}}>
              <div style={{width:14,height:14,borderRadius:'50%',flexShrink:0,background:i<step?CORAL:'transparent',border:`2px solid ${i<=step?CORAL:'rgba(255,255,255,0.12)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {i<step&&<svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {i===step&&<div style={{width:4,height:4,borderRadius:'50%',background:CORAL,animation:'spulse 1s ease-in-out infinite'}}/>}
              </div>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.5)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

// ── ScanHero (0 profils) ──────────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url,setUrl]=useState('');
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 20px',fontFamily:F,background:BG}}>
      <h1 style={{fontSize:26,fontWeight:800,color:INK,margin:'0 0 6px',letterSpacing:'-0.03em',textAlign:'center'}}>Êtes-vous recommandé<br/>par les IA ?</h1>
      <p style={{fontSize:13,color:INK3,margin:'0 0 28px',textAlign:'center',maxWidth:280,lineHeight:1.55}}>Votre score LRS en 60 secondes — 8 moteurs IA analysés simultanément.</p>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{background:WHITE,border:`1.5px solid ${BORDER}`,borderRadius:12,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
          <div style={{display:'flex',alignItems:'center',padding:'13px 16px',gap:10}}>
            <Plus size={14} color={INK3} style={{flexShrink:0}}/>
            <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&url.trim()&&onScan(url.trim())} placeholder="Rechercher un domaine, lancer une analyse…" autoFocus
              style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:13,color:INK,fontFamily:F}}/>
          </div>
          <button onClick={()=>url.trim()&&onScan(url.trim())}
            style={{width:'100%',padding:'12px',background:CORAL,color:WHITE,border:'none',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'opacity 150ms'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Analyser ma visibilité IA <ArrowRight size={13}/>
          </button>
        </div>
        <p style={{fontSize:11,color:INK3,marginTop:8,textAlign:'center'}}>Gratuit · Résultat instantané · Aucune carte requise</p>
      </div>
    </div>
  );
}

// ── Scan logic ────────────────────────────────────────────────────────────────
async function runScan(inputUrl, userId, features) {
  const scanFn = features?.scan_type==='full'?'analyzeWebsite':'analyzeWebsiteLite';
  const res = await base44.functions.invoke(scanFn, { url: inputUrl });
  const mainData = res?.data || {};
  if (features?.scan_type==='full') {
    const [audit,perf] = await Promise.all([
      base44.functions.invoke('analyzeAudit',{url:inputUrl}).catch(()=>({data:{}})),
      base44.functions.invoke('analyzePerformance',{url:inputUrl,business_name:mainData.business_name||''}).catch(()=>({data:{}})),
    ]);
    mainData.audit_data=audit?.data||{}; mainData.perf_data=perf?.data||{};
    mainData.audit_analyzed_at=new Date().toISOString(); mainData.perf_analyzed_at=new Date().toISOString();
  }
  mainData.scan_type=features?.scan_type||'lite';
  const brand_keywords=await uploadProfileData(mainData);
  const profiles=await base44.entities.BusinessProfile.filter({created_by_id:userId}).catch(()=>[]);
  const existing=profiles.find(p=>p.site_url===inputUrl);
  const pf={site_url:inputUrl,identity_name:mainData.business_name||'',identity_industry:mainData.business_type||'',identity_city:mainData.city||'',score_ai_visibility:mainData.ai_visibility_score||0,score_message_clarity:mainData.message_clarity_score||0,score_commercial_signal:mainData.commercial_presence_score||0,score_overall:mainData.overall_score||0,last_scan:new Date().toISOString(),brand_keywords,active:true};
  if(existing) await base44.entities.BusinessProfile.update(existing.id,pf);
  else await base44.entities.BusinessProfile.create({...pf,created_by_id:userId});
  return mainData;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user,setUser]=useState(null);
  const [profiles,setProfiles]=useState([]);
  const [activeUrl,setActiveUrl]=useState(()=>{ try{return JSON.parse(localStorage.getItem('stensor_active_domain')||'null')?.url||null;}catch{return null;}});
  const [showAddModal,setShowAddModal]=useState(false);
  const [onboardingData,setOnboardingData]=useState(null);
  const [planId,setPlanId]=useState('free');
  const [scanningUrls,setScanningUrls]=useState({});
  const [searchQuery,setSearchQuery]=useState('');
  const scanningRef=useRef({});

  const loadAll=async()=>{
    try{
      const u=await base44.auth.me(); if(!u) return;
      setUser(u); setPlanId(getWokPlanId(u));
      const list=await base44.entities.BusinessProfile.filter({created_by_id:u.id}).catch(()=>[]);
      const enriched=await Promise.all(list.map(async p=>{const extra=await getProfileData(p).catch(()=>({}));return{...p,...extra};}));
      setProfiles(enriched);
      if(!activeUrl&&enriched.length>0){const f=enriched[0];setActiveUrl(f.site_url);setActiveDomain({url:f.site_url,name:f.identity_name||getDomainLabel(f.site_url)});}
      return{u,enriched};
    }catch{}
  };

  useEffect(()=>{loadAll();},[]);

  const switchDomain=(p)=>{setActiveUrl(p.site_url);setActiveDomain({url:p.site_url,name:p.identity_name||getDomainLabel(p.site_url)});};

  const startScan=async(cleanUrl)=>{
    if(scanningRef.current[cleanUrl]) return;
    scanningRef.current[cleanUrl]=true;
    setScanningUrls(prev=>({...prev,[cleanUrl]:true}));
    setProfiles(prev=>{if(prev.find(p=>p.site_url===cleanUrl))return prev;return[...prev,{site_url:cleanUrl,identity_name:getDomainLabel(cleanUrl),score_overall:0,_scanning:true}];});
    setActiveUrl(cleanUrl); setActiveDomain({url:cleanUrl,name:getDomainLabel(cleanUrl)});
    try{
      const u=await base44.auth.me(); if(!u) return;
      const result=await runScan(cleanUrl,u.id,getWokFeatures(u));
      await loadAll(); setOnboardingData(result);
    }catch(err){console.error('Scan failed',err);}
    finally{scanningRef.current[cleanUrl]=false;setScanningUrls(prev=>{const n={...prev};delete n[cleanUrl];return n;});}
  };

  const handleSearchScan=()=>{
    if(!searchQuery.trim()) return;
    const url=searchQuery.trim().startsWith('http')?searchQuery.trim():`https://${searchQuery.trim()}`;
    startScan(url); setSearchQuery('');
  };

  const handleDeleteDomain=async(p)=>{
    try{if(p.id)await base44.entities.BusinessProfile.delete(p.id);setProfiles(prev=>prev.filter(x=>x.site_url!==p.site_url));if(activeUrl===p.site_url){const r=profiles.filter(x=>x.site_url!==p.site_url);if(r.length>0)switchDomain(r[0]);else{setActiveUrl(null);setActiveDomain(null);}}}catch{}
  };

  const firstScanUrl=profiles.length===0&&Object.keys(scanningUrls)[0];
  if(firstScanUrl) return <ScanLoader url={firstScanUrl}/>;

  if(!user&&profiles.length===0) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:BG}}>
      <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${BORDER}`,borderTopColor:CORAL,animation:'spin .7s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(profiles.length===0) return (
    <><ScanHero onScan={url=>startScan(url.startsWith('http')?url:`https://${url}`)}/>
    {onboardingData&&<ScanResultsOnboarding data={onboardingData} onClose={()=>{setOnboardingData(null);navigate('/ai-report');}}/>}</>
  );

  const activeProfile=profiles.find(p=>p.site_url===activeUrl)||profiles[0];
  const domainLabel=getDomainLabel(activeProfile?.site_url);
  const lrs=Math.round(activeProfile?.lrs_score||activeProfile?.score_overall||0);
  const lrsColor=lrs>=65?'#10B981':lrs>=30?CORAL:'#EF4444';
  const lrsLabel=lrs>=65?'Bonne visibilité':lrs>=30?'Visibilité partielle':'Faible visibilité';
  const isScanningActive=!!scanningUrls[activeProfile?.site_url];
  const hasData=activeProfile&&(activeProfile.score_overall>0||activeProfile.lrs_score>0);
  const firstName=getFirstName(user?.full_name);

  const engineScores=[{key:'chatgpt',label:'ChatGPT'},{key:'gemini',label:'Gemini'},{key:'claude',label:'Claude'}];

  const ACTIONS=[
    {label:'Rapport IA',desc:'LRS · moteurs',icon:BarChart2,route:'/ai-report'},
    {label:'Audit',desc:'Technique et crawl',icon:ClipboardCheck,route:'/audit'},
    {label:'Performance',desc:'Part de voix',icon:TrendingUp,route:'/performance'},
    {label:'Connexions',desc:'GSC · Analytics',icon:Link2,route:'/connections'},
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{background:BG,fontFamily:F,minHeight:'100vh'}}>
      {/* Centrage mobile-first: max 430px, padding latéral 16px */}
      <div style={{maxWidth:430,margin:'0 auto',padding:'24px 16px 80px'}}>

        {/* ── Salutation ── */}
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:24,fontWeight:800,color:INK,margin:'0 0 3px',letterSpacing:'-0.025em',lineHeight:1.15}}>
            Bonjour {firstName}.
          </h1>
          <p style={{fontSize:13,color:INK3,margin:0,fontWeight:400}}>Que souhaitez-vous analyser aujourd'hui ?</p>
        </div>

        {/* ── Barre recherche/analyse ── */}
        <div style={{display:'flex',alignItems:'center',gap:0,background:WHITE,border:`1.5px solid ${BORDER}`,borderRadius:12,padding:'0 0 0 12px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)',marginBottom:16,overflow:'hidden'}}>
          <Plus size={14} color={INK3} style={{flexShrink:0,marginRight:8}}/>
          <input
            value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSearchScan()}
            placeholder="Rechercher un domaine, lancer une analyse…"
            style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:13,color:INK,fontFamily:F,padding:'12px 0'}}
          />
          {/* Dropdown moteurs */}
          <div style={{display:'flex',alignItems:'center',gap:3,padding:'0 10px',borderLeft:`1px solid ${BORDER}`,height:'100%',cursor:'pointer',alignSelf:'stretch',justifyContent:'center'}}>
            <span style={{fontSize:12,color:INK2,whiteSpace:'nowrap',fontWeight:400}}>Tous les moteurs</span>
            <ChevronDown size={12} color={INK3}/>
          </div>
          {/* Micro */}
          <button style={{width:36,height:'100%',border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',alignSelf:'stretch',padding:'0 6px'}}>
            <Mic size={15} color={INK3}/>
          </button>
          {/* Submit */}
          <button onClick={handleSearchScan}
            style={{width:42,alignSelf:'stretch',border:'none',background:CORAL,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'opacity 150ms',padding:0}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <ArrowUp size={15} color={WHITE}/>
          </button>
        </div>

        {/* ── Score Card ── */}
        <div style={{marginBottom:12}}>
          {isScanningActive?(
            <div style={{background:CARD_BG,borderRadius:16,padding:'22px 18px',display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.1)`,borderTopColor:CORAL,animation:'spin .9s linear infinite',flexShrink:0}}/>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:WHITE,margin:'0 0 3px'}}>Analyse de {domainLabel}…</p>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.35)',margin:0}}>8 moteurs IA · ~60 secondes</p>
              </div>
            </div>
          ):hasData?(
            <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
              onClick={()=>navigate('/ai-report')}
              style={{background:CARD_BG,borderRadius:16,padding:'18px 18px 16px',cursor:'pointer'}}>

              {/* Row 1: label + badge */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontWeight:500,letterSpacing:'0.01em'}}>Score d'autorité</span>
                <div style={{padding:'4px 11px',background:`${lrsColor}28`,border:`1px solid ${lrsColor}55`,borderRadius:20}}>
                  <span style={{fontSize:11,fontWeight:700,color:lrsColor}}>{lrsLabel}</span>
                </div>
              </div>

              {/* Row 2: ring + score chiffre */}
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:14}}>
                {/* Ring grand — brun clair track */}
                <div style={{position:'relative',width:60,height:60,flexShrink:0}}>
                  <svg width="60" height="60" style={{transform:'rotate(-90deg)'}}>
                    <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4.5"/>
                    <circle cx="30" cy="30" r="24" fill="none" stroke={lrsColor} strokeWidth="4.5"
                      strokeDasharray={2*Math.PI*24} strokeDashoffset={2*Math.PI*24*(1-lrs/100)}
                      strokeLinecap="round" style={{transition:'stroke-dashoffset 1.2s ease'}}/>
                  </svg>
                </div>
                <div style={{display:'flex',alignItems:'baseline',gap:3}}>
                  <span style={{fontSize:38,fontWeight:800,color:WHITE,letterSpacing:'-0.04em',lineHeight:1}}>{lrs}</span>
                  <span style={{fontSize:14,color:'rgba(255,255,255,0.35)',fontWeight:500}}>/100</span>
                </div>
              </div>

              {/* Insight */}
              <p style={{fontSize:13,color:'rgba(255,255,255,0.6)',margin:'0 0 16px',lineHeight:1.6,fontWeight:400}}>
                {activeProfile?.shock_insight
                  ?activeProfile.shock_insight.slice(0,130)+(activeProfile.shock_insight.length>130?'…':'')
                  :'Tant que votre site reste sur une adresse de test, vos concurrents récupèrent vos clients potentiels sur Google et les IA.'}
              </p>

              {/* Engine bars */}
              <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:16}}>
                {engineScores.map((e)=>{
                  const s=activeProfile[`${e.key}_score`]||0;
                  return(
                    <div key={e.key} style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontSize:12,color:'rgba(255,255,255,0.55)',width:52,fontWeight:500,flexShrink:0,letterSpacing:'0.005em'}}>{e.label}</span>
                      <div style={{flex:1,height:4,background:'rgba(255,255,255,0.1)',borderRadius:2}}>
                        <div style={{height:'100%',width:`${Math.min(s,100)}%`,background:CORAL,borderRadius:2,transition:'width 1s ease'}}/>
                      </div>
                      <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',width:14,textAlign:'right',fontWeight:600}}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:13,fontWeight:600,color:CORAL}}>Voir le rapport complet</span>
                <ArrowRight size={13} color={CORAL}/>
              </div>
            </motion.div>
          ):(
            <div style={{background:CARD_BG,borderRadius:16,padding:'18px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:11,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <AlertCircle size={17} color={'rgba(255,255,255,0.35)'}/>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:700,color:WHITE,margin:'0 0 2px'}}>Aucune analyse pour ce domaine</p>
                  <p style={{fontSize:11,color:'rgba(255,255,255,0.35)',margin:0}}>Lancez une analyse — 8 moteurs IA en parallèle</p>
                </div>
                <button onClick={()=>startScan(activeProfile.site_url)}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:CORAL,borderRadius:9,fontSize:12,fontWeight:700,color:WHITE,border:'none',cursor:'pointer',fontFamily:F,flexShrink:0}}>
                  <Zap size={11}/> Analyser
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modules 4 colonnes (fidèles image: icone seule en haut, titre bold, sous-titre petit) ── */}
        {!isScanningActive&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
            {ACTIONS.map((a)=>(
              <button key={a.label} onClick={()=>navigate(a.route)}
                style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,padding:'12px 10px',borderRadius:12,cursor:'pointer',background:WHITE,border:`1.5px solid ${BORDER}`,textAlign:'left',fontFamily:F,transition:'box-shadow 150ms',boxShadow:'none'}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.07)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';}}>
                {/* Icône sans fond coloré — juste l'icône gris foncé */}
                <a.icon size={18} color={INK2} strokeWidth={1.6}/>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:INK,lineHeight:1.25,marginBottom:2}}>{a.label}</div>
                  <div style={{fontSize:10,color:INK3,lineHeight:1.3,fontWeight:400}}>{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Liste domaines ── */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:13,color:INK2,fontWeight:500}}>Mes domaines · {profiles.length}/{MAX_DOMAINS}</span>
            {profiles.length<MAX_DOMAINS&&(
              <button onClick={()=>setShowAddModal(true)}
                style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',border:'none',borderRadius:999,background:INK,fontSize:12,fontWeight:700,color:WHITE,cursor:'pointer',fontFamily:F,transition:'opacity 150ms'}}
                onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                <Zap size={11} color={WHITE}/>
                Analyser
              </button>
            )}
          </div>

          <div style={{background:WHITE,border:`1.5px solid ${BORDER}`,borderRadius:14,overflow:'hidden'}}>
            {profiles.map((p,i)=>{
              const score=Math.round(p?.lrs_score||p?.score_overall||0);
              const isActive=(activeUrl||profiles[0]?.site_url)===p.site_url;
              const label=getDomainLabel(p.site_url);
              const name=p.identity_name||label;
              const initials=getInitials(name);
              const avatarColor=getAvatarColor(label);
              const isScanning=!!scanningUrls[p.site_url];
              return(
                <div key={p.site_url||i} onClick={()=>switchDomain(p)}
                  style={{display:'flex',alignItems:'center',gap:11,padding:'12px 14px',cursor:'pointer',background:isActive?'#F5F2EC':WHITE,borderBottom:i<profiles.length-1?`1px solid ${BORDER}`:'none',transition:'background .12s'}}>
                  {/* Avatar rond coloré avec initiales */}
                  <div style={{width:36,height:36,borderRadius:'50%',background:avatarColor,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:800,color:WHITE,letterSpacing:'-0.01em'}}>{initials}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:INK,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
                    <div style={{fontSize:11,color:INK3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:1}}>{label}</div>
                  </div>
                  {isScanning?(
                    <div style={{display:'flex',alignItems:'center',gap:4,padding:'3px 9px',background:`${CORAL}12`,borderRadius:20,flexShrink:0}}>
                      <Loader size={9} color={CORAL} style={{animation:'spin 1s linear infinite'}}/>
                      <span style={{fontSize:9,fontWeight:700,color:CORAL}}>Analyse…</span>
                    </div>
                  ):score>0?(
                    <ScoreRingLight score={score} size={42}/>
                  ):(
                    <span style={{fontSize:10,color:INK3,background:BG,border:`1px solid ${BORDER}`,borderRadius:6,padding:'2px 7px',flexShrink:0}}>—</span>
                  )}
                  <button onClick={e=>{e.stopPropagation();handleDeleteDomain(p);}}
                    style={{width:22,height:22,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:0,transition:'opacity 150ms'}}
                    onMouseEnter={e=>{e.currentTarget.style.opacity='1';}} onMouseLeave={e=>{e.currentTarget.style.opacity='0';}}>
                    <Trash2 size={11} color="#EF4444"/>
                  </button>
                </div>
              );
            })}
            {profiles.length<MAX_DOMAINS&&(
              <div onClick={()=>setShowAddModal(true)}
                style={{display:'flex',alignItems:'center',gap:11,padding:'12px 14px',cursor:'pointer',borderTop:`1px solid ${BORDER}`,transition:'background .12s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#F5F2EC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:36,height:36,borderRadius:'50%',border:`1.5px dashed ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Plus size={13} color={INK3}/>
                </div>
                <span style={{fontSize:13,color:INK3,fontWeight:400}}>Ajouter un domaine à surveiller</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ajout ── */}
      <AnimatePresence>
        {showAddModal&&(
          <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.32)',backdropFilter:'blur(8px)',padding:16}}
            onClick={()=>setShowAddModal(false)}>
            <motion.div initial={{opacity:0,scale:.96,y:8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96}}
              onClick={e=>e.stopPropagation()}
              style={{background:WHITE,borderRadius:20,padding:'26px 22px',width:'100%',maxWidth:360,position:'relative',fontFamily:F,boxShadow:'0 24px 60px rgba(0,0,0,0.16)'}}>
              <button onClick={()=>setShowAddModal(false)} style={{position:'absolute',top:13,right:13,width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:7,border:`1px solid ${BORDER}`,background:BG,cursor:'pointer'}}>
                <X size={11} color={INK3}/>
              </button>
              <h2 style={{fontSize:16,fontWeight:800,color:INK,margin:'0 0 3px',letterSpacing:'-0.025em'}}>Nouveau domaine</h2>
              <p style={{fontSize:12,color:INK3,margin:'0 0 16px'}}>L'IA va analyser ce site et calculer son score LRS.</p>
              <AddDomainForm onSubmit={(url)=>{startScan(url);setShowAddModal(false);}}/>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {onboardingData&&<ScanResultsOnboarding data={onboardingData} onClose={()=>{setOnboardingData(null);navigate('/ai-report');}}/>}
      <style>{`@keyframes spulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.5)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Icône flèche haut (submit) ────────────────────────────────────────────────
function ArrowUp({ size=15, color='#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  );
}

// ── Formulaire ajout domaine ──────────────────────────────────────────────────
function AddDomainForm({ onSubmit }) {
  const [url,setUrl]=useState('');
  const submit=()=>{if(!url.trim())return;const c=url.trim().startsWith('http')?url.trim():`https://${url.trim()}`;onSubmit(c);};
  return(
    <div>
      <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoFocus
        placeholder="https://votre-site.com"
        style={{width:'100%',padding:'10px 12px',fontSize:13,border:`1.5px solid ${BORDER}`,borderRadius:10,outline:'none',boxSizing:'border-box',marginBottom:12,fontFamily:"'Inter',sans-serif",color:'#1C1917',background:'#F2EFE9'}}/>
      <button onClick={submit} disabled={!url.trim()}
        style={{width:'100%',padding:'11px',fontSize:13,fontWeight:700,color:'#fff',background:url.trim()?CORAL:'#ccc',border:'none',borderRadius:10,cursor:url.trim()?'pointer':'not-allowed',fontFamily:"'Inter',sans-serif",display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
        <Zap size={13}/> Lancer l'analyse
      </button>
    </div>
  );
}