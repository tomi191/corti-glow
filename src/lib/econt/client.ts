// Econt API Client with Basic HTTP Authentication

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const ECONT_API_URL = getRequiredEnv("ECONT_API_URL");
const ECONT_USERNAME = getRequiredEnv("ECONT_USERNAME");
const ECONT_PASSWORD = getRequiredEnv("ECONT_PASSWORD");

interface EcontResponse<T> {
  data?: T;
  error?: string;
}

class EcontClient {
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    this.baseUrl = ECONT_API_URL.endsWith("/")
      ? ECONT_API_URL
      : `${ECONT_API_URL}/`;

    // Basic Auth header
    const credentials = Buffer.from(
      `${ECONT_USERNAME}:${ECONT_PASSWORD}`
    ).toString("base64");
    this.authHeader = `Basic ${credentials}`;
  }

  async request<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<EcontResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authHeader,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Econt API Error [${endpoint}]:`, errorText);
        return {
          error: `Econt API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();

      // Check for Econt-specific errors
      if (data.error) {
        return { error: data.error.message || data.error };
      }

      return { data };
    } catch (error) {
      console.error(`Econt API Request Failed [${endpoint}]:`, error);
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Nomenclatures API
  async getNomenclatures<T>(
    type: string,
    params?: Record<string, unknown>
  ): Promise<EcontResponse<T>> {
    return this.request<T>("Nomenclatures/NomenclaturesService.getNomenclatures.json", {
      nomenType: type,
      ...params,
    });
  }

  // Shipments API
  async createShipment<T>(
    shipmentData: Record<string, unknown>
  ): Promise<EcontResponse<T>> {
    return this.request<T>("Shipments/LabelService.createLabel.json", shipmentData);
  }

  // Tracking API
  async trackShipment<T>(
    shipmentNumbers: string[]
  ): Promise<EcontResponse<T>> {
    return this.request<T>("Shipments/ShipmentService.getShipmentStatuses.json", {
      shipmentNumbers,
    });
  }
}

// Singleton instance
let clientInstance: EcontClient | null = null;

export function getEcontClient(): EcontClient {
  if (!clientInstance) {
    clientInstance = new EcontClient();
  }
  return clientInstance;
}

export { EcontClient };
