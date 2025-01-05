import {BaseComponent} from "../shared/base-component.js";
import {Bus} from "../services/bus.js";
import {appDb} from "../services/db.js";

export class EntryListFeature extends BaseComponent {
    constructor() {
        super();
        this.entries = [];
        this.accounts = [];
    }

    init() {
        super.init();

        this.fetchDataAndRender();

        Bus.listen('entry-added', () => {
            this.fetchDataAndRender();
        });

        Bus.listen('entry-updated', () => {
            this.fetchDataAndRender();
        });

        Bus.listen('entry-deleted', () => {
            this.fetchDataAndRender();
        });

        Bus.listen('account-updated', () => {
            this.fetchDataAndRender();
        })
    }

    fetchDataAndRender() {
        const impl = async () => {
            const entries = await appDb.getAll('entries');
            const accounts = await appDb.getAllKeys('accounts');

            this.entries = entries || [];
            this.accounts = accounts || [];
        }

        impl().then(() => {
            this.render();
        })
    }

    setup() {
        const entries = this.entries || [];
        const accounts = this.accounts || [];
        const container = this.element.querySelector('.container');
        const btnAddAccount = container.querySelector('.btn-add-entry');

        for(let i = 0; i < entries.length; i++) {
            const btn = container.querySelector(`.btn-delete-${i}`);
            if(btn) {
                btn.onclick = () => {
                    if(confirm("Are you sure you want to delete this entry?")) {
                        Bus.dispatch('delete-entry', entries[i]);
                    }
                }
            }

            const skipChk = container.querySelector(`.chk-skip-${i}`);
            if(skipChk) {
                if(entries[i].skip) {
                    console.log("Setting to skip")
                    skipChk.setAttribute('checked', 'true');
                }

                skipChk.onchange = () => {
                    const update = {...entries[i]};
                    update.skip = skipChk.checked;

                    Bus.dispatch('update-entry', update);
                }
            }

            const inpQty = container.querySelector(`.inp-qty-${i}`);
            if(inpQty) {
                inpQty.onchange = () => {
                    const update = {...entries[i]};
                    update.qty = +inpQty.value;

                    if(isNaN(update.qty)) { return; }

                    Bus.dispatch('update-entry', update);
                }
            }

            const inpTarget = container.querySelector(`.inp-target-${i}`);
            if(inpTarget) {
                inpTarget.onchange = () => {
                    const update = {...entries[i]};
                    update.target = +inpTarget.value;

                    if(isNaN(update.target)) { return; }

                    Bus.dispatch('update-entry', update);
                }
            }

            const inpActual = container.querySelector(`.inp-actual-${i}`);
            if(inpActual) {
                inpActual.onchange = () => {
                    const update = {...entries[i]};
                    update.actual = +inpActual.value;

                    if(isNaN(update.actual)) { return; }

                    Bus.dispatch('update-entry', update);
                }
            }

            const select = container.querySelector(`.select-account-${i}`);
            if(select) {
                if(!entries[i].account) {
                    const defOpt = document.createElement("option");
                    defOpt.text = 'None';
                    select.appendChild(defOpt);
                }

                for(const account of accounts) {
                    const newOpt = document.createElement("option");
                    newOpt.text = account.value.name;
                    newOpt.value = account.key;

                    if(entries[i].account?.toString() === account.key.toString()) {
                        newOpt.selected = true;
                    }

                    select.appendChild(newOpt);
                }

                select.onchange = (ev) => {
                    const update = {...entries[i]};
                    update.account = ev.target.value;
                    Bus.dispatch('update-entry', update);
                }
            }

            const inpName = container.querySelector(`.inp-name-${i}`);
            if(inpName) {
                inpName.onchange = (ev) => {
                    const update = {...entries[i]};
                    update.name = ev.target.value;
                    Bus.dispatch('update-entry', update);
                }
            }
        }

        btnAddAccount.onclick = () => {
            Bus.dispatch('click-add-entry');
        }
    }

    render() {
        const entries = this.entries || [];

        if(!this.entries && !this.accounts) {
            this.fetchDataAndRender();
        }

        const createListEntry = (item, index) => {
            return `<tr class="list-entry">
                <td class="name" style="min-width: 90px;">
                    <input value="${item.name}" class="table-input inp-name-${index}" type="text">
                </td>
                <td class="qty" style="font-family: monospace; width: 24px; text-align: center;">
                    <input type="number" inputmode="numeric" value="${item.qty}" min="1" step="1" class="table-input  inp-qty-${index}">
                </td>
                <td class="target" style="font-family: monospace; min-width: 90px; text-align: right;">
                    <input type="number" inputmode="decimal" value="${item.target.toFixed(2)}" min="1" step="0.01" class="table-input inp-target-${index}">
                </td>
                <td class="actual" style="font-family: monospace; width: 90px; text-align: right;">
                    <input type="number" inputmode="decimal" value="${item.actual.toFixed(2)}" min="1" step="0.01" class="table-input inp-actual-${index}">
                </td>
                <td class="account">
                    <select class="table-input select-account-${index}"></select>
                </td>
                <td class="skip" style="width: 1rem;"><input type="checkbox" class="chk-skip-${index}" style="transform: translate(0.75rem);"></td>
                <td class="delete" style="width: 24px;"><button class="btn-delete-${index} close-button"></button></td>
            </tr>`
        }

        const template = `
            <div class="container card-flat flex-v">
                <span style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="padding: 0; margin: 0;">Budget Entries</h3>
                    <button class="btn-add-entry">Add</button>
                </span>
                <table class="list">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Name</th>
                            <th>Qty</th>
                            <th>Target</th>
                            <th>Actual</th>
                            <th>Source Account</th>
                            <th>Skip?</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map(createListEntry).join('')}
                    </tbody>            
                </table>    
            </div>
        `;

        this.renderTemplate(template);

        console.log("RENDERING ENTRY LIST", this.element);
        this.setup();
    }
}