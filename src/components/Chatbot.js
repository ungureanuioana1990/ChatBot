export default class Chatbot {

    constructor(stockExchanges, renderCallback) {
        this.stockExchanges = stockExchanges;
        this.renderCallback = renderCallback;
        this.navigationHistory = []; // Initialize the navigation history array
    }


    start() {
        this.send("Hello! Welcome to LSEG. I'm here to help you.");
        this.promptForSelection("Please select a stock Exchange", this.stockExchanges, 'homeMenu', 'selectExchange');
    }
    send(message, type = 'message', options = []) {
        this.renderCallback({ message, options }, type);
    }
    promptStockExchangeSelection() {
        this.promptForSelection("Please select a stock Exchange", this.stockExchanges, 'homeMenu', 'selectExchange');
    }
    promptForSelection(promptMessage, items, messageType, actionType) {
        const options = items.map(({ stockExchange, code, stockName }) => ({
            text: stockExchange || stockName,
            code
        }));
        this.navigationHistory.push({ promptMessage, items, messageType, actionType });
        this.send(promptMessage, messageType, options, actionType);
    }
    handleUserInput(inputType, inputData) {
        const inputActions = {
            'selectExchange': () => {
                this.selectExchange(inputData);
                this.clearInputField();
            },
            'selectStock': () => {
                this.selectStock(inputData);
                this.clearInputField();
            },
            'mainMenu': () => {
                this.promptForSelection("Main Menu", this.stockExchanges, 'homeMenu');
                this.clearInputField();
            },
            'goBack': () => {
                this.goBack();
                this.clearInputField();
            }
        };

        const action = inputActions[inputType];
        if (action) {
            action();
        } else {
            this.send(`Unhandled input type: ${inputType}`, 'error');
        }
    }
    clearInputField() {
        const inputField = document.getElementById('chat-input');
        if (inputField) {
            inputField.value = ''; // Clear the input field
        } else {
            console.error('Input field not found.');
        }
    }
    selectExchange(code) {
        const selectedExchange = this.stockExchanges.find(exchange => exchange.code.toUpperCase() === code.toUpperCase());
        if (!selectedExchange) {
            this.send("Exchange not found. Please select a valid exchange.", 'error');
        } else {
            setTimeout(() => {
                this.promptForSelection("Please select a stock from " + selectedExchange.stockExchange + ":", selectedExchange.topStocks, 'selectStock', 'selectStock');
            }, 1000);
        }
    }
    selectStock(code) {
        const stock = this.getSelectedStock(code);
        if (!stock) return this.send("Stock information not found.", 'error');
        this.send(`${stock.stockName}`, 'selected');
        setTimeout(() => {
            this.send(`Stock price of ${stock.stockName} is ${stock.price}. Please select an option.`);
        }, 500);
    }
    getSelectedStock(code) {
        if (!this.navigationHistory.length) return null;
        const { items } = this.navigationHistory[this.navigationHistory.length - 1];
        return items.find(stock => stock.code === code);
    }
    goBack() {
        if (this.navigationHistory.length > 0) {
            const previousMenu = this.navigationHistory.pop();
            this.promptForSelection(previousMenu.promptMessage, previousMenu.items, previousMenu.messageType, previousMenu.actionType);
        } else {
            this.promptForSelection("Please select a stock Exchange", this.stockExchanges, 'homeMenu', 'selectExchange');
        }
    }
}
