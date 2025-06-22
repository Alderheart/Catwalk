import { Router, Response } from 'express';
import { 
  AuthenticatedRequest, 
  ApiResponse, 
  Expedition, 
  ExpeditionCard, 
  ExpeditionCat,
  TarotCardName,
  CreateExpeditionRequest,
  CompleteExpeditionResponse,
  ExpeditionRewards,
  NewCatReward,
  PaginationQuery
} from '../types';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// Major Arcana tarot cards (22 cards)
const MAJOR_ARCANA: TarotCardName[] = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];

// Spread configurations
const SPREAD_CONFIGS = {
  'three-card': { positions: 3, name: 'Three Card (Past/Present/Future)' },
  'horseshoe': { positions: 5, name: 'Horseshoe Spread' },
  'four-directions': { positions: 4, name: 'Four Directions' }
};

// Cat name pools for new cat rewards
const CAT_NAMES = {
  male: ['Shadowclaw', 'Stormtail', 'Flintwhisker', 'Emberpaw', 'Thornstrike', 'Mistfur', 'Brokenfang', 'Swiftstep'],
  female: ['Moonfeather', 'Silverstream', 'Dawnwhisper', 'Frostpetal', 'Nightshade', 'Willowbreeze', 'Ivytalon', 'Roseheart']
};

const CAT_SKILLS = ['hunting', 'fighting', 'healing', 'stealth', 'leadership', 'tracking'];
const CAT_TRAITS = ['loyal', 'brave', 'clever', 'cautious', 'energetic', 'wise', 'fierce', 'gentle'];
const CAT_BREEDS = ['tabby', 'tortoiseshell', 'calico', 'siamese', 'bengal', 'maine-coon', 'persian', 'ragdoll'];

// Helper functions
function generateTarotDeck(): TarotCardName[] {
  return [...MAJOR_ARCANA];
}

