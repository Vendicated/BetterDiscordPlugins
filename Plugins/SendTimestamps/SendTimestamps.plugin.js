/**
 * @name SendTimestamps
 * @author Vendicated
 * @authorId 343383572805058560
 * @description Allows you to insert timestamp markdown with a convenient chat bar button
 * @version 1.0.0
 */

"use strict";

// src/plugins/SendTimestamps/modal.tsx
var { useState, useMemo } = BdApi.React;
var {
    Button,
    ModalRoot,
    ModalHeader,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    FormTitle,
    FormText,
    Tooltip,
    Select,
    openModal
} = BdApi.Webpack.getModule(m => m.ModalContent);
var Parser = BdApi.Webpack.getModule(m => m.parseTopic);
var PreloadedUserSettings = BdApi.Webpack.getModule(m => m.ProtoClass, {
    searchExports: true
});
var ButtonWrapperClasses = BdApi.Webpack.getModule(m => m.buttonWrapper && m.buttonContent);
var ComponentDispatch = BdApi.Webpack.getModule(m => m.emitter?._events?.INSERT_TEXT, { searchExports: true });
var cl = (...names) => names.map(n => `vc-st-${n}`).join(" ");
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
    return /* @__PURE__ */ BdApi.React.createElement(
        ModalRoot,
        { ...rootProps },
        /* @__PURE__ */ BdApi.React.createElement(
            ModalHeader,
            { className: cl("modal-header") },
            /* @__PURE__ */ BdApi.React.createElement(FormTitle, { tag: "h2" }, "Timestamp Picker"),
            /* @__PURE__ */ BdApi.React.createElement(ModalCloseButton, { onClick: rootProps.onClose })
        ),
        /* @__PURE__ */ BdApi.React.createElement(
            ModalContent,
            { className: cl("modal-content") },
            /* @__PURE__ */ BdApi.React.createElement("input", {
                type: "datetime-local",
                value,
                onChange: e => setValue(e.currentTarget.value),
                style: {
                    colorScheme: PreloadedUserSettings.getCurrentValue().appearance.theme === 2 ? "light" : "dark"
                }
            }),
            /* @__PURE__ */ BdApi.React.createElement(FormTitle, null, "Timestamp Format"),
            /* @__PURE__ */ BdApi.React.createElement(Select, {
                options: Formats.map(m => ({
                    label: m,
                    value: m
                })),
                isSelected: v => v === format,
                select: v => setFormat(v),
                serialize: v => v,
                renderOptionLabel: o =>
                    /* @__PURE__ */ BdApi.React.createElement(
                        "div",
                        { className: cl("format-label") },
                        Parser.parse(formatTimestamp(time, o.value))
                    ),
                renderOptionValue: () => rendered
            }),
            /* @__PURE__ */ BdApi.React.createElement(FormTitle, { className: cl("preview-title") }, "Preview"),
            /* @__PURE__ */ BdApi.React.createElement(
                FormText,
                { className: cl("preview-text") },
                rendered,
                " (",
                formatted,
                ")"
            )
        ),
        /* @__PURE__ */ BdApi.React.createElement(
            ModalFooter,
            null,
            /* @__PURE__ */ BdApi.React.createElement(
                Button,
                {
                    onClick: () => {
                        ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                            rawText: formatted + " ",
                            plainText: formatted + " "
                        });
                        rootProps.onClose();
                    }
                },
                "Insert"
            )
        )
    );
}
function ChatBarComponent() {
    return /* @__PURE__ */ BdApi.React.createElement(
        Tooltip,
        { text: "Insert Timestamp" },
        ({ onMouseEnter, onMouseLeave }) =>
            /* @__PURE__ */ BdApi.React.createElement(
                "div",
                { style: { display: "flex" } },
                /* @__PURE__ */ BdApi.React.createElement(
                    Button,
                    {
                        "aria-haspopup": "dialog",
                        "aria-label": "",
                        size: "",
                        look: Button.Looks.BLANK,
                        onMouseEnter,
                        onMouseLeave,
                        innerClassName: ButtonWrapperClasses.button,
                        onClick: () => {
                            openModal(props =>
                                /* @__PURE__ */ BdApi.React.createElement(PickerModal, { rootProps: props })
                            );
                        },
                        className: cl("button")
                    },
                    /* @__PURE__ */ BdApi.React.createElement(
                        "div",
                        { className: ButtonWrapperClasses.buttonWrapper },
                        /* @__PURE__ */ BdApi.React.createElement(
                            "svg",
                            { "aria-hidden": "true", role: "img", width: "24", height: "24", viewBox: "0 0 24 24" },
                            /* @__PURE__ */ BdApi.React.createElement(
                                "g",
                                { fill: "none", "fill-rule": "evenodd" },
                                /* @__PURE__ */ BdApi.React.createElement("path", {
                                    fill: "currentColor",
                                    d: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"
                                }),
                                /* @__PURE__ */ BdApi.React.createElement("rect", { width: "24", height: "24" })
                            )
                        )
                    )
                )
            )
    );
}

// include-file:~fileContent/styles.css
var styles_default =
    '.vc-st-modal-content input {\n    background-color: var(--input-background);\n    color: var(--text-normal);\n    width: 95%;\n    padding: 8px 8px 8px 12px;\n    margin: 1em 0;\n    outline: none;\n    border: 1px solid var(--input-background);\n    border-radius: 4px;\n    font-weight: 500;\n    font-style: inherit;\n    font-size: 100%;\n}\n\n.vc-st-format-label,\n.vc-st-format-label span {\n    background-color: transparent;\n}\n\n.vc-st-modal-content [class|="select"] {\n    margin-bottom: 1em;\n}\n\n.vc-st-modal-content [class|="select"] span {\n    background-color: var(--input-background);\n}\n\n.vc-st-modal-header {\n    justify-content: space-between;\n    align-content: center;\n}\n\n.vc-st-modal-header h1 {\n    margin: 0;\n}\n\n.vc-st-modal-header button {\n    padding: 0;\n}\n\n.vc-st-preview-text {\n    margin-bottom: 1em;\n}\n\n.vc-st-button {\n    padding: 0 6px;\n}\n\n.vc-st-button svg {\n    transform: scale(1.1) translateY(1px);\n}\n';

// src/plugins/SendTimestamps/index.jsx
var Chat = BdApi.Webpack.getModule(m => m.Z?.type?.render?.toString().includes("chat input type must be set"));
function start() {
    BdApi.DOM.addStyle("send-timestamps", styles_default);
    const unpatchOuter = BdApi.Patcher.after("send-timestamps", Chat.Z.type, "render", (_this, _args, res) => {
        unpatchOuter();
        const inner = BdApi.Utils.findInTree(res, n => n?.props?.className?.includes("sansAttachButton-"), {
            walkable: ["props", "children"]
        });
        BdApi.Patcher.after("send-timestamps", inner.props.children[2].type, "type", (_this2, _args2, buttonsRes) => {
            buttonsRes.props.children.unshift(/* @__PURE__ */ BdApi.React.createElement(ChatBarComponent, null));
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
