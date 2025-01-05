import {BaseComponent} from "../shared/base-component.js";

export class ButtonComponent extends BaseComponent {
    constructor(label) {
        super();
        this.label = label;
        this.disabled = false;
        this.clickEventHandler = (ev) => {}
    }

    init() {
        console.log("CREATING ELEMENT");
        this.element = document.createElement('button');
        this.element.addEventListener('click', this.fireClickEventHandler.bind(this));
    }

    destroy() {
        this.element.removeEventListener('click', this.fireClickEventHandler);
    }

    update() {
        this.element.innerHTML = `${this.label}`;

        if(this.disabled) {
            this.element.setAttribute('disabled', 'true');
        } else {
            this.element.removeAttribute('disabled');
        }
    }

    /**
     *
     * @param {(ev: MouseEvent) => any} handler
     */
    setClickEventHandler(handler) {
        this.clickEventHandler = handler;
    }

    /**
     *
     * @param {MouseEvent} ev
     */
    fireClickEventHandler(ev) {
        if(this.clickEventHandler) {
            this.clickEventHandler(ev);
        }
    }
}