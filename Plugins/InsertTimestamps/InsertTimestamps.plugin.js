/**
 * @name InsertTimestamps
 * @author Vendicated
 * @authorId 343383572805058560
 * @description Allows you to insert timestamp markdown with a convenient chat bar button
 * @version 1.0.13
 */

"use strict";

// src/plugins/InsertTimestamps/modal.tsx
var { useState, useMemo } = BdApi.React;
var { Button, Tooltip } = BdApi.Components;
var h = BdApi.React.createElement;
var cl = (...names) => names.map((n) => `vbd-its-${n}`).join(" ");
var SafeTooltip = Tooltip || ((props) => props.children({}));
var SafeButton = Button || ((props) => h("button", props, props.children));
var WebpackCache = {};
function getWebpack(name, lookup) {
  if (!(name in WebpackCache)) {
    try {
      WebpackCache[name] = lookup();
    } catch (_) {
      WebpackCache[name] = null;
    }
  }
  return WebpackCache[name];
}
function getDiscordModal() {
  return getWebpack("DiscordModal", () => BdApi.Webpack.getByKeys("Modal")?.Modal);
}
function getOpenModal() {
  return getWebpack("openModal", () => BdApi.Webpack.getByKeys("openModal")?.openModal);
}
function getParser() {
  return getWebpack("Parser", () => BdApi.Webpack.getByKeys("parseTopic"));
}
function getPreloadedUserSettings() {
  return getWebpack("PreloadedUserSettings", () => BdApi.Webpack.getModule((m) => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), {
    searchExports: true
  }));
}
function getButtonWrapperClasses() {
  return getWebpack("ButtonWrapperClasses", () => BdApi.Webpack.getByKeys("buttonWrapper", "buttonContent"));
}
function getButtonClasses() {
  return getWebpack("ButtonClasses", () => BdApi.Webpack.getByKeys("emojiButton", "stickerButton"));
}
function getIconClasses() {
  return getWebpack("IconClasses", () => BdApi.Webpack.getByKeys("iconContainer", "trinketsIcon"));
}
var Formats = [
  ["", "Default"],
  ["t", "Short Time"],
  ["T", "Long Time"],
  ["d", "Short Date"],
  ["D", "Long Date"],
  ["f", "Short Date/Time"],
  ["F", "Long Date/Time"],
  ["R", "Relative Time"]
];
function renderTimestamp(markdown) {
  const Parser = getParser();
  return Parser?.parse?.(markdown) || Parser?.parseTopic?.(markdown) || markdown;
}
function getColorScheme() {
  const PreloadedUserSettings = getPreloadedUserSettings();
  const theme = PreloadedUserSettings?.getCurrentValue?.()?.appearance?.theme;
  return theme === 2 ? "light" : "dark";
}
function CalendarIcon() {
  return h(
    "svg",
    {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      "aria-hidden": true
    },
    h("path", {
      fill: "currentColor",
      d: "M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z"
    })
  );
}
function Text({ variant, className, children }) {
  const tag = variant?.startsWith("heading") ? "h3" : "div";
  return h(tag, { className }, children);
}
function Modal(props) {
  const DiscordModal = getDiscordModal();
  if (DiscordModal)
    return h(DiscordModal, props, props.children);
  return h(
    "div",
    { className: cl("modal-fallback") },
    h("div", { className: cl("modal-title") }, props.title),
    props.children,
    h(
      "div",
      { className: cl("modal-actions") },
      props.actions?.map((action) => h("button", { key: action.text, className: cl("modal-action"), onClick: action.onClick }, action.text))
    )
  );
}
function PickerModal({ rootProps }) {
  const [value, setValue] = useState();
  const [format, setFormat] = useState("");
  const time = Math.round((new Date(value).getTime() || Date.now()) / 1e3);
  const formatTimestamp = (time2, format2) => `<t:${time2}${format2 && `:${format2}`}>`;
  const [formatted, rendered] = useMemo(() => {
    const formatted2 = formatTimestamp(time, format);
    return [formatted2, renderTimestamp(formatted2)];
  }, [time, format]);
  return /* @__PURE__ */ h(
    Modal,
    {
      title: "Timestamp Picker",
      actions: [{
        variant: "primary",
        text: "Insert",
        onClick: () => {
          const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.INSERT_TEXT, {
            searchExports: true
          });
          ComponentDispatch?.dispatchToLastSubscribed?.("INSERT_TEXT", {
            rawText: formatted + " ",
            plainText: formatted + " "
          });
          rootProps.onClose?.();
        }
      }],
      ...rootProps
    },
    /* @__PURE__ */ h(BdApi.React.Fragment, null, /* @__PURE__ */ h(
      "input",
      {
        type: "datetime-local",
        value,
        className: cl("datetime-input"),
        onChange: (e) => setValue(e.currentTarget.value),
        style: {
          colorScheme: getColorScheme()
        }
      }
    ), /* @__PURE__ */ h(Text, { variant: "heading-md/bold", className: cl("format-title") }, "Timestamp Format"), /* @__PURE__ */ h(
      "select",
      {
        value: format,
        className: cl("format-select"),
        onChange: (e) => setFormat(e.currentTarget.value)
      },
      Formats.map(([value2, label]) => /* @__PURE__ */ h("option", { key: value2 || "default", value: value2 }, `${label} - ${formatTimestamp(time, value2)}`))
    ), /* @__PURE__ */ h(Text, { variant: "heading-md/bold", className: cl("preview-title") }, "Preview"), /* @__PURE__ */ h(Text, { variant: "heading-sm/normal", className: cl("preview-text") }, rendered, " (", formatted, ")"))
  );
}
function ChatBarComponent() {
  const ButtonWrapperClasses = getButtonWrapperClasses();
  const ButtonClasses = getButtonClasses();
  const IconClasses = getIconClasses();
  return /* @__PURE__ */ h(SafeTooltip, { text: "Insert Timestamp" }, ({ onMouseEnter, onMouseLeave }) => /* @__PURE__ */ h(
    SafeButton,
    {
      className: cl("text-area-button"),
      "aria-haspopup": "dialog",
      "aria-label": "",
      size: "",
      look: Button?.Looks?.BLANK,
      onMouseEnter,
      onMouseLeave,
      onClick: () => {
        const openModal = getOpenModal();
        openModal?.((props) => /* @__PURE__ */ BdApi.React.createElement(PickerModal, { rootProps: props }));
      }
    },
    /* @__PURE__ */ h(
      "div",
      {
        className: `${ButtonWrapperClasses?.buttonWrapper || ""} ${ButtonClasses?.button || ""} ${ButtonWrapperClasses?.button || ""}`
      },
      /* @__PURE__ */ h("div", { className: IconClasses?.iconContainer }, /* @__PURE__ */ h(CalendarIcon, null))
    )
  ));
}

