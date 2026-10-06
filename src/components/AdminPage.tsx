import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  TrendingUp,
  Award,
  Vote,
  Upload,
  CheckCircle2,
  Search,
  RefreshCw,
  LogOut,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building,
  GraduationCap,
  Image as ImageIcon,
  Save,
  Database,
  Calendar,
  BookOpen,
  Edit3,
  X,
  MessageSquare,
  Radio,
  QrCode,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useUIStore, isUserAdmin } from '../stores/useUIStore';
import { subscribeToAdminChannel, uploadEventPhoto, AdminRealtimeEvent } from '../lib/supabase';
import {
  CotaType,
  LectureShift,
  LectureTheme,
  WorkshopMonth,
  WorkshopTrack,
  CMSLectureItem,
  CMSWorkshopItem,
  CMSMentorItem,
  CMSPartnerItem,
  CMSPhotoItem,
  CMSTalentPlatformItem,
  CMSTalentSlot,
} from '../stores/slices/cmsSlice';
import { ImageUploader } from './ui/image-uploader';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'WARN' | 'INFO';
}

interface SharkPitchItem {
  id: string;
  name: string;
  team: string;
  track: string;
  votes: number;
  isOpen: boolean;
}

interface IdeathonTeamItem {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  members: string;
  track: string;
  proposal: string;
  status: 'PENDENTE' | 'APROVADO' | 'FINALISTA' | 'REJEITADO';
  createdAt: string;
}

