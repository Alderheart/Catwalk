export interface Cat {
  id: string;
  name: string;
  gender: 'male' | 'female';
  moons: number;
  skill: string;
  trait: string;
  breed?: string; // Optional for now, will be added to backend later
  userId?: string; // Backend includes this
  createdAt?: string;
  updatedAt?: string;
}