// src/shared/findInReactTree.ts
function findInReactTree(root, filter) {
  return BdApi.Utils.findInTree(root, filter, {
    walkable: ["children", "props"]
  });
}

// include-file:~fileContent/styles.css
var styles_default = `.vbd-its-datetime-input {
    position: relative;
    background-color: var(--input-background-default);
    color: var(--text-default);
    width: -webkit-fill-available;
    padding: 8px 12px;
    margin: 1em 0;
    outline: none;
    border: 1px solid var(--input-border-default);
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-style: inherit;
    font-size: 16px;
}
.vbd-its-text-area-button {
    padding: 0;
}
.vbd-its-preview-title,
.vbd-its-format-title {
    margin: 1em 0;
}
.vbd-its-preview-text {
    margin-bottom: 1em;
}
.vbd-its-format-select {
    width: -webkit-fill-available;
    padding: 8px 12px;
    border: 1px solid var(--input-border-default);
    border-radius: var(--radius-sm);
    background-color: var(--input-background-default);
    color: var(--text-default);
    font: inherit;
}
.vbd-its-modal-fallback {
    padding: 16px;
    background: var(--modal-background);
    color: var(--text-default);
    border-radius: var(--radius-md);
    min-width: 420px;
}
.vbd-its-modal-title {
    color: var(--header-primary);
    font-size: 20px;
    font-weight: 700;
}
.vbd-its-modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}
.vbd-its-modal-action {
    padding: 8px 16px;
    border: 0;
    border-radius: var(--radius-sm);
    background: var(--button-positive-background);
    color: var(--white-500);
    cursor: pointer;
}
`;

// src/plugins/InsertTimestamps/index.jsx
function getChannelTextAreaButtons() {
  return getWebpack("ChannelTextAreaButtons", () => BdApi.Webpack.getModule((m) => m.type?.toString?.().includes('"sticker")')));
}
function start() {
  const ChannelTextAreaButtons = getChannelTextAreaButtons();
  if (!ChannelTextAreaButtons?.type)
    return BdApi.Logger?.warn?.("InsertTimestamps", "Could not find Discord's chat bar button module.");
  BdApi.DOM.addStyle("vbd-st", styles_default);
  BdApi.Patcher.after("vbd-st", ChannelTextAreaButtons, "type", (_this, [{ disabled }], res) => {
    if (disabled)
      return;
    const buttons = findInReactTree(res, (n) => Array.isArray(n) && n.some((e) => e.key === "emoji"));
    if (!buttons)
      return;
    buttons.splice(0, 0, /* @__PURE__ */ BdApi.React.createElement(ChatBarComponent, null));
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
