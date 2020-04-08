// Some utilities for doing things like loading WAD files before triggering game-load
// =--------------------------------------------------------------------------------=

const loadGame = () => {
    const loader = document.createElement('script');
    loader.src = 'chocolate-doom.js';
    document.body.appendChild(loader);
};

const modal = document.querySelector('#root-modal');
const playButton = modal.querySelector('#modal-play-button');
if (modal && playButton) {
    playButton.addEventListener('click', () => {
        modal.classList.add('hide');
        loadGame();
    });
}
