# Tarot Card Minigame Reference

Quick reference for all 22 Major Arcana cards with their meanings and suggested minigame types.

## Implementation Status

✅ = Implemented  
🔄 = In Progress  
💡 = Suggested  
⭐ = Priority  

| Card | Number | Upright Meaning | Minigame Suggestion | Status |
|------|--------|----------------|-------------------|--------|
| The Fool | 0 | New beginnings, spontaneity | Exploration/Discovery Game | 💡 |
| The Magician | 1 | Willpower, manifestation | Resource Management/Crafting | ⭐ |
| The High Priestess | 2 | Intuition, inner voice | Pattern Recognition/Memory | 💡 |
| The Empress | 3 | Motherhood, fertility, nature | Nurturing/Growth Simulation | 💡 |
| The Emperor | 4 | Authority, structure, control | Strategy/Leadership Game | 💡 |
| The Hierophant | 5 | Tradition, conformity | Teaching/Learning Puzzle | 💡 |
| The Lovers | 6 | Love, harmony, relationships | Social Interaction Game | 💡 |
| The Chariot | 7 | Control, willpower, success | Racing/Momentum Game | ⭐ |
| Strength | 8 | Inner strength, bravery | Timing/Precision Challenge | ⭐ |
| **The Hermit** | **9** | **Self-reflection, inner guidance** | **Hunting/Stealth Game** | **✅** |
| Wheel of Fortune | 10 | Good luck, karma, cycles | Luck/Chance Game with Skill | 💡 |
| Justice | 11 | Justice, fairness, truth | Decision Making/Ethics | 💡 |
| The Hanged Man | 12 | Suspension, letting go | Patience/Waiting Game | 💡 |
| Death | 13 | Endings, transformation | Transformation Puzzle | ⭐ |
| Temperance | 14 | Balance, moderation | Balance/Mixing Game | 💡 |
| The Devil | 15 | Bondage, addiction | Temptation Resistance Game | ⭐ |
| The Tower | 16 | Sudden change, upheaval | Destruction/Rebuilding | ⭐ |
| The Star | 17 | Hope, faith, renewal | Navigation/Guidance Game | 💡 |
| The Moon | 18 | Illusion, fear, intuition | Illusion/Perception Game | ⭐ |
| The Sun | 19 | Happiness, success, vitality | Energy/Light Puzzle | 💡 |
| Judgement | 20 | Rebirth, inner calling | Reflection/Choice Game | 💡 |
| The World | 21 | Completion, accomplishment | Collection/Completion Game | ⭐ |

## Detailed Minigame Concepts

### Priority Implementations (⭐)

#### The Magician - Resource Management
**Upright**: Combine magical ingredients to create spells  
**Reversed**: Break illusions by finding contradictions  
**Mechanics**: Drag & drop, timing, resource optimization

#### The Chariot - Racing Game
**Upright**: Control momentum and direction to reach goals  
**Reversed**: Struggle with loss of control, must adapt  
**Mechanics**: Steering, acceleration, obstacle avoidance

#### Strength - Timing Challenge
**Upright**: Show inner strength through precise timing  
**Reversed**: Overcome self-doubt with patience  
**Mechanics**: Rhythm game, precise button timing

#### Death - Transformation Puzzle
**Upright**: Guide transformation from old to new  
**Reversed**: Resist or struggle with necessary change  
**Mechanics**: Shape transformation, lifecycle management

#### The Devil - Temptation Game
**Upright**: Resist various temptations and distractions  
**Reversed**: Break free from limiting beliefs  
**Mechanics**: Willpower meter, choice consequences

#### The Tower - Destruction/Building
**Upright**: Controlled demolition and rebuilding  
**Reversed**: Prevent collapse, emergency repairs  
**Mechanics**: Physics, construction, timing

#### The Moon - Illusion Game
**Upright**: Navigate through illusions using intuition  
**Reversed**: Clear confusion, see through deceptions  
**Mechanics**: Hidden object, perspective shifts

#### The World - Completion Game
**Upright**: Complete a grand quest or collection  
**Reversed**: Find personal fulfillment, inner completion  
**Mechanics**: Achievement hunting, puzzle completion

## Minigame Categories

### 🏹 Action/Skill
- The Hermit (Hunting)
- Strength (Timing)
- The Chariot (Racing)

### 🧩 Puzzle/Strategy
- The Magician (Crafting)
- Death (Transformation)
- The Moon (Illusion)

### 🤝 Social/Emotional
- The Lovers (Relationships)
- The Devil (Temptation)
- Justice (Ethics)

### 🌱 Simulation/Growth
- The Empress (Nurturing)
- The Emperor (Leadership)
- The Sun (Energy)

### 🎲 Luck/Chance (with skill)
- Wheel of Fortune
- The Fool (Exploration)
- The Star (Navigation)

## Reversed Card Variations

Most cards can have different minigames for reversed orientations:

### Same Minigame, Different Goals
- **The Hermit**: Upright = successful hunt, Reversed = survival/escape
- **Strength**: Upright = show strength, Reversed = overcome weakness

### Opposite Mechanics
- **The Magician**: Upright = create, Reversed = destroy illusions
- **The Tower**: Upright = controlled demolition, Reversed = prevent collapse

### Emotional Variations
- **The Moon**: Upright = embrace mystery, Reversed = seek clarity
- **The Devil**: Upright = resist temptation, Reversed = break free

## Difficulty Scaling by Spread Type

### Three-Card Spread (Base Difficulty)
- Standard minigame mechanics
- Moderate time limits
- Base reward multipliers

### Horseshoe Spread (+20% Difficulty)
- Faster timers or more precision required
- Additional obstacles or complexity
- 1.2x reward multiplier

### Four-Directions Spread (+40% Difficulty)
- Expert-level challenges
- Multiple objectives or phases
- 1.4x reward multiplier

## Seasonal/Event Variations

### Leaf-bare (Winter)
- Hunting is harder (The Hermit)
- Resources are scarce (The Magician)
- Survival focus on multiple cards

### New-leaf (Spring)
- Growth bonuses (The Empress)
- New beginning themes (The Fool)
- Renewal mechanics (The Star)

### Green-leaf (Summer)
- Peak performance (The Sun)
- Abundant resources (The World)
- High energy gameplay

### Leaf-fall (Autumn)
- Preparation themes (Temperance)
- Transformation focus (Death)
- Harvest mechanics (Justice)

## Technical Implementation Notes

### Performance Requirements
- 60 FPS on average hardware
- Mobile-friendly controls
- Responsive design for different screen sizes

### Accessibility Features
- Keyboard-only controls
- Colorblind-friendly palettes
- Clear audio/visual feedback
- Adjustable difficulty settings

### Data Tracking
- Score (0-100)
- Completion time
- Number of attempts
- Specific performance metrics per minigame

---

*Start with The Hermit hunting minigame since it's already registered in the system!*