function shuffleTarotDeck(deck: TarotCardName[]): TarotCardName[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRandomCat(): NewCatReward {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const names = CAT_NAMES[gender];
  
  return {
    name: names[Math.floor(Math.random() * names.length)],
    gender,
    moons: Math.floor(Math.random() * 50) + 6, // 6-55 moons
    skill: CAT_SKILLS[Math.floor(Math.random() * CAT_SKILLS.length)],
    trait: CAT_TRAITS[Math.floor(Math.random() * CAT_TRAITS.length)],
    breed: CAT_BREEDS[Math.floor(Math.random() * CAT_BREEDS.length)]
  };
}

function generateTarotRewards(card: { tarotCardName: TarotCardName; orientation: string }): ExpeditionRewards {
  const rewards: ExpeditionRewards = {};
  
  // Base reward chances and amounts based on tarot card (simplified for now)
  // In the future, this will be replaced by minigame scores
  const tarotCards = {
    'The Fool': { coins: 30, expBase: 15, newCatChance: 0.05 },
    'The Magician': { coins: 80, expBase: 40, newCatChance: 0.10 },
    'The High Priestess': { coins: 60, expBase: 35, newCatChance: 0.08 },
    'The Empress': { coins: 90, expBase: 45, newCatChance: 0.12 },
    'The Emperor': { coins: 85, expBase: 42, newCatChance: 0.10 },
    'The Hierophant': { coins: 70, expBase: 35, newCatChance: 0.08 },
    'The Lovers': { coins: 65, expBase: 30, newCatChance: 0.15 },
    'The Chariot': { coins: 75, expBase: 40, newCatChance: 0.06 },
    'Strength': { coins: 80, expBase: 50, newCatChance: 0.05 },
    'The Hermit': { coins: 50, expBase: 35, newCatChance: 0.03 },
    'Wheel of Fortune': { coins: 100, expBase: 30, newCatChance: 0.20 },
    'Justice': { coins: 70, expBase: 40, newCatChance: 0.08 },
    'The Hanged Man': { coins: 40, expBase: 45, newCatChance: 0.05 },
    'Death': { coins: 60, expBase: 50, newCatChance: 0.10 },
    'Temperance': { coins: 65, expBase: 35, newCatChance: 0.07 },
    'The Devil': { coins: 90, expBase: 25, newCatChance: 0.12 },
    'The Tower': { coins: 85, expBase: 20, newCatChance: 0.08 },
    'The Star': { coins: 75, expBase: 40, newCatChance: 0.10 },
    'The Moon': { coins: 55, expBase: 30, newCatChance: 0.06 },
    'The Sun': { coins: 95, expBase: 50, newCatChance: 0.15 },
    'Judgement': { coins: 80, expBase: 45, newCatChance: 0.10 },
    'The World': { coins: 100, expBase: 60, newCatChance: 0.18 }
  };
  
  const cardData = tarotCards[card.tarotCardName];
  const multiplier = card.orientation === 'upright' ? 1 : 0.7; // Reversed cards give 70% rewards
  
  // Coins (80% chance)
  if (Math.random() < 0.8) {
    const baseCoins = cardData.coins * multiplier;
    const variance = baseCoins * 0.3; // ±30% variance
    rewards.coins = Math.floor(baseCoins + (Math.random() - 0.5) * variance);
  }
  
  // Experience (always given, but amount varies)
  const baseExp = cardData.expBase * multiplier;
  const expVariance = baseExp * 0.4; // ±40% variance
  const expAmount = Math.floor(baseExp + (Math.random() - 0.5) * expVariance);
  
  if (expAmount > 0) {
    rewards.experience = { placeholder: expAmount }; // Will be distributed to actual cats later
  }
  
  // New cats (rare)
  if (Math.random() < cardData.newCatChance * multiplier) {
    rewards.newCats = [generateRandomCat()];
  }
  
  return rewards;
}

function combineRewards(cardRewards: ExpeditionRewards[], expeditionCats: ExpeditionCat[]): ExpeditionRewards {
  const combined: ExpeditionRewards = { coins: 0, experience: {}, newCats: [] };
  
  // Combine coins
  for (const reward of cardRewards) {
    if (reward.coins) {
      combined.coins = (combined.coins || 0) + reward.coins;
    }
  }
  
  // Distribute experience among expedition cats
  let totalExp = 0;
  for (const reward of cardRewards) {
    if (reward.experience?.placeholder) {
      totalExp += reward.experience.placeholder;
    }
  }
  
  if (totalExp > 0 && expeditionCats.length > 0) {
    // Distribute experience among cats with some randomness
    for (const cat of expeditionCats) {
      const basePortion = totalExp / expeditionCats.length;
      const variance = basePortion * 0.3; // ±30% variance per cat
      const catExp = Math.floor(basePortion + (Math.random() - 0.5) * variance);
      if (catExp > 0) {
        combined.experience![cat.catId] = catExp;
      }
    }
  }
  
  // Combine new cats
  for (const reward of cardRewards) {
    if (reward.newCats) {
      combined.newCats!.push(...reward.newCats);
    }
  }
  
  // Clean up empty arrays/objects
  if (combined.coins === 0) delete combined.coins;
  if (Object.keys(combined.experience!).length === 0) delete combined.experience;
  if (combined.newCats!.length === 0) delete combined.newCats;
  
  return combined;
}

function generateNarrative(cards: ExpeditionCard[], rewards: ExpeditionRewards, spreadType: string): string {
  const narrativeTemplates = {
    'three-card': 'Your expedition party consulted the past, present, and future. ',
    'horseshoe': 'The five-card spread revealed a complex journey ahead. ',
    'four-directions': 'The four directions showed paths of opportunity. '
  };
  
  let narrative = narrativeTemplates[spreadType as keyof typeof narrativeTemplates];
  
  const uprightCards = cards.filter(c => c.orientation === 'upright').length;
  const reversedCards = cards.filter(c => c.orientation === 'reversed').length;
  
  if (uprightCards > reversedCards) {
    narrative += 'The signs were favorable, and your cats returned with good fortune. ';
  } else if (reversedCards > uprightCards) {
    narrative += 'The journey was challenging, but your cats persevered through difficulties. ';
  } else {
    narrative += 'The path was neither easy nor hard, bringing balanced results. ';
  }
  
  if (rewards.coins && rewards.coins > 50) {
    narrative += 'They discovered valuable resources along the way. ';
  }
  
  if (rewards.newCats && rewards.newCats.length > 0) {
    narrative += `A lone cat joined your colony, seeking shelter and purpose. `;
  }
  
  if (rewards.experience && Object.keys(rewards.experience).length > 0) {
    narrative += 'The expedition taught your cats valuable lessons about survival and cooperation.';
  }
  
  return narrative.trim();
}

// Get all expeditions for authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query as PaginationQuery;
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data: expeditions, error, count } = await supabase
      .from('expeditions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + Number(limit) - 1);
    
    if (error) {
      throw error;
    }
    
    const response: ApiResponse<Expedition[]> = {
      success: true,
      data: expeditions || [],
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching expeditions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch expeditions'
      }
    });
  }
});

