import { useState } from 'react';
import { getPatientReports } from '../../services/doctorService';
import { Search, FileText, Loader2, AlertCircle, ExternalLink, FolderOpen } from 'lucide-react';

interface Report {
  _id: string;
  fileName: string;
  reportType?: string;
  uploadDate: string;
  fileUrl: string;
}

const PatientReportsPage = () => {
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleLoadReports = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError('');
    setReports([]);
    setSearched(true);

    try {
      const response = await getPatientReports(patientId.trim());
      setReports(response.data || []);
    } catch (err: any) {
      console.error('Error fetching patient reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports. Patient may not exist or service is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');
      `}</style>

      <div className="max-w-6xl mx-auto font-['Nunito',sans-serif]">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <FileText size={28} />
              <div>
                <h1 className="text-2xl font-bold font-['Fredoka_One',cursive]">Patient Reports</h1>
                <p className="text-blue-100 text-sm mt-1">View and access patient medical reports</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6">
            <form onSubmit={handleLoadReports} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter Patient ID"
                  className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Load Reports</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[300px] bg-white rounded-3xl shadow-xl border border-blue-200">
            <Loader2 size={48} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && searched && reports.length === 0 && !error && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <FolderOpen size={48} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Fredoka_One',cursive]">No Reports Found</h3>
            <p className="text-gray-500">No reports found for this patient. Please check the patient ID and try again.</p>
          </div>
        )}

        {/* Reports Grid */}
        {!loading && reports.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                Reports for Patient: <span className="text-blue-600">{patientId}</span>
                <span className="ml-auto text-sm font-normal text-gray-500">({reports.length} report{reports.length !== 1 ? 's' : ''})</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="border border-blue-200 rounded-2xl p-5 bg-gradient-to-br from-blue-50/50 to-white hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-blue-600" />
                      </div>
                      {report.reportType && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {report.reportType}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2" title={report.fileName}>
                      {report.fileName}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={14} className="text-gray-400" />
                        <span>Uploaded: {new Date(report.uploadDate).toLocaleDateString()}</span>
                      </div>
                      {report.reportType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText size={14} className="text-gray-400" />
                          <span>Type: {report.reportType}</span>
                        </div>
                      )}
                    </div>

                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span>View Report</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PatientReportsPage;
