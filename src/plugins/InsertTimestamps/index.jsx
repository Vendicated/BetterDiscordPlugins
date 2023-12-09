import { ChatBarComponent } from "./modal";
import { findInReactTree } from "../../shared/findInReactTree";

import styles from "~fileContent/styles.css";

const Chat = BdApi.Webpack.getModule(m => m.default?.type?.render?.toString().includes("chat input type must be set"));

function start() {
    BdApi.DOM.addStyle("vbd-st", styles);

    BdApi.Patcher.after("vbd-st", Chat.Z.default, "render", (_this, _args, res) => {
        const chatBar = findInReactTree(
            res,
            n => Array.isArray(n?.children) && n.children.some(c => c?.props?.className?.startsWith("attachButton"))
        )?.children;

        if (!chatBar) {
            console.error("InsertTimestamps: Couldn't find ChatBar component in React tree");
            return;
        }

        const buttons = findInReactTree(chatBar, n => n?.props?.showCharacterCount);
        if (buttons?.props.disabled) return;

        chatBar.splice(-1, 0, <ChatBarComponent />);
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
