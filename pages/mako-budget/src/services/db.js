const SCHEMA_VERSION = 3;

class AppDb {
    constructor() {
        this.db = null;
        this.error = false;
        this.ready = false;
        this.creating_db = false;
        this.db_creation_complete = false;
        this._spinlock_id = -1;

        this.init().then((res) => {
            console.log("Initialized DB");
            this.db = res;
            this.ready = true;
        }).catch((err) => {
            console.error("Error initializing db: ", err);
            this.error = true;
        });
    }

    #migrate(ev) {
        this.creating_db = true;

        /** @type {IDBDatabase} */
        const db = ev.target.result;
        const requests = [
            this.#createStore(db, 'accounts', (objectStore) => {
                objectStore.createIndex('name', 'name', {
                    unique: true,
                });
            }),
            this.#createStore(db, 'counter'),
            this.#createStore(db, 'entries', (objectStore) => {
                objectStore.createIndex('name', 'name', {
                    unique: true
                });
            })
        ]

        Promise.all(requests).then(() => {
            this.db_creation_complete = true;
        }).catch((err) => {
            console.error("Error bootstrapping db: ", err);
        });
    }

    /**
     * @param {IDBDatabase} db
     * @param {string} name
     * @param {(objectStore: IDBObjectStore) => any} builder
     * @returns {Promise<void>}
     */
    #createStore(db, name, builder = (objectStore) => {
    }) {
        return new Promise((resolve, reject) => {
            const objectStore = db.createObjectStore(name, {autoIncrement: true});

            builder(objectStore);

            objectStore.transaction.oncomplete = () => {
                resolve();
            }
        });
    }

    #spinlock_wait(resolve, reject) {
        if (this.creating_db && !this.db_creation_complete) {
            return;
        }
        if (this.ready) {
            resolve();
            clearInterval(this._spinlock_id);
        }
        if (this.error) {
            reject();
            clearInterval(this._spinlock_id);
        }
    }

    async #spinlock_ready() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve();
                return;
            }
            this._spinlock_id = setInterval(this.#spinlock_wait.bind(this, resolve, reject), 10);
        });
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(name, SCHEMA_VERSION);
            request.onsuccess = (ev) => {
                /** @type {IDBDatabase} **/
                const res = ev.target.result;
                this.ready = true;
                resolve(res);
            };

            request.onupgradeneeded = (ev) => {
                this.#migrate(ev);
            }

            request.onerror = (ev) => {
                reject(ev.error);
            };
        });
    }

    async insert(store, value) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readwrite");

            const objectStore = transaction.objectStore(store);
            const request = objectStore.add(value);
            request.onerror = (ev) => {
                console.error(ev.target.error);
                reject(ev.target.error);
            }

            request.onsuccess = (ev) => {
                console.log(`Inserted new value ${value} with result`, ev.target.result);

                resolve();
            }
        });
    }

    async update(store, key, value) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readwrite");

            console.log(`UPDATING ${store}:${key} WITH VALUE`, value);

            const objectStore = transaction.objectStore(store);
            const request = objectStore.put(value, key);

            request.onerror = (ev) => {
                console.error(ev.target.error);
                reject(ev.target.error);
            };

            request.onsuccess = (ev) => {
                resolve();
            }
        });
    }

    async delete(store, key) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], "readwrite");

            console.log(`DELETING ${store}:${key}`);

            const objectStore = transaction.objectStore(store);
            const request = objectStore.delete(key);
            request.onerror = (ev) => {
                console.error(ev.target.error);
                reject(ev.target.error);
            }

            request.onsuccess = (ev) => {
                resolve();
            }
        });
    }

    async getAllKeys(store) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            const objectStore = this.db.transaction(store).objectStore(store);
            const matches = [];
            objectStore.openCursor().onsuccess = (ev) => {
                const cursor = ev.target.result;

                if (cursor) {
                    matches.push({
                        key: cursor.key,
                        value: cursor.value
                    })
                    cursor.continue();
                } else {
                    resolve(matches);
                }
            }

        });
    }

    async getOne(store, key) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            console.log(this.db);
            const transaction = this.db.transaction(store, "readonly");
            transaction.oncomplete = (ev) => {
            }
            transaction.onerror = (ev) => {
                console.error(ev.error);
                reject(ev.error);
            }

            const objectStore = transaction.objectStore(store);


            const request = objectStore.get(key);
            request.onsuccess = (ev) => {
                resolve(request.result);
                console.log(`Retrieved value`, request.result);
            }

        });
    }

    async getAll(store, key) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readonly");
            transaction.onerror = (ev) => {
                console.error(ev.error);
                reject(ev.error);
            }

            const objectStore = transaction.objectStore(store);
            const request = objectStore.getAll(key);
            request.onsuccess = (ev) => {
                resolve(request.result);
            }
        });
    }

    async getByPredicate(store, key, predicate) {
        await this.#spinlock_ready();
        return new Promise((resolve, reject) => {
            const objectStore = this.db.transaction(store).objectStore(store);
            const matches = [];
            objectStore.openCursor().onsuccess = (ev) => {
                const cursor = ev.target.result;
                if (cursor) {
                    if (predicate(cursor.key, cursor.value)) {
                        matches.push({
                            key: cursor.key,
                            value: cursor.value
                        })
                    }
                    cursor.continue();
                } else {
                    resolve(matches);
                }
            }
        });
    }
}

const appDb = new AppDb();

export {appDb};