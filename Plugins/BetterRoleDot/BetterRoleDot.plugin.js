/**
 * @name BetterRoleDot
 * @author Vendicated
 * @authorId 343383572805058560
 * @description Allows you to insert timestamp markdown with a convenient chat bar button
 * @version 1.0.0
 */

"use strict";

// src/shared/findInReactTree.ts
function findInReactTree(root, filter) {
  return BdApi.Utils.findInTree(root, filter, {
    walkable: ["children", "props"]
  });
}

// include-file:~fileContent/styles.css
var styles_default = `.vbd-brd-wrapper {
    all: unset;
    cursor: pointer;
}
`;

// src/plugins/BetterRoleDot/index.tsx
var Components = BdApi.Webpack.getModule((m) => m.RoleDot);
function patchRoleDot() {
  BdApi.Patcher.after("better-role-dot", Components, "RoleDot", (_this, [{ color }], res) => {
    if (!res || !color)
      return;
    return /* @__PURE__ */ BdApi.React.createElement(
      "button",
      {
        className: "vbd-brd-wrapper",
        onClick: () => {
          DiscordNative.clipboard.copy(color);
          BdApi.UI.showToast(`Copied ${color} to clipboard`, { type: "success" });
        }
      },
      res
    );
  });
}
function patchAfter(original, cb) {
  return function vbdAfterFunc(...args) {
    const res = original(...args);
    return cb(args, res), res;
  };
}
function patchChatUserNames() {
  const UserNameModule = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byStrings(".RoleDot", ".username"), {
    defaultExport: false
  });
  BdApi.Patcher.after("better-role-dot", UserNameModule, "Z", (_, [props], res) => {
    if (!props?.author?.colorString)
      return;
    const username = findInReactTree(res, (n) => n?.props?.renderPopout);
    if (!username)
      return;
    username.props.children = patchAfter(username.props.children, (_2, res2) => {
      res2.props.style = {
        color: props.author.colorString
      };
    });
  });
}
function patchRoleListUserNames() {
  BdApi.Patcher.after("better-role-dot", Components, "NameWithRole", (_, [props], wrapperRes) => {
    wrapperRes.type = patchAfter(wrapperRes.type, (_2, res) => {
      res.props.style.color = props.color;
    });
  });
}
function patchRoleMentions() {
  const Parser = BdApi.Webpack.getModule((m) => m.defaultRules?.mention);
  BdApi.Patcher.after("better-role-dot", Parser.defaultRules.mention, "react", (_, [props], res) => {
    if (!props.roleId || !props.color)
      return;
    res.type = patchAfter(res.type, (_2, res2) => {
      res2.props.color = props.color;
    });
  });
}
function start() {
  BdApi.DOM.addStyle("better-role-dot", styles_default);
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
