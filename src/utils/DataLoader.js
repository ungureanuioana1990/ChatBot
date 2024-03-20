export default class DataLoader {

    static async loadStockData() {

        try {
            const response = await fetch('./data/stockData.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Could not load stock data:", error);
            return null;
        }
    }
}
