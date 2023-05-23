import { ChatBarComponent } from "./modal";
import { findInReactTree } from "../../shared/findInReactTree";

import styles from "~fileContent/styles.css";

const Chat = BdApi.Webpack.getModule(m => m.Z?.type?.render?.toString().includes("chat input type must be set"));

function start() {
    BdApi.DOM.addStyle("vbd-st", styles);

    const unpatchOuter = BdApi.Patcher.after("vbd-st", Chat.Z.type, "render", (_this, _args, res) => {
        unpatchOuter();
        console.log(res);

        const inner = findInReactTree(res, n => n?.props?.className?.includes("sansAttachButton-"));

        BdApi.Patcher.after("vbd-st", inner.props.children[2].type, "type", (_this2, [props], buttonsRes) => {
            if (props.disabled) return;
            buttonsRes.props.children.unshift(<ChatBarComponent />);
        });
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
