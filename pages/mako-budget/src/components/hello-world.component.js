export class HelloWorldComponent {
    /**
     *
     * @param {string} name
     */
    constructor(name) {
        this.name = name;
        this.element = document.createElement('div');

        this.#init();
    }

    #init() {
        this.element.style.border = '1px solid black';
        this.element.style.padding = '4px';
        this.element.style.borderRadius = '4px';
        this.element.style.boxShadow = '1px 1px 2px #0004';
        this.element.style.backgroundColor = '#fff';
    }

    /**
     * Attach component to target HTML element as a child
     * @param {HTMLElement} target
     */
    attach(target) {
        target.appendChild(this.element);
        this.update();
    }

    /**
     * Updates the component's layout
     */
    update() {
        this.element.innerHTML = `Hello ${this.name}!`;
    }
}