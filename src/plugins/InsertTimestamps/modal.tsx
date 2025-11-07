const { useState, useMemo } = BdApi.React as typeof import("react");

const { Filters } = BdApi.Webpack;
const { Button, DropdownInput, Tooltip } = BdApi.Components;
const {
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
    Text: m => m.render?.toString?.().includes('case"always-white"'),
    openModal: Filters.byStrings(",instant:"),
    CalendarIcon: Filters.byStrings("M7 1a1 1 0 0 1 1 1v.75c0")
});

const Parser = BdApi.Webpack.getByKeys("parseTopic");
const PreloadedUserSettings = BdApi.Webpack.getModule(m => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), {
    searchExports: true
});
const ButtonWrapperClasses = BdApi.Webpack.getByKeys("buttonWrapper", "buttonContent");
const ButtonClasses = BdApi.Webpack.getByKeys("emojiButton", "stickerButton");
const IconClasses = BdApi.Webpack.getByKeys("iconContainer", "trinketsIcon");

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
        <ModalRoot {...rootProps}>
            <ModalHeader className={cl("modal-header")}>
                <Text variant="heading-md/bold">Timestamp Picker</Text>

                <ModalCloseButton onClick={rootProps.onClose} />
            </ModalHeader>

            <ModalContent className={cl("modal-content")}>
                <input
                    type="datetime-local"
                    value={value}
                    onChange={e => setValue(e.currentTarget.value)}
                    style={{
                        colorScheme: PreloadedUserSettings.getCurrentValue().appearance.theme === 2 ? "light" : "dark"
                    }}
                />

                <Text variant="heading-md/bold" className={cl("preview-title")} >Timestamp Format</Text>
                <DropdownInput
                    options={Formats.map(m => ({
                        label: Parser.parse(formatTimestamp(time, m)),
                        value: m
                    }))}
                    onChange={v => setFormat(v)}
                />

                <Text variant="heading-md/bold" className={cl("preview-title")}>Preview</Text>
                <Text variant="heading-sm/normal" className={cl("preview-text")}>
                    {rendered} ({formatted})
                </Text>
            </ModalContent>

            <ModalFooter>
                <Button
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
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

export function ChatBarComponent() {
    return (
        <Tooltip text="Insert Timestamp">
            {({ onMouseEnter, onMouseLeave }) => (
                <Button
                    className={cl("text-area-button")}
                    aria-haspopup="dialog"
                    aria-label=""
                    size=""
                    look={Button?.Looks?.BLANK}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={() => {
                        openModal(props => <PickerModal rootProps={props} />);
                    }}
                >
                    <div
                        className={`${ButtonWrapperClasses.buttonWrapper} ${ButtonClasses.button} ${ButtonWrapperClasses.button}`}
                    >
                        <div className={IconClasses.iconContainer}>
                            <CalendarIcon />
                        </div>
                    </div>
                </Button>
            )}
        </Tooltip>
    );
}
