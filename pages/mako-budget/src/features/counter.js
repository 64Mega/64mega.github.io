import {BaseComponent} from "../shared/base-component.js";
import { appDb } from "../services/db.js";
import {Bus} from "../services/bus.js";

export class CounterFeature extends BaseComponent {
    init() {
        this.counter = 0;
        this.motherfucker = null;
        this.lastEvent = null;
        this.cvalue = 0;

        Bus.listen('fuck', this.onFuck.bind(this));
    }

    destroy() {

    }

    onFuck(event) {
        this.lastEvent = event;
        console.log("Fuckery is afoot...");
        this.update();
    }

    async setup() {
        if(!this.element) return;

        const btnCounterPlus = this.element.querySelector('.btn-counter-plus');
        const btnCounterMinus = this.element.querySelector('.btn-counter-min');
        const div = this.element.querySelector('.counter');

        btnCounterPlus.onclick = () => {
            this.counter++;
            appDb.update('counter', 1, (this.cvalue || 1) * 2).then(() => {
                this.update();
            });
        }

        btnCounterMinus.onclick = () => {
            this.counter--;
            this.update();
        }

        div.appendChild(this.motherfucker);
    }

    async update() {
        try {
            const cvalue = await appDb.getOne('counter', 1);

            if(cvalue === undefined) {
                await appDb.insert('counter', 0);
            } else {
                this.cvalue = cvalue;
                this.render();
            }
        } catch(err) {
            console.error(err);
        }
    }

    async render() {
        const test2 = `
        <div>
            <p>This motherfucker is stealing my attention away from what we're actually supposed to be doing, at least ${this.counter} time(s)!!!</p>
        </div>
        `;

        let lastEventInfo = this.lastEvent ? `
            <p>Last received event: ${JSON.stringify(this.lastEvent)}</p>
        ` : '';

        const template = `
            <div class="counter" style="padding: 0.5rem 1.5rem; border: 1px solid black; border-radius: 4px; display: flex; place-items: center; box-shadow: 1px 1px 2px #0005; flex-direction: column;">
                <div>The counter is currently at: ${this.counter}</div>
                <button class="btn-counter-min">Counter--</button>
                <button class="btn-counter-plus">Counter++</button>
                <p>CValue: ${this.cvalue}</p>
                ${lastEventInfo}     
            </div>
        `;


        this.motherfucker = this.renderTemplate(test2, true);

        this.renderTemplate(template);

        console.log(this.element);
        await this.setup();
    }
}