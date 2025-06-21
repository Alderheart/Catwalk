export interface Cat {
  id: string;
  name: string;
  gender: 'male' | 'female';
  moons: number;
  skill: string;
  trait: string;
  breed?: string; // Optional for now, will be added to backend later
  level: number;
  experience: number;
  max_level: number;
  userId?: string; // Backend includes this
  createdAt?: string;
  updatedAt?: string;
}