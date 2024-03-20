class UIHelper {

    static createElement(tag, { className, content }) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    static createButton({ className, content, onClick }) {
        const button = this.createElement('button', { className, content });
        button.addEventListener('click', onClick);
        return button;
    }

    static appendToParent(parentId, child) {
        const parent = document.getElementById(parentId);
        if (parent) {
            parent.appendChild(child);
        }
    }
}

export default UIHelper;
