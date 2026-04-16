import { useState, useEffect } from 'react';
import { getMyPrescriptions, getPrescriptionById, issuePrescription } from '../../services/doctorService';
import { FileText, Plus, Search, Calendar, User, Pill, Trash2, X, Loader2, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  diagnosis: string;
  notes?: string;
  medications: Medication[];
  issuedDate: string;
  status: 'active' | 'expired';
}

const PrescriptionsPage = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'issue'>('my');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Search/filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Issue prescription form state
  const [issueForm, setIssueForm] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    notes: '',
  });
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await getMyPrescriptions();
      setPrescriptions(response.data || []);
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err);
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionDetails = async (id: string) => {
    try {
      const response = await getPrescriptionById(id);
      setSelectedPrescription(response.data);
      setShowModal(true);
    } catch (err: any) {
      console.error('Error fetching prescription details:', err);
      setError('Failed to load prescription details');
    }
  };

  const handleIssueInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIssueForm(prev => ({ ...prev, [name]: value }));
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Date.now().toString(),
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (medications.length === 0) {
      setError('Please add at least one medication');
      return;
    }

    const invalidMed = medications.find(med => !med.name || !med.dosage);
    if (invalidMed) {
      setError('Please fill in medication name and dosage');
      return;
    }

    setSubmitting(true);
    try {
      await issuePrescription({
        ...issueForm,
        medications,
      });
      setSuccess('Prescription issued successfully!');
      setTimeout(() => {
        setSuccess('');
        setActiveTab('my');
        setIssueForm({ patientId: '', appointmentId: '', diagnosis: '', notes: '' });
        setMedications([]);
        fetchPrescriptions();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(presc => {
    const matchesSearch = searchTerm === '' || 
      presc.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (presc.patientName && presc.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDateFrom = !dateFrom || new Date(presc.issuedDate) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(presc.issuedDate) <= new Date(dateTo);
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
        <Clock size={12} />
        Expired
      </span>
    );
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
                <h1 className="text-2xl font-bold font-['Fredoka_One',cursive]">Prescriptions</h1>
                <p className="text-blue-100 text-sm mt-1">Manage and issue patient prescriptions</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-blue-200">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              My Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('issue')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'issue'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Issue Prescription
            </button>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Tab 1: My Prescriptions */}
        {activeTab === 'my' && (
          <div className="space-y-4">
            {/* Search/Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2.5 border border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2.5 border border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Prescriptions List */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 size={40} className="animate-spin text-blue-600" />
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-semibold">No prescriptions found</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrescriptions.map(presc => (
                  <div
                    key={presc._id}
                    onClick={() => fetchPrescriptionDetails(presc._id)}
                    className="bg-white rounded-2xl shadow-lg border border-blue-200 p-5 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        <span className="font-semibold text-gray-800 text-sm">{presc.patientId}</span>
                      </div>
                      {getStatusBadge(presc.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Pill size={16} className="text-gray-400" />
                        <span className="font-medium">{presc.diagnosis}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{new Date(presc.issuedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {presc.medications.length} medication{presc.medications.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Issue Prescription */}
        {activeTab === 'issue' && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleIssueSubmit} className="space-y-6">
                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Patient ID</label>
                    <input
                      type="text"
                      name="patientId"
                      value={issueForm.patientId}
                      onChange={handleIssueInputChange}
                      required
                      placeholder="Enter patient ID"
                      className="w-full py-3 px-4 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Appointment ID (Optional)</label>
                    <input
                      type="text"
                      name="appointmentId"
                      value={issueForm.appointmentId}
                      onChange={handleIssueInputChange}
                      placeholder="Enter appointment ID"
                      className="w-full py-3 px-4 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Diagnosis</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={issueForm.diagnosis}
                    onChange={handleIssueInputChange}
                    required
                    placeholder="Enter diagnosis"
                    className="w-full py-3 px-4 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={issueForm.notes}
                    onChange={handleIssueInputChange}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full py-3 px-4 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                {/* Medications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Medications</label>
                    <button
                      type="button"
                      onClick={addMedication}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Plus size={16} />
                      Add Medication
                    </button>
                  </div>

                  {medications.length === 0 ? (
                    <p className="text-gray-500 text-sm italic py-4 text-center border-2 border-dashed border-blue-200 rounded-xl">
                      No medications added. Click "Add Medication" to add one.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {medications.map(med => (
                        <div key={med.id} className="border border-blue-200 rounded-xl p-4 bg-blue-50/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-700 text-sm">Medication #{medications.indexOf(med) + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeMedication(med.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-600">Name *</label>
                              <input
                                type="text"
                                value={med.name}
                                onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                placeholder="Medication name"
                                className="w-full py-2 px-3 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-600">Dosage *</label>
                              <input
                                type="text"
                                value={med.dosage}
                                onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                                placeholder="e.g., 500mg"
                                className="w-full py-2 px-3 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-600">Frequency</label>
                              <input
                                type="text"
                                value={med.frequency}
                                onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                                placeholder="e.g., Twice daily"
                                className="w-full py-2 px-3 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-600">Duration</label>
                              <input
                                type="text"
                                value={med.duration}
                                onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                                placeholder="e.g., 7 days"
                                className="w-full py-2 px-3 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium mb-1 text-gray-600">Instructions</label>
                              <input
                                type="text"
                                value={med.instructions}
                                onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                                placeholder="e.g., Take with food"
                                className="w-full py-2 px-3 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      <span>Issuing Prescription...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={22} />
                      <span>Issue Prescription</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Prescription Details Modal */}
        {showModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <h2 className="text-xl font-bold font-['Fredoka_One',cursive]">Prescription Details</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Patient ID</p>
                      <p className="font-semibold text-gray-800">{selectedPrescription.patientId}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                      {getStatusBadge(selectedPrescription.status)}
                    </div>
                  </div>

                  {selectedPrescription.patientName && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Patient Name</p>
                      <p className="font-semibold text-gray-800">{selectedPrescription.patientName}</p>
                    </div>
                  )}

                  {selectedPrescription.appointmentId && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Appointment ID</p>
                      <p className="font-semibold text-gray-800">{selectedPrescription.appointmentId}</p>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Diagnosis</p>
                    <p className="font-semibold text-gray-800">{selectedPrescription.diagnosis}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Issued Date</p>
                    <p className="font-semibold text-gray-800">{new Date(selectedPrescription.issuedDate).toLocaleString()}</p>
                  </div>

                  {selectedPrescription.notes && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                      <p className="font-semibold text-gray-800">{selectedPrescription.notes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Pill size={18} className="text-blue-500" />
                      Medications
                    </h3>
                    <div className="border border-blue-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Dosage</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Frequency</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPrescription.medications.map((med, index) => (
                            <tr key={index} className="border-t border-blue-100">
                              <td className="px-4 py-3 text-sm text-gray-800 font-medium">{med.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{med.dosage}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{med.frequency}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{med.duration}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{med.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PrescriptionsPage;
