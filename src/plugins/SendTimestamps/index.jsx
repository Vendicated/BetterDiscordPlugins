import { ChatBarComponent } from "./modal";
import styles from "~fileContent/styles.css";

const Chat = BdApi.Webpack.getModule(m => m.Z?.type?.render?.toString().includes("chat input type must be set"));

function start() {
    BdApi.DOM.addStyle("send-timestamps", styles);

    const unpatchOuter = BdApi.Patcher.after("send-timestamps", Chat.Z.type, "render", (_this, _args, res) => {
        unpatchOuter();

        const inner = BdApi.Utils.findInTree(res, n => n?.props?.className?.includes("sansAttachButton-"), {
            walkable: ["props", "children"]
        });

        BdApi.Patcher.after("send-timestamps", inner.props.children[2].type, "type", (_this2, [props], buttonsRes) => {
            if (props.disabled) return;
            buttonsRes.props.children.unshift(<ChatBarComponent />);
        });
    });
}

function stop() {
    BdApi.DOM.removeStyle("send-timestamps");
    BdApi.Patcher.unpatchAll("send-timestamps");
}

module.exports = () => ({
    start,
    stop
});
