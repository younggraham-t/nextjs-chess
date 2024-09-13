import React, {useContext, useRef, useState} from "react";
import PromotionSelection from "./promotion-selection";

type UseModalShowReturnType = {
    show: boolean;
    setShow: (value: boolean) => void;
    onHide: () => void;
}

const useModalShow = (): UseModalShowReturnType => {
    const [show, setShow] = useState(false);

    const handleOnHide = () => {
        setShow(false);
    };

    return {
        show,
        setShow,
        onHide: handleOnHide,
    }
};

type ModalContextType = {
    showConfirmation: (x: number, y: number) => Promise<number>;
};

type ConfirmationModalContextProviderProps = {
    children: React.ReactNode
}

const ConfirmationModalContext = React.createContext<ModalContextType>({} as ModalContextType);

const ConfirmationModalContextProvider: React.FC<ConfirmationModalContextProviderProps> = (props) => {
    const {setShow, show, onHide} = useModalShow();
    const [content, setContent] = useState<{x: number, y: number} | null>();
    const resolver = useRef<Function>();

    const handleShow = (x: number, y: number): Promise<number> => {
        setContent({
            x,
            y,
        });
        setShow(true);
        return new Promise(function (resolve) {
            resolver.current = resolve;
        });
    };

    const modalContext: ModalContextType = {
        showConfirmation: handleShow
    };

    const handleOk = (value: number) => {
        resolver.current && resolver.current(value);
        onHide();
    };

    const handleCancel = () => {
        resolver.current && resolver.current(0);
        onHide();
    };

    return (
        <ConfirmationModalContext.Provider value={modalContext}>
            {props.children}
            {content && show &&
                        <PromotionSelection handleClick={handleOk} x={content.x} y={content.y}/>
                }
         </ConfirmationModalContext.Provider>
    )
};

const useConfirmationModalContext = (): ModalContextType => useContext(ConfirmationModalContext);

export {
    useModalShow,
    useConfirmationModalContext,
}

export default ConfirmationModalContextProvider;
