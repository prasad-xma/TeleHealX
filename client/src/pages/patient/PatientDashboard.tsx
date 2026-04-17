import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Pill,
  Upload,
  Download,
  Trash2,
  Eye,
  Activity,
  Heart,
  Stethoscope,
  LogOut,
  Settings,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import {
  getMedicalHistory,
  getMedicalReports,
  getPrescriptions,
  deleteMedicalReport,
  downloadMedicalReport
} from '../../services/patientService';
import { analyzeSymptoms, getLatestSymptomResult } from '../../services/aiService';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [medicalReports, setMedicalReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.name || 'Patient';

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMedicalHistory();
    } else if (activeTab === 'reports') {
      fetchMedicalReports();
    } else if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    } else if (activeTab === 'symptom-checker') {
      fetchLatestSymptomResult();
    }
  }, [activeTab]);

  const fetchLatestSymptomResult = async () => {
    const patientId = user?._id || user?.id;

    if (!patientId) {
      return;
    }

    setAiLoading(true);
    try {
      const response = await getLatestSymptomResult(patientId);
      setAiResponse(response.data?.aiResponse || '');
    } catch (fetchError: any) {
      setError(fetchError.response?.data?.message || 'Failed to fetch latest symptom result');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchMedicalHistory = async () => {
    setLoading(true);
    try {
      const response = await getMedicalHistory();
      const records = Array.isArray(response) ? response : (response?.data ?? []);
      setMedicalHistory(records);
    } catch (fetchError: any) {
      setError('Failed to fetch medical history');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalReports = async () => {
    setLoading(true);
    try {
      const response = await getMedicalReports();
      const reports = Array.isArray(response) ? response : (response?.data ?? []);
      setMedicalReports(reports);
    } catch (fetchError: any) {
      setError('Failed to fetch medical reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await getPrescriptions();
      const list = Array.isArray(response) ? response : (response?.data ?? []);
      setPrescriptions(list);
    } catch (fetchError: any) {
      setError('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteMedicalReport(reportId);
        setSuccess('Report deleted successfully');
        fetchMedicalReports();
        setTimeout(() => setSuccess(''), 3000);
      } catch (deleteError: any) {
        setError('Failed to delete report');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleViewReport = async (reportId: string, fileName: string) => {
    try {
      const response = await downloadMedicalReport(reportId);
      const binaryString = atob(response.fileData);
      const bytes = new Uint8Array(binaryString.length);

      for (let index = 0; index < binaryString.length; index += 1) {
        bytes[index] = binaryString.charCodeAt(index);
      }

      const blob = new Blob([bytes], { type: response.mimeType });
      const url = window.URL.createObjectURL(blob);

      if (response.mimeType.startsWith('image/')) {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.fileName || fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.URL.revokeObjectURL(url);
    } catch (viewError: any) {
      setError('Failed to view report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadReport = async (reportId: string, fileName: string) => {
    try {
      const response = await downloadMedicalReport(reportId);
      const binaryString = atob(response.fileData);
      const bytes = new Uint8Array(binaryString.length);

      for (let index = 0; index < binaryString.length; index += 1) {
        bytes[index] = binaryString.charCodeAt(index);
      }

      const blob = new Blob([bytes], { type: response.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.fileName || fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError: any) {
      setError('Failed to download report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSymptomSubmit = async () => {
    setError('');
    setSuccess('');

    if (!symptoms.trim()) {
      setError('Please write your symptoms before submitting.');
      return;
    }

    setAiLoading(true);
    try {
      const response = await analyzeSymptoms({
        symptoms: symptoms.trim(),
        patientId: user?._id || user?.id || null
      });

      setAiResponse(response.data?.aiResponse || 'No response was returned by AI.');
      await fetchLatestSymptomResult();
      setSuccess('Symptoms analyzed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (analysisError: any) {
      setError(analysisError.response?.data?.message || 'Failed to analyze symptoms');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAiLoading(false);
    }
  };

  const activePrescriptions = (Array.isArray(prescriptions) ? prescriptions : []).filter((prescription: any) => prescription.isActive).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');

        :root {
          --patient-bg: #EFF6FF;
          --patient-surface: #F8FAFC;
          --patient-surface-2: #E2E8F0;
          --patient-panel: #FFFFFF;
          --patient-border: #CBD5E1;
          --patient-text: #1E293B;
          --patient-muted: #64748B;
          --patient-primary: #3B82F6;
          --patient-primary-2: #2563EB;
        }

        .patient-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 100%);
          font-family: 'Nunito', sans-serif;
          color: var(--patient-text);
          position: relative;
          overflow: hidden;
        }

        .patient-bg::before {
          content: '';
          position: absolute;
          width: 320px;
          height: 320px;
          top: -90px;
          left: -70px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%);
          pointer-events: none;
        }

        .patient-bg::after {
          content: '';
          position: absolute;
          width: 380px;
          height: 380px;
          right: -80px;
          bottom: -120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%);
          pointer-events: none;
        }

        .patient-shell {
          position: relative;
          z-index: 1;
          max-width: 1540px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .patient-side {
          width: 320px;
          flex: 0 0 320px;
          border-radius: 24px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.15);
          padding: 1.5rem;
          color: #1E293B;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: sticky;
          top: 1.5rem;
          align-self: flex-start;
          min-height: calc(100vh - 3rem);
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .brand-mark {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          display: grid;
          place-items: center;
          color: white;
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
          flex: 0 0 auto;
        }

        .brand-copy {
          display: grid;
          gap: 0.15rem;
        }

        .brand-name {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 900;
          letter-spacing: 0.01em;
          color: #1E293B;
        }

        .brand-subtitle {
          margin: 0;
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .side-panel {
          padding: 1.25rem;
          border-radius: 18px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }

        .side-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          background: #EFF6FF;
          color: #3B82F6;
          font-size: 0.78rem;
          font-weight: 800;
          margin-bottom: 0.8rem;
        }

        .side-panel h2 {
          margin: 0;
          font-size: 1.45rem;
          line-height: 1.15;
          color: #1E293B;
        }

        .side-panel p {
          margin: 0.75rem 0 0;
          color: #64748B;
          font-size: 0.92rem;
          line-height: 1.65;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .metric-card {
          padding: 1rem;
          border-radius: 16px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.06);
        }

        .metric-card span {
          display: block;
          font-size: 0.78rem;
          color: #64748B;
          margin-bottom: 0.35rem;
          font-weight: 700;
        }

        .metric-card strong {
          display: block;
          color: #3B82F6;
          font-size: 1.4rem;
          font-weight: 900;
          line-height: 1;
        }

        .nav-list {
          display: grid;
          gap: 0.55rem;
        }

        .nav-item {
          width: 100%;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          color: #475569;
          padding: 0.95rem 1rem;
          border-radius: 14px;
          cursor: pointer;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 800;
          text-align: left;
        }

        .nav-item:hover {
          transform: translateY(-2px);
          border-color: #3B82F6;
          background: #EFF6FF;
          color: #1E40AF;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.12);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          border-color: #2563EB;
          color: white;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        .nav-label {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .side-footer {
          margin-top: auto;
          display: grid;
          gap: 0.75rem;
          padding-top: 0.35rem;
        }

        .main-panel {
          flex: 1;
          min-width: 0;
          border-radius: 24px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.12);
          padding: 1.75rem;
        }

        .main-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .main-title {
          margin: 0;
          font-size: clamp(1.6rem, 2.5vw, 2.3rem);
          font-weight: 900;
          color: #1E293B;
          letter-spacing: -0.03em;
        }

        .main-subtitle {
          margin: 0.45rem 0 0;
          color: #64748B;
          font-size: 0.96rem;
          font-weight: 600;
          line-height: 1.6;
          max-width: 62ch;
        }

        .header-actions {
          display: flex;
          gap: 0.7rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.8rem;
          border-radius: 999px;
          background: #EFF6FF;
          color: #3B82F6;
          font-size: 0.82rem;
          font-weight: 800;
          border: 1px solid #BFDBFE;
        }

        .alert {
          padding: 1rem 1.05rem;
          border-radius: 18px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .alert-success {
          background: #F0FDF4;
          border: 1px solid #86EFAC;
          color: #166534;
        }

        .alert-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
        }

        .tabs-container {
          display: flex;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
          padding: 0.4rem;
          border-radius: 16px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          overflow-x: auto;
        }

        .tabs-container::-webkit-scrollbar {
          height: 0;
        }

        .tab-btn {
          background: transparent;
          border: 1px solid transparent;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 800;
          color: #475569;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .tab-btn:hover:not(.active) {
          background: #E2E8F0;
          color: #1E293B;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          color: white;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
        }

        .content-stack {
          display: grid;
          gap: 1rem;
        }

        .content-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08);
          border: 1px solid #E2E8F0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #E2E8F0;
          flex-wrap: wrap;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 900;
          color: #1E293B;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }

        .card-subtitle {
          margin: 0.25rem 0 0;
          color: #64748B;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .btn {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          color: white;
          border: none;
          padding: 0.8rem 1.25rem;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
          text-decoration: none;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.3);
        }

        .btn.secondary {
          background: #F1F5F9;
          color: #1E293B;
          border: 1px solid #CBD5E1;
          box-shadow: none;
        }

        .btn.secondary:hover {
          background: #E2E8F0;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .overview-card {
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 1.25rem;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.08);
          position: relative;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .overview-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.12);
        }

        .overview-card::after {
          content: '';
          position: absolute;
          inset: auto -18px -18px auto;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 65%);
          pointer-events: none;
        }

        .overview-icon {
          width: 58px;
          height: 58px;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: white;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
        }

        .overview-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #1E293B;
          margin-bottom: 0.4rem;
        }

        .overview-value {
          font-size: 2rem;
          font-weight: 900;
          color: #3B82F6;
          line-height: 1;
        }

        .overview-meta {
          margin-top: 0.5rem;
          color: #64748B;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .feature-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.25rem;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(59, 130, 246, 0.1);
        }

        .feature-card h3 {
          margin: 0 0 0.35rem;
          font-size: 1rem;
          color: #1E293B;
        }

        .feature-card p {
          margin: 0;
          color: #64748B;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
        }

        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 760px;
        }

        .data-table th {
          background: #F8FAFC;
          padding: 1rem;
          text-align: left;
          font-weight: 800;
          color: #334155;
          border-bottom: 1px solid #E2E8F0;
          white-space: nowrap;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #F1F5F9;
          color: #1E293B;
          vertical-align: top;
        }

        .data-table tr:hover td {
          background: #EFF6FF;
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          color: white;
          white-space: nowrap;
        }

        .status-active {
          background: #0f766e;
          color: white;
        }

        .status-inactive {
          background: #b45309;
          color: white;
        }

        .action-icons {
          display: flex;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .icon-btn {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          transform: translateY(-2px);
          background: #E2E8F0;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
        }

        .icon-btn.delete {
          background: #FEF2F2;
          border-color: #FECACA;
          color: #B91C1C;
        }

        .icon-btn.delete:hover {
          background: #FEE2E2;
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 2.75rem 1.5rem;
          color: #64748B;
        }

        .empty-state h3 {
          margin: 0.9rem 0 0.25rem;
          color: #1E293B;
        }

        .empty-state p,
        .loading {
          margin: 0;
          font-weight: 600;
        }

        .empty-state-icon {
          width: 78px;
          height: 78px;
          background: #E2E8F0;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: #64748B;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        .symptom-textarea {
          width: 100%;
          min-height: 160px;
          border: 2px solid #E2E8F0;
          border-radius: 14px;
          padding: 1rem;
          font-size: 1rem;
          font-family: 'Nunito', sans-serif;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
          background: #F8FAFC;
          color: #1E293B;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .symptom-textarea:focus {
          border-color: #3B82F6;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .ai-response-box {
          margin-top: 1rem;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 14px;
          padding: 1rem;
          white-space: pre-wrap;
          color: #1E293B;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.9fr 0.9fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .profile-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .profile-mini {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 60%, #93C5FD 100%);
          color: white;
          display: grid;
          place-items: center;
          font-weight: 900;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
        }

        .profile-meta {
          display: grid;
          gap: 0.2rem;
        }

        .profile-meta strong {
          font-size: 1rem;
          color: #1E293B;
        }

        .profile-meta span {
          color: #64748b;
          font-size: 0.88rem;
        }

        .compact-card h3 {
          margin: 0 0 0.35rem;
          font-size: 1rem;
          color: #1E293B;
        }

        .compact-card p {
          margin: 0;
          color: #64748B;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        @media (max-width: 1200px) {
          .patient-shell {
            flex-direction: column;
          }

          .patient-side {
            width: 100%;
            flex-basis: auto;
            min-height: auto;
            position: relative;
            top: 0;
          }

          .feature-grid,
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .patient-shell {
            padding: 1rem;
          }

          .patient-side,
          .main-panel {
            padding: 1rem;
            border-radius: 24px;
          }

          .metric-grid {
            grid-template-columns: 1fr 1fr;
          }

          .header-actions {
            justify-content: flex-start;
          }

          .tabs-container {
            padding-bottom: 0.25rem;
          }

          .btn,
          .nav-item {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="patient-bg">
        <div className="patient-shell">
          <aside className="patient-side">
            <div className="brand-row">
              <div className="brand-mark">
                <Heart size={24} />
              </div>
              <div className="brand-copy">
                <p className="brand-name">TeleHealX</p>
                <p className="brand-subtitle">Patient Dashboard</p>
              </div>
            </div>

            <div className="side-panel">
              <div className="side-kicker">
                <Activity size={14} />
                Your health at a glance
              </div>
              <h2>Welcome, {name}</h2>
              <p>Track medical records, reports, prescriptions, and symptom guidance from a calm, readable workspace.</p>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <span>Reports</span>
                <strong>{medicalReports.length}</strong>
              </div>
              <div className="metric-card">
                <span>Records</span>
                <strong>{medicalHistory.length}</strong>
              </div>
              <div className="metric-card">
                <span>Prescriptions</span>
                <strong>{prescriptions.length}</strong>
              </div>
              <div className="metric-card">
                <span>Active</span>
                <strong>{activePrescriptions}</strong>
              </div>
            </div>

            <div className="nav-list">
              <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                <span className="nav-label"><Activity size={18} /> Overview</span>
                <CheckCircle size={16} />
              </button>
              <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                <span className="nav-label"><FileText size={18} /> Medical History</span>
                <Calendar size={16} />
              </button>
              <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                <span className="nav-label"><Upload size={18} /> Medical Reports</span>
                <Download size={16} />
              </button>
              <button className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
                <span className="nav-label"><Pill size={18} /> Prescriptions</span>
                <CheckCircle size={16} />
              </button>
              <button className={`nav-item ${activeTab === 'symptom-checker' ? 'active' : ''}`} onClick={() => setActiveTab('symptom-checker')}>
                <span className="nav-label"><Stethoscope size={18} /> Symptom Checker</span>
                <Heart size={16} />
              </button>
            </div>

            <div className="side-footer">
              <Link to="/appointments" className="btn secondary" style={{ justifyContent: 'center', textDecoration: 'none' }}>
                <Calendar size={18} />
                Create Appointment
              </Link>
              <button className="btn secondary" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>

          <main className="main-panel">
            <div className="main-top">
              <div>
                <h1 className="main-title">Patient Dashboard</h1>
                <p className="main-subtitle">
                  A darker, calmer layout with gray surfaces, soft shadows, and card-based sections for faster scanning.
                </p>
              </div>

              <div className="header-actions">
                <div className="badge-chip"><Calendar size={14} /> Today</div>
                <div className="badge-chip"><Activity size={14} /> Live overview</div>
                <Link to="/profile" className="btn" style={{ textDecoration: 'none' }}>
                  <Settings size={18} />
                  Profile Management
                </Link>
                <button className="btn secondary" onClick={handleLogout}>
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>

            {success ? (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                {success}
              </div>
            ) : null}

            {error ? (
              <div className="alert alert-error">
                <AlertTriangle size={20} />
                {error}
              </div>
            ) : null}

            <div className="tabs-container">
              <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                <Activity size={18} />
                Overview
              </button>
              <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                <FileText size={18} />
                Medical History
              </button>
              <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                <Upload size={18} />
                Medical Reports
              </button>
              <button className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
                <Pill size={18} />
                Prescriptions
              </button>
              <button className={`tab-btn ${activeTab === 'symptom-checker' ? 'active' : ''}`} onClick={() => setActiveTab('symptom-checker')}>
                <Stethoscope size={18} />
                AI Symptom Checker
              </button>
            </div>

            <div className="content-stack">
              {activeTab === 'overview' ? (
                <>
                  <section className="overview-grid">
                    <div className="overview-card">
                      <div className="overview-icon"><FileText size={30} /></div>
                      <div className="overview-title">Medical Records</div>
                      <div className="overview-value">{medicalHistory.length}</div>
                      <div className="overview-meta">Clinical history and visits</div>
                    </div>

                    <div className="overview-card">
                      <div className="overview-icon"><Upload size={30} /></div>
                      <div className="overview-title">Medical Reports</div>
                      <div className="overview-value">{medicalReports.length}</div>
                      <div className="overview-meta">Uploaded scans and results</div>
                    </div>

                    <div className="overview-card">
                      <div className="overview-icon"><Pill size={30} /></div>
                      <div className="overview-title">Active Prescriptions</div>
                      <div className="overview-value">{activePrescriptions}</div>
                      <div className="overview-meta">Valid medication plans</div>
                    </div>

                    <div className="overview-card">
                      <div className="overview-icon"><Heart size={30} /></div>
                      <div className="overview-title">Health Status</div>
                      <div className="overview-value">Good</div>
                      <div className="overview-meta">Based on current dashboard data</div>
                    </div>
                  </section>

                  <section className="feature-grid">
                    <div className="feature-card">
                      <h3>Appointments</h3>
                      <p>Book the next consultation and keep your care schedule organized.</p>
                      <div style={{ marginTop: '0.9rem' }}>
                        <Link to="/appointments" className="btn" style={{ textDecoration: 'none' }}>
                          <Calendar size={18} />
                          Create Appointment
                        </Link>
                      </div>
                    </div>

                    <div className="feature-card">
                      <h3>Reports</h3>
                      <p>Review uploaded reports and keep your medical documents in one place.</p>
                      <div style={{ marginTop: '0.9rem' }}>
                        <button className="btn secondary" onClick={() => setActiveTab('reports')}>
                          <FileText size={18} />
                          Open Reports
                        </button>
                      </div>
                    </div>

                    <div className="feature-card">
                      <h3>Profile</h3>
                      <p>Update personal details with a quick path to profile management.</p>
                      <div style={{ marginTop: '0.9rem' }}>
                        <Link to="/profile" className="btn secondary" style={{ textDecoration: 'none' }}>
                          <Settings size={18} />
                          Manage Profile
                        </Link>
                      </div>
                    </div>
                  </section>

                  <section className="content-card">
                    <div className="card-header">
                      <h2 className="card-title">
                        <Stethoscope size={24} />
                        Recent Activity
                      </h2>
                    </div>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Activity size={40} />
                      </div>
                      <h3>No recent activity</h3>
                      <p>Your medical activities will appear here</p>
                    </div>
                  </section>

                  <section className="profile-grid">
                    <div className="content-card profile-card">
                      <div className="profile-mini">
                        <div className="profile-avatar">{name.charAt(0).toUpperCase()}</div>
                        <div className="profile-meta">
                          <strong>{name}</strong>
                          <span>Patient account profile</span>
                        </div>
                      </div>
                      <Link to="/profile" className="btn secondary" style={{ textDecoration: 'none' }}>
                        <Settings size={18} />
                        Edit Profile
                      </Link>
                    </div>

                    <div className="content-card compact-card">
                      <h3>Appointments</h3>
                      <p>Schedule consultations and keep upcoming visits organized.</p>
                    </div>

                    <div className="content-card compact-card">
                      <h3>Reports</h3>
                      <p>All uploaded reports are shown in a cleaner, easier-to-scan layout.</p>
                    </div>
                  </section>
                </>
              ) : null}

              {activeTab === 'history' ? (
                <section className="content-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title"><FileText size={24} /> Medical History</h2>
                      <p className="card-subtitle">Your previous consultations and clinical notes.</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading">Loading medical history...</div>
                  ) : medicalHistory.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon"><FileText size={40} /></div>
                      <h3>No medical records found</h3>
                      <p>Your medical history will appear here</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Doctor</th>
                            <th>Diagnosis</th>
                            <th>Treatment</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicalHistory.map((record: any) => (
                            <tr key={record._id}>
                              <td>{formatDate(record.visitDate)}</td>
                              <td>{record.doctorId?.name || 'N/A'}</td>
                              <td>{record.diagnosis}</td>
                              <td>{record.treatment}</td>
                              <td><span className="status-badge status-active">Completed</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ) : null}

              {activeTab === 'reports' ? (
                <section className="content-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title"><Upload size={24} /> Medical Reports</h2>
                      <p className="card-subtitle">View, download, or remove reports you uploaded.</p>
                    </div>
                    <div className="header-actions">
                      <Link to="/prescriptions" className="btn secondary" style={{ textDecoration: 'none' }}>
                        <Pill size={18} /> Manage Prescriptions
                      </Link>
                      <Link to="/appointments" className="btn secondary" style={{ textDecoration: 'none' }}>
                        <Calendar size={18} /> Create Appointment
                      </Link>
                      <Link to="/medical-reports" className="btn secondary" style={{ textDecoration: 'none' }}>
                        <FileText size={18} /> Manage Reports
                      </Link>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading">Loading medical reports...</div>
                  ) : medicalReports.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon"><Upload size={40} /></div>
                      <h3>No medical reports found</h3>
                      <p>Upload your medical reports to get started</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>File Size</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicalReports.map((report: any) => (
                            <tr key={report._id}>
                              <td>{formatDate(report.uploadDate)}</td>
                              <td>{report.title}</td>
                              <td>{report.reportType}</td>
                              <td>{(report.fileSize / 1024).toFixed(1)} KB</td>
                              <td>
                                <div className="action-icons">
                                  <button className="icon-btn" onClick={() => handleViewReport(report._id, report.fileName)}>
                                    <Eye size={16} />
                                  </button>
                                  <button className="icon-btn" onClick={() => handleDownloadReport(report._id, report.fileName)}>
                                    <Download size={16} />
                                  </button>
                                  <button className="icon-btn delete" onClick={() => handleDeleteReport(report._id)}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ) : null}

              {activeTab === 'prescriptions' ? (
                <section className="content-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title"><Pill size={24} /> Prescriptions</h2>
                      <p className="card-subtitle">Current medication lists and validity windows.</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loading">Loading prescriptions...</div>
                  ) : prescriptions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon"><Pill size={40} /></div>
                      <h3>No prescriptions found</h3>
                      <p>Your prescriptions will appear here</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Doctor</th>
                            <th>Diagnosis</th>
                            <th>Medications</th>
                            <th>Status</th>
                            <th>Valid Until</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions.map((prescription: any) => (
                            <tr key={prescription._id}>
                              <td>{formatDate(prescription.prescribedDate)}</td>
                              <td>{prescription.doctorId?.name || 'N/A'}</td>
                              <td>{prescription.diagnosis}</td>
                              <td>
                                {prescription.medications.map((med: any, index: number) => (
                                  <div key={index}>{med.name} - {med.dosage}</div>
                                ))}
                              </td>
                              <td>
                                <span className={`status-badge ${prescription.isActive ? 'status-active' : 'status-inactive'}`}>
                                  {prescription.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                {(() => {
                                  // Try validUntil first
                                  if (prescription.validUntil) {
                                    const date = new Date(prescription.validUntil);
                                    if (!isNaN(date.getTime())) {
                                      return date.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      });
                                    }
                                  }
                                  // Fall back to first medication's endDate
                                  if (prescription.medications?.[0]?.endDate) {
                                    const date = new Date(prescription.medications[0].endDate);
                                    if (!isNaN(date.getTime())) {
                                      return date.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      });
                                    }
                                  }
                                  return 'N/A';
                                })()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ) : null}

              {activeTab === 'symptom-checker' ? (
                <section className="content-card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title"><Stethoscope size={24} /> AI Symptom Checker</h2>
                      <p className="card-subtitle">Describe symptoms for a quick AI triage response.</p>
                    </div>
                  </div>

                  <p style={{ marginTop: 0, color: '#64748b', fontWeight: 600 }}>
                    Describe your symptoms and submit to get an AI-generated triage response.
                  </p>

                  <textarea
                    className="symptom-textarea"
                    value={symptoms}
                    onChange={(event) => setSymptoms(event.target.value)}
                    placeholder="Example: I have fever, sore throat, cough, and body pain for 2 days."
                  />

                  <button className="btn" onClick={handleSymptomSubmit} disabled={aiLoading} style={{ marginTop: '1rem', opacity: aiLoading ? 0.7 : 1, cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
                    <Stethoscope size={18} />
                    {aiLoading ? 'Analyzing...' : 'Submit Symptoms'}
                  </button>

                  {aiResponse ? <div className="ai-response-box">{aiResponse}</div> : null}
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
