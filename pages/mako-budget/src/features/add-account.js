// Handles adding accounts

import {BaseComponent} from "../shared/base-component.js";
import {Bus} from "../services/bus.js";

export class AddAccountFeature extends BaseComponent {


    constructor() {
        super();
    }

    init() {
        super.init();

        this.name = '';
        this.openingBalance = 0;

        Bus.listen('account-added', () => {
            this.name = '';
            this.openingBalance = 0;
            this.render();
        })
    }

    update() {
        const container = this.element.querySelector('.container');
        const btnSubmit = container.querySelector('.btn-submit');
        if(this.name) {
            btnSubmit.removeAttribute('disabled');
        } else {
            btnSubmit.setAttribute('disabled', 'true');
        }
    }

    setup() {
        const container = this.element.querySelector('.container');
        const btnSubmit = container.querySelector('.btn-submit');
        const inpName = container.querySelector('.inpName');
        const inpBalance = container.querySelector('.inpBalance');

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

        inpBalance.onchange = (ev) => {
            const newBalance = +ev.target.value;
            if(!isNaN(newBalance)) {
                this.openingBalance = newBalance;
                this.update();
            } else {
                inpBalance.value = this.openingBalance;
            }
        }

        btnSubmit.onclick = () => {
            if(!this.name) return;

            Bus.dispatch('add-account', {
                name: this.name,
                balance: this.openingBalance,
            });
        }
    }

    render() {
        const template = `
            <div class="container card-flat flex-v">
                <h3>Add Account</h3>                
                
                <span style="display: flex; gap: 1.5rem; justify-content: space-between; align-items: center;">    
                    <label for="add-account__inp-name" class="bold">Name</label>
                    <input type="text" required id="add-account__inp-name" value="${this.name}" class="inpName" />
                </span>
                
                <span style="display: flex; gap: 1.5rem; justify-content: space-between; align-items: center;">
                    <label for="add-account__inp-opening-balance" class="bold">Opening Balance</label>
                    <input type="number" inputmode="decimal" required value="${this.openingBalance.toFixed(2)}" class="inpBalance" id="add-account__inp-opening-balance" />
                </span>
                
                <input type="submit" class="btn-submit" value="Add Account" />
            </div>
        `;
        this.renderTemplate(template);
        this.setup();
    }

}