// Get specific expedition by ID with full details
router.get('/:expeditionId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expeditionId } = req.params;
    
    // Get expedition
    const { data: expedition, error: expeditionError } = await supabase
      .from('expeditions')
      .select('*')
      .eq('id', expeditionId)
      .eq('user_id', req.userId!)
      .single();
    
    if (expeditionError) {
      if (expeditionError.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Expedition not found'
          }
        });
        return;
      }
      throw expeditionError;
    }
    
    // Get expedition cats
    const { data: expeditionCats, error: catsError } = await supabase
      .from('expedition_cats')
      .select('*')
      .eq('expedition_id', expeditionId)
      .order('position');
    
    if (catsError) throw catsError;
    
    // Get expedition cards (if cards have been drawn)
    let expeditionCards = [];
    if (expedition.status === 'cards_drawn' || expedition.status === 'completed') {
      const { data: cards, error: cardsError } = await supabase
        .from('expedition_cards')
        .select('*')
        .eq('expedition_id', expeditionId)
        .order('card_position');
      
      if (cardsError) throw cardsError;
      expeditionCards = cards || [];
    }
    
    // Get expedition minigames (if cards have been drawn)
    let expeditionMinigames = [];
    if (expedition.status === 'cards_drawn' || expedition.status === 'completed') {
      const { data: minigames, error: minigamesError } = await supabase
        .from('expedition_minigames')
        .select('*')
        .eq('expedition_id', expeditionId)
        .order('card_position');
      
      if (minigamesError) throw minigamesError;
      expeditionMinigames = minigames || [];
    }
    
    // Get expedition results (if completed)
    let expeditionResults = null;
    if (expedition.status === 'completed') {
      const { data: results, error: resultsError } = await supabase
        .from('expedition_results')
        .select('*')
        .eq('expedition_id', expeditionId)
        .single();
      
      if (resultsError && resultsError.code !== 'PGRST116') throw resultsError;
      expeditionResults = results;
    }
    
    const response: ApiResponse<CompleteExpeditionResponse> = {
      success: true,
      data: {
        expedition,
        cats: expeditionCats || [],
        cards: expeditionCards,
        minigames: expeditionMinigames,
        results: expeditionResults
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching expedition:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch expedition'
      }
    });
  }
});

// Create new expedition
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { spreadType, catIds }: CreateExpeditionRequest = req.body;
    
    // Validate input
    if (!spreadType || !SPREAD_CONFIGS[spreadType]) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid spread type is required'
        }
      });
      return;
    }
    
    if (!catIds || !Array.isArray(catIds) || catIds.length !== 3) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Exactly 3 cat IDs are required'
        }
      });
      return;
    }
    
    // Verify cats belong to user
    const { data: userCats, error: catsError } = await supabase
      .from('cats')
      .select('id')
      .eq('user_id', req.userId!)
      .in('id', catIds);
    
    if (catsError) throw catsError;
    
    if (!userCats || userCats.length !== 3) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'All cats must belong to the authenticated user'
        }
      });
      return;
    }
    
    // Check for active expedition
    const { data: activeExpedition, error: activeError } = await supabase
      .from('expeditions')
      .select('id')
      .eq('user_id', req.userId!)
      .eq('status', 'active')
      .limit(1);
    
    if (activeError) throw activeError;
    
    if (activeExpedition && activeExpedition.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ACTIVE_EXPEDITION_EXISTS',
          message: 'You already have an active expedition. Complete it first.'
        }
      });
      return;
    }
    
    // Create expedition
    const { data: newExpedition, error: expeditionError } = await supabase
      .from('expeditions')
      .insert({
        user_id: req.userId!,
        spread_type: spreadType,
        status: 'active'
      })
      .select()
      .single();
    
    if (expeditionError) throw expeditionError;
    
    // Create expedition cats
    const expeditionCatsData = catIds.map((catId, index) => ({
      expedition_id: newExpedition.id,
      cat_id: catId,
      position: index
    }));
    
    const { data: expeditionCats, error: expeditionCatsError } = await supabase
      .from('expedition_cats')
      .insert(expeditionCatsData)
      .select();
    
    if (expeditionCatsError) throw expeditionCatsError;
    
    const response: ApiResponse<CompleteExpeditionResponse> = {
      success: true,
      data: {
        expedition: newExpedition,
        cats: expeditionCats || [],
        cards: [],
        minigames: [],
        results: null
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating expedition:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create expedition'
      }
    });
  }
});

