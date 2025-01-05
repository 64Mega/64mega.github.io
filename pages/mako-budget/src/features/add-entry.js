// Handles adding budget entries

import {BaseComponent} from "../shared/base-component.js";
import {Bus} from "../services/bus.js";

export class AddEntryFeature extends BaseComponent {
    constructor() {
        super();
    }

    init() {
        super.init();

        this.name = '';
        this.qty = 1;
        this.target = 0;
        this.actual = 0;
        this.skip = false;

        Bus.listen('entry-added', () => {
            this.name = '';
            this.qty = 1;
            this.target = 0;
            this.actual = 0;
            this.skip = false;
            this.render();
        });
    }

    get isValidForm() {
        return this.name && this.qty > 0;
    }

    update() {
        const container = this.element.querySelector('.container');
        const btnSubmit = container.querySelector('.btn-submit');
        if(this.isValidForm) {
            btnSubmit.removeAttribute('disabled');
        } else {
            btnSubmit.setAttribute('disabled', 'true');
        }
    }

    setup() {
        const container = this.element.querySelector('.container');
        const btnSubmit = container.querySelector('.btn-submit');
        const inpName = container.querySelector('.inpName');
        const inpQty = container.querySelector('.inpQty');
        const inpTarget = container.querySelector('.inpTarget');
        const inpActual = container.querySelector('.inpActual');
        // const inpSkip = container.querySelector('.inpSkip');

        container.style = `
            border: 1px solid black;
            border-radius: 4px;
            padding: 0.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        `;

        inpName.onchange = (ev) => {
            this.name = ev.target.value;
            this.update();
        }

        inpQty.onchange = (ev) => {
            const newBalance = +ev.target.value;
            if(!isNaN(newBalance) && newBalance > 0) {
                this.qty = newBalance;
                this.update();
            } else {
                inpQty.value = this.qty;
            }
        }

        inpTarget.onchange = (ev) => {
            const newBalance = +ev.target.value;
            if(!isNaN(newBalance) && newBalance > 0) {
                this.target = newBalance;
                this.update();
            } else {
                inpTarget.value = this.target;
            }
        }

        inpActual.onchange = (ev) => {
            const newBalance = +ev.target.value;
            if(!isNaN(newBalance) && newBalance > 0) {
                this.actual = newBalance;
                this.update();
            } else {
                inpActual.value = this.actual;
            }
        }

        // inpSkip.onchange = (ev) => {
        //     this.skip = ev.target.checked;
        //     this.update();
        // }

        btnSubmit.onclick = () => {
            if(!this.name) return;

            Bus.dispatch('add-entry', {
                name: this.name,
                qty: this.qty,
                target: this.target,
                actual: this.actual,
                skip: this.skip,
            });
        }
    }

    render() {
        const template = `
            <div class="container card-flat flex-v">
                <h3>Add Budget Entry</h3>                
                
                <span style="display: flex; gap: 1.5rem; justify-content: space-between; align-items: center;">    
                    <label for="add-account__inp-name" class="bold">Name</label>
                    <input type="text" required id="add-account__inp-name" value="${this.name}" class="inpName" />
                </span>
                
                <span style="display: flex; gap: 1.5rem; justify-content: space-between; align-items: center;">
                    <label for="add-account__inp-qty" class="bold">Qty</label>
                    <input inputmode="numeric" type="number" value="${this.qty}" class="inpQty" id="add-account__inp-qty" />
                </span>
                
                <span style="display: flex; gap: 1.5rem; justify-content: space-between; align-items: center;">
                    <label for="add-account__inp-target" class="bold">Target</label>
                    <input inputmode="decimal" type="number" value="${this.target.toFixed(2)}" class="inpTarget" id="add-account__inp-target" />
                </span>
                
                <span style="display: flex; gap: 1.5rem; justify-content: space-between; align-items: center;">
                    <label for="add-account__inp-actual" class="bold">Actual</label>
                    <input inputmode="decimal" type="number" value="${this.actual.toFixed(2)}" class="inpActual" id="add-account__inp-actual" />
                </span>                
                
                <input type="submit" class="btn-submit" value="Add Entry" />
            </div>
        `;
        this.renderTemplate(template);
        this.setup();
    }

}