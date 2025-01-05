// Simple event bus for system events
export class BusImpl {
    constructor() {
        this.listeners = [];
        this.channelCounts = [];
    }

    listen(channel, callback) {
        this.listeners.push({channel, callback});
    }

    dispatch(channel, data) {
        this.#sendMessages(channel, data);
    }

    dispatchAddCount(channel, message = "Loading...") {
        console.log("DispatchAddCount for", channel, message);
        if(!this.channelCounts[channel]) {
            this.channelCounts[channel] = { value: 0, messages: [] };
        }

        this.channelCounts[channel].value += 1;
        this.channelCounts[channel].messages.push(message);

        this.#sendMessages(channel, this.channelCounts[channel]);
    }

    dispatchRemoveCount(channel) {
        console.log("DispatchRemoveCount for", channel);
        if(!this.channelCounts[channel]) {
            this.channelCounts[channel] = { value: 1, messages: ['Busy...'] };
        }

        if(this.channelCounts[channel].value > 0) {
            this.channelCounts[channel].value -= 1;
            this.channelCounts[channel].messages.pop();
        }

        this.#sendMessages(channel, this.channelCounts[channel]);
    }

    #sendMessages(channel, data) {
        const listenersToRemove = [];
        for (const listener of this.listeners) {
            try {
                if (listener.channel !== channel) continue;
                listener.callback(data);
            } catch (err) {
                if (err.prototype.constructor === ReferenceError) {
                    // Remove listener after loop, it's become detached
                    console.log("Marked listener for removal");
                    listenersToRemove.push(listener);

                } else {
                    console.error(err);
                }
            }
        }

        this.listeners = this.listeners.filter(i => listenersToRemove.indexOf(i) === -1);
    }
}

const Bus = new BusImpl();

export {Bus};