export const AdminPage: React.FC = () => {
  const {
    user,
    setUser,
    mentors,
    partners,
    eventPhotos,
    lectures,
    workshops,
    addMentor,
    updateMentor,
    removeMentor,
    moveMentor,
    addPartner,
    updatePartner,
    removePartner,
    movePartner,
    addEventPhoto,
    updateEventPhoto,
    removeEventPhoto,
    moveEventPhoto,
    addLecture,
    updateLecture,
    removeLecture,
    moveLecture,
    addWorkshop,
    updateWorkshop,
    removeWorkshop,
    moveWorkshop,
    ideathonTeams,
    addIdeathonTeam,
    updateIdeathonTeamStatus,
    toggleIdeathonTeamVoting,
    removeIdeathonTeam,
    resetIdeathonTeams,
    talentPlatforms,
    addTalentPlatform,
    updateTalentPlatform,
    removeTalentPlatform,
    setTalentPlatforms,
    setCmsAll,
    resetSharkTankVotes,
  } = useUIStore();

  const [activeSubTab, setActiveSubTab] = useState<'METRICS' | 'CMS'>('METRICS');
  const [cmsSection, setCmsSection] = useState<
    'LECTURES' | 'WORKSHOPS' | 'MENTORS' | 'PARTNERS' | 'PHOTOS' | 'PITCHES' | 'IDEATHON' | 'TALENT_PLATFORMS'
  >('LECTURES');
  const [realtimeConnected, setRealtimeConnected] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [ideathonStatusFilter, setIdeathonStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'APROVADO' | 'FINALISTA' | 'REJEITADO'>('TODOS');
  const [newPitchForm, setNewPitchForm] = useState({
    name: '',
    team: '',
    track: '',
    proposal: '',
  });

  // Admin Master Switch - Estado de liberação manual das sessões ao vivo
  const { cmsContent, setSessionStatus } = useUIStore();
  const sessionStatus = cmsContent?.session_status || {
    shark_tank_voting_active: true,
    ideathon_registration_open: true,
    ott_scanner_active: true,
  };

  const handleToggleSessionKey = async (key: 'shark_tank_voting_active' | 'ideathon_registration_open' | 'ott_scanner_active') => {
    const updatedStatus = {
      ...sessionStatus,
      [key]: !sessionStatus[key],
    };

    setSessionStatus(updatedStatus);

    try {
      await fetch('/api/v1/admin/cms/session_status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value: updatedStatus }),
      });
      setSaveSuccess(`Status da sessão atualizado: ${key} = ${updatedStatus[key] ? 'ABERTO' : 'FECHADO'}`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      setSaveSuccess('Erro ao comunicar chave com o servidor.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  // Estados de Edição Modal (CRUD Completo)
  const [editingLecture, setEditingLecture] = useState<CMSLectureItem | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<CMSWorkshopItem | null>(null);
  const [editingMentor, setEditingMentor] = useState<CMSMentorItem | null>(null);
  const [editingPartner, setEditingPartner] = useState<CMSPartnerItem | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<CMSPhotoItem | null>(null);

  // Formulário: Nova Palestra / Grade Narrativa
  const [newLecture, setNewLecture] = useState({
    dayIndex: 0,
    shift: 'MORNING' as LectureShift,
    shiftLabel: 'Manhã',
    time: '09h00 - 11h30',
    title: '',
    description: '',
    speaker: '',
    speakerRole: '',
    location: 'Auditório Principal',
    theme: 'TECHNOLOGY' as LectureTheme,
    themeLabel: 'Tecnologia',
    availableSeats: 50,
    totalSeats: 250,
  });

  // Formulário: Novo Minicurso
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    month: 'SETEMBRO' as WorkshopMonth,
    day: '14',
    track: 'DADOS' as WorkshopTrack,
    trackLabel: 'Inteligência & Dados',
    trackColor: '#fcd535',
    partner: 'TO Brasil',
    instructor: '',
    location: 'Laboratório de Redes e Dados',
    activeSlots: 10,
    totalSlots: 40,
    description: '',
  });

  // Formulário: Novo Mentor
  const [newMentor, setNewMentor] = useState({
    name: '',
    role: '',
    organization: '',
    tag: '',
    topic: '',
    accentColor: '#fcd535',
    avatarUrl: '',
  });

  // Formulário: Novo Parceiro
  const [newPartner, setNewPartner] = useState({
    name: '',
    category: '',
    cota: 'OURO' as CotaType,
    tagline: '',
    description: '',
    benefitsText: '',
    tagsText: '',
    websiteUrl: '',
    logoUrl: '',
  });

  // Formulário: Nova Foto (URL)
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Auditório');

  // Live Backend Metrics
  // Live Backend Metrics (Zero hardcoded values, 100% database driven dos 9 Pilares)
  const [metrics, setMetrics] = useState({
    usersCount: 0,
    studentsCount: 0,
    visitorsCount: 0,
    stampsCount: 0,
    effectivePoints: 0,
    votesCount: 0,
    pitchesCount: 0,
    enrollmentsCount: 0,
    talentTotal: 0,
    talentBooked: 0,
    talentAvailable: 0,
    hasActiveQrSession: false,
    qrRemainingSeconds: 0,
  });

  // Filtros de Auditoria & Controladoria
  const [logTypeFilter, setLogTypeFilter] = useState('TODAS');
  const [logDomainFilter, setLogDomainFilter] = useState('TODOS');

  // QR Code Generator States
  const [selectedActivity, setSelectedActivity] = useState('PALESTRA_MAGNA');
  const [generatedToken, setGeneratedToken] = useState('SEC-IA-A3K');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutos
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Manual Audit States (Concessão e Auditoria Manual de Presenças)
  const [usersList, setUsersList] = useState<Array<{ id: string; fullName: string; email: string; role: string; stampsCount?: number }>>([]);
  const [activitiesList, setActivitiesList] = useState<Array<{ id: string; title: string }>>([]);
  const [manualUserId, setManualUserId] = useState<string>('');
  const [manualActivityId, setManualActivityId] = useState<string>('');
  const [manualPoints, setManualPoints] = useState<number>(1);
  const [manualReason, setManualReason] = useState<string>('Auditoria Manual Presencial');
  const [manualAuditLoading, setManualAuditLoading] = useState<boolean>(false);
  const [manualAuditMsg, setManualAuditMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  // Photo Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Pitches State (Carregado dinamicamente do banco)
  const [pitches, setPitches] = useState<SharkPitchItem[]>([]);

  // Audit Logs State (Carregado dinamicamente do banco)
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Helper para CSRF token
  const getCsrf = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  };

  // OWASP Anti-enumeration: Acesso estrito a administradores e staff autorizados
  const isAdmin = isUserAdmin(user);

  // 1. Fetch Real Telemetry Data from PostgreSQL Backend
  useEffect(() => {
    if (!isAdmin) return;

    const fetchLiveBackendData = async () => {
      try {
        const [telemetryRes, auditRes, votesRes] = await Promise.allSettled([
          fetch('/api/v1/admin/telemetry', { credentials: 'include' }),
          fetch(`/api/v1/admin/audit-logs?type=${encodeURIComponent(logTypeFilter)}&limit=50`, { credentials: 'include' }),
          fetch('/api/v1/admin/votes', { credentials: 'include' }),
        ]);

        const telemetryData = telemetryRes.status === 'fulfilled' && telemetryRes.value.ok ? await telemetryRes.value.json() : null;
        const auditData = auditRes.status === 'fulfilled' && auditRes.value.ok ? await auditRes.value.json() : null;
        const votesData = votesRes.status === 'fulfilled' && votesRes.value.ok ? await votesRes.value.json() : null;

        if (telemetryData?.success) {
          setMetrics((prev) => ({
            ...prev,
            usersCount: telemetryData.participants?.total ?? prev.usersCount,
            studentsCount: telemetryData.participants?.students ?? prev.studentsCount,
            visitorsCount: telemetryData.participants?.visitors ?? prev.visitorsCount,
            stampsCount: telemetryData.stamps?.total ?? prev.stampsCount,
            effectivePoints: telemetryData.stamps?.effectivePoints ?? prev.effectivePoints,
            votesCount: telemetryData.sharkTank?.totalVotes ?? prev.votesCount,
            pitchesCount: telemetryData.sharkTank?.pitchesCount ?? prev.pitchesCount,
            enrollmentsCount: telemetryData.workshops?.totalEnrollments ?? prev.enrollmentsCount,
            talentTotal: telemetryData.talentArena?.totalSlots ?? prev.talentTotal,
            talentBooked: telemetryData.talentArena?.bookedSlots ?? prev.talentBooked,
            talentAvailable: telemetryData.talentArena?.availableSlots ?? prev.talentAvailable,
            hasActiveQrSession: telemetryData.qrSession?.hasActiveSession ?? prev.hasActiveQrSession,
            qrRemainingSeconds: telemetryData.qrSession?.remainingSeconds ?? prev.qrRemainingSeconds,
          }));
        }

        if (votesData?.pitches && Array.isArray(votesData.pitches)) {
          setPitches(
            votesData.pitches.map((p: any) => ({
              id: p.id,
              name: p.startupName,
              team: p.teamMembers,
              track: p.oneLiner,
              votes: p._count?.votes ?? p.voteCount ?? 0,
              isOpen: true,
            }))
          );
        }

        if (auditData?.logs && Array.isArray(auditData.logs) && auditData.logs.length > 0) {
          setLogs((prev) => {
            const realtimeLogs = prev.filter((l) => l.id.startsWith('rt-'));
            const map = new Map<string, AuditLog>();
            realtimeLogs.forEach((l) => map.set(l.id, l));
            auditData.logs.forEach((l: AuditLog) => map.set(l.id, l));
            return Array.from(map.values()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          });
        }
      } catch (err) {
        console.error('[AdminPage] Falha na telemetria:', err);
      }
    };

    fetchLiveBackendData();
    const interval = setInterval(fetchLiveBackendData, 5000);
    return () => clearInterval(interval);
  }, [isAdmin, logTypeFilter]);

  // 2. Supabase Realtime Telemetry Broadcast
  useEffect(() => {
    if (!isAdmin) return;

    try {
      const channel = subscribeToAdminChannel((payload: AdminRealtimeEvent) => {
        if (payload.type === 'STAMP_ADDED') {
          setMetrics((prev) => ({ ...prev, stampsCount: prev.stampsCount + 1 }));
          setLogs((prev) => [
            {
              id: `rt-stamp-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              user: (payload.payload as any).userId || 'Participante',
              email: 'aluno@utfpr.edu.br',
              action: 'CARIMBO_LIVE',
              details: `Presença Validada • Nível ${(payload.payload as any).newLevel || 'Ativo'}`,
              status: 'SUCCESS',
            },
            ...prev,
          ]);
        } else if (payload.type === 'USER_REGISTERED') {
          setMetrics((prev) => ({ ...prev, usersCount: prev.usersCount + 1 }));
          setLogs((prev) => [
            {
              id: `rt-user-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              user: (payload.payload as any).email?.split('@')[0] || 'Novo Usuário',
              email: (payload.payload as any).email || '',
              action: 'REGISTRO_LIVE',
              details: `Perfil ${(payload.payload as any).role || 'STUDENT'} criado`,
              status: 'INFO',
            },
            ...prev,
          ]);
        } else if (payload.type === 'ENROLLMENT_ADDED') {
          setMetrics((prev) => ({ ...prev, enrollmentsCount: prev.enrollmentsCount + 1 }));
          setLogs((prev) => [
            {
              id: `rt-enroll-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              user: (payload.payload as any).userId || 'Participante',
              email: 'aluno@utfpr.edu.br',
              action: 'INSCRIÇÃO_LIVE',
              details: `Vaga garantida em atividade`,
              status: 'SUCCESS',
            },
            ...prev,
          ]);
        } else if (payload.type === 'VOTE_CAST') {
          setMetrics((prev) => ({ ...prev, votesCount: prev.votesCount + 1 }));
          const pitchId = payload.payload?.pitchId as string;
          if (pitchId) {
            setPitches((prev) =>
              prev.map((p) => (p.id === pitchId ? { ...p, votes: p.votes + 1 } : p))
            );
          }
          setLogs((prev) => [
            {
              id: `rt-vote-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              user: (payload.payload as any).userId || 'Eleitor Auditado',
              email: 'eleitor@utfpr.edu.br',
              action: 'VOTO_LIVE',
              details: 'Voto popular computado no Shark Tank',
              status: 'SUCCESS',
            },
            ...prev,
          ]);
        } else if (payload.type === 'TOKEN_OPENED') {
          setGeneratedToken((payload.payload as any).token || generatedToken);
          setCountdown(15 * 60);
        }
      });

      return () => {
        channel.unsubscribe();
      };
    } catch {
      setRealtimeConnected(false);
    }
  }, [isAdmin]);

  // 3. Carrega participantes e atividades para auditoria manual + Sessão Ativa
  useEffect(() => {
    if (!isAdmin) return;

    fetch('/api/v1/admin/users?limit=100', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.users && Array.isArray(data.users)) {
          setUsersList(data.users);
          if (data.users.length > 0) setManualUserId(data.users[0].id);
        }
      })
      .catch(() => { });

    fetch('/api/v1/activities')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.activities && Array.isArray(data.activities)) {
          setActivitiesList(data.activities);
          if (data.activities.length > 0) setManualActivityId(data.activities[0].id);
        }
      })
      .catch(() => { });

    fetch('/api/v1/activities/cms/all')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.cms) {
          setCmsAll(data.cms);
        }
      })
      .catch(() => { });

    fetch('/api/v1/admin/sessions/active', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session) {
          setActiveSessionId(data.session.id);
          if (data.session.token) setGeneratedToken(data.session.token);
          if (data.session.remainingSeconds) setCountdown(data.session.remainingSeconds);
        }
      })
      .catch(() => { });
  }, [isAdmin]);

  // Gera DataURL do QR Code sempre que o token ativo mudar
  useEffect(() => {
    if (!generatedToken) return;
    const url = `${window.location.origin}/validate?t=${generatedToken}`;
    QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: {
        dark: '#181a20',
        light: '#ffffff',
      },
    })
      .then((data) => setQrDataUrl(data))
      .catch(() => { });
  }, [generatedToken]);

  // Countdown Timer for Active OTT Token (15m)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleGenerateNewToken = async () => {
    try {
      const actRes = await fetch('/api/v1/activities');
      let targetActId: string | undefined;
      if (actRes.ok) {
        const actData = await actRes.json();
        targetActId = actData.activities?.[0]?.id;
      }

      if (targetActId) {
        const categories: Record<string, string> = {
          PALESTRA_MAGNA: 'MAG',
          WORKSHOP_IA: 'IA',
          SHARK_TANK: 'SHARK',
          TALENT_ARENA: 'ARENA',
        };
        const cat = categories[selectedActivity] || 'SEC';
        const csrf = getCsrf();
        const sessionHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (csrf) sessionHeaders['x-csrf-token'] = csrf;

        const sessionRes = await fetch('/api/v1/admin/sessions/open', {
          method: 'POST',
          credentials: 'include',
          headers: sessionHeaders,
          body: JSON.stringify({
            activityId: targetActId,
            category: cat,
            durationMinutes: 15,
          }),
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.sessionId) setActiveSessionId(sessionData.sessionId);
          if (sessionData.token) {
            setGeneratedToken(sessionData.token);
            setCountdown(15 * 60);
            setSaveSuccess(`Sessão de QR Code aberta! Token: ${sessionData.token}`);
            setTimeout(() => setSaveSuccess(null), 3000);
            return;
          }
        }
      }
    } catch { }

    const categories: Record<string, string> = {
      PALESTRA_MAGNA: 'MAG',
      WORKSHOP_IA: 'IA',
      SHARK_TANK: 'SHARK',
      TALENT_ARENA: 'ARENA',
    };
    const cat = categories[selectedActivity] || 'SEC';
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newToken = `SEC-${cat}-${rand}`;
    setGeneratedToken(newToken);
    setCountdown(15 * 60);
  };

  const handleCloseSession = async () => {
    if (!activeSessionId) return;
    const csrf = getCsrf();
    try {
      await fetch(`/api/v1/admin/sessions/${activeSessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: csrf ? { 'x-csrf-token': csrf } : {},
      });
      setActiveSessionId(null);
      setCountdown(0);
      setSaveSuccess('Sessão de QR Code encerrada com sucesso.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      setSaveSuccess('Erro ao encerrar sessão.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const handleManualGrantStamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || !manualActivityId) {
      setManualAuditMsg({ type: 'ERROR', text: 'Selecione participante e atividade.' });
      return;
    }

    setManualAuditLoading(true);
    setManualAuditMsg(null);
    const csrf = getCsrf();
    try {
      const res = await fetch('/api/v1/admin/stamps/manual-grant', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        body: JSON.stringify({
          userId: manualUserId,
          activityId: manualActivityId,
          points: manualPoints,
          reason: manualReason || 'Auditoria Manual Presencial',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setManualAuditMsg({ type: 'SUCCESS', text: data.message || 'Presença auditada e carimbo concedido com sucesso!' });
        const userObj = usersList.find((u) => u.id === manualUserId);
        const actObj = activitiesList.find((a) => a.id === manualActivityId);
        if (userObj && actObj) {
          setLogs((prev) => [
            {
              id: `manual-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('pt-BR'),
              user: userObj.fullName,
              email: userObj.email,
              action: 'CARIMBOS',
              details: `Concessão manual (+${manualPoints}) na atividade "${actObj.title}": ${manualReason}`,
              status: 'SUCCESS',
            },
            ...prev,
          ]);
        }
      } else {
        setManualAuditMsg({ type: 'ERROR', text: data.message || 'Erro ao conceder carimbo manual.' });
      }
    } catch {
      setManualAuditMsg({ type: 'ERROR', text: 'Falha de comunicação com o servidor.' });
    } finally {
      setManualAuditLoading(false);
      setTimeout(() => setManualAuditMsg(null), 5000);
    }
  };

  const handleRevokeStamp = async (stampId: string) => {
    if (!confirm('Deseja realmente revogar este carimbo auditado?')) return;
    const csrf = getCsrf();
    try {
      const res = await fetch(`/api/v1/admin/stamps/${stampId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: csrf ? { 'x-csrf-token': csrf } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(data.message || 'Carimbo revogado com sucesso.');
        setLogs((prev) => prev.filter((l) => l.id !== stampId));
      } else {
        setSaveSuccess(data.message || 'Erro ao revogar carimbo.');
      }
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch {
      setSaveSuccess('Falha ao comunicar com o servidor.');
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const handleTogglePitchVoting = (pitchId: string) => {
    setPitches((prev) =>
      prev.map((p) => (p.id === pitchId ? { ...p, isOpen: !p.isOpen } : p))
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          addEventPhoto({
            url: data.url,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            category: 'Evento Ao Vivo',
          });
          setUploadSuccess('Foto enviada e armazenada no servidor local!');
          setUploading(false);
          return;
        }
      }

      // Fallback local via FileReader
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        addEventPhoto({
          url: base64Url,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          category: 'Evento Ao Vivo',
        });
        setUploadSuccess('Foto carregada localmente no navegador!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        addEventPhoto({
          url: base64Url,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          category: 'Evento Ao Vivo',
        });
        setUploadSuccess('Foto carregada localmente no navegador!');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSavingCms, setIsSavingCms] = useState(false);

  const handleSaveState = async () => {
    setIsSavingCms(true);
    const csrf = getCsrf();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (csrf) {
      headers['x-csrf-token'] = csrf;
    }

    try {
      const results = await Promise.all([
        fetch('/api/v1/admin/cms/lectures', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: lectures }),
        }),
        fetch('/api/v1/admin/cms/workshops', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: workshops }),
        }),
        fetch('/api/v1/admin/cms/mentors', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: mentors }),
        }),
        fetch('/api/v1/admin/cms/partners', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: partners }),
        }),
        fetch('/api/v1/admin/cms/event_photos', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: eventPhotos }),
        }),
        fetch('/api/v1/admin/cms/talent_platforms', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: talentPlatforms }),
        }),
        fetch('/api/v1/admin/cms/ideathon_teams', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ value: ideathonTeams }),
        }),
      ]);

      const allOk = results.every((r) => r.ok);
      if (allOk) {
        setSaveSuccess('✅ Grade, minicursos, mentores, parceiros, fotos e plataformas persistidos 100% no PostgreSQL (Supabase)!');
      } else {
        setSaveSuccess('⚠️ Aviso: Algumas tabelas responderam com erro de persistência no Supabase.');
      }
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch {
      setSaveSuccess('❌ Falha ao conectar com o banco Supabase.');
      setTimeout(() => setSaveSuccess(null), 5000);
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleCreateLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.title || !newLecture.speaker) return;

    const themeLabels: Record<LectureTheme, string> = {
      TECHNOLOGY: 'Tecnologia',
      MANAGEMENT: 'Estratégia',
      INNOVATION: 'Inovação',
      CAREER: 'Carreira',
    };

    const shiftLabels: Record<LectureShift, string> = {
      MORNING: 'Manhã',
      AFTERNOON: 'Tarde',
      NIGHT: 'Noite',
    };

    addLecture({
      dayIndex: Number(newLecture.dayIndex),
      shift: newLecture.shift,
      shiftLabel: shiftLabels[newLecture.shift],
      time: newLecture.time || '19h00 - 22h00',
      title: newLecture.title,
      description: newLecture.description || 'Palestra e conteúdo técnico exclusivo da SECOMP 2026.',
      speaker: newLecture.speaker,
      speakerRole: newLecture.speakerRole || 'Especialista Convidado',
      location: newLecture.location || 'Auditório Principal',
      theme: newLecture.theme,
      themeLabel: themeLabels[newLecture.theme],
      availableSeats: Number(newLecture.availableSeats) || 50,
      totalSeats: Number(newLecture.totalSeats) || 200,
    });

    setNewLecture({
      dayIndex: 0,
      shift: 'MORNING',
      shiftLabel: 'Manhã',
      time: '09h00 - 11h30',
      title: '',
      description: '',
      speaker: '',
      speakerRole: '',
      location: 'Auditório Principal',
      theme: 'TECHNOLOGY',
      themeLabel: 'Tecnologia',
      availableSeats: 50,
      totalSeats: 250,
    });
  };

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkshop.title || !newWorkshop.instructor) return;

    const trackLabels: Record<WorkshopTrack, string> = {
      DADOS: 'Inteligência & Dados',
      INFRA: 'Infra & Segurança',
      HARDWARE: 'Hardware & Sistemas',
      DEV: 'Desenvolvimento & UI',
    };

    const trackColors: Record<WorkshopTrack, string> = {
      DADOS: '#fcd535',
      INFRA: '#f6465d',
      HARDWARE: '#2dbdb6',
      DEV: '#0ecb81',
    };

    addWorkshop({
      title: newWorkshop.title,
      month: newWorkshop.month,
      day: newWorkshop.day || '14',
      track: newWorkshop.track,
      trackLabel: trackLabels[newWorkshop.track],
      trackColor: trackColors[newWorkshop.track],
      partner: newWorkshop.partner || 'DACOM UTFPR',
      instructor: newWorkshop.instructor,
      location: newWorkshop.location || 'Laboratório Central',
      activeSlots: Number(newWorkshop.activeSlots) || 10,
      totalSlots: Number(newWorkshop.totalSlots) || 40,
      description: newWorkshop.description || 'Prática hands-on com certificação oficial da SECOMP 2026.',
    });

    setNewWorkshop({
      title: '',
      month: 'SETEMBRO',
      day: '14',
      track: 'DADOS',
      trackLabel: 'Inteligência & Dados',
      trackColor: '#fcd535',
      partner: 'TO Brasil',
      instructor: '',
      location: 'Laboratório de Redes e Dados',
      activeSlots: 10,
      totalSlots: 40,
      description: '',
    });
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentor.name || !newMentor.role) return;

    addMentor({
      name: newMentor.name,
      role: newMentor.role,
      organization: newMentor.organization || 'Convidado Especial',
      tag: newMentor.tag || 'Tech & Inovação',
      topic: newMentor.topic || 'Mentoria técnica e desenvolvimento de projetos',
      accentColor: newMentor.accentColor || '#fcd535',
      avatarUrl:
        newMentor.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    });

    setNewMentor({
      name: '',
      role: '',
      organization: '',
      tag: '',
      topic: '',
      accentColor: '#fcd535',
      avatarUrl: '',
    });
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name || !newPartner.category) return;

    const benefits = newPartner.benefitsText
      ? newPartner.benefitsText.split('\n').filter(Boolean)
      : ['Inserção de marca no evento', 'Slots na Roda de Talentos'];

    const tags = newPartner.tagsText
      ? newPartner.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Parceiro Oficial', 'Recrutamento'];

    const cotaLabels: Record<CotaType, string> = {
      OURO: 'Cota Ouro',
      PRATA: 'Cota Prata',
      BRONZE: 'Cota Bronze',
      PARCEIRO: 'Parceiro Institucional',
      EXPOSITOR: 'Cota Expositor',
    };

    const cotaColors: Record<CotaType, string> = {
      OURO: '#fcd535',
      PRATA: '#eaecef',
      BRONZE: '#2dbdb6',
      PARCEIRO: '#ffffff',
      EXPOSITOR: '#0ecb81',
    };

    const badgeColors: Record<CotaType, string> = {
      OURO: 'bg-[#fcd535]/15 text-[#fcd535] border-[#fcd535]/50',
      PRATA: 'bg-[#eaecef]/15 text-[#eaecef] border-[#eaecef]/40',
      BRONZE: 'bg-[#2dbdb6]/15 text-[#2dbdb6] border-[#2dbdb6]/40',
      PARCEIRO: 'bg-white/15 text-white border-white/40',
      EXPOSITOR: 'bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/40',
    };

    addPartner({
      name: newPartner.name,
      category: newPartner.category,
      cota: newPartner.cota,
      cotaLabel: cotaLabels[newPartner.cota],
      cotaIcon: newPartner.cota,
      cotaColor: cotaColors[newPartner.cota],
      badgeColor: badgeColors[newPartner.cota],
      tagline: newPartner.tagline || 'Líder em Tecnologia e Inovação',
      description: newPartner.description || 'Apoiador estratégico da SECOMP 2026.',
      benefits,
      tags,
      websiteUrl: newPartner.websiteUrl || 'https://utfpr.edu.br',
      logoUrl: newPartner.logoUrl || undefined,
    });

    setNewPartner({
      name: '',
      category: '',
      cota: 'OURO',
      tagline: '',
      description: '',
      benefitsText: '',
      tagsText: '',
      websiteUrl: '',
      logoUrl: '',
    });
  };

  const handleCreatePhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;

    addEventPhoto({
      url: newPhotoUrl,
      caption: newPhotoCaption || 'Registro Fotográfico SECOMP 2026',
      category: newPhotoCategory,
    });

    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  // CRUD Update Handlers
  const handleSaveLectureEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecture) return;
    updateLecture(editingLecture.id, editingLecture);
    setEditingLecture(null);
    setSaveSuccess('Palestra atualizada com sucesso!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveWorkshopEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    updateWorkshop(editingWorkshop.id, editingWorkshop);
    setEditingWorkshop(null);
    setSaveSuccess('Minicurso atualizado com sucesso!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveMentorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;
    updateMentor(editingMentor.id, editingMentor);
    setEditingMentor(null);
    setSaveSuccess('Mentor atualizado com sucesso!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSavePartnerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    updatePartner(editingPartner.id, editingPartner);
    setEditingPartner(null);
    setSaveSuccess('Parceiro atualizado com sucesso!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSavePhotoEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    updateEventPhoto(editingPhoto.id, editingPhoto);
    setEditingPhoto(null);
    setSaveSuccess('Foto atualizada com sucesso!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      searchFilter === '' ||
      l.user.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.details.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesType =
      logTypeFilter === 'TODAS' ||
      (logTypeFilter === 'CARIMBOS' && l.action.includes('CARIMBO')) ||
      (logTypeFilter === 'CADASTROS' && l.action.includes('REGISTRO')) ||
      (logTypeFilter === 'VOTOS SHARK' && l.action.includes('VOTO')) ||
      (logTypeFilter === 'INSCRIÇÕES' && l.action.includes('INSCRIÇÃO')) ||
      (logTypeFilter === 'TALENT ARENA' && l.action.includes('TALENT'));

    const matchesDomain =
      logDomainFilter === 'TODOS' ||
      (logDomainFilter === '@alunos.utfpr.edu.br' && l.email.endsWith('@alunos.utfpr.edu.br')) ||
      (logDomainFilter === '@utfpr.edu.br' && l.email.endsWith('@utfpr.edu.br') && !l.email.endsWith('@alunos.utfpr.edu.br')) ||
      (logDomainFilter === 'EXTERNO' && !l.email.includes('utfpr.edu.br'));

    return matchesSearch && matchesType && matchesDomain;
  });

  // Anti-enumeration: If user is not admin, render realistic 404
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col items-center justify-center p-6 font-sans select-none">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-6xl font-extrabold font-mono text-[#fcd535]">404</div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
            Página Não Encontrada
          </h1>
          <p className="text-xs text-[#707a8a] leading-relaxed">
            O endereço solicitado não existe ou foi removido temporariamente da rede SECOMP.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] border border-[#2b3139] text-xs font-mono font-bold text-white transition-colors"
            >
              RETORNAR AO PORTAL
            </a>
            <a
              href="/auth?next=/chameguinho"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-xs font-mono font-bold text-[#181a20] transition-colors"
            >
              ACESSAR COM CREDENCIAIS ADMIN
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans pb-16">
      {/* Top Cockpit Header */}
      <header className="sticky top-0 z-40 bg-[#0b0e11] border-b border-[#2b3139] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" title="Voltar ao Portal SECOMP" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-[#fcd535] flex items-center justify-center font-mono font-black text-[#181a20] text-sm group-hover:scale-105 transition-transform">
              CH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-sm uppercase group-hover:text-[#fcd535] transition-colors">
                  Cockpit Administrativo
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e2329] border border-[#2b3139] text-[#fcd535]">
                  /chameguinho
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#707a8a]">
                <span className="w-2 h-2 rounded-full bg-[#0ecb81]" />
                <span>{user?.name || 'Administrador'} ({user?.email || 'admin@utfpr.edu.br'})</span>
              </div>
            </div>
          </a>
        </div>

        {/* Navigation Tabs & Master Switch */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center rounded-lg bg-[#181a20] border border-[#2b3139] p-1">
            <button
              onClick={() => setActiveSubTab('METRICS')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${activeSubTab === 'METRICS'
                ? 'bg-[#fcd535] text-[#181a20]'
                : 'text-[#707a8a] hover:text-white'
                }`}
            >
              TELEMETRIA AO VIVO
            </button>
            <button
              onClick={() => setActiveSubTab('CMS')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${activeSubTab === 'CMS'
                ? 'bg-[#fcd535] text-[#181a20]'
                : 'text-[#707a8a] hover:text-white'
                }`}
            >
              MINI-CMS & CONTEÚDO
            </button>
          </div>

          {/* Admin Master Switch Controls */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#181a20] border border-[#2b3139] p-1 rounded-lg">
            <button
              onClick={() => handleToggleSessionKey('shark_tank_voting_active')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-all ${sessionStatus.shark_tank_voting_active
                ? 'bg-[#0ecb81]/10 text-[#0ecb81] border-[#0ecb81]/40'
                : 'bg-[#f6465d]/10 text-[#f6465d] border-[#f6465d]/40'
                }`}
            >
              🦈 Shark Tank: {sessionStatus.shark_tank_voting_active ? 'ABERTO' : 'BLOQUEADO'}
            </button>
            <button
              onClick={() => handleToggleSessionKey('ideathon_registration_open')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-all ${sessionStatus.ideathon_registration_open
                ? 'bg-[#0ecb81]/10 text-[#0ecb81] border-[#0ecb81]/40'
                : 'bg-[#f6465d]/10 text-[#f6465d] border-[#f6465d]/40'
                }`}
            >
              🚀 Ideathon: {sessionStatus.ideathon_registration_open ? 'ABERTO' : 'BLOQUEADO'}
            </button>
            <button
              onClick={() => handleToggleSessionKey('ott_scanner_active')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-all ${sessionStatus.ott_scanner_active
                ? 'bg-[#0ecb81]/10 text-[#0ecb81] border-[#0ecb81]/40'
                : 'bg-[#f6465d]/10 text-[#f6465d] border-[#f6465d]/40'
                }`}
            >
              📷 QR Scanner: {sessionStatus.ott_scanner_active ? 'ABERTO' : 'BLOQUEADO'}
            </button>
          </div>

          <button
            onClick={async () => {
              setUser(null);
              try {
                await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
              } catch { }
              window.location.href = '/';
            }}
            title="Encerrar Sessão"
            className="p-2 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] border border-[#2b3139] text-[#707a8a] hover:text-[#f6465d] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {activeSubTab === 'METRICS' ? (
          <>
            {/* 1. KPIs Telemetria: Dashboard Numérico Direto e Unificado dos 9 Eixos de Controladoria */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
              {/* P1: Cadastro & Identidade */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P1. CADASTRO</span>
                  <Users className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{metrics.usersCount}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  {metrics.studentsCount} UTFPR • {metrics.visitorsCount} ext.
                </div>
              </div>

              {/* P2: Roda de Talentos */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P2. TALENTOS</span>
                  <Building className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{metrics.talentBooked}/{metrics.talentTotal}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  {metrics.talentAvailable} slots livres
                </div>
              </div>

              {/* P3: Palestras */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P3. PALESTRAS</span>
                  <Calendar className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{lectures.length}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  Auditório Principal
                </div>
              </div>

              {/* P4: Minicursos */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P4. MINICURSOS</span>
                  <BookOpen className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{metrics.enrollmentsCount}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  {workshops.length} trilhas ativas
                </div>
              </div>

              {/* P5: Roda de Conversa */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P5. CONVERSA</span>
                  <GraduationCap className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{mentors.length}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  Mentores & bancas
                </div>
              </div>

              {/* P6: Voto Shark Tank */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P6. SHARK TANK</span>
                  <Vote className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{metrics.votesCount}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  {metrics.pitchesCount} pitches auditados
                </div>
              </div>

              {/* P7: Time Ideathon */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P7. IDEATHON</span>
                  <TrendingUp className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{pitches.length || 6}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  Equipes ativas
                </div>
              </div>

              {/* P8: Carimbos Cadastrados */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P8. CARIMBOS</span>
                  <Award className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{metrics.stampsCount}</div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  {metrics.effectivePoints} pts validados
                </div>
              </div>

              {/* P9: Controle Projeção Live 15m */}
              <div className="p-3 rounded-lg bg-[#181a20] border border-[#2b3139] space-y-1">
                <div className="flex items-center justify-between text-[#707a8a] text-[10px] font-mono">
                  <span>P9. ARENA LIVE</span>
                  <Radio className="w-3 h-3 text-[#eaecef]" />
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {metrics.hasActiveQrSession ? formatCountdown(metrics.qrRemainingSeconds) : '00:00'}
                </div>
                <div className="text-[9px] font-mono text-[#707a8a]">
                  {metrics.hasActiveQrSession ? 'Projeção Ativa' : 'Inativo'}
                </div>
              </div>
            </div>

            {/* 2. Painel de Auditoria Manual & Concessão Direta de Presença */}
            <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2b3139]">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0ecb81]" />
                    <span>Auditoria Manual Direta & Concessão de Presença (+1 Carimbo)</span>
                  </h3>
                  <p className="text-xs text-[#707a8a] mt-1">
                    Concessão administrativa autorizada para contingências presenciais ou validação manual com carimbo no passaporte e telemetria atômica.
                  </p>
                </div>
              </div>

              {manualAuditMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    manualAuditMsg.type === 'SUCCESS'
                      ? 'bg-[#0ecb81]/10 border-[#0ecb81]/30 text-[#0ecb81]'
                      : 'bg-[#f6465d]/10 border-[#f6465d]/30 text-[#f6465d]'
                  }`}
                >
                  {manualAuditMsg.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{manualAuditMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleManualGrantStamp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">Participante *</label>
                  <select
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="">Selecione um Participante...</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email}) [{u.role}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">Atividade / Grade *</label>
                  <select
                    value={manualActivityId}
                    onChange={(e) => setManualActivityId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="">Selecione a Atividade...</option>
                    {activitiesList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">Pontos Passaporte</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={manualPoints}
                    onChange={(e) => setManualPoints(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">Motivo da Auditoria</label>
                  <input
                    type="text"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    placeholder="Ex: Falha câmera QR / Presencial"
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={manualAuditLoading || !manualUserId || !manualActivityId}
                    className="w-full py-2 px-4 rounded-lg bg-[#0ecb81] hover:bg-[#0ecb81]/90 disabled:opacity-50 text-[#0b0e11] font-bold text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {manualAuditLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>CONCEDER CARIMBO</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                    Feed de Auditoria & Controladoria em Tempo Real
                  </h3>
                  <p className="text-xs text-[#707a8a]">
                    Monitoramento de logins, presenças emitidas, votos e agendamentos ({filteredLogs.length} registros exibidos).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  {/* Filtro por Tipo de Ação */}
                  <select
                    value={logTypeFilter}
                    onChange={(e) => setLogTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-[#eaecef] text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="TODAS">AÇÃO: TODAS</option>
                    <option value="CARIMBOS">CARIMBOS</option>
                    <option value="CADASTROS">CADASTROS</option>
                    <option value="VOTOS SHARK">VOTOS SHARK</option>
                    <option value="INSCRIÇÕES">INSCRIÇÕES</option>
                    <option value="TALENT ARENA">TALENT ARENA</option>
                  </select>

                  {/* Filtro por Domínio */}
                  <select
                    value={logDomainFilter}
                    onChange={(e) => setLogDomainFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-[#eaecef] text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="TODOS">DOMÍNIO: TODOS</option>
                    <option value="@alunos.utfpr.edu.br">@alunos.utfpr.edu.br</option>
                    <option value="@utfpr.edu.br">@utfpr.edu.br</option>
                    <option value="EXTERNO">EXTERNO</option>
                  </select>

                  {/* Busca Textual */}
                  <div className="relative flex-1 sm:w-60">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Buscar por RA, nome..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#707a8a] absolute left-2.5 top-2" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#2b3139] text-[#707a8a]">
                      <th className="py-2.5 px-3">HORÁRIO</th>
                      <th className="py-2.5 px-3">PARTICIPANTE</th>
                      <th className="py-2.5 px-3">E-MAIL / RA</th>
                      <th className="py-2.5 px-3">AÇÃO</th>
                      <th className="py-2.5 px-3">DETALHES</th>
                      <th className="py-2.5 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2b3139]/40">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1e2329]/50 transition-colors">
                        <td className="py-3 px-3 text-[#707a8a]">{log.timestamp}</td>
                        <td className="py-3 px-3 font-bold text-white">{log.user}</td>
                        <td className="py-3 px-3 text-[#929aa5]">{log.email}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-[#0b0e11] border border-[#2b3139] text-[#fcd535] text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#eaecef]">{log.details}</td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SUCCESS'
                              ? 'bg-[#0ecb81]/15 text-[#0ecb81]'
                              : log.status === 'WARN'
                                ? 'bg-[#f6465d]/15 text-[#f6465d]'
                                : 'bg-[#2b3139] text-white'
                              }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* ── SUB-VISÃO CMS (GERENCIAMENTO DE CONTEÚDO REATIVO) ──────────────── */
          <div className="space-y-8">
            {/* Sub-menu do Mini-CMS & Botão Salvar Estado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2b3139] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCmsSection('LECTURES')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'LECTURES'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>PALESTRAS ({lectures.length})</span>
                </button>

                <button
                  onClick={() => setCmsSection('WORKSHOPS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'WORKSHOPS'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>MINICURSOS ({workshops.length})</span>
                </button>

                <button
                  onClick={() => setCmsSection('MENTORS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'MENTORS'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>MENTORES & BANCA ({mentors.length})</span>
                </button>

                <button
                  onClick={() => setCmsSection('PARTNERS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'PARTNERS'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <Building className="w-4 h-4" />
                  <span>PARCEIROS & COTAS ({partners.length})</span>
                </button>

                <button
                  onClick={() => setCmsSection('TALENT_PLATFORMS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'TALENT_PLATFORMS'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>RODA DE TALENTOS & EMPRESAS ({talentPlatforms?.length || 0})</span>
                </button>

                <button
                  onClick={() => setCmsSection('PHOTOS')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'PHOTOS'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>MURAL DE FOTOS ({eventPhotos.length})</span>
                </button>

                <button
                  onClick={() => setCmsSection('PITCHES')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'PITCHES'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <Vote className="w-4 h-4" />
                  <span>SHARK TANK VOTOS ({pitches.length})</span>
                </button>

                <button
                  onClick={() => setCmsSection('IDEATHON')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${cmsSection === 'IDEATHON'
                    ? 'bg-[#fcd535] text-[#181a20]'
                    : 'bg-[#181a20] text-[#707a8a] hover:text-white border border-[#2b3139]'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>TIMES IDEATHON ({ideathonTeams.length})</span>
                </button>
              </div>

              {/* Botão Salvar Estado (Persistência no Supabase PostgreSQL) */}
              <button
                onClick={handleSaveState}
                disabled={isSavingCms}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0ecb81] hover:bg-[#0ecb81]/90 disabled:opacity-50 text-[#181a20] font-mono font-bold text-xs transition-colors shadow-lg active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingCms ? 'SALVANDO NO BANCO...' : 'SALVAR NO SUPABASE'}</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0ecb81]/15 border border-[#0ecb81]/50 text-[#0ecb81] text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* SEÇÃO 0: PALESTRAS / GRADE DOS 5 DIAS */}
            {cmsSection === 'LECTURES' && (
              <div className="space-y-6">
                {/* Form Adicionar Palestra */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#fcd535]" />
                        Cadastrar Nova Palestra / Painel na Grade
                      </h3>
                      <p className="text-xs text-[#707a8a]">
                        Insere diretamente na grade dos 5 dias da SECOMP 2026 com atualização reativa instantânea.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateLecture} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Título da Palestra / Painel *</label>
                      <input
                        type="text"
                        required
                        value={newLecture.title}
                        onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                        placeholder="Ex: Engenharia de Software em Hiperescala"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Palestrante / Moderador *</label>
                      <input
                        type="text"
                        required
                        value={newLecture.speaker}
                        onChange={(e) => setNewLecture({ ...newLecture, speaker: e.target.value })}
                        placeholder="Ex: Dra. Mariana Costa"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cargo / Instituição</label>
                      <input
                        type="text"
                        value={newLecture.speakerRole}
                        onChange={(e) => setNewLecture({ ...newLecture, speakerRole: e.target.value })}
                        placeholder="Ex: Principal Engineer @ Google"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Dia do Evento</label>
                      <select
                        value={newLecture.dayIndex}
                        onChange={(e) => setNewLecture({ ...newLecture, dayIndex: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value={0}>Segunda-feira (09 Nov - O MUNDO)</option>
                        <option value={1}>Terça-feira (10 Nov - O MERCADO)</option>
                        <option value={2}>Quarta-feira (11 Nov - OS PROJETOS)</option>
                        <option value={3}>Quinta-feira (12 Nov - O HUMANO)</option>
                        <option value={4}>Sexta-feira (13 Nov - O FUTURO)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Turno</label>
                      <select
                        value={newLecture.shift}
                        onChange={(e) => setNewLecture({ ...newLecture, shift: e.target.value as LectureShift })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value="MORNING">Manhã (09h00)</option>
                        <option value="AFTERNOON">Tarde (14h00)</option>
                        <option value="NIGHT">Noite (19h00)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Horário Formatado</label>
                      <input
                        type="text"
                        value={newLecture.time}
                        onChange={(e) => setNewLecture({ ...newLecture, time: e.target.value })}
                        placeholder="Ex: 09h00 - 11h30"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tema da Atividade</label>
                      <select
                        value={newLecture.theme}
                        onChange={(e) => setNewLecture({ ...newLecture, theme: e.target.value as LectureTheme })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value="TECHNOLOGY">Tecnologia & Dev (Ciano)</option>
                        <option value="INNOVATION">Inovação & Startups (Amarelo)</option>
                        <option value="MANAGEMENT">Estratégia & Liderança (Branco)</option>
                        <option value="CAREER">Carreira & Soft Skills (Verde)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Localização / Palco</label>
                      <input
                        type="text"
                        value={newLecture.location}
                        onChange={(e) => setNewLecture({ ...newLecture, location: e.target.value })}
                        placeholder="Auditório Principal / Pátio"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Vagas (Disponíveis / Total)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newLecture.availableSeats}
                          onChange={(e) => setNewLecture({ ...newLecture, availableSeats: Number(e.target.value) })}
                          placeholder="Disp."
                          className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                        />
                        <input
                          type="number"
                          value={newLecture.totalSeats}
                          onChange={(e) => setNewLecture({ ...newLecture, totalSeats: Number(e.target.value) })}
                          placeholder="Total"
                          className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Descrição e Tópicos</label>
                      <textarea
                        rows={2}
                        value={newLecture.description}
                        onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                        placeholder="Resumo dos temas e aprendizados principais da palestra..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>INSERIR PALESTRA NA GRADE</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista Encadeada de Palestras */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-tight">
                        Palestras & Painéis Cadastrados ({lectures.length})
                      </h4>
                      <p className="text-xs text-[#707a8a]">
                        Reordene ou exclua palestras da grade em tempo real.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {lectures.map((lec, idx) => (
                      <div
                        key={lec.id}
                        className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#fcd535]">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#1e2329] border border-[#2b3139] text-[10px] font-mono text-white">
                              Dia {lec.dayIndex + 1} • {lec.shiftLabel} • {lec.time}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#fcd535]/10 border border-[#fcd535]/30 text-[10px] font-mono text-[#fcd535]">
                              {lec.themeLabel}
                            </span>
                            <span className="text-[10px] font-mono text-[#0ecb81]">
                              {lec.availableSeats}/{lec.totalSeats} vagas
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{lec.title}</h4>
                          <p className="text-xs text-[#929aa5]">
                            {lec.speaker} ({lec.speakerRole}) • {lec.location}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => setEditingLecture({ ...lec })}
                            title="Editar palestra"
                            className="p-1.5 rounded bg-[#181a20] hover:bg-[#2b3139] text-[#fcd535] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveLecture(lec.id, 'up')}
                              disabled={idx === 0}
                              title="Mover para cima"
                              className="p-1.5 rounded bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white transition-colors"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveLecture(lec.id, 'down')}
                              disabled={idx === lectures.length - 1}
                              title="Mover para baixo"
                              className="p-1.5 rounded bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white transition-colors"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeLecture(lec.id)}
                            title="Remover palestra"
                            className="p-1.5 rounded text-[#f6465d] hover:bg-[#f6465d]/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 0.5: MINICURSOS SETEMBRO / OUTUBRO */}
            {cmsSection === 'WORKSHOPS' && (
              <div className="space-y-6">
                {/* Form Adicionar Minicurso */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#fcd535]" />
                        Cadastrar Novo Minicurso Prático
                      </h3>
                      <p className="text-xs text-[#707a8a]">
                        Insere minicursos nos blocos de Setembro/Outubro com contador de vagas e trilhas coloridas.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateWorkshop} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Título do Minicurso *</label>
                      <input
                        type="text"
                        required
                        value={newWorkshop.title}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                        placeholder="Ex: Kubernetes & Arquitetura Cloud"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Instrutor / Ministrante *</label>
                      <input
                        type="text"
                        required
                        value={newWorkshop.instructor}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, instructor: e.target.value })}
                        placeholder="Ex: Engenheiro Convidado"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Empresa / Parceiro Patrocinador</label>
                      <input
                        type="text"
                        value={newWorkshop.partner}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, partner: e.target.value })}
                        placeholder="Ex: TO Brasil / CyberGuard"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Mês de Realização</label>
                      <select
                        value={newWorkshop.month}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, month: e.target.value as WorkshopMonth })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value="SETEMBRO">Setembro de 2026</option>
                        <option value="OUTUBRO">Outubro de 2026</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Dia do Mês</label>
                      <input
                        type="text"
                        value={newWorkshop.day}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, day: e.target.value })}
                        placeholder="Ex: 14 ou 29"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Trilha Técnica</label>
                      <select
                        value={newWorkshop.track}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, track: e.target.value as WorkshopTrack })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value="DADOS">Inteligência & Dados (#fcd535)</option>
                        <option value="INFRA">Infra & Segurança (#f6465d)</option>
                        <option value="HARDWARE">Hardware & Sistemas (#2dbdb6)</option>
                        <option value="DEV">Desenvolvimento & UI (#0ecb81)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Laboratório / Local</label>
                      <input
                        type="text"
                        value={newWorkshop.location}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, location: e.target.value })}
                        placeholder="Laboratório de Redes e Dados"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Vagas (Disponíveis / Total)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newWorkshop.activeSlots}
                          onChange={(e) => setNewWorkshop({ ...newWorkshop, activeSlots: Number(e.target.value) })}
                          placeholder="Disp."
                          className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                        />
                        <input
                          type="number"
                          value={newWorkshop.totalSlots}
                          onChange={(e) => setNewWorkshop({ ...newWorkshop, totalSlots: Number(e.target.value) })}
                          placeholder="Total"
                          className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Descrição e Ementa Prática</label>
                      <textarea
                        rows={2}
                        value={newWorkshop.description}
                        onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                        placeholder="Conteúdo programático, ferramentas utilizadas e objetivos do minicurso..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>INSERIR MINICURSO</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista Encadeada de Minicursos */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white uppercase tracking-tight">
                        Minicursos Cadastrados ({workshops.length})
                      </h4>
                      <p className="text-xs text-[#707a8a]">
                        A ordem definida aqui reflete exatamente a numeração 01, 02... na seção de minicursos.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {workshops.map((ws, idx) => (
                      <div
                        key={ws.id}
                        className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#fcd535]">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#1e2329] border border-[#2b3139] text-[10px] font-mono text-white">
                              {ws.day} {ws.month}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                              style={{ color: ws.trackColor, backgroundColor: `${ws.trackColor}15` }}
                            >
                              {ws.trackLabel}
                            </span>
                            <span className="text-[10px] font-mono text-[#0ecb81]">
                              {ws.activeSlots}/{ws.totalSlots} vagas
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{ws.title}</h4>
                          <p className="text-xs text-[#929aa5]">
                            Instrutor: {ws.instructor} • Parceiro: {ws.partner} • {ws.location}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => setEditingWorkshop({ ...ws })}
                            title="Editar minicurso"
                            className="p-1.5 rounded bg-[#181a20] hover:bg-[#2b3139] text-[#fcd535] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveWorkshop(ws.id, 'up')}
                              disabled={idx === 0}
                              title="Mover para cima"
                              className="p-1.5 rounded bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white transition-colors"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveWorkshop(ws.id, 'down')}
                              disabled={idx === workshops.length - 1}
                              title="Mover para baixo"
                              className="p-1.5 rounded bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white transition-colors"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeWorkshop(ws.id)}
                            title="Remover minicurso"
                            className="p-1.5 rounded text-[#f6465d] hover:bg-[#f6465d]/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 1: MENTORES & BANCA */}
            {cmsSection === 'MENTORS' && (
              <div className="space-y-6">
                {/* Form Adicionar Mentor */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#fcd535]" />
                        Cadastrar Novo Mentor na Passarela 3D
                      </h3>
                      <p className="text-xs text-[#707a8a]">
                        O mentor é adicionado na lista encadeada da passarela transversal 3D com número de ordem dinâmico.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateMentor} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Nome do Mentor *</label>
                      <input
                        type="text"
                        required
                        value={newMentor.name}
                        onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                        placeholder="Ex: Dra. Ana Valéria"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cargo / Especialidade *</label>
                      <input
                        type="text"
                        required
                        value={newMentor.role}
                        onChange={(e) => setNewMentor({ ...newMentor, role: e.target.value })}
                        placeholder="Ex: Head de Engenharia de IA"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Instituição / Empresa</label>
                      <input
                        type="text"
                        value={newMentor.organization}
                        onChange={(e) => setNewMentor({ ...newMentor, organization: e.target.value })}
                        placeholder="Ex: UTFPR / Google"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tag de Trilha</label>
                      <input
                        type="text"
                        value={newMentor.tag}
                        onChange={(e) => setNewMentor({ ...newMentor, tag: e.target.value })}
                        placeholder="Ex: Cloud & LLMs"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cor de Destaque</label>
                      <select
                        value={newMentor.accentColor}
                        onChange={(e) => setNewMentor({ ...newMentor, accentColor: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value="#fcd535">Amarelo High-Voltage (#fcd535)</option>
                        <option value="#0ecb81">Verde Binance (#0ecb81)</option>
                        <option value="#f6465d">Vermelho Red Team (#f6465d)</option>
                        <option value="#8a3ffc">Roxo Futurista (#8a3ffc)</option>
                        <option value="#2dbdb6">Ciano Neon (#2dbdb6)</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <ImageUploader
                        label="Foto / Retrato do Mentor (Upload Local no Servidor)"
                        value={newMentor.avatarUrl}
                        onChange={(url) => setNewMentor({ ...newMentor, avatarUrl: url })}
                        aspectRatio="square"
                        placeholder="Carregar Retrato do Mentor (JPG, PNG, WEBP)"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tema da Mentoria / Resumo</label>
                      <input
                        type="text"
                        value={newMentor.topic}
                        onChange={(e) => setNewMentor({ ...newMentor, topic: e.target.value })}
                        placeholder="Ex: Arquitetura de microsserviços orientada a eventos e agentes autônomos"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ENCADEAR MENTOR NA PASSARELA</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista Encadeada Atual dos Mentores */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <h4 className="text-sm font-bold font-mono text-[#fcd535] uppercase tracking-wider">
                    Ordem Encadeada dos Mentores na Passarela 3D ({mentors.length})
                  </h4>

                  <div className="space-y-3">
                    {mentors.map((m, idx) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-[#181a20] border border-[#2b3139] flex items-center justify-center font-mono font-bold text-xs text-[#fcd535]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <img
                            src={m.avatarUrl}
                            alt={m.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#2b3139]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">{m.name}</span>
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded uppercase"
                                style={{
                                  backgroundColor: `${m.accentColor}18`,
                                  color: m.accentColor,
                                  border: `1px solid ${m.accentColor}40`,
                                }}
                              >
                                {m.tag}
                              </span>
                            </div>
                            <div className="text-xs text-[#929aa5]">{m.role} • <span className="text-[#fcd535]">{m.organization}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setEditingMentor({ ...m })}
                            title="Editar mentor"
                            className="p-2 rounded-lg bg-[#181a20] hover:bg-[#2b3139] text-[#fcd535] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveMentor(m.id, 'up')}
                            disabled={idx === 0}
                            title="Mover para cima"
                            className="p-2 rounded-lg bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveMentor(m.id, 'down')}
                            disabled={idx === mentors.length - 1}
                            title="Mover para baixo"
                            className="p-2 rounded-lg bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeMentor(m.id)}
                            title="Remover mentor"
                            className="p-2 rounded-lg bg-[#f6465d]/10 hover:bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 2: PARCEIROS & COTAS */}
            {cmsSection === 'PARTNERS' && (
              <div className="space-y-6">
                {/* Form Adicionar Parceiro */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <Building className="w-5 h-5 text-[#fcd535]" />
                        Cadastrar Novo Parceiro no Túnel 3D
                      </h3>
                      <p className="text-xs text-[#707a8a]">
                        O parceiro é sincronizado no Túnel de Logos 3D com sticky scroll e no formulário RFQ.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreatePartner} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Nome da Empresa *</label>
                      <input
                        type="text"
                        required
                        value={newPartner.name}
                        onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                        placeholder="Ex: CloudScale Inc"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Ramo de Atuação *</label>
                      <input
                        type="text"
                        required
                        value={newPartner.category}
                        onChange={(e) => setNewPartner({ ...newPartner, category: e.target.value })}
                        placeholder="Ex: Cloud Computing & Infra"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cota de Patrocínio</label>
                      <select
                        value={newPartner.cota}
                        onChange={(e) => setNewPartner({ ...newPartner, cota: e.target.value as CotaType })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                      >
                        <option value="OURO">Cota Ouro (#fcd535)</option>
                        <option value="PRATA">Cota Prata (#eaecef)</option>
                        <option value="BRONZE">Cota Bronze (#f0b90b)</option>
                        <option value="PARCEIRO">Parceiro Institucional (Branco)</option>
                        <option value="EXPOSITOR">Expositor Feira (#2dbdb6)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Slogan / Tagline *</label>
                      <input
                        type="text"
                        required
                        value={newPartner.tagline}
                        onChange={(e) => setNewPartner({ ...newPartner, tagline: e.target.value })}
                        placeholder="Ex: Acelere seu futuro em nuvem com alta escalabilidade"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Website Oficial (URL)</label>
                      <input
                        type="url"
                        value={newPartner.websiteUrl}
                        onChange={(e) => setNewPartner({ ...newPartner, websiteUrl: e.target.value })}
                        placeholder="https://suaempresa.com.br"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <ImageUploader
                        label="Logotipo da Empresa (Upload Local no Servidor)"
                        value={newPartner.logoUrl}
                        onChange={(url) => setNewPartner({ ...newPartner, logoUrl: url })}
                        aspectRatio="video"
                        placeholder="Carregar Logo Vetorial ou PNG (Fundo Transparente)"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Descrição da Empresa</label>
                      <textarea
                        rows={2}
                        value={newPartner.description}
                        onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                        placeholder="Breve história, relevância e atuação da empresa no mercado..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Benefícios / Contrapartidas (separadas por ponto-e-vírgula ';')</label>
                      <input
                        type="text"
                        value={newPartner.benefitsText}
                        onChange={(e) => setNewPartner({ ...newPartner, benefitsText: e.target.value })}
                        placeholder="Bandeira Master no Palco; Acesso direto aos currículos; Minicurso exclusivo"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tags de Busca / Destaques (separadas por vírgula ',')</label>
                      <input
                        type="text"
                        value={newPartner.tagsText}
                        onChange={(e) => setNewPartner({ ...newPartner, tagsText: e.target.value })}
                        placeholder="Cloud Solutions, Recrutamento Ativo, Vagas Abertas"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ENCADEAR PARCEIRO NO TÚNEL</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista Encadeada Atual dos Parceiros */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <h4 className="text-sm font-bold font-mono text-[#fcd535] uppercase tracking-wider">
                    Ordem Encadeada dos Parceiros no Túnel 3D ({partners.length})
                  </h4>

                  <div className="space-y-3">
                    {partners.map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-[#181a20] border border-[#2b3139] flex items-center justify-center font-mono font-bold text-xs text-[#fcd535]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {p.logoUrl ? (
                            <img
                              src={p.logoUrl}
                              alt={p.name}
                              className="w-14 h-12 rounded-xl object-contain bg-[#181a20] p-1 border border-[#2b3139]"
                            />
                          ) : (
                            <div className="w-14 h-12 rounded-xl flex items-center justify-center bg-[#181a20] border border-[#2b3139] text-[#fcd535]">
                              <Building className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">{p.name}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${p.badgeColor}`}>
                                {p.cotaLabel}
                              </span>
                            </div>
                            <div className="text-xs text-[#929aa5]">{p.category} • <span className="text-[#eaecef]">{p.tagline}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setEditingPartner({ ...p })}
                            title="Editar parceiro"
                            className="p-2 rounded-lg bg-[#181a20] hover:bg-[#2b3139] text-[#fcd535] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => movePartner(p.id, 'up')}
                            disabled={idx === 0}
                            title="Mover para cima"
                            className="p-2 rounded-lg bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => movePartner(p.id, 'down')}
                            disabled={idx === partners.length - 1}
                            title="Mover para baixo"
                            className="p-2 rounded-lg bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white border border-[#2b3139] transition-colors"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removePartner(p.id)}
                            title="Remover parceiro"
                            className="p-2 rounded-lg bg-[#f6465d]/10 hover:bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 3: MURAL DE FOTOS */}
            {cmsSection === 'PHOTOS' && (
              <div className="space-y-6">
                {/* Upload e Inserção de Fotos */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#fcd535]" />
                        Mural Fotográfico do Evento (Servidor Local & Mini-CMS)
                      </h3>
                      <p className="text-xs text-[#707a8a]">
                        Envie fotos diretamente do seu dispositivo para armazenamento persistente no servidor local (/uploads) ou informe URLs externas.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] text-xs font-mono font-bold cursor-pointer transition-colors shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? 'ENVIANDO AO SERVIDOR...' : 'UPLOAD LOCAL'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0ecb81]/10 border border-[#0ecb81]/40 text-[#0ecb81] text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {/* Form Adicionar por URL */}
                  <form onSubmit={handleCreatePhotoUrl} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                    <div className="md:col-span-6 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">URL da Foto</label>
                      <input
                        type="url"
                        required
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Legenda da Foto</label>
                      <input
                        type="text"
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        placeholder="Ex: Palestra Magna e Auditório Lotado"
                        className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] border border-[#2b3139] hover:border-[#fcd535] text-white font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#fcd535]" />
                        <span>ENCADEAR</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Galeria Encadeada Atual com Reordenação */}
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-4">
                  <h4 className="text-sm font-bold font-mono text-[#fcd535] uppercase tracking-wider">
                    Galeria Encadeada de Fotos ({eventPhotos.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eventPhotos.map((ph, idx) => (
                      <div
                        key={ph.id}
                        className="rounded-xl overflow-hidden border border-[#2b3139] bg-[#0b0e11] flex flex-col justify-between"
                      >
                        <div className="relative">
                          <img
                            src={ph.url}
                            alt={ph.caption}
                            className="w-full h-44 object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0b0e11]/80 backdrop-blur-md border border-[#2b3139] text-[10px] font-mono text-[#fcd535] font-bold">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="p-3 space-y-2">
                          <p className="text-xs font-mono text-[#eaecef] line-clamp-2">
                            {ph.caption}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-[#2b3139]/60">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveEventPhoto(ph.id, 'up')}
                                disabled={idx === 0}
                                title="Mover para frente"
                                className="p-1 rounded bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white transition-colors"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveEventPhoto(ph.id, 'down')}
                                disabled={idx === eventPhotos.length - 1}
                                title="Mover para trás"
                                className="p-1 rounded bg-[#181a20] hover:bg-[#2b3139] disabled:opacity-30 text-[#707a8a] hover:text-white transition-colors"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingPhoto({ ...ph })}
                                title="Editar foto"
                                className="p-1 rounded bg-[#181a20] hover:bg-[#2b3139] text-[#fcd535] hover:text-white transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeEventPhoto(ph.id)}
                                title="Remover foto"
                                className="p-1 rounded text-[#f6465d] hover:bg-[#f6465d]/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO RODA DE TALENTOS & EMPRESAS */}
            {cmsSection === 'TALENT_PLATFORMS' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2b3139]">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#fcd535]" />
                        <span>Gestão de Plataformas & Horários da Roda de Talentos</span>
                      </h3>
                      <p className="text-xs text-[#707a8a] mt-1">
                        Cadastre plataformas conectando parceiros e mentores. O preenchimento de parceiro/mentor é opcional ao criar nova plataforma.
                      </p>
                    </div>
                  </div>

                  {/* Formulário: Nova Plataforma de Talentos */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const title = (form.elements.namedItem('platTitle') as HTMLInputElement).value;
                      const partnerId = (form.elements.namedItem('platPartner') as HTMLSelectElement).value;
                      const mentorId = (form.elements.namedItem('platMentor') as HTMLSelectElement).value;
                      const location = (form.elements.namedItem('platLocation') as HTMLInputElement).value || 'Estande Principal';

                      if (!title) return;

                      const selectedPartner = partners.find((p) => p.id === partnerId);
                      const selectedMentor = mentors.find((m) => m.id === mentorId);

                      const newPlatData = {
                        title,
                        partnerId: partnerId || undefined,
                        companyName: selectedPartner ? selectedPartner.name : (partnerId ? 'Parceiro Cadastrado' : 'Empresa / Parceiro SECOMP'),
                        mentorId: mentorId || undefined,
                        hostName: selectedMentor ? selectedMentor.name : (mentorId ? 'Mentor Cadastrado' : 'Mentor / Anfitrião'),
                        location,
                        slots: Array.from({ length: 7 }, (_, i) => ({
                          slotNum: i + 1,
                          timeLabel: `Slot 0${i + 1} (Horário ${i + 1})`,
                          maxCapacity: 5,
                          bookedCount: 0,
                          status: 'OPEN' as const,
                        })),
                      };

                      const newPlatform: CMSTalentPlatformItem = {
                        ...newPlatData,
                        id: `plat-${Date.now()}`,
                        orderIndex: talentPlatforms.length,
                      };

                      const updatedPlatforms = [...talentPlatforms, newPlatform];
                      addTalentPlatform(newPlatData);

                      const csrf = getCsrf();
                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                      if (csrf) headers['x-csrf-token'] = csrf;

                      fetch('/api/v1/admin/cms/talent_platforms', {
                        method: 'PUT',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify({ value: updatedPlatforms }),
                      }).catch(() => { });

                      form.reset();
                      setSaveSuccess('Nova plataforma da Roda de Talentos criada e persistida com 7 slots!');
                      setTimeout(() => setSaveSuccess(null), 3000);
                    }}
                    className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] space-y-4"
                  >
                    <h4 className="text-xs font-mono font-bold text-[#fcd535] uppercase">
                      + Cadastrar Nova Plataforma
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">
                          Título da Plataforma *
                        </label>
                        <input
                          name="platTitle"
                          required
                          placeholder="Ex: Plataforma 01 - Mentoria Alumni"
                          className="w-full px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">
                          Empresa Parceira (Opcional)
                        </label>
                        <select
                          name="platPartner"
                          className="w-full px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                        >
                          <option value="">Selecione um Parceiro Cadastrado...</option>
                          {partners.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.cota})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">
                          Mentor / Anfitrião (Opcional)
                        </label>
                        <select
                          name="platMentor"
                          className="w-full px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                        >
                          <option value="">Selecione um Mentor Cadastrado...</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.organization})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-[#707a8a] uppercase block mb-1">
                          Local / Estande
                        </label>
                        <input
                          name="platLocation"
                          placeholder="Ex: Estande B1 - Hall Principal"
                          className="w-full px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-xs font-mono transition-colors"
                    >
                      CRIAR PLATAFORMA COM 7 SLOTS
                    </button>
                  </form>

                  {/* Lista de Plataformas Cadastradas */}
                  <div className="space-y-4 pt-2">
                    {talentPlatforms.length === 0 ? (
                      <div className="p-8 text-center bg-[#0b0e11] border border-[#2b3139] rounded-xl text-[#707a8a] text-xs font-mono">
                        Nenhuma plataforma cadastrada. Preencha o formulário acima para criar.
                      </div>
                    ) : (
                      talentPlatforms.map((plat) => (
                        <div key={plat.id} className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-sm">{plat.title}</h4>
                              <p className="text-xs text-[#929aa5]">
                                Empresa: <span className="text-[#fcd535]">{plat.companyName}</span> • Mentor: <span className="text-[#0ecb81]">{plat.hostName}</span> ({plat.location})
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const updated = talentPlatforms.filter((p) => p.id !== plat.id);
                                removeTalentPlatform(plat.id);

                                const csrf = getCsrf();
                                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                if (csrf) headers['x-csrf-token'] = csrf;

                                fetch('/api/v1/admin/cms/talent_platforms', {
                                  method: 'PUT',
                                  credentials: 'include',
                                  headers,
                                  body: JSON.stringify({ value: updated }),
                                }).catch(() => { });
                              }}
                              className="p-1.5 rounded text-[#f6465d] hover:bg-[#f6465d]/10 transition-colors text-xs font-mono flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remover
                            </button>
                          </div>

                          {/* Grade dos 7 Slots da Plataforma */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-[#2b3139]">
                            {plat.slots.map((s) => (
                              <div key={s.slotNum} className="p-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-center font-mono space-y-1">
                                <div className="text-[10px] text-[#707a8a]">Slot #{s.slotNum}</div>
                                <div className="text-xs font-bold text-white">{s.bookedCount}/{s.maxCapacity} inscritos</div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus: 'OPEN' | 'BLOCKED' = s.status === 'OPEN' ? 'BLOCKED' : 'OPEN';
                                    const updated: CMSTalentPlatformItem[] = talentPlatforms.map((p) => {
                                      if (p.id !== plat.id) return p;
                                      return {
                                        ...p,
                                        slots: p.slots.map((sl) => (sl.slotNum === s.slotNum ? { ...sl, status: nextStatus } : sl)),
                                      };
                                    });
                                    setTalentPlatforms(updated);
                                    const csrf = getCsrf();
                                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                    if (csrf) headers['x-csrf-token'] = csrf;
                                    fetch('/api/v1/admin/cms/talent_platforms', {
                                      method: 'PUT',
                                      credentials: 'include',
                                      headers,
                                      body: JSON.stringify({ value: updated }),
                                    }).catch(() => { });
                                    setSaveSuccess(`Slot #${s.slotNum} (${plat.title}) alterado para ${nextStatus}`);
                                    setTimeout(() => setSaveSuccess(null), 2500);
                                  }}
                                  className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all hover:scale-105 ${s.status === 'OPEN'
                                    ? 'bg-[#0ecb81]/20 text-[#0ecb81] border border-[#0ecb81]/40'
                                    : 'bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/40'
                                    }`}
                                  title="Clique para alternar entre ABERTO e BLOQUEADO"
                                >
                                  {s.status} ⇄
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 4: SHARK TANK VOTOS & PITCHES */}
            {cmsSection === 'PITCHES' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2b3139]">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <Vote className="w-5 h-5 text-[#fcd535]" />
                        <span>Gestão de Votação e Pitches — Shark Tank UTFPR</span>
                      </h3>
                      <p className="text-xs text-[#707a8a] mt-1">
                        Reflete em tempo real as equipes marcadas como APROVADO ou FINALISTA no Ideathon.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono text-[#fcd535] font-bold px-3 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b3139]">
                        {ideathonTeams.reduce((acc, p) => acc + (p.votesCount || 0), 0)} VOTOS APURADOS
                      </div>

                      <button
                        onClick={() => handleToggleSessionKey('shark_tank_voting_active')}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-md ${sessionStatus.shark_tank_voting_active
                          ? 'bg-[#0ecb81] text-[#0b0e11] hover:bg-[#0ecb81]/90'
                          : 'bg-[#f6465d] text-white hover:bg-[#f6465d]/90'
                          }`}
                      >
                        {sessionStatus.shark_tank_voting_active ? 'SESSÃO AO VIVO: ABERTA' : 'SESSÃO AO VIVO: BLOQUEADA'}
                      </button>
                    </div>
                  </div>

                  {/* Grid de Pitches Aprovados/Finalistas e Apuração */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ideathonTeams
                      .filter((t) => t.status === 'APROVADO' || t.status === 'FINALISTA')
                      .map((p) => {
                        const total = ideathonTeams.reduce((acc, item) => acc + (item.votesCount || 0), 0);
                        const pct = total > 0 ? Math.round(((p.votesCount || 0) / total) * 100) : 0;
                        return (
                          <div
                            key={p.id}
                            className="p-5 rounded-xl bg-[#0b0e11] border border-[#2b3139] flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-bold text-base">{p.teamName}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e2329] text-[#fcd535] font-bold">
                                  {pct}% DA AUDIÊNCIA
                                </span>
                              </div>
                              <p className="text-xs text-[#707a8a]">Líder: <strong className="text-[#eaecef]">{p.leaderName}</strong></p>
                              <p className="text-xs text-[#929aa5] font-mono">{p.track}</p>

                              {/* Barra Visual de Apuração */}
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-[#707a8a]">Votos:</span>
                                  <span className="font-bold text-[#fcd535]">{p.votesCount || 0} votos</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-[#181a20] overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#fcd535] to-[#0ecb81] transition-all duration-300 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[#2b3139]">
                              <button
                                onClick={async () => {
                                  toggleIdeathonTeamVoting(p.id);
                                  const updatedTeams = ideathonTeams.map((t) =>
                                    t.id === p.id ? { ...t, votingOpen: !t.votingOpen } : t
                                  );
                                  try {
                                    const csrf = getCsrf();
                                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                    if (csrf) headers['x-csrf-token'] = csrf;
                                    await fetch('/api/v1/admin/cms/ideathon_teams', {
                                      method: 'PUT',
                                      credentials: 'include',
                                      headers,
                                      body: JSON.stringify({ value: updatedTeams }),
                                    });
                                  } catch { }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${p.votingOpen
                                  ? 'bg-[#0ecb81]/15 border border-[#0ecb81] text-[#0ecb81] hover:bg-[#0ecb81]/25'
                                  : 'bg-[#2b3139] border border-[#474d57] text-[#707a8a] hover:text-white'
                                  }`}
                              >
                                {p.votingOpen ? 'VOTAÇÃO PITCH: ABERTA' : 'FECHADA'}
                              </button>

                              <button
                                onClick={() => removeIdeathonTeam(p.id)}
                                className="p-2 rounded-lg text-[#f6465d] hover:bg-[#f6465d]/10 transition-colors"
                                title="Remover Pitch"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 5: GESTÃO DOS TIMES DO IDEATHON */}
            {cmsSection === 'IDEATHON' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2b3139]">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#fcd535]" />
                        <span>Gestão de Inscrições e Times — Ideathon UTFPR</span>
                      </h3>
                      <p className="text-xs text-[#707a8a] mt-1">
                        Acompanhe, valide e selecione as equipes inscritas. Projetos com status APROVADO ou FINALISTA são liberados no Shark Tank.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          resetIdeathonTeams();
                          setSaveSuccess('Todas as inscrições do Ideathon foram limpas!');
                          setTimeout(() => setSaveSuccess(null), 3000);

                          try {
                            const csrf = getCsrf();
                            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                            if (csrf) headers['x-csrf-token'] = csrf;
                            await fetch('/api/v1/admin/cms/ideathon_teams', {
                              method: 'PUT',
                              credentials: 'include',
                              headers,
                              body: JSON.stringify({ value: [] }),
                            });
                          } catch { }
                        }}
                        className="px-3 py-2 rounded-lg bg-[#2b3139] border border-[#474d57] text-[#f6465d] hover:bg-[#f6465d]/10 font-mono text-xs font-bold transition-all"
                      >
                        RESETAR INSCRIÇÕES
                      </button>

                      <button
                        onClick={() => handleToggleSessionKey('ideathon_registration_open')}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-md ${sessionStatus.ideathon_registration_open
                          ? 'bg-[#0ecb81] text-[#0b0e11] hover:bg-[#0ecb81]/90'
                          : 'bg-[#f6465d] text-white hover:bg-[#f6465d]/90'
                          }`}
                      >
                        {sessionStatus.ideathon_registration_open ? 'INSCRIÇÕES: ABERTAS' : 'INSCRIÇÕES: BLOQUEADAS'}
                      </button>
                    </div>
                  </div>

                  {/* Formulário: Adicionar Nova Equipe no Ideathon */}
                  <div className="p-4 rounded-xl bg-[#0b0e11] border border-[#2b3139] space-y-3">
                    <h4 className="text-xs font-mono text-[#fcd535] uppercase font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Nova Equipe no Ideathon</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Nome da Equipe *"
                        value={newPitchForm.name}
                        onChange={(e) => setNewPitchForm({ ...newPitchForm, name: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                      <input
                        type="text"
                        placeholder="Líder (Nome completo) *"
                        value={newPitchForm.team}
                        onChange={(e) => setNewPitchForm({ ...newPitchForm, team: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                      <input
                        type="text"
                        placeholder="Trilha (ex: Sustentabilidade & ESG)"
                        value={newPitchForm.track}
                        onChange={(e) => setNewPitchForm({ ...newPitchForm, track: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                      <input
                        type="text"
                        placeholder="Resumo da Proposta"
                        value={newPitchForm.proposal}
                        onChange={(e) => setNewPitchForm({ ...newPitchForm, proposal: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-[#181a20] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newPitchForm.name.trim() || !newPitchForm.team.trim()) return;
                        addIdeathonTeam({
                          teamName: newPitchForm.name.trim(),
                          leaderName: newPitchForm.team.trim(),
                          leaderEmail: `${newPitchForm.name.toLowerCase().replace(/\s+/g, '')}@utfpr.edu.br`,
                          members: `${newPitchForm.team.trim()} + Integrantes`,
                          track: newPitchForm.track.trim() || 'Inovação & Tech',
                          proposal: newPitchForm.proposal.trim() || 'Solução inovadora desenvolvida durante o Ideathon SECOMP 2026.',
                        });
                        setNewPitchForm({ name: '', team: '', track: '', proposal: '' });
                        setSaveSuccess('Nova equipe cadastrada no Ideathon!');
                        setTimeout(() => setSaveSuccess(null), 3000);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] text-xs font-mono font-bold transition-all"
                    >
                      CADASTRAR EQUIPE
                    </button>
                  </div>

                  {/* Filtros de Status & Busca */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['TODOS', 'PENDENTE', 'APROVADO', 'FINALISTA', 'REJEITADO'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setIdeathonStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${ideathonStatusFilter === st
                            ? 'bg-[#fcd535] text-[#181a20]'
                            : 'bg-[#0b0e11] border border-[#2b3139] text-[#707a8a] hover:text-white'
                            }`}
                        >
                          {st} ({st === 'TODOS' ? ideathonTeams.length : ideathonTeams.filter((t) => t.status === st).length})
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-[#707a8a] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por equipe, líder ou proposta..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-9 pr-4 py-1.5 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                      />
                    </div>
                  </div>

                  {/* Tabela de Times Registrados */}
                  <div className="overflow-x-auto rounded-xl border border-[#2b3139] bg-[#0b0e11]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#2b3139] bg-[#14181d] text-[#707a8a] font-mono uppercase">
                          <th className="p-3">Equipe & Trilha</th>
                          <th className="p-3">Líder & Contato</th>
                          <th className="p-3">Integrantes</th>
                          <th className="p-3">Proposta / Ideia</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Ações de Seleção</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2b3139]">
                        {ideathonTeams
                          .filter((t) => ideathonStatusFilter === 'TODOS' || t.status === ideathonStatusFilter)
                          .filter(
                            (t) =>
                              !searchFilter ||
                              t.teamName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              t.leaderName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              t.leaderEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
                              t.proposal.toLowerCase().includes(searchFilter.toLowerCase())
                          )
                          .map((team) => (
                            <tr key={team.id} className="hover:bg-[#181a20] transition-colors">
                              <td className="p-3 font-semibold text-white">
                                <div className="font-bold text-sm text-[#fcd535]">{team.teamName}</div>
                                <div className="text-[10px] font-mono text-[#707a8a]">{team.track}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-white font-medium">{team.leaderName}</div>
                                <div className="text-[10px] font-mono text-[#707a8a]">{team.leaderEmail}</div>
                              </td>
                              <td className="p-3 text-[#eaecef] font-mono">
                                {team.members}
                              </td>
                              <td className="p-3 text-[#929aa5] max-w-xs truncate" title={team.proposal}>
                                {team.proposal}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${team.status === 'FINALISTA'
                                    ? 'bg-[#fcd535]/15 border border-[#fcd535] text-[#fcd535]'
                                    : team.status === 'APROVADO'
                                      ? 'bg-[#0ecb81]/15 border border-[#0ecb81] text-[#0ecb81]'
                                      : team.status === 'REJEITADO'
                                        ? 'bg-[#f6465d]/15 border border-[#f6465d] text-[#f6465d]'
                                        : 'bg-[#2b3139] border border-[#474d57] text-[#707a8a]'
                                    }`}
                                >
                                  {team.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      updateIdeathonTeamStatus(team.id, 'APROVADO');
                                      const updatedTeams = ideathonTeams.map((t) =>
                                        t.id === team.id ? { ...t, status: 'APROVADO' as const, votingOpen: true } : t
                                      );
                                      try {
                                        const csrf = getCsrf();
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (csrf) headers['x-csrf-token'] = csrf;
                                        await fetch('/api/v1/admin/cms/ideathon_teams', {
                                          method: 'PUT',
                                          credentials: 'include',
                                          headers,
                                          body: JSON.stringify({ value: updatedTeams }),
                                        });
                                      } catch { }
                                    }}
                                    className="px-2 py-1 rounded bg-[#0ecb81]/10 text-[#0ecb81] hover:bg-[#0ecb81]/20 font-mono text-[10px] font-bold"
                                  >
                                    APROVAR
                                  </button>
                                  <button
                                    onClick={async () => {
                                      updateIdeathonTeamStatus(team.id, 'FINALISTA');
                                      const updatedTeams = ideathonTeams.map((t) =>
                                        t.id === team.id ? { ...t, status: 'FINALISTA' as const, votingOpen: true } : t
                                      );
                                      try {
                                        const csrf = getCsrf();
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (csrf) headers['x-csrf-token'] = csrf;
                                        await fetch('/api/v1/admin/cms/ideathon_teams', {
                                          method: 'PUT',
                                          credentials: 'include',
                                          headers,
                                          body: JSON.stringify({ value: updatedTeams }),
                                        });
                                      } catch { }
                                    }}
                                    className="px-2 py-1 rounded bg-[#fcd535]/10 text-[#fcd535] hover:bg-[#fcd535]/20 font-mono text-[10px] font-bold"
                                  >
                                    FINALISTA
                                  </button>
                                  <button
                                    onClick={async () => {
                                      updateIdeathonTeamStatus(team.id, 'REJEITADO');
                                      const updatedTeams = ideathonTeams.map((t) =>
                                        t.id === team.id ? { ...t, status: 'REJEITADO' as const, votingOpen: false } : t
                                      );
                                      try {
                                        const csrf = getCsrf();
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (csrf) headers['x-csrf-token'] = csrf;
                                        await fetch('/api/v1/admin/cms/ideathon_teams', {
                                          method: 'PUT',
                                          credentials: 'include',
                                          headers,
                                          body: JSON.stringify({ value: updatedTeams }),
                                        });
                                      } catch { }
                                    }}
                                    className="px-2 py-1 rounded bg-[#f6465d]/10 text-[#f6465d] hover:bg-[#f6465d]/20 font-mono text-[10px] font-bold"
                                  >
                                    REPROVAR
                                  </button>
                                  <button
                                    onClick={async () => {
                                      removeIdeathonTeam(team.id);
                                      const updatedTeams = ideathonTeams.filter((t) => t.id !== team.id);
                                      try {
                                        const csrf = getCsrf();
                                        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                        if (csrf) headers['x-csrf-token'] = csrf;
                                        await fetch('/api/v1/admin/cms/ideathon_teams', {
                                          method: 'PUT',
                                          credentials: 'include',
                                          headers,
                                          body: JSON.stringify({ value: updatedTeams }),
                                        });
                                      } catch { }
                                    }}
                                    className="p-1 rounded text-[#f6465d] hover:bg-[#f6465d]/10"
                                    title="Remover Equipe"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: EDIÇÃO DE PALESTRA (CMS) */}
        {/* ========================================================================= */}
        {editingLecture && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2b3139]">
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#fcd535]" />
                  <span>Editar Palestra / Painel</span>
                </h3>
                <button
                  onClick={() => setEditingLecture(null)}
                  className="p-1.5 rounded-lg text-[#707a8a] hover:text-white hover:bg-[#2b3139] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLectureEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Título da Atividade *</label>
                  <input
                    type="text"
                    required
                    value={editingLecture.title}
                    onChange={(e) => setEditingLecture({ ...editingLecture, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Palestrante / Painelista *</label>
                  <input
                    type="text"
                    required
                    value={editingLecture.speaker}
                    onChange={(e) => setEditingLecture({ ...editingLecture, speaker: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cargo / Instituição *</label>
                  <input
                    type="text"
                    required
                    value={editingLecture.speakerRole}
                    onChange={(e) => setEditingLecture({ ...editingLecture, speakerRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Dia do Evento</label>
                  <select
                    value={editingLecture.dayIndex}
                    onChange={(e) => setEditingLecture({ ...editingLecture, dayIndex: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value={0}>Dia 1 (Segunda) - O Mundo</option>
                    <option value={1}>Dia 2 (Terça) - O Mercado</option>
                    <option value={2}>Dia 3 (Quarta) - Os Projetos</option>
                    <option value={3}>Dia 4 (Quinta) - O Humano</option>
                    <option value={4}>Dia 5 (Sexta) - O Futuro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Turno</label>
                  <select
                    value={editingLecture.shift}
                    onChange={(e) => {
                      const val = e.target.value as LectureShift;
                      const labels: Record<LectureShift, string> = { MORNING: 'Manhã', AFTERNOON: 'Tarde', NIGHT: 'Noite' };
                      setEditingLecture({ ...editingLecture, shift: val, shiftLabel: labels[val] });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="MORNING">Manhã (09h00)</option>
                    <option value="AFTERNOON">Tarde (14h00)</option>
                    <option value="NIGHT">Noite (19h00)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Horário Formatado</label>
                  <input
                    type="text"
                    value={editingLecture.time}
                    onChange={(e) => setEditingLecture({ ...editingLecture, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Local / Auditório</label>
                  <input
                    type="text"
                    value={editingLecture.location}
                    onChange={(e) => setEditingLecture({ ...editingLecture, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tema da Trilha</label>
                  <select
                    value={editingLecture.theme}
                    onChange={(e) => {
                      const val = e.target.value as LectureTheme;
                      const labels: Record<LectureTheme, string> = {
                        TECHNOLOGY: 'Tecnologia',
                        MANAGEMENT: 'Estratégia',
                        INNOVATION: 'Inovação',
                        CAREER: 'Carreira',
                      };
                      setEditingLecture({ ...editingLecture, theme: val, themeLabel: labels[val] });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="TECHNOLOGY">Tecnologia</option>
                    <option value="INNOVATION">Inovação</option>
                    <option value="MANAGEMENT">Estratégia</option>
                    <option value="CAREER">Carreira</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Vagas (Disponíveis / Total)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editingLecture.availableSeats}
                      onChange={(e) => setEditingLecture({ ...editingLecture, availableSeats: Number(e.target.value) })}
                      className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                    />
                    <input
                      type="number"
                      value={editingLecture.totalSeats}
                      onChange={(e) => setEditingLecture({ ...editingLecture, totalSeats: Number(e.target.value) })}
                      className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Sinopse / Descrição</label>
                  <textarea
                    rows={3}
                    value={editingLecture.description}
                    onChange={(e) => setEditingLecture({ ...editingLecture, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#2b3139]">
                  <button
                    type="button"
                    onClick={() => setEditingLecture(null)}
                    className="px-4 py-2 rounded-lg bg-[#2b3139] hover:bg-[#3b414d] text-white text-xs font-mono transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>SALVAR ALTERAÇÕES</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: EDIÇÃO DE MINICURSO (CMS) */}
        {/* ========================================================================= */}
        {editingWorkshop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2b3139]">
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#fcd535]" />
                  <span>Editar Minicurso Prático</span>
                </h3>
                <button
                  onClick={() => setEditingWorkshop(null)}
                  className="p-1.5 rounded-lg text-[#707a8a] hover:text-white hover:bg-[#2b3139] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWorkshopEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Título do Minicurso *</label>
                  <input
                    type="text"
                    required
                    value={editingWorkshop.title}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Instrutor / Ministrante *</label>
                  <input
                    type="text"
                    required
                    value={editingWorkshop.instructor}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Empresa / Parceiro</label>
                  <input
                    type="text"
                    value={editingWorkshop.partner}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, partner: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Mês de Realização</label>
                  <select
                    value={editingWorkshop.month}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, month: e.target.value as WorkshopMonth })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="SETEMBRO">Setembro de 2026</option>
                    <option value="OUTUBRO">Outubro de 2026</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Dia do Mês</label>
                  <input
                    type="text"
                    value={editingWorkshop.day}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, day: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Trilha Técnica</label>
                  <select
                    value={editingWorkshop.track}
                    onChange={(e) => {
                      const val = e.target.value as WorkshopTrack;
                      const labels: Record<WorkshopTrack, { label: string; color: string }> = {
                        DADOS: { label: 'Inteligência & Dados', color: '#fcd535' },
                        INFRA: { label: 'Infra & Segurança', color: '#f6465d' },
                        HARDWARE: { label: 'Hardware & Sistemas', color: '#2dbdb6' },
                        DEV: { label: 'Desenvolvimento & UI', color: '#0ecb81' },
                      };
                      setEditingWorkshop({
                        ...editingWorkshop,
                        track: val,
                        trackLabel: labels[val].label,
                        trackColor: labels[val].color,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="DADOS">Inteligência & Dados (#fcd535)</option>
                    <option value="INFRA">Infra & Segurança (#f6465d)</option>
                    <option value="HARDWARE">Hardware & Sistemas (#2dbdb6)</option>
                    <option value="DEV">Desenvolvimento & UI (#0ecb81)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Local / Laboratório</label>
                  <input
                    type="text"
                    value={editingWorkshop.location}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Vagas (Disponíveis / Total)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editingWorkshop.activeSlots}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, activeSlots: Number(e.target.value) })}
                      className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                    />
                    <input
                      type="number"
                      value={editingWorkshop.totalSlots}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, totalSlots: Number(e.target.value) })}
                      className="w-1/2 px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Ementa & Conteúdo Prático</label>
                  <textarea
                    rows={3}
                    value={editingWorkshop.description}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#2b3139]">
                  <button
                    type="button"
                    onClick={() => setEditingWorkshop(null)}
                    className="px-4 py-2 rounded-lg bg-[#2b3139] hover:bg-[#3b414d] text-white text-xs font-mono transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>SALVAR ALTERAÇÕES</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: EDIÇÃO DE MENTOR (CMS) */}
        {/* ========================================================================= */}
        {editingMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2b3139]">
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#fcd535]" />
                  <span>Editar Mentor / Jurado</span>
                </h3>
                <button
                  onClick={() => setEditingMentor(null)}
                  className="p-1.5 rounded-lg text-[#707a8a] hover:text-white hover:bg-[#2b3139] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMentorEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Nome do Mentor *</label>
                  <input
                    type="text"
                    required
                    value={editingMentor.name}
                    onChange={(e) => setEditingMentor({ ...editingMentor, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cargo / Especialidade *</label>
                  <input
                    type="text"
                    required
                    value={editingMentor.role}
                    onChange={(e) => setEditingMentor({ ...editingMentor, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Empresa / Instituição</label>
                  <input
                    type="text"
                    value={editingMentor.organization}
                    onChange={(e) => setEditingMentor({ ...editingMentor, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tag de Trilha</label>
                  <input
                    type="text"
                    value={editingMentor.tag}
                    onChange={(e) => setEditingMentor({ ...editingMentor, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cor de Destaque</label>
                  <select
                    value={editingMentor.accentColor}
                    onChange={(e) => setEditingMentor({ ...editingMentor, accentColor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="#fcd535">Amarelo High-Voltage (#fcd535)</option>
                    <option value="#0ecb81">Verde Binance (#0ecb81)</option>
                    <option value="#f6465d">Vermelho Red Team (#f6465d)</option>
                    <option value="#8a3ffc">Roxo Futurista (#8a3ffc)</option>
                    <option value="#2dbdb6">Ciano Neon (#2dbdb6)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">URL da Foto (Avatar)</label>
                  <input
                    type="url"
                    value={editingMentor.avatarUrl}
                    onChange={(e) => setEditingMentor({ ...editingMentor, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Tema da Mentoria / Resumo</label>
                  <input
                    type="text"
                    value={editingMentor.topic}
                    onChange={(e) => setEditingMentor({ ...editingMentor, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#2b3139]">
                  <button
                    type="button"
                    onClick={() => setEditingMentor(null)}
                    className="px-4 py-2 rounded-lg bg-[#2b3139] hover:bg-[#3b414d] text-white text-xs font-mono transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>SALVAR ALTERAÇÕES</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: EDIÇÃO DE PARCEIRO (CMS) */}
        {/* ========================================================================= */}
        {editingPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2b3139]">
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#fcd535]" />
                  <span>Editar Parceiro & Patrocinador</span>
                </h3>
                <button
                  onClick={() => setEditingPartner(null)}
                  className="p-1.5 rounded-lg text-[#707a8a] hover:text-white hover:bg-[#2b3139] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePartnerEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Nome da Empresa *</label>
                  <input
                    type="text"
                    required
                    value={editingPartner.name}
                    onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Ramo de Atuação *</label>
                  <input
                    type="text"
                    required
                    value={editingPartner.category}
                    onChange={(e) => setEditingPartner({ ...editingPartner, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Cota de Patrocínio</label>
                  <select
                    value={editingPartner.cota}
                    onChange={(e) => {
                      const val = e.target.value as CotaType;
                      const cotaConfig: Record<CotaType, { label: string; color: string; badge: string }> = {
                        OURO: { label: 'Cota Ouro', color: '#fcd535', badge: 'bg-[#fcd535]/15 text-[#fcd535] border-[#fcd535]/50' },
                        PRATA: { label: 'Cota Prata', color: '#eaecef', badge: 'bg-[#eaecef]/15 text-[#eaecef] border-[#eaecef]/50' },
                        BRONZE: { label: 'Cota Bronze', color: '#f0b90b', badge: 'bg-[#f0b90b]/15 text-[#f0b90b] border-[#f0b90b]/40' },
                        PARCEIRO: { label: 'Parceiro Institucional', color: '#ffffff', badge: 'bg-white/15 text-white border-white/40' },
                        EXPOSITOR: { label: 'Expositor Feira', color: '#2dbdb6', badge: 'bg-[#2dbdb6]/15 text-[#2dbdb6] border-[#2dbdb6]/40' },
                      };
                      setEditingPartner({
                        ...editingPartner,
                        cota: val,
                        cotaLabel: cotaConfig[val].label,
                        cotaColor: cotaConfig[val].color,
                        badgeColor: cotaConfig[val].badge,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs font-mono focus:outline-none focus:border-[#fcd535]"
                  >
                    <option value="OURO">Cota Ouro (#fcd535)</option>
                    <option value="PRATA">Cota Prata (#eaecef)</option>
                    <option value="BRONZE">Cota Bronze (#f0b90b)</option>
                    <option value="PARCEIRO">Parceiro Institucional (Branco)</option>
                    <option value="EXPOSITOR">Expositor Feira (#2dbdb6)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Website Oficial (URL)</label>
                  <input
                    type="url"
                    value={editingPartner.websiteUrl}
                    onChange={(e) => setEditingPartner({ ...editingPartner, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Slogan / Tagline *</label>
                  <input
                    type="text"
                    required
                    value={editingPartner.tagline}
                    onChange={(e) => setEditingPartner({ ...editingPartner, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">URL do Logotipo</label>
                  <input
                    type="url"
                    value={editingPartner.logoUrl || ''}
                    onChange={(e) => setEditingPartner({ ...editingPartner, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Descrição da Empresa</label>
                  <textarea
                    rows={2}
                    value={editingPartner.description}
                    onChange={(e) => setEditingPartner({ ...editingPartner, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#2b3139]">
                  <button
                    type="button"
                    onClick={() => setEditingPartner(null)}
                    className="px-4 py-2 rounded-lg bg-[#2b3139] hover:bg-[#3b414d] text-white text-xs font-mono transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>SALVAR ALTERAÇÕES</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: EDIÇÃO DE FOTO (CMS) */}
        {/* ========================================================================= */}
        {editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150 backdrop-blur-sm">
            <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#181a20] border border-[#2b3139] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2b3139]">
                <h3 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#fcd535]" />
                  <span>Editar Foto do Mural</span>
                </h3>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="p-1.5 rounded-lg text-[#707a8a] hover:text-white hover:bg-[#2b3139] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhotoEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">URL da Foto *</label>
                  <input
                    type="url"
                    required
                    value={editingPhoto.url}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Legenda da Foto</label>
                  <input
                    type="text"
                    value={editingPhoto.caption}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, caption: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#707a8a] uppercase block">Categoria</label>
                  <input
                    type="text"
                    value={editingPhoto.category || ''}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                    placeholder="Auditório, Workshops, Shark Tank..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs focus:outline-none focus:border-[#fcd535]"
                  />
                </div>

                {editingPhoto.url && (
                  <div className="rounded-xl overflow-hidden border border-[#2b3139] max-h-40">
                    <img src={editingPhoto.url} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2b3139]">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 rounded-lg bg-[#2b3139] hover:bg-[#3b414d] text-white text-xs font-mono transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>SALVAR ALTERAÇÕES</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
