const { useState, useMemo } = BdApi.React as typeof import("react");

const Components = BdApi.Webpack.getMangled(/ConfirmModal:\(\)=>.{1,3}.ConfirmModal/, {
    Select: BdApi.Webpack.Filters.byStrings('let{options:'),
    Button: BdApi.Webpack.Filters.byStrings('submittingFinishedLabel'),
    FormText: BdApi.Webpack.Filters.byStrings(".SELECTABLE),", ".DISABLED:"),
    ModalRoot: BdApi.Webpack.Filters.byStrings('.MODAL,"aria-labelledby":'),
    ModalHeader: BdApi.Webpack.Filters.byStrings(",id:", ".CENTER"),
    ModalContent: BdApi.Webpack.Filters.byStrings(".content,", "scrollbarType"),
    ModalFooter: BdApi.Webpack.Filters.byStrings(".footer,"),
    ModalCloseButton: BdApi.Webpack.Filters.byStrings(".close]:"),
    FormTitle: BdApi.Webpack.Filters.byStrings('["defaultMargin".concat', '="h5"'),
    openModal: BdApi.Webpack.Filters.byStrings(",instant:"),
    Tooltip: BdApi.Webpack.Filters.byStrings("this.renderTooltip()]"),
    CalendarIcon: BdApi.Webpack.Filters.byStrings("M7 1a1 1 0 0 1 1 1v.75c0"),
})

const Parser = BdApi.Webpack.getByKeys("parseTopic");
const PreloadedUserSettings = BdApi.Webpack.getModule(m => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), {
    searchExports: true
});
const ButtonWrapperClasses = BdApi.Webpack.getByKeys("buttonWrapper", "buttonContent");
const ButtonClasses = BdApi.Webpack.getByKeys("emojiButton", "stickerButton");

const cl = (...names: string[]) => names.map(n => `vbd-its-${n}`).join(" ");

const Formats = ["", "t", "T", "d", "D", "f", "F", "R"] as const;
type Format = (typeof Formats)[number];

function PickerModal({ rootProps }: { rootProps: any }) {
    const [value, setValue] = useState<string>();
    const [format, setFormat] = useState<Format>("");
    const time = Math.round((new Date(value!).getTime() || Date.now()) / 1000);

    const formatTimestamp = (time: number, format: Format) => `<t:${time}${format && `:${format}`}>`;

    const [formatted, rendered] = useMemo(() => {
        const formatted = formatTimestamp(time, format);
        return [formatted, Parser.parse(formatted)];
    }, [time, format]);

    return (
        <Components.ModalRoot {...rootProps}>
            <Components.ModalHeader className={cl("modal-header")}>
                <Components.FormTitle tag="h2">Timestamp Picker</Components.FormTitle>

                <Components.ModalCloseButton onClick={rootProps.onClose} />
            </Components.ModalHeader>

            <Components.ModalContent className={cl("modal-content")}>
                <input
                    type="datetime-local"
                    value={value}
                    onChange={e => setValue(e.currentTarget.value)}
                    style={{
                        colorScheme: PreloadedUserSettings.getCurrentValue().appearance.theme === 2 ? "light" : "dark"
                    }}
                />

                <Components.FormTitle>Timestamp Format</Components.FormTitle>
                <Components.Select
                    options={Formats.map(m => ({
                        label: m,
                        value: m
                    }))}
                    isSelected={v => v === format}
                    select={v => setFormat(v)}
                    serialize={v => v}
                    renderOptionLabel={o => (
                        <div className={cl("format-label")}>{Parser.parse(formatTimestamp(time, o.value))}</div>
                    )}
                    renderOptionValue={() => rendered}
                />

                <Components.FormTitle className={cl("preview-title")}>Preview</Components.FormTitle>
                <Components.FormText className={cl("preview-text")}>
                    {rendered} ({formatted})
                </Components.FormText>
            </Components.ModalContent>

            <Components.ModalFooter>
                <Components.Button
                    onClick={() => {
                        // Top level is too early to find this so it has to be inline
                        const ComponentDispatch = BdApi.Webpack.getModule(m => m.emitter?._events?.INSERT_TEXT, {
                            searchExports: true
                        });

                        ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
                            rawText: formatted + " ",
                            plainText: formatted + " "
                        });
                        rootProps.onClose();
                    }}
                >
                    Insert
                </Components.Button>
            </Components.ModalFooter>
        </Components.ModalRoot>
    );
}

export function ChatBarComponent() {
    return (
        <Components.Tooltip text="Insert Timestamp">
            {({ onMouseEnter, onMouseLeave }) => (
                <Components.Button
                    aria-haspopup="dialog"
                    aria-label=""
                    size=""
                    look={Components.Button.Looks.BLANK}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    innerClassName={ButtonWrapperClasses.button}
                    onClick={() => {
                        Components.openModal(props => <PickerModal rootProps={props} />);
                    }}
                >
                    <div className={`${ButtonWrapperClasses.buttonWrapper} ${ButtonClasses.button}`}>
                        <Components.CalendarIcon />
                    </div>
                </Components.Button>
            )}
        </Components.Tooltip>
    );
}
