import { useState, useEffect } from 'react';
import { Mail, Edit2, Save, X, Briefcase, Star, Camera } from 'lucide-react';
import { supabase, Profile as ProfileType } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

export default function Profile({ userId }: { userId?: string }) {
  const { user, profile: currentProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const profileId = userId || user?.id;
  const isOwnProfile = profileId === user?.id;

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setCollegeName(data.college_name);
        setSkills(data.skills.join(', '));
        setInterests(data.interests.join(', '));
        if (data.profile_photo_url) {
          setPhotoPreview(data.profile_photo_url);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: photoUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPhotoPreview(photoUrl);
      setProfile(prev => prev ? { ...prev, profile_photo_url: photoUrl } : null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          college_name: collegeName,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          interests: interests.split(',').map(s => s.trim()).filter(Boolean),
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl p-10 border border-blue-100">
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-start space-x-8">
            <div className="relative group">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={profile.full_name}
                  className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-white shadow-xl">
                  <Camera size={64} className="text-gray-100" />
                </div>
              )}
              {isOwnProfile && isEditing && (
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-110">
                  <Camera size={24} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                  {profile.college_name}
                </div>
              </div>
              <p className="text-gray-600">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="space-y-6 border-t border-blue-200 pt-8">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">College Name</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Skills (comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Interests (comma-separated)</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:bg-gray-50"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-8 border-t border-blue-200 pt-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase size={22} className="text-blue-600" />
                </div>
                <span>Skills</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile?.skills.length > 0 ? (
                  profile?.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-amber-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star size={22} className="text-amber-600" />
                </div>
                <span>Interests</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.interests.length > 0 ? (
                  profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 shadow-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests added</p>
                )}
              </div>
            </div>

            {!isOwnProfile && (
              <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                <Mail size={20} />
                <span>Send Message</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
