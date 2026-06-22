import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import AuditOverview from '../components/audit/AuditOverview';
import AuditCrawlability from '../components/audit/AuditCrawlability';
import AuditIssues from '../components/audit/AuditIssues';
import AuditPages from '../components/audit/AuditPages';
import AuditPerformance from '../components/audit/AuditPerformance';

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'crawlability', label: 'Explorabilité' },
  { id: 'issues', label: 'Problèmes' },
  { id: 'pages', label: 'Pages explorées' },
  { id: 'performance', label: 'Performances' },
];

const F = 'Inter, system-ui, sans-serif';

export default function AuditPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDECE9', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #E5E4E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={14} color="#555" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardCheck size={16} color="#0EA5E9" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0F10' }}>Audit de site</span>
          <span style={{ fontSize: 12, color: '#aaa' }}>wok-co.base44.app</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', background: '#F5F4F1', borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F,
                fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#0F0F10' : '#888',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 150ms', whiteSpace: 'nowrap',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'overview' && <AuditOverview onNavigate={setActiveTab} />}
        {activeTab === 'crawlability' && <AuditCrawlability />}
        {activeTab === 'issues' && <AuditIssues />}
        {activeTab === 'pages' && <AuditPages />}
        {activeTab === 'performance' && <AuditPerformance />}
      </div>
    </div>
  );
}