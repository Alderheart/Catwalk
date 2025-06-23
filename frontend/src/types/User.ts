export interface User {
  id: string;
  email: string;
  username: string;
  coins: number;
  daily_energy: number;
  max_daily_energy: number;
  energy_regen_rate_minutes: number;
  last_energy_update: string;
  created_at: string;
  updated_at: string;
}