import {Bus} from "./bus.js";
import {appDb} from "./db.js";

class AccountManagerImpl {
    constructor() {
        Bus.listen('add-account', this.onAddAccount.bind(this));
        Bus.listen('delete-account', this.onDeleteAccount.bind(this));
        Bus.listen('update-account', this.onUpdateAccount.bind(this));
    }

    onAddAccount(accountDetail) {
        console.log("Received an account to create:");
        console.log(`\tName: ${accountDetail.name}`);
        console.log(`\tOpening Balance: ${accountDetail.balance}`);

        Bus.dispatchAddCount('app-wait', "Adding Account");
        appDb.insert('accounts', accountDetail).then(() => {
            setTimeout(() => {
                Bus.dispatchRemoveCount('app-wait');
                Bus.dispatch('account-added');
            }, 500);
        }).catch((err) => {
            Bus.dispatch('app-error', err);
            Bus.dispatchRemoveCount('app-wait');
        });
    }

    async onDeleteAccount(account) {
        console.log(`Received an account to delete: ${account.name}`);

        const existingAccounts = await appDb.getAllKeys('accounts');
        const match = existingAccounts.find(a => a.value.name === account.name);

        Bus.dispatchAddCount('app-wait', "Deleting Account...");
        appDb.delete('accounts', match.key).then(() => {
            setTimeout(() => {
                Bus.dispatchRemoveCount('app-wait');
                Bus.dispatch('account-deleted');
            }, 500);
        }).catch((err) => {
            Bus.dispatch('app-error', err);
            Bus.dispatchRemoveCount('app-wait');
        });
    }

    async onUpdateAccount(account) {
        console.log("Received an account to update:", account);

        const existingEntries = await appDb.getAllKeys('accounts');
        const match = existingEntries.find(a => a.value.name === account.oldName);

        if(!match) return;

        Bus.dispatchAddCount('app-wait', "Saving changes...");
        appDb.update('accounts', match.key, account).then(() => {
            setTimeout(() => {
                Bus.dispatchRemoveCount('app-wait');
                Bus.dispatch('account-updated', account);
            }, 500);
        }).catch((err) => {
            Bus.dispatch('app-error', err);
            Bus.dispatchRemoveCount('app-wait');
        });
    }
}

const AccountManager = new AccountManagerImpl();
export {AccountManager};