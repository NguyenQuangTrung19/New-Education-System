
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { 
  User as UserIcon, Mail, Phone, MapPin, Camera, Lock, 
  Shield, Check, X, Save, Edit2, AlertCircle 
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '0901234567', // Mock default if missing
    address: '123 Education St, Knowledge City', // Mock default
    bio: 'Dedicated educator committed to student success.',
  });

  // Avatar Handling
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitialSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityModalOpen(true);
    setError('');
    setPasswordInput('');
  };

  const handleFinalSave = () => {
    // Mock password check
    if (passwordInput === 'password') {
      const updatedUser: User = {
        ...user,
        name: formData.name,
        email: formData.email,
        avatarUrl: avatarPreview
      };
      onUpdateUser(updatedUser);
      setSecurityModalOpen(false);
      setIsEditing(false);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const roleColor = user.role === UserRole.ADMIN ? 'bg-indigo-600' : 
                    user.role === UserRole.TEACHER ? 'bg-emerald-600' : 'bg-blue-600';

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h2>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-24 ${roleColor} opacity-10`}></div>
            
            <div className="relative mt-4 mb-4 group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2 ${roleColor.replace('bg-', 'text-')} bg-opacity-10 bg-gray-100`}>
              {user.role}
            </span>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full py-2.5 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Security Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Shield className="w-5 h-5 text-indigo-500" /> Security Status
             </h4>
             <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-600">Password Strength</span>
                   <span className="text-emerald-600 font-bold">Strong</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                   <div className="bg-emerald-500 h-1.5 rounded-full w-3/4"></div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2">
                   <span className="text-gray-600">2FA Authentication</span>
                   <span className="text-gray-400 font-medium">Disabled</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Details Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleInitialSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 text-lg">Personal Information</h3>
               {isEditing && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Editing Mode</span>}
            </div>
            
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                     <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="tel" 
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                     <textarea 
                        disabled={!isEditing}
                        rows={4}
                        className={`w-full p-4 rounded-xl border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white' : 'border-transparent bg-gray-50 text-gray-600'}`}
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                     />
                  </div>
               </div>
            </div>

            {isEditing && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => {
                     setIsEditing(false);
                     setAvatarPreview(user.avatarUrl); // Reset avatar
                     setFormData({...formData, name: user.name, email: user.email}); // Reset form
                   }}
                   className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center"
                 >
                   <Save className="w-4 h-4 mr-2" /> Save Changes
                 </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Security Check Modal */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-amber-600" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">Security Check</h3>
                 <p className="text-gray-500 mt-2">Please enter your password to confirm these changes.</p>
              </div>

              <div className="space-y-4">
                 <div>
                    <input 
                      type="password"
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFinalSave()}
                    />
                    {error && (
                      <div className="flex items-center text-red-500 text-sm mt-2">
                        <AlertCircle className="w-4 h-4 mr-1" /> {error}
                      </div>
                    )}
                 </div>
                 
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setSecurityModalOpen(false)}
                      className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleFinalSave}
                      className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition-colors"
                    >
                      Confirm
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
