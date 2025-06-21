import React, { useState, useEffect } from 'react';
import { useCatsStore } from '../../stores/catsStore';
import { useAuthStore } from '../../stores/authStore';
import { getCatSpriteUrl, getAvailableSkills, getAvailableTraits, getAvailableBreeds } from '../../utils/catSprites';
import type { Cat } from '../../types/Cat';

const AdminPanel: React.FC = () => {
  const { cats, isLoading, error, fetchCats, createCat, deleteCat, clearError } = useCatsStore();
  const { user, updateUserCoins } = useAuthStore();
  
  // Form state for creating new cats
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    moons: 6,
    skill: 'hunting',
    trait: 'loyal',
    breed: 'ginger',
    level: 1,
    experience: 0,
    max_level: 20,
  });

  
  // Admin sections state
  const [activeSection, setActiveSection] = useState<'main' | 'cats' | 'user'>('main');
  
  // Coin editing state
  const [editingCoins, setEditingCoins] = useState(false);
  const [coinValue, setCoinValue] = useState(user?.coins || 0);

  useEffect(() => {
    fetchCats();
  }, []);

  useEffect(() => {
    if (user?.coins !== undefined) {
      setCoinValue(user.coins);
    }
  }, [user?.coins]);

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a cat name');
      return;
    }

    const success = await createCat(formData);
    if (success) {
      setFormData({ name: '', gender: 'male', moons: 6, skill: 'hunting', trait: 'loyal', breed: 'ginger', level: 1, experience: 0, max_level: 20 });
      setShowCreateForm(false);
    }
  };


  const handleDeleteCat = async (cat: Cat) => {
    if (confirm(`Are you sure you want to delete ${cat.name}?`)) {
      await deleteCat(cat.id);
    }
  };

  const generateRandomCat = () => {
    const names = [
      'Moonwhisker', 'Shadowpelt', 'Daisyspring', 'Stormclaw', 'Honeypaw', 
      'Willowbreeze', 'Firestar', 'Bluestar', 'Graystripe', 'Sandstorm',
      'Tigerclaw', 'Whitestorm', 'Yellowfang', 'Cinderpelt', 'Brambleclaw'
    ];
    const skills = getAvailableSkills();
    const traits = getAvailableTraits();
    const breeds = getAvailableBreeds();
    
    return {
      name: names[Math.floor(Math.random() * names.length)],
      gender: Math.random() > 0.5 ? 'male' : 'female' as 'male' | 'female',
      moons: Math.floor(Math.random() * 120) + 1, // 1-120 moons (0-10 years)
      skill: skills[Math.floor(Math.random() * skills.length)],
      trait: traits[Math.floor(Math.random() * traits.length)],
      breed: breeds[Math.floor(Math.random() * breeds.length)],
      level: Math.floor(Math.random() * 10) + 1, // Random level 1-10
      experience: Math.floor(Math.random() * 100), // Random experience 0-99
      max_level: 20,
    };
  };

  const handleCreateRandomCat = async () => {
    const randomCat = generateRandomCat();
    await createCat(randomCat);
  };

  const handleSaveCoins = async () => {
    const success = await updateUserCoins(coinValue);
    if (success) {
      setEditingCoins(false);
    }
  };

  const handleCancelCoinEdit = () => {
    setCoinValue(user?.coins || 0);
    setEditingCoins(false);
  };

  // Main menu view
  if (activeSection === 'main') {
    return (
      <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900 to-purple-950 p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Admin Panel</h1>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-4">
              <p>{error}</p>
              <button 
                onClick={clearError}
                className="mt-2 text-red-300 hover:text-red-100 underline"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Admin Sections */}
          <div className="space-y-3">
            {/* Cats Section */}
            <button 
              onClick={() => setActiveSection('cats')}
              className="w-full bg-green-800 hover:bg-green-700 text-white p-4 rounded-lg text-left transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Cats</span>
                <span className="text-gray-400">→</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Create and manage cats ({cats.length} total)</p>
            </button>

            {/* User Section */}
            <button 
              onClick={() => setActiveSection('user')}
              className="w-full bg-blue-800 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">User</span>
                <span className="text-gray-400">→</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Manage user settings and coins</p>
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">Admin Panel v1.0.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Cats section view
  if (activeSection === 'cats') {
    return (
      <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900 to-purple-950 safe-area-all flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Header with back button */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => setActiveSection('main')}
              className="mr-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white">Cats Management</h2>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {showCreateForm ? 'Cancel' : 'Create Cat'}
              </button>
              <button
                onClick={handleCreateRandomCat}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Create Random Cat
              </button>
              <button
                onClick={() => fetchCats(true)}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-md transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Create Cat Form */}
          {showCreateForm && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Cat</h3>
              <form onSubmit={handleCreateCat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Enter cat name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Age (moons)</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.moons}
                      onChange={(e) => setFormData({ ...formData, moons: parseInt(e.target.value) || 6 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Breed</label>
                    <select
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      {getAvailableBreeds().map(breed => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Skill</label>
                    <select
                      value={formData.skill}
                      onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      {getAvailableSkills().map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Trait</label>
                    <select
                      value={formData.trait}
                      onChange={(e) => setFormData({ ...formData, trait: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      {getAvailableTraits().map(trait => (
                        <option key={trait} value={trait}>{trait}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Level</label>
                    <input
                      type="number"
                      min="1"
                      max={formData.max_level}
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Level</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_level}
                      onChange={(e) => setFormData({ ...formData, max_level: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-md transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Cat'}
                </button>
              </form>
            </div>
          )}

          {/* Cats List */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              All Cats ({cats.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-gray-300">Loading...</p>
              </div>
            ) : cats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">No cats created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cats.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                  >
                    {/* Cat sprite */}
                    <img
                      src={getCatSpriteUrl(cat)}
                      alt={cat.name}
                      className="w-12 h-12 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    
                    {/* Cat info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{cat.name}</h4>
                      <p className="text-sm text-gray-300">
                        {cat.gender} • {cat.moons} moons • {cat.breed || 'unknown breed'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {cat.skill} • {cat.trait} • Level {cat.level}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCat(cat)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User section view
  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900 to-purple-950 safe-area-all flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setActiveSection('main')}
            className="mr-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-4">
            <p>{error}</p>
            <button 
              onClick={clearError}
              className="mt-2 text-red-300 hover:text-red-100 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Username:</span> 
                <span className="text-white ml-2">{user.username}</span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span> 
                <span className="text-white ml-2">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-400">User ID:</span> 
                <span className="text-white ml-2 font-mono text-sm">{user.id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Coins Management */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Coins Management</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6s.792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14s-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.472a7.396 7.396 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-400">Current Coins:</span>
              
              {editingCoins ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={coinValue}
                    onChange={(e) => setCoinValue(parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <button
                    onClick={handleSaveCoins}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelCoinEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{user?.coins || 0}</span>
                  <button
                    onClick={() => setEditingCoins(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>Click "Edit" to modify the current coin amount.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;