import { getAuthToken } from '../stores/authStore';
import { API_BASE_URL } from '../config/api';

// Backend response format (snake_case)
interface BackendEnergyData {
  daily_energy: number;
  max_daily_energy: number;
  energy_regen_rate_minutes: number;
  minutes_until_next_energy: number;
  is_at_max: boolean;
}

// Frontend format (camelCase)
export interface EnergyStatus {
  currentEnergy: number;
  maxEnergy: number;
  regenRateMinutes: number;
  minutesUntilNext: number;
  isAtMax: boolean;
}

export interface ConsumeEnergyRequest {
  amount?: number; // defaults to 1
}

export interface UpdateEnergySettingsRequest {
  max_daily_energy?: number;
  energy_regen_rate_minutes?: number;
}

export interface EnergyResponse {
  success: boolean;
  data?: BackendEnergyData;
  error?: {
    code: string;
    message: string;
  };
}

class EnergyService {
  private getAuthHeaders() {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Convert backend snake_case to frontend camelCase
   */
  private convertToFrontendFormat(backendData: BackendEnergyData): EnergyStatus {
    return {
      currentEnergy: backendData.daily_energy,
      maxEnergy: backendData.max_daily_energy,
      regenRateMinutes: backendData.energy_regen_rate_minutes,
      minutesUntilNext: backendData.minutes_until_next_energy,
      isAtMax: backendData.is_at_max
    };
  }

  /**
   * Get current energy status with auto-regeneration
   */
  async getEnergyStatus(): Promise<EnergyStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/energy`, {
        headers: this.getAuthHeaders(),
      });

      const result: EnergyResponse = await response.json();
      
      if (result.success && result.data) {
        return this.convertToFrontendFormat(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch energy status');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to connect to server');
    }
  }

  /**
   * Manually consume energy
   */
  async consumeEnergy(amount: number = 1): Promise<EnergyStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/energy/consume`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount }),
      });

      const result: any = await response.json();
      
      if (result.success && result.data) {
        // Convert from consume energy response format
        const backendData: BackendEnergyData = {
          daily_energy: result.data.daily_energy,
          max_daily_energy: result.data.max_daily_energy,
          energy_regen_rate_minutes: result.data.energy_regen_rate_minutes || 15,
          minutes_until_next_energy: 0, // Not provided by consume endpoint
          is_at_max: result.data.daily_energy >= result.data.max_daily_energy
        };
        return this.convertToFrontendFormat(backendData);
      } else {
        throw new Error(result.error?.message || 'Failed to consume energy');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to connect to server');
    }
  }

  /**
   * Update energy system settings (for upgrades)
   */
  async updateEnergySettings(settings: UpdateEnergySettingsRequest): Promise<EnergyStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/energy/settings`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      const result: any = await response.json();
      
      if (result.success && result.data) {
        // After updating settings, fetch fresh energy status
        return this.getEnergyStatus();
      } else {
        throw new Error(result.error?.message || 'Failed to update energy settings');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to connect to server');
    }
  }
}

export const energyService = new EnergyService();