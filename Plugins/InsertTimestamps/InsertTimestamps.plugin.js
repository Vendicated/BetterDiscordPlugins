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
var { Filters } = BdApi.Webpack;
var { Button, DropdownInput, Tooltip } = BdApi.Components;
var {
  ModalRoot,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Text,
  openModal,
  CalendarIcon
} = BdApi.Webpack.getMangled(/ConfirmModal:\(\)=>.{1,3}.ConfirmModal/, {
  ModalRoot: Filters.byStrings('.MODAL,"aria-labelledby":'),
  ModalHeader: Filters.byStrings(",id:", ".CENTER"),
  ModalContent: Filters.byStrings(".content,", "scrollbarType"),
  ModalFooter: Filters.byStrings(".footer,", ".Direction.HORIZONTAL_REVERSE"),
  ModalCloseButton: Filters.byStrings(".close]:"),
  Text: (m) => m.render?.toString?.().includes('case"always-white"'),
  openModal: Filters.byStrings(",instant:"),
  CalendarIcon: Filters.byStrings("M7 1a1 1 0 0 1 1 1v.75c0")
});
var Parser = BdApi.Webpack.getByKeys("parseTopic");
var PreloadedUserSettings = BdApi.Webpack.getModule((m) => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), {
  searchExports: true
});
var ButtonWrapperClasses = BdApi.Webpack.getByKeys("buttonWrapper", "buttonContent");
var ButtonClasses = BdApi.Webpack.getByKeys("emojiButton", "stickerButton");
var IconClasses = BdApi.Webpack.getByKeys("iconContainer", "trinketsIcon");
var cl = (...names) => names.map((n) => `vbd-its-${n}`).join(" ");
var Formats = ["", "t", "T", "d", "D", "f", "F", "R"];
function PickerModal({ rootProps }) {
  const [value, setValue] = useState();
  const [format, setFormat] = useState("");
  const time = Math.round((new Date(value).getTime() || Date.now()) / 1e3);
  const formatTimestamp = (time2, format2) => `<t:${time2}${format2 && `:${format2}`}>`;
  const [formatted, rendered] = useMemo(() => {
    const formatted2 = formatTimestamp(time, format);
    return [formatted2, Parser.parse(formatted2)];
  }, [time, format]);
  return /* @__PURE__ */ BdApi.React.createElement(ModalRoot, { ...rootProps }, /* @__PURE__ */ BdApi.React.createElement(ModalHeader, { className: cl("modal-header") }, /* @__PURE__ */ BdApi.React.createElement(Text, { variant: "heading-md/bold" }, "Timestamp Picker"), /* @__PURE__ */ BdApi.React.createElement(ModalCloseButton, { onClick: rootProps.onClose })), /* @__PURE__ */ BdApi.React.createElement(ModalContent, { className: cl("modal-content") }, /* @__PURE__ */ BdApi.React.createElement(
    "input",
    {
      type: "datetime-local",
      value,
      onChange: (e) => setValue(e.currentTarget.value),
      style: {
        colorScheme: PreloadedUserSettings.getCurrentValue().appearance.theme === 2 ? "light" : "dark"
      }
    }
  ), /* @__PURE__ */ BdApi.React.createElement(Text, { variant: "heading-md/bold", className: cl("preview-title") }, "Timestamp Format"), /* @__PURE__ */ BdApi.React.createElement(
    DropdownInput,
    {
      options: Formats.map((m) => ({
        label: Parser.parse(formatTimestamp(time, m)),
        value: m
      })),
      onChange: (v) => setFormat(v)
    }
  ), /* @__PURE__ */ BdApi.React.createElement(Text, { variant: "heading-md/bold", className: cl("preview-title") }, "Preview"), /* @__PURE__ */ BdApi.React.createElement(Text, { variant: "heading-sm/normal", className: cl("preview-text") }, rendered, " (", formatted, ")")), /* @__PURE__ */ BdApi.React.createElement(ModalFooter, null, /* @__PURE__ */ BdApi.React.createElement(
    Button,
    {
      onClick: () => {
        const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.INSERT_TEXT, {
          searchExports: true
        });
        ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
          rawText: formatted + " ",
          plainText: formatted + " "
        });
        rootProps.onClose();
      }
    },
    "Insert"
  )));
}
function ChatBarComponent() {
  return /* @__PURE__ */ BdApi.React.createElement(Tooltip, { text: "Insert Timestamp" }, ({ onMouseEnter, onMouseLeave }) => /* @__PURE__ */ BdApi.React.createElement(
    Button,
    {
      className: cl("text-area-button"),
      "aria-haspopup": "dialog",
      "aria-label": "",
      size: "",
      look: Button?.Looks?.BLANK,
      onMouseEnter,
      onMouseLeave,
      onClick: () => {
        openModal((props) => /* @__PURE__ */ BdApi.React.createElement(PickerModal, { rootProps: props }));
      }
    },
    /* @__PURE__ */ BdApi.React.createElement(
      "div",
      {
        className: `${ButtonWrapperClasses.buttonWrapper} ${ButtonClasses.button} ${ButtonWrapperClasses.button}`
      },
      /* @__PURE__ */ BdApi.React.createElement("div", { className: IconClasses.iconContainer }, /* @__PURE__ */ BdApi.React.createElement(CalendarIcon, null))
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
var styles_default = `.vbd-its-modal-content input {
    position: relative;
    background-color: var(--input-background);
    color: var(--text-default);
    width: -webkit-fill-available;
    padding: 8px 12px;
    margin: 1em 0;
    outline: none;
    border: 1px solid var(--input-border);
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-style: inherit;
    font-size: 16px;
}

.vbd-its-modal-header {
    justify-content: space-between;
    align-content: center;
}

.vbd-its-modal-header button,
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
`;

// src/plugins/InsertTimestamps/index.jsx
var ChannelTextAreaButtons = BdApi.Webpack.getModule((m) => m.type?.toString?.().includes('"sticker")'));
function start() {
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
