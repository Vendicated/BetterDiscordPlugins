import { ChatBarComponent } from "./modal";
import { findInReactTree } from "../../shared/findInReactTree";

import styles from "~fileContent/styles.css";

const ChannelTextAreaButtons = BdApi.Webpack.getModule(m => m.type?.toString?.().includes("default.getSentUserIds"));

function start() {
    BdApi.DOM.addStyle("vbd-st", styles);

    BdApi.Patcher.after("vbd-st", ChannelTextAreaButtons, "type", (_this, [{ disabled }], res) => {
        if (disabled) return;
        const buttons = findInReactTree(res, n => Array.isArray(n) && n.some(e => e.key === "emoji"));
        if (!buttons) return;
        buttons.splice(0, 0, <ChatBarComponent />);
    });
}

function stop() {
    BdApi.DOM.removeStyle("vbd-st");
    BdApi.Patcher.unpatchAll("vbd-st");
}

module.exports = () => ({
    start,
    stop
});
