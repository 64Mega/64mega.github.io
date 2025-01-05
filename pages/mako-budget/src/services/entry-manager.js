import {Bus} from "./bus.js";
import {appDb} from "./db.js";

class EntryManagerImpl {
    constructor() {
        Bus.listen('add-entry', this.onAddEntry.bind(this));
        Bus.listen('delete-entry', this.onDeleteEntry.bind(this));
        Bus.listen('update-entry', this.onUpdateEntry.bind(this));
    }

    onAddEntry(entry) {
        console.log("Received an entry to create:");
        console.log(JSON.stringify(entry, null, 2));

        Bus.dispatchAddCount('app-wait', "Adding budget item...");
        appDb.insert('entries', entry).then(() => {
            setTimeout(() => {
                Bus.dispatchRemoveCount('app-wait');
                Bus.dispatch('entry-added');
            }, 500);
        }).catch(err => {
            Bus.dispatch('app-error', err);
            Bus.dispatchRemoveCount('app-wait');
        });
    }

    async onDeleteEntry(entry) {
        console.log("Received an entry to delete:", entry);

        const existingEntries = await appDb.getAllKeys('entries');
        const match = existingEntries.find(a => a.value.name === entry.name);

        if(!match) return;

        Bus.dispatchAddCount('app-wait', "Deleting entry...");
        appDb.delete('entries', match.key).then(() => {
            setTimeout(() => {
                Bus.dispatchRemoveCount('app-wait');
                Bus.dispatch('entry-deleted');
            }, 500);
        }).catch((err) => {
            Bus.dispatch('app-error', err);
            Bus.dispatchRemoveCount('app-wait');
        });
    }

    async onUpdateEntry(entry) {
        console.log("Received an entry to update:", entry);

        const existingEntries = await appDb.getAllKeys('entries');
        const match = existingEntries.find(a => a.value.name === entry.name);

        if(!match) return;

        Bus.dispatchAddCount('app-wait', "Saving changes...");
        appDb.update('entries', match.key, entry).then(() => {
            setTimeout(() => {
                Bus.dispatchRemoveCount('app-wait');
                Bus.dispatch('entry-updated', entry);
            }, 500);
        }).catch((err) => {
            Bus.dispatch('app-error', err);
            Bus.dispatchRemoveCount('app-wait');
        });
    }
}

const EntryManager = new EntryManagerImpl();
export {EntryManager};