// Draw cards for expedition
router.post('/:expeditionId/draw-cards', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expeditionId } = req.params;
    const { cardCount } = req.body;
    
    // Get expedition and verify it's active
    const { data: expedition, error: expeditionError } = await supabase
      .from('expeditions')
      .select('*')
      .eq('id', expeditionId)
      .eq('user_id', req.userId!)
      .eq('status', 'active')
      .single();
    
    if (expeditionError) {
      if (expeditionError.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Active expedition not found'
          }
        });
        return;
      }
      throw expeditionError;
    }
    
    // Determine number of cards to draw
    let numCards = cardCount;
    
    // If no cardCount provided, use spread configuration
    if (!numCards) {
      const spreadConfig = SPREAD_CONFIGS[expedition.spread_type as keyof typeof SPREAD_CONFIGS];
      numCards = spreadConfig.positions;
    }
    
    // Validate card count
    if (!numCards || numCards < 1 || numCards > 22) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Card count must be between 1 and 22'
        }
      });
      return;
    }
    
    // Generate and draw tarot cards
    const deck = shuffleTarotDeck(generateTarotDeck());
    const drawnCards = deck.slice(0, numCards);
    
    // Create expedition cards with random orientations
    const expeditionCardsData = drawnCards.map((card, index) => ({
      expedition_id: expeditionId,
      card_position: index,
      tarot_card_name: card,
      orientation: Math.random() < 0.7 ? 'upright' : 'reversed' // 70% chance upright
    }));
    
    const { data: expeditionCards, error: cardsInsertError } = await supabase
      .from('expedition_cards')
      .insert(expeditionCardsData)
      .select();
    
    if (cardsInsertError) throw cardsInsertError;
    
    // Create expedition minigames for each drawn card
    const expeditionMinigamesData = expeditionCards!.map(card => ({
      expedition_id: expeditionId,
      card_position: card.card_position,
      tarot_card_name: card.tarot_card_name,
      orientation: card.orientation,
      minigame_type: null, // Will be set when minigames are implemented
      status: 'pending' as const
    }));
    
    const { error: minigamesInsertError } = await supabase
      .from('expedition_minigames')
      .insert(expeditionMinigamesData)
      .select();
    
    if (minigamesInsertError) throw minigamesInsertError;
    
    // Update expedition status to cards_drawn
    const { error: updateError } = await supabase
      .from('expeditions')
      .update({ status: 'cards_drawn' })
      .eq('id', expeditionId);
    
    if (updateError) throw updateError;
    
    const response: ApiResponse<{ cards: ExpeditionCard[] }> = {
      success: true,
      data: {
        cards: expeditionCards || []
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error drawing cards:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to draw cards'
      }
    });
  }
});

// Complete expedition (draw cards and generate results)
router.post('/:expeditionId/complete', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expeditionId } = req.params;
    
    // Get expedition and verify it's active or cards_drawn
    const { data: expedition, error: expeditionError } = await supabase
      .from('expeditions')
      .select('*')
      .eq('id', expeditionId)
      .eq('user_id', req.userId!)
      .in('status', ['active', 'cards_drawn'])
      .single();
    
    if (expeditionError) {
      if (expeditionError.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Active expedition not found'
          }
        });
        return;
      }
      throw expeditionError;
    }
    
    // Get expedition cats
    const { data: expeditionCats, error: catsError } = await supabase
      .from('expedition_cats')
      .select('*')
      .eq('expedition_id', expeditionId)
      .order('position');
    
    if (catsError) throw catsError;
    
    let expeditionCards;
    let expeditionMinigames;
    
    // Check if cards are already drawn
    if (expedition.status === 'cards_drawn') {
      // Cards already drawn, just fetch them
      const { data: existingCards, error: cardsError } = await supabase
        .from('expedition_cards')
        .select('*')
        .eq('expedition_id', expeditionId)
        .order('card_position');
      
      if (cardsError) throw cardsError;
      expeditionCards = existingCards;
      
      // Fetch existing minigames
      const { data: existingMinigames, error: minigamesError } = await supabase
        .from('expedition_minigames')
        .select('*')
        .eq('expedition_id', expeditionId)
        .order('card_position');
      
      if (minigamesError) throw minigamesError;
      expeditionMinigames = existingMinigames;
    } else {
      // Generate and draw tarot cards
      const spreadConfig = SPREAD_CONFIGS[expedition.spread_type as keyof typeof SPREAD_CONFIGS];
      const deck = shuffleTarotDeck(generateTarotDeck());
      const drawnCards = deck.slice(0, spreadConfig.positions);
      
      // Create expedition cards with random orientations
      const expeditionCardsData = drawnCards.map((card, index) => ({
        expedition_id: expeditionId,
        card_position: index,
        tarot_card_name: card,
        orientation: Math.random() < 0.7 ? 'upright' : 'reversed' // 70% chance upright
      }));
      
      const { data: newExpeditionCards, error: cardsInsertError } = await supabase
        .from('expedition_cards')
        .insert(expeditionCardsData)
        .select();
      
      if (cardsInsertError) throw cardsInsertError;
      expeditionCards = newExpeditionCards;
      
      // Create expedition minigames for each drawn card
      const expeditionMinigamesData = expeditionCards!.map(card => ({
        expedition_id: expeditionId,
        card_position: card.card_position,
        tarot_card_name: card.tarot_card_name,
        orientation: card.orientation,
        minigame_type: null, // Will be set when minigames are implemented
        status: 'pending' as const
      }));
      
      const { data: newExpeditionMinigames, error: minigamesInsertError } = await supabase
        .from('expedition_minigames')
        .insert(expeditionMinigamesData)
        .select();
      
      if (minigamesInsertError) throw minigamesInsertError;
      expeditionMinigames = newExpeditionMinigames;
    }
    
    // Generate rewards for each card
    const cardRewards = expeditionCards!.map(card => 
      generateTarotRewards({
        tarotCardName: card.tarot_card_name as TarotCardName,
        orientation: card.orientation
      })
    );
    
    // Combine all card rewards
    const finalRewards = combineRewards(cardRewards, expeditionCats || []);
    
    // Generate narrative
    const narrative = generateNarrative(expeditionCards!, finalRewards, expedition.spread_type);
    
    // Create expedition results
    const { data: expeditionResults, error: resultsError } = await supabase
      .from('expedition_results')
      .insert({
        expedition_id: expeditionId,
        rewards_json: finalRewards,
        narrative_text: narrative
      })
      .select()
      .single();
    
    if (resultsError) throw resultsError;
    
    // Update expedition status
    const { data: updatedExpedition, error: updateError } = await supabase
      .from('expeditions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', expeditionId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Apply rewards to user and cats
    if (finalRewards.coins && finalRewards.coins > 0) {
      // Add coins to user - need to fetch current coins and update
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('coins')
        .eq('id', req.userId!)
        .single();
      
      if (!userFetchError && userData) {
        const { error: coinsError } = await supabase
          .from('users')
          .update({ 
            coins: userData.coins + finalRewards.coins 
          })
          .eq('id', req.userId!);
        
        if (coinsError) console.error('Error updating user coins:', coinsError);
      }
    }
    
    // Apply experience to cats
    if (finalRewards.experience) {
      for (const [catId, experience] of Object.entries(finalRewards.experience)) {
        // Fetch current experience and update
        const { data: catData, error: catFetchError } = await supabase
          .from('cats')
          .select('experience')
          .eq('id', catId)
          .eq('user_id', req.userId!)
          .single();
        
        if (!catFetchError && catData) {
          const { error: expError } = await supabase
            .from('cats')
            .update({ 
              experience: catData.experience + experience 
            })
            .eq('id', catId)
            .eq('user_id', req.userId!);
          
          if (expError) console.error(`Error updating cat ${catId} experience:`, expError);
        }
      }
    }
    
    // Create new cats
    if (finalRewards.newCats && finalRewards.newCats.length > 0) {
      const newCatsData = finalRewards.newCats.map(cat => ({
        ...cat,
        user_id: req.userId!,
        level: 1,
        experience: 0,
        max_level: 20
      }));
      
      const { error: newCatsError } = await supabase
        .from('cats')
        .insert(newCatsData);
      
      if (newCatsError) console.error('Error creating new cats:', newCatsError);
    }

    // Clean up expedition data after completion
    // Delete expedition cards, cats, minigames (results can be kept for history)
    const cleanupPromises = [
      supabase
        .from('expedition_cards')
        .delete()
        .eq('expedition_id', expeditionId),
      supabase
        .from('expedition_cats')
        .delete()
        .eq('expedition_id', expeditionId),
      supabase
        .from('expedition_minigames')
        .delete()
        .eq('expedition_id', expeditionId)
    ];

    const cleanupResults = await Promise.allSettled(cleanupPromises);
    
    // Log any cleanup errors but don't fail the request
    cleanupResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const tableNames = ['expedition_cards', 'expedition_cats', 'expedition_minigames'];
        console.error(`Error cleaning up ${tableNames[index]}:`, result.reason);
      }
    });
    
    const response: ApiResponse<CompleteExpeditionResponse> = {
      success: true,
      data: {
        expedition: updatedExpedition,
        cats: expeditionCats || [],
        cards: expeditionCards || [],
        minigames: expeditionMinigames || [],
        results: expeditionResults
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error completing expedition:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to complete expedition'
      }
    });
  }
});

export default router;