// Mock данные для тестирования приложения без backend
import { User, Internship, StudentProfile, EmployerProfile } from '../types';

// Mock пользователи
const mockUsers: Record<string, { user: User; password: string }> = {
  'student@test.com': {
    user: {
      id: 1,
      email: 'student@test.com',
      role: 'student',
      isActive: true,
      dateJoined: new Date().toISOString(),
    },
    password: '123456',
  },
  'employer@test.com': {
    user: {
      id: 2,
      email: 'employer@test.com',
      role: 'employer',
      isActive: true,
      dateJoined: new Date().toISOString(),
    },
    password: '123456',
  },
};

// Mock стажировки
const mockInternships: Internship[] = [
  {
    id: 1,
    title: 'Frontend Developer стажировка',
    description: 'Отличная возможность изучить React Native и TypeScript в команде опытных разработчиков. Мы предлагаем менторство, реальные проекты и возможность роста.',
    requirements: 'Базовые знания JavaScript, HTML, CSS. Желание изучать React Native. Ответственность и коммуникабельность.',
    skills: ['React Native', 'TypeScript', 'JavaScript', 'Git'],
    format: 'hybrid',
    city: 'Бишкек',
    duration: '3 месяца',
    isPaid: true,
    status: 'active',
    dateCreated: new Date().toISOString(),
    employer: {
      id: 1,
      user: mockUsers['employer@test.com'].user,
      companyName: 'TechCompany KG',
      description: 'Современная IT компания, специализирующаяся на разработке мобильных приложений.',
      city: 'Бишкек',
      website: 'https://techcompany.kg',
      contactInfo: '+996 555 123 456',
      isVerified: true,
    },
  },
  {
    id: 2,
    title: 'Backend Developer стажировка',
    description: 'Изучай Python и Django на реальных проектах. Работай с базами данных, API и микросервисами.',
    requirements: 'Базовые знания программирования. Знание Python будет плюсом. Желание изучать веб-технологии.',
    skills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
    format: 'offline',
    city: 'Бишкек',
    duration: '4 месяца',
    isPaid: false,
    status: 'active',
    dateCreated: new Date().toISOString(),
    employer: {
      id: 2,
      user: mockUsers['employer@test.com'].user,
      companyName: 'StartupHub',
      description: 'Инкубатор стартапов, помогающий молодым предпринимателям воплощать идеи в жизнь.',
      city: 'Бишкек',
      contactInfo: 'info@startuphub.kg',
      isVerified: true,
    },
  },
  {
    id: 3,
    title: 'UI/UX Designer стажировка',
    description: 'Создавай интерфейсы для мобильных приложений и веб-сайтов. Работай с Figma, изучай пользовательский опыт.',
    requirements: 'Креативность, внимание к деталям. Базовые знания дизайна. Знание Figma будет плюсом.',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    format: 'online',
    city: 'Ош',
    duration: '2 месяца',
    isPaid: true,
    status: 'active',
    dateCreated: new Date().toISOString(),
    employer: {
      id: 3,
      user: mockUsers['employer@test.com'].user,
      companyName: 'DesignStudio',
      description: 'Креативная студия дизайна, создающая уникальные пользовательские интерфейсы.',
      city: 'Ош',
      website: 'https://designstudio.kg',
      contactInfo: '+996 777 987 654',
      isVerified: false,
    },
  },
];

// Симуляция задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async login(email: string, password: string) {
    await delay(1000);
    
    const userRecord = mockUsers[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Неверные учетные данные');
    }
    
    return {
      user: userRecord.user,
      access: 'mock-access-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
    };
  },

  async register(email: string, password: string, role: 'student' | 'employer') {
    await delay(1500);
    
    if (mockUsers[email]) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    const newUser: User = {
      id: Date.now(),
      email,
      role,
      isActive: true,
      dateJoined: new Date().toISOString(),
    };
    
    mockUsers[email] = { user: newUser, password };
    
    return {
      user: newUser,
      access: 'mock-access-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
    };
  },

  async getInternships(filters?: any) {
    await delay(800);
    
    let filteredInternships = [...mockInternships];
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredInternships = filteredInternships.filter(
        internship => 
          internship.title.toLowerCase().includes(search) ||
          internship.description.toLowerCase().includes(search) ||
          internship.employer.companyName.toLowerCase().includes(search)
      );
    }
    
    if (filters?.city) {
      filteredInternships = filteredInternships.filter(
        internship => internship.city === filters.city
      );
    }
    
    if (filters?.format) {
      filteredInternships = filteredInternships.filter(
        internship => internship.format === filters.format
      );
    }
    
    if (filters?.isPaid !== undefined) {
      filteredInternships = filteredInternships.filter(
        internship => internship.isPaid === filters.isPaid
      );
    }
    
    return {
      results: filteredInternships,
      count: filteredInternships.length,
    };
  },

  async getInternshipById(id: number) {
    await delay(500);
    
    const internship = mockInternships.find(i => i.id === id);
    if (!internship) {
      throw new Error('Стажировка не найдена');
    }
    
    return internship;
  },

  async getCurrentUser() {
    await delay(300);
    // Возвращаем первого пользователя для демо
    return mockUsers['student@test.com'].user;
  },

  async applyToInternship(internshipId: number, coverLetter: string) {
    await delay(1000);
    
    const internship = mockInternships.find(i => i.id === internshipId);
    if (!internship) {
      throw new Error('Стажировка не найдена');
    }
    
    return {
      id: Date.now(),
      student: {} as StudentProfile,
      internship,
      coverLetter,
      status: 'sent',
      dateApplied: new Date().toISOString(),
    };
  },

  async logout() {
    await delay(500);
    // Для mock API просто возвращаем success
    return { success: true };
  },
};