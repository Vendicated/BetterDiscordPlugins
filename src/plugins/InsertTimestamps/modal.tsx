const { useState, useMemo } = BdApi.React as typeof import("react");

const {
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

const Parser = BdApi.Webpack.getModule(m => m.parseTopic);
const PreloadedUserSettings = BdApi.Webpack.getModule(m => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), {
    searchExports: true
});
const ButtonWrapperClasses = BdApi.Webpack.getModule(m => m.buttonWrapper && m.buttonContent);

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
                <FormTitle tag="h2">Timestamp Picker</FormTitle>

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

                <FormTitle>Timestamp Format</FormTitle>
                <Select
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

                <FormTitle className={cl("preview-title")}>Preview</FormTitle>
                <FormText className={cl("preview-text")}>
                    {rendered} ({formatted})
                </FormText>
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
                <div style={{ marginTop: 10 }}>
                    <Button
                        aria-haspopup="dialog"
                        aria-label=""
                        size=""
                        look={Button.Looks.BLANK}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        innerClassName={ButtonWrapperClasses.button}
                        onClick={() => {
                            openModal(props => <PickerModal rootProps={props} />);
                        }}
                        className={cl("button")}
                    >
                        <div className={ButtonWrapperClasses.buttonWrapper}>
                            <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                                <g fill="none" fill-rule="evenodd">
                                    <path
                                        fill="currentColor"
                                        d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"
                                    />
                                    <rect width="24" height="24" />
                                </g>
                            </svg>
                        </div>
                    </Button>
                </div>
            )}
        </Tooltip>
    );
}
