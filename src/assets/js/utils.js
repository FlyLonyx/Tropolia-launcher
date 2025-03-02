/**
 * @author Luuxis, FlyLonyx
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

import config from './utils/config.js';
import database from './utils/database.js';
import logger from './utils/logger.js';
import slider from './utils/slider.js';

export {
    config as config,
    database as database,
    logger as logger,
    changePanel as changePanel,
    addAccount as addAccount,
    slider as Slider,
}

function changePanel(id) {
    let panel = document.querySelector(`.${id}`);
    let active = document.querySelector(`.active`)
    if (active) active.classList.toggle("active");
    panel.classList.add("active");
}

function addAccount(data) {
    let timestamp = new Date().getTime();
    document.querySelector(".player-head").style.backgroundImage = `url(https://tropolia.fr/api/skin-api/avatars/face/${data.name}/?t=${timestamp})`;
    document.querySelector(".player-name").textContent = `${data.name}`;
    document.querySelector(".player-role").textContent = `${data.user_info.role.name}`;
    document.querySelector(".player-role").style.color = `${data.user_info.role.color}`;

}


