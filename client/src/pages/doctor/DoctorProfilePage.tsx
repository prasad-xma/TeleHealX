import { useState, useEffect } from 'react';
import { getMyDoctorProfile, createOrUpdateMyProfile } from '../../services/doctorService';
import { User, Mail, Stethoscope, Building, DollarSign, Clock, Globe, Star, Save, Loader2, X, Plus } from 'lucide-react';

const DoctorProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    bio: '',
    hospitalClinic: '',
    yearsOfExperience: '',
    consultationFee: '',
    specialization: '',
  });

  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getMyDoctorProfile();
      const data = response.data;
      setProfile(data);
      setFormData({
        bio: data.bio || '',
        hospitalClinic: data.hospital || '',
        yearsOfExperience: data.yearsOfExperience || '',
        consultationFee: data.consultationFee || '',
        specialization: data.specialization || '',
      });
      setLanguages(data.languages || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleLanguageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setShowSuccess(false);

    try {
      const payload = {
        bio: formData.bio,
        hospital: formData.hospitalClinic,
        yearsOfExperience: Number(formData.yearsOfExperience),
        consultationFee: Number(formData.consultationFee),
        specialization: formData.specialization,
        languages: languages,
      };
      await createOrUpdateMyProfile(payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={18}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');
      `}</style>

      <div className="max-w-3xl mx-auto font-['Nunito',sans-serif]">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold font-['Fredoka_One',cursive]">My Profile</h1>
            <p className="text-blue-100 text-sm mt-1">Manage your doctor profile information</p>
          </div>

          {/* Rating Display */}
          {profile && profile.averageRating && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(profile.averageRating)}
                </div>
                <span className="font-semibold text-gray-800">{profile.averageRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({profile.totalReviews || 0} reviews)</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Toast */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold">Profile saved successfully!</span>
              </div>
            )}

            {/* Full Name (Read-only) */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={user?.name || ''}
                  readOnly
                  className="w-full py-3 pl-10 pr-4 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full py-3 pl-10 pr-4 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Specialization (Read-only if set) */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Specialization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Stethoscope size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="specialization"
                  value={user?.specialization || profile?.specialization || formData.specialization}
                  readOnly={!!user?.specialization}
                  onChange={!user?.specialization ? handleInputChange : undefined}
                  className={`w-full py-3 pl-10 pr-4 border-2 rounded-xl text-sm ${
                    user?.specialization
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                      : 'border-blue-200 bg-white text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  placeholder="Enter your specialization"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell patients about yourself..."
                className="w-full py-3 px-4 border-2 border-blue-200 rounded-xl text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            {/* Hospital / Clinic Name */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Hospital / Clinic Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="hospitalClinic"
                  value={formData.hospitalClinic}
                  onChange={handleInputChange}
                  placeholder="Enter hospital or clinic name"
                  className="w-full py-3 pl-10 pr-4 border-2 border-blue-200 rounded-xl text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Years of Experience</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full py-3 pl-10 pr-4 border-2 border-blue-200 rounded-xl text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Consultation Fee (LKR)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full py-3 pl-10 pr-4 border-2 border-blue-200 rounded-xl text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Languages Spoken */}
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Languages Spoken</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Globe size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={handleLanguageKeyPress}
                  placeholder="Type a language and press Enter"
                  className="w-full py-3 pl-10 pr-12 border-2 border-blue-200 rounded-xl text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-blue-600 hover:text-blue-700"
                >
                  <Plus size={18} />
                </button>
              </div>
              {languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {languages.map((lang) => (
                    <div
                      key={lang}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="hover:text-blue-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DoctorProfilePage;
