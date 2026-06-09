export interface ZekrContent {
  zekr: string;
  repeat: number;
  bless: string;
  source: string;
}

export interface AzkarCategory {
  title: string;
  content: ZekrContent[];
}

export const AZKAR_ENDPOINTS = {
  /**
   * Returns all azkar categories and data
   * Method: GET
   */
  ALL_AZKAR: "https://raw.githubusercontent.com/nawafalqari/azkar-api/main/azkar.json",
  
  /**
   * Returns azkar for a specific category ID
   * Method: GET
   * @param categoryId ID of the hisn muslim category
   */
  HISN_MUSLIM_CATEGORY: (categoryId: string | number) => `https://www.hisnmuslim.com/api/ar/${categoryId}.json`
};
