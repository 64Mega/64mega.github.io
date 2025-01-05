import {BaseComponent} from "./shared/base-component.js";
import {CounterFeature} from "./features/counter.js";
import {AddAccountFeature} from "./features/add-account.js";

// Include services
import "./services/account-manager.js";
import "./services/entry-manager.js";
import {Bus} from "./services/bus.js";
import {AccountListFeature} from "./features/account-list.js";
import {EntryListFeature} from "./features/entry-list.js";
import {AddEntryFeature} from "./features/add-entry.js";

export class App extends BaseComponent {
    init() {
        super.init();
        this.addAccountFeature = new AddAccountFeature();
        this.accountListFeature = new AccountListFeature();
        this.entryListFeature = new EntryListFeature();
        this.addEntryFeature = new AddEntryFeature();

        this.accountMode = 'view';
        this.entryMode = 'view';

        Bus.listen('app-wait', (state) => {
            const modal = this.element.querySelector('.app-waiter');

            modal.oncancel = (ev) => {
                ev.preventDefault();
            }

            console.log("Received app-wait with state", state);
            if(state.value > 0) {
                const modalMessage = modal.querySelector('.message');
                modalMessage.textContent = state.messages[state.messages.length-1];
                modal.showModal();
            } else {
                modal.close();
            }
        });

        Bus.listen('app-error', (message) => {
            const modal = this.element.querySelector('.app-error');
            const modalMessage = modal.querySelector('.message');
            const modalButton = modal.querySelector('button');

            modalButton.onclick = () => {
                modal.close();
            }

            modalMessage.textContent = message;
            modal.showModal();
        });

        Bus.listen('click-add-account', () => {
            this.accountMode = 'add';
            this.render();
        });

        Bus.listen('account-added', () => {
            this.accountMode = 'view';
            this.render();
        });

        Bus.listen('click-add-entry', () => {
            this.entryMode = 'add';
            this.render();
        });

        Bus.listen('entry-added', () => {
            this.entryMode = 'view';
            this.render();
        });
    }

    setup() {
        const container = this.element.querySelector('.container');

        container.style = `
            display: flex;
            flex-direction: column;
            gap: 2rem;
        `;

        if(this.accountMode === 'view') {
            const accountList = container.querySelector('.app-account-list');
            this.accountListFeature.attach(accountList);
        } else if(this.accountMode === 'add') {
            const addAccount = container.querySelector('.app-add-account');
            this.addAccountFeature.attach(addAccount);
        }

        if(this.entryMode === 'view') {
            const entryList = container.querySelector('.app-entry-list');
            this.entryListFeature.attach(entryList);
        } else if(this.entryMode === 'add') {
            const addEntry = container.querySelector('.app-add-entry');
            this.addEntryFeature.attach(addEntry);
        }
    }

    render() {
        const template = `
            <div class="container">
                <div class="app-add-account"></div>
                <div class="app-account-list"></div>
                <div class="app-add-entry"></div>
                <div class="app-entry-list"></div>
                
                
                <dialog class="app-waiter" >
                    <div class="card">
                        <p class="message">Loading...</p>
                    </div>
                </dialog>
                <dialog class="app-error">
                    <div class="card">
                        <button class="close-button"></button>
                        <h3 class="title">An Error Has Occurred</h3>
                        <p class="message">Something Went Wrong D:</p>
                    </div>
                </dialog>
            </div>
        `;

        this.renderTemplate(template);

        this.setup();
    }
}