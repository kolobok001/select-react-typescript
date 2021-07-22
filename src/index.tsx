import React, { Component, createRef, ReactNode } from 'react'
import classNames from 'classnames'

const DEFAULT_PLACEHOLDER_STRING = 'Select...'
export interface Option {
    label: React.ReactNode;
    value: string | number;
    className?: string;
}
export interface Group {
    type: "group";
    name: string;
    items: Option[];
}
export interface ReactDropdownProps {
    options: (Group | Option | string | number)[];
    baseClassName?: string;
    className?: string;
    controlClassName?: string;
    placeholderClassName?: string;
    menuClassName?: string;
    arrowClassName?: string;
    disabled?: boolean;
    arrowClosed?: React.ReactNode,
    arrowOpen?: React.ReactNode,
    onChange?: (arg: Option) => void;
    onFocus?: (arg: boolean) => void;
    value?: Option | string | number;
    placeholder?: string;
    style?: React.CSSProperties;
    noOptions?: React.ReactNode
}
export interface ReactDropdownState {
    isOpen: boolean;
    selected: Option;
}

class Dropdown extends Component<ReactDropdownProps, ReactDropdownState> {
    static defaultProps: { baseClassName: string }
    dropdownRef: any
    mounted: boolean
    constructor(props: ReactDropdownProps) {
        super(props)
        this.state = {
            selected: this.parseValue(props.value, props.options) || {
                label: typeof props.placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : props.placeholder,
                value: ''
            },
            isOpen: false
        }
        this.dropdownRef = createRef()
        this.mounted = true
        this.handleDocumentClick = this.handleDocumentClick.bind(this)
        this.fireChangeEvent = this.fireChangeEvent.bind(this)
    }

    componentDidUpdate(prevProps: ReactDropdownProps) {
        if (this.props.value !== prevProps.value) {
            if (this.props.value) {
                let selected = this.parseValue(this.props.value, this.props.options)
                if (selected !== this.state.selected) {
                    this.setState({ selected })
                }
            } else {
                this.setState({
                    selected: {
                        label: typeof this.props.placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : this.props.placeholder,
                        value: ''
                    }
                })
            }
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.handleDocumentClick, false)
        document.addEventListener('touchend', this.handleDocumentClick, false)
    }

    componentWillUnmount() {
        this.mounted = false
        document.removeEventListener('click', this.handleDocumentClick, false)
        document.removeEventListener('touchend', this.handleDocumentClick, false)
    }

    handleMouseClick(event: any) {
        if (this.props.onFocus && typeof this.props.onFocus === 'function') {
            this.props.onFocus(this.state.isOpen)
        }
        if (event.type === 'mousedown' && event.button !== 0) return
        event.stopPropagation()
        event.preventDefault()

        if (!this.props.disabled) {
            this.setState({
                isOpen: !this.state.isOpen
            })
        }
    }

    parseValue(value: number | string | Option | undefined, options: (number | string | Option | Group)[]) {
        let option;

        if (typeof value === 'string' || typeof value === "number") {
            for (var i = 0, num = options.length; i < num; i++) {
                if ((options[i] as Group).type === 'group') {
                    const match = (options[i] as Group).items.filter(item => item.value === value)
                    if (match.length) {
                        option = match[0]
                    }
                } else if (typeof (options[i] as Option).value !== 'undefined' && (options[i] as Option).value === value) {
                    option = options[i] as Option
                }
            }
        }

        return option as Option || value
    }

    setValue(value: string | number, label: string | ReactNode) {
        let newState = {
            selected: {
                value,
                label
            },
            isOpen: false
        }
        this.fireChangeEvent(newState)
        this.setState(newState)
    }

    fireChangeEvent(newState: ReactDropdownState) {
        if (newState.selected !== this.state.selected && this.props.onChange) {
            this.props.onChange(newState.selected)
        }
    }

    renderOption(option: Option | string) {
        let value: number | string | undefined = (option as Option)?.value
        if (typeof value === 'undefined') {
            if (typeof option == "string")
                value = option as string
            else if (typeof option == "number")
                value = option as number
        }
        let label = (option as Option).label || (option as Option).value || option
        let isSelected = value === this.state.selected.value

        const classes = {
            [`${this.props.baseClassName}__option`]: true,
            [(option as Option).className!]: !!(option as Option).className,
            'option_selected': isSelected
        }

        const optionClass = classNames(classes)

        return (
            <div
                key={value}
                className={optionClass}
                onMouseDown={this.setValue.bind(this, value, label)}
                onClick={this.setValue.bind(this, value, label)}
                role='option'
                aria-selected={isSelected ? 'true' : 'false'}>
                {label}
            </div>
        )
    }

    buildMenu() {
        let { options, baseClassName } = this.props
        let ops = options.map((option) => {
            if ((option as Group).type === 'group') {
                let groupTitle = (<div className={`${baseClassName}__title`}>
                    {(option as Group).name}
                </div>)
                let _options = (option as Group).items.map((item) => this.renderOption(item))

                return (
                    <div className={`${baseClassName}__group`} key={(option as Group).name} role='listbox' tabIndex={-1}>
                        {groupTitle}
                        {_options}
                    </div>
                )
            } else {
                return this.renderOption((option as Option))
            }
        })

        return ops.length ? ops : <div className={`${baseClassName}__noresults`}>
            {
                this.props.noOptions
                    ? this.props.noOptions
                    : <>No options found</>
            }
        </div>
    }

    handleDocumentClick(event: any) {
        if (this.mounted) {
            if (!this.dropdownRef.current.contains(event.target)) {
                if (this.state.isOpen) {
                    this.setState({ isOpen: false })
                }
            }
        }
    }

    isValueSelected() {
        return typeof this.state.selected === 'string' || this.state.selected.value !== ''
    }

    render() {
        const { baseClassName, controlClassName, placeholderClassName, menuClassName, arrowClassName, arrowClosed, arrowOpen, className } = this.props

        const disabledClass = this.props.disabled ? `${baseClassName}__disabled` : ''
        const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label

        const dropdownClass = classNames({
            [`${baseClassName}__root`]: true,
            [className!]: !!className,
            'is-open': this.state.isOpen
        })
        const controlClass = classNames({
            [`${baseClassName}__control`]: true,
            [controlClassName!]: !!controlClassName,
            [disabledClass]: !!disabledClass
        })
        const placeholderClass = classNames({
            [`${baseClassName}__placeholder`]: true,
            [placeholderClassName!]: !!placeholderClassName,
            'is-selected': this.isValueSelected()
        })
        const menuClass = classNames({
            [`${baseClassName}__menu`]: true,
            [menuClassName!]: !!menuClassName
        })
        const arrowClass = classNames({
            [`${baseClassName}__arrow`]: true,
            [arrowClassName!]: !!arrowClassName,
            "arrow_open": this.state.isOpen
        })

        const value = (<div className={placeholderClass}>
            {placeHolderValue}
        </div>)
        const menu = this.state.isOpen ? <div className={menuClass} aria-expanded='true'>
            {this.buildMenu()}
        </div> : null

        return (
            <div style={this.props.style} ref={this.dropdownRef} className={dropdownClass}>
                <div className={controlClass} onClick={this.handleMouseClick.bind(this)} onTouchEnd={this.handleMouseClick.bind(this)} aria-haspopup='listbox'>
                    {value}
                    <div className={`${baseClassName}-arrow-wrapper`}>
                        {arrowOpen && arrowClosed
                            ? this.state.isOpen ? arrowOpen : arrowClosed
                            : <span className={arrowClass} />}
                    </div>
                </div>
                {menu}
            </div>
        )
    }
}

Dropdown.defaultProps = { baseClassName: 'rdropdown' }
export default Dropdown