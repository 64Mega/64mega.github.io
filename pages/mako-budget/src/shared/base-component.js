/**
 * Base Component - contains some common helpers and methods that
 * can be overridden in children to change some behaviours
 */

export class BaseComponent {
    /** @type {HTMLElement|null} element Element to display **/
    element = null;

    constructor() {
        this.element = null;
        this.#init();
    }

    #init() {
        window.addEventListener('unload', this.#destroy.bind(this));
        this.init();
        this.render();
    }

    #destroy() {
        this.destroy();
    }

    #update() {
        this.update();
    }

    init() {

    }

    destroy() {
        // No-op for base component
    }

    update() {

    }

    render() {

    }

    /**
     * Attach this component to a target HTML element as a child
     * @param {HTMLElement} target
     */
    attach(target) {
        if(this.element === null) return;
        target.appendChild(this.element);

        this.#update();
    }

    renderTemplate(template, detached = false) {
        const domParser = new DOMParser();
        const newTemplate = `
        <html lang="en">
            <body>
                <div class="render-root">
                ${template}
                </div>
            </body>
        </html>`;

        const doc = domParser.parseFromString(newTemplate, 'text/html');

        const v = doc.body.children[0];

        if(v) {
            if(detached) {
                return v;
            }
            if(this.element) {
                this.element.innerHTML = v.innerHTML;
            } else {
                this.element = v;
            }

            return v;
        } else {
            console.log(doc);
            throw new Error("Could not find first element in parsed HTML");
        }
    }
}