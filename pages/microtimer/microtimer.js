console.log("Hello World");
import {DateTime} from './luxon.min.js';

if(!navigator.serviceWorker?.controller) {
    navigator.serviceWorker.register("sw.js").then(function(reg) {
        console.log("Service worker has been registered for scope: " + reg.scope);
    });
}

class MicroTimer {
    static _id = 0;

    /**
     * Set up a new MicroTimer
     * @param {string} label
     * @param {string} targetDate
     * @param {string} attachToCssSelector
     * @param {(label: string, target: string) => any} delCb Deletion callback
     */
    constructor(label, targetDate, attachToCssSelector = 'body', delCb = () => null) {
        this.targetDate = targetDate;
        this.remaining_ms = 0;
        this.remaining_s = 0;
        this.remaining_m = 0;
        this.remaining_h = 0;
        this.remaining_d = 0;

        if((new Date(targetDate)) < (new Date())) {
            return this;
        }

        this.id = MicroTimer._id++;

        const element = document.createElement("div");
        element.id = `microtimer-${this.id}`;
        element.className = 'microtimer';

        this.element = element;

        const section = document.createElement("section");
        const header = document.createElement("h3");
        const div = document.createElement("div");
        const glassLight = document.createElement("div");
        const deleteButton = document.createElement("button");
        header.innerText = label;

        glassLight.classList.add('light');

        section.classList.add('glass', 'microtimer-section');
        section.appendChild(glassLight);
        section.appendChild(header);
        section.appendChild(div);

        deleteButton.innerText = 'X';
        deleteButton.classList.add('icon-button');

        deleteButton.addEventListener('click', () => {
            if(delCb) {
                delCb(label, targetDate);
            }
        })
        section.appendChild(deleteButton);

        div.appendChild(element);

        const target = document.querySelector(attachToCssSelector);
        target.appendChild(section);

        this.reloadData();

        setInterval(() => {
            this.reloadData();
        }, 10);

        this.isRunning = false;
    }

    reloadData() {
        const timeNow = (new Date()).getTime();
        const timeThen = (new Date(this.targetDate)).getTime();
        let timeDiff = timeThen - timeNow;

        let ms_bucket = 0;
        let s_bucket = 0;
        let m_bucket = 0;
        let h_bucket = 0;
        let d_bucket = 0;

        const day_ms = 1000 * 60 * 60 * 24;
        const hour_ms = 1000 * 60 * 60;
        const minute_ms = 1000 * 60;
        const second_ms = 1000;

        while(timeDiff >= day_ms) {
            timeDiff -= day_ms;
            d_bucket += 1;
        }
        while(timeDiff >= hour_ms) {
            timeDiff -= hour_ms;
            h_bucket += 1;
        }
        while(timeDiff >= minute_ms) {
            timeDiff -= minute_ms;
            m_bucket += 1;
        }
        while(timeDiff >= second_ms) {
            timeDiff -= second_ms;
            s_bucket += 1;
        }

        ms_bucket = timeDiff;

        this.remaining_d = d_bucket;
        this.remaining_h = h_bucket;
        this.remaining_m = m_bucket;
        this.remaining_s = s_bucket;
        this.remaining_ms = ms_bucket;

        this.updateDisplay();
    }

    updateDisplay() {
        this.element.innerText = `${this.remaining_d.toString().padStart(2, '0')}:${this.remaining_h.toString().padStart(2, '0')}:${this.remaining_m.toString().padStart(2, '0')}:${this.remaining_s.toString().padStart(2, '0')}:${this.remaining_ms.toString().padStart(4, '0')}`;
    }

}

const updateDataJSBackgroundAttachmentFixedElements = () => {
    // Find all elements with the `data-js-background-attachment-fixed` attribute
    const elements = document.querySelectorAll(
        "[data-js-background-attachment-fixed]",
    );

    for (const element of elements) {
        // Only consider `HTMLElement`s
        if (!(element instanceof HTMLElement)) continue;

        // Find the position of the element
        const clientRect = element.getBoundingClientRect();

        // Move the background position opposite the position in the viewport
        const backgroundPositionX = `${(-clientRect.x).toString()}px`;
        const backgroundPositionY = `${(-clientRect.y).toString()}px`;

        element.style.backgroundPositionX = backgroundPositionX;
        element.style.backgroundPositionY = backgroundPositionY;
    }
};

const initDataJSBackgroundAttachmentFixed = () => {
    requestAnimationFrame(() => {
        updateDataJSBackgroundAttachmentFixedElements();
        initDataJSBackgroundAttachmentFixed();
    });
};

initDataJSBackgroundAttachmentFixed();

function loadTimers() {
    const data = localStorage.getItem('microtimer-timers');
    if(!data) return;

    const payload = JSON.parse(data);
    if(!payload) return;

    if(!Array.isArray(payload)) return;

    for(const timer of payload) {
        new MicroTimer(timer.label, timer.target, '#timers', (label, target) => {
            console.log("Delete", label, target);
            deleteTimer(label, target);
        });
    }
}

function createTimer(label, target) {
    const data = localStorage.getItem('microtimer-timers');
    const payload = JSON.parse(data || '[]') || [];

    payload.push({
        label,
        target,
    });

    localStorage.setItem('microtimer-timers', JSON.stringify(payload));

    new MicroTimer(label, target, '#timers', (label, target) => {
        deleteTimer(label, target);
    });
}

function reloadTimers(target) {
    const timers = document.querySelectorAll('.microtimer-section');
    const targetElement = document.querySelector(target);

    if(!targetElement) return;

    for(const node of timers) {
        targetElement.removeChild(node);
    }

    loadTimers();
}

function deleteTimer(label,target) {
    if(confirm("Are you sure you want to delete this timer?")) {
        const data = localStorage.getItem('microtimer-timers');
        if(!data) return;
        const payload = JSON.parse(data);

        if(!payload) return;

        const newPayload = payload.filter(x => x.label !== label && x.target !== target);
        console.log("New Payload:", newPayload);
        localStorage.setItem('microtimer-timers', JSON.stringify(newPayload));

        const timers = document.querySelectorAll('.microtimer-section');
        for(const timer of timers) {
            timer.remove();
        }

        // window.location.reload();
        loadTimers();
    }
}


window.addEventListener('load', () => {

    /** @type {HTMLDialogElement} */
    const createDialog = document.querySelector('#create-dialog');
    const formDescription = document.querySelector('#inp-description');
    const formTarget = document.querySelector('#inp-target');
    const formSubmit = document.querySelector('#btn-create-timer');
    const btnAddTimer = document.querySelector('#add-timer');

    let isModalOpen = false;

    btnAddTimer.addEventListener('click', event => {
        if(isModalOpen) return;

        createDialog.showModal();
    });

    formSubmit.addEventListener('click', event => {
        const label = formDescription.value;
        const target = formTarget.value;

        if(!label) {
            alert("Please enter a label");
            return;
        }

        if(!target) {
            alert("Please enter a target time");
            return;
        }

        if(isNaN((new Date(target)).valueOf())) {
            alert("Please enter a valid date in the form:\nYYYY-MM-DD HH:mm:ss");
            return;
        }

        createTimer(label, target);
        createDialog.close();
    });

    loadTimers();

});
