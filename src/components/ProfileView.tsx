import { Kit, UserProfile } from '../types';
import { Download, Edit3, Save, CheckCircle, Sliders, ExternalLink, ShieldCheck, Mail, Upload, Sun, Moon, Trash2 } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { apiDeleteSoundKit } from '../utils/soundKitService';

interface ProfileViewProps {
  profile: UserProfile;
  purchasedKits: Kit[];
  creatorKits: Kit[];
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectKit: (id: string) => void;
  onShowNotification: (text: string) => void;
  onDeleteKit?: (id: string) => void;
}

export default function ProfileView({
  profile,
  purchasedKits,
  creatorKits,
  onUpdateProfile,
  onSelectKit,
  onShowNotification,
  onDeleteKit,
}: ProfileViewProps) {
  const { theme, setTheme } = useTheme();

  // Tabs "My Kits" | "For Sale" | "Settings"
  const [activeTab, setActiveTab] = useState<'my_kits' | 'for_sale' | 'settings'>('my_kits');
  
  // Profile editing mode states
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);

  // Settings configs states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [currency, setCurrency] = useState('USD');

  // Asset downloader state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Drag and drop / local file upload state and handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startEditing = () => {
    setUsername(profile.name);
    setLocation(profile.location);
    setBio(profile.bio);
    setAvatar(profile.avatar);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setUsername(profile.name);
    setLocation(profile.location);
    setBio(profile.bio);
    setAvatar(profile.avatar);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowNotification('Image size must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          onShowNotification('New profile photo prepared. Click "Save Info" to apply.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onShowNotification('Please drop an image file (PNG/JPG)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        onShowNotification('Image size must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          onShowNotification('New profile photo prepared. Click "Save Info" to apply.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      onShowNotification('Preencha o campo de nome de exibição.');
      return;
    }
    onUpdateProfile({
      name: username.toUpperCase().replace(/\s+/g, '_'),
      role: profile.role,
      location: location.toUpperCase(),
      bio: bio,
      avatar: avatar
    });
    setIsEditing(false);
    onShowNotification('Profile changes saved successfully');
  };

  const startDownload = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (downloadingId) return;

    setDownloadingId(id);
    onShowNotification(`Extracting audio tracks for ${title}...`);

    setTimeout(() => {
      setDownloadingId(null);
      onShowNotification(`Downloaded COMPLETE: ${title}.zip is saved.`);
    }, 2000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-10 animate-fade-in">
      
      {/* Profile Header Block */}
      <header className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start md:items-center w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-[0_4px_22px_rgba(0,0,0,0.01)] relative text-center sm:text-left">
        {/* Avatar Image circle */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
          <div
            onClick={() => isEditing && fileInputRef.current?.click()}
            onDragOver={isEditing ? handleDragOver : undefined}
            onDragLeave={isEditing ? handleDragLeave : undefined}
            onDrop={isEditing ? handleDrop : undefined}
            className={`w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-black dark:border-white bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 relative group transition-all duration-200 ${
              isEditing ? 'cursor-pointer hover:scale-[1.02] border-dashed border-2 ring-1 ring-neutral-300 dark:ring-neutral-600 hover:ring-black dark:hover:ring-white' : ''
            } ${isDragging ? 'bg-neutral-200 dark:bg-neutral-700 ring-2 ring-black dark:ring-white border-solid' : ''}`}
            title={isEditing ? 'Click or drop image to upload new avatar' : undefined}
          >
            <img
              src={isEditing ? avatar : profile.avatar}
              alt={profile.name}
              className={`w-full h-full object-cover transition-all grayscale duration-300 ${isEditing ? 'group-hover:opacity-40' : ''}`}
              referrerPolicy="no-referrer"
            />
            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                <Upload className="w-5 h-5 text-white mb-1 animate-pulse" />
                <span className="font-mono text-[8px] uppercase tracking-wider text-white font-extrabold leading-none">
                  Upload Photo
                </span>
                <span className="font-sans text-[7px] text-neutral-300 mt-0.5 max-w-[80px] leading-tight">
                  Drag & Drop
                </span>
              </div>
            )}
            {isDragging && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 p-2 text-center">
                <Upload className="w-6 h-6 text-white mb-1 animate-bounce" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold">
                  Drop Here
                </span>
              </div>
            )}
          </div>
          {isEditing && (
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest font-bold mt-1 text-center select-none">
              Manual Upload
            </span>
          )}
          {isEditing && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          )}
        </div>

        {/* Info detail block */}
        <div className="flex-grow flex flex-col gap-4 w-full">
          {isEditing ? (
            <form onSubmit={handleUpdate} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">New Display Name</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 p-2 font-mono text-xs focus:ring-0 focus:border-black dark:focus:border-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 p-2 font-mono text-xs focus:ring-0 focus:border-black dark:focus:border-white outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">Bio summary description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 p-2 font-sans text-xs focus:ring-0 focus:border-black dark:focus:border-white outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Info
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div>
                  <h1 className="font-sans text-2xl md:text-3.5xl font-extrabold text-primary tracking-tighter uppercase leading-none">
                    {profile.name}
                  </h1>
                  <p className="font-mono text-[10px] text-neutral-400 mt-1 uppercase tracking-widest leading-none">
                    {profile.role} / {profile.location}
                  </p>
                </div>
                
                <button
                  onClick={startEditing}
                  className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 hover:opacity-90 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer rounded-none"
                >
                  <Edit3 className="w-4 h-4 text-current" />
                  Edit Profile
                </button>
              </div>

              <p className="font-sans text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mt-2 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Tabs list switchers */}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-800 flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('my_kits')}
          className={`pb-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'my_kits'
              ? 'border-b-2 border-black dark:border-white text-primary font-extrabold'
              : 'border-b-2 border-transparent text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          My Kits {purchasedKits.length > 0 && `(${purchasedKits.length})`}
        </button>
        <button
          onClick={() => setActiveTab('for_sale')}
          className={`pb-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'for_sale'
              ? 'border-b-2 border-black dark:border-white text-primary font-extrabold'
              : 'border-b-2 border-transparent text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          For Sale {creatorKits.length > 0 && `(${creatorKits.length})`}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-b-2 border-black dark:border-white text-primary font-extrabold'
              : 'border-b-2 border-transparent text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Active Tab rendering */}
      <section className="min-h-[300px]">
        {activeTab === 'my_kits' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-sans text-lg font-bold uppercase tracking-tight text-primary">
                Purchased Kits & Licenses
              </h2>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest font-bold">
                Lifetime Royalty-Free Downloads Granted
              </span>
            </div>

            {purchasedKits.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 text-sm font-sans flex flex-col items-center gap-1.5 justify-center">
                <span>You have not purchased any products yet.</span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">Licenses will automatically register upon sandbox payment checkout.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {purchasedKits.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectKit(item.id)}
                    className="group flex flex-col gap-3 cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all p-3 -m-3 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                  >
                    <div className="w-full aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      
                      {item.coverImage === 'waveform' ? (
                        <div className="w-full h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black to-neutral-800">
                          <div className="flex items-end gap-[1px] h-12 w-full opacity-60">
                            {[20, 50, 80, 30, 90, 100, 60, 40, 70, 20, 60, 43, 90].map((h, i) => (
                              <div key={i} className="w-[3px] bg-white" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover grayscale group-hover:scale-101 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-sans text-xs font-bold truncate group-hover:underline text-black dark:text-white">
                        {item.title}
                      </h3>
                      <button
                        onClick={(e) => startDownload(e, item.id, item.title)}
                        disabled={downloadingId !== null}
                        className={`text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded-none transition-colors ${
                          downloadingId === item.id ? 'animate-bounce text-black dark:text-white' : ''
                        }`}
                        title="Download ZIP"
                      >
                        <Download className="w-4 h-4 text-current" />
                      </button>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 uppercase bg-neutral-50 dark:bg-neutral-800 font-bold">
                        {item.sampleRate || 'WAV'}
                      </span>
                      {item.bpm && (
                        <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 uppercase bg-neutral-50 dark:bg-neutral-800 font-bold">
                          {item.bpm} BPM
                        </span>
                      )}
                      {(Array.isArray(item.tags) && item.tags.includes('PRESET')) || item.category === 'preset_bank' ? (
                        <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 uppercase bg-neutral-50 dark:bg-neutral-800 font-bold">
                          PRESETS
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab "For Sale" (Dynamic list of published assets by user profile) */}
        {activeTab === 'for_sale' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-sans text-lg font-bold uppercase tracking-tight text-primary">
                Active Listings
              </h2>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest font-bold">
                Your uploaded catalogs and preset expansions
              </span>
            </div>

            {creatorKits.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 text-sm font-sans flex flex-col items-center gap-1.5 justify-center">
                <span>You don't have any items for sale yet.</span>
                <span className="text-xs text-neutral-400 font-mono">Click "Sell" in the menu above to publish your first expansion kit!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {creatorKits.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectKit(item.id)}
                    className="group flex flex-col gap-3 cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-all p-3 -m-3 bg-white dark:bg-neutral-900"
                  >
                    <div className="w-full aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative border border-neutral-100 dark:border-neutral-800">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 font-mono text-[9px] font-bold">
                        ACTIVE
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-sans text-xs font-bold truncate group-hover:underline text-black dark:text-white">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-xs font-extrabold text-neutral-800 dark:text-neutral-200 whitespace-nowrap bg-neutral-100 dark:bg-neutral-800 px-1 border border-neutral-200 dark:border-neutral-700">
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(String(item.price || 0)).toFixed(2)}
                        </span>
                        {onDeleteKit && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`Deseja desativar o SoundKit "${item.title}" no MongoDB?`)) {
                                try {
                                  await apiDeleteSoundKit(item.id);
                                  onDeleteKit(item.id);
                                  onShowNotification(`SoundKit "${item.title}" desativado com sucesso (DELETE /soundkits/${item.id}).`);
                                } catch (err: any) {
                                  onShowNotification(`Erro ao desativar: ${err.message}`);
                                }
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                            title="Desativar kit (DELETE /soundkits/{id})"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 uppercase bg-neutral-50 dark:bg-neutral-800 font-bold">
                        {(item.category || 'kit').toUpperCase().replace('_', ' ')}
                      </span>
                      {item.fileCount && (
                        <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 uppercase bg-neutral-50 dark:bg-neutral-800 font-bold">
                          {item.fileCount} FILES
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-8 animate-fade-in">
            <h3 className="font-sans text-lg font-bold border-b border-neutral-100 dark:border-neutral-800 pb-2 uppercase tracking-tight text-primary">
              Preferências da Conta
            </h3>

            {/* Global Theme Switcher Preference Card */}
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-sans text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    Aparência do Tema
                  </h4>
                  <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Alterne entre os modos Claro e Escuro. As preferências são salvas automaticamente no seu navegador.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {theme === 'dark' ? 'MODO ESCURO ATIVO' : 'MODO CLARO ATIVO'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  id="profile-theme-light-btn"
                  onClick={() => {
                    if (theme !== 'light') {
                      setTheme('light');
                      onShowNotification('Modo Claro ativado');
                    }
                  }}
                  className={`py-3 px-4 border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  Modo Claro
                </button>
                <button
                  type="button"
                  id="profile-theme-dark-btn"
                  onClick={() => {
                    if (theme !== 'dark') {
                      setTheme('dark');
                      onShowNotification('Modo Escuro ativado');
                    }
                  }}
                  className={`py-3 px-4 border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  <Moon className="w-4 h-4 text-amber-400" />
                  Modo Escuro
                </button>
              </div>
            </div>

            {/* Email Preferences checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="email-notifs"
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="w-4 h-4 rounded-none border-black dark:border-white text-black dark:text-white focus:ring-black cursor-pointer mt-1"
              />
              <div className="space-y-0.5">
                <label htmlFor="email-notifs" className="font-sans text-sm font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  Email Notifications
                </label>
                <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Receive an automated email alert every time a sound designer purchases one of your uploaded packs or comments on your profile.
                </p>
              </div>
            </div>

            {/* 2FA configuration check */}
            <div className="flex items-start gap-3">
              <input
                id="two-factor"
                type="checkbox"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
                className="w-4 h-4 rounded-none border-black dark:border-white text-black dark:text-white focus:ring-black cursor-pointer mt-1"
              />
              <div className="space-y-0.5">
                <label htmlFor="two-factor" className="font-sans text-sm font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-500" />
                  Two-Factor Authentication (2FA)
                </label>
                <p className="font-sans text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Enforce secure sign-in triggers to safeguard your listed library funds and digital payouts.
                </p>
              </div>
            </div>

            {/* Currency switcher dropdown */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-neutral-400">
                Default Payout Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:border-black dark:focus:border-white p-2 font-mono text-xs outline-none cursor-pointer w-40"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
              <p className="font-sans text-[11px] text-neutral-400 mt-1">
                Conversions will default to daily sandbox index exchange rates during payout checks.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
