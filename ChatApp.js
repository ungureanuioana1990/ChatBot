import Chatbot from './src/components/Chatbot.js';
import DataLoader from './src/utils/DataLoader.js';
import UIHelper from './src/utils/UIHelper.js';

class ChatApp {
    constructor() {
        this.chatbot = null;

    }

    async initializeChatbot() {
        try {
            this.stockData = await DataLoader.loadStockData(); // Store loaded stock data
            this.chatbot = new Chatbot(this.stockData, this.renderCallback.bind(this));
            this.chatbot.start();
        } catch (error) {
            console.error("Error loading stock data:", error);
            this.displayContent("Sorry, we're unable to load stock data at the moment.", 'chat-messages', 'error');
        }
    }

    renderCallback(content, type) {

        const chatMessagesId = 'chat-messages';

        switch (type) {
            case 'homeMenu':
            case 'selectStock':
                this.displayOptions(content.options, content.message, chatMessagesId, type);
                break;
            case 'message':
                if (content.message.startsWith('Stock price of')) {
                    this.displayContent(content.message, chatMessagesId, 'header');
                    this.displayMainMenu(chatMessagesId);
                } else {
                    this.displayContent(content.message, chatMessagesId, 'header');
                }
                break;
            case 'stockSelected':
                this.displayContent(content.message, chatMessagesId, 'selected');
                this.displayMainMenu(chatMessagesId);
                break;
            case 'mainMenu':
                this.displayContent(content.message, chatMessagesId, 'header');
                this.createAndAppendButton({
                    className: 'menu-btn',
                    content: 'Main Menu',
                    onClick: () => {
                        this.chatbot.promptStockExchangeSelection();
                    }
                }, chatMessagesId);
                break;
            case 'goBack':
                this.createAndAppendButton({
                    className: 'menu-btn',
                    content: 'Go Back',
                    onClick: () => {
                        this.chatbot.goBack();
                    }
                }, chatMessagesId);
                break;
            default:
                break;
        }
    }

    displayContent(message, chatMessagesId, className = 'message') {

        const messageDiv = UIHelper.createElement('div', { className: `chat-message ${className}`, content: message });
        UIHelper.appendToParent(chatMessagesId, messageDiv);
    }

    displayOptions(options, headerMessage, chatMessagesId, type) {
        console.error(options);
        if (headerMessage) {
            this.displayContent(headerMessage, chatMessagesId, 'header');
        }

        options.forEach(option => {
            this.createAndAppendButton({
                className: 'exchange-btn',
                content: option.text,
                onClick: () => {
                    const actionType = type === 'homeMenu' ? 'selectExchange' : 'selectStock';
                    this.chatbot.handleUserInput(actionType, option.code);
                    this.displayContent(option.text, 'chat-messages', 'selected');
                }
            }, chatMessagesId);
        });
    }

    createAndAppendButton({ className, content, onClick }, parentId) {
        const button = UIHelper.createButton({ className, content, onClick });
        UIHelper.appendToParent(parentId, button);
    }

    displayMainMenu(parentId) {
        this.createAndAppendButton({
            className: 'menu-btn',
            content: 'Main Menu',
            onClick: () => {
                this.chatbot.promptStockExchangeSelection();
            }
        }, parentId);

        this.createAndAppendButton({
            className: 'menu-btn',
            content: 'Go Back',
            onClick: () => {
                this.chatbot.goBack();
            }
        }, parentId);
    }

    initializeUI() {

        const sendButton = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');

        if (sendButton) {
            sendButton.addEventListener('click', async () => {
                const inputValue = chatInput.value.trim();
                if (inputValue) {
                    const actionType = 'selectExchange';
                    this.chatbot.handleUserInput(actionType, inputValue.toUpperCase());
                    this.displayContent(inputValue, 'chat-messages', 'user');
                }
            });
        } else {
            console.error('Send button not found!');
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', async (event) => {
                if (event.key === 'Enter') {
                    const inputValue = chatInput.value.trim();
                    if (inputValue) {
                        await this.handleUserInput(inputValue);
                        this.displayContent(inputValue, 'chat-messages', 'user');
                        chatInput.value = '';
                    }
                }
            });
        } else {
            console.error('Chat input not found!');
        }
    }

    async handleUserInput(inputValue) {

        if (typeof inputValue === 'string') {
            const botResponse = await this.respondToUser(inputValue); // Await the response
            // Display the bot's response
            if (botResponse) {
                this.displayContent(botResponse, 'chat-messages', 'bot');
            }
        } else {
            console.error('Input value received by handleUserInput is not a string:', inputValue);
        }
    }

    async respondToUser(inputValue) {
        if (typeof inputValue !== 'string' || !inputValue.trim()) {
            this.displayContent("Sorry, I didn't understand that.", 'chat-messages', 'bot');
            return;
        }
        const stockExchangeQuery = inputValue.trim().toLowerCase();
        const stock = this.stockData.find(s => s.stockExchange.toLowerCase() === stockExchangeQuery);
        if (stock) {
            const message = `The current price of ${stock.stockExchange} is ${stock.topStock}.`;
            this.displayContent(message, 'chat-messages', 'bot');
        } else {
            this.displayContent("I couldn't find that stock. Please try another name.", 'chat-messages', 'bot');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new ChatApp();
    chatApp.initializeChatbot();
    chatApp.initializeUI();
});
