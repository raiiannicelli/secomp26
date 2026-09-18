import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { encryptPII, generateSHA256 } from './cryptoService.js';

export async function seedDatabase() {
  console.log('🌱 [SECOMP 2026] Iniciando Seed do Banco de Dados...');

  // 1. Usuários de Demonstração / Staff
  const adminPasswordHash = await bcrypt.hash('Admin@2026', 10);
  const studentPasswordHash = await bcrypt.hash('Aluno@2026', 10);

  const adminEmail = 'admin@utfpr.edu.br';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'Administrador SECOMP',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      raHash: generateSHA256('adm0001'),
      raEncrypted: encryptPII('adm0001'),
    },
  });

  // Conta Exclusiva Autorizada ao Cockpit /chameguinho
  const raiAdminEmail = 'raimorato@alunos.utfpr.edu.br';
  const raiPasswordHash = await bcrypt.hash('secomp2026##', 10);
  await prisma.user.upsert({
    where: { email: raiAdminEmail },
    update: {
      role: 'ADMIN',
      fullName: 'Rai Moratto',
      passwordHash: raiPasswordHash,
      raHash: generateSHA256('ra2623420'),
      raEncrypted: encryptPII('ra2623420'),
    },
    create: {
      email: raiAdminEmail,
      fullName: 'Rai Moratto',
      passwordHash: raiPasswordHash,
      role: 'ADMIN',
      raHash: generateSHA256('ra2623420'),
      raEncrypted: encryptPII('ra2623420'),
    },
  });

  const studentEmail = 'aluno@alunos.utfpr.edu.br';
  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      fullName: 'Rai Moratto',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      raHash: generateSHA256('a2419876'),
      raEncrypted: encryptPII('a2419876'),
      phoneEncrypted: encryptPII('41998765432'),
    },
  });

  // 2. Grade Narrativa Oficial dos 5 Dias
  const activitiesData = [
    {
      title: 'Abertura Oficial: O Futuro da Computação e Sociedade',
      description: 'Palestra inaugural sobre arquiteturas emergentes e impactos da IA.',
      speakerName: 'Dr. Gustavo Meirelles',
      speakerBio: 'Pesquisador Sênior e Especialista em Engenharia de Software Distribuída.',
      speakerCompany: 'UTFPR / Laboratório de Sistemas',
      turn: 'MORNING' as const,
      theme: 'TECHNOLOGY' as const,
      track: 'DATA_AI' as const,
      dayIndex: 1, // Segunda: O Mundo
      isWarmup: false,
      startsAt: new Date('2026-10-19T08:30:00Z'),
      endsAt: new Date('2026-10-19T10:30:00Z'),
      location: 'Auditório Principal — Câmpus Campo Mourão',
      maxSeats: 250,
    },
    {
      title: 'DevOps & Infraestrutura em Escala: Do Zero ao Kubernetes',
      description: 'Como orquestrar microserviços com resiliência e alta disponibilidade.',
      speakerName: 'Eloah Bueno',
      speakerBio: 'Staff Cloud Architect com mais de 12 anos em computação em nuvem.',
      speakerCompany: 'AWS Community Hero',
      turn: 'NIGHT' as const,
      theme: 'TECHNOLOGY' as const,
      track: 'INFRA_SECURITY' as const,
      dayIndex: 2, // Terça: A Indústria
      isWarmup: false,
      startsAt: new Date('2026-10-20T19:00:00Z'),
      endsAt: new Date('2026-10-20T21:00:00Z'),
      location: 'Auditório Principal',
      maxSeats: 200,
    },
    {
      title: 'Shark Tank UTFPR: Batalha de Pitches Universitários',
      description: 'Apresentação ao vivo das 5 melhores startups para investidores e júri popular.',
      speakerName: 'Cesar Augusto Dias & Painel de Sharks',
      speakerBio: 'Empreendedor serial e Diretor da Incubadora de Inovações Tecnológicas.',
      speakerCompany: 'Incubadora Sprint / UTFPR',
      turn: 'NIGHT' as const,
      theme: 'INNOVATION' as const,
      track: 'GENERAL' as const,
      dayIndex: 3, // Quarta: Os Projetos
      isWarmup: false,
      startsAt: new Date('2026-10-21T19:30:00Z'),
      endsAt: new Date('2026-10-21T22:00:00Z'),
      location: 'Auditório Central — Transmissão ao Vivo',
      maxSeats: 300,
    },
    {
      title: 'Roda de Talentos: Speed Interviews com Big Techs',
      description: 'Entrevistas de 15 minutos com recrutadores e líderes técnicos.',
      speakerName: 'Comitê de Talentos & RHs Parceiros',
      speakerBio: 'Profissionais de Gente & Gestão de multinacionais de tecnologia.',
      speakerCompany: 'Google, AWS, Mercado Livre, Nubank',
      turn: 'AFTERNOON' as const,
      theme: 'CAREER' as const,
      track: 'DEV_UI' as const,
      dayIndex: 4, // Quinta: As Pessoas
      isWarmup: false,
      startsAt: new Date('2026-10-22T14:00:00Z'),
      endsAt: new Date('2026-10-22T18:00:00Z'),
      location: 'Bloco B — Espaço de Carreiras',
      maxSeats: 120,
    },
    {
      title: 'Encerramento: Cerimônia de Premiação e Sorteio Gamer',
      description: 'Revelação dos vencedores do Ideathon e Sorteio da Cadeira Gamer e Periféricos.',
      speakerName: 'Coordenação DACOM & Grêmio Estudantil',
      speakerBio: 'Comissão Organizadora da SECOMP 2026.',
      speakerCompany: 'UTFPR / DACOM',
      turn: 'NIGHT' as const,
      theme: 'MANAGEMENT' as const,
      track: 'GENERAL' as const,
      dayIndex: 5, // Sexta: O Futuro
      isWarmup: false,
      startsAt: new Date('2026-10-23T19:00:00Z'),
      endsAt: new Date('2026-10-23T21:30:00Z'),
      location: 'Auditório Principal',
      maxSeats: 300,
    },
  ];

  for (const act of activitiesData) {
    const existing = await prisma.activity.findFirst({
      where: { title: act.title },
    });
    if (!existing) {
      await prisma.activity.create({ data: act });
    }
  }

  // 3. Minicursos de Warm-up (Setembro e Outubro)
  const warmupWorkshops = [
    {
      title: 'Minicurso: Construindo LLMs e Agentes Autônomos com Python',
      description: 'Capacitação prática em RAG, LangChain e arquiteturas multiagente.',
      speakerName: 'Prof. Marcos Silva',
      speakerBio: 'Doutor em Inteligência Artificial.',
      speakerCompany: 'UTFPR DACOM',
      turn: 'AFTERNOON' as const,
      theme: 'TECHNOLOGY' as const,
      track: 'DATA_AI' as const,
      dayIndex: 1,
      isWarmup: true,
      startsAt: new Date('2026-09-14T14:00:00Z'),
      endsAt: new Date('2026-09-14T17:30:00Z'),
      location: 'Laboratório de Informática 03',
      maxSeats: 35,
    },
    {
      title: 'Minicurso: Hardening e Defesa Cibernética de Servidores Linux',
      description: 'Práticas de contenção de invasões, firewalls e SIEM.',
      speakerName: 'CyberGuard Security Team',
      speakerBio: 'Especialistas em Red Team e Blue Team.',
      speakerCompany: 'CyberGuard Labs',
      turn: 'NIGHT' as const,
      theme: 'TECHNOLOGY' as const,
      track: 'INFRA_SECURITY' as const,
      dayIndex: 2,
      isWarmup: true,
      startsAt: new Date('2026-09-29T19:00:00Z'),
      endsAt: new Date('2026-09-29T22:00:00Z'),
      location: 'Laboratório de Redes',
      maxSeats: 30,
    },
    {
      title: 'Minicurso: Prototipagem de Sensores Conectados com ESP32 e MQTT',
      description: 'Desenvolvimento de sistemas embarcados e automação industrial.',
      speakerName: 'Eng. Leonardo Prado',
      speakerBio: 'Engenheiro de Sistemas Embarcados.',
      speakerCompany: 'IoT Solutions',
      turn: 'AFTERNOON' as const,
      theme: 'INNOVATION' as const,
      track: 'HARDWARE_IOT' as const,
      dayIndex: 3,
      isWarmup: true,
      startsAt: new Date('2026-10-14T14:00:00Z'),
      endsAt: new Date('2026-10-14T17:30:00Z'),
      location: 'Laboratório de Hardware',
      maxSeats: 25,
    },
    {
      title: 'Minicurso: Design Systems Escaláveis com React e Tailwind CSS',
      description: 'Criação de componentes acessíveis e tokens visuais de alta fidelidade.',
      speakerName: 'Mariana Duarte',
      speakerBio: 'Lead Product Designer.',
      speakerCompany: 'FinTech Brasil',
      turn: 'NIGHT' as const,
      theme: 'CAREER' as const,
      track: 'DEV_UI' as const,
      dayIndex: 4,
      isWarmup: true,
      startsAt: new Date('2026-10-29T19:00:00Z'),
      endsAt: new Date('2026-10-29T22:00:00Z'),
      location: 'Laboratório de Informática 01',
      maxSeats: 40,
    },
  ];

  for (const workshop of warmupWorkshops) {
    const existing = await prisma.activity.findFirst({
      where: { title: workshop.title },
    });
    if (!existing) {
      await prisma.activity.create({ data: workshop });
    }
  }

  // 4. Startups Finalistas do Shark Tank UTFPR
  const pitchesData = [
    {
      startupName: 'InovaTech Agro',
      oneLiner: 'Visão computacional embarcada em drones para detecção de pragas em tempo real.',
      teamMembers: 'Carlos Andrade (Eng. Computação), Beatriz Lima (Agronomia)',
      pitchOrder: 1,
      voteCount: 42,
    },
    {
      startupName: 'CyberShield Zero',
      oneLiner: 'Proteção biométrica comportamental contínua para aplicativos bancários.',
      teamMembers: 'Lucas Ferreira, Tiago Rocha (Eng. de Software)',
      pitchOrder: 2,
      voteCount: 38,
    },
    {
      startupName: 'LearnLoop AI',
      oneLiner: 'Tutor de programação adaptativo gerado por IA para cursos de exatas.',
      teamMembers: 'Mariana Costa, Rodrigo Gomes (Ciência da Computação)',
      pitchOrder: 3,
      voteCount: 55,
    },
    {
      startupName: 'EcoTrack IoT',
      oneLiner: 'Rede LoRaWAN de sensores autônomos para telemetria hídrica em bacias urbanas.',
      teamMembers: 'Felipe Neves, Amanda Souza (Eng. Eletrônica)',
      pitchOrder: 4,
      voteCount: 29,
    },
  ];

  for (const pitch of pitchesData) {
    const existing = await prisma.sharkPitch.findFirst({
      where: { startupName: pitch.startupName },
    });
    if (!existing) {
      await prisma.sharkPitch.create({ data: pitch });
    }
  }

  // 5. Slots da Roda de Talentos (Quinta-feira Humana)
  const talentSlotsData = [
    {
      companyName: 'Mercado Livre Tech',
      interviewerName: 'Camila Santos (Tech Recruiter)',
      slotTime: new Date('2026-10-22T14:00:00Z'),
      status: 'AVAILABLE' as const,
    },
    {
      companyName: 'Mercado Livre Tech',
      interviewerName: 'Camila Santos (Tech Recruiter)',
      slotTime: new Date('2026-10-22T14:20:00Z'),
      status: 'AVAILABLE' as const,
    },
    {
      companyName: 'AWS Cloud Brasil',
      interviewerName: 'Fábio Nakamura (Principal Solutions Architect)',
      slotTime: new Date('2026-10-22T14:40:00Z'),
      status: 'AVAILABLE' as const,
    },
    {
      companyName: 'AWS Cloud Brasil',
      interviewerName: 'Fábio Nakamura (Principal Solutions Architect)',
      slotTime: new Date('2026-10-22T15:00:00Z'),
      status: 'AVAILABLE' as const,
    },
    {
      companyName: 'Nubank Engineering',
      interviewerName: 'Larissa Vasconcelos (Engineering Manager)',
      slotTime: new Date('2026-10-22T15:30:00Z'),
      status: 'AVAILABLE' as const,
    },
    {
      companyName: 'Nubank Engineering',
      interviewerName: 'Larissa Vasconcelos (Engineering Manager)',
      slotTime: new Date('2026-10-22T16:00:00Z'),
      status: 'AVAILABLE' as const,
    },
    {
      companyName: 'Sicredi Inovação',
      interviewerName: 'Eduardo Silveira (HR Business Partner)',
      slotTime: new Date('2026-10-22T16:30:00Z'),
      status: 'AVAILABLE' as const,
    },
  ];

  for (const slot of talentSlotsData) {
    const existing = await prisma.talentArenaSlot.findFirst({
      where: {
        companyName: slot.companyName,
        slotTime: slot.slotTime,
      },
    });
    if (!existing) {
      await prisma.talentArenaSlot.create({ data: slot });
    }
  }

  // 6. Carimbos iniciais para o estudante de demonstração
  const firstActivity = await prisma.activity.findFirst();
  if (firstActivity && studentUser) {
    await prisma.attendanceRecord.upsert({
      where: {
        uq_user_activity_attendance: {
          userId: studentUser.id,
          activityId: firstActivity.id,
        },
      },
      update: {},
      create: {
        userId: studentUser.id,
        activityId: firstActivity.id,
        stampType: 'LECTURE',
        pointsAwarded: 1,
      },
    });
  }

  console.log('✅ [SECOMP 2026] Seed concluído com sucesso!');
}

if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .catch((err) => {
      console.error('❌ Erro no seed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

