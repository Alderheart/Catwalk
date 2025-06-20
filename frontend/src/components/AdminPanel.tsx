import React, { useState, useEffect } from 'react';
import { useCatsStore } from '../stores/catsStore';
import { getCatSpriteUrl, getAvailableSkills, getAvailableTraits, getAvailableBreeds } from '../utils/catSprites';
import type { Cat } from '../types/Cat';

const AdminPanel: React.FC = () => {
  const { cats, isLoading, error, fetchCats, createCat, updateCat, deleteCat, clearError } = useCatsStore();
  
  // Form state for creating new cats
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    moons: 6,
    skill: 'hunting',
    trait: 'loyal',
    breed: 'ginger',
  });

  // Edit state
  const [editingCat, setEditingCat] = useState<Cat | null>(null);

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a cat name');
      return;
    }

    const success = await createCat(formData);
    if (success) {
      setFormData({ name: '', gender: 'male', moons: 6, skill: 'hunting', trait: 'loyal', breed: 'ginger' });
      setShowCreateForm(false);
    }
  };

  const handleUpdateCat = async (cat: Cat) => {
    const newName = prompt('Enter new name:', cat.name);
    if (newName && newName !== cat.name) {
      await updateCat(cat.id, { name: newName });
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
    };
  };

  const handleCreateRandomCat = async () => {
    const randomCat = generateRandomCat();
    await createCat(randomCat);
  };

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-purple-900 to-purple-950 safe-area-all flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Panel</h2>
        
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
                      {cat.skill} • {cat.trait}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateCat(cat)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
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
};

export default AdminPanel;