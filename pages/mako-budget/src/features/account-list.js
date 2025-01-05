import {BaseComponent} from "../shared/base-component.js";
import {appDb} from "../services/db.js";
import {Bus} from "../services/bus.js";

export class AccountListFeature extends BaseComponent {
    constructor() {
        super();
        this.accounts = [];
        this.entries = [];
    }


    init() {
        this.accounts = [];

        this.fetchDataAndRender();

        Bus.listen('account-added', () => {
            this.fetchDataAndRender();
        });

        Bus.listen('account-deleted', () => {
            this.fetchDataAndRender();
        });

        Bus.listen('account-updated', () => {
            this.fetchDataAndRender();
        });

        Bus.listen('entry-updated', () => {
            this.fetchDataAndRender();
        })

        Bus.listen('entry-added', () => {
            this.fetchDataAndRender();
        })
    }

    fetchDataAndRender() {
        const impl = async () => {
            const accounts = await appDb.getAllKeys('accounts');
            this.entries = await appDb.getAllKeys('entries');
            this.accounts = accounts;
        }

        impl().then(() => {
            this.render();
        });
    }

    setup() {
        const container = this.element.querySelector('.container');
        const btnAddAccount = container.querySelector('.btn-add-account');

        for(let i = 0; i < this.accounts.length; i++) {
            const btn = container.querySelector(`.btn-delete-${i}`);
            if(btn) {
                btn.onclick = () => {
                    if(confirm("Are you sure you want to delete this account?")) {
                        Bus.dispatch('delete-account', this.accounts[i].value);
                    }
                }
            }

            const openingBalance = container.querySelector(`.opening-balance-${i}`);
            if(openingBalance) {
                console.log(`Registering listener for`, openingBalance);
                openingBalance.onchange = (ev) => {
                    const update = {...this.accounts[i].value};
                    update.balance = +ev.target.value;
                    update.oldName = update.name; // HACK

                    if(isNaN(update.balance)) { return; }

                    Bus.dispatch('update-account', update);
                }
            }

            const inpName = container.querySelector(`.inp-name-${i}`);
            if(inpName) {
                inpName.onchange = (ev) => {
                    const update = {...this.accounts[i].value};
                    update.name = ev.target.value;
                    update.oldName = this.accounts[i].value.name;
                    Bus.dispatch('update-account', update);
                }
            }

            const calc = container.querySelector(`.calc-${i}`);
            if(calc) {
                // Do balance calculations
                const applicableItems = this.entries.map(x => x.value).filter(x => x.account?.toString() === this.accounts[i].key.toString()  && !x.skip);
                const sum = applicableItems.reduce((acc, x) => acc + x.target * x.qty, 0);
                calc.innerText = (this.accounts[i].value.balance - sum).toFixed(2);
            }

            const calcActual = container.querySelector(`.calc-actual-${i}`);
            if(calcActual) {
                // Do balance calculations
                const applicableItems = this.entries.map(x => x.value).filter(x => x.account?.toString() === this.accounts[i].key.toString()  && !x.skip);
                const sum = applicableItems.reduce((acc, x) => acc + x.actual * x.qty, 0);
                calcActual.innerText = (this.accounts[i].value.balance - sum).toFixed(2);
            }
        }

        if(this.entries) {
            const calcTotal = container.querySelector(`.total-balance`);
            if(calcTotal) {
                // Do balance calculations
                const applicableItems = this.entries.map(x => x.value).filter(x => x.account !== undefined && !x.skip);
                const sum = applicableItems.reduce((acc, x) => acc + x.target * x.qty, 0);
                const balance = this.accounts.reduce((acc, x) => acc + x.value.balance, 0);

                calcTotal.innerText = (balance - sum).toFixed(2);
            }

            const calcTotalActual = container.querySelector(`.total-actual`);
            if(calcTotalActual) {
                // Do balance calculations
                const applicableItems = this.entries.map(x => x.value).filter(x => x.account !== undefined && !x.skip);
                const sum = applicableItems.reduce((acc, x) => acc + x.actual * x.qty, 0);
                const balance = this.accounts.reduce((acc, x) => acc + x.value.balance, 0);

                calcTotalActual.innerText = (balance - sum).toFixed(2);
            }
        }

        btnAddAccount.onclick = () => {
            Bus.dispatch('click-add-account');
        }
    }

    render() {
        if(!this.accounts) return;

        const createListEntry = (item, index) => {
            return `<tr class="list-entry">
                <td class="name">
                    <input value="${item.value.name}" class="table-input inp-name-${index}" type="text">
                </td>
                <td class="balance" style="font-family: monospace; width: 90px; text-align: right;">
                    <input class="opening-balance-${index} table-input" value="${item.value.balance.toFixed(2)}">
                </td>                    
                <td class="calc-${index}" style="font-family: monospace; width: 90px; text-align: right;">0.00</td>
                <td class="calc-actual-${index}" style="font-family: monospace; width: 90px; text-align: right;">0.00</td>
                <td class="delete" style="width: 24px;"><button class="btn-delete-${index} close-button"></button></td>
            </tr>`
        }

        const template = `
            <div class="container card-flat flex-v">
                <span style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="padding: 0; margin: 0;">Account List</h3>
                    <button class="btn-add-account">Add</button>
                </span>
                <table class="list" style=" overflow: auto;">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Account Name</th>
                            <th>Opening</th>
                            <th>Target</th>
                            <th>Actual</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.accounts.map(createListEntry).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th scope="row" colspan="2">∑ Totals</th>
                            <td class="total-balance" style="text-align: right; font-family: monospace;"></td>
                            <td class="total-actual" style="text-align: right; font-family: monospace;"></td>
                        </tr>
                    </tfoot>        
                </table>    
            </div>
        `;

        this.renderTemplate(template);
        this.setup();
    }
}