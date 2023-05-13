import { findInReactTree } from "../../shared/findInReactTree";

import styles from "~fileContent/styles.css";

const Components = BdApi.Webpack.getModule(m => m.RoleDot);

function patchRoleDot() {
    BdApi.Patcher.after("better-role-dot", Components, "RoleDot", (_this, [{ color }], res) => {
        if (!res || !color) return;

        return (
            <button
                className="vbd-brd-wrapper"
                onClick={() => {
                    DiscordNative.clipboard.copy(color);
                    BdApi.UI.showToast(`Copied ${color} to clipboard`, { type: "success" });
                }}
            >
                {res}
            </button>
        );
    });
}

function patchAfter(original: (...args: any[]) => any, cb: (args: any[], res: any) => void) {
    return function vbdAfterFunc(...args: any[]) {
        const res = original(...args);
        return cb(args, res), res;
    };
}

function patchChatUserNames() {
    const UserNameModule = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byStrings(".RoleDot", ".username"), {
        defaultExport: false
    });

    BdApi.Patcher.after("better-role-dot", UserNameModule, "Z", (_, [props], res) => {
        if (!props?.author?.colorString) return;

        const username = findInReactTree(res, n => n?.props?.renderPopout);
        if (!username) return;

        username.props.children = patchAfter(username.props.children, (_, res) => {
            res.props.style = {
                color: props.author.colorString
            };
        });
    });
}

function patchRoleListUserNames() {
    // this is a really silly wrapper component that just returns <ActualComponent roleStyle={useRoleStyle()} />
    // the wrapped component is not exported, so we need to have a nested patch
    // since it always returns a new object, no need to unpatch
    BdApi.Patcher.after("better-role-dot", Components, "NameWithRole", (_, [props], wrapperRes) => {
        wrapperRes.type = patchAfter(wrapperRes.type, (_, res) => {
            res.props.style.color = props.color;
        });
    });
}

function patchRoleMentions() {
    const Parser = BdApi.Webpack.getModule(m => m.defaultRules?.mention);

    BdApi.Patcher.after("better-role-dot", Parser.defaultRules.mention, "react", (_, [props], res) => {
        if (!props.roleId || !props.color) return;

        res.type = patchAfter(res.type, (_, res) => {
            res.props.color = props.color;
        });
    });
}

function start() {
    BdApi.DOM.addStyle("better-role-dot", styles);

    patchRoleDot();
    patchChatUserNames();
    patchRoleListUserNames();
    patchRoleMentions();
}

function stop() {
    BdApi.DOM.removeStyle("better-role-dot");
    BdApi.Patcher.unpatchAll("better-role-dot");
}

module.exports = () => ({
    start,
    